/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'orelega': ['Orelega One', 'serif'],
        'orienta': ['Orienta', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
