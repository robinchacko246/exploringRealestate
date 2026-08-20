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
import { Plus, MapPin, IndianRupee, ListChecks, Sparkles, Pencil, Trash2, BedDouble, Maximize2, Landmark } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const TYPES = ["plot", "villa", "apartment", "house", "commercial", "land"];
const STATUSES = ["new", "follow_up", "closed", "deal_completed"];

function fmtINR(n) {
  if (!n) return null;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

const STATUS_STYLES = {
  new: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  follow_up: "bg-primary/15 text-primary",
  closed: "bg-muted text-muted-foreground",
  deal_completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
};

const EMPTY_REQ = {
  client_id: "", property_type: "plot", location: "",
  budget_min: "", budget_max: "", land_size_cents: "",
  bhk: "", nearby: "", notes: "", status: "new",
};

export default function RequirementsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [editReq, setEditReq] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState(EMPTY_REQ);

  const { data: reqs = [] } = useQuery({
    queryKey: ["requirements"],
    queryFn: async () => {
      const { data } = await supabase
        .from("requirements")
        .select("*, clients(id, name, category, whatsapp)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-min"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("id, name").order("name");
      return data ?? [];
    },
  });

  const filtered = filter === "all" ? reqs : reqs.filter((r) => r.status === filter);

  /* ── Add ── */
  async function handleAdd(e) {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.target);
    const payload = {
      agent_id: user.id,
      client_id: String(fd.get("client_id")),
      property_type: fd.get("property_type"),
      location: String(fd.get("location") || ""),
      budget_min: fd.get("budget_min") ? Number(fd.get("budget_min")) : null,
      budget_max: fd.get("budget_max") ? Number(fd.get("budget_max")) : null,
      land_size_cents: fd.get("land_size_cents") ? Number(fd.get("land_size_cents")) : null,
      bhk: fd.get("bhk") ? Number(fd.get("bhk")) : null,
      nearby: String(fd.get("nearby") || ""),
      notes: String(fd.get("notes") || ""),
    };
    const { error } = await supabase.from("requirements").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Requirement saved");
    setAddOpen(false);
    e.target.reset();
    qc.invalidateQueries({ queryKey: ["requirements"] });
  }

  /* ── Edit ── */
  function openEdit(r) {
    setEditReq(r);
    setForm({
      client_id: r.client_id || "",
      property_type: r.property_type || "plot",
      location: r.location || "",
      budget_min: r.budget_min ?? "",
      budget_max: r.budget_max ?? "",
      land_size_cents: r.land_size_cents ?? "",
      bhk: r.bhk ?? "",
      nearby: r.nearby || "",
      notes: r.notes || "",
      status: r.status || "new",
    });
  }

  async function handleEdit(e) {
    e.preventDefault();
    const { error } = await supabase
      .from("requirements")
      .update({
        property_type: form.property_type,
        location: form.location,
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
        land_size_cents: form.land_size_cents ? Number(form.land_size_cents) : null,
        bhk: form.bhk ? Number(form.bhk) : null,
        nearby: form.nearby,
        notes: form.notes,
        status: form.status,
      })
      .eq("id", editReq.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Requirement updated");
    setEditReq(null);
    qc.invalidateQueries({ queryKey: ["requirements"] });
  }

  /* ── Delete ── */
  async function handleDelete() {
    const { error } = await supabase.from("requirements").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success("Requirement deleted");
    setDeleteId(null);
    qc.invalidateQueries({ queryKey: ["requirements"] });
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Requirements</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} requirements</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-[var(--shadow-glow)]" disabled={clients.length === 0}>
                <Plus className="mr-1.5 h-4 w-4" /> Add requirement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>New requirement</DialogTitle></DialogHeader>
              <RequirementForm clients={clients} onSubmit={handleAdd} submitLabel="Save" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <ListChecks className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-3 font-display text-lg font-semibold">No requirements yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {clients.length === 0 ? "Add a client first to log their requirement." : "Add a requirement to start matching properties."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <RequirementCard
              key={r.id}
              req={r}
              onEdit={() => openEdit(r)}
              onDelete={() => setDeleteId(r.id)}
            />
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editReq} onOpenChange={(v) => !v && setEditReq(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit requirement</DialogTitle></DialogHeader>
          <RequirementForm
            clients={clients}
            form={form}
            onChange={setForm}
            onSubmit={handleEdit}
            submitLabel="Save changes"
            showStatus
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete requirement?</AlertDialogTitle>
            <AlertDialogDescription>
              This requirement will be permanently removed.
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

/* ─────────────── Requirement Card ─────────────── */
function RequirementCard({ req: r, onEdit, onDelete }) {
  const budgetMin = fmtINR(r.budget_min);
  const budgetMax = fmtINR(r.budget_max);
  const budgetStr = budgetMin && budgetMax ? `${budgetMin} – ${budgetMax}` : budgetMin || budgetMax || null;

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{r.property_type}</div>
          <div className="mt-0.5 truncate font-display text-lg font-semibold">{r.clients?.name || "Unknown client"}</div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[r.status] ?? STATUS_STYLES.new}`}>
          {r.status?.replace(/_/g, " ")}
        </span>
      </div>

      {/* Detail chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {r.location && <Chip icon={MapPin} label={r.location} />}
        {budgetStr && <Chip icon={IndianRupee} label={budgetStr} highlight />}
        {r.land_size_cents && <Chip icon={Maximize2} label={`${r.land_size_cents} cents`} />}
        {r.bhk && <Chip icon={BedDouble} label={`${r.bhk} BHK`} />}
        {r.nearby && <Chip icon={Landmark} label={`Near: ${r.nearby}`} />}
      </div>

      {/* Notes */}
      {r.notes && (
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{r.notes}</p>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <button className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
          <Sparkles className="h-3 w-3" /> Find matching properties
        </button>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            onClick={onEdit}
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Chip({ icon: Icon, label, highlight }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs
      ${highlight ? "bg-primary/10 text-primary font-medium" : "bg-muted/60 text-muted-foreground"}`}>
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      <span>{label}</span>
    </div>
  );
}

