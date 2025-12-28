/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdfb",
          100: "#d2fbf6",
          200: "#a6f7ee",
          300: "#6cefe2",
          400: "#31dccd",
          500: "#10bdae",
          600: "#0b9c92",
          700: "#0a7e78",
          800: "#0b6460",
          900: "#0a5451"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)",
      }
    },
  },
  plugins: [],
};
