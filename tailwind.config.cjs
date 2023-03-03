/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        headings: ["Roboto Serif", "serif"],
      },
      colors: {
        background: {
          tan: "#d3d1c4",
        },
      },
    },
  },
  plugins: [],
};

module.exports = config;
