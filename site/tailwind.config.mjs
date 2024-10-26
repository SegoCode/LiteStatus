/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        accent: 'rgb(0, 82, 204)',
        'accent-light': 'rgb(76, 154, 255)',
        'accent-dark': 'rgb(7, 71, 166)',
      },
    },
  },
  plugins: [],
}