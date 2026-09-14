import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

/**
 * On GitHub Pages these two are supplied by actions/configure-pages in
 * .github/workflows/deploy.yml, so the same config serves a project URL
 * (username.github.io/repo) today and switches itself to a custom domain the
 * day you point one at the repo — no edit needed here.
 *
 * Locally they are unset, so the custom domain below is used. It only drives
 * sitemap.xml, robots.txt and the absolute OG image URL.
 */
const site = process.env.SITE_URL || "https://ark-website-peach.vercel.app";
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  site,
  base,
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
