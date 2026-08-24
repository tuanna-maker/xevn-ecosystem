/** @type {import('tailwindcss').Config} */
/**
 * XeVN web-portal — Tailwind class SoT for brand colors / radius / shadow.
 * Hex values MUST stay in lockstep with `:root --xevn-*` in `src/index.css`
 * (ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §7.3 · PO-HRM-UI-BRAND-FE-FOUND-01).
 * Prefer `bg-xevn-primary` over hardcoded `#1E40AF`.
 * Focus: `ring-xevn-accent` | `ring-xevn-primary`.
 */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xevn: {
          primary: '#1E40AF',
          primaryPressed: '#1E3A8A',
          accent: '#06B6D4',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
          neutral: '#6B7280',
          background: '#F9FAFB',
          surface: '#FFFFFF',
          text: '#111827',
          textSecondary: '#4B5563',
          textMuted: '#6B7280',
          border: '#E5E7EB',
          brandShell: '#000000',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
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
        sans: ['"Source Sans 3"', 'Source Sans Pro', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'system-ui', 'sans-serif'],
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