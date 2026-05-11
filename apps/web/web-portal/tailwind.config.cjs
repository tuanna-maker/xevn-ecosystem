/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xevn: {
          primary: '#1E40AF',
          accent: '#06B6D4',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
          neutral: '#6B7280',
          background: '#F9FAFB',
          surface: '#FFFFFF',
          text: '#1F2937',
          textSecondary: '#6B7280',
          border: '#E5E7EB',
        },
      },
      borderColor: {
        DEFAULT: '#E5E7EB',
      },
      backgroundColor: {
        surface: '#FFFFFF',
        background: '#F9FAFB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        none: '1',
        tight: '1.2',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      spacing: {
        xs: '0.25rem', // 4px
        sm: '0.5rem',  // 8px
        md: '1rem',    // 16px
        lg: '1.5rem',  // 24px
        xl: '2rem',    // 32px
        '2xl': '3rem', // 48px
        '3xl': '4rem', // 64px
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
        /** XeVN Symmetrical Grid Law — form controls */
        input: '8px',
        /** XeVN Symmetrical Grid Law — cards & panels */
        card: '12px',
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(15, 23, 42, 0.08)',
        overlay: '0 25px 50px -12px rgba(15, 23, 42, 0.18)',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        outline: '2px solid rgba(6, 182, 212, 0.5)',
      },
    },
  },
  plugins: [],
};