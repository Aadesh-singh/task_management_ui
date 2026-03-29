/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',    /* slate-900 */
        surface: '#1e293b',       /* slate-800 */
        surfaceHover: '#334155',  /* slate-700 */
        primary: '#6366f1',       /* indigo-500 */
        primaryHover: '#4f46e5',  /* indigo-600 */
        secondary: '#10b981',     /* emerald-500 */
        danger: '#ef4444',        /* red-500 */
        textMain: '#f8fafc',      /* slate-50 */
        textMuted: '#94a3b8',     /* slate-400 */
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
