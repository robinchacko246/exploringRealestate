"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Settings,
  Phone,
  User,
  Save,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Palette,
  Type,
  Mail,
  MessageSquare,
  Link2,
  Image,
  Clock,
  Bell,
  Building2,
  ExternalLink,
  FileText,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

// ── Constants ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "contact",       label: "Contact",       icon: Phone      },
  { id: "branding",      label: "Branding",      icon: Palette    },
  { id: "header_nav",    label: "Header Nav",    icon: Link2      },
  { id: "footer",        label: "Footer",        icon: Link2      },
  { id: "listings",      label: "Listings",      icon: Building2  },
  { id: "notifications", label: "Notifications", icon: Bell       },
  { id: "pages",         label: "Pages",         icon: Globe      },
];

const DEFAULTS = {
  admin_contact_phone:      "+918138802204",
  admin_contact_name:       "PropertyFlow Desk",
  brand_name:               "PropertyFlow",
  brand_tagline:            "Kerala's #1 Property Platform",
  brand_color:              "#009688",
  brand_email:              "hello@propertyflow.in",
  brand_whatsapp:           "+918138802204",
  header_link_1_label:      "Buy",
  header_link_1_url:        "/listings",
  header_link_2_label:      "Apartments",
  header_link_2_url:        "/listings?type=apartment",
  header_link_3_label:      "Villas",
  header_link_3_url:        "/listings?type=villa",
  header_link_4_label:      "Plots",
  header_link_4_url:        "/listings?type=plot",
  header_link_5_label:      "Commercial",
  header_link_5_url:        "/listings?type=commercial",
  header_link_6_label:      "",
  header_link_6_url:        "",
  footer_copyright:         "© 2026 PropertyFlow CRM. All rights reserved.",
  footer_tagline:           "Made with ❤ in Kerala · Built for Indian realtors",
  footer_link_1_label:      "Browse Listings",
  footer_link_1_url:        "/listings",
  footer_link_2_label:      "List Your Property",
  footer_link_2_url:        "/sell",
  footer_link_3_label:      "For Agents",
  footer_link_3_url:        "/agentscrm",
  footer_link_4_label:      "Privacy Policy",
  footer_link_4_url:        "/privacy",
  max_images_per_listing:   "10",
  auto_approve_listings:    "false",
  listing_expiry_days:      "60",
  require_price:            "false",
  admin_notification_email: "",
  notify_on_new_submission: "true",
  notify_on_enquiry:        "true",
  // ── Pages ───────────────────────────────────────────────────────────────────
  page_about_title:         "About Us",
  page_about_subtitle:      "Building Kerala's most trusted real estate platform",
  page_about_story:         "Founded in 2020, PropertyFlow has helped thousands of families find their dream homes across Kerala.",
  page_about_mission:       "To make property transactions transparent, efficient, and stress-free for every family in Kerala.",
  page_about_vision:        "A Kerala where every family finds their dream home with ease and confidence.",
  page_about_stat_1_label:  "Founded",        page_about_stat_1_value: "2020",
  page_about_stat_2_label:  "Properties Sold",page_about_stat_2_value: "2,500+",
  page_about_stat_3_label:  "Happy Clients",  page_about_stat_3_value: "1,800+",
  page_about_stat_4_label:  "Cities Covered", page_about_stat_4_value: "15+",
  page_about_team_1_name:   "Robin Chacko",   page_about_team_1_role: "Founder & CEO",       page_about_team_1_bio: "15 years in Kerala real estate.",
  page_about_team_2_name:   "Priya Menon",    page_about_team_2_role: "Head of Sales",       page_about_team_2_bio: "Expert in residential properties across Kochi and Thrissur.",
  page_about_team_3_name:   "Arjun Nair",     page_about_team_3_role: "Lead Agent",          page_about_team_3_bio: "Specializes in commercial and investment properties.",
  page_services_title:      "Our Services",
  page_services_subtitle:   "Everything you need for a seamless property journey",
  page_services_1_title: "Buy a Property",    page_services_1_desc: "Browse thousands of verified listings.",    page_services_1_icon: "home",   page_services_1_url: "/listings",
  page_services_2_title: "Sell / Rent",        page_services_2_desc: "List your property and reach buyers.",      page_services_2_icon: "tag",    page_services_2_url: "/sell",
  page_services_3_title: "Property Valuation", page_services_3_desc: "Get an accurate market value estimate.",    page_services_3_icon: "chart",  page_services_3_url: "/contact",
  page_services_4_title: "Legal Assistance",   page_services_4_desc: "End-to-end legal support for transactions.",page_services_4_icon: "shield", page_services_4_url: "/contact",
  page_services_5_title: "Home Loans",         page_services_5_desc: "Pre-approved loans from top banks.",        page_services_5_icon: "bank",   page_services_5_url: "/contact",
  page_services_6_title: "Interior Design",    page_services_6_desc: "Transform your home with expert designers.",page_services_6_icon: "palette",page_services_6_url: "/contact",
  page_contact_title:    "Contact Us",
  page_contact_subtitle: "We're here to help you find your dream property",
  page_contact_address:  "123 MG Road, Kochi, Kerala 682011",
  page_contact_hours:    "Mon–Sat: 9am–6pm IST",
  page_contact_map_url:  "",
  page_faq_title:    "Frequently Asked Questions",
  page_faq_subtitle: "Got questions? We have answers.",
  page_faq_1_q: "How do I list my property?",             page_faq_1_a: "Visit our Sell page, fill in details, and submit. We publish within 24 hours.",
  page_faq_2_q: "Is it free to browse listings?",         page_faq_2_a: "Yes! Browsing all listings is completely free. No registration required.",
  page_faq_3_q: "How do I contact a property owner?",     page_faq_3_a: "Each listing has a WhatsApp and call button to connect instantly.",
  page_faq_4_q: "Are the listings verified?",             page_faq_4_a: "All listings go through our verification process before going live.",
  page_faq_5_q: "How long to publish my listing?",        page_faq_5_a: "Listings are reviewed and published within 24 hours on business days.",
  page_faq_6_q: "Can I edit my listing?",                 page_faq_6_a: "Yes. Use the Track Status page with your submission ID to request edits.",
  page_faq_7_q: "What areas do you cover?",               page_faq_7_a: "All major cities and districts in Kerala including Kochi, Trivandrum, Calicut, Thrissur.",
  page_faq_8_q: "How do I get a valuation?",              page_faq_8_a: "Contact us via WhatsApp with property details. Free estimate within 48 hours.",
  page_testimonials_title:    "What Our Clients Say",
  page_testimonials_subtitle: "Real stories from families and investors",
  page_testimonials_1_name: "Anand Jose",    page_testimonials_1_role: "Broker, Kochi",              page_testimonials_1_text: "I stopped losing leads in WhatsApp the day I switched to PropertyFlow.",          page_testimonials_1_rating: "5",
  page_testimonials_2_name: "Meena Krishnan",page_testimonials_2_role: "Homebuyer, Thrissur",         page_testimonials_2_text: "Found my dream 3BHK apartment within 2 weeks! Highly recommend.",                page_testimonials_2_rating: "5",
  page_testimonials_3_name: "Suresh Pillai", page_testimonials_3_role: "Investor, Trivandrum",        page_testimonials_3_text: "Sold my commercial property in a month at a great price.",                       page_testimonials_3_rating: "5",
  page_testimonials_4_name: "Divya Thomas",  page_testimonials_4_role: "Villa Owner, Kochi",          page_testimonials_4_text: "Listed my villa in the morning and got 5 enquiries by evening.",                page_testimonials_4_rating: "5",
  page_testimonials_5_name: "Rahul Varma",   page_testimonials_5_role: "NRI Buyer, Dubai",             page_testimonials_5_text: "As an NRI, PropertyFlow made finding trustworthy listings so easy.",             page_testimonials_5_rating: "5",
  page_testimonials_6_name: "Lakshmi Nair",  page_testimonials_6_role: "Plot Buyer, Calicut",         page_testimonials_6_text: "The site is clean, listings are real, and support was excellent.",                page_testimonials_6_rating: "5",
  page_privacy_title:   "Privacy Policy",
  page_privacy_updated: "September 2026",
  page_privacy_content: "**Information We Collect**\nWe collect your name, email, phone, and property details when you submit a listing or enquiry.\n\n**How We Use Your Information**\nWe use it to connect buyers with sellers, send submission updates, and improve our services.\n\n**Data Security**\nWe use SSL encryption and industry-standard security to protect your data. We never sell your information.\n\n**Contact**\nFor privacy queries, contact us via our Contact page.",
};

