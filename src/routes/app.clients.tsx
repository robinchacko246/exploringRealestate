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
import { Plus, Search, Phone, MessageCircle, Mail, Filter } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/app/clients")({
  component: ClientsPage,
});

const CATEGORIES = ["buyer", "seller", "rental", "investor"] as const;
const STATUSES = ["new", "active", "hot", "cold", "closed"] as const;

function ClientsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);

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
    const matchesQ = !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.phone?.includes(q);
    const matchesF = filter === "all" || c.category === filter;
    return matchesQ && matchesF;
  });

  async function addClient(form: FormData): Promise<void> {
    if (!user) return;
    const payload = {
      agent_id: user.id,
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
      whatsapp: String(form.get("whatsapp") || ""),
      email: String(form.get("email") || ""),
      category: form.get("category") as any,
      status: "new" as const,
      notes: String(form.get("notes") || ""),
    };
    const { error } = await supabase.from("clients").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Client added");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["clients"] });
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">{clients.length} total · {filtered.length} shown</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-[var(--shadow-glow)]"><Plus className="mr-1.5 h-4 w-4" /> Add client</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New client</DialogTitle></DialogHeader>
            <form action={addClient} className="space-y-3">
              <div><Label>Name *</Label><Input name="name" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Phone</Label><Input name="phone" /></div>
                <div><Label>WhatsApp</Label><Input name="whatsapp" /></div>
              </div>
              <div><Label>Email</Label><Input name="email" type="email" /></div>
              <div>
                <Label>Category</Label>
                <Select name="category" defaultValue="buyer">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea name="notes" rows={3} placeholder="Looking for 10 cent plot near Kakkanad…" /></div>
              <DialogFooter>
                <Button type="submit">Save client</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or phone…" className="pl-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><Filter className="mr-1.5 h-4 w-4" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground">
            <Plus className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-semibold">No clients yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add your first client to start tracking requirements.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="group rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {c.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs capitalize text-muted-foreground">{c.category}</div>
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              {c.notes && <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{c.notes}</p>}
              <div className="mt-4 flex gap-2 text-xs">
                {c.phone && <IconLink icon={Phone} href={`tel:${c.phone}`} />}
                {c.whatsapp && <IconLink icon={MessageCircle} href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} accent />}
                {c.email && <IconLink icon={Mail} href={`mailto:${c.email}`} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    hot: "bg-destructive/15 text-destructive",
    active: "bg-primary/15 text-primary",
    new: "bg-warning/15 text-warning-foreground",
    closed: "bg-muted text-muted-foreground",
    cold: "bg-muted text-muted-foreground",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[status] ?? styles.new}`}>{status}</span>;
}

function IconLink({ icon: Icon, href, accent }: any) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`grid h-8 w-8 place-items-center rounded-lg border border-border transition hover:bg-accent ${accent ? "bg-primary/10 text-primary border-primary/30" : ""}`}>
      <Icon className="h-3.5 w-3.5" />
    </a>
  );
}
