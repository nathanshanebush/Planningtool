/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Rubik', 'sans-serif'] },
      colors: {
        coal: '#1e1a27',
        jet: '#3b334d',
        orange: '#ff604b',
        platinum: '#ebf0f4',
      },
    },
  },
  plugins: [],
}
