"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const PROPERTY_TYPES = [
  { id: "apartment",  label: "Apartment",  emoji: "🏢" },
  { id: "villa",      label: "Villa",       emoji: "🏡" },
  { id: "house",      label: "House",       emoji: "🏠" },
  { id: "plot",       label: "Plot",        emoji: "📐" },
  { id: "commercial", label: "Commercial",  emoji: "🏬" },
  { id: "land",       label: "Land",        emoji: "🌿" },
];

const HAS_BHK  = ["apartment", "villa", "house"];
const HAS_LAND = ["plot", "land"];

function FieldLabel({ children }) {
  return (
    <label className="block text-[12.5px] font-semibold text-[#424242] mb-1.5">
      {children}
    </label>
  );
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[14px] text-[#212121] placeholder-[#BDBDBD] focus:outline-none focus:border-[#009688] transition-colors"
    />
  );
}

function SuccessCard({ title, listingType, ownerPhone, onReset }) {
  return (
    <div className="max-w-xl mx-auto text-center py-8 px-6">
      {/* Animated check */}
      <div className="w-24 h-24 rounded-full bg-[#E0F2F1] flex items-center justify-center mx-auto mb-6 shadow-lg">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#009688" />
          <path d="M7 12l3.5 3.5L17 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h2 className="font-serif text-[32px] text-[#212121] mb-3">You&apos;re Live! 🎉</h2>
      <p className="text-[15.5px] text-[#424242] mb-2">
        <strong className="text-[#009688]">{title}</strong> is now listed on PropertyFlow.
      </p>
      <p className="text-[14px] text-[#757575] mb-8 leading-relaxed">
        Interested {listingType === "rent" ? "renters" : "buyers"} will contact you directly on{" "}
        <strong className="text-[#212121]">{ownerPhone}</strong>. Your listing appears instantly in search results.
      </p>

      <div className="bg-[#F5F7FA] rounded-2xl p-5 mb-8 text-left space-y-3">
        <p className="text-[12px] font-semibold uppercase tracking-widest text-[#9E9E9E]">What happens next</p>
        {[
          ["📱", "Buyers search on /listings and see your property"],
          ["💬", "They contact you directly on WhatsApp or phone"],
          ["🤝", "You negotiate and close the deal — no middleman"],
        ].map(([icon, text]) => (
          <div key={text} className="flex items-center gap-3 text-[13.5px] text-[#424242]">
            <span className="text-[20px]">{icon}</span>
            {text}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/listings"
          className="bg-[#009688] text-white text-[14px] font-bold px-8 py-3.5 rounded-xl hover:bg-[#00796B] transition-colors"
        >
          View Your Listing →
        </Link>
        <button
          onClick={onReset}
          className="border-2 border-[#009688] text-[#009688] text-[14px] font-semibold px-6 py-3.5 rounded-xl hover:bg-[#E0F2F1] transition-colors"
        >
          List Another Property
        </button>
      </div>
    </div>
  );
}

export default function SellPage() {
  const [listingType, setListingType] = useState("sell");
  const [step, setStep]               = useState(1); // 1 = property, 2 = contact
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [error, setError]             = useState("");
  const [files, setFiles]             = useState([]);

  const [form, setForm] = useState({
    property_type:   "apartment",
    title:           "",
    location:        "",
    price:           "",
    bhk:             "",
    land_size_cents: "",
    description:     "",
    owner_name:      "",
    owner_phone:     "",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Please enter a property title."); return; }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.owner_name.trim()) { setError("Please enter your name."); return; }
    if (!form.owner_phone.trim() || form.owner_phone.replace(/\D/g,"").length < 10) {
      setError("Please enter a valid 10-digit phone number."); return;
    }

    setSubmitting(true);

    const imageUrls = [];
    if (files.length > 0) {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `public-listings/${fileName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from("property-images")
          .upload(filePath, file);
          
        if (uploadError) {
          console.error("Upload error:", uploadError);
        }
        
        if (data) {
          const { data: pubData } = supabase.storage.from("property-images").getPublicUrl(filePath);
          if (pubData) {
            imageUrls.push(pubData.publicUrl);
          }
        }
      }
    }

    const payload = {
      listing_type:    listingType,
      property_type:   form.property_type,
      title:           form.title.trim(),
      location:        form.location.trim() || null,
      price:           form.price ? parseFloat(form.price.replace(/[^0-9.]/g, "")) : null,
      bhk:             HAS_BHK.includes(form.property_type) && form.bhk ? parseInt(form.bhk) : null,
      land_size_cents: HAS_LAND.includes(form.property_type) && form.land_size_cents ? parseFloat(form.land_size_cents) : null,
      description:     form.description.trim() || null,
      owner_name:      form.owner_name.trim(),
      owner_phone:     form.owner_phone.trim(),
      status:          "available",
      images:          imageUrls,
    };

    const { error: err } = await supabase
      .from("public_property_listings")
      .insert(payload);

    if (err) {
      setError("Failed to submit. Please try again. (" + err.message + ")");
      console.error(err);
      setSubmitting(false);
    } else {
      // ── Fire n8n webhook via server-side proxy (avoids CORS + hides n8n URL) ─
      fetch("/api/n8n-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // ── Property details ──────────────────────────────────────────────
          listing_type:    payload.listing_type,
          property_type:   payload.property_type,
          title:           payload.title,
          location:        payload.location,
          price:           payload.price,
          bhk:             payload.bhk,
          land_size_cents: payload.land_size_cents,
          description:     payload.description,
          // ── Owner / contact ───────────────────────────────────────────────
          owner_name:      payload.owner_name,
          owner_phone:     payload.owner_phone,
          // ── Media & meta ──────────────────────────────────────────────────
          images:          payload.images,
          status:          payload.status,
          submitted_at:    new Date().toISOString(),
          source:          "exploringrealestate.vercel.app/sell",
        }),
      }).catch((webhookErr) =>
        console.warn("n8n proxy call failed (non-fatal):", webhookErr)
      );
      // ─────────────────────────────────────────────────────────────────────────

      setSubmitted(true);
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setStep(1);
    setError("");
    setFiles([]);
    setForm({ property_type:"apartment", title:"", location:"", price:"", bhk:"", land_size_cents:"", description:"", owner_name:"", owner_phone:"" });
  };

  // ── Progress indicator ──────────────────────────────────────────────────────
  const Progress = () => (
    <div className="flex items-center gap-0 mb-6">
      {[{ n: 1, label: "Property Details" }, { n: 2, label: "Contact Info" }].map((s, i) => (
        <div key={s.n} className="flex items-center flex-1">
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors"
              style={{ backgroundColor: step >= s.n ? "#009688" : "#E0E0E0", color: step >= s.n ? "white" : "#9E9E9E" }}
            >
              {step > s.n ? "✓" : s.n}
            </div>
            <span className="hidden sm:block text-[12px] font-medium" style={{ color: step >= s.n ? "#009688" : "#9E9E9E" }}>
              {s.label}
            </span>
          </div>
          {i === 0 && (
            <div className="flex-1 h-0.5 mx-3" style={{ backgroundColor: step > 1 ? "#009688" : "#E0E0E0" }} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative bg-[#009688]" style={{ minHeight: 200 }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-bg.png')", opacity: 0.12 }}
        />
        <div className="relative max-w-[1280px] mx-auto px-6 md:px-8 py-12 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-[12.5px] font-semibold mb-4 text-white/90">
            🆓 100% Free · No Registration Required
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-3">
            List Your Property for Free
          </h1>
          <p className="text-[15.5px] text-white/80 max-w-lg mx-auto">
            Reach thousands of genuine buyers and renters across Kerala. Your property goes live instantly.
          </p>
          {/* Steps preview */}
          <div className="flex items-center justify-center gap-2 mt-5 text-[13px] text-white/70 flex-wrap">
            {["Fill Property Details", "→", "Add Contact Info", "→", "Instant Live Listing", "→", "Buyers Contact You"].map((s, i) => (
              <span key={i} className={s === "→" ? "text-white/30" : "font-medium text-white/85"}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM ──────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 py-10">
        {submitted ? (
          <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,150,136,0.12)] border border-[#EEEEEE] overflow-hidden">
            <div className="bg-[#009688] py-3 px-5 text-white text-[13px] font-semibold text-center">
              🎉 Property Listed Successfully!
            </div>
            <SuccessCard
              title={form.title}
              listingType={listingType}
              ownerPhone={form.owner_phone}
              onReset={handleReset}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,150,136,0.12)] border border-[#EEEEEE] overflow-hidden">

            {/* Listing type tabs */}
            <div className="flex border-b border-[#EEEEEE]">
              {[
                { id: "sell", label: "🏷 I Want to Sell" },
                { id: "rent", label: "🔑 I Want to Rent Out" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setListingType(t.id)}
                  className="flex-1 py-4 text-[14.5px] font-semibold transition-colors"
                  style={{
                    backgroundColor: listingType === t.id ? "#009688" : "white",
                    color: listingType === t.id ? "white" : "#757575",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-6 md:p-8">
              <Progress />

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13.5px] text-red-700 flex items-center gap-2">
                  <span>⚠</span> {error}
                </div>
              )}

              {/* ── STEP 1: Property Details ─────────────────────────────── */}
              {step === 1 && (
                <form onSubmit={handleStep1} className="space-y-5">
                  <p className="text-[12px] font-bold uppercase tracking-widest text-[#009688]">
                    Step 1 — Property Details
                  </p>

                  {/* Property type selector */}
                  <div>
                    <FieldLabel>Property Type</FieldLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {PROPERTY_TYPES.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => set("property_type", t.id)}
                          className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-[13px] font-medium border-2 transition-all"
                          style={{
                            borderColor: form.property_type === t.id ? "#009688" : "#E0E0E0",
                            backgroundColor: form.property_type === t.id ? "#E0F2F1" : "white",
                            color: form.property_type === t.id ? "#009688" : "#616161",
                          }}
                        >
                          <span>{t.emoji}</span> {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <FieldLabel>Property Title *</FieldLabel>
                    <Input
                      required
                      value={form.title}
                      onChange={(e) => set("title", e.target.value)}
                      placeholder={
                        form.property_type === "plot" ? "e.g. 10 cent plot near NH bypass, Kakkanad"
                        : form.property_type === "villa" ? "e.g. Luxury 4BHK villa with pool, Thrissur"
                        : "e.g. Spacious 3BHK apartment in prime location"
                      }
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <FieldLabel>Location / Area</FieldLabel>
                    <div className="relative">
                      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#BDBDBD]" width="14" height="16" viewBox="0 0 12 14" fill="none">
                        <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" fill="currentColor"/>
                        <circle cx="6" cy="5" r="1.5" fill="white"/>
                      </svg>
                      <input
                        value={form.location}
                        onChange={(e) => set("location", e.target.value)}
                        placeholder="e.g. Kakkanad, Ernakulam"
                        className="w-full border border-[#E0E0E0] rounded-xl pl-9 pr-4 py-2.5 text-[14px] text-[#212121] placeholder-[#BDBDBD] focus:outline-none focus:border-[#009688] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <FieldLabel>
                      {listingType === "rent" ? "Monthly Rent (₹)" : "Asking Price (₹)"}
                    </FieldLabel>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9E9E] font-semibold text-[15px]">₹</span>
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => set("price", e.target.value)}
                        placeholder={listingType === "rent" ? "15000" : "4500000"}
                        className="w-full border border-[#E0E0E0] rounded-xl pl-8 pr-4 py-2.5 text-[14px] text-[#212121] placeholder-[#BDBDBD] focus:outline-none focus:border-[#009688] transition-colors"
                      />
                    </div>
                    <p className="text-[11.5px] text-[#9E9E9E] mt-1">
                      {listingType === "rent" ? "e.g. ₹15,000/month" : "e.g. ₹45,00,000 for a plot"}
                    </p>
                  </div>

                  {/* BHK — only for residential */}
                  {HAS_BHK.includes(form.property_type) && (
                    <div>
                      <FieldLabel>BHK</FieldLabel>
                      <div className="flex gap-2 flex-wrap">
                        {[1, 2, 3, 4, 5, "6+"].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => set("bhk", n.toString())}
                            className="w-14 h-12 rounded-xl text-[14px] font-semibold border-2 transition-all"
                            style={{
                              borderColor: form.bhk === n.toString() ? "#009688" : "#E0E0E0",
                              backgroundColor: form.bhk === n.toString() ? "#009688" : "white",
                              color: form.bhk === n.toString() ? "white" : "#616161",
                            }}
                          >
                            {n}
                          </button>
                        ))}
                        <span className="self-center text-[13px] text-[#9E9E9E]">BHK</span>
                      </div>
                    </div>
                  )}

                  {/* Land size — only for plots/land */}
                  {HAS_LAND.includes(form.property_type) && (
                    <div>
                      <FieldLabel>Land Size</FieldLabel>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={form.land_size_cents}
                          onChange={(e) => set("land_size_cents", e.target.value)}
                          placeholder="e.g. 10"
                          className="w-36 border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[14px] text-[#212121] placeholder-[#BDBDBD] focus:outline-none focus:border-[#009688] transition-colors"
                        />
                        <span className="text-[14px] text-[#9E9E9E]">cents</span>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <FieldLabel>Description (optional)</FieldLabel>
                    <textarea
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Describe your property — key features, nearby landmarks, road access, amenities, condition…"
                      rows={3}
                      className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[14px] text-[#212121] placeholder-[#BDBDBD] focus:outline-none focus:border-[#009688] transition-colors resize-none"
                    />
                  </div>

                  {/* Photos */}
                  <div>
                    <FieldLabel>Property Photos (optional)</FieldLabel>
                    <div className="border-2 border-dashed border-[#E0E0E0] rounded-xl p-4 text-center hover:border-[#009688] transition-colors cursor-pointer relative bg-[#FAFAFA]">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center gap-2 pointer-events-none">
                        <span className="text-[24px]">📷</span>
                        <p className="text-[13px] text-[#616161] font-medium">Click or drag photos here</p>
                        <p className="text-[11px] text-[#9E9E9E]">Upload up to 5 images (max 10MB each)</p>
                      </div>
                    </div>
                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {files.map((file, idx) => (
                          <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#E0E0E0]">
                            <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-[10px] hover:bg-red-600 rounded-bl-lg"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#009688] hover:bg-[#00796B] text-white text-[15px] font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Continue to Contact Info →
                  </button>
                </form>
              )}

              {/* ── STEP 2: Contact Info ─────────────────────────────── */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <p className="text-[12px] font-bold uppercase tracking-widest text-[#009688]">
                    Step 2 — Your Contact Information
                  </p>

                  {/* Summary of step 1 */}
                  <div className="bg-[#F5FFFE] border border-[#B2DFDB] rounded-xl p-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#009688] mb-2">Your Property</p>
                    <p className="text-[14px] font-semibold text-[#212121]">{form.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-[12.5px] text-[#757575]">
                      {form.location && <span>📍 {form.location}</span>}
                      {form.price && <span>💰 ₹{parseFloat(form.price).toLocaleString("en-IN")}</span>}
                      {form.bhk && <span>🛏 {form.bhk} BHK</span>}
                      {form.land_size_cents && <span>📐 {form.land_size_cents} cents</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setStep(1); setError(""); }}
                      className="text-[12px] text-[#009688] font-semibold mt-2 underline hover:text-[#00796B]"
                    >
                      Edit details
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Your Full Name *</FieldLabel>
                      <Input
                        required
                        value={form.owner_name}
                        onChange={(e) => set("owner_name", e.target.value)}
                        placeholder="Rajan Kumar"
                      />
                    </div>
                    <div>
                      <FieldLabel>Phone Number *</FieldLabel>
                      <div className="flex">
                        <span className="border border-r-0 border-[#E0E0E0] rounded-l-xl px-3 flex items-center text-[14px] text-[#9E9E9E] bg-[#FAFAFA] shrink-0">
                          +91
                        </span>
                        <input
                          required
                          type="tel"
                          value={form.owner_phone}
                          onChange={(e) => set("owner_phone", e.target.value)}
                          placeholder="98765 43210"
                          maxLength={10}
                          className="flex-1 border border-[#E0E0E0] rounded-r-xl px-4 py-2.5 text-[14px] text-[#212121] placeholder-[#BDBDBD] focus:outline-none focus:border-[#009688] transition-colors"
                        />
                      </div>
                      <p className="text-[11.5px] text-[#9E9E9E] mt-1">Buyers will contact you on this number</p>
                    </div>
                  </div>

                  {/* Consent */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" required className="mt-0.5 w-4 h-4 accent-[#009688]" />
                    <span className="text-[13px] text-[#616161] leading-snug">
                      I agree to be contacted by interested buyers/renters through PropertyFlow. My contact details will be visible on the listing.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#009688] hover:bg-[#00796B] disabled:opacity-60 text-white text-[15px] font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Listing your property…
                      </>
                    ) : (
                      "🚀 List My Property for Free"
                    )}
                  </button>

                  <p className="text-center text-[12px] text-[#9E9E9E]">
                    Free listing · No registration required · Appears instantly in search
                  </p>
                </form>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── WHY LIST WITH US ─────────────────────────────────────────── */}
      {!submitted && (
        <section className="max-w-[1280px] mx-auto px-6 md:px-8 pb-12">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { emoji: "⚡", color: "#FFF8E1", title: "Instant Listing", desc: "Your property goes live immediately. No approval delays, no waiting period." },
              { emoji: "📱", color: "#E3F2FD", title: "Direct Buyer Contact", desc: "Buyers contact you directly via WhatsApp or phone. No middleman, no commission." },
              { emoji: "🆓", color: "#E8F5E9", title: "Completely Free Forever", desc: "No listing fee, no renewal charge, no commission on your sale or rent." },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl p-5 shadow-sm border border-[#EEEEEE] flex gap-4 items-start hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[28px] shrink-0" style={{ backgroundColor: item.color }}>
                  {item.emoji}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#212121] mb-1">{item.title}</h3>
                  <p className="text-[13.5px] text-[#757575] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
