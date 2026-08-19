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
import { Plus, MapPin, Home, IndianRupee, Phone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/app/properties")({
  component: PropertiesPage,
});

const PROPERTY_TYPES = ["plot", "villa", "apartment", "house", "commercial", "land"] as const;

function fmtINR(n: number | null) {
  if (!n) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function PropertiesPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function addProperty(form: FormData): Promise<void> {
    if (!user) return;
    const payload = {
      agent_id: user.id,
      title: String(form.get("title") || ""),
      property_type: form.get("property_type") as any,
      location: String(form.get("location") || ""),
      price: form.get("price") ? Number(form.get("price")) : null,
      land_size_cents: form.get("land_size_cents") ? Number(form.get("land_size_cents")) : null,
      bhk: form.get("bhk") ? Number(form.get("bhk")) : null,
      owner_name: String(form.get("owner_name") || ""),
      owner_phone: String(form.get("owner_phone") || ""),
      description: String(form.get("description") || ""),
    };
    const { error } = await supabase.from("properties").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Property added");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["properties"] });
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Properties</h1>
          <p className="mt-1 text-sm text-muted-foreground">{properties.length} listings</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-[var(--shadow-glow)]"><Plus className="mr-1.5 h-4 w-4" /> Add property</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New property listing</DialogTitle></DialogHeader>
            <form action={addProperty} className="space-y-3">
              <div><Label>Title *</Label><Input name="title" placeholder="10 cent plot in Kakkanad" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select name="property_type" defaultValue="plot">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Location</Label><Input name="location" placeholder="Kakkanad, Kochi" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Price (₹)</Label><Input name="price" type="number" placeholder="4500000" /></div>
                <div><Label>Land (cents)</Label><Input name="land_size_cents" type="number" step="0.01" /></div>
                <div><Label>BHK</Label><Input name="bhk" type="number" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Owner name</Label><Input name="owner_name" /></div>
                <div><Label>Owner phone</Label><Input name="owner_phone" /></div>
              </div>
              <div><Label>Description</Label><Textarea name="description" rows={2} /></div>
              <DialogFooter><Button type="submit">Save listing</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <Home className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-3 font-display text-lg font-semibold">No listings yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add a property to match it to client requirements.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
              <div className="relative aspect-[16/10] bg-gradient-to-br from-accent to-muted">
                <div className="absolute right-3 top-3 rounded-full bg-card/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
                  {p.status}
                </div>
                <div className="absolute bottom-3 left-3 grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Home className="h-5 w-5" />
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{p.property_type}</div>
                <h3 className="mt-1 font-display text-base font-semibold">{p.title}</h3>
                {p.location && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {p.location}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-1 font-semibold text-primary">
                    <IndianRupee className="h-3.5 w-3.5" />
                    {p.price ? fmtINR(p.price).replace("₹", "") : "—"}
                  </div>
                  {p.land_size_cents && <div className="text-xs text-muted-foreground">{p.land_size_cents} cents</div>}
                  {p.bhk && <div className="text-xs text-muted-foreground">{p.bhk} BHK</div>}
                </div>
                {p.owner_phone && (
                  <a href={`tel:${p.owner_phone}`} className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline">
                    <Phone className="h-3 w-3" /> {p.owner_name || "Owner"}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
