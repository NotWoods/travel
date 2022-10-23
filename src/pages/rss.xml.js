import rss from "@astrojs/rss";

export const get = () =>
  rss({
    title: "My personal website.",
    description: "Welcome to my website!",
    site: import.meta.env.SITE,
    items: import.meta.glob("./blog/**/*.{md,mdx}"),
  });
