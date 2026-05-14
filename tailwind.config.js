/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'snap-dark': '#1A1A2E',
        'snap-orange': '#FF604B',
        'snap-bg': '#F4F5F7',
        'snap-card': '#FFFFFF',
        'snap-primary': '#172B4D',
        'snap-muted': '#5E6C84',
        'snap-border': '#DFE1E6',
        'snap-success': '#36B37E',
        'snap-warning': '#FF991F',
        'snap-danger': '#FF5630',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
