"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Phone, Mail, MessageCircle, MapPin, Clock, Send, CheckCircle2, Loader2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const DEFAULTS = {
  brand_color:              "#009688",
  brand_name:               "PropertyFlow",
  admin_contact_phone:      "+918138802204",
  brand_email:              "hello@propertyflow.in",
  brand_whatsapp:           "+918138802204",
  page_contact_title:       "Contact Us",
  page_contact_subtitle:    "We're here to help you find your dream property",
  page_contact_address:     "123 MG Road, Kochi, Kerala 682011",
  page_contact_hours:       "Mon–Sat: 9am–6pm IST",
  page_contact_map_url:     "",
};

import { mergeWithCache, setCachedSettings } from "@/lib/brand-cache";

export default function ContactPage() {
  const [s, setS]         = useState(() => mergeWithCache(DEFAULTS));
  const [form, setForm]   = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    // Send via WhatsApp (no backend needed)
    const wa = (s.brand_whatsapp || "+918138802204").replace(/\D/g, "");
    const msg = encodeURIComponent(
      `*New Contact Enquiry*\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`
    );
    window.open(`https://wa.me/${wa}?text=${msg}`, "_blank");
    setStatus("sent");
    setForm({ name: "", email: "", phone: "", message: "" });
    setTimeout(() => setStatus("idle"), 4000);
  };

  const contactItems = [
    {
      icon: Phone,
      label: "Phone",
      value: s.admin_contact_phone || s.brand_email,
      href:  `tel:${s.admin_contact_phone}`,
    },
    {
      icon: Mail,
      label: "Email",
      value: s.brand_email,
      href:  `mailto:${s.brand_email}`,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: s.brand_whatsapp,
      href:  `https://wa.me/${(s.brand_whatsapp || "").replace(/\D/g, "")}`,
    },
    {
      icon: MapPin,
      label: "Address",
      value: s.page_contact_address,
      href:  null,
    },
    {
      icon: Clock,
      label: "Office Hours",
      value: s.page_contact_hours,
      href:  null,
    },
  ].filter((c) => c.value);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="py-24 px-6 text-white text-center"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-sm font-medium mb-6">
            📞 Get in Touch
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            {s.page_contact_title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            {s.page_contact_subtitle}
          </p>
        </div>
      </section>

      {/* ── Contact Form + Info ───────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-8 py-20 grid md:grid-cols-2 gap-12">

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#F0F0F0] p-8">
          <h2 className="text-2xl font-bold mb-1">Send us a Message</h2>
          <p className="text-[#757575] text-sm mb-6">
            We'll respond via WhatsApp within a few hours.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#757575] mb-1.5">
                  Full Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Anand Jose"
                  className="w-full rounded-xl border border-[#E0E0E0] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
                  style={{ "--tw-ring-color": color }}
                  onFocus={(e) => { e.target.style.borderColor = color; e.target.style.boxShadow = `0 0 0 3px ${color}20`; }}
                  onBlur={(e)  => { e.target.style.borderColor = "#E0E0E0"; e.target.style.boxShadow = ""; }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#757575] mb-1.5">
                  Phone
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-[#E0E0E0] px-4 py-2.5 text-sm focus:outline-none transition-shadow"
                  onFocus={(e) => { e.target.style.borderColor = color; e.target.style.boxShadow = `0 0 0 3px ${color}20`; }}
                  onBlur={(e)  => { e.target.style.borderColor = "#E0E0E0"; e.target.style.boxShadow = ""; }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#757575] mb-1.5">
                Email *
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#E0E0E0] px-4 py-2.5 text-sm focus:outline-none transition-shadow"
                onFocus={(e) => { e.target.style.borderColor = color; e.target.style.boxShadow = `0 0 0 3px ${color}20`; }}
                onBlur={(e)  => { e.target.style.borderColor = "#E0E0E0"; e.target.style.boxShadow = ""; }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#757575] mb-1.5">
                Message *
              </label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Tell us about the property you're looking for…"
                className="w-full rounded-xl border border-[#E0E0E0] px-4 py-2.5 text-sm focus:outline-none transition-shadow resize-none"
                onFocus={(e) => { e.target.style.borderColor = color; e.target.style.boxShadow = `0 0 0 3px ${color}20`; }}
                onBlur={(e)  => { e.target.style.borderColor = "#E0E0E0"; e.target.style.boxShadow = ""; }}
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending" || status === "sent"}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white text-sm transition-all"
              style={{ backgroundColor: color, opacity: status === "sending" ? 0.7 : 1 }}
            >
              {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
              {status === "sent"    && <CheckCircle2 className="h-4 w-4" />}
              {status === "idle"    && <Send className="h-4 w-4" />}
              {status === "idle"    ? "Send via WhatsApp" : status === "sending" ? "Sending…" : "Message Sent!"}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Contact Information</h2>
            <p className="text-[#757575] text-sm">
              Reach out directly or visit our office during business hours.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {contactItems.map(({ icon: Icon, label, value, href }) => (
              <div
                key={label}
                className="flex items-start gap-4 bg-white rounded-xl p-4 border border-[#F0F0F0] shadow-sm"
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: colorLight }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#9E9E9E] mb-0.5">
                    {label}
                  </div>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:underline"
                      style={{ color }}
                    >
                      {value}
                    </a>
                  ) : (
                    <div className="text-sm font-medium text-[#424242]">{value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Map embed */}
          {s.page_contact_map_url && (
            <div className="rounded-2xl overflow-hidden border border-[#F0F0F0] shadow-sm mt-2">
              <iframe
                src={s.page_contact_map_url}
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
