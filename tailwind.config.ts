import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f8f5",
          100: "#ddefe7",
          600: "#2e7d5a",
          700: "#246447",
          900: "#15382a"
        }
      }
    }
  },
  plugins: []
};

export default config;

