"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ChevronDown, ChevronUp } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const DEFAULTS = {
  brand_color:      "#009688",
  brand_name:       "PropertyFlow",
  page_faq_title:   "Frequently Asked Questions",
  page_faq_subtitle:"Got questions? We have answers.",
  page_faq_1_q: "How do I list my property?",
  page_faq_1_a: "Visit our Sell page, fill in your property details, upload photos, and submit. Our team reviews and publishes your listing within 24 hours.",
  page_faq_2_q: "Is it free to browse listings?",
  page_faq_2_a: "Yes! Browsing all property listings on our platform is completely free. No registration required.",
  page_faq_3_q: "How do I contact a property owner?",
  page_faq_3_a: "Each listing has a WhatsApp and call button. Click either to instantly connect with the agent or owner.",
  page_faq_4_q: "Are the listings verified?",
  page_faq_4_a: "All listings go through our verification process before going live. We check property documents and ownership details.",
  page_faq_5_q: "How long does it take for my listing to go live?",
  page_faq_5_a: "Listings are typically reviewed and published within 24 hours of submission on business days.",
  page_faq_6_q: "Can I edit my listing after submission?",
  page_faq_6_a: "Yes. Use the Track Status page with your submission ID to request edits or contact our support team.",
  page_faq_7_q: "What areas do you cover?",
  page_faq_7_a: "We currently cover all major cities and districts in Kerala including Kochi, Trivandrum, Calicut, Thrissur, Kannur, and more.",
  page_faq_8_q: "How do I get a property valuation?",
  page_faq_8_a: "Contact us via WhatsApp or phone with your property details. Our experts will provide a free market value estimate within 48 hours.",
};

function AccordionItem({ question, answer, color, isOpen, onToggle }) {
  const colorLight = `${color}12`;
  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all"
      style={{ borderColor: isOpen ? `${color}40` : "#E0E0E0" }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-[#212121] hover:bg-[#FAFAFA] transition-colors"
        style={isOpen ? { backgroundColor: colorLight } : {}}
      >
        <span className="pr-4">{question}</span>
        {isOpen
          ? <ChevronUp  className="h-5 w-5 shrink-0" style={{ color }} />
          : <ChevronDown className="h-5 w-5 shrink-0 text-[#9E9E9E]" />}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-2 text-[#616161] leading-relaxed text-sm">
          {answer}
        </div>
      )}
    </div>
  );
}

import { mergeWithCache, setCachedSettings } from "@/lib/brand-cache";

export default function FAQPage() {
  const [s, setS]         = useState(() => mergeWithCache(DEFAULTS));
  const [openIdx, setOpen] = useState(0);

  useEffect(() => {
    supabase.from("admin_settings").select("key, value").then(({ data }) => {
      if (!data) return;
      const map = {};
      data.forEach((r) => { map[r.key] = r.value; });
      setCachedSettings(map);
      setS((prev) => ({ ...prev, ...map }));
    });
  }, []);

  const color = s.brand_color || "#009688";
  const colorLight = `${color}12`;

  const faqs = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
    q: s[`page_faq_${n}_q`],
    a: s[`page_faq_${n}_a`],
  })).filter((f) => f.q && f.a);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="py-24 px-6 text-white text-center"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-sm font-medium mb-6">
            ❓ Help Center
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            {s.page_faq_title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            {s.page_faq_subtitle}
          </p>
        </div>
      </section>

      {/* ── FAQ Accordion ─────────────────────────────────────────────── */}
      <section className="max-w-[900px] mx-auto px-6 md:px-8 py-20">
        <div className="flex flex-col gap-4">
          {faqs.map(({ q, a }, idx) => (
            <AccordionItem
              key={q}
              question={q}
              answer={a}
              color={color}
              isOpen={openIdx === idx}
              onToggle={() => setOpen(openIdx === idx ? null : idx)}
            />
          ))}
        </div>

        {/* Still have questions */}
        <div
          className="mt-16 rounded-2xl p-8 text-center"
          style={{ backgroundColor: colorLight, border: `1px solid ${color}30` }}
        >
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-[#757575] mb-6 text-sm">
            Can't find the answer you're looking for? Chat with our team on WhatsApp.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl font-semibold text-white text-sm"
              style={{ backgroundColor: color }}
            >
              Contact Us
            </Link>
            <Link
              href="/listings"
              className="px-6 py-3 rounded-xl font-semibold text-sm border-2"
              style={{ color, borderColor: color }}
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
