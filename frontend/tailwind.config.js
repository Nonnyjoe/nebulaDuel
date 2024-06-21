import tailwindClipPath from "tailwind-clip-path";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bodyBg: "#101018",
        navBg: "#0f161b",
        myBlack: "#201f2a",
        myGreen: "#45f882",
        myYellow: "#ffbe18",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        barlow: ["Barlow", "sans-serif"],
        belanosima: ["Belanosima", "sans-serif"],
      },
      screens: {
        "2xl": {
          min: "1500px",
          max: "1800px",
        },
        xxl: {
          min: "1400px",
          max: "1500px",
        },
      },
    },
  },
  plugins: [tailwindClipPath],
};
