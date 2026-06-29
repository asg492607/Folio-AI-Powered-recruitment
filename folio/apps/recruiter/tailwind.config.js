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
          bg: '#F2EFEA',
          navy: '#151633',
          purple: '#5B4FE9',
          lavender: '#A89FD6',
          mint: '#00C9A7',
          orange: '#FF6B35',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },

      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
        mono: ['"Space Mono"', 'monospace'],
      },

      // 👇 ADD THIS HERE
      keyframes: {
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(40px) scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
      },

      animation: {
        'slide-up': 'slideUp 0.35s ease-out',
      },
    },
  },
  plugins: [],
}

