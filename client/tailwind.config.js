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
        white: '#1e293b', // Redefine white to be Slate-800 for dark text by default
        'pure-white': '#ffffff', // For elements that must remain white
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
          900: '#f8fafc', // Slate-50 body background
          800: '#ffffff', // Pure white card/input background
          700: '#f1f5f9', // Slate-100 muted nested background
          600: '#e2e8f0', // Slate-200 primary border color
          500: '#cbd5e1', // Slate-300 secondary border/hover color
          400: '#64748b', // Slate-500 muted text
          300: '#334155', // Slate-700 secondary text
          200: '#1e293b', // Slate-800 primary text
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #e8562a 0%, #d9401f 100%)',
        'gradient-dark':  'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      },
      boxShadow: {
        'brand-sm': '0 2px 8px rgba(232, 86, 42, 0.15)',
        'brand-md': '0 4px 20px rgba(232, 86, 42, 0.2)',
        'brand-lg': '0 8px 40px rgba(232, 86, 42, 0.25)',
        'glass':    '0 8px 32px rgba(15, 23, 42, 0.05)',
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
