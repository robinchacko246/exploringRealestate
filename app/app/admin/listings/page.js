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
  ShieldAlert,
  Eye,
  EyeOff,
  Settings2,
  PhoneCall,
  Copy,
  Check,
  StickyNote,
  CalendarDays,
  ListChecks,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Contact modal state
  const [hideOwnerContact, setHideOwnerContact] = useState(true);
  const [adminPhone, setAdminPhone] = useState("+918138802204");
  const [adminName, setAdminName] = useState("PropertyFlow Desk");

  // Feature 2: Admin notes / rejection reason
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [notesListing, setNotesListing] = useState(null);
  const [notesText, setNotesText] = useState("");
  const [pendingRejectId, setPendingRejectId] = useState(null);

  // Feature 3: Bulk select
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  // Feature 4: Quick-copy phone
  const [copiedPhone, setCopiedPhone] = useState(null);

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
    onSuccess: () => {
      toast.success("Listing status updated!");
      queryClient.invalidateQueries(["admin-public-listings"]);
    },
    onError: (err) => {
      toast.error(`Error updating status: ${err.message}`);
    },
  });

  // Feature 2: Admin notes mutation
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

  // Feature 3: Bulk status mutation
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

  // Feature 2: Notes modal helpers
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

  // Feature 3: Bulk select helpers
  const toggleSelectId = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(filteredListings.map((l) => l.id)));
  const clearSelection = () => setSelectedIds(new Set());

  // Feature 4: Copy phone
  const copyPhone = (phone, id) => {
    navigator.clipboard.writeText(phone).then(() => {
      setCopiedPhone(id);
      toast.success("Phone number copied!");
      setTimeout(() => setCopiedPhone(null), 2000);
    });
  };

  // Feature 1: Relative date formatter
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

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.owner_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.owner_phone || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount   = listings.filter((l) => l.status === "pending").length;
  const availableCount = listings.filter((l) => l.status === "available").length;
  const rejectedCount  = listings.filter((l) => l.status === "rejected").length;

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
            Approve public listings and manage whether buyers see the owner&apos;s direct phone or your Admin phone number.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
              {pendingCount} Pending Review
            </span>
          )}
          {/* Feature 3: Bulk mode toggle */}
          <button
            onClick={() => { setBulkMode((v) => !v); setSelectedIds(new Set()); }}
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

      {/* Feature 3: Bulk action bar */}
      {bulkMode && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            {selectedIds.size} selected
          </span>
          <button onClick={selectAll} className="text-xs underline text-muted-foreground hover:text-foreground">
            Select all ({filteredListings.length})
          </button>
          <button onClick={clearSelection} className="text-xs underline text-muted-foreground hover:text-foreground">
            Clear
          </button>
          <div className="ml-auto flex gap-2">
            <button
              disabled={selectedIds.size === 0 || bulkStatusMutation.isPending}
              onClick={() => bulkStatusMutation.mutate({ ids: [...selectedIds], newStatus: "available" })}
              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-40"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve All
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
      <div className="grid gap-4 sm:grid-cols-4">
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
            <CheckCircle2 className="h-3.5 w-3.5" /> Approved
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {availableCount}
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search listings by title, location, or seller name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Listings Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredListings.length > 0 ? (
          filteredListings.map((item) => (
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
                <div className="relative h-44 bg-muted overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-amber-500/10 to-muted">
                      <Building2 className="h-10 w-10 text-amber-500/40" />
                    </div>
                  )}

                  {/* Feature 3: Bulk checkbox */}
                  {bulkMode && (
                    <div
                      onClick={(e) => { e.stopPropagation(); toggleSelectId(item.id); }}
                      className={`absolute top-3 left-3 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedIds.has(item.id)
                          ? "bg-amber-500 border-amber-500"
                          : "bg-white/80 border-gray-400"
                      }`}
                    >
                      {selectedIds.has(item.id) && <Check className="h-3 w-3 text-white" />}
                    </div>
                  )}

                  <span
                    className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold uppercase backdrop-blur-md shadow-sm ${
                      item.status === "available"
                        ? "bg-emerald-500/90 text-white"
                        : item.status === "pending"
                        ? "bg-amber-500/90 text-slate-950"
                        : "bg-destructive/90 text-white"
                    }`}
                  >
                    {item.status}
                  </span>

                  <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm capitalize">
                    {item.listing_type || "sell"} • {item.property_type || "Property"}
                  </span>

                  {/* Feature 1: Submission date bottom-right */}
                  <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[11px] text-white/80 backdrop-blur-sm">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(item.created_at)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-display text-base font-bold line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-amber-500" />
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

                  {/* Owner & Admin Contact Info */}
                  <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        Owner: {item.owner_name}
                      </span>
                      {/* Feature 4: Quick-copy phone */}
                      <button
                        onClick={(e) => { e.stopPropagation(); copyPhone(item.owner_phone, item.id); }}
                        title="Copy phone number"
                        className="flex items-center gap-1 font-mono text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedPhone === item.id
                          ? <Check className="h-3 w-3 text-emerald-500" />
                          : <Copy className="h-3 w-3" />}
                        {item.owner_phone}
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/50 pt-2">
                      <div className="flex items-center gap-1.5 font-medium">
                        {item.hide_owner_contact !== false ? (
                          <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                            <EyeOff className="h-3.5 w-3.5" /> Showing Admin Phone
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Eye className="h-3.5 w-3.5" /> Owner Phone Public
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); openContactDialog(item); }}
                        className="flex items-center gap-1 text-amber-600 hover:underline font-bold"
                      >
                        <Settings2 className="h-3.5 w-3.5" /> Configure
                      </button>
                    </div>
                  </div>

                  {/* Feature 2: Admin notes preview */}
                  {item.admin_notes && (
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-1.5">
                      <StickyNote className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{item.admin_notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons — 3 columns */}
              <div className="grid grid-cols-3 gap-2 border-t border-border/40 p-4 pt-3">
                {item.status !== "available" ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ id: item.id, newStatus: "available" }); }}
                    className="flex items-center justify-center gap-1 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ id: item.id, newStatus: "pending" }); }}
                    className="flex items-center justify-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 py-2 text-xs font-bold text-amber-600 hover:bg-amber-500/20"
                  >
                    <Clock className="h-3.5 w-3.5" /> Pending
                  </button>
                )}

                {/* Feature 2: Reject now opens notes modal first */}
                {item.status !== "rejected" ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); openNotesModal(item, true); }}
                    className="flex items-center justify-center gap-1 rounded-lg border border-destructive/40 bg-destructive/10 py-2 text-xs font-bold text-destructive hover:bg-destructive/20"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(item.id); }}
                    className="flex items-center justify-center gap-1 rounded-lg border border-border bg-muted py-2 text-xs font-bold text-muted-foreground hover:bg-destructive hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                )}

                {/* Feature 2: Note button */}
                <button
                  onClick={(e) => { e.stopPropagation(); openNotesModal(item, false); }}
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
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-muted-foreground space-y-2">
            <Inbox className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <div className="text-base font-semibold">No public property listings found</div>
            <div className="text-xs">Try selecting a different status filter or clearing your search.</div>
          </div>
        )}
      </div>

      {/* Feature 2: Admin Notes / Rejection Reason Modal */}
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
                  ? "e.g. Duplicate listing, incomplete details, suspicious price..."
                  : "e.g. Verified by field agent on 18 Sep..."
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
              onClick={() => { setIsNotesModalOpen(false); setPendingRejectId(null); }}
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
