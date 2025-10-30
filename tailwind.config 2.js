/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'ash': {
          dark: '#121212',
          medium: '#1E1E1E',
          light: '#2A2A2D',
          lighter: '#424245',
        },
        'brand-red': '#CF0E0F',
        'brand-red-dark': '#B50D0E',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}