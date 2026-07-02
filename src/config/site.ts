export const siteConfig = {
  name: "MBA",
  description: "AI-Powered MBA Interview Practice",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  nav: [
    { label: "Home", href: "/" },
    { label: "How it Works", href: "/how-it-works" },
    { label: "Schools", href: "/schools" },
    { label: "Kira Prep", href: "/kira-prep" },
    // Pricing hidden for beta — restore { label: "Pricing", href: "/pricing" } when pricing goes live.
    { label: "Resources", href: "/resources" },
  ],
} as const;

/**
 * Admin panel navigation. Order matches the Figma sidebar exactly
 * (node 749:3199). Icons are Iconify names — render with @iconify/react.
 */
export const adminNavLinks = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "fluent:grid-24-filled" },
  { label: "User", href: "/admin/users", icon: "material-symbols:person-rounded" },
  { label: "AI Interview", href: "/admin/interviews", icon: "tabler:message-filled" },
  { label: "Question Library", href: "/admin/question-library", icon: "mdi:library" },
  { label: "Kira Video", href: "/admin/kira-video", icon: "tabler:video-filled" },
  { label: "Schools", href: "/admin/schools", icon: "material-symbols:school-rounded" },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: "solar:card-bold" },
  { label: "Analytics", href: "/admin/analytics", icon: "majesticons:analytics" },
  { label: "Notifications", href: "/admin/notifications", icon: "famicons:notifications" },
  { label: "Settings", href: "/admin/settings", icon: "lsicon:setting-filled" },
] as const;

export type AdminNavLink = (typeof adminNavLinks)[number];