/* ─────────────── Requirement Form ─────────────── */
function RequirementForm({ clients, form, onChange, onSubmit, submitLabel, showStatus }) {
  const controlled = !!onChange;

  function fi(name, label, props = {}) {
    const cp = controlled
      ? { value: form?.[name] ?? "", onChange: (e) => onChange((p) => ({ ...p, [name]: e.target.value })) }
      : {};
    return (
      <div>
        <Label className="mb-1 block text-xs font-medium">{label}</Label>
        <Input name={name} {...cp} {...props} />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {!controlled && (
        <div>
          <Label className="mb-1 block text-xs font-medium">Client *</Label>
          <Select name="client_id" required>
            <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
            <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1 block text-xs font-medium">Property type</Label>
          {controlled ? (
            <Select value={form?.property_type} onValueChange={(v) => onChange((p) => ({ ...p, property_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
            </Select>
          ) : (
            <Select name="property_type" defaultValue="plot">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
        {fi("location", "Location", { placeholder: "Kakkanad" })}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {fi("budget_min", "Budget min", { type: "number" })}
        {fi("budget_max", "Budget max", { type: "number" })}
        {fi("land_size_cents", "Cents", { type: "number", step: "0.01" })}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {fi("bhk", "BHK", { type: "number" })}
        {fi("nearby", "Nearby", { placeholder: "School, metro…" })}
      </div>
      {showStatus && (
        <div>
          <Label className="mb-1 block text-xs font-medium">Status</Label>
          <Select value={form?.status} onValueChange={(v) => onChange((p) => ({ ...p, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label className="mb-1 block text-xs font-medium">Notes</Label>
        {controlled ? (
          <Textarea rows={2} value={form?.notes ?? ""} onChange={(e) => onChange((p) => ({ ...p, notes: e.target.value }))} />
        ) : (
          <Textarea name="notes" rows={2} />
        )}
      </div>
      <DialogFooter><Button type="submit">{submitLabel}</Button></DialogFooter>
    </form>
  );
}
