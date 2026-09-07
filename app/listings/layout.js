import Link from "next/link";
import MobileNav from "@/components/public/mobile-nav";

export const metadata = {
  title: "Property Listings | PropertyFlow — Find Your Dream Property",
  description:
    "Browse thousands of properties — plots, villas, apartments, houses, commercial spaces — listed by verified agents across Kerala.",
};

export default function ListingsLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#212121]">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex items-center justify-between h-[64px]">

          {/* Logo */}
          <Link href="/listings" className="flex items-center gap-2 shrink-0">
            {/* House icon */}
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
              { href: "/listings", label: "Buy" },
              { href: "/listings?type=apartment", label: "Apartments" },
              { href: "/listings?type=villa", label: "Villas" },
              { href: "/listings?type=plot", label: "Plots" },
              { href: "/listings?type=commercial", label: "Commercial" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-2 text-[14px] font-medium text-[#424242] hover:text-[#009688] hover:bg-[#E0F2F1] rounded transition-colors"
              >
                {label}
              </Link>
            ))}
            {/* Sell / Rent — visually distinct */}
            <Link
              href="/sell"
              className="ml-1 px-4 py-2 text-[14px] font-semibold text-[#E65100] hover:text-white hover:bg-[#E65100] rounded transition-colors border border-[#E65100]"
            >
              Sell / Rent
            </Link>
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/agentscrm" className="text-[13.5px] text-[#616161] hover:text-[#009688] transition-colors px-2">
              For Agents
            </Link>
            <Link
              href="/auth"
              className="bg-[#009688] text-white text-[13.5px] font-semibold px-5 py-2 rounded hover:bg-[#00796B] transition-colors"
            >
              Agent Login
            </Link>
          </div>

          {/* Mobile nav toggle */}
          <MobileNav />
        </div>
      </header>

      <main>{children}</main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-[#1A1A2E] text-white mt-12">
        {/* Top section */}
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
              </div>
            </div>
            <p className="text-[13.5px] text-[#9E9E9E] leading-relaxed max-w-xs">
              Kerala&apos;s leading property platform. Find plots, villas, apartments, and commercial spaces listed by verified real estate agents.
            </p>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#009688] mb-3">Properties</p>
            <div className="flex flex-col gap-2">
              {["All Properties", "Apartments", "Villas", "Plots", "Commercial", "Houses"].map((l) => (
                <Link key={l} href={`/listings?type=${l.toLowerCase()}`} className="text-[13.5px] text-[#BDBDBD] hover:text-white transition-colors">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#009688] mb-3">Agents</p>
            <div className="flex flex-col gap-2">
              {[
                { href: "/agentscrm", label: "For Agents" },
                { href: "/auth", label: "Agent Login" },
                { href: "/auth", label: "List a Property" },
              ].map(({ href, label }) => (
                <Link key={label} href={href} className="text-[13.5px] text-[#BDBDBD] hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="border-t border-[#2C2C44]">
          <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12.5px] text-[#757575]">
            <span>© {new Date().getFullYear()} PropertyFlow CRM. All listings provided by registered agents.</span>
            <span>Made with ❤ in Kerala</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
