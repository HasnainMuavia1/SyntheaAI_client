import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"], // THIS IS CRITICAL for next-themes
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}", // Ensure features is included
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
        mono: ["var(--font-mono)"], // JetBrains Mono for code
      },
      colors: {
        vscode: {
          bg: "#1e1e1e",
          sidebar: "#252526",
          activity: "#333333",
          blue: "#007acc",
        }
      }
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
export default config;