"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Star } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const DEFAULTS = {
  brand_color:                    "#009688",
  brand_name:                     "PropertyFlow",
  page_testimonials_title:        "What Our Clients Say",
  page_testimonials_subtitle:     "Real stories from families and investors who found their perfect property with us",
  page_testimonials_1_name:       "Anand Jose",
  page_testimonials_1_role:       "Broker, Kochi",
  page_testimonials_1_text:       "I stopped losing leads in WhatsApp the day I switched to PropertyFlow. The CRM is a game-changer for any serious realtor in Kerala.",
  page_testimonials_1_rating:     "5",
  page_testimonials_2_name:       "Meena Krishnan",
  page_testimonials_2_role:       "Homebuyer, Thrissur",
  page_testimonials_2_text:       "Found my dream 3BHK apartment within 2 weeks! The listings were accurate and the agent was very responsive. Highly recommend.",
  page_testimonials_2_rating:     "5",
  page_testimonials_3_name:       "Suresh Pillai",
  page_testimonials_3_role:       "Property Investor, Trivandrum",
  page_testimonials_3_text:       "Sold my commercial property in Trivandrum within a month at a great price. The platform connects you to serious buyers.",
  page_testimonials_3_rating:     "5",
  page_testimonials_4_name:       "Divya Thomas",
  page_testimonials_4_role:       "Villa Owner, Kochi",
  page_testimonials_4_text:       "Listed my villa in the morning and got 5 enquiries by evening. The reach of this platform is incredible.",
  page_testimonials_4_rating:     "5",
  page_testimonials_5_name:       "Rahul Varma",
  page_testimonials_5_role:       "NRI Buyer, Dubai",
  page_testimonials_5_text:       "As an NRI, finding trustworthy property listings from abroad was always stressful. PropertyFlow made it so easy and transparent.",
  page_testimonials_5_rating:     "5",
  page_testimonials_6_name:       "Lakshmi Nair",
  page_testimonials_6_role:       "Plot Buyer, Calicut",
  page_testimonials_6_text:       "The site is clean, listings are real, and support was excellent. Got a great plot deal in my budget. Thank you team!",
  page_testimonials_6_rating:     "5",
};

function StarRating({ rating, color }) {
  const n = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4"
          fill={i < n ? color : "transparent"}
          stroke={i < n ? color : "#D0D0D0"}
        />
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const [s, setS] = useState(DEFAULTS);

  useEffect(() => {
    supabase.from("admin_settings").select("key, value").then(({ data }) => {
      if (!data) return;
      const map = {};
      data.forEach((r) => { map[r.key] = r.value; });
      setS((prev) => ({ ...prev, ...map }));
    });
  }, []);

  const color      = s.brand_color || "#009688";
  const colorLight = `${color}12`;

  const testimonials = [1, 2, 3, 4, 5, 6].map((n) => ({
    name:    s[`page_testimonials_${n}_name`],
    role:    s[`page_testimonials_${n}_role`],
    text:    s[`page_testimonials_${n}_text`],
    rating:  s[`page_testimonials_${n}_rating`] || "5",
    initials: (s[`page_testimonials_${n}_name`] || "")
      .split(" ").slice(0, 2).map((w) => w[0] || "").join("").toUpperCase(),
  })).filter((t) => t.name && t.text);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="py-24 px-6 text-white text-center"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-sm font-medium mb-6">
            ⭐ Client Stories
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            {s.page_testimonials_title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            {s.page_testimonials_subtitle}
          </p>
          {/* Average rating badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-5 py-2 mt-8">
            <StarRating rating="5" color="#FFC107" />
            <span className="text-white font-semibold text-sm">
              {testimonials.length > 0
                ? `${(testimonials.reduce((s, t) => s + parseInt(t.rating, 10), 0) / testimonials.length).toFixed(1)} / 5`
                : "5.0 / 5"}
              &nbsp;from {testimonials.length}+ clients
            </span>
          </div>
        </div>
      </section>

      {/* ── Testimonials Grid ─────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-8 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map(({ name, role, text, rating, initials }, idx) => (
            <div
              key={name + idx}
              className="bg-white rounded-2xl p-7 shadow-sm border border-[#F0F0F0] hover:shadow-md transition-shadow flex flex-col"
            >
              <StarRating rating={rating} color={color} />
              <blockquote className="text-[#424242] leading-relaxed text-sm mt-4 flex-1">
                &ldquo;{text}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[#F5F5F5]">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm text-white shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {initials}
                </div>
                <div>
                  <div className="font-semibold text-sm">{name}</div>
                  <div className="text-xs text-[#9E9E9E]">{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section
        className="py-20 px-6 text-center"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          Join Thousands of Happy Clients
        </h2>
        <p className="text-white/80 mb-8 text-lg">
          Find your dream property or sell faster with Kerala's #1 platform.
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
            href="/sell"
            className="border-2 border-white text-white font-semibold px-8 py-3.5 rounded-xl text-sm hover:bg-white/10 transition-colors"
          >
            List Your Property
          </Link>
        </div>
      </section>
    </>
  );
}
