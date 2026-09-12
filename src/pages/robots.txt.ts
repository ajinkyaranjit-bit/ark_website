import type { APIRoute } from "astro";

/**
 * Generated rather than static so the sitemap URL follows whatever the site
 * is actually deployed at — a Pages project URL today, a custom domain later.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(
    `${import.meta.env.BASE_URL.replace(/\/$/, "")}/sitemap-index.xml`,
    site,
  );
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
