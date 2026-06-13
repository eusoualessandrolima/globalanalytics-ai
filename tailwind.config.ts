import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#020817',
        surface: 'rgba(15,23,42,0.75)',
        border: 'rgba(255,255,255,0.08)',
        accent: '#3B82F6',
        'accent-light': '#60A5FA',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        muted: 'rgba(148,163,184,0.6)',
      },
      backdropBlur: { xs: '2px' },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s ease-out',
        'count-up': 'count-up 1s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%,100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
