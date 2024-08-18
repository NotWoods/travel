import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://travel.tigerxdaphne.com",
  integrations: [mdx(), tailwind({ applyBaseStyles: false })],
  image: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },
  experimental: {
    contentLayer: true,
  },
});
