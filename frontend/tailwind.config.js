import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff3fc',
          100: '#d8e8f7',
          500: '#134da5',
          600: '#0f2185',
          700: '#1e0d69',
        },
      },
    },
  },
  plugins: [typography],
}

