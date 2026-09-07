import Link from "next/link";
import AgentsMobileNav from "@/components/public/agents-mobile-nav";

export const metadata = {
  title: "PropertyFlow CRM — WhatsApp CRM for Indian Real Estate Agents",
  description:
    "Stop losing deals in WhatsApp. PropertyFlow turns your client chats into a structured pipeline — clients, requirements, follow-ups — all tracked automatically.",
};

export default function AgentsCRMLayout({ children }) {
  return (
    <div className="min-h-screen bg-white text-[#212121]">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex items-center justify-between h-[64px]">

          {/* Logo */}
          <Link href="/agentscrm" className="flex items-center gap-2 shrink-0">
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <rect width="34" height="34" rx="6" fill="#009688" />
              <path d="M7 17L17 8L27 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="12" y="17" width="10" height="9" rx="1" fill="white" />
              <rect x="15" y="20" width="4" height="6" rx="0.5" fill="#009688" />
            </svg>
            <div className="leading-tight">
              <span className="text-[18px] font-bold text-[#009688] tracking-tight">property</span>
              <span className="text-[18px] font-bold text-[#D32F2F] tracking-tight">flow</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "#features",  label: "Features" },
              { href: "#pricing",   label: "Pricing" },
              { href: "#how",       label: "How it works" },
              { href: "/listings",  label: "View Properties ↗" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="px-4 py-2 text-[14px] font-medium text-[#424242] hover:text-[#009688] hover:bg-[#E0F2F1] rounded transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth" className="text-[13.5px] font-medium text-[#616161] hover:text-[#009688] transition-colors px-2">
              Sign in
            </Link>
            <Link
              href="/auth"
              className="bg-[#009688] text-white text-[13.5px] font-semibold px-5 py-2 rounded hover:bg-[#00796B] transition-colors"
            >
              Get started free
            </Link>
          </div>

          {/* Mobile nav toggle */}
          <AgentsMobileNav />
        </div>
      </header>

      <main>{children}</main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-[#1A1A2E] text-white mt-0">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-10 grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <svg width="30" height="30" viewBox="0 0 34 34" fill="none">
                <rect width="34" height="34" rx="6" fill="#009688" />
                <path d="M7 17L17 8L27 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="12" y="17" width="10" height="9" rx="1" fill="white" />
                <rect x="15" y="20" width="4" height="6" rx="0.5" fill="#009688" />
              </svg>
              <div>
                <span className="text-[17px] font-bold text-[#009688]">property</span>
                <span className="text-[17px] font-bold text-[#EF9A9A]">flow</span>
                <span className="text-[13px] font-medium text-[#9E9E9E] ml-1">CRM</span>
              </div>
            </div>
            <p className="text-[13.5px] text-[#9E9E9E] leading-relaxed max-w-xs">
              The WhatsApp-native CRM built for Indian real estate agents. Never lose a client, requirement, or follow-up again.
            </p>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#009688] mb-3">Product</p>
            <div className="flex flex-col gap-2">
              {[
                { href: "#features",  label: "Features" },
                { href: "#pricing",   label: "Pricing" },
                { href: "#how",       label: "How it works" },
                { href: "/auth",      label: "Sign up" },
              ].map(({ href, label }) => (
                <a key={label} href={href} className="text-[13.5px] text-[#BDBDBD] hover:text-white transition-colors">{label}</a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#009688] mb-3">Listings</p>
            <div className="flex flex-col gap-2">
              {[
                { href: "/listings",                  label: "All Properties" },
                { href: "/listings?type=apartment",   label: "Apartments" },
                { href: "/listings?type=villa",        label: "Villas" },
                { href: "/listings?type=plot",         label: "Plots" },
              ].map(({ href, label }) => (
                <Link key={label} href={href} className="text-[13.5px] text-[#BDBDBD] hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[#2C2C44]">
          <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12.5px] text-[#757575]">
            <span>© {new Date().getFullYear()} PropertyFlow CRM. All rights reserved.</span>
            <span>Made with ❤ in Kerala · Built for Indian realtors</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
