"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2,
  Search,
  MapPin,
  Tag,
  Trash2,
  ExternalLink,
  Phone,
  User,
  CheckCircle2,
  Clock,
  Filter,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPropertiesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch all CRM properties with agent profile info
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["admin-all-properties"],
    queryFn: async () => {
      const [propRes, profilesRes] = await Promise.all([
        supabase.from("properties").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name, company"),
      ]);

      const props = propRes.data ?? [];
      const profiles = profilesRes.data ?? [];

      return props.map((p) => {
        const agent = profiles.find((prof) => prof.id === p.agent_id);
        return {
          ...p,
          agentName: agent?.full_name || "Unknown Agent",
          company: agent?.company || "Independent",
        };
      });
    },
  });

  // Delete Property mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Property removed from catalog.");
      queryClient.invalidateQueries(["admin-all-properties"]);
    },
    onError: (err) => {
      toast.error(`Delete failed: ${err.message}`);
    },
  });

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.agentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.owner_name || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || p.property_type === typeFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalValue = properties.reduce((sum, p) => sum + Number(p.price || 0), 0);
  const availableCount = properties.filter((p) => p.status === "available").length;
  const soldCount = properties.filter((p) => p.status === "sold").length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-purple-500" />
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Platform Property Oversight
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            System-wide inventory of all properties listed by agents across the platform.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/30 px-4 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
          Total Inventory Value: ₹{totalValue.toLocaleString()}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs uppercase font-medium text-muted-foreground">
            Total Properties
          </div>
          <div className="mt-2 font-display text-3xl font-bold">{properties.length}</div>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <div className="text-xs uppercase font-semibold text-emerald-600 dark:text-emerald-400">
            Available Listings
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {availableCount}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5">
          <div className="text-xs uppercase font-semibold text-blue-600 dark:text-blue-400">
            Sold / Closed Deals
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-blue-600 dark:text-blue-400">
            {soldCount}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, location, or agent name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Filter className="h-3.5 w-3.5" />
            <span>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="villa">Villa</option>
              <option value="apartment">Apartment</option>
              <option value="plot">Plot</option>
              <option value="house">House</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>
          </div>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:border-purple-500/40 transition-all"
            >
              <div>
                <div className="relative h-44 bg-muted overflow-hidden">
                  {p.images && p.images.length > 0 ? (
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-purple-500/10 to-muted">
                      <Building2 className="h-10 w-10 text-purple-500/40" />
                    </div>
                  )}

                  <span className="absolute top-3 right-3 rounded-full bg-purple-600/90 px-2.5 py-0.5 text-xs font-bold text-white capitalize backdrop-blur-sm">
                    {p.status}
                  </span>

                  <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm capitalize">
                    {p.property_type}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-display text-base font-bold line-clamp-1">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-purple-500" />
                      <span className="truncate">{p.location || "Location N/A"}</span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between border-y border-border py-2 text-xs">
                    <span className="font-display text-lg font-extrabold text-purple-600 dark:text-purple-400">
                      ₹{Number(p.price || 0).toLocaleString()}
                    </span>
                    <div className="text-muted-foreground space-x-2">
                      {p.bhk && <span>{p.bhk} BHK</span>}
                      {p.land_size_cents && <span>{p.land_size_cents} Cents</span>}
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Listing Agent:</span>
                      <span className="font-semibold text-foreground">{p.agentName}</span>
                    </div>
                    {p.owner_name && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Owner:</span>
                        <span>{p.owner_name} ({p.owner_phone})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 flex justify-end">
                <button
                  onClick={() => deleteMutation.mutate(p.id)}
                  className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive hover:text-white transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove Property
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-muted-foreground space-y-2">
            <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <div className="text-base font-semibold">No properties matched filters</div>
            <div className="text-xs">Adjust your search term or select all property types.</div>
          </div>
        )}
      </div>
    </div>
  );
}
