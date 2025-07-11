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
        background: '#ffffff',
        'primary-light': '#D18C5F',
        'primary-dark': '#B56C3D',
        'secondary-light': '#1E5BB8',
        'secondary-dark': '#094396',
      },
    },
  },
  plugins: [],
}

