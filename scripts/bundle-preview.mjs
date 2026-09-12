/**
 * Bundles the built multi-page site into ONE self-contained HTML file for
 * sharing as a hosted preview. Not a deployment target — the real site is the
 * Astro build in dist/. This exists so the work can be reviewed from a phone
 * or sent to someone without running a dev server.
 *
 *   npm run build && npm run preview:bundle
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

const ROUTES = [
  { route: "/", file: "index.html", key: "home" },
  { route: "/work/cloud-branch", file: "work/cloud-branch/index.html", key: "cb" },
  { route: "/work/truemeds", file: "work/truemeds/index.html", key: "tm" },
  { route: "/work/fyn", file: "work/fyn/index.html", key: "fyn" },
  { route: "/about", file: "about/index.html", key: "about" },
  { route: "/contact", file: "contact/index.html", key: "contact" },
];

// ── collect the built stylesheet ────────────────────────────────────────
const assetDir = resolve(dist, "_astro");
const cssFiles = (await readdir(assetDir)).filter((f) => f.endsWith(".css"));
let css = "";
for (const f of cssFiles) css += await readFile(resolve(assetDir, f), "utf8");

// Astro also inlines each page's scoped component styles as <style> blocks in
// that page's <head>. Those are NOT in _astro/*.css — miss them and every
// component loses its layout. Scoped selectors carry a per-component hash, so
// concatenating across pages is safe as long as duplicates are dropped.
const seenStyles = new Set();

// Astro emits images as separate files in dist/_astro. A one-file preview has
// to carry them inline or every <img> 404s, so each one becomes a data URI.
// The srcset is dropped: one file, one resolution.
const MIME = {
  webp: "image/webp",
  avif: "image/avif",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
};
const dataUris = new Map();
async function inlineImages(html) {
  let out = html.replace(/\s(?:srcset|sizes)="[^"]*"/g, "");
  const refs = [...out.matchAll(/src="(\/_astro\/[^"]+)"/g)].map((m) => m[1]);
  for (const ref of new Set(refs)) {
    if (!dataUris.has(ref)) {
      const ext = ref.split(".").pop().toLowerCase();
      const bytes = await readFile(resolve(dist, ref.replace(/^\//, "")));
      dataUris.set(ref, `data:${MIME[ext] ?? "application/octet-stream"};base64,${bytes.toString("base64")}`);
    }
    out = out.split(`src="${ref}"`).join(`src="${dataUris.get(ref)}"`);
  }
  return out;
}

// ── extract each page's body and namespace its ids ──────────────────────
const pages = [];
for (const { route, file, key } of ROUTES) {
  const html = await readFile(resolve(dist, file), "utf8");

  const head = html.slice(0, html.indexOf("</head>"));
  for (const m of head.matchAll(/<style>([\s\S]*?)<\/style>/g)) {
    if (!seenStyles.has(m[1])) {
      seenStyles.add(m[1]);
      css += "\n" + m[1];
    }
  }

  let body = html.slice(html.indexOf("<body>") + 6, html.lastIndexOf("</body>"));

  body = await inlineImages(body);

  // Every page carries a #main skip target and case studies share heading
  // slugs like "the-problem", so ids must be namespaced or anchors collide.
  body = body
    .replace(/\bid="([^"]+)"/g, (_m, id) => `id="${key}--${id}"`)
    .replace(/\bhref="#([^"/][^"]*)"/g, (_m, id) => `href="#${key}--${id}"`);

  // Internal links become hash routes. /#work is a route plus a scroll target.
  body = body
    .replace(/\bhref="\/#work"/g, `href="#/" data-scroll="home--work"`)
    .replace(/\bhref="(\/[^"#]*)"/g, (_m, href) => `href="#${href}"`);

  pages.push({ route, key, body });
}

const shell = `<title>Ajinkya Kale Portfolio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif:ital@0;1&display=swap">
<style>
${css}
/* Preview shell only — not part of the site's own stylesheet. */
html, body { background: #FAFAF7; }
.pg[hidden] { display: none !important; }
</style>

${pages
  .map(
    (p) =>
      `<div class="pg" data-route="${p.route}"${p.route === "/" ? "" : " hidden"}>${p.body}</div>`,
  )
  .join("\n")}

<script>
(function () {
  var pages = Array.prototype.slice.call(document.querySelectorAll('.pg'));

  function show(route, scrollTo) {
    var found = false;
    pages.forEach(function (p) {
      var match = p.dataset.route === route;
      p.hidden = !match;
      if (match) found = true;
    });
    if (!found) { pages[0].hidden = false; }
    if (scrollTo) {
      var t = document.getElementById(scrollTo);
      if (t) { t.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
  }

  function fromHash() {
    var h = decodeURIComponent(location.hash || '');
    if (h.indexOf('#/') === 0) {
      show(h.slice(1) || '/');
    } else if (h.length > 1) {
      // In-page anchor: the target lives on the page already showing.
      var t = document.getElementById(h.slice(1));
      if (t) t.scrollIntoView();
    } else {
      show('/');
    }
  }

  // Links carrying an explicit scroll target need handling before hashchange.
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[data-scroll]') : null;
    if (!a) return;
    e.preventDefault();
    if (location.hash !== '#/') { history.replaceState(null, '', '#/'); }
    show('/', a.dataset.scroll);
  });

  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
</script>`;

const out = resolve(root, "preview.html");
await writeFile(out, shell);
console.log(
  "Wrote preview.html — " +
    pages.length +
    " pages, " +
    Math.round(shell.length / 1024) +
    "KB",
);
