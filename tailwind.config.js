/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amf1: {
          bg: "#070D0C",
          surface: "#0F1A18",
          card: "#142421",
          border: "#1E3632",
          hover: "#1A302C",
          green: {
            deep: "#00352F",
            DEFAULT: "#00594F",
            light: "#007A6D",
          },
          lime: {
            DEFAULT: "#00FF87",
            glow: "#55FFAC",
            dim: "#00C969",
            acid: "#CEDC00",
          },
          cyan: "#00E5FF",
          silver: "#CAD5D2",
          muted: "#768B87",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.03)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
        scanline: "scanline 8s linear infinite",
      },
    },
  },
  plugins: [],
};
