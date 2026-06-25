import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'verde-oscuro': '#264534',
        'verde-medio': '#75B781',
        'teal': '#007271',
        'crema': '#FEFAF5',
        'coral': '#F29683',
        'amarillo': '#FCD07F',
        'azul-nuevo': '#213E6E',
        'sidebar-hover': '#5A7968',
        'gris-cerrado': '#938f80',
      },
    },
  },
  plugins: [],
}
export default config
