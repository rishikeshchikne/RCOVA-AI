/** Builds per-route head meta so every page has a unique title and description. */
export function seo(title: string, description: string, opts: { noindex?: boolean } = {}) {
  const fullTitle = title.includes("RCOVA") ? title : `${title} — RCOVA AI`;
  return [
    { title: fullTitle },
    { name: "description", content: description },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    ...(opts.noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
  ];
}
