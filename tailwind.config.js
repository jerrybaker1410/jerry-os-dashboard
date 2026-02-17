/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#1a1a1a',
        elevated: '#242424',
        'border-default': '#2a2a2a',
        'border-hover': '#3a3a3a',
        'text-primary': '#f5f5f5',
        'text-secondary': '#a3a3a3',
        'text-muted': '#8a8a8a', // boosted from #6b6b6b for WCAG AA
        'accent-green': '#22c55e',
        'accent-yellow': '#eab308',
        'accent-red': '#ef4444',
        'accent-blue': '#3b82f6',
        'accent-purple': '#8b5cf6',
        'accent-orange': '#f97316',
      },
      fontFamily: {
        data: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
        'toast-in': 'toast-in 0.2s ease-out',
        'palette-in': 'palette-in 0.15s ease-out',
        'slide-in-right': 'slide-in-right 0.2s ease-out',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'skeleton-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.15' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateX(1rem)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'palette-in': {
          from: { opacity: '0', transform: 'translate(-50%, -0.5rem) scale(0.98)' },
          to: { opacity: '1', transform: 'translate(-50%, 0) scale(1)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
