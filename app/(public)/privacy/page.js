"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const DEFAULTS = {
  brand_color:           "#009688",
  brand_name:            "PropertyFlow",
  brand_email:           "hello@propertyflow.in",
  page_privacy_title:    "Privacy Policy",
  page_privacy_updated:  "September 2026",
  page_privacy_content:
`We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.

**Information We Collect**
We collect information you provide directly to us, such as your name, email address, phone number, and property details when you submit a listing or make an enquiry through our platform.

**How We Use Your Information**
We use the information we collect to display listings, connect buyers with sellers, send you updates about your submission status, respond to your enquiries, and improve our services and user experience.

**Data Sharing**
We do not sell, trade, or otherwise transfer your personal information to third parties. We may share your contact information with the relevant property agent or owner when you make an enquiry — this is the core function of our platform.

**Data Security**
We implement industry-standard security measures including SSL encryption to protect your personal information from unauthorized access, alteration, disclosure, or destruction.

**Cookies**
Our website uses cookies to enhance your browsing experience, analyze site traffic, and remember your preferences. You can disable cookies in your browser settings; however, some features of our site may not function properly.

**Third-Party Services**
We use third-party services including Supabase for data storage and Google Analytics for traffic analysis. These services have their own privacy policies governing the use of your information.

**Your Rights**
You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at the email address provided below.

**Contact**
If you have any questions or concerns about this Privacy Policy, please contact us at the email address or phone number listed on our Contact page.

**Changes to This Policy**
We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page with an updated date.`,
};

export default function PrivacyPage() {
  const [s, setS] = useState(DEFAULTS);

  useEffect(() => {
    supabase.from("admin_settings").select("key, value").then(({ data }) => {
      if (!data) return;
      const map = {};
      data.forEach((r) => { map[r.key] = r.value; });
      setS((prev) => ({ ...prev, ...map }));
    });
  }, []);

  const color = s.brand_color || "#009688";

  // Parse content: **text** → <strong>, \n\n → paragraph breaks
  const renderContent = (raw = "") => {
    return raw.split("\n\n").map((block, i) => {
      const html = block
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br />");
      const isHeading = block.startsWith("**") && block.indexOf("**", 2) < 40;
      return (
        <div
          key={i}
          className={`${isHeading ? "mt-8" : "mt-3"}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    });
  };

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="py-20 px-6 text-white"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
      >
        <div className="max-w-[900px] mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-sm font-medium mb-6">
            🔒 Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{s.page_privacy_title}</h1>
          <p className="text-white/70 text-sm">
            Last updated: {s.page_privacy_updated}
          </p>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <section className="max-w-[900px] mx-auto px-6 md:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-[#F0F0F0] p-8 md:p-12 text-[#424242] leading-relaxed text-sm">
          {renderContent(s.page_privacy_content)}
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/listings"
            className="px-6 py-3 rounded-xl font-semibold text-white text-sm"
            style={{ backgroundColor: color }}
          >
            ← Back to Listings
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-xl font-semibold text-sm border-2"
            style={{ color, borderColor: color }}
          >
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
