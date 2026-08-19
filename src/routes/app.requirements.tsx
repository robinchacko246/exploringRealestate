import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MapPin, IndianRupee, ListChecks, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/app/requirements")({
  component: RequirementsPage,
});

const TYPES = ["plot", "villa", "apartment", "house", "commercial", "land"] as const;
const STATUSES = ["new", "follow_up", "closed", "deal_completed"] as const;

function fmtINR(n: number | null) {
  if (!n) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n}`;
}

function RequirementsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");

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

  async function add(form: FormData): Promise<void> {
    if (!user) return;
    const payload = {
      agent_id: user.id,
      client_id: String(form.get("client_id")),
      property_type: form.get("property_type") as any,
      location: String(form.get("location") || ""),
      budget_min: form.get("budget_min") ? Number(form.get("budget_min")) : null,
      budget_max: form.get("budget_max") ? Number(form.get("budget_max")) : null,
      land_size_cents: form.get("land_size_cents") ? Number(form.get("land_size_cents")) : null,
      bhk: form.get("bhk") ? Number(form.get("bhk")) : null,
      nearby: String(form.get("nearby") || ""),
      notes: String(form.get("notes") || ""),
    };
    const { error } = await supabase.from("requirements").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Requirement saved");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["requirements"] });
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Requirements</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} active requirements</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-[var(--shadow-glow)]" disabled={clients.length === 0}>
                <Plus className="mr-1.5 h-4 w-4" /> Add requirement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>New requirement</DialogTitle></DialogHeader>
              <form action={add} className="space-y-3">
                <div>
                  <Label>Client *</Label>
                  <Select name="client_id" required>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <Select name="property_type" defaultValue="plot">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Location</Label><Input name="location" placeholder="Kakkanad" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Budget min</Label><Input name="budget_min" type="number" /></div>
                  <div><Label>Budget max</Label><Input name="budget_max" type="number" /></div>
                  <div><Label>Cents</Label><Input name="land_size_cents" type="number" step="0.01" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>BHK</Label><Input name="bhk" type="number" /></div>
                  <div><Label>Nearby</Label><Input name="nearby" placeholder="School, metro…" /></div>
                </div>
                <div><Label>Notes</Label><Textarea name="notes" rows={2} /></div>
                <DialogFooter><Button type="submit">Save</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <ListChecks className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-3 font-display text-lg font-semibold">No requirements yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {clients.length === 0 ? "Add a client first to log their requirement." : "Add a requirement to start matching properties."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((r: any) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{r.property_type}</div>
                  <div className="mt-0.5 font-display text-lg font-semibold">{r.clients?.name}</div>
                </div>
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                  {r.status.replace("_", " ")}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {r.location && <Field icon={MapPin} value={r.location} />}
                {(r.budget_min || r.budget_max) && (
                  <Field icon={IndianRupee} value={`${fmtINR(r.budget_min)} – ${fmtINR(r.budget_max)}`} />
                )}
                {r.land_size_cents && <Field value={`${r.land_size_cents} cents`} />}
                {r.bhk && <Field value={`${r.bhk} BHK`} />}
              </div>
              {r.notes && <p className="mt-3 text-xs text-muted-foreground">{r.notes}</p>}
              <button className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                <Sparkles className="h-3 w-3" /> Find matching properties
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ icon: Icon, value }: any) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1.5">
      {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
      <span className="truncate">{value}</span>
    </div>
  );
}
