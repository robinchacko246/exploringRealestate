"use client";

import { useState } from "react";
import Link from "next/link";

export default function AgentsMobileNav() {
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
              { href: "#features", label: "Features" },
              { href: "#pricing",  label: "Pricing" },
              { href: "#how",      label: "How it works" },
              { href: "/listings", label: "View Properties ↗" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="text-[15px] text-[#424242] py-3 border-b border-[#F0F0F0] hover:text-[#009688] transition-colors"
              >
                {label}
              </a>
            ))}
            <Link
              href="/auth"
              onClick={() => setOpen(false)}
              className="mt-3 bg-[#009688] text-white text-[14px] font-semibold py-3 text-center rounded hover:bg-[#00796B] transition-colors"
            >
              Get started free
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
