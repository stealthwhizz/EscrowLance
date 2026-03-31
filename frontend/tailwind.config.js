/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#22d3ee", // bright teal-cyan
        accent: "#fb7185", // coral rose
        dark: "#0b1222",
        card: "#0f172a",
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
