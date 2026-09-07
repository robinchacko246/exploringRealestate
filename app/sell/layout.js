import Link from "next/link";
import SellMobileNav from "@/components/public/sell-mobile-nav";

export const metadata = {
  title: "List Your Property Free | PropertyFlow — Sell or Rent Your Property",
  description:
    "List your property for sale or rent on PropertyFlow. Reach thousands of buyers and renters. Free, instant listing. No registration required.",
};

export default function SellLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#212121]">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex items-center justify-between h-[64px]">

          {/* Logo */}
          <Link href="/listings" className="flex items-center gap-2 shrink-0">
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
            <Link href="/listings" className="px-4 py-2 text-[14px] font-medium text-[#424242] hover:text-[#009688] hover:bg-[#E0F2F1] rounded transition-colors">
              Browse Properties
            </Link>
            <Link href="/agentscrm" className="px-4 py-2 text-[14px] font-medium text-[#424242] hover:text-[#009688] hover:bg-[#E0F2F1] rounded transition-colors">
              For Agents
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/listings" className="text-[13.5px] font-medium text-[#616161] hover:text-[#009688] transition-colors">
              View Listings
            </Link>
            <Link
              href="/auth"
              className="bg-[#009688] text-white text-[13.5px] font-semibold px-4 py-2 rounded hover:bg-[#00796B] transition-colors"
            >
              Agent Login
            </Link>
          </div>

          <SellMobileNav />
        </div>
      </header>

      <main>{children}</main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-[#1A1A2E] text-white mt-12">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <svg width="28" height="28" viewBox="0 0 34 34" fill="none">
                <rect width="34" height="34" rx="6" fill="#009688" />
                <path d="M7 17L17 8L27 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="12" y="17" width="10" height="9" rx="1" fill="white" />
                <rect x="15" y="20" width="4" height="6" rx="0.5" fill="#009688" />
              </svg>
              <div>
                <span className="text-[16px] font-bold text-[#009688]">property</span>
                <span className="text-[16px] font-bold text-[#EF9A9A]">flow</span>
              </div>
            </div>
            <p className="text-[13px] text-[#9E9E9E] max-w-xs">
              Free property listing for owners across Kerala. Reach thousands of genuine buyers and renters.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#009688] mb-3">Quick Links</p>
            <div className="flex flex-col gap-2 text-[13px] text-[#BDBDBD]">
              <Link href="/listings" className="hover:text-white transition-colors">Browse Properties</Link>
              <Link href="/sell" className="hover:text-white transition-colors">List a Property</Link>
              <Link href="/agentscrm" className="hover:text-white transition-colors">Agent CRM</Link>
              <Link href="/auth" className="hover:text-white transition-colors">Agent Login</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-[#2C2C44]">
          <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-4 flex justify-between text-[12px] text-[#757575]">
            <span>© {new Date().getFullYear()} PropertyFlow. Free listing for property owners.</span>
            <span>Made in Kerala ❤</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
