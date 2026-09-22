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
} from "lucide-react";
import { toast } from "sonner";

// ── Constants ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "contact",       label: "Contact",       icon: Phone      },
  { id: "branding",      label: "Branding",      icon: Palette    },
  { id: "footer",        label: "Footer",        icon: Link2      },
  { id: "listings",      label: "Listings",      icon: Building2  },
  { id: "notifications", label: "Notifications", icon: Bell       },
];

const DEFAULTS = {
  admin_contact_phone:      "+918138802204",
  admin_contact_name:       "PropertyFlow Desk",
  brand_name:               "PropertyFlow",
  brand_tagline:            "Kerala's #1 Property Platform",
  brand_color:              "#009688",
  brand_email:              "hello@propertyflow.in",
  brand_whatsapp:           "+918138802204",
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
    contact: false, branding: false, footer: false,
    listings: false, notifications: false,
  });

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
      setDirty({ contact: false, branding: false, footer: false, listings: false, notifications: false });
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
    </div>
  );
}
