/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#fdf4f0',
          100: '#fce8dc',
          200: '#f9cdb8',
          300: '#f5a98a',
          400: '#ef7a53',
          500: '#e8562a',
          600: '#d9401f',
          700: '#b4321b',
          800: '#902a1c',
          900: '#75261b',
          950: '#3f100a',
        },
        dark: {
          900: '#0d0d12',
          800: '#13131a',
          700: '#1a1a24',
          600: '#22222f',
          500: '#2c2c3e',
          400: '#3d3d55',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #e8562a 0%, #d9401f 100%)',
        'gradient-dark':  'linear-gradient(135deg, #1a1a24 0%, #0d0d12 100%)',
      },
      boxShadow: {
        'brand-sm': '0 2px 8px rgba(232, 86, 42, 0.25)',
        'brand-md': '0 4px 20px rgba(232, 86, 42, 0.35)',
        'brand-lg': '0 8px 40px rgba(232, 86, 42, 0.45)',
        'glass':    '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
