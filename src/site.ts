/**
 * Site-wide constants. Everything Ajinkya needs to change post-launch
 * lives here so it is a one-line edit, not a find-and-replace.
 */

export const NAME = "Ajinkya Kale";
export const ROLE = "Lead Product Designer";
export const SITE_TITLE = "Ajinkya Kale — Lead Product Designer";
export const SITE_DESCRIPTION =
  "Product designer for complex, real-world systems. 9 years across fintech, banking, healthcare, SaaS, and ed-tech. Currently leading UX for a large corporate-banking program at Ungrammary.";

export const EMAIL = "ajinkyaranjit@gmail.com";
export const LINKEDIN_URL = "https://linkedin.com/in/ajinkya-kale-88487b82";

/**
 * The resume PDF lives in /public so it ships with the site. To update it,
 * replace public/Ajinkya-Kale-Resume.pdf with the new file — same name — and
 * push. Nothing else needs to change.
 */
export const RESUME_PATH = "/Ajinkya-Kale-Resume.pdf";

export const LOCATION = "Pune, India";

/**
 * Prefixes an internal path with the deployment's base path.
 *
 * Astro rewrites asset URLs for `base` automatically but leaves hand-written
 * hrefs alone, so on a GitHub Pages project URL every link would 404 without
 * this. Works unchanged for a base of "/" (custom domain) and "/repo-name/"
 * (project pages), so nothing needs editing when a domain is pointed at it.
 */
export function url(path = "/"): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return path === "/" ? `${base}/` : `${base}${path}`;
}
