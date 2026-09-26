/**
 * The site's only script. Three jobs, all observer-driven — no scroll
 * listeners, nothing running per frame except a count-up while it counts.
 *
 *   1. Header state — marks the header once the page has left the top.
 *   2. Reveal — adds .is-in to reveal targets as they enter, once, staggering
 *      the ones that enter together in reading order.
 *   3. Count-up — figures marked data-count run from 0 to their value when
 *      their block is revealed.
 *
 * Under reduced motion only the header state runs; the CSS never hides
 * anything in that case (see html.motion in global.css).
 */

const root = document.documentElement;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* 1 — Header state. A 1px sentinel at the top of the page; when it leaves the
   viewport the page has scrolled. */
const header = document.querySelector<HTMLElement>(".site-header");
if (header) {
  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText =
    "position:absolute;top:0;left:0;width:1px;height:12px;pointer-events:none;";
  document.body.prepend(sentinel);
  new IntersectionObserver(([entry]) => {
    header.classList.toggle("is-scrolled", !entry.isIntersecting);
  }).observe(sentinel);
}

/* 1b — Looping video. `autoplay` is markup, so it cannot be gated on a media
   query. Under reduced motion the loop is stopped and rewound to the poster
   frame; the controls stay, so it is still watchable on demand. */
if (reduce) {
  document.querySelectorAll<HTMLVideoElement>("video[autoplay]").forEach((v) => {
    v.autoplay = false;
    v.loop = false;
    v.pause();
    v.currentTime = 0;
  });
}

/* 3 — Count-up. Defined before reveal so reveal can call it. */
const numberFormat = new Intl.NumberFormat("en-US");

function countUp(scope: Element, delayMs: number) {
  const nodes = scope.matches("[data-count]")
    ? [scope]
    : Array.from(scope.querySelectorAll("[data-count]"));

  nodes.forEach((node) => {
    const el = node as HTMLElement;
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? "";
    if (!Number.isFinite(target)) return;

    const duration = 1400;
    window.setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        // Fast start, long settle: the number lands rather than stops.
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = numberFormat.format(Math.round(target * eased)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delayMs);
  });
}

/* 2 — Reveal. */
if (!reduce) {
  // Figures start at zero so they have somewhere to count from. They are
  // inside hidden reveal blocks, so the reset is never seen.
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    el.textContent = "0" + (el.dataset.suffix ?? "");
  });

  const selector =
    ".reveal, .prose > h2, .prose > h3, .prose > p, .prose > ul";
  const targets = Array.from(document.querySelectorAll<HTMLElement>(selector));

  const observer = new IntersectionObserver(
    (entries) => {
      const entering = entries
        .filter((e) => e.isIntersecting)
        .sort(
          (a, b) =>
            a.boundingClientRect.top - b.boundingClientRect.top ||
            a.boundingClientRect.left - b.boundingClientRect.left,
        );

      entering.forEach((entry, i) => {
        const el = entry.target as HTMLElement;
        const stagger = Math.min(i, 6);
        el.style.setProperty("--stagger", String(stagger));
        el.classList.add("is-in");
        observer.unobserve(el);
        countUp(el, stagger * 80 + 150);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );

  targets.forEach((el) => observer.observe(el));

  // Safety net. Observers pause while a tab is hidden, which is right: a
  // page opened in a background tab reveals when you switch to it. But if
  // anything on screen has still not revealed 2.5s after the page becomes
  // visible, show it rather than leave a gap.
  const sweep = () => {
    targets.forEach((el) => {
      if (el.classList.contains("is-in")) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add("is-in");
        observer.unobserve(el);
        countUp(el, 0);
      }
    });
  };
  const armSweep = () => {
    if (document.visibilityState === "visible") window.setTimeout(sweep, 2500);
  };
  armSweep();
  document.addEventListener("visibilitychange", armSweep);
}

root.classList.add("motion-ready");
