/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bitcraft: {
          primary: '#ffe08a',
          'primary-hover': '#c9b36a',
          secondary: '#4A90E2',
          bg: '#232825',
          'bg-container': '#2e332f',
          'bg-card': '#404640',
          'bg-input': '#353a36',
          'bg-tabs': '#353a36',
          'bg-collapsible': '#353a36',
          border: '#c9a86a',
          text: '#f9fafb',
          'text-muted': '#d1d5db',
          'text-dark': '#232323',
        }
      },
      fontFamily: {
        'system': ['system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'bitcraft': '18px',
        'card': '14px',
      },
      boxShadow: {
        'bitcraft': '0 4px 32px 0 rgba(0, 0, 0, 0.4)',
        'card': '0 1px 8px 0 rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}