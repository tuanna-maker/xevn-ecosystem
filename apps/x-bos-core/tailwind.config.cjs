/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        xevn: {
          primary: '#1E40AF',
          accent: '#06B6D4',
          surface: '#FFFFFF',
          background: '#F5F5F7',
          text: '#1D1D1F',
          muted: '#6E6E73',
          border: 'rgba(0,0,0,0.06)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)',
        soft: '0 12px 40px -12px rgba(0, 0, 0, 0.12), 0 4px 16px -4px rgba(0, 0, 0, 0.06)',
      },
      backdropBlur: {
        nav: '20px',
      },
    },
  },
  plugins: [],
};
