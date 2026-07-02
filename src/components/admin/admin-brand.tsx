/**
 * MBA Interview AI brand mark — used in the admin sidebar.
 *
 * Uses the same official logo lockup as the sign-in page and app top-nav
 * (`/figma-assets/ad82c1b5…png`), which already bakes in the swoosh, the
 * "MBA INTERVIEW AI" wordmark, and the "POWERED BY MMC" tagline. Rendering the
 * shared asset here keeps every logo across the product identical (previously
 * the admin used a placeholder triangle + a stale "POWERED BY MMG" tagline).
 */
export function AdminBrand() {
  return (
    <img
      src="/figma-assets/ad82c1b5-4e3d-40db-921e-2351e6ee095c.png"
      alt="MBA Interview AI — Powered by MMC"
      className="h-13 w-auto object-contain"
    />
  );
}
