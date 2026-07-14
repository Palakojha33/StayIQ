/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          darkest: '#070a13',
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          primary: '#6366f1',  // Indigo
          secondary: '#06b6d4', // Cyan
          accent: '#ec4899',    // Pink
          success: '#10b981',   // Emerald
          warning: '#f59e0b',   // Amber
          danger: '#ef4444',    // Red
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(99, 102, 241, 0.4)',
        'glow-secondary': '0 0 15px rgba(6, 118, 212, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
