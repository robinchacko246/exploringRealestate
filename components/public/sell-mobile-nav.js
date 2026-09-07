"use client";

import { useState } from "react";
import Link from "next/link";

export default function SellMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-[#212121]" aria-label="Menu">
        <div className="w-5 space-y-[5px]">
          <span className={`block h-[2px] bg-[#212121] transition-all duration-200 ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block h-[2px] bg-[#212121] transition-all duration-200 ${open ? "opacity-0" : ""}`} />
          <span className={`block h-[2px] bg-[#212121] transition-all duration-200 ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </div>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border-b-2 border-[#009688] shadow-lg md:hidden z-50">
          <nav className="max-w-[1280px] mx-auto px-6 py-4 flex flex-col gap-0">
            <Link href="/listings" onClick={() => setOpen(false)} className="text-[15px] text-[#424242] py-3 border-b border-[#F0F0F0] hover:text-[#009688]">Browse Properties</Link>
            <Link href="/agentscrm" onClick={() => setOpen(false)} className="text-[15px] text-[#424242] py-3 border-b border-[#F0F0F0] hover:text-[#009688]">For Agents</Link>
            <Link href="/auth" onClick={() => setOpen(false)} className="mt-3 bg-[#009688] text-white text-[14px] font-semibold py-3 text-center rounded hover:bg-[#00796B]">Agent Login</Link>
          </nav>
        </div>
      )}
    </>
  );
}
