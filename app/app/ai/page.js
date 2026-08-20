"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { extractRequirement, saveExtractedRequirement, matchProperties } from "@/lib/ai.functions";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Wand2, Save, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const SAMPLES = [
  "Hi, I'm looking for a 10 cent house plot near Kakkanad, Kochi. Budget around 45 lakh. Need it within 2 months.",
  "Want to sell my 3BHK villa in Trivandrum, 2400 sqft. Asking 1.8 crore.",
  "Looking for 2BHK apartment for rent in Bangalore Whitefield, max 35000 per month.",
];

export default function AIPage() {
  const [message, setMessage] = useState("");
  const [clientName, setClientName] = useState("");
  const [extracted, setExtracted] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const qc = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-min"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("id, name").order("name");
      return data ?? [];
    },
  });

  const runMut = useMutation({
    mutationFn: async () => {
      const r = await extractRequirement({ message, clientName: clientName || undefined });
      const m = await matchProperties({
        property_type: r.property_type,
        location: r.location,
        budget_min: r.budget_min,
        budget_max: r.budget_max,
        land_size_cents: r.land_size_cents,
        bhk: r.bhk,
      });
      return { r, m };
    },
    onSuccess: ({ r, m }) => {
      setExtracted(r);
      setMatches(m);
      toast.success(`Extracted requirement · ${m.length} matching properties`);
    },
    onError: (e) => toast.error(e.message ?? "AI failed"),
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!extracted || !selectedClient) throw new Error("Pick a client first");
      return saveExtractedRequirement({ client_id: selectedClient, extracted });
    },
    onSuccess: () => {
      toast.success("Requirement saved to client");
      qc.invalidateQueries({ queryKey: ["requirements"] });
      setExtracted(null);
      setMatches([]);
      setMessage("");
    },
    onError: (e) => toast.error(e.message ?? "Save failed"),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-center gap-3">
        <div
          className="grid h-11 w-11 place-items-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">AI Assistant</h1>
          <p className="text-sm text-muted-foreground">Paste any client message — AI extracts the requirement and matches your listings.</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client name (optional)</label>
          <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Rajesh Kumar" className="mt-1.5" />

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste WhatsApp message, call notes, SMS…"
            className="mt-1.5 min-h-[180px]"
          />

          <div className="mt-3 flex flex-wrap gap-1.5">
            {SAMPLES.map((s, i) => (
              <button
                key={i}
                onClick={() => setMessage(s)}
                className="rounded-full border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground hover:bg-accent"
              >
                Sample {i + 1}
              </button>
            ))}
          </div>

          <Button
            onClick={() => runMut.mutate()}
            disabled={runMut.isPending || message.trim().length < 3}
            className="mt-4 w-full"
          >
            {runMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Extract &amp; match
          </Button>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-base font-semibold">Extracted requirement</h2>
          {!extracted ? (
            <div className="mt-6 grid place-items-center rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Run the AI to see structured fields appear here.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm">{extracted.summary}</p>
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                <Field k="Intent" v={extracted.intent} />
                <Field k="Type" v={extracted.property_type ?? "—"} />
                <Field k="Location" v={extracted.location ?? "—"} />
                <Field k="Nearby" v={extracted.nearby ?? "—"} />
                <Field k="Budget" v={fmtBudget(extracted.budget_min, extracted.budget_max)} />
                <Field k="Size" v={extracted.land_size_cents ? `${extracted.land_size_cents} cents` : "—"} />
                <Field k="BHK" v={extracted.bhk ?? "—"} />
                <Field k="Urgency" v={extracted.urgency ?? "—"} />
              </div>

              <div className="mt-3 flex items-end gap-2 border-t border-border pt-3">
                <div className="flex-1">
                  <label className="text-[11px] font-semibold uppercase text-muted-foreground">Save to client</label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select a client…" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => saveMut.mutate()} disabled={!selectedClient || saveMut.isPending}>
                  {saveMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {matches.length > 0 && (
        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <Building2 className="h-4 w-4 text-primary" /> Matching properties ({matches.length})
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {matches.map(({ property, score, reasons }) => (
              <div key={property.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{property.title}</div>
                    <div className="text-xs text-muted-foreground">{property.location ?? "—"}</div>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">{score}% match</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                  {reasons.map((r) => (
                    <span key={r} className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5">
                      <CheckCircle2 className="h-3 w-3 text-primary" /> {r}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-sm font-semibold">{property.price ? `₹${(property.price / 100000).toFixed(1)}L` : "Price on request"}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Field({ k, v }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="text-sm font-semibold capitalize">{String(v)}</div>
    </div>
  );
}

function fmtBudget(min, max) {
  const f = (n) => (n >= 10000000 ? `${(n / 10000000).toFixed(2)}Cr` : `${(n / 100000).toFixed(1)}L`);
  if (min && max) return `₹${f(min)} – ₹${f(max)}`;
  if (max) return `≤ ₹${f(max)}`;
  if (min) return `≥ ₹${f(min)}`;
  return "—";
}
