/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Sora', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink:    { DEFAULT: '#0D0D0D', 50: '#F5F5F5', 100: '#E8E8E8', 200: '#C8C8C8', 300: '#A0A0A0', 400: '#707070', 500: '#404040', 600: '#2A2A2A', 700: '#1A1A1A', 800: '#111111', 900: '#0D0D0D' },
        amber:  { DEFAULT: '#D97706', light: '#FDE68A', dark: '#92400E' },
        rose:   { DEFAULT: '#E11D48', light: '#FFE4E6', dark: '#9F1239' },
        sage:   { DEFAULT: '#16A34A', light: '#DCFCE7', dark: '#14532D' },
      },
      animation: {
        'fade-in':    'fadeIn .3s ease-out',
        'slide-up':   'slideUp .35s ease-out',
        'slide-right':'slideRight .3s ease-out',
        'scale-in':   'scaleIn .2s ease-out',
        'spin-slow':  'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn:     { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:    { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideRight: { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        scaleIn:    { from: { opacity: 0, transform: 'scale(.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
