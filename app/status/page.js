"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  MapPin,
  Tag,
  Building2,
  Loader2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

function fmtINR(n) {
  if (!n) return "Price on request";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    sublabel: "Your listing is in our moderation queue. We review submissions within 24 hours.",
    icon: Clock,
    bg: "bg-amber-50 border-amber-200",
    iconBg: "bg-amber-100 text-amber-600",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  available: {
    label: "Approved & Live 🎉",
    sublabel: "Your listing is live and visible to buyers and renters on PropertyFlow.",
    icon: CheckCircle2,
    bg: "bg-emerald-50 border-emerald-200",
    iconBg: "bg-emerald-100 text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  sold: {
    label: "Sold / Closed",
    sublabel: "This listing has been marked as sold or closed by the admin.",
    icon: BadgeCheck,
    bg: "bg-indigo-50 border-indigo-200",
    iconBg: "bg-indigo-100 text-indigo-600",
    badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  rejected: {
    label: "Not Approved",
    sublabel: "Your listing was not approved. Please see the reason below and resubmit if needed.",
    icon: XCircle,
    bg: "bg-red-50 border-red-200",
    iconBg: "bg-red-100 text-red-600",
    badge: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

function StatusPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ["listing-status", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("public_property_listings")
        .select("id, title, location, price, listing_type, property_type, status, admin_notes, created_at, bhk")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    refetchInterval: 30000, // auto-refresh every 30s
  });

  // ── No ID provided ─────────────────────────────────────────────────────────
  if (!id) {
    return (
      <div className="text-center py-16 px-6">
        <AlertCircle className="h-12 w-12 text-[#BDBDBD] mx-auto mb-4" />
        <h1 className="text-[22px] font-semibold text-[#212121] mb-2">No Listing ID</h1>
        <p className="text-[14px] text-[#757575] mb-6">
          This page requires a listing ID in the URL. Check the link you received after submitting your property.
        </p>
        <Link href="/sell" className="inline-flex items-center gap-2 bg-[#009688] text-white px-6 py-3 rounded-xl text-[14px] font-bold hover:bg-[#00796B] transition-colors">
          Submit a Listing
        </Link>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#009688]" />
        <p className="text-[14px] text-[#757575]">Loading your listing status…</p>
      </div>
    );
  }

  // ── Error / not found ──────────────────────────────────────────────────────
  if (error || !listing) {
    return (
      <div className="text-center py-16 px-6">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-[22px] font-semibold text-[#212121] mb-2">Listing Not Found</h1>
        <p className="text-[14px] text-[#757575] mb-6">
          We couldn&apos;t find a listing with this ID. Make sure you&apos;re using the exact link from your submission confirmation.
        </p>
        <Link href="/sell" className="inline-flex items-center gap-2 bg-[#009688] text-white px-6 py-3 rounded-xl text-[14px] font-bold hover:bg-[#00796B] transition-colors">
          Submit a New Listing
        </Link>
      </div>
    );
  }

  const status = listing.status || "pending";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  const submittedAt = listing.created_at
    ? new Date(listing.created_at).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Status Card */}
      <div className={`rounded-2xl border p-6 mb-6 ${config.bg}`}>
        <div className="flex items-start gap-4">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${config.iconBg}`}>
            <StatusIcon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[12px] font-bold ${config.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                {config.label}
              </span>
            </div>
            <p className="text-[13.5px] text-[#424242] leading-relaxed mt-1">
              {config.sublabel}
            </p>
          </div>
        </div>
      </div>

      {/* Rejection reason */}
      {status === "rejected" && listing.admin_notes && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 mb-6 flex items-start gap-3">
          <MessageSquare className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-red-600 mb-1">Reason from admin</p>
            <p className="text-[13.5px] text-[#424242] leading-relaxed">{listing.admin_notes}</p>
          </div>
        </div>
      )}

      {/* View live listing CTA */}
      {status === "available" && (
        <Link
          href={`/listings?id=${listing.id}`}
          className="flex items-center justify-center gap-2 w-full bg-[#009688] text-white text-[14px] font-bold px-6 py-3.5 rounded-xl hover:bg-[#00796B] transition-colors mb-6"
        >
          <ExternalLink className="h-4 w-4" />
          View Your Live Listing
        </Link>
      )}

      {/* Resubmit CTA for rejected */}
      {status === "rejected" && (
        <Link
          href="/sell"
          className="flex items-center justify-center gap-2 w-full border-2 border-[#009688] text-[#009688] text-[14px] font-semibold px-6 py-3.5 rounded-xl hover:bg-[#E0F2F1] transition-colors mb-6"
        >
          Resubmit Your Property
        </Link>
      )}

      {/* Property Details */}
      <div className="bg-white rounded-2xl border border-[#EEEEEE] shadow-sm overflow-hidden">
        <div className="bg-[#F5F7FA] px-5 py-3 border-b border-[#EEEEEE]">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#9E9E9E]">Your Listing Details</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <h2 className="text-[18px] font-bold text-[#212121] leading-snug">{listing.title}</h2>

          <div className="flex items-center gap-2 text-[13px] text-[#616161]">
            <MapPin className="h-4 w-4 text-[#009688] shrink-0" />
            <span>{listing.location || "Location not provided"}</span>
          </div>

          <div className="flex flex-wrap gap-2 text-[13px]">
            <span className="flex items-center gap-1.5 rounded-lg bg-[#E0F2F1] text-[#009688] px-2.5 py-1 font-semibold">
              <Tag className="h-3.5 w-3.5" />
              {fmtINR(listing.price)}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-[#F5F5F5] text-[#616161] px-2.5 py-1">
              <Building2 className="h-3.5 w-3.5" />
              {listing.listing_type === "rent" ? "For Rent" : "For Sale"} · {listing.property_type || "Property"}
            </span>
            {listing.bhk && (
              <span className="rounded-lg bg-[#F5F5F5] text-[#616161] px-2.5 py-1">
                {listing.bhk} BHK
              </span>
            )}
          </div>

          {submittedAt && (
            <p className="text-[12px] text-[#9E9E9E] pt-1 border-t border-[#F5F5F5]">
              Submitted on {submittedAt}
            </p>
          )}
        </div>
      </div>

      {/* Auto-refresh note */}
      <p className="text-center text-[11.5px] text-[#BDBDBD] mt-5">
        This page refreshes automatically every 30 seconds.
      </p>
    </div>
  );
}

export default function StatusPage() {
  return (
    <>
      {/* Header */}
      <header className="border-b border-[#EEEEEE] bg-white px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="font-serif text-[18px] font-semibold text-[#009688]">
            PropertyFlow
          </Link>
          <Link href="/listings" className="text-[13px] text-[#009688] font-medium hover:underline">
            Browse Listings →
          </Link>
        </div>
      </header>

      <main className="min-h-screen bg-[#FAFAFA]">
        <div className="max-w-lg mx-auto px-4 pt-8">
          <div className="text-center mb-6">
            <h1 className="text-[26px] font-serif font-semibold text-[#212121] mb-1">
              Listing Status
            </h1>
            <p className="text-[14px] text-[#757575]">
              Track the review status of your submitted property
            </p>
          </div>
        </div>

        <Suspense fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#009688]" />
          </div>
        }>
          <StatusPageContent />
        </Suspense>
      </main>
    </>
  );
}
