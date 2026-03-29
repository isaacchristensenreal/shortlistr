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
        // Legacy palette — kept for public pages / existing components
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
        // New premium dark design system
        midnight: {
          DEFAULT: '#0A0A0F',
          50:  '#f5f5ff',
          100: '#1a1a2e',
          200: '#16162a',
          300: '#13131f',
          400: '#0f0f18',
          500: '#0A0A0F',
        },
        surface: {
          DEFAULT: '#13131A',
          50:  '#2a2a3d',
          100: '#222230',
          200: '#1b1b28',
          300: '#17171f',
          400: '#13131A',
          500: '#0f0f14',
        },
        border: {
          dim:  '#1E1E2E',
          glow: '#2d2d4a',
        },
        gold: {
          DEFAULT: '#F5C842',
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#F5C842',
          600: '#d4a017',
          700: '#b8860b',
        },
        neon: {
          DEFAULT: '#00FF88',
          50:  '#f0fff8',
          100: '#ccffe8',
          200: '#99ffd1',
          300: '#55ffb0',
          400: '#00FF88',
          500: '#00d970',
          600: '#00b35e',
        },
        crimson: {
          DEFAULT: '#FF4444',
          50:  '#fff5f5',
          100: '#ffe0e0',
          200: '#ffbbbb',
          300: '#ff8888',
          400: '#FF4444',
          500: '#e63333',
          600: '#cc2222',
        },
        amber: {
          DEFAULT: '#F59E0B',
          400: '#fbbf24',
          500: '#F59E0B',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gold-shimmer': 'linear-gradient(135deg, #F5C842 0%, #fde68a 50%, #F5C842 100%)',
        'neon-shimmer': 'linear-gradient(135deg, #00FF88 0%, #55ffb0 50%, #00FF88 100%)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      boxShadow: {
        'gold':  '0 0 20px rgba(245,200,66,0.25), 0 0 40px rgba(245,200,66,0.1)',
        'neon':  '0 0 20px rgba(0,255,136,0.25), 0 0 40px rgba(0,255,136,0.1)',
        'glow':  '0 0 24px rgba(59,130,246,0.3)',
        'card':  '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0'  },
        },
        ringFill: {
          'from': { strokeDashoffset: '283' },
        },
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(12px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          'from': { opacity: '0', transform: 'translateY(-8px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        toastIn: {
          'from': { opacity: '0', transform: 'translateX(100%)' },
          'to':   { opacity: '1', transform: 'translateX(0)' },
        },
        toastOut: {
          'from': { opacity: '1', transform: 'translateX(0)' },
          'to':   { opacity: '0', transform: 'translateX(100%)' },
        },
        goldPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245,200,66,0)' },
          '50%':       { boxShadow: '0 0 0 6px rgba(245,200,66,0.15)' },
        },
        scoreCount: {
          'from': { opacity: '0', transform: 'scale(0.7)' },
          'to':   { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer:     'shimmer 2s linear infinite',
        ringFill:    'ringFill 1.4s cubic-bezier(0.22,1,0.36,1) both',
        fadeUp:      'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both',
        slideDown:   'slideDown 0.3s cubic-bezier(0.22,1,0.36,1) both',
        toastIn:     'toastIn 0.35s cubic-bezier(0.22,1,0.36,1) both',
        toastOut:    'toastOut 0.25s ease-in both',
        goldPulse:   'goldPulse 2.5s ease-in-out infinite',
        scoreCount:  'scoreCount 0.6s cubic-bezier(0.22,1,0.36,1) 1s both',
      },
    },
  },
  plugins: [],
}
