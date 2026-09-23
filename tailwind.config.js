/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        karsa: {
          bg: "#0B132B",
          slate: "#1C2541",
          gold: "#F4D06F",
          cyan: "#48CAE4",
          navy: "#0A1128",
          card: "#161F38",
          // Agent accent colors
          karsa: "#F4D06F", // Celestial Gold
          ara: "#FF9F1C",   // Warm Amber / Sunset
          radit: "#2EC4B6", // Mint Emerald / Money
          sekar: "#48CAE4", // Astral Cyan
          arka: "#A594F9",  // Violet Academic
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "Inter", "sans-serif"],
        logo: ["'Redaction 35'", "serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(72, 202, 228, 0.25)",
        "gold-glow": "0 0 25px rgba(244, 208, 111, 0.35)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      backgroundImage: {
        "cosmic-radial": "radial-gradient(circle at 50% 30%, #1C2541 0%, #0B132B 70%)",
        "batik-glow": "radial-gradient(circle at 50% 50%, rgba(72, 202, 228, 0.15) 0%, transparent 60%)",
        "gold-gradient": "linear-gradient(135deg, #F4D06F 0%, #E09F3E 100%)",
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "door-open": "doorOpen 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.03)" },
        },
        doorOpen: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
