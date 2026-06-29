/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // FolioSpace 6-color palette
        navy: {
          DEFAULT: '#1a1c2e',
          800: '#222440',
          700: '#2a2d4e',
          600: '#34375e',
          500: '#3e4270',
        },
        indigo: {
          DEFAULT: '#5b4eff',
          50: '#f0eeff',
          100: '#dddaff',
          200: '#bfbaff',
          400: '#8b82ff',
          500: '#5b4eff',
          600: '#4535e8',
          700: '#3628c2',
        },
        orange: {
          DEFAULT: '#ff6b35',
          50: '#fff2ec',
          100: '#ffdfd0',
          400: '#ff9066',
          500: '#ff6b35',
          600: '#e8531d',
        },
        mint: {
          DEFAULT: '#00c9a7',
          50: '#e6faf6',
          100: '#ccf5ee',
          400: '#33d4b6',
          500: '#00c9a7',
          600: '#00a88b',
        },
        chalk: {
          DEFAULT: '#f2f0eb',
          50: '#faf9f7',
          100: '#f2f0eb',
          200: '#e8e4db',
        },
        lavender: {
          DEFAULT: '#c4b5fd',
          100: '#ede9fe',
          300: '#c4b5fd',
          500: '#a78bfa',
        },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      fontSize: {
        display: ['48px', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        h1: ['32px', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        h2: ['20px', { lineHeight: '1.25', letterSpacing: '-0.005em' }],
        body: ['13px', { lineHeight: '1.6' }],
        meta: ['12px', { lineHeight: '1.4', letterSpacing: '0.12em' }],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(26, 28, 46, 0.06), 0 4px 16px rgba(26, 28, 46, 0.06)',
        card: '0 2px 8px rgba(26, 28, 46, 0.08), 0 16px 40px rgba(26, 28, 46, 0.06)',
        glow: '0 0 0 3px rgba(91, 78, 255, 0.25)',
        'glow-mint': '0 0 0 3px rgba(0, 201, 167, 0.25)',
      },
      transitionDuration: {
        micro: '150ms',
        ui: '240ms',
        page: '360ms',
      },
      transitionTimingFunction: {
        folio: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      maxWidth: {
        content: '1200px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.97)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(255, 107, 53, 0.4)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 0 6px rgba(255, 107, 53, 0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-up': 'slide-up 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'scale-in': 'scale-in 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'pulse-glow': 'pulse-glow 2s infinite cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
  safelist: [
    { pattern: /^bg-chalk/ },
    { pattern: /^border-chalk/ },
    { pattern: /^text-chalk/ },
    { pattern: /^ring-offset-chalk/ },
    { pattern: /^bg-navy/ },
    { pattern: /^text-navy/ },
    { pattern: /^bg-indigo/ },
    { pattern: /^text-indigo/ },
    { pattern: /^bg-mint/ },
    { pattern: /^bg-orange/ },
    { pattern: /^text-lavender/ },
  ],
};

