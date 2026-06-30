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
        // Legacy palette — kept for compatibility
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
        // Backgrounds — pure white + off-white alternation
        midnight: {
          DEFAULT: '#ffffff',
          50:  '#fafbfc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
        },
        // Surface: card / panel backgrounds
        surface: {
          DEFAULT: '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
        },
        // Borders: light gray + blue glow
        border: {
          dim:  '#e5e7eb',
          glow: '#bfdbfe',
        },
        // Primary accent: blue (#3b82f6 — WCAG AA on white ✓)
        gold: {
          DEFAULT: '#3b82f6',
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Success: emerald
        neon: {
          DEFAULT: '#059669',
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#059669',
          500: '#047857',
          600: '#065f46',
        },
        // Error: red
        crimson: {
          DEFAULT: '#dc2626',
          50:  '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#dc2626',
          500: '#b91c1c',
          600: '#991b1b',
        },
        // Warning: amber
        amber: {
          DEFAULT: '#d97706',
          400: '#f59e0b',
          500: '#d97706',
        },
      },
      // Remap text-white → near-black for light backgrounds.
      // Components using text-white get dark text; buttons that need
      // white text on a colored bg use text-midnight (= #ffffff after remap).
      textColor: {
        white: '#0a0b0d',
      },
      // Remap placeholder-white → near-black so placeholder text is visible
      placeholderColor: {
        white: '#0a0b0d',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gold-shimmer': 'linear-gradient(135deg, #3b82f6 0%, #93c5fd 50%, #3b82f6 100%)',
        'neon-shimmer': 'linear-gradient(135deg, #059669 0%, #6ee7b7 50%, #059669 100%)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      boxShadow: {
        'gold':       '0 1px 3px rgba(59,130,246,0.12), 0 4px 12px rgba(59,130,246,0.08)',
        'neon':       '0 1px 3px rgba(5,150,105,0.12), 0 4px 12px rgba(5,150,105,0.08)',
        'glow':       '0 0 0 3px rgba(59,130,246,0.15)',
        'card':       '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.08), 0 1px 6px rgba(0,0,0,0.04)',
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
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(59,130,246,0)' },
          '50%':       { boxShadow: '0 0 0 6px rgba(59,130,246,0.12)' },
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
