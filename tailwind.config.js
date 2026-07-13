/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E40AF',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A5F',
          950: '#172554',
        },
        accent: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
        },
        navy: {
          DEFAULT: '#1E3A5F',
          900: '#1E3A5F',
          950: '#15293F',
        },
        success: { DEFAULT: '#16A34A', light: '#DCFCE7' },
        warning: { DEFAULT: '#D97706', light: '#FEF3C7' },
        error: { DEFAULT: '#DC2626', light: '#FEE2E2' },
        ink: {
          DEFAULT: '#0F172A',
          muted: '#475569',
          subtle: '#64748B',
        },
        line: '#E2E8F0',
        canvas: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.05)',
        soft: '0 4px 20px -2px rgb(30 64 175 / 0.08)',
        glow: '0 10px 40px -10px rgb(30 64 175 / 0.25)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out',
      },
    },
  },
  plugins: [],
};
