# Ajinkya Kale — Portfolio

Astro 5 + Tailwind 4 + MDX. Ships zero JavaScript.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # regenerates public/og.png, then builds to dist/
npm run preview  # serve dist/ locally
npm run og       # regenerate the OG image only
```

## Structure

```
src/
├── site.ts                  # email, LinkedIn, Read.cv, site title/description
├── styles/global.css        # design tokens + type scale + prose styles
├── layouts/BaseLayout.astro # meta, OG tags, fonts, Person JSON-LD
├── components/
│   ├── Header · Footer
│   ├── Placeholder          # real image when given `src`, else a labelled stub
│   ├── PlaceholderGrid      # 2×2 arrangement of the above
│   ├── Breakout             # lets imagery step from 680px out to 900px
│   ├── Tag · WorkCard · CaseStudyHero
├── content/
│   ├── config.ts            # Zod schema for the work collection
│   └── work/*.mdx           # one file per case study
└── pages/
    ├── index.astro · about.astro · contact.astro
    └── work/[slug].astro    # renders every entry in the work collection
```

## The case study framework

Every case study runs the same spine, because that is what a senior reviewer
scans for:

```
Problem → Constraints → Understanding → Decisions → Design → Validation
        → Outcome → Leadership → Reflection
```

Components that enforce it, all in `src/components/`:

| Component | What it holds |
| --- | --- |
| `Snapshot` | The 10-second layer: role, team, scope, scale, status |
| `ProblemFrame` | Visible problem vs underlying problem, then one design challenge |
| `ConstraintList` | Why this was hard. 3-5 entries, no more |
| `InsightBlock` | Artifact → Observation → Insight. All three required |
| `DecisionBlock` | Decision, problem, evidence, why-over-alternatives, consequence, result |
| `ValidationBlock` | Before → Observed → Changed → Why |
| `OutcomeGroups` | Outcomes grouped by impact and labelled by provenance |
| `LeadershipBlock` | Team, alignment, what you personally owned, one moment |
| `Draft` | An authoring slot. Dev only — never published |

The case study page builds its own section index from the body's `##` headings,
so the 60-second scan layer stays in sync automatically.

## Two rules the code enforces

**Claims carry their provenance.** Every entry in `OutcomeGroups` declares a
`kind`:

- `measured` — verified in production after launch
- `observed` — seen in testing, UAT, analytics or operations
- `target` — what the project was expected to achieve
- `scale` — the size of the environment, not a result of the work

Only `measured` gets the accent treatment. Add `verify: true` to any claim whose
source is not yet confirmed — it renders normally but raises a dev-only checklist
of everything still to verify.

**Unfinished work does not publish.** Anything that cannot yet be defended goes
in a `<Draft>`, which renders in `npm run dev` and is stripped from
`npm run build`. There is no "coming soon" state: a short real case study beats
a polished placeholder. Run the dev server to see every outstanding authoring
slot on the site.

## Editing a case study

Everything about a case study lives in its `.mdx` file.

- **Frontmatter** drives the homepage card, the hero, the snapshot, the tags and
  the SEO description. `cardTags` lets the card carry a shorter tag set than the
  page; `dimension` is the line that tells a reviewer why the project is on the
  homepage at all.
- **`status`** is `full` or `short`. Both render the body — the difference is how
  complete the decision set is.
- **Body** is Markdown plus the framework components above.

## Replacing a placeholder with a real image

Placeholders are deliberate stubs, not broken images. Each one carries the brief
for the artwork that belongs there. When you have the real process artifact:

1. Drop the file in `public/images/`.
2. Swap `<Placeholder ... />` for an `<img>` (or Astro's `<Image />`), keeping
   the surrounding `<Breakout>` and any `caption`.

Hero placeholders come from frontmatter (`heroImage`, `cardImage`), so those
need a matching change in `[slug].astro` / `WorkCard.astro` when you switch to
real images.

**No real client screens** — every image is a process artifact (state model,
service map, journey diagram, wireframe).

## Before launch

- [ ] **Resolve every `<Draft>` block.** Run `npm run dev` and work through them.
      The two that matter most: the TrueMeds case study body, and one real
      Before → Observed → Changed example on Cloud Branch.
- [ ] **Verify every claim marked `verify: true`.** The dev build lists them per
      page. Confirm the source, then promote to `measured` or reword.
- [ ] Set the real domain in `astro.config.mjs` (`site:`) and `public/robots.txt`.
      Both currently read `https://ark-website-peach.vercel.app` (the Vercel deployment).
- [ ] Set the real Read.cv URL in `src/site.ts` (`READCV_URL` is a placeholder).
- [ ] Add analytics. Either:
      - Vercel: `npm i @vercel/analytics` and add `<Analytics />` to `BaseLayout`, or
      - Plausible: add its `<script defer>` tag to `BaseLayout`'s `<head>`.
      Neither is wired up yet — both need an account and the final domain.
- [ ] Deploy: connect the repo to Vercel. Astro is auto-detected; no config needed.
- [ ] Submit `sitemap-index.xml` to Google Search Console.
- [ ] Check the OG card in the
      [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).

## OG image

`public/og.png` is generated by `scripts/generate-og.mjs` at build time via
sharp. It renders with locally installed fonts rather than the webfonts the site
loads, so it falls back to Georgia — Fraunces' declared fallback in the type
stack. Install Fraunces locally if you want the card set in the real face.

## Adding a project image

Drop the file in `src/assets/work/`, then point the frontmatter slot at it:

```yaml
cardImage:
  src: ../../assets/work/your-file.png
  alt: One sentence describing the image for screen readers.
  label: ...        # kept — it is the brief if the image is ever removed
  description: ...
```

Any slot without a `src` keeps rendering the labelled placeholder. Astro
generates the responsive WebP variants at build time, so commit the full-size
original — a 2 MB PNG ships as roughly 40-150 KB depending on the viewport.

## Deployment — GitHub Pages

Pushing to `main` builds and publishes the site automatically via
`.github/workflows/deploy.yml`.

First time only:

1. Create an empty repo on GitHub (no README, no .gitignore).
2. Connect and push:
   ```bash
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source → GitHub Actions**.
4. Watch the **Actions** tab. The live URL is printed at the end of the run.

After that, every `git push` republishes the site. No build step to run by hand.

### Pointing a custom domain at it

`astro.config.mjs` reads `SITE_URL` and `BASE_PATH` from the environment, and
the workflow fills them in from `actions/configure-pages`. So when you add a
domain under **Settings → Pages → Custom domain**, the config follows it —
sitemap, robots.txt and OG URLs included. Nothing to edit here.

The one thing to add is a `public/CNAME` file containing just the domain, so
the setting survives each deploy:

```bash
echo "yourdomain.com" > public/CNAME
```

## Shareable one-file preview

```bash
npm run build && npm run preview:bundle
```

Writes `preview.html` — the whole site, all six pages, inlined into a single
file with images as data URIs. Useful for sending to someone without
deploying. It is a review artifact, not the deployment target.
