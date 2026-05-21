/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#012163',
          dark: '#011040',
          light: '#0D60FF',
        },
        teal: {
          DEFAULT: '#04EDB5',
          dark: '#00C99A',
        },
        brand: {
          blue: '#0D60FF',
          lightbg: '#F2F4FF',
          lavender: '#E8EBFF',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      aspectRatio: {
        'slide': '16 / 9',
      },
    },
  },
  plugins: [],
};
