"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const DEFAULTS = {
  brand_color:              "#009688",
  brand_name:               "PropertyFlow",
  page_about_title:         "About Us",
  page_about_subtitle:      "Building Kerala's most trusted real estate platform",
  page_about_story:         "Founded in 2020, PropertyFlow has helped thousands of families find their dream homes across Kerala. We combine local market expertise with modern technology to make property transactions transparent, efficient, and stress-free.",
  page_about_mission:       "To make property transactions transparent, efficient, and stress-free for every family in Kerala.",
  page_about_vision:        "A Kerala where every family finds their dream home with ease and confidence.",
  page_about_stat_1_label:  "Founded",
  page_about_stat_1_value:  "2020",
  page_about_stat_2_label:  "Properties Sold",
  page_about_stat_2_value:  "2,500+",
  page_about_stat_3_label:  "Happy Clients",
  page_about_stat_3_value:  "1,800+",
  page_about_stat_4_label:  "Cities Covered",
  page_about_stat_4_value:  "15+",
  page_about_team_1_name:   "Robin Chacko",
  page_about_team_1_role:   "Founder & CEO",
  page_about_team_1_bio:    "15 years in Kerala real estate. Passionate about making property transactions simple and transparent for everyone.",
  page_about_team_2_name:   "Priya Menon",
  page_about_team_2_role:   "Head of Sales",
  page_about_team_2_bio:    "Expert in residential properties across Kochi and Thrissur with 10+ years of experience.",
  page_about_team_3_name:   "Arjun Nair",
  page_about_team_3_role:   "Lead Agent",
  page_about_team_3_bio:    "Specializes in commercial and investment properties across South Kerala.",
};

import { mergeWithCache, setCachedSettings } from "@/lib/brand-cache";

export default function AboutPage() {
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

  const stats = [1, 2, 3, 4].map((n) => ({
    label: s[`page_about_stat_${n}_label`],
    value: s[`page_about_stat_${n}_value`],
  })).filter((st) => st.label && st.value);

  const team = [1, 2, 3].map((n) => ({
    name:     s[`page_about_team_${n}_name`],
    role:     s[`page_about_team_${n}_role`],
    bio:      s[`page_about_team_${n}_bio`],
    initials: (s[`page_about_team_${n}_name`] || "")
      .split(" ").slice(0, 2).map((w) => w[0] || "").join("").toUpperCase(),
  })).filter((t) => t.name);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="py-24 px-6 text-white text-center"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-sm font-medium mb-6">
            🏡 Our Story
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            {s.page_about_title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            {s.page_about_subtitle}
          </p>
        </div>
      </section>

      {/* ── Story + Stats ─────────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-8 py-20 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-5" style={{ color }}>Our Story</h2>
          <p className="text-[#616161] leading-relaxed text-lg">{s.page_about_story}</p>
          <Link
            href="/contact"
            className="inline-block mt-8 px-6 py-3 rounded-xl font-semibold text-white text-sm"
            style={{ backgroundColor: color }}
          >
            Get in Touch →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl border p-7 text-center shadow-sm hover:shadow-md transition-shadow"
              style={{ borderColor: `${color}30`, backgroundColor: colorLight }}
            >
              <div className="text-4xl font-bold mb-1" style={{ color }}>{value}</div>
              <div className="text-sm font-medium text-[#757575]">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission & Vision ──────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: colorLight }}>
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Drives Us</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "Our Mission", content: s.page_about_mission, emoji: "🎯" },
              { title: "Our Vision",  content: s.page_about_vision,  emoji: "🌟" },
            ].map(({ title, content, emoji }) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-sm border border-[#F0F0F0]">
                <div className="text-5xl mb-5">{emoji}</div>
                <h3 className="text-xl font-bold mb-3" style={{ color }}>{title}</h3>
                <p className="text-[#616161] leading-relaxed">{content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ──────────────────────────────────────────────────────── */}
      {team.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-6 md:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Meet Our Team</h2>
            <p className="text-[#757575]">The people behind Kerala's #1 property platform</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map(({ name, role, bio, initials }) => (
              <div
                key={name}
                className="bg-white rounded-2xl p-8 shadow-sm border border-[#F0F0F0] text-center hover:shadow-md transition-shadow"
              >
                <div
                  className="h-16 w-16 rounded-full flex items-center justify-center font-bold text-xl text-white mx-auto mb-4"
                  style={{ backgroundColor: color }}
                >
                  {initials}
                </div>
                <div className="font-bold text-lg mb-1">{name}</div>
                <div className="text-sm font-medium mb-4" style={{ color }}>{role}</div>
                <p className="text-[#757575] text-sm leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section
        className="py-20 px-6 text-center"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Find Your Dream Property?
        </h2>
        <p className="text-white/80 mb-8 text-lg">
          Browse thousands of verified listings across Kerala.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/listings"
            className="bg-white font-semibold px-8 py-3.5 rounded-xl text-sm hover:bg-white/90 transition-colors"
            style={{ color }}
          >
            Browse Listings
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
