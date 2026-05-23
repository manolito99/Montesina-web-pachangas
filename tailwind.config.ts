import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        paper: { DEFAULT: "#f5f2ea", alt: "#ece8dc" },
        fill: { DEFAULT: "#ffffff", alt: "#e9e5d8" },
        ink: { DEFAULT: "#1a1a1a", 2: "#3a3a3a" },
        muted: "#7a7670",
        lime: {
          DEFAULT: "#c8e84a",
          deep: "#9fc93c",
          soft: "#fafce0",
        },
        navy: { DEFAULT: "#0F1A2E", deep: "#0B1220" },
        cat: {
          masc: "#5b8aef",
          fem: "#e57db5",
          mix: "#9fc93c",
        },
        foam: { DEFAULT: "#E8ECF2", muted: "#a5b0c3" },
        rose: "#e58a7b",
      },
      fontFamily: {
        sans: ["var(--font-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
        hand: ["var(--font-kalam)", "ui-cursive", "cursive"],
      },
      boxShadow: {
        neo: "2px 2px 0 0 #1a1a1a",
        "neo-sm": "1px 1px 0 0 #1a1a1a",
        "neo-lg": "3px 3px 0 0 #1a1a1a",
        "neo-lime": "2px 2px 0 0 #9fc93c",
        "neo-lime-lg": "3px 3px 0 0 #9fc93c",
        glow: "0 0 36px rgba(212, 242, 92, 0.45), 0 0 80px rgba(159, 201, 60, 0.25)",
      },
      backgroundImage: {
        "radial-navy":
          "radial-gradient(ellipse at center, #1a2a47 0%, #0B1220 70%)",
        "radial-lime":
          "radial-gradient(40% 40% at 50% 45%, rgba(212,242,92,0.18) 0%, rgba(15,26,46,0) 70%)",
      },
      letterSpacing: {
        widest2: "0.22em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 600ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
