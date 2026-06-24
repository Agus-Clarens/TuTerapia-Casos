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
        'verde-oscuro': '#264534',
        'verde-medio': '#75B781',
        'teal': '#007271',
        'crema': '#FEFAF5',
      },
    },
  },
  plugins: [],
}
export default config
