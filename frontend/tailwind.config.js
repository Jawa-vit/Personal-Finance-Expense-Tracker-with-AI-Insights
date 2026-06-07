/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#e8f7f0',
          100: '#9FE1CB',
          500: '#1D9E75',
          600: '#0F6E56',
          700: '#085041',
          900: '#04342C',
        },
      },
    },
  },
  plugins: [],
};
