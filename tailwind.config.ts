import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0D1B2A',
        secondary: '#111F30',
        accent: '#2D6AE0',
        success: '#1D9E75',
        warning: '#EF9F27',
        danger: '#E24B4A',
      },
    },
  },
  plugins: [],
}
export default config
