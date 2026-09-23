"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

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

import { mergeWithCache, setCachedSettings } from "@/lib/brand-cache";

export default function PublicFooter() {
  const [cfg, setCfg] = useState(() => mergeWithCache(DEFAULTS));

  useEffect(() => {
    supabase
      .from("admin_settings")
      .select("key, value")
      .then(({ data }) => {
        if (!data) return;
        const map = {};
        data.forEach((r) => { map[r.key] = r.value; });
        setCachedSettings(map);
        setCfg((prev) => ({ ...prev, ...map }));
      });
  }, []);

  const color      = cfg.brand_color || "#009688";
  const footerLinks = [1, 2, 3, 4]
    .map((n) => ({ label: cfg[`footer_link_${n}_label`], url: cfg[`footer_link_${n}_url`] }))
    .filter((l) => l.label && l.url);

  return (
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
            <span className="text-[17px] font-bold" style={{ color }}>
              {cfg.brand_name || "PropertyFlow"}
            </span>
          </div>
          <p className="text-[13.5px] text-[#9E9E9E] leading-relaxed max-w-xs">
            {cfg.brand_tagline || "Kerala's leading property platform."}
          </p>
        </div>

        {/* Properties column */}
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color }}>
            Properties
          </p>
          <div className="flex flex-col gap-2">
            {[
              { label: "All Properties",  type: "allproperties" },
              { label: "Apartments",      type: "apartment"     },
              { label: "Villas",          type: "villa"         },
              { label: "Plots",           type: "plot"          },
              { label: "Commercial",      type: "commercial"    },
              { label: "Houses",          type: "house"         },
            ].map(({ label, type }) => (
              <Link
                key={type}
                href={`/listings${type === "allproperties" ? "" : `?type=${type}`}`}
                className="text-[13.5px] text-[#BDBDBD] hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Dynamic links column */}
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color }}>
            Links
          </p>
          <div className="flex flex-col gap-2">
            {(footerLinks.length > 0
              ? footerLinks
              : [
                  { label: "For Agents",        url: "/agentscrm" },
                  { label: "Agent Login",        url: "/auth"      },
                  { label: "List a Property",    url: "/sell"      },
                ]
            ).map(({ label, url }) => (
              <Link
                key={label}
                href={url}
                className="text-[13.5px] text-[#BDBDBD] hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#2C2C44]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12.5px] text-[#757575]">
          <span>
            {cfg.footer_copyright || `© ${new Date().getFullYear()} PropertyFlow CRM. All rights reserved.`}
          </span>
          <span>{cfg.footer_tagline || "Made with ❤ in Kerala"}</span>
        </div>
      </div>
    </footer>
  );
}
