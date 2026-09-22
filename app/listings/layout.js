"use client";

import Link from "next/link";
import MobileNav from "@/components/public/mobile-nav";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

// Default settings — used while DB loads or if no settings exist
const DEFAULTS = {
  brand_name:          "PropertyFlow",
  brand_color:         "#009688",
  brand_tagline:       "Kerala's #1 Property Platform",
  footer_copyright:    `© ${new Date().getFullYear()} PropertyFlow CRM. All rights reserved.`,
  footer_tagline:      "Made with ❤ in Kerala",
  footer_link_1_label: "Browse Listings",
  footer_link_1_url:   "/listings",
  footer_link_2_label: "List Your Property",
  footer_link_2_url:   "/sell",
  footer_link_3_label: "For Agents",
  footer_link_3_url:   "/agentscrm",
  footer_link_4_label: "",
  footer_link_4_url:   "",
};

export default function ListingsLayout({ children }) {
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

  const color       = cfg.brand_color || "#009688";
  const colorLight  = `${color}1A`; // ~10% opacity for hover bg
  const footerLinks = [1, 2, 3, 4]
    .map((n) => ({ label: cfg[`footer_link_${n}_label`], url: cfg[`footer_link_${n}_url`] }))
    .filter((l) => l.label && l.url);

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#212121]">

      {/* ── Header ──────────────────────────────────────────────────── */}
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
            {[
              { href: "/listings",                   label: "Buy"         },
              { href: "/listings?type=apartment",    label: "Apartments"  },
              { href: "/listings?type=villa",        label: "Villas"      },
              { href: "/listings?type=plot",         label: "Plots"       },
              { href: "/listings?type=commercial",   label: "Commercial"  },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-2 text-[14px] font-medium text-[#424242] rounded transition-colors"
                style={{ ["--hover-color"]: color }}
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
            <Link href="/agentscrm" className="text-[13.5px] text-[#616161] hover:text-[#009688] transition-colors px-2">
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

          {/* Mobile nav toggle */}
          <MobileNav />
        </div>
      </header>

      <main>{children}</main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-[#1A1A2E] text-white mt-12">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-10 grid md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <svg width="30" height="30" viewBox="0 0 34 34" fill="none">
                <rect width="34" height="34" rx="6" fill={color} />
                <path d="M7 17L17 8L27 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="12" y="17" width="10" height="9" rx="1" fill="white" />
                <rect x="15" y="20" width="4" height="6" rx="0.5" fill={color} />
              </svg>
              <span className="text-[17px] font-bold" style={{ color }}>{cfg.brand_name || "PropertyFlow"}</span>
            </div>
            <p className="text-[13.5px] text-[#9E9E9E] leading-relaxed max-w-xs">
              {cfg.brand_tagline || "Kerala's leading property platform."}
            </p>
          </div>

          {/* Properties column */}
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color }}>Properties</p>
            <div className="flex flex-col gap-2">
              {["All Properties", "Apartments", "Villas", "Plots", "Commercial", "Houses"].map((l) => (
                <Link key={l} href={`/listings?type=${l.toLowerCase().replace(" ", "")}`} className="text-[13.5px] text-[#BDBDBD] hover:text-white transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>

          {/* Dynamic footer links column */}
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color }}>Links</p>
            <div className="flex flex-col gap-2">
              {footerLinks.length > 0
                ? footerLinks.map(({ label, url }) => (
                    <Link key={label} href={url} className="text-[13.5px] text-[#BDBDBD] hover:text-white transition-colors">
                      {label}
                    </Link>
                  ))
                : [
                    { href: "/agentscrm", label: "For Agents" },
                    { href: "/auth",      label: "Agent Login" },
                    { href: "/sell",      label: "List a Property" },
                  ].map(({ href, label }) => (
                    <Link key={label} href={href} className="text-[13.5px] text-[#BDBDBD] hover:text-white transition-colors">
                      {label}
                    </Link>
                  ))
              }
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#2C2C44]">
          <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12.5px] text-[#757575]">
            <span>{cfg.footer_copyright || `© ${new Date().getFullYear()} PropertyFlow CRM. All rights reserved.`}</span>
            <span>{cfg.footer_tagline || "Made with ❤ in Kerala"}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
