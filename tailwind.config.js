/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        linen: "#F8F1E8",
        cream: "#FFF9F0",
        oat: "#E7D6C0",
        clay: "#B86F4D",
        umber: "#6F4E37",
        cocoa: "#3E2C23",
        moss: "#7A8060",
        stone: "#827D75",
      },
      boxShadow: {
        soft: "0 24px 70px rgba(62, 44, 35, 0.12)",
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
