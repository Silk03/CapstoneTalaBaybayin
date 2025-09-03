/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#C67C4E',
        secondary: '#0B4CA7',
        loading: '#F6A06A',
        background: '#ffffff',
        'primary-light': '#D18C5F',
        'primary-dark': '#B56C3D',
        'secondary-light': '#1E5BB8',
        'secondary-dark': '#094396',
        'secondary-50': '#EBF3FE',
        'secondary-100': '#D6E7FD',
        'secondary-200': '#B3D1FB',
        'secondary-300': '#85B4F8',
        'secondary-400': '#4C8BF3',
        'secondary-500': '#0B4CA7',
        'secondary-600': '#0A4396',
        'secondary-700': '#083A85',
        'secondary-800': '#073174',
        'secondary-900': '#052863',
      },
    },
  },
  plugins: [],
}

