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
import { Plus, Search, Phone, MessageCircle, Mail, Filter, Pencil, Trash2, User, Hash } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const CATEGORIES = ["buyer", "seller", "rental", "investor"];
const STATUSES = ["new", "active", "hot", "cold", "closed"];

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
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);  // client object to edit
  const [deleteId, setDeleteId] = useState(null);       // id to delete
  const [form, setForm] = useState(EMPTY);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
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
    const { error } = await supabase.from("clients").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Client added");
    setAddOpen(false);
    e.target.reset();
    qc.invalidateQueries({ queryKey: ["clients"] });
  }

  /* ── Edit ── */
  function openEdit(c) {
    setEditClient(c);
    setForm({
      name: c.name || "",
      phone: c.phone || "",
      whatsapp: c.whatsapp || "",
      email: c.email || "",
      category: c.category || "buyer",
      status: c.status || "new",
      notes: c.notes || "",
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
    toast.success("Client updated");
    setEditClient(null);
    qc.invalidateQueries({ queryKey: ["clients"] });
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
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
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
  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
      {/* Top accent bar by status */}
      <div className={`h-1 rounded-t-xl ${c.status === "hot" ? "bg-red-500" : c.status === "active" ? "bg-primary" : c.status === "cold" ? "bg-sky-400" : "bg-muted"}`} />

      <div className="flex flex-1 flex-col p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={c.name} />
            <div className="min-w-0">
              <div className="truncate font-semibold text-base">{c.name}</div>
              <div className="text-xs capitalize text-muted-foreground">{c.category}</div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <StatusBadge status={c.status} />
          </div>
        </div>

        {/* Details grid */}
        <div className="mt-4 space-y-2">
          {c.phone && (
            <DetailRow icon={Phone} label="Phone" value={c.phone} href={`tel:${c.phone}`} />
          )}
          {c.whatsapp && (
            <DetailRow
              icon={MessageCircle}
              label="WhatsApp"
              value={c.whatsapp}
              href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}
              accent
            />
          )}
          {c.email && (
            <DetailRow icon={Mail} label="Email" value={c.email} href={`mailto:${c.email}`} />
          )}
          {c.notes && (
            <div className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground leading-relaxed">
              {c.notes}
            </div>
          )}
        </div>

        {/* Footer: date + actions */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-[11px] text-muted-foreground">
            {c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={onEdit}
              title="Edit client"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
              title="Delete client"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
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
      <div>
        <Label className="mb-1 block text-xs font-medium">Notes</Label>
        {isControlled ? (
          <Textarea
            rows={3}
            value={defaultValues?.notes ?? ""}
            onChange={(e) => onChange((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Looking for 10 cent plot near Kakkanad…"
          />
        ) : (
          <Textarea name="notes" rows={3} placeholder="Looking for 10 cent plot near Kakkanad…" />
        )}
      </div>
      <DialogFooter>
        <Button type="submit">{submitLabel}</Button>
      </DialogFooter>
    </form>
  );
}
