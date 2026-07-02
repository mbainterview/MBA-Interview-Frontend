import Link from "next/link";

// Only links that resolve to a real page are listed. Dead placeholders
// (Interview Tips, Help Center, Contact, About Us) and the not-yet-built
// Terms/Privacy/Cookies pages were removed; Pricing is hidden for the beta.
const footerLinks = {
  Product: [
    { label: "How it Works", href: "/how-it-works" },
    { label: "Schools", href: "/schools" },
    { label: "Kira Prep", href: "/kira-prep" },
    { label: "Features", href: "/#features" },
  ],
  Resources: [
    { label: "MBA Resources", href: "/resources" },
  ],
};

export function Footer() {
  return (
    <footer style={{ background: "#5450d8" }}>
      <div className="max-w-360 mx-auto px-15 py-14">
        <div className="mb-8">
          <Link href="/" aria-label="MBA Interview AI">
            {/* Brand logo — same asset as navbar, tinted white to read on the indigo footer. */}
            <img
              src="/figma-assets/50efbb76-3497-42d1-9b7b-99c0dc7f6917.png"
              alt="MBA Interview AI"
              style={{
                height: "72px",
                width: "auto",
                display: "block",
                filter: "brightness(0) invert(1)",
              }}
            />
          </Link>
        </div>
        <hr style={{ borderColor: "rgba(255,255,255,0.2)", marginBottom: "40px" }} />
        <div className="flex flex-col lg:flex-row gap-12 justify-between mb-10">
          <div className="flex gap-25 flex-wrap">
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <p className="mb-5 font-semibold text-white" style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "16px", lineHeight: 1.3 }}>{group}</p>
                <ul className="flex flex-col gap-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="transition-opacity hover:opacity-100" style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "16px", lineHeight: 1.3, color: "#ffffff", opacity: 0.75 }}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4 w-full lg:w-135 shrink-0">
            <p className="font-semibold text-white" style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "18px" }}>Start Your MBA Interview Prep Today</p>
            <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>Practice with AI-powered feedback, master Kira video essays, and walk into your interview with confidence.</p>
            <div className="flex items-center justify-between rounded-[16px] bg-white" style={{ height: "68px", width: "100%", maxWidth: "540px", border: "1.5px solid #e7e8f2", paddingLeft: "19.28px", paddingRight: "9px" }}>
              <input type="email" placeholder="Email address" className="flex-1 bg-transparent outline-none" style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 700, fontSize: "14px", color: "#636363" }} />
              <button className="rounded-[16px] text-white shrink-0 capitalize" style={{ background: "#5450d8", height: "50px", width: "150px", fontFamily: "var(--font-inter), sans-serif", fontWeight: 700, fontSize: "18px", lineHeight: "28px" }}>Subscribe</button>
            </div>
          </div>
        </div>
        <hr style={{ borderColor: "rgba(255,255,255,0.2)", marginBottom: "24px" }} />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", color: "#ffffff" }}>© 2026 MBA Interview Prep Simulator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
