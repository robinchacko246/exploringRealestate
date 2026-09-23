"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  Home, Tag, BarChart2, ShieldCheck, CreditCard, Palette,
  ArrowRight, Building2, MapPin, Phone,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

// Map icon name strings → Lucide components
const ICON_MAP = {
  home:     Home,
  tag:      Tag,
  chart:    BarChart2,
  shield:   ShieldCheck,
  bank:     CreditCard,
  palette:  Palette,
  building: Building2,
  map:      MapPin,
  phone:    Phone,
};

const DEFAULTS = {
  brand_color:            "#009688",
  brand_name:             "PropertyFlow",
  page_services_title:    "Our Services",
  page_services_subtitle: "Everything you need for a seamless property journey",
  page_services_1_title:  "Buy a Property",
  page_services_1_desc:   "Browse thousands of verified listings across Kerala. Apartments, villas, plots, and commercial spaces.",
  page_services_1_icon:   "home",
  page_services_1_url:    "/listings",
  page_services_2_title:  "Sell / Rent",
  page_services_2_desc:   "List your property and reach thousands of verified buyers and tenants across Kerala.",
  page_services_2_icon:   "tag",
  page_services_2_url:    "/sell",
  page_services_3_title:  "Property Valuation",
  page_services_3_desc:   "Get an accurate market value estimate based on real transaction data and local market trends.",
  page_services_3_icon:   "chart",
  page_services_3_url:    "/contact",
  page_services_4_title:  "Legal Assistance",
  page_services_4_desc:   "End-to-end legal support — title verification, documentation, registration, and more.",
  page_services_4_icon:   "shield",
  page_services_4_url:    "/contact",
  page_services_5_title:  "Home Loans",
  page_services_5_desc:   "Get pre-approved home loans from top banks with the best interest rates in Kerala.",
  page_services_5_icon:   "bank",
  page_services_5_url:    "/contact",
  page_services_6_title:  "Interior Design",
  page_services_6_desc:   "Transform your new home with expert designers who understand Kerala architecture and style.",
  page_services_6_icon:   "palette",
  page_services_6_url:    "/contact",
};

import { mergeWithCache, setCachedSettings } from "@/lib/brand-cache";

export default function ServicesPage() {
  const [s, setS] = useState(() => mergeWithCache(DEFAULTS));

  useEffect(() => {
    supabase.from("admin_settings").select("key, value").then(({ data }) => {
      if (!data) return;
      const map = {};
      data.forEach((r) => { map[r.key] = r.value; });
      setCachedSettings(map);
      setS((prev) => ({ ...prev, ...map }));
    });
  }, []);

  const color      = s.brand_color || "#009688";
  const colorLight = `${color}12`;

  const services = [1, 2, 3, 4, 5, 6].map((n) => ({
    title: s[`page_services_${n}_title`],
    desc:  s[`page_services_${n}_desc`],
    icon:  s[`page_services_${n}_icon`] || "home",
    url:   s[`page_services_${n}_url`]  || "/listings",
  })).filter((sv) => sv.title && sv.desc);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="py-24 px-6 text-white text-center"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-sm font-medium mb-6">
            ✨ What We Offer
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            {s.page_services_title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            {s.page_services_subtitle}
          </p>
        </div>
      </section>

      {/* ── Services Grid ─────────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-8 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(({ title, desc, icon, url }, idx) => {
            const IconComp = ICON_MAP[icon] || Home;
            return (
              <Link
                key={title}
                href={url}
                className="group bg-white rounded-2xl p-8 shadow-sm border border-[#F0F0F0] hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col"
              >
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5 transition-colors"
                  style={{ backgroundColor: colorLight }}
                >
                  <IconComp
                    className="h-7 w-7 transition-colors"
                    style={{ color }}
                  />
                </div>
                <h3 className="font-bold text-xl mb-3 text-[#212121]">{title}</h3>
                <p className="text-[#757575] leading-relaxed text-sm flex-1">{desc}</p>
                <div
                  className="flex items-center gap-2 mt-5 text-sm font-semibold"
                  style={{ color }}
                >
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: colorLight }}>
        <div className="max-w-[1280px] mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Why Choose {s.brand_name || "PropertyFlow"}?</h2>
          <p className="text-[#757575] mb-12 max-w-xl mx-auto">
            We combine local expertise with modern technology to deliver the best real estate experience in Kerala.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { emoji: "✅", title: "Verified Listings",    desc: "Every property is manually verified before going live"      },
              { emoji: "⚡", title: "Fast Response",         desc: "Get connected to agents within minutes of enquiring"       },
              { emoji: "🔒", title: "Secure Transactions",   desc: "Full document verification and legal support included"     },
              { emoji: "📍", title: "Local Expertise",       desc: "Deep knowledge of every district and locality in Kerala"   },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-[#F0F0F0]">
                <div className="text-4xl mb-3">{emoji}</div>
                <div className="font-bold mb-2">{title}</div>
                <p className="text-sm text-[#757575]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section
        className="py-20 px-6 text-center"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-white/80 mb-8 text-lg">
          Contact our team and we'll guide you every step of the way.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/listings"
            className="bg-white font-semibold px-8 py-3.5 rounded-xl text-sm hover:bg-white/90 transition-colors"
            style={{ color }}
          >
            Browse Properties
          </Link>
          <Link
            href="/contact"
            className="border-2 border-white text-white font-semibold px-8 py-3.5 rounded-xl text-sm hover:bg-white/10 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
