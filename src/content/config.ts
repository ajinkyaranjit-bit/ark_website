import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const placeholder = z.object({
  label: z.string(),
  description: z.string(),
  aspect: z.enum(["16:9", "4:3", "1:1", "3:2"]).default("16:9"),
  caption: z.string().optional(),
});

const work = defineCollection({
  loader: glob({ base: "./src/content/work", pattern: "**/*.mdx" }),
  schema: z.object({
    order: z.number(),
    number: z.string(),
    featured: z.boolean().default(true),

    /**
     * `full`  — the complete decision-led case study.
     * `short` — a real but abbreviated case study: problem, constraints,
     *           2-3 decisions, key system artifact, current status.
     *
     * There is deliberately no "coming soon" state. A short real case study
     * beats a polished placeholder.
     */
    status: z.enum(["full", "short"]).default("short"),

    // ── Homepage card ────────────────────────────────────────────────
    // Five parts, in reading order. Role, duration and company are
    // deliberately absent — those belong inside the case study.
    cardTitle: z.string(),
    cardCategory: z.string(),
    /** The sentence that differentiates this project from the other two. */
    cardHook: z.string(),
    cardDescription: z.string(),
    /** Audience or scale. May be non-numeric where no number is defensible. */
    cardAudience: z.string(),
    cardImage: placeholder,
    cardTags: z.array(z.string()).optional(),

    // ── Case study page ──────────────────────────────────────────────
    title: z.string(),
    subtitle: z.string(),
    tags: z.array(z.string()),
    heroImage: placeholder,

    /** The 10-second scan layer. */
    snapshot: z.object({
      challenge: z.string(),
      items: z.array(z.object({ label: z.string(), value: z.string() })),
    }),

    description: z.string(),

    next: z
      .object({ title: z.string(), href: z.string(), blurb: z.string() })
      .optional(),
  }),
});

export const collections = { work };
