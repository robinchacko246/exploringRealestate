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

  // Contact settings mutation
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, hide_owner_contact, admin_contact_phone, admin_contact_name }) => {
      const { error } = await supabase
        .from("public_property_listings")
        .update({
          hide_owner_contact,
          admin_contact_phone,
          admin_contact_name,
        })
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
    setHideOwnerContact(item.hide_owner_contact !== false);
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

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.owner_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.owner_phone || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = listings.filter((l) => l.status === "pending").length;
  const availableCount = listings.filter((l) => l.status === "available").length;
  const rejectedCount = listings.filter((l) => l.status === "rejected").length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="h-6 w-6 text-amber-500" />
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Public Property Moderation & Contact Privacy
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Approve public listings and manage whether buyers see the owner&apos;s direct phone or your Admin phone number.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
            {pendingCount} Submissions Pending Review
          </span>
        </div>
      </div>

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
              className="flex flex-col justify-between rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all"
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
                      {item.land_size_cents && (
                        <span>{item.land_size_cents} cents</span>
                      )}
                    </div>
                  </div>

                  {/* Owner & Admin Contact Info Display */}
                  <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        Owner: {item.owner_name}
                      </span>
                      <span className="text-muted-foreground font-mono">{item.owner_phone}</span>
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
                        onClick={() => openContactDialog(item)}
                        className="flex items-center gap-1 text-amber-600 hover:underline font-bold"
                      >
                        <Settings2 className="h-3.5 w-3.5" /> Configure Contact
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 grid grid-cols-2 gap-2 border-t border-border/40 mt-2 pt-3">
                {item.status !== "available" ? (
                  <button
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: item.id,
                        newStatus: "available",
                      })
                    }
                    className="flex items-center justify-center gap-1 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: item.id,
                        newStatus: "pending",
                      })
                    }
                    className="flex items-center justify-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 py-2 text-xs font-bold text-amber-600 hover:bg-amber-500/20"
                  >
                    <Clock className="h-3.5 w-3.5" /> Mark Pending
                  </button>
                )}

                {item.status !== "rejected" ? (
                  <button
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: item.id,
                        newStatus: "rejected",
                      })
                    }
                    className="flex items-center justify-center gap-1 rounded-lg border border-destructive/40 bg-destructive/10 py-2 text-xs font-bold text-destructive hover:bg-destructive/20"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                ) : (
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-border bg-muted py-2 text-xs font-bold text-muted-foreground hover:bg-destructive hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                )}
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

      {/* Configure Contact Display Settings Dialog */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-amber-500" />
              Public Contact Preferences
            </DialogTitle>
            <DialogDescription>
              Configure which contact details appear to buyers on the public listing page for <strong>{selectedListing?.title}</strong>.
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
