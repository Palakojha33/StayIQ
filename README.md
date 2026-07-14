# StayIQ — AI-Powered Hospitality Intelligence Platform

StayIQ is a unified intelligence dashboard for hotel managers, integrating five key machine learning (ML) models to optimize cancellations mitigation, review sentiment and aspects extraction, customer recommendations matching, dynamic price configurations, and real-time guest complaint recovery.

---

## Architecture Overview

```
                      +-----------------------------------+
                      |         React Frontend            |
                      |   (Vite + Tailwind, on Vercel)    |
                      +-----------------+-----------------+
                                        |
                   Sends API Requests   |  Uses VITE_API_BASE_URL
                                        v
       +--------------------------------+--------------------------------+
       |                                                                 |
       v (Lightweight Endpoints)                                         v (Heavy NLP Inference)
+------------------------------------+                            +------------------------------------+
|          Vercel Serverless         |                            |      Standalone Web Service        |
|  (api/index.py wrapped by Mangum)  |                            |   (Uvicorn app.main on Render)     |
+-----------------+------------------+                            +-----------------+------------------+
                  |                                                                 |
                  |-- POST /predict/cancellation                                    |-- POST /analyze/review
                  |-- POST /predict/price                                           |   (Uses loaded DistilBERT weights)
                  |-- POST /recommend                                               |
                  |-- POST /recovery/score | GET /queue                             |
                  |-- POST /recovery/draft | POST /outcome                          |
                  +--------------------------------+--------------------------------+
                                                   |
                                                   v
                                      Shared FastAPI Core Logic
                                    (/backend/app/services & routers)
```

### Folder Structure
- **`/frontend`**: React with Vite and Tailwind CSS. Connects to backend using `import.meta.env.VITE_API_BASE_URL` with automatic local fallback simulation if the server is offline.
- **`/backend`**: FastAPI application. Can be run as serverless endpoints (`/api` via Mangum) or standalone web server (`app/main_server.py`).
- **`/notebooks`**: Jupyter Notebooks for training models.
- **`/data`**: Readme documenting dataset structures. Actual training CSVs are excluded from Git.

---

## Local Development Setup

### 1. Backend Server Setup
From the repository root:
```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install required dependencies
pip install -r requirements.txt

# Create environment configuration file from template
cp .env.example .env
```

To run the full API locally including the sentiment model:
1. Ensure the heavy libraries are installed in your virtual environment:
   ```bash
   pip install torch transformers
   ```
2. In `.env`, activate standalone mode:
   ```env
   STANDALONE_MODE=1
   ```
3. Run the uvicorn entrypoint:
   ```bash
   python app/main_server.py
   ```
The Swagger documentation will be available at `http://localhost:8000/docs`.

### 2. Frontend Dashboard Setup
From the repository root:
```bash
# Navigate to frontend directory
cd frontend

# Install Node modules
npm install

# Create environment configuration file
cp .env.example .env
```
Run the local Vite development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Deployment Guide

### Deploying Frontend to Vercel
1. Sign in to your Vercel Dashboard and click **Add New Project**.
2. Select your GitHub repository.
3. In the project config, set **Root Directory** to `frontend`.
4. Leave **Build Command** (`npm run build`) and **Output Directory** (`dist`) to their defaults.
5. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: Set this to your production backend URL (e.g., your Render web service URL).
6. Click **Deploy**.

### Deploying Backend to Vercel (Lightweight endpoints only)
You can deploy the cancellation, pricing, and recommendations API to Vercel Serverless.
1. Create a new project on Vercel.
2. Select the repository and set the **Root Directory** to `backend`.
3. Vercel will auto-detect the configuration using the `vercel.json` rewrite file to execute `api/index.py` with `@vercel/python`.
4. Click **Deploy**.

### Deploying Sentiment Backend to Render or Railway
To run the DistilBERT-based aspect analysis endpoint (since transformer weights exceed Vercel's size limits):
1. Create a new Web Service on **Render** (or Railway).
2. Set the **Build Command** to:
   ```bash
   pip install -r backend/requirements.txt torch transformers
   ```
3. Set the **Start Command** to:
   ```bash
   python backend/app/main_server.py
   ```
4. Define the following **Environment Variables** in Render's settings:
   - `STANDALONE_MODE`: `1`
   - `PORT`: `10000` (Render will override this, but standard is `10000`)
   - `CORS_ORIGINS`: Set to your frontend Vercel domain to allow cross-origin requests.

---

## Guest Recovery Copilot — Key Differentiator

The **Guest Recovery Copilot** is a real-time operational decision support module that sets StayIQ apart from passive classification dashboards:
1. **Dynamic Risk Attribution**: Rather than just scoring sentiment, it computes a 0-100 escalation risk index blending guest complaints frequency, loyalty standing, sentiment scores, and rating-text mismatches.
2. **Priority Resolution Queue**: Automatically bubbles high-risk guest issues to the top of the queue so staff can triage cases immediately.
3. **AI-Drafted Response & Compensations**: Recommends optimized compensation packages (dining credits, room upgrades, or free stays) based on loyalty level and assigns the ticket to the responsible department (Housekeeping, F&B, Front Desk, etc.) depending on the extracted complaint aspect.
4. **Outcome Closed-Loop Tracking**: Guests' follow-up ratings are logged back into the system to calculate the hotel's recovery effectiveness.

---

## Model Training & Inference integration

To train the models and replace the default mocks with real ML estimators:
1. Open the respective notebooks in the `/notebooks` folder (e.g., `1_cancellation_prediction.ipynb`, `05_recovery_risk_model.ipynb`).
2. Download the datasets as described in [data/README.md](file:///Users/air/.gemini/antigravity/scratch/stayiq/data/README.md) and place them in the `/data` folder.
3. Run the notebook cells. The final cell will train the classifier/regressor and export a serialized file (e.g., `cancellation_model.joblib`, `recovery_risk_model.joblib`) directly into `backend/app/models/`.
4. When the backend service loads, it will detect the presence of the joblib file and automatically load it for real predictions instead of executing the fallback mock rules.
