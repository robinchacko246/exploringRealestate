"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Phone,
  User,
  MapPin,
  Search,
  Trash2,
  Eye,
  EyeOff,
  Settings2,
  PhoneCall,
  Copy,
  Check,
  StickyNote,
  CalendarDays,
  ListChecks,
  MessageCircle,
  ExternalLink,
  Images,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Tag,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ModerationListingsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [listingTypeFilter, setListingTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Contact modal state
  const [hideOwnerContact, setHideOwnerContact] = useState(true);
  const [adminPhone, setAdminPhone] = useState("+918138802204");
  const [adminName, setAdminName] = useState("PropertyFlow Desk");

  // Admin notes / rejection reason state
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [notesListing, setNotesListing] = useState(null);
  const [notesText, setNotesText] = useState("");
  const [pendingRejectId, setPendingRejectId] = useState(null);

  // Bulk select state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  // Quick-copy phone state
  const [copiedPhone, setCopiedPhone] = useState(null);

  // Image Gallery Lightbox state
  const [galleryListing, setGalleryListing] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fetch public property listings
  const { data: listings = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-public-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_property_listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[ModerationListings] Error fetching listings:", error);
        return [];
      }
      return data ?? [];
    },
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      const { error } = await supabase
        .from("public_property_listings")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { newStatus }) => {
      const label =
        newStatus === "available"
          ? "Approved & Live"
          : newStatus === "sold"
          ? "Marked as Sold"
          : newStatus === "pending"
          ? "Moved to Pending"
          : newStatus === "rejected"
          ? "Rejected"
          : newStatus;
      toast.success(`Listing status updated: ${label}`);
      queryClient.invalidateQueries(["admin-public-listings"]);
    },
    onError: (err) => {
      toast.error(`Error updating status: ${err.message}`);
    },
  });

  // Admin notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, admin_notes, newStatus }) => {
      const update = { admin_notes };
      if (newStatus) update.status = newStatus;
      const { error } = await supabase
        .from("public_property_listings")
        .update(update)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.newStatus === "rejected"
          ? "Listing rejected with note."
          : "Admin note saved."
      );
      queryClient.invalidateQueries(["admin-public-listings"]);
      setIsNotesModalOpen(false);
      setPendingRejectId(null);
    },
    onError: (err) => {
      toast.error(`Failed to save note: ${err.message}`);
    },
  });

  // Bulk status mutation
  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, newStatus }) => {
      const { error } = await supabase
        .from("public_property_listings")
        .update({ status: newStatus })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_, { ids, newStatus }) => {
      toast.success(`${ids.length} listings marked as ${newStatus}.`);
      queryClient.invalidateQueries(["admin-public-listings"]);
      setSelectedIds(new Set());
      setBulkMode(false);
    },
    onError: (err) => {
      toast.error(`Bulk update failed: ${err.message}`);
    },
  });

  // Contact settings mutation
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, hide_owner_contact, admin_contact_phone, admin_contact_name }) => {
      const { error } = await supabase
        .from("public_property_listings")
        .update({ hide_owner_contact, admin_contact_phone, admin_contact_name })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Public contact preferences updated!");
      queryClient.invalidateQueries(["admin-public-listings"]);
      setIsContactModalOpen(false);
    },
    onError: (err) => {
      toast.error(`Failed to update contact settings: ${err.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from("public_property_listings")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Public submission deleted.");
      queryClient.invalidateQueries(["admin-public-listings"]);
    },
    onError: (err) => {
      toast.error(`Failed to delete: ${err.message}`);
    },
  });

  const openContactDialog = (item) => {
    setSelectedListing(item);
    setHideOwnerContact(true);
    const phone = item.admin_contact_phone;
    const phoneToUse = (!phone || phone.includes("7907102204")) ? "+918138802204" : phone;
    setAdminPhone(phoneToUse);
    setAdminName(item.admin_contact_name || "PropertyFlow Desk");
    setIsContactModalOpen(true);
  };

  const handleSaveContactSettings = () => {
    if (!selectedListing) return;
    updateContactMutation.mutate({
      id: selectedListing.id,
      hide_owner_contact: hideOwnerContact,
      admin_contact_phone: adminPhone,
      admin_contact_name: adminName,
    });
  };

  // Notes modal helpers
  const openNotesModal = (item, withReject = false) => {
    setNotesListing(item);
    setNotesText(item.admin_notes || "");
    setPendingRejectId(withReject ? item.id : null);
    setIsNotesModalOpen(true);
  };

  const handleSaveNotes = () => {
    if (!notesListing) return;
    updateNotesMutation.mutate({
      id: notesListing.id,
      admin_notes: notesText.trim() || null,
      newStatus: pendingRejectId ? "rejected" : undefined,
    });
  };

  // Bulk select helpers
  const toggleSelectId = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(filteredListings.map((l) => l.id)));
  const clearSelection = () => setSelectedIds(new Set());

  // Copy phone helper
  const copyPhone = (phone, id) => {
    navigator.clipboard.writeText(phone).then(() => {
      setCopiedPhone(id);
      toast.success("Phone number copied!");
      setTimeout(() => setCopiedPhone(null), 2000);
    });
  };

  // Gallery helpers
  const openGallery = (listing, startIndex = 0) => {
    setGalleryListing(listing);
    setActiveImageIndex(startIndex);
  };

  const prevImage = () => {
    if (!galleryListing?.images?.length) return;
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryListing.images.length - 1));
  };

  const nextImage = () => {
    if (!galleryListing?.images?.length) return;
    setActiveImageIndex((prev) => (prev < galleryListing.images.length - 1 ? prev + 1 : 0));
  };

  // Relative date formatter
  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = new Date(ts);
    const diffMs = Date.now() - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  // Filter & Sort listings
  const filteredListings = listings
    .filter((item) => {
      const matchesSearch =
        (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.owner_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.owner_phone || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" ? true : item.status === statusFilter;
      const matchesType =
        listingTypeFilter === "all"
          ? true
          : (item.listing_type || "sell").toLowerCase() === listingTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sortBy === "price_low") {
        return Number(a.price || 0) - Number(b.price || 0);
      }
      if (sortBy === "price_high") {
        return Number(b.price || 0) - Number(a.price || 0);
      }
      return 0;
    });

  const pendingCount = listings.filter((l) => l.status === "pending").length;
  const availableCount = listings.filter((l) => l.status === "available").length;
  const soldCount = listings.filter((l) => l.status === "sold").length;
  const rejectedCount = listings.filter((l) => l.status === "rejected").length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="h-6 w-6 text-amber-500" />
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Public Property Moderation &amp; Contact Privacy
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Approve submissions, verify owner details, inspect gallery photos, and manage contact routing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
              {pendingCount} Pending Review
            </span>
          )}
          <button
            onClick={() => {
              setBulkMode((v) => !v);
              setSelectedIds(new Set());
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              bulkMode
                ? "border-amber-500 bg-amber-500/10 text-amber-600"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <ListChecks className="h-3.5 w-3.5" />
            {bulkMode ? "Exit Bulk Mode" : "Bulk Select"}
          </button>
        </div>
      </div>

      {/* Bulk action floating/sticky bar */}
      {bulkMode && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 shadow-sm">
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            {selectedIds.size} selected
          </span>
          <button onClick={selectAll} className="text-xs underline text-muted-foreground hover:text-foreground">
            Select all visible ({filteredListings.length})
          </button>
          <button onClick={clearSelection} className="text-xs underline text-muted-foreground hover:text-foreground">
            Clear
          </button>
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              disabled={selectedIds.size === 0 || bulkStatusMutation.isPending}
              onClick={() => bulkStatusMutation.mutate({ ids: [...selectedIds], newStatus: "available" })}
              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-40"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve All
            </button>
            <button
              disabled={selectedIds.size === 0 || bulkStatusMutation.isPending}
              onClick={() => bulkStatusMutation.mutate({ ids: [...selectedIds], newStatus: "sold" })}
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-40"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark Sold
            </button>
            <button
              disabled={selectedIds.size === 0 || bulkStatusMutation.isPending}
              onClick={() => bulkStatusMutation.mutate({ ids: [...selectedIds], newStatus: "rejected" })}
              className="flex items-center gap-1 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 disabled:opacity-40"
            >
              <XCircle className="h-3.5 w-3.5" /> Reject All
            </button>
          </div>
        </div>
      )}

      {/* Status Filter Cards */}
      <div className="grid gap-4 sm:grid-cols-5">
        <button
          onClick={() => setStatusFilter("all")}
          className={`rounded-xl border p-4 text-left transition-all ${
            statusFilter === "all"
              ? "border-amber-500 bg-amber-500/10 shadow-sm"
              : "border-border bg-card hover:bg-muted/40"
          }`}
        >
          <div className="text-xs uppercase text-muted-foreground font-medium">All Submissions</div>
          <div className="mt-1 font-display text-2xl font-bold">{listings.length}</div>
        </button>

        <button
          onClick={() => setStatusFilter("pending")}
          className={`rounded-xl border p-4 text-left transition-all ${
            statusFilter === "pending"
              ? "border-amber-500 bg-amber-500/10 shadow-sm"
              : "border-border bg-card hover:bg-muted/40"
          }`}
        >
          <div className="text-xs uppercase text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Pending Review
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-amber-600 dark:text-amber-400">
            {pendingCount}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("available")}
          className={`rounded-xl border p-4 text-left transition-all ${
            statusFilter === "available"
              ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
              : "border-border bg-card hover:bg-muted/40"
          }`}
        >
          <div className="text-xs uppercase text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Approved / Live
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {availableCount}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("sold")}
          className={`rounded-xl border p-4 text-left transition-all ${
            statusFilter === "sold"
              ? "border-indigo-500 bg-indigo-500/10 shadow-sm"
              : "border-border bg-card hover:bg-muted/40"
          }`}
        >
          <div className="text-xs uppercase text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
            <CheckCheck className="h-3.5 w-3.5" /> Sold / Closed
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {soldCount}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("rejected")}
          className={`rounded-xl border p-4 text-left transition-all ${
            statusFilter === "rejected"
              ? "border-destructive/50 bg-destructive/10 shadow-sm"
              : "border-border bg-card hover:bg-muted/40"
          }`}
        >
          <div className="text-xs uppercase text-destructive font-semibold flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" /> Rejected
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-destructive">
            {rejectedCount}
          </div>
        </button>
      </div>

      {/* Search, Listing Type Filter & Sort Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, location, or seller name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Listing Type Pills (Sell / Rent) */}
        <div className="flex items-center rounded-xl border border-border bg-card p-1">
          <button
            onClick={() => setListingTypeFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              listingTypeFilter === "all"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setListingTypeFilter("sell")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              listingTypeFilter === "sell"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            For Sale
          </button>
          <button
            onClick={() => setListingTypeFilter("rent")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              listingTypeFilter === "rent"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            For Rent
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <ArrowUpDown className="h-3.5 w-3.5 text-amber-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-foreground focus:outline-none cursor-pointer text-xs"
          >
            <option value="newest" className="bg-card text-foreground">Newest First</option>
            <option value="oldest" className="bg-card text-foreground">Oldest First</option>
            <option value="price_high" className="bg-card text-foreground">Price: High to Low</option>
            <option value="price_low" className="bg-card text-foreground">Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredListings.length > 0 ? (
          filteredListings.map((item) => {
            const hasMultipleImages = item.images && item.images.length > 1;
            const isAvailable = item.status === "available";
            const isSold = item.status === "sold";
            const isRejected = item.status === "rejected";
            const isPending = item.status === "pending";

            // Sanitized owner phone for WhatsApp / Call
            const cleanPhone = (item.owner_phone || "").replace(/\D/g, "");
            const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
            const waMessage = `Hi ${item.owner_name}, regarding your property listing "${item.title}" on PropertyFlow:`;

            return (
              <div
                key={item.id}
                onClick={() => bulkMode && toggleSelectId(item.id)}
                className={`flex flex-col justify-between rounded-2xl border bg-card overflow-hidden shadow-sm transition-all ${
                  bulkMode ? "cursor-pointer" : ""
                } ${
                  selectedIds.has(item.id)
                    ? "border-amber-500 ring-2 ring-amber-500/40"
                    : "border-border hover:border-amber-500/40 hover:shadow-md"
                }`}
              >
                <div>
                  {/* Property Image Header */}
                  <div className="relative h-48 bg-muted overflow-hidden group/img">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="h-full w-full object-cover cursor-pointer transition-transform duration-300 group-hover/img:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          openGallery(item, 0);
                        }}
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-amber-500/10 to-muted">
                        <Building2 className="h-10 w-10 text-amber-500/40" />
                      </div>
                    )}

                    {/* Bulk Selection Checkbox */}
                    {bulkMode && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectId(item.id);
                        }}
                        className={`absolute top-3 left-3 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors shadow-sm ${
                          selectedIds.has(item.id)
                            ? "bg-amber-500 border-amber-500"
                            : "bg-white/90 border-gray-400"
                        }`}
                      >
                        {selectedIds.has(item.id) && <Check className="h-3 w-3 text-white font-bold" />}
                      </div>
                    )}

                    {/* Gallery Count Pill */}
                    {item.images && item.images.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openGallery(item, 0);
                        }}
                        className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md hover:bg-black/80 transition-colors"
                        style={{ marginLeft: bulkMode ? "28px" : "0" }}
                      >
                        <Images className="h-3 w-3" />
                        <span>{item.images.length} photo{item.images.length > 1 ? "s" : ""}</span>
                      </button>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold uppercase backdrop-blur-md shadow-sm ${
                        isAvailable
                          ? "bg-emerald-500/90 text-white"
                          : isPending
                          ? "bg-amber-500/90 text-slate-950"
                          : isSold
                          ? "bg-indigo-600/90 text-white"
                          : "bg-destructive/90 text-white"
                      }`}
                    >
                      {item.status}
                    </span>

                    {/* Listing Type & Category */}
                    <span className="absolute bottom-3 left-3 rounded-md bg-black/65 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm capitalize">
                      {item.listing_type || "sell"} • {item.property_type || "Property"}
                    </span>

                    {/* Submission Date */}
                    <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/65 px-2 py-0.5 text-[11px] text-white/90 backdrop-blur-sm">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(item.created_at)}
                    </span>
                  </div>

                  {/* Content Area */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-base font-bold line-clamp-1">
                          {item.title}
                        </h3>
                        {/* Live listing external link */}
                        <a
                          href={`/listings?id=${item.id}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="View on public site"
                          className="text-muted-foreground hover:text-amber-500 transition-colors p-0.5 shrink-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{item.location || "Location not provided"}</span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between border-y border-border py-2 text-xs">
                      <span className="font-display text-lg font-extrabold text-amber-600 dark:text-amber-400">
                        ₹{Number(item.price || 0).toLocaleString()}
                      </span>
                      <div className="text-muted-foreground space-x-2">
                        {item.bhk && <span>{item.bhk} BHK</span>}
                        {item.land_size_cents && <span>{item.land_size_cents} cents</span>}
                      </div>
                    </div>

                    {/* Owner Contact Box with Direct WhatsApp + Call Buttons */}
                    <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-xs space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 font-semibold text-foreground truncate">
                          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">Owner: {item.owner_name}</span>
                        </span>

                        {/* Direct Contact Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Call Button */}
                          {item.owner_phone && (
                            <a
                              href={`tel:${item.owner_phone}`}
                              onClick={(e) => e.stopPropagation()}
                              title="Call Owner Directly"
                              className="rounded-md border border-border bg-background p-1.5 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
                            >
                              <Phone className="h-3 w-3" />
                            </a>
                          )}

                          {/* WhatsApp Button */}
                          {waPhone && (
                            <a
                              href={`https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title="Chat with Owner on WhatsApp"
                              className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-1.5 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                            >
                              <MessageCircle className="h-3 w-3" />
                            </a>
                          )}

                          {/* Copy Phone Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyPhone(item.owner_phone, item.id);
                            }}
                            title="Copy Phone Number"
                            className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            {copiedPhone === item.id ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            <span>{item.owner_phone}</span>
                          </button>
                        </div>
                      </div>

                      {/* Contact Privacy Mode Row */}
                      <div className="flex items-center justify-between border-t border-border/50 pt-2">
                        <div className="flex items-center gap-1.5 font-medium">
                          {item.hide_owner_contact !== false ? (
                            <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                              <EyeOff className="h-3.5 w-3.5" /> Masked: Admin Phone Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <Eye className="h-3.5 w-3.5" /> Owner Phone Public
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openContactDialog(item);
                          }}
                          className="flex items-center gap-1 text-amber-600 hover:underline font-bold"
                        >
                          <Settings2 className="h-3.5 w-3.5" /> Configure
                        </button>
                      </div>
                    </div>

                    {/* Admin Notes Preview Banner */}
                    {item.admin_notes && (
                      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-1.5">
                        <StickyNote className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{item.admin_notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons Toolbar */}
                <div className="border-t border-border/40 p-4 pt-3 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {/* Approve / Pending Toggle */}
                    {item.status !== "available" ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatusMutation.mutate({ id: item.id, newStatus: "available" });
                        }}
                        className="flex items-center justify-center gap-1 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatusMutation.mutate({ id: item.id, newStatus: "pending" });
                        }}
                        className="flex items-center justify-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 py-2 text-xs font-bold text-amber-600 hover:bg-amber-500/20"
                      >
                        <Clock className="h-3.5 w-3.5" /> Pending
                      </button>
                    )}

                    {/* Reject or Delete */}
                    {item.status !== "rejected" ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openNotesModal(item, true);
                        }}
                        className="flex items-center justify-center gap-1 rounded-lg border border-destructive/40 bg-destructive/10 py-2 text-xs font-bold text-destructive hover:bg-destructive/20"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(item.id);
                        }}
                        className="flex items-center justify-center gap-1 rounded-lg border border-border bg-muted py-2 text-xs font-bold text-muted-foreground hover:bg-destructive hover:text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    )}

                    {/* Note Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openNotesModal(item, false);
                      }}
                      className={`flex items-center justify-center gap-1 rounded-lg border py-2 text-xs font-bold transition-colors ${
                        item.admin_notes
                          ? "border-blue-500/40 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
                          : "border-border bg-muted text-muted-foreground hover:bg-muted/60"
                      }`}
                    >
                      <StickyNote className="h-3.5 w-3.5" />
                      {item.admin_notes ? "Note ✓" : "Note"}
                    </button>
                  </div>

                  {/* Secondary Row: Mark as Sold / Preview */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    {item.status !== "sold" ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatusMutation.mutate({ id: item.id, newStatus: "sold" });
                        }}
                        className="text-[11px] font-semibold text-muted-foreground hover:text-indigo-600 flex items-center gap-1 transition-colors"
                      >
                        <CheckCheck className="h-3 w-3" /> Mark as Sold / Closed
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatusMutation.mutate({ id: item.id, newStatus: "available" });
                        }}
                        className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Re-open as Available
                      </button>
                    )}

                    <a
                      href={`/listings?id=${item.id}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] font-semibold text-amber-600 hover:underline flex items-center gap-1 ml-auto"
                    >
                      <span>Public view</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-muted-foreground space-y-2">
            <Inbox className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <div className="text-base font-semibold">No public property listings match the selected filters</div>
            <div className="text-xs">Try selecting a different status filter, changing listing type, or clearing your search.</div>
          </div>
        )}
      </div>

      {/* Image Gallery Lightbox Modal */}
      <Dialog open={Boolean(galleryListing)} onOpenChange={(open) => !open && setGalleryListing(null)}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-black/95 text-white border-zinc-800">
          <div className="relative flex flex-col">
            {/* Gallery Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-sm text-white line-clamp-1">
                  {galleryListing?.title}
                </h3>
                <p className="text-xs text-zinc-400">
                  Photo {activeImageIndex + 1} of {galleryListing?.images?.length || 1} • {galleryListing?.location || "Kerala"}
                </p>
              </div>
              <button
                onClick={() => setGalleryListing(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-xs"
              >
                Close ✕
              </button>
            </div>

            {/* Main Image Stage */}
            <div className="relative h-[65vh] flex items-center justify-center bg-black/80">
              {galleryListing?.images?.[activeImageIndex] ? (
                <img
                  src={galleryListing.images[activeImageIndex]}
                  alt={`Listing photo ${activeImageIndex + 1}`}
                  className="max-h-full max-w-full object-contain select-none"
                />
              ) : (
                <div className="text-zinc-500 text-sm">No image available</div>
              )}

              {/* Navigation Arrows */}
              {galleryListing?.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition-colors backdrop-blur-md"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition-colors backdrop-blur-md"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails Row */}
            {galleryListing?.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3 bg-zinc-900 border-t border-zinc-800">
                {galleryListing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                      activeImageIndex === idx ? "border-amber-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Notes / Rejection Reason Modal */}
      <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-blue-500" />
              {pendingRejectId ? "Rejection Reason" : "Admin Note"}
            </DialogTitle>
            <DialogDescription>
              {pendingRejectId ? (
                <>Add an internal note before rejecting <strong>{notesListing?.title}</strong>. Visible to admins only.</>
              ) : (
                <>Internal note for <strong>{notesListing?.title}</strong>. Not shown to the public.</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3">
            <textarea
              rows={4}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder={
                pendingRejectId
                  ? "e.g. Duplicate listing, invalid phone number, pricing discrepancy..."
                  : "e.g. Verified by agent via WhatsApp on 18 Sep..."
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {pendingRejectId && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <XCircle className="h-3.5 w-3.5 shrink-0" />
                This listing will be marked as <strong>&nbsp;Rejected</strong> when you save.
              </div>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => {
                setIsNotesModalOpen(false);
                setPendingRejectId(null);
              }}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNotes}
              disabled={updateNotesMutation.isPending}
              className={`rounded-lg px-4 py-2 text-xs font-bold text-white ${
                pendingRejectId
                  ? "bg-destructive hover:bg-destructive/80"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {updateNotesMutation.isPending
                ? "Saving..."
                : pendingRejectId
                ? "Reject & Save Note"
                : "Save Note"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Contact Display Settings Dialog */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-amber-500" />
              Public Contact Preferences
            </DialogTitle>
            <DialogDescription>
              Configure which contact details appear to buyers on the public listing page for{" "}
              <strong>{selectedListing?.title}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Toggle Switch */}
            <div className={`rounded-xl border p-4 space-y-3 transition-colors ${hideOwnerContact ? "border-amber-500/50 bg-amber-500/10" : "border-border bg-muted/30"}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>Hide Owner&apos;s Phone Number</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${hideOwnerContact ? "bg-amber-500 text-slate-950" : "bg-muted text-muted-foreground"}`}>
                      {hideOwnerContact ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {hideOwnerContact
                      ? "Public WhatsApp chats & calls route to Admin (+918138802204)"
                      : "Public WhatsApp chats & calls route directly to Owner"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setHideOwnerContact(!hideOwnerContact)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    hideOwnerContact ? "bg-amber-500" : "bg-muted-foreground/40"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      hideOwnerContact ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Admin Phone Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Admin / Agency Contact Phone Number
              </label>
              <input
                type="text"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder="+918138802204"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                WhatsApp inquiries and call buttons on public pages will route to this number.
              </p>
            </div>

            {/* Admin Display Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Admin / Agency Contact Display Name
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="PropertyFlow Desk"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveContactSettings}
              disabled={updateContactMutation.isPending}
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
            >
              {updateContactMutation.isPending ? "Saving..." : "Save Preferences"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
