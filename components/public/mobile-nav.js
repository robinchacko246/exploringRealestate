"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden p-2 text-[#212121]"
        aria-label="Toggle navigation"
      >
        <div className="w-5 space-y-[5px]">
          <span className={`block h-[2px] bg-[#212121] transition-all duration-200 ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block h-[2px] bg-[#212121] transition-all duration-200 ${open ? "opacity-0" : ""}`} />
          <span className={`block h-[2px] bg-[#212121] transition-all duration-200 ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border-b-2 border-[#009688] shadow-lg md:hidden z-50">
          <nav className="max-w-[1280px] mx-auto px-6 py-4 flex flex-col gap-0">
            {[
              { href: "/listings", label: "All Properties" },
              { href: "/listings?type=apartment", label: "Apartments" },
              { href: "/listings?type=villa", label: "Villas" },
              { href: "/listings?type=plot", label: "Plots" },
              { href: "/listings?type=house", label: "Houses" },
              { href: "/listings?type=commercial", label: "Commercial" },
              { href: "/agentscrm", label: "For Agents" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="text-[15px] text-[#424242] py-3 border-b border-[#F0F0F0] hover:text-[#009688] transition-colors"
              >
                {label}
              </Link>
            ))}
            {/* Sell / Rent — distinct orange */}
            <Link
              href="/sell"
              onClick={() => setOpen(false)}
              className="text-[15px] font-semibold text-[#E65100] py-3 border-b border-[#F0F0F0] flex items-center gap-2"
            >
              🏷 Sell / Rent My Property
            </Link>
            <Link
              href="/auth"
              onClick={() => setOpen(false)}
              className="mt-3 bg-[#009688] text-white text-[14px] font-semibold py-3 text-center rounded hover:bg-[#00796B] transition-colors"
            >
              Agent Login
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
