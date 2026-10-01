export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        sorrel: {
          light: '#f5f5f0',
          dark: '#1e241f',
          green: '#b5e853',
          greenHover: '#9ccb45'
        }
      }
    },
  },
  plugins: [],
}
