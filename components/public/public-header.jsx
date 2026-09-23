"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import MobileNav from "@/components/public/mobile-nav";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const DEFAULTS = {
  brand_name:          "PropertyFlow",
  brand_color:         "#009688",
  header_link_1_label: "Buy",
  header_link_1_url:   "/listings",
  header_link_2_label: "Apartments",
  header_link_2_url:   "/listings?type=apartment",
  header_link_3_label: "Villas",
  header_link_3_url:   "/listings?type=villa",
  header_link_4_label: "Plots",
  header_link_4_url:   "/listings?type=plot",
  header_link_5_label: "Commercial",
  header_link_5_url:   "/listings?type=commercial",
  header_link_6_label: "",
  header_link_6_url:   "",
};

export default function PublicHeader() {
  const [cfg, setCfg] = useState(DEFAULTS);

  useEffect(() => {
    supabase
      .from("admin_settings")
      .select("key, value")
      .then(({ data }) => {
        if (!data) return;
        const map = {};
        data.forEach((r) => { map[r.key] = r.value; });
        setCfg((prev) => ({ ...prev, ...map }));
      });
  }, []);

  const color      = cfg.brand_color || "#009688";
  const colorLight = `${color}1A`;

  const customHeaderLinks = [1, 2, 3, 4, 5, 6]
    .map((n) => ({ label: cfg[`header_link_${n}_label`], href: cfg[`header_link_${n}_url`] }))
    .filter((l) => l.label && l.href);

  const headerLinks = customHeaderLinks.length > 0
    ? customHeaderLinks
    : [
        { href: "/listings",                 label: "Buy"        },
        { href: "/listings?type=apartment",  label: "Apartments" },
        { href: "/listings?type=villa",      label: "Villas"     },
        { href: "/listings?type=plot",       label: "Plots"      },
        { href: "/listings?type=commercial", label: "Commercial" },
      ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex items-center justify-between h-[64px]">

        {/* Logo */}
        <Link href="/listings" className="flex items-center gap-2 shrink-0">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <rect width="34" height="34" rx="6" fill={color} />
            <path d="M7 17L17 8L27 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="12" y="17" width="10" height="9" rx="1" fill="white" />
            <rect x="15" y="20" width="4" height="6" rx="0.5" fill={color} />
          </svg>
          <div className="leading-tight">
            <span className="text-[18px] font-bold tracking-tight" style={{ color }}>
              {cfg.brand_name?.toLowerCase() || "property"}
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {headerLinks.map(({ href, label }) => (
            <Link
              key={href + label}
              href={href}
              className="px-4 py-2 text-[14px] font-medium text-[#424242] rounded transition-colors"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = color;
                e.currentTarget.style.backgroundColor = colorLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "";
                e.currentTarget.style.backgroundColor = "";
              }}
            >
              {label}
            </Link>
          ))}
          {/* Sell / Rent */}
          <Link
            href="/sell"
            className="ml-1 px-4 py-2 text-[14px] font-semibold rounded transition-colors border"
            style={{ color: "#E65100", borderColor: "#E65100" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "white";
              e.currentTarget.style.backgroundColor = "#E65100";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#E65100";
              e.currentTarget.style.backgroundColor = "";
            }}
          >
            Sell / Rent
          </Link>
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/agentscrm"
            className="text-[13.5px] text-[#616161] hover:text-[#424242] transition-colors px-2"
          >
            For Agents
          </Link>
          <Link
            href="/auth"
            className="text-white text-[13.5px] font-semibold px-5 py-2 rounded transition-colors"
            style={{ backgroundColor: color }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(0.9)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = ""; }}
          >
            Agent Login
          </Link>
        </div>

        {/* Mobile nav */}
        <MobileNav headerLinks={headerLinks} color={color} />
      </div>
    </header>
  );
}
