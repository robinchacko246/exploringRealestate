"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Phone, Filter, Pencil, Trash2, User, Hash, IndianRupee, Download } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import Link from "next/link";
import { Zap, Crown } from "lucide-react";

const CATEGORIES = ["buyer", "seller", "rental", "investor"];
const STATUSES = ["new", "active", "hot", "cold", "closed"];
const PROPERTY_TYPES = ["plot", "villa", "apartment", "house", "commercial", "land"];

function fmtINR(n) {
  if (!n) return null;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function exportClientsToCSV(clients) {
  if (!clients || clients.length === 0) {
    toast.error("No clients to export");
    return;
  }
  const headers = ["Name", "Category", "Status", "Phone", "WhatsApp", "Email", "Property Type", "Min Budget (INR)", "Max Budget (INR)", "Location", "Notes"];
  const rows = clients.map((c) => {
    const req = c.requirements?.[0] || {};
    return [
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${c.category || ""}"`,
      `"${c.status || ""}"`,
      `"${c.phone || ""}"`,
      `"${c.whatsapp || ""}"`,
      `"${c.email || ""}"`,
      `"${req.property_type || ""}"`,
      req.budget_min ?? "",
      req.budget_max ?? "",
      `"${(req.location || "").replace(/"/g, '""')}"`,
      `"${(c.notes || "").replace(/"/g, '""')}"`,
    ].join(",");
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `clients_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success("Clients exported to CSV");
}

const STATUS_STYLES = {
  hot: "bg-red-500/15 text-red-600 dark:text-red-400",
  active: "bg-primary/15 text-primary",
  new: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  closed: "bg-muted text-muted-foreground",
  cold: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
};

function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[status] ?? STATUS_STYLES.new}`}>
      {status}
    </span>
  );
}

function Avatar({ name }) {
  const initials = name?.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase() || "?";
  return (
    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">
      {initials}
    </div>
  );
}

function IconLink({ icon: Icon, href, accent, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={label}
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition hover:bg-accent
        ${accent ? "border-primary/30 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </a>
  );
}

/* ─────────────── Empty form state ─────────────── */
const EMPTY = { name: "", phone: "", whatsapp: "", email: "", category: "buyer", status: "new", notes: "" };

export default function ClientsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { plan, canAddClient } = usePlanLimits();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);  // client object to edit
  const [deleteId, setDeleteId] = useState(null);       // id to delete
  const [form, setForm] = useState(EMPTY);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*, requirements(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = clients.filter((c) => {
    const matchesQ = !q ||
      c.name?.toLowerCase().includes(q.toLowerCase()) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q.toLowerCase());
    const matchesF = filter === "all" || c.category === filter;
    return matchesQ && matchesF;
  });

  /* ── Add ── */
  async function handleAdd(e) {
    e.preventDefault();
    if (!user) return;

    const check = canAddClient(clients.length);
    if (!check.allowed) {
      toast.error(check.reason);
      setAddOpen(false);
      setUpgradeOpen(true);
      return;
    }
    const fd = new FormData(e.target);
    const payload = {
      agent_id: user.id,
      name: String(fd.get("name") || ""),
      phone: String(fd.get("phone") || ""),
      whatsapp: String(fd.get("whatsapp") || ""),
      email: String(fd.get("email") || ""),
      category: fd.get("category"),
      status: fd.get("status") || "new",
      notes: String(fd.get("notes") || ""),
    };
    const { data: newClient, error } = await supabase.from("clients").insert(payload).select().single();
    if (error) { toast.error(error.message); return; }

    // Optionally save requirement if provided
    const property_type = fd.get("property_type");
    const budget_min = fd.get("budget_min") ? Number(fd.get("budget_min")) : null;
    const budget_max = fd.get("budget_max") ? Number(fd.get("budget_max")) : null;
    const location = String(fd.get("req_location") || "");
    const bhk = fd.get("bhk") ? Number(fd.get("bhk")) : null;

    if (property_type || budget_min || budget_max || location || bhk) {
      await supabase.from("requirements").insert({
        agent_id: user.id,
        client_id: newClient.id,
        property_type: property_type || "plot",
        budget_min,
        budget_max,
        location,
        bhk,
        notes: payload.notes,
      });
    }

    toast.success("Client added");
    setAddOpen(false);
    e.target.reset();
    qc.invalidateQueries({ queryKey: ["clients"] });
    qc.invalidateQueries({ queryKey: ["requirements-full"] });
  }

  /* ── Edit ── */
  function openEdit(c) {
    setEditClient(c);
    const req = c.requirements?.[0] || {};
    setForm({
      name: c.name || "",
      phone: c.phone || "",
      whatsapp: c.whatsapp || "",
      email: c.email || "",
      category: c.category || "buyer",
      status: c.status || "new",
      notes: c.notes || "",
      req_id: req.id || null,
      property_type: req.property_type || "plot",
      req_location: req.location || "",
      budget_min: req.budget_min ?? "",
      budget_max: req.budget_max ?? "",
      bhk: req.bhk ?? "",
    });
  }

  async function handleEdit(e) {
    e.preventDefault();
    const { error } = await supabase
      .from("clients")
      .update({
        name: form.name,
        phone: form.phone,
        whatsapp: form.whatsapp,
        email: form.email,
        category: form.category,
        status: form.status,
        notes: form.notes,
      })
      .eq("id", editClient.id);
    if (error) { toast.error(error.message); return; }

    const reqPayload = {
      property_type: form.property_type || "plot",
      location: form.req_location || "",
      budget_min: form.budget_min ? Number(form.budget_min) : null,
      budget_max: form.budget_max ? Number(form.budget_max) : null,
      bhk: form.bhk ? Number(form.bhk) : null,
    };

    if (form.req_id) {
      await supabase.from("requirements").update(reqPayload).eq("id", form.req_id);
    } else if (form.property_type || form.budget_min || form.budget_max || form.req_location || form.bhk) {
      await supabase.from("requirements").insert({
        agent_id: user.id,
        client_id: editClient.id,
        ...reqPayload,
      });
    }

    toast.success("Client updated");
    setEditClient(null);
    qc.invalidateQueries({ queryKey: ["clients"] });
    qc.invalidateQueries({ queryKey: ["requirements-full"] });
  }

  /* ── Delete ── */
  async function handleDelete() {
    const { error } = await supabase.from("clients").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success("Client deleted");
    setDeleteId(null);
    qc.invalidateQueries({ queryKey: ["clients"] });
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {clients.length} total · {filtered.length} shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportClientsToCSV(filtered)} className="gap-1.5 text-xs">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Dialog open={addOpen} onOpenChange={(v) => {
            if (v) {
              const check = canAddClient(clients.length);
              if (!check.allowed) {
                toast.error(check.reason);
                setUpgradeOpen(true);
                return;
              }
            }
            setAddOpen(v);
          }}>
            <DialogTrigger asChild>
              <Button className="shadow-[var(--shadow-glow)]">
                <Plus className="mr-1.5 h-4 w-4" /> Add client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>New client</DialogTitle></DialogHeader>
              <ClientForm onSubmit={handleAdd} submitLabel="Save client" />
            </DialogContent>
          </Dialog>
        </div>

        {/* Upgrade Plan Modal */}
        <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
          <DialogContent className="max-w-md text-center p-6">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Crown className="h-6 w-6" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">Upgrade Your Plan</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mt-2">
              You have reached the <strong>{plan.maxClients} client limit</strong> on your <strong>{plan.name}</strong>. Upgrade to add more clients and unlock premium realtor tools!
            </p>
            <div className="my-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-left space-y-2">
              <div className="font-semibold text-xs text-primary flex items-center gap-1.5">
                <Zap className="h-4 w-4" /> Pro Realtor (₹499/mo)
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc">
                <li>Up to 50 Clients & 60 Properties</li>
                <li>Up to 2 Images per Property</li>
                <li>AI Requirement Matcher</li>
              </ul>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button asChild className="w-full gap-2">
                <Link href="/app/billing">
                  <Crown className="h-4 w-4" /> View Billing & Upgrade
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone or email…" className="pl-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44">
            <Filter className="mr-1.5 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground">
            <User className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-semibold">No clients yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add your first client to start tracking requirements.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <ClientCard
              key={c.id}
              client={c}
              onEdit={() => openEdit(c)}
              onDelete={() => setDeleteId(c.id)}
            />
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editClient} onOpenChange={(v) => !v && setEditClient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit client</DialogTitle></DialogHeader>
          <ClientForm
            defaultValues={form}
            onChange={setForm}
            onSubmit={handleEdit}
            submitLabel="Save changes"
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the client and all their data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─────────────── Client Card ─────────────── */
function ClientCard({ client: c, onEdit, onDelete }) {
  const req = c.requirements?.[0];
  const phone = c.phone || c.whatsapp;
  const hasBudget = req && (req.budget_min || req.budget_max);

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
      <div>
        {/* Header: Avatar, Name & Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={c.name} />
            <div className="truncate font-semibold text-base">{c.name}</div>
          </div>
          <StatusBadge status={c.status} />
        </div>

        {/* Minimal Details: Phone & Budget */}
        <div className="mt-3 space-y-2 text-xs">
          {phone && (
            <DetailRow icon={Phone} label="Phone" value={phone} href={`tel:${phone}`} />
          )}

          <div className="flex items-center gap-2 rounded-md bg-emerald-500/8 px-2.5 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <IndianRupee className="h-3.5 w-3.5 shrink-0" />
            <span className="text-muted-foreground font-normal min-w-[40px]">Budget</span>
            <span>
              {hasBudget
                ? `${req.budget_min ? fmtINR(req.budget_min) : "0"} – ${req.budget_max ? fmtINR(req.budget_max) : "∞"}`
                : "Not specified"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Date & Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
        <span className="text-[11px] text-muted-foreground">
          {c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
        </span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={onEdit}
            title="Edit client"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            title="Delete client"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, href, accent }) {
  const content = (
    <div className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition
      ${href ? "cursor-pointer hover:bg-accent" : ""}
      ${accent ? "bg-primary/8 text-primary" : "text-foreground"}`}>
      <Icon className={`h-3.5 w-3.5 shrink-0 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      <span className="min-w-[40px] text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
  if (href) return <a href={href} target="_blank" rel="noreferrer">{content}</a>;
  return content;
}

/* ─────────────── Client Form (shared for add + edit) ─────────────── */
function ClientForm({ defaultValues, onChange, onSubmit, submitLabel }) {
  const isControlled = !!onChange;

  function field(name, label, props = {}) {
    const controlled = isControlled
      ? { value: defaultValues?.[name] ?? "", onChange: (e) => onChange((prev) => ({ ...prev, [name]: e.target.value })) }
      : {};
    return (
      <div>
        <Label className="mb-1 block text-xs font-medium">{label}</Label>
        <Input name={name} {...controlled} {...props} />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {field("name", "Full name *", { required: true, placeholder: "Rajesh Kumar" })}
      <div className="grid grid-cols-2 gap-3">
        {field("phone", "Phone", { placeholder: "+91 98765 43210" })}
        {field("whatsapp", "WhatsApp", { placeholder: "+91 98765 43210" })}
      </div>
      {field("email", "Email", { type: "email", placeholder: "rajesh@email.com" })}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1 block text-xs font-medium">Category</Label>
          {isControlled ? (
            <Select value={defaultValues?.category} onValueChange={(v) => onChange((p) => ({ ...p, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
            </Select>
          ) : (
            <Select name="category" defaultValue="buyer">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
        <div>
          <Label className="mb-1 block text-xs font-medium">Status</Label>
          {isControlled ? (
            <Select value={defaultValues?.status} onValueChange={(v) => onChange((p) => ({ ...p, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
            </Select>
          ) : (
            <Select name="status" defaultValue="new">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Property Requirement & Budget Range Section */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
        <div className="text-xs font-semibold text-foreground flex items-center justify-between">
          <span>Property Requirement & Budget (for Matching)</span>
          <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1 block text-xs font-medium">Property Type</Label>
            {isControlled ? (
              <Select value={defaultValues?.property_type || "plot"} onValueChange={(v) => onChange((p) => ({ ...p, property_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
              </Select>
            ) : (
              <Select name="property_type" defaultValue="plot">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
              </Select>
            )}
          </div>
          {field("req_location", "Preferred Location", { placeholder: "Kakkanad, Kochi" })}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {field("budget_min", "Min Budget (₹)", { type: "number", placeholder: "3000000" })}
          {field("budget_max", "Max Budget (₹)", { type: "number", placeholder: "6000000" })}
          {field("bhk", "BHK (if house/apt)", { type: "number", placeholder: "3" })}
        </div>
      </div>

      <div>
        <Label className="mb-1 block text-xs font-medium">Notes</Label>
        {isControlled ? (
          <Textarea
            rows={2}
            value={defaultValues?.notes ?? ""}
            onChange={(e) => onChange((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Looking for 10 cent plot near Kakkanad…"
          />
        ) : (
          <Textarea name="notes" rows={2} placeholder="Looking for 10 cent plot near Kakkanad…" />
        )}
      </div>
      <DialogFooter>
        <Button type="submit">{submitLabel}</Button>
      </DialogFooter>
    </form>
  );
}
