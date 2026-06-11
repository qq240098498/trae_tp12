/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#FFF7F0",
          100: "#FFE8D6",
          200: "#FFD0A8",
          300: "#FFB37A",
          400: "#FF9F5A",
          500: "#FF8C42",
          600: "#E67635",
          700: "#CC6128",
          800: "#B34D1C",
          900: "#993A11",
        },
        secondary: {
          50: "#F0F7F4",
          100: "#D8EDE6",
          200: "#B0DBCB",
          300: "#85C5AE",
          400: "#57B091",
          500: "#2D6A4F",
          600: "#245942",
          700: "#1B4533",
          800: "#133225",
          900: "#0B1F17",
        },
        warm: {
          50: "#FFFDFB",
          100: "#FFE8D6",
          200: "#FFD4B3",
          300: "#FFBF8F",
        },
        success: {
          100: "#D8F3DC",
          500: "#40916C",
          600: "#2D6A4F",
        },
        warning: {
          100: "#FFE8D6",
          500: "#FF8C42",
        },
        danger: {
          100: "#FFE5E5",
          500: "#E63946",
        },
      },
      fontFamily: {
        sans: [
          "Noto Sans SC",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 4px 20px rgba(255, 140, 66, 0.08)",
        card: "0 8px 30px rgba(45, 106, 79, 0.08)",
        hover: "0 12px 40px rgba(255, 140, 66, 0.15)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