// ── Shared UI primitives ──────────────────────────────────────────────────────
function SectionCard({ children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 border-b border-border pb-4">
      <Icon className="h-4 w-4 text-amber-500 shrink-0" />
      <h2 className="font-semibold text-sm">{children}</h2>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function TextInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      )}
      <input
        {...props}
        className={`w-full rounded-xl border border-border bg-background ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow`}
      />
    </div>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 px-4 py-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-amber-500" : "bg-border"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function SaveBar({ dirty, isPending, onSave }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
      {!dirty && !isPending && (
        <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="h-4 w-4" /> Saved
        </span>
      )}
      <button
        type="button"
        onClick={onSave}
        disabled={!dirty || isPending}
        className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40 transition-colors shadow-sm"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save Changes
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("contact");

  // All settings in one flat state object, initialised with defaults
  const [s, setS] = useState(DEFAULTS);
  const [dirty, setDirty] = useState({
    contact: false, branding: false, header_nav: false, footer: false,
    listings: false, notifications: false,
    pages_about: false, pages_services: false, pages_contact: false,
    pages_faq: false, pages_testimonials: false, pages_privacy: false,
  });
  const [pagesSubTab, setPagesSubTab] = useState("about");

  // ── Fetch from DB ──────────────────────────────────────────────────────────
  const { data: dbSettings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("key, value");
      if (error) throw error;
      const map = {};
      (data ?? []).forEach((row) => { map[row.key] = row.value; });
      return map;
    },
  });

  // Populate state when DB data arrives (works with React Query v4 AND v5)
  useEffect(() => {
    if (dbSettings) {
      setS((prev) => ({ ...prev, ...dbSettings }));
      setDirty({
        contact: false, branding: false, header_nav: false, footer: false,
        listings: false, notifications: false,
        pages_about: false, pages_services: false, pages_contact: false,
        pages_faq: false, pages_testimonials: false, pages_privacy: false,
      });
    }
  }, [dbSettings]);

  // ── Update helpers ─────────────────────────────────────────────────────────
  const update = (key, val, tab) => {
    setS((prev) => ({ ...prev, [key]: val }));
    setDirty((d) => ({ ...d, [tab]: true }));
  };
  const bool = (key) => s[key] === "true";

  // ── Upsert helper ──────────────────────────────────────────────────────────
  const upsertKeys = async (keys) => {
    const results = await Promise.all(
      keys.map((key) =>
        supabase
          .from("admin_settings")
          .upsert(
            { key, value: s[key] ?? "", updated_at: new Date().toISOString() },
            { onConflict: "key" }
          )
      )
    );
    const err = results.find((r) => r.error)?.error;
    if (err) throw err;
  };

  // ── Mutations (each called at top level — no hooks-in-functions) ───────────
  const contactMut = useMutation({
    mutationFn: () => upsertKeys(["admin_contact_phone", "admin_contact_name"]),
    onSuccess: () => {
      toast.success("Contact settings saved!");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setDirty((d) => ({ ...d, contact: false }));
    },
    onError: (err) => toast.error(`Failed to save: ${err.message}`),
  });

  const brandingMut = useMutation({
    mutationFn: () => upsertKeys(["brand_name", "brand_tagline", "brand_color", "brand_email", "brand_whatsapp"]),
    onSuccess: () => {
      toast.success("Branding settings saved!");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setDirty((d) => ({ ...d, branding: false }));
    },
    onError: (err) => toast.error(`Failed to save: ${err.message}`),
  });

  const headerNavMut = useMutation({
    mutationFn: () => upsertKeys([
      "header_link_1_label", "header_link_1_url",
      "header_link_2_label", "header_link_2_url",
      "header_link_3_label", "header_link_3_url",
      "header_link_4_label", "header_link_4_url",
      "header_link_5_label", "header_link_5_url",
      "header_link_6_label", "header_link_6_url",
    ]),
    onSuccess: () => {
      toast.success("Header Navigation settings saved!");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setDirty((d) => ({ ...d, header_nav: false }));
    },
    onError: (err) => toast.error(`Failed to save: ${err.message}`),
  });

  const footerMut = useMutation({
    mutationFn: () => upsertKeys([
      "footer_copyright", "footer_tagline",
      "footer_link_1_label", "footer_link_1_url",
      "footer_link_2_label", "footer_link_2_url",
      "footer_link_3_label", "footer_link_3_url",
      "footer_link_4_label", "footer_link_4_url",
    ]),
    onSuccess: () => {
      toast.success("Footer settings saved!");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setDirty((d) => ({ ...d, footer: false }));
    },
    onError: (err) => toast.error(`Failed to save: ${err.message}`),
  });

  const listingsMut = useMutation({
    mutationFn: () => upsertKeys([
      "max_images_per_listing", "auto_approve_listings",
      "listing_expiry_days", "require_price",
    ]),
    onSuccess: () => {
      toast.success("Listing rules saved!");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setDirty((d) => ({ ...d, listings: false }));
    },
    onError: (err) => toast.error(`Failed to save: ${err.message}`),
  });

  const notifMut = useMutation({
    mutationFn: () => upsertKeys([
      "admin_notification_email",
      "notify_on_new_submission",
      "notify_on_enquiry",
    ]),
    onSuccess: () => {
      toast.success("Notification settings saved!");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setDirty((d) => ({ ...d, notifications: false }));
    },
    onError: (err) => toast.error(`Failed to save: ${err.message}`),
  });

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Admin Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure contact routing, branding, footer, listing rules, and notifications.
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/30 p-1 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === id
                ? "bg-card shadow-sm text-amber-600 dark:text-amber-400 border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {dirty[id] && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 ml-0.5 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* ── CONTACT TAB ─────────────────────────────────────────────────────── */}
      {activeTab === "contact" && (
        <SectionCard>
          <SectionTitle icon={Phone}>Public Contact Routing</SectionTitle>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            <ShieldCheck className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            These details replace the owner&apos;s phone on all public listings where{" "}
            <strong>Hide Owner Contact</strong> is enabled.
          </div>

          <Field label="Admin Contact Phone" hint="Include country code, e.g. +918138802204">
            <TextInput
              icon={Phone}
              type="tel"
              value={s.admin_contact_phone}
              onChange={(e) => update("admin_contact_phone", e.target.value, "contact")}
              placeholder="+918138802204"
            />
          </Field>

          <Field label="Admin Contact Display Name" hint="Shown to buyers as the contact name on public listings.">
            <TextInput
              icon={User}
              type="text"
              value={s.admin_contact_name}
              onChange={(e) => update("admin_contact_name", e.target.value, "contact")}
              placeholder="PropertyFlow Desk"
            />
          </Field>

          {/* Live preview */}
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 flex items-center gap-3">
            <div
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-bold text-sm text-white"
              style={{ backgroundColor: s.brand_color || "#009688" }}
            >
              {(s.admin_contact_name || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold">{s.admin_contact_name || "PropertyFlow Desk"}</div>
              <div className="text-xs text-muted-foreground font-mono">{s.admin_contact_phone || "+918138802204"}</div>
            </div>
          </div>

          <SaveBar dirty={dirty.contact} isPending={contactMut.isPending} onSave={() => contactMut.mutate()} />
        </SectionCard>
      )}

      {/* ── BRANDING TAB ────────────────────────────────────────────────────── */}
      {activeTab === "branding" && (
        <SectionCard>
          <SectionTitle icon={Palette}>Brand & Appearance</SectionTitle>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Business Name" hint="Shown in header, footer, and emails.">
              <TextInput
                icon={Building2}
                type="text"
                value={s.brand_name}
                onChange={(e) => update("brand_name", e.target.value, "branding")}
                placeholder="PropertyFlow"
              />
            </Field>

            <Field label="Business Tagline" hint="Short tagline shown in footer and hero sections.">
              <TextInput
                icon={Type}
                type="text"
                value={s.brand_tagline}
                onChange={(e) => update("brand_tagline", e.target.value, "branding")}
                placeholder="Kerala's #1 Property Platform"
              />
            </Field>

            <Field label="Business Email" hint="Contact email shown publicly.">
              <TextInput
                icon={Mail}
                type="email"
                value={s.brand_email}
                onChange={(e) => update("brand_email", e.target.value, "branding")}
                placeholder="hello@propertyflow.in"
              />
            </Field>

            <Field label="WhatsApp Business Number" hint="Used for the public WhatsApp chat button.">
              <TextInput
                icon={MessageSquare}
                type="tel"
                value={s.brand_whatsapp}
                onChange={(e) => update("brand_whatsapp", e.target.value, "branding")}
                placeholder="+918138802204"
              />
            </Field>
          </div>

          <Field
            label="Brand / Accent Color"
            hint="Primary color used across public-facing pages (/listings, /sell, /status)."
          >
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="color"
                value={s.brand_color}
                onChange={(e) => update("brand_color", e.target.value, "branding")}
                className="h-10 w-14 cursor-pointer rounded-xl border border-border bg-background p-1"
              />
              <div className="w-32">
                <TextInput
                  type="text"
                  value={s.brand_color}
                  onChange={(e) => update("brand_color", e.target.value, "branding")}
                  placeholder="#009688"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["#009688","#2196F3","#9C27B0","#FF5722","#FF9800","#4CAF50"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => update("brand_color", c, "branding")}
                    title={c}
                    className="h-7 w-7 rounded-lg border-2 transition-transform hover:scale-110 shrink-0"
                    style={{
                      backgroundColor: c,
                      borderColor: s.brand_color === c ? "#1e293b" : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
          </Field>

          {/* Color preview */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div
              className="px-4 py-3 text-white text-sm font-semibold flex items-center gap-2"
              style={{ backgroundColor: s.brand_color }}
            >
              <Building2 className="h-4 w-4" />
              {s.brand_name || "PropertyFlow"} — {s.brand_tagline || "Kerala's #1 Property Platform"}
            </div>
            <div className="px-4 py-2 bg-muted/20 text-xs text-muted-foreground">
              ↑ Preview of brand color on header bars
            </div>
          </div>

          <SaveBar dirty={dirty.branding} isPending={brandingMut.isPending} onSave={() => brandingMut.mutate()} />
        </SectionCard>
      )}

      {/* ── HEADER NAV TAB ─────────────────────────────────────────────────── */}
      {activeTab === "header_nav" && (
        <SectionCard>
          <SectionTitle icon={Link2}>Header Navigation Links</SectionTitle>

          <p className="text-xs text-muted-foreground">
            Customize the main navigation menu links displayed in the top header on public pages.
          </p>

          <div className="space-y-4 pt-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-border bg-muted/20">
                <Field label={`Nav Item ${n} Label`}>
                  <TextInput
                    type="text"
                    value={s[`header_link_${n}_label`]}
                    onChange={(e) => update(`header_link_${n}_label`, e.target.value, "header_nav")}
                    placeholder={["Buy", "Apartments", "Villas", "Plots", "Commercial", "Houses"][n-1] || "Label"}
                  />
                </Field>
                <Field label={`Nav Item ${n} URL`}>
                  <TextInput
                    icon={ExternalLink}
                    type="text"
                    value={s[`header_link_${n}_url`]}
                    onChange={(e) => update(`header_link_${n}_url`, e.target.value, "header_nav")}
                    placeholder={["/listings", "/listings?type=apartment", "/listings?type=villa", "/listings?type=plot", "/listings?type=commercial", "/listings?type=house"][n-1] || "/listings"}
                  />
                </Field>
              </div>
            ))}
          </div>

          {/* Header Preview */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-border">
              <span className="text-sm font-bold" style={{ color: s.brand_color || "#009688" }}>
                {s.brand_name || "PropertyFlow"}
              </span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((n) =>
                  s[`header_link_${n}_label`] ? (
                    <span key={n} className="text-xs font-medium px-2 py-1 rounded text-[#424242]">
                      {s[`header_link_${n}_label`]}
                    </span>
                  ) : null
                )}
              </div>
            </div>
            <div className="px-4 py-2 bg-muted/20 text-xs text-muted-foreground">↑ Header navigation preview</div>
          </div>

          <SaveBar dirty={dirty.header_nav} isPending={headerNavMut.isPending} onSave={() => headerNavMut.mutate()} />
        </SectionCard>
      )}

      {/* ── FOOTER TAB ──────────────────────────────────────────────────────── */}
      {activeTab === "footer" && (
        <SectionCard>
          <SectionTitle icon={Link2}>Public Footer</SectionTitle>

          <Field label="Copyright Text" hint="Shown at the bottom of every public page.">
            <TextInput
              type="text"
              value={s.footer_copyright}
              onChange={(e) => update("footer_copyright", e.target.value, "footer")}
              placeholder="© 2026 PropertyFlow CRM. All rights reserved."
            />
          </Field>

          <Field label="Footer Tagline" hint="Secondary line below copyright.">
            <TextInput
              type="text"
              value={s.footer_tagline}
              onChange={(e) => update("footer_tagline", e.target.value, "footer")}
              placeholder="Made with ❤ in Kerala · Built for Indian realtors"
            />
          </Field>

          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Footer Links (up to 4)
            </p>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="grid grid-cols-2 gap-3">
                <Field label={`Link ${n} Label`}>
                  <TextInput
                    type="text"
                    value={s[`footer_link_${n}_label`]}
                    onChange={(e) => update(`footer_link_${n}_label`, e.target.value, "footer")}
                    placeholder={["Browse Listings","List Property","For Agents","Privacy Policy"][n-1]}
                  />
                </Field>
                <Field label={`Link ${n} URL`}>
                  <TextInput
                    icon={ExternalLink}
                    type="text"
                    value={s[`footer_link_${n}_url`]}
                    onChange={(e) => update(`footer_link_${n}_url`, e.target.value, "footer")}
                    placeholder={["/listings","/sell","/agentscrm","/privacy"][n-1]}
                  />
                </Field>
              </div>
            ))}
          </div>

          {/* Footer preview */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-[#1A1A2E] text-white px-5 py-4">
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-[#BDBDBD] mb-3">
                {[1,2,3,4].map((n) =>
                  s[`footer_link_${n}_label`] ? (
                    <span key={n} className="hover:text-white cursor-pointer">
                      {s[`footer_link_${n}_label`]}
                    </span>
                  ) : null
                )}
              </div>
              <div className="border-t border-[#2C2C44] pt-3 text-[11px] text-[#757575] space-y-0.5">
                <div>{s.footer_copyright}</div>
                <div>{s.footer_tagline}</div>
              </div>
            </div>
            <div className="px-4 py-2 bg-muted/20 text-xs text-muted-foreground">↑ Footer preview</div>
          </div>

          <SaveBar dirty={dirty.footer} isPending={footerMut.isPending} onSave={() => footerMut.mutate()} />
        </SectionCard>
      )}

      {/* ── LISTINGS TAB ────────────────────────────────────────────────────── */}
      {activeTab === "listings" && (
        <SectionCard>
          <SectionTitle icon={Building2}>Listing Rules</SectionTitle>

          <Toggle
            checked={bool("auto_approve_listings")}
            onChange={(v) => update("auto_approve_listings", String(v), "listings")}
            label="Auto-Approve New Submissions"
            description="Listings go live immediately without admin review. Not recommended."
          />

          <Toggle
            checked={bool("require_price")}
            onChange={(v) => update("require_price", String(v), "listings")}
            label="Require Price on Submission"
            description="Sellers must enter a price before submitting their listing."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Max Images per Listing"
              hint="Maximum photos an owner can upload per listing."
            >
              <TextInput
                icon={Image}
                type="number"
                min="1"
                max="30"
                value={s.max_images_per_listing}
                onChange={(e) => update("max_images_per_listing", e.target.value, "listings")}
                placeholder="10"
              />
            </Field>

            <Field
              label="Listing Expiry (days)"
              hint="Days before a live listing is auto-archived. Set 0 to never expire."
            >
              <TextInput
                icon={Clock}
                type="number"
                min="0"
                value={s.listing_expiry_days}
                onChange={(e) => update("listing_expiry_days", e.target.value, "listings")}
                placeholder="60"
              />
            </Field>
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground text-sm mb-1">Current Rule Summary</p>
            <p>• Max <strong>{s.max_images_per_listing || "10"}</strong> photos per listing</p>
            <p>• Listings {bool("auto_approve_listings")
              ? <strong className="text-emerald-600">auto-approve instantly</strong>
              : "require admin approval"}
            </p>
            <p>• Expire after <strong>{s.listing_expiry_days === "0" || !s.listing_expiry_days ? "never" : `${s.listing_expiry_days} days`}</strong></p>
            <p>• Price is <strong>{bool("require_price") ? "required" : "optional"}</strong></p>
          </div>

          <SaveBar dirty={dirty.listings} isPending={listingsMut.isPending} onSave={() => listingsMut.mutate()} />
        </SectionCard>
      )}

      {/* ── NOTIFICATIONS TAB ───────────────────────────────────────────────── */}
      {activeTab === "notifications" && (
        <SectionCard>
          <SectionTitle icon={Bell}>Notifications</SectionTitle>

          <Field
            label="Admin Notification Email"
            hint="Receives alerts for new submissions and buyer enquiries."
          >
            <TextInput
              icon={Mail}
              type="email"
              value={s.admin_notification_email}
              onChange={(e) => update("admin_notification_email", e.target.value, "notifications")}
              placeholder="admin@propertyflow.in"
            />
          </Field>

          <Toggle
            checked={bool("notify_on_new_submission")}
            onChange={(v) => update("notify_on_new_submission", String(v), "notifications")}
            label="Notify on New Listing Submission"
            description="Alert when a property is submitted via the /sell page."
          />

          <Toggle
            checked={bool("notify_on_enquiry")}
            onChange={(v) => update("notify_on_enquiry", String(v), "notifications")}
            label="Notify on Buyer Enquiry"
            description="Alert when a buyer submits an enquiry on a listing."
          />

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            <Bell className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            Notifications are delivered via your connected n8n webhook. Ensure your workflow handles these event types.
          </div>

          <SaveBar dirty={dirty.notifications} isPending={notifMut.isPending} onSave={() => notifMut.mutate()} />
        </SectionCard>
      )}

      {/* ── PAGES TAB ───────────────────────────────────────────────────────── */}
      {activeTab === "pages" && (() => {
        // ── per-section mutations ───────────────────────────────────────────
        const ABOUT_KEYS = [
          "page_about_title","page_about_subtitle","page_about_story","page_about_mission","page_about_vision",
          "page_about_stat_1_label","page_about_stat_1_value","page_about_stat_2_label","page_about_stat_2_value",
          "page_about_stat_3_label","page_about_stat_3_value","page_about_stat_4_label","page_about_stat_4_value",
          "page_about_team_1_name","page_about_team_1_role","page_about_team_1_bio",
          "page_about_team_2_name","page_about_team_2_role","page_about_team_2_bio",
          "page_about_team_3_name","page_about_team_3_role","page_about_team_3_bio",
        ];
        const SERVICES_KEYS = [
          "page_services_title","page_services_subtitle",
          ...([1,2,3,4,5,6].flatMap(n => [
            `page_services_${n}_title`,`page_services_${n}_desc`,`page_services_${n}_icon`,`page_services_${n}_url`
          ])),
        ];
        const CONTACT_KEYS  = ["page_contact_title","page_contact_subtitle","page_contact_address","page_contact_hours","page_contact_map_url"];
        const FAQ_KEYS      = ["page_faq_title","page_faq_subtitle",...([1,2,3,4,5,6,7,8].flatMap(n=>[`page_faq_${n}_q`,`page_faq_${n}_a`]))];
        const TEST_KEYS     = ["page_testimonials_title","page_testimonials_subtitle",...([1,2,3,4,5,6].flatMap(n=>[`page_testimonials_${n}_name`,`page_testimonials_${n}_role`,`page_testimonials_${n}_text`,`page_testimonials_${n}_rating`]))];
        const PRIVACY_KEYS  = ["page_privacy_title","page_privacy_updated","page_privacy_content"];

        // We use inline mutations via supabase since hooks can't be called conditionally
        const saveSection = async (keys, dirtyKey) => {
          try {
            await upsertKeys(keys);
            toast.success("Page content saved!");
            queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
            setDirty((d) => ({ ...d, [dirtyKey]: false }));
          } catch(err) {
            toast.error(`Failed to save: ${err.message}`);
          }
        };

        const SUB_TABS = [
          { id: "about",        label: "About Us",      dirtyKey: "pages_about",        keys: ABOUT_KEYS    },
          { id: "services",     label: "Services",      dirtyKey: "pages_services",     keys: SERVICES_KEYS },
          { id: "contact",      label: "Contact",       dirtyKey: "pages_contact",      keys: CONTACT_KEYS  },
          { id: "faq",          label: "FAQ",           dirtyKey: "pages_faq",          keys: FAQ_KEYS      },
          { id: "testimonials", label: "Testimonials",  dirtyKey: "pages_testimonials", keys: TEST_KEYS     },
          { id: "privacy",      label: "Privacy",       dirtyKey: "pages_privacy",      keys: PRIVACY_KEYS  },
        ];
        const cur = SUB_TABS.find((t) => t.id === pagesSubTab) || SUB_TABS[0];

        return (
          <SectionCard>
            <SectionTitle icon={Globe}>Page Content</SectionTitle>
            <p className="text-xs text-muted-foreground">
              Edit the content displayed on each public page. Changes are saved per section.
            </p>

            {/* Sub-tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-muted/30 border border-border">
              {SUB_TABS.map(({ id, label, dirtyKey }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPagesSubTab(id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    pagesSubTab === id
                      ? "bg-card shadow-sm text-amber-600 border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                  {dirty[dirtyKey] && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* ── About sub-tab ──────────────────────────────────────── */}
            {pagesSubTab === "about" && (
              <div className="space-y-4 pt-1">
                <Field label="Page Title"><TextInput type="text" value={s.page_about_title}    onChange={(e) => update("page_about_title",    e.target.value, "pages_about")} placeholder="About Us" /></Field>
                <Field label="Subtitle">  <TextInput type="text" value={s.page_about_subtitle} onChange={(e) => update("page_about_subtitle", e.target.value, "pages_about")} placeholder="Building Kerala's most trusted platform" /></Field>
                <Field label="Our Story (paragraph)"><textarea rows={4} value={s.page_about_story} onChange={(e) => update("page_about_story", e.target.value, "pages_about")} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" /></Field>
                <Field label="Mission Statement"><TextInput type="text" value={s.page_about_mission} onChange={(e) => update("page_about_mission", e.target.value, "pages_about")} /></Field>
                <Field label="Vision Statement"> <TextInput type="text" value={s.page_about_vision}  onChange={(e) => update("page_about_vision",  e.target.value, "pages_about")} /></Field>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">Stats (4 items)</p>
                {[1,2,3,4].map((n) => (
                  <div key={n} className="grid grid-cols-2 gap-3">
                    <Field label={`Stat ${n} Label`}><TextInput type="text" value={s[`page_about_stat_${n}_label`]} onChange={(e) => update(`page_about_stat_${n}_label`, e.target.value, "pages_about")} placeholder="Founded" /></Field>
                    <Field label={`Stat ${n} Value`}><TextInput type="text" value={s[`page_about_stat_${n}_value`]} onChange={(e) => update(`page_about_stat_${n}_value`, e.target.value, "pages_about")} placeholder="2020" /></Field>
                  </div>
                ))}
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">Team Members (up to 3)</p>
                {[1,2,3].map((n) => (
                  <div key={n} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                    <Field label={`Member ${n} Name`}><TextInput icon={User} type="text" value={s[`page_about_team_${n}_name`]} onChange={(e) => update(`page_about_team_${n}_name`, e.target.value, "pages_about")} /></Field>
                    <Field label={`Member ${n} Role`}><TextInput type="text" value={s[`page_about_team_${n}_role`]} onChange={(e) => update(`page_about_team_${n}_role`, e.target.value, "pages_about")} /></Field>
                    <Field label={`Member ${n} Bio`}> <TextInput type="text" value={s[`page_about_team_${n}_bio`]}  onChange={(e) => update(`page_about_team_${n}_bio`,  e.target.value, "pages_about")} /></Field>
                  </div>
                ))}
                <SaveBar dirty={dirty.pages_about} isPending={false} onSave={() => saveSection(ABOUT_KEYS, "pages_about")} />
              </div>
            )}

            {/* ── Services sub-tab ───────────────────────────────────── */}
            {pagesSubTab === "services" && (
              <div className="space-y-4 pt-1">
                <Field label="Page Title"><TextInput type="text" value={s.page_services_title}    onChange={(e) => update("page_services_title",    e.target.value, "pages_services")} placeholder="Our Services" /></Field>
                <Field label="Subtitle">  <TextInput type="text" value={s.page_services_subtitle} onChange={(e) => update("page_services_subtitle", e.target.value, "pages_services")} /></Field>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">Services (up to 6)</p>
                {[1,2,3,4,5,6].map((n) => (
                  <div key={n} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={`Service ${n} Title`}><TextInput type="text" value={s[`page_services_${n}_title`]} onChange={(e) => update(`page_services_${n}_title`, e.target.value, "pages_services")} /></Field>
                      <Field label={`Service ${n} Icon`}  hint="home|tag|chart|shield|bank|palette"><TextInput type="text" value={s[`page_services_${n}_icon`]}  onChange={(e) => update(`page_services_${n}_icon`,  e.target.value, "pages_services")} placeholder="home" /></Field>
                    </div>
                    <Field label={`Service ${n} Description`}><TextInput type="text" value={s[`page_services_${n}_desc`]} onChange={(e) => update(`page_services_${n}_desc`, e.target.value, "pages_services")} /></Field>
                    <Field label={`Service ${n} Link URL`}><TextInput icon={ExternalLink} type="text" value={s[`page_services_${n}_url`]}  onChange={(e) => update(`page_services_${n}_url`,  e.target.value, "pages_services")} placeholder="/listings" /></Field>
                  </div>
                ))}
                <SaveBar dirty={dirty.pages_services} isPending={false} onSave={() => saveSection(SERVICES_KEYS, "pages_services")} />
              </div>
            )}

            {/* ── Contact sub-tab ────────────────────────────────────── */}
            {pagesSubTab === "contact" && (
              <div className="space-y-4 pt-1">
                <Field label="Page Title"><TextInput type="text" value={s.page_contact_title}    onChange={(e) => update("page_contact_title",    e.target.value, "pages_contact")} placeholder="Contact Us" /></Field>
                <Field label="Subtitle">  <TextInput type="text" value={s.page_contact_subtitle} onChange={(e) => update("page_contact_subtitle", e.target.value, "pages_contact")} /></Field>
                <Field label="Office Address"><TextInput type="text" value={s.page_contact_address} onChange={(e) => update("page_contact_address", e.target.value, "pages_contact")} placeholder="123 MG Road, Kochi" /></Field>
                <Field label="Office Hours">  <TextInput icon={Clock} type="text" value={s.page_contact_hours}   onChange={(e) => update("page_contact_hours",   e.target.value, "pages_contact")} placeholder="Mon–Sat: 9am–6pm" /></Field>
                <Field label="Google Maps Embed URL" hint="Paste the src URL from Google Maps embed iframe (optional).">
                  <TextInput icon={ExternalLink} type="text" value={s.page_contact_map_url} onChange={(e) => update("page_contact_map_url", e.target.value, "pages_contact")} placeholder="https://www.google.com/maps/embed?pb=..." />
                </Field>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
                  Phone, Email, and WhatsApp are configured under the <strong>Branding</strong> tab and will appear automatically on the Contact page.
                </div>
                <SaveBar dirty={dirty.pages_contact} isPending={false} onSave={() => saveSection(CONTACT_KEYS, "pages_contact")} />
              </div>
            )}

            {/* ── FAQ sub-tab ────────────────────────────────────────── */}
            {pagesSubTab === "faq" && (
              <div className="space-y-4 pt-1">
                <Field label="Page Title"><TextInput type="text" value={s.page_faq_title}    onChange={(e) => update("page_faq_title",    e.target.value, "pages_faq")} placeholder="Frequently Asked Questions" /></Field>
                <Field label="Subtitle">  <TextInput type="text" value={s.page_faq_subtitle} onChange={(e) => update("page_faq_subtitle", e.target.value, "pages_faq")} /></Field>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">Q&amp;A Items (up to 8)</p>
                {[1,2,3,4,5,6,7,8].map((n) => (
                  <div key={n} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                    <Field label={`Q${n} — Question`}><TextInput type="text" value={s[`page_faq_${n}_q`]} onChange={(e) => update(`page_faq_${n}_q`, e.target.value, "pages_faq")} placeholder="How do I list my property?" /></Field>
                    <Field label={`Q${n} — Answer`}>
                      <textarea rows={2} value={s[`page_faq_${n}_a`]} onChange={(e) => update(`page_faq_${n}_a`, e.target.value, "pages_faq")} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
                    </Field>
                  </div>
                ))}
                <SaveBar dirty={dirty.pages_faq} isPending={false} onSave={() => saveSection(FAQ_KEYS, "pages_faq")} />
              </div>
            )}

            {/* ── Testimonials sub-tab ───────────────────────────────── */}
            {pagesSubTab === "testimonials" && (
              <div className="space-y-4 pt-1">
                <Field label="Page Title"><TextInput type="text" value={s.page_testimonials_title}    onChange={(e) => update("page_testimonials_title",    e.target.value, "pages_testimonials")} /></Field>
                <Field label="Subtitle">  <TextInput type="text" value={s.page_testimonials_subtitle} onChange={(e) => update("page_testimonials_subtitle", e.target.value, "pages_testimonials")} /></Field>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">Testimonials (up to 6)</p>
                {[1,2,3,4,5,6].map((n) => (
                  <div key={n} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={`#${n} Name`}>   <TextInput icon={User} type="text" value={s[`page_testimonials_${n}_name`]}   onChange={(e) => update(`page_testimonials_${n}_name`,   e.target.value, "pages_testimonials")} /></Field>
                      <Field label={`#${n} Role`}>   <TextInput type="text" value={s[`page_testimonials_${n}_role`]}   onChange={(e) => update(`page_testimonials_${n}_role`,   e.target.value, "pages_testimonials")} placeholder="Broker, Kochi" /></Field>
                    </div>
                    <Field label={`#${n} Testimonial Text`}>
                      <textarea rows={2} value={s[`page_testimonials_${n}_text`]} onChange={(e) => update(`page_testimonials_${n}_text`, e.target.value, "pages_testimonials")} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
                    </Field>
                    <Field label={`#${n} Rating (1–5)`}><TextInput type="number" min="1" max="5" value={s[`page_testimonials_${n}_rating`]} onChange={(e) => update(`page_testimonials_${n}_rating`, e.target.value, "pages_testimonials")} /></Field>
                  </div>
                ))}
                <SaveBar dirty={dirty.pages_testimonials} isPending={false} onSave={() => saveSection(TEST_KEYS, "pages_testimonials")} />
              </div>
            )}

            {/* ── Privacy sub-tab ────────────────────────────────────── */}
            {pagesSubTab === "privacy" && (
              <div className="space-y-4 pt-1">
                <Field label="Page Title"><TextInput type="text" value={s.page_privacy_title}   onChange={(e) => update("page_privacy_title",   e.target.value, "pages_privacy")} placeholder="Privacy Policy" /></Field>
                <Field label="Last Updated"><TextInput type="text" value={s.page_privacy_updated} onChange={(e) => update("page_privacy_updated", e.target.value, "pages_privacy")} placeholder="September 2026" /></Field>
                <Field label="Content" hint="Use **bold text** for headings. Separate sections with a blank line.">
                  <textarea
                    rows={16}
                    value={s.page_privacy_content}
                    onChange={(e) => update("page_privacy_content", e.target.value, "pages_privacy")}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
                  />
                </Field>
                <SaveBar dirty={dirty.pages_privacy} isPending={false} onSave={() => saveSection(PRIVACY_KEYS, "pages_privacy")} />
              </div>
            )}
          </SectionCard>
        );
      })()}
    </div>
  );
}
