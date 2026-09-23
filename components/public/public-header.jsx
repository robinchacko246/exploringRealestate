"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import MobileNav from "@/components/public/mobile-nav";
import { mergeWithCache, setCachedSettings } from "@/lib/brand-cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const DEFAULTS = {
  brand_name:          "PropertyFlow",
  brand_color:         "#009688",
  header_link_1_label: "Buy",
  header_link_1_url:   "/listings",
  header_link_2_label: "Apartments",
  header_link_2_url:   "/listings?type=apartment",
  header_link_3_label: "Villas",
  header_link_3_url:   "/listings?type=villa",
  header_link_4_label: "Plots",
  header_link_4_url:   "/listings?type=plot",
  header_link_5_label: "Commercial",
  header_link_5_url:   "/listings?type=commercial",
  header_link_6_label: "",
  header_link_6_url:   "",
};

// ── Agent Avatar Dropdown ─────────────────────────────────────────────────────
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, ChevronDown } from "lucide-react";

function AgentMenu({ user, color, onSignOut }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const email    = user?.email || "";
  const name     = user?.user_metadata?.full_name || user?.user_metadata?.name || email.split("@")[0];
  const initials = name.split(" ").slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "AG";
  const colorLight = `${color}18`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-[#F5F5F5]"
      >
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 select-none"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
        <div className="hidden lg:block text-left leading-tight">
          <div className="text-[13px] font-semibold text-[#212121] max-w-[120px] truncate">{name}</div>
          <div className="text-[10.5px] text-[#9E9E9E]">Agent</div>
        </div>
        <ChevronDown
          className="h-3.5 w-3.5 text-[#9E9E9E] transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "" }}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white border border-[#E8E8E8] shadow-xl py-2 z-50">
          <div className="px-4 py-2 border-b border-[#F0F0F0]">
            <div className="text-xs font-semibold text-[#212121] truncate">{name}</div>
            <div className="text-[11px] text-[#9E9E9E] truncate mt-0.5">{email}</div>
          </div>
          <div className="pt-1">
            <Link
              href="/app"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#424242] hover:bg-[#F5F5F5] transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" style={{ color }} />
              Go to Dashboard
            </Link>
            <button
              type="button"
              onClick={() => { setOpen(false); onSignOut(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#D32F2F] hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Header ───────────────────────────────────────────────────────────────
export default function PublicHeader() {
  const router = useRouter();

  // ✅ Lazy initializer: reads localStorage cache SYNCHRONOUSLY on first render
  // → no flash of default text on reload
  const [cfg, setCfg] = useState(() => mergeWithCache(DEFAULTS));
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch fresh settings from DB (stale-while-revalidate)
    supabase
      .from("admin_settings")
      .select("key, value")
      .then(({ data }) => {
        if (!data) return;
        const map = {};
        data.forEach((r) => { map[r.key] = r.value; });
        setCachedSettings(map);          // ← save to cache for next load
        setCfg((prev) => ({ ...prev, ...map }));
      });
  }, []);

  // Check auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(false);
    router.push("/listings");
  };

  const color      = cfg.brand_color || "#009688";
  const colorLight = `${color}1A`;

  const customHeaderLinks = [1, 2, 3, 4, 5, 6]
    .map((n) => ({ label: cfg[`header_link_${n}_label`], href: cfg[`header_link_${n}_url`] }))
    .filter((l) => l.label && l.href);

  const headerLinks = customHeaderLinks.length > 0
    ? customHeaderLinks
    : [
        { href: "/listings",                 label: "Buy"        },
        { href: "/listings?type=apartment",  label: "Apartments" },
        { href: "/listings?type=villa",      label: "Villas"     },
        { href: "/listings?type=plot",       label: "Plots"      },
        { href: "/listings?type=commercial", label: "Commercial" },
      ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex items-center justify-between h-[64px]">

        {/* Logo */}
        <Link href="/listings" className="flex items-center gap-2 shrink-0">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <rect width="34" height="34" rx="6" fill={color} />
            <path d="M7 17L17 8L27 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="12" y="17" width="10" height="9" rx="1" fill="white" />
            <rect x="15" y="20" width="4" height="6" rx="0.5" fill={color} />
          </svg>
          <div className="leading-tight">
            <span className="text-[18px] font-bold tracking-tight" style={{ color }}>
              {cfg.brand_name?.toLowerCase() || "property"}
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {headerLinks.map(({ href, label }) => (
            <Link
              key={href + label}
              href={href}
              className="px-4 py-2 text-[14px] font-medium text-[#424242] rounded transition-colors"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = color;
                e.currentTarget.style.backgroundColor = colorLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "";
                e.currentTarget.style.backgroundColor = "";
              }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/sell"
            className="ml-1 px-4 py-2 text-[14px] font-semibold rounded transition-colors border"
            style={{ color: "#E65100", borderColor: "#E65100" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "white";
              e.currentTarget.style.backgroundColor = "#E65100";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#E65100";
              e.currentTarget.style.backgroundColor = "";
            }}
          >
            Sell / Rent
          </Link>
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          {!user && (
            <Link
              href="/agentscrm"
              className="text-[13.5px] text-[#616161] hover:text-[#424242] transition-colors px-2"
            >
              For Agents
            </Link>
          )}

          {user === null ? (
            <div className="h-8 w-24 rounded-xl bg-[#F0F0F0] animate-pulse" />
          ) : user ? (
            <AgentMenu user={user} color={color} onSignOut={handleSignOut} />
          ) : (
            <Link
              href="/auth"
              className="text-white text-[13.5px] font-semibold px-5 py-2 rounded transition-colors"
              style={{ backgroundColor: color }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(0.9)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = ""; }}
            >
              Agent Login
            </Link>
          )}
        </div>

        <MobileNav headerLinks={headerLinks} color={color} />
      </div>
    </header>
  );
}
