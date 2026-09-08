"use client";

import { useEffect, useState, useMemo, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "apartment", label: "Apartments" },
  { id: "villa", label: "Villas" },
  { id: "house", label: "Houses" },
  { id: "plot", label: "Plots" },
  { id: "commercial", label: "Commercial" },
  { id: "land", label: "Land" },
];

const TYPE_COLORS = {
  apartment: { bg: "#E3F2FD", text: "#1565C0", dot: "#2196F3" },
  villa:     { bg: "#F3E5F5", text: "#6A1B9A", dot: "#9C27B0" },
  house:     { bg: "#FFF8E1", text: "#E65100", dot: "#FF9800" },
  plot:      { bg: "#E8F5E9", text: "#1B5E20", dot: "#4CAF50" },
  commercial:{ bg: "#E8EAF6", text: "#1A237E", dot: "#3F51B5" },
  land:      { bg: "#F9FBE7", text: "#33691E", dot: "#8BC34A" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtINR(n) {
  if (!n) return "Price on request";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }

// ── Property Card ─────────────────────────────────────────────────────────────
function PropertyCard({ property, onClick }) {
  const color = TYPE_COLORS[property.property_type] || TYPE_COLORS.apartment;
  const specs = [
    property.bhk && `${property.bhk} BHK`,
    property.land_size_cents && `${property.land_size_cents} cents`,
  ].filter(Boolean).join(" · ");

  const isAgent = property._source === "agent";
  const contactPhone = isAgent ? (property.profiles?.phone || "+917907102204") : property.owner_phone;
  const baseUrl = typeof window !== "undefined" ? window.location.href.split('?')[0] : "";
  
  const message = `Hi, I'm interested in: ${property.title}
Type: ${cap(property.property_type)}
${property.location ? `Location: ${property.location}\n` : ""}${property.price ? `Price: ${fmtINR(property.price)}\n` : ""}Link: ${baseUrl}?id=${property.id}`;

  const waHref = contactPhone
    ? `https://wa.me/91${contactPhone.replace(/\D/g,"").slice(-10)}?text=${encodeURIComponent(message)}`
    : null;

  return (
    <article
      onClick={() => onClick(property)}
      className="bg-white rounded-xl overflow-hidden cursor-pointer group transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,150,136,0.15)]"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#E8F5E9]" style={{ height: 210 }}>
        {property.images?.length > 0 ? (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="8" fill="#E0F2F1" />
              <path d="M10 24L24 11L38 24" stroke="#009688" strokeWidth="3" strokeLinecap="round" />
              <rect x="16" y="24" width="16" height="13" rx="2" fill="#009688" opacity="0.6" />
              <rect x="21" y="29" width="6" height="8" rx="1" fill="#E0F2F1" />
            </svg>
          </div>
        )}
        {/* Type badge */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color.dot }} />
          {cap(property.property_type)}
        </div>
        {/* Image count */}
        {property.images?.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
            📷 {property.images.length}
          </div>
        )}
        {/* Status + owner badge */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          <div className="bg-[#009688] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide uppercase">
            {property.status}
          </div>
          {property._source === "owner" && (
            <div className="bg-[#E65100] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide">
              Owner Listed
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-[14.5px] font-semibold text-[#212121] leading-snug line-clamp-2 mb-1.5 group-hover:text-[#009688] transition-colors">
          {property.title}
        </h3>
        {property.location && (
          <p className="flex items-center gap-1.5 text-[12.5px] text-[#757575] mb-3">
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
              <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" fill="#009688"/>
              <circle cx="6" cy="5" r="1.5" fill="white"/>
            </svg>
            {property.location}
          </p>
        )}

        {/* Price + specs */}
        <div className="flex items-end justify-between gap-2 mb-3">
          <div>
            <p className="text-[20px] font-bold text-[#009688] leading-none">{fmtINR(property.price)}</p>
            {specs && <p className="text-[12px] text-[#9E9E9E] mt-1">{specs}</p>}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#F0F0F0] pt-3">
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-[13px] font-semibold text-[#25D366] hover:text-[#128C7E] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.374 0 0 5.373 0 12c0 2.12.554 4.107 1.523 5.832L.057 23.854l6.188-1.453A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22.008a9.99 9.99 0 0 1-5.117-1.404l-.366-.218-3.793.893.929-3.68-.24-.378A9.959 9.959 0 0 1 2.004 12C2.004 6.474 6.475 2.004 12 2.004S21.996 6.474 21.996 12C21.996 17.525 17.525 21.996 12 22.008z"/>
              </svg>
              Contact on WhatsApp
            </a>
          ) : (
            <span className="text-[13px] text-[#BDBDBD]">Contact via agent</span>
          )}
        </div>
      </div>
    </article>
  );
}

// ── Property Modal ────────────────────────────────────────────────────────────
function PropertyModal({ property, onClose }) {
  const [imgIdx, setImgIdx] = useState(0);
  const color = TYPE_COLORS[property.property_type] || TYPE_COLORS.apartment;

  const isAgent = property._source === "agent";
  const contactPhone = isAgent ? (property.profiles?.phone || "+917907102204") : property.owner_phone;
  const contactName = isAgent ? property.profiles?.full_name || "Agent" : property.owner_name || "Owner";
  const baseUrl = typeof window !== "undefined" ? window.location.href.split('?')[0] : "";

  const message = `Hi, I'm interested in: ${property.title}
Type: ${cap(property.property_type)}
${property.location ? `Location: ${property.location}\n` : ""}${property.price ? `Price: ${fmtINR(property.price)}\n` : ""}Link: ${baseUrl}?id=${property.id}`;

  const waHref = contactPhone
    ? `https://wa.me/91${contactPhone.replace(/\D/g,"").slice(-10)}?text=${encodeURIComponent(message)}`
    : null;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const specs = [
    { label: "Type",        value: cap(property.property_type) },
    { label: "Status",      value: cap(property.status) },
    property.bhk              && { label: "BHK",        value: `${property.bhk} BHK` },
    property.land_size_cents  && { label: "Land",        value: `${property.land_size_cents} cents` },
    property.price            && { label: "Price",       value: fmtINR(property.price) },
    property.location         && { label: "Location",    value: property.location },
  ].filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gallery */}
        <div className="relative bg-[#E0F2F1] rounded-t-2xl overflow-hidden" style={{ height: 300 }}>
          {property.images?.length > 0 ? (
            <>
              <Image src={property.images[imgIdx]} alt={property.title} fill className="object-cover" sizes="672px" unoptimized />
              {property.images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(p => p === 0 ? property.images.length - 1 : p - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 text-[#212121] w-9 h-9 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors text-lg">‹</button>
                  <button onClick={() => setImgIdx(p => p === property.images.length - 1 ? 0 : p + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 text-[#212121] w-9 h-9 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors text-lg">›</button>
                </>
              )}
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[12px] px-2.5 py-1 rounded-full">
                {imgIdx + 1} / {property.images.length}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-6xl font-serif text-[#009688]/30">{cap(property.property_type)}</span>
            </div>
          )}
          {/* Type + close */}
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.dot }} />
            {cap(property.property_type)}
          </div>
          <button onClick={onClose}
            className="absolute top-3 right-3 bg-white/90 text-[#424242] w-8 h-8 rounded-full flex items-center justify-center hover:bg-white shadow transition-colors font-medium">
            ✕
          </button>
        </div>

        {/* Thumbnail strip */}
        {property.images?.length > 1 && (
          <div className="flex gap-2 px-5 py-3 overflow-x-auto bg-[#F9FAFB] border-b border-[#EEEEEE]">
            {property.images.map((img, i) => (
              <button key={i} onClick={() => setImgIdx(i)}
                className="relative shrink-0 overflow-hidden rounded-lg transition-opacity"
                style={{ width: 64, height: 48, outline: i === imgIdx ? "2.5px solid #009688" : "1px solid #E0E0E0", opacity: i === imgIdx ? 1 : 0.6 }}>
                <Image src={img} alt="" fill className="object-cover" unoptimized sizes="64px" />
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex-1">
              {property.location && (
                <p className="flex items-center gap-1.5 text-[12.5px] text-[#757575] mb-1.5">
                  <svg width="10" height="12" viewBox="0 0 12 14" fill="none">
                    <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" fill="#009688"/>
                    <circle cx="6" cy="5" r="1.5" fill="white"/>
                  </svg>
                  {property.location}
                </p>
              )}
              <h2 className="text-[20px] font-bold text-[#212121] leading-snug">{property.title}</h2>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[26px] font-bold text-[#009688] leading-none">{fmtINR(property.price)}</p>
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-3 mb-5 p-4 bg-[#F5F7FA] rounded-xl">
            {specs.map(({ label, value }) => (
              <div key={label}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E] mb-0.5">{label}</p>
                <p className="text-[14px] font-semibold text-[#212121]">{value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {property.description && (
            <div className="mb-5">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#9E9E9E] mb-2">Description</p>
              <p className="text-[14px] text-[#616161] leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Contact */}
          {(contactName || contactPhone || waHref) && (
            <div className="border-t border-[#EEEEEE] pt-4">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#9E9E9E] mb-3">Listed By</p>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#E0F2F1] flex items-center justify-center text-[#009688] font-bold text-[15px]">
                    {contactName?.[0] || "A"}
                  </div>
                  <div>
                    {contactName && <p className="text-[14px] font-semibold text-[#212121]">{contactName}</p>}
                    {contactPhone && <p className="text-[13px] text-[#616161]">{contactPhone}</p>}
                  </div>
                </div>
                {waHref && (
                  <a href={waHref} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#25D366] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#128C7E] transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
      <div className="bg-[#E0F2F1] animate-pulse" style={{ height: 210 }} />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[#F0F0F0] animate-pulse rounded-full w-4/5" />
        <div className="h-3 bg-[#F0F0F0] animate-pulse rounded-full w-3/5" />
        <div className="h-6 bg-[#F0F0F0] animate-pulse rounded-full w-1/3 mt-4" />
        <div className="h-3 bg-[#F0F0F0] animate-pulse rounded-full w-2/3" />
        <div className="h-px bg-[#F0F0F0] mt-2" />
        <div className="h-4 bg-[#F0F0F0] animate-pulse rounded-full w-1/2" />
      </div>
    </div>
  );
}

// ── Main Page Content ─────────────────────────────────────────────────────────
function ListingsContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const idParam = searchParams.get("id");
  const validTypes = CATEGORIES.map((c) => c.id);
  const initialCategory = typeParam && validTypes.includes(typeParam) ? typeParam : "all";

  const [properties,       setProperties]       = useState([]);
  const [loading,          setLoading]           = useState(true);
  const [activeCategory,   setActiveCategory]    = useState(initialCategory);
  const [search,           setSearch]            = useState("");
  const [selectedProperty, setSelectedProperty]  = useState(null);
  const [priceRange,       setPriceRange]        = useState("all");
  const [sortBy,           setSortBy]            = useState("newest");
  // Hero search form state
  const [heroType,         setHeroType]          = useState(initialCategory === "all" ? "" : initialCategory);
  const [heroLocation,     setHeroLocation]      = useState("");
  const [activeTab,        setActiveTab]         = useState("all"); // 'all' | 'buy' | 'rent'

  const gridRef = useRef(null);

  useEffect(() => {
    async function fetchProps() {
      setLoading(true);

      // Fetch from both: agent-managed properties + owner-submitted listings
      const [agentRes, ownerRes] = await Promise.all([
        supabase
          .from("properties")
          .select("*")
          .eq("status", "available")
          .order("created_at", { ascending: false }),
        supabase
          .from("public_property_listings")
          .select("*")
          .eq("status", "available")
          .order("created_at", { ascending: false }),
      ]);

      if (agentRes.error) console.error("Agent properties error:", agentRes.error);
      if (ownerRes.error) console.error("Owner listings error:", ownerRes.error);
      
      let agentData = agentRes.data || [];
      if (agentData.length > 0) {
        const agentIds = [...new Set(agentData.map(p => p.agent_id).filter(Boolean))];
        if (agentIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, full_name, phone")
            .in("id", agentIds);
            
          if (profilesError) {
            console.error("Profiles error:", profilesError);
          } else if (profilesData) {
            const profilesMap = {};
            profilesData.forEach(p => { profilesMap[p.id] = p; });
            agentData = agentData.map(p => ({ ...p, profiles: profilesMap[p.agent_id] }));
          }
        }
      }

      // Tag each source so we can show a badge
      const agentProps = agentData.map((p) => ({ ...p, _source: "agent" }));
      const ownerProps = (ownerRes.data || []).map((p) => ({ ...p, _source: "owner" }));

      // Merge and sort by newest first
      const all = [...agentProps, ...ownerProps].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setProperties(all);
      setLoading(false);
    }
    fetchProps();
  }, []);

  // Auto-open modal if ID is in URL
  const lastOpenedId = useRef(null);
  useEffect(() => {
    if (idParam && properties.length > 0 && lastOpenedId.current !== idParam) {
      const propToOpen = properties.find((p) => p.id === idParam);
      if (propToOpen) {
        setSelectedProperty(propToOpen);
        lastOpenedId.current = idParam;
      }
    }
  }, [idParam, properties]);

  const filtered = useMemo(() => {
    let list = [...properties];

    // Filter by Tab (Buy / Rent)
    if (activeTab === "rent") {
      list = list.filter((p) => p.listing_type === "rent" || p.listing_type === "rent_out");
    } else if (activeTab === "buy") {
      list = list.filter((p) => p.listing_type === "sell" || p.listing_type === "sale" || !p.listing_type);
    }

    // Filter by Category / Type
    if (activeCategory !== "all") {
      list = list.filter((p) => p.property_type === activeCategory);
    }

    // Filter by Search (Location / Title / Description)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) =>
        p.title?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.owner_name?.toLowerCase().includes(q)
      );
    }

    // Filter by Price Range
    if (priceRange !== "all") {
      const ranges = {
        "0-50L":   [0, 5000000],
        "50L-1Cr": [5000000, 10000000],
        "1Cr-5Cr": [10000000, 50000000],
        "5Cr+":   [50000000, Infinity],
      };
      const [mn, mx] = ranges[priceRange] || [0, Infinity];
      list = list.filter((p) => (p.price || 0) >= mn && (p.price || 0) < mx);
    }

    // Sort
    if (sortBy === "newest")        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sortBy === "price-asc")  list.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === "price-desc") list.sort((a, b) => (b.price || 0) - (a.price || 0));

    return list;
  }, [properties, activeTab, activeCategory, search, priceRange, sortBy]);

  const counts = useMemo(() => {
    let list = [...properties];
    if (activeTab === "rent") {
      list = list.filter((p) => p.listing_type === "rent" || p.listing_type === "rent_out");
    } else if (activeTab === "buy") {
      list = list.filter((p) => p.listing_type === "sell" || p.listing_type === "sale" || !p.listing_type);
    }
    const m = { all: list.length };
    CATEGORIES.slice(1).forEach((c) => {
      m[c.id] = list.filter((p) => p.property_type === c.id).length;
    });
    return m;
  }, [properties, activeTab]);

  const handleHeroSearch = () => {
    setActiveCategory(heroType || "all");
    setSearch(heroLocation);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    setHeroType(catId === "all" ? "" : catId);
  };

  const handleCardClick  = useCallback((p) => { setSelectedProperty(p); document.body.style.overflow = "hidden"; }, []);
  const handleModalClose = useCallback(()  => { setSelectedProperty(null); document.body.style.overflow = ""; }, []);

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative" style={{ minHeight: "62vh" }}>
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,25,30,0.82) 0%, rgba(10,25,30,0.55) 50%, rgba(10,25,30,0.2) 100%)" }} />

        <div className="relative max-w-[1280px] mx-auto px-6 md:px-8 py-16 md:py-20">
          <div className="grid md:grid-cols-[1fr_400px] gap-10 items-center">

            {/* Left: headline */}
            <div className="text-white">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#80CBC4] mb-4">
                <svg width="14" height="16" viewBox="0 0 12 14" fill="none">
                  <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" fill="#80CBC4"/>
                  <circle cx="6" cy="5" r="1.5" fill="white"/>
                </svg>
                You are here
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-[56px] font-semibold leading-[1.08] tracking-tight mb-5">
                Let&apos;s Find Your<br />
                <span className="text-[#4DB6AC]">Dream Property</span>
              </h1>
              <p className="text-[15px] text-white/75 leading-relaxed max-w-md mb-8">
                Welcome to PropertyFlow — Kerala&apos;s trusted real estate platform. Browse thousands of plots, villas, apartments, and commercial spaces listed by verified agents.
              </p>
              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                {[
                  [properties.length || "100+", "Properties"],
                  ["50+", "Verified Agents"],
                  ["100%", "Trusted Listings"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <p className="text-[24px] font-bold text-white leading-none">{n}</p>
                    <p className="text-[12.5px] text-white/60 mt-0.5">{l}</p>
                  </div>
                ))}
              </div>

              {/* Owner CTA pill */}
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-3">
                <span className="text-[13px] text-white/90 font-medium">Are you a Property Owner?</span>
                <a
                  href="/sell"
                  className="bg-[#E65100] hover:bg-[#BF360C] text-white text-[12.5px] font-bold px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  Post Free Listing →
                </a>
              </div>
            </div>

            {/* Right: search panel */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Tab switcher */}
              <div className="flex border-b border-[#EEEEEE]">
                {[
                  { id: "all",  label: "All" },
                  { id: "buy",  label: "Buy" },
                  { id: "rent", label: "Rent" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex-1 py-3.5 text-[14px] font-semibold transition-colors"
                    style={{
                      backgroundColor: activeTab === tab.id ? "#009688" : "white",
                      color: activeTab === tab.id ? "white" : "#757575",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5 space-y-3">
                {/* Property type */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E] block mb-1.5">
                    Property Type
                  </label>
                  <select
                    value={heroType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHeroType(val);
                      setActiveCategory(val || "all");
                    }}
                    className="w-full border border-[#E0E0E0] rounded-lg px-3.5 py-2.5 text-[14px] text-[#212121] bg-white focus:outline-none focus:border-[#009688] transition-colors"
                  >
                    <option value="">All Types</option>
                    {CATEGORIES.slice(1).map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E] block mb-1.5">
                    Location / Area
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]" width="14" height="14" viewBox="0 0 12 14" fill="none">
                      <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" fill="currentColor"/>
                    </svg>
                    <input
                      type="text"
                      value={heroLocation}
                      onChange={(e) => {
                        setHeroLocation(e.target.value);
                        setSearch(e.target.value);
                      }}
                      placeholder="e.g. Kakkanad, Ernakulam…"
                      className="w-full border border-[#E0E0E0] rounded-lg pl-9 pr-3.5 py-2.5 text-[14px] text-[#212121] placeholder-[#BDBDBD] focus:outline-none focus:border-[#009688] transition-colors"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E] block mb-1.5">
                    Budget
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full border border-[#E0E0E0] rounded-lg px-3.5 py-2.5 text-[14px] text-[#212121] bg-white focus:outline-none focus:border-[#009688] transition-colors"
                  >
                    <option value="all">Any Budget</option>
                    <option value="0-50L">Under ₹50 L</option>
                    <option value="50L-1Cr">₹50 L – 1 Cr</option>
                    <option value="1Cr-5Cr">₹1 Cr – 5 Cr</option>
                    <option value="5Cr+">Above ₹5 Cr</option>
                  </select>
                </div>

                {/* Search button */}
                <button
                  onClick={handleHeroSearch}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#009688] hover:bg-[#00796B] text-white text-[15px] font-semibold py-3.5 rounded-lg transition-colors mt-1"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <circle cx="9" cy="9" r="6" stroke="white" strokeWidth="2" />
                    <path d="M14 14l3.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Search Properties
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category tabs ─────────────────────────────────────────────── */}
      <div ref={gridRef} className="sticky top-[64px] z-40 bg-white border-b border-[#EEEEEE] shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="flex overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className="shrink-0 px-5 py-4 text-[13.5px] font-medium border-b-2 transition-all whitespace-nowrap"
                style={{
                  borderBottomColor: activeCategory === cat.id ? "#009688" : "transparent",
                  color: activeCategory === cat.id ? "#009688" : "#616161",
                }}
              >
                {cat.label}
                <span className="ml-1.5 text-[11px]" style={{ color: activeCategory === cat.id ? "#00796B" : "#BDBDBD" }}>
                  ({counts[cat.id] ?? 0})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Listings ──────────────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-8">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-[18px] font-bold text-[#212121]">
              {activeCategory === "all" ? "All Properties" : CATEGORIES.find(c=>c.id===activeCategory)?.label}
              {!loading && (
                <span className="ml-2 text-[14px] font-normal text-[#009688]">
                  ({filtered.length} listings)
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-[13.5px] text-[#616161]">
            {/* Search input inline */}
            <div className="flex items-center border border-[#E0E0E0] rounded-lg bg-white overflow-hidden">
              <svg className="ml-3 h-4 w-4 text-[#BDBDBD] shrink-0" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M14 14l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search location or keyword…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHeroLocation(e.target.value);
                }}
                className="px-2.5 py-2 text-[13px] text-[#212121] outline-none bg-transparent w-48"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setHeroLocation("");
                  }}
                  className="pr-2 text-[#BDBDBD] hover:text-[#212121]"
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] text-[#424242] bg-white focus:outline-none focus:border-[#009688]"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(activeTab !== "all" || activeCategory !== "all" || search || priceRange !== "all") && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-[12.5px]">
            <span className="text-[#9E9E9E] font-medium mr-1">Active Filters:</span>
            {activeTab !== "all" && (
              <span className="inline-flex items-center gap-1.5 bg-[#E0F2F1] text-[#00796B] px-3 py-1 rounded-full font-medium">
                Type: {activeTab === "buy" ? "For Sale" : "For Rent"}
                <button onClick={() => setActiveTab("all")} className="hover:text-[#004D40] font-bold">✕</button>
              </span>
            )}
            {activeCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 bg-[#E0F2F1] text-[#00796B] px-3 py-1 rounded-full font-medium">
                Category: {CATEGORIES.find(c=>c.id===activeCategory)?.label}
                <button onClick={() => handleCategorySelect("all")} className="hover:text-[#004D40] font-bold">✕</button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1.5 bg-[#E0F2F1] text-[#00796B] px-3 py-1 rounded-full font-medium">
                Keyword: &ldquo;{search}&rdquo;
                <button onClick={() => { setSearch(""); setHeroLocation(""); }} className="hover:text-[#004D40] font-bold">✕</button>
              </span>
            )}
            {priceRange !== "all" && (
              <span className="inline-flex items-center gap-1.5 bg-[#E0F2F1] text-[#00796B] px-3 py-1 rounded-full font-medium">
                Budget: {priceRange}
                <button onClick={() => setPriceRange("all")} className="hover:text-[#004D40] font-bold">✕</button>
              </span>
            )}
            <button
              onClick={() => {
                setActiveTab("all");
                setActiveCategory("all");
                setHeroType("");
                setSearch("");
                setHeroLocation("");
                setPriceRange("all");
                setSortBy("newest");
              }}
              className="text-[#009688] hover:underline font-semibold ml-2 text-[12px]"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-[#E0F2F1] rounded-full flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="#009688" strokeWidth="1.5"/>
                <path d="M14 14l3.5 3.5" stroke="#009688" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-[20px] font-semibold text-[#424242] mb-2">No properties found</p>
            <p className="text-[14px] text-[#9E9E9E] mb-6">Try adjusting your filters or search terms.</p>
            <button
              onClick={() => {
                setActiveTab("all");
                setActiveCategory("all");
                setHeroType("");
                setSearch("");
                setHeroLocation("");
                setPriceRange("all");
                setSortBy("newest");
              }}
              className="bg-[#009688] text-white px-6 py-2.5 rounded-lg font-semibold text-[14px] hover:bg-[#00796B] transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((p) => (
                <PropertyCard key={p.id} property={p} onClick={handleCardClick} />
              ))}
            </div>

            {/* Category sub-sections in "All" view */}
            {activeCategory === "all" && !search && priceRange === "all" && (
              <div className="mt-14 space-y-12">
                {CATEGORIES.slice(1).map((cat) => {
                  const catProps = properties.filter((p) => p.property_type === cat.id);
                  if (catProps.length === 0) return null;
                  const col = TYPE_COLORS[cat.id] || TYPE_COLORS.apartment;
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: col.dot }} />
                          <h3 className="text-[18px] font-bold text-[#212121]">{cat.label}</h3>
                          <span className="text-[13px] text-[#9E9E9E]">({catProps.length})</span>
                        </div>
                        {catProps.length > 3 && (
                          <button
                            onClick={() => setActiveCategory(cat.id)}
                            className="text-[13.5px] font-semibold text-[#009688] hover:text-[#00796B] transition-colors flex items-center gap-1"
                          >
                            View all {cat.label} ›
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {catProps.slice(0, 3).map((p) => (
                          <PropertyCard key={p.id} property={p} onClick={handleCardClick} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal ────────────────────────────────────────────────────── */}
      {selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={handleModalClose} />
      )}
    </>
  );
}

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1280px] mx-auto px-4 py-24 text-center">
          <div className="w-12 h-12 border-4 border-[#009688] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[15px] font-medium text-[#616161]">Loading listings...</p>
        </div>
      }
    >
      <ListingsContent />
    </Suspense>
  );
}
