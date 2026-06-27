import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a08",
        surface: "#111110",
        border: "#2a2a26",
        primary: "#e8e4d8",
        secondary: "#7a7568",
        accent: "#b8860b",
        danger: "#8b2020",
        success: "#2a4a2a",
      },
      fontFamily: {
        sans: ['var(--font-jetbrains-mono)'],
        display: ['var(--font-im-fell-english)'],
        typewriter: ['var(--font-im-fell-english)'],
      },
    },
  },
  plugins: [],
};
export default config;
