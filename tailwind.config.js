/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a0f1e',
          800: '#0d1426',
          700: '#111b33',
          600: '#162040',
        },
        electric: {
          500: '#3b82f6',
          400: '#60a5fa',
          300: '#93c5fd',
        },
      },
    },
  },
  plugins: [],
}

