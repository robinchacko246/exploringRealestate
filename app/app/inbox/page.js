"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Search, Send, Phone, MoreVertical, Sparkles, BrainCircuit, Plus, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function InboxPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [q, setQ] = useState("");
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  // Fetch all clients
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*, requirements(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch logged conversations
  const { data: convos = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*, clients(*)")
        .order("last_message_at", { ascending: false, nullsFirst: false });
      return data ?? [];
    },
  });

  // Filter clients/conversations by search query
  const filteredClients = clients.filter((c) =>
    !q ||
    c.name?.toLowerCase().includes(q.toLowerCase()) ||
    c.phone?.includes(q) ||
    c.whatsapp?.includes(q)
  );

  // Determine active client
  const activeClient = filteredClients.find((c) => c.id === selectedClientId) || filteredClients[0];
  const activeReq = activeClient?.requirements?.[0];

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!inputText.trim() || !activeClient) return;
    setSending(true);

    try {
      // 1. Log conversation into database
      const { data: existingConvo } = await supabase
        .from("conversations")
        .select("*")
        .eq("client_id", activeClient.id)
        .maybeSingle();

      if (existingConvo) {
        await supabase.from("conversations").update({
          last_message: inputText,
          last_message_at: new Date().toISOString(),
        }).eq("id", existingConvo.id);
      } else if (user) {
        await supabase.from("conversations").insert({
          agent_id: user.id,
          client_id: activeClient.id,
          last_message: inputText,
          last_message_at: new Date().toISOString(),
        });
      }

      // 2. Open WhatsApp Web to send actual message if phone/WhatsApp number exists
      const targetPhone = activeClient.whatsapp || activeClient.phone;
      if (targetPhone) {
        const cleanPhone = targetPhone.replace(/\D/g, "");
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(inputText)}`;
        window.open(waUrl, "_blank");
      }

      toast.success("Message logged & WhatsApp opened!");
      setInputText("");
      qc.invalidateQueries({ queryKey: ["conversations"] });
    } catch (err) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 md:grid-cols-[340px_1fr]">
      {/* Conversation / Clients sidebar */}
      <aside className="flex flex-col border-r border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-xl font-bold">WhatsApp Inbox</h1>
            <span className="text-xs text-muted-foreground">{clients.length} clients</span>
          </div>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search client name or phone…" className="pl-9" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredClients.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <User className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              No clients found. Add a client to start chatting.
            </div>
          ) : (
            filteredClients.map((c) => {
              const convo = convos.find((cv) => cv.client_id === c.id);
              const isSelected = activeClient?.id === c.id;
              const initials = c.name?.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase() || "?";

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedClientId(c.id)}
                  className={`flex w-full items-center gap-3 border-b border-border/50 p-3 text-left transition hover:bg-accent ${
                    isSelected ? "bg-accent" : ""
                  }`}
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 font-semibold text-primary">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-semibold">{c.name}</span>
                      <span className="text-[10px] uppercase text-muted-foreground">{c.category}</span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {convo?.last_message || c.notes || c.phone || "Click to open chat thread"}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Panel */}
      <section className="flex flex-col bg-muted/40">
        {!activeClient ? (
          <div className="grid flex-1 place-items-center text-center p-6">
            <div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-card shadow-[var(--shadow-soft)]">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold">Your WhatsApp Inbox</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Select a client from the left list to chat on WhatsApp and log conversations.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="flex items-center justify-between border-b border-border bg-card px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 font-semibold text-primary">
                  {activeClient.name?.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase() || "?"}
                </div>
                <div>
                  <div className="font-semibold">{activeClient.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="capitalize">{activeClient.category}</span>
                    {activeClient.phone && <span>· {activeClient.phone}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(activeClient.whatsapp || activeClient.phone) && (
                  <a
                    href={`https://wa.me/${(activeClient.whatsapp || activeClient.phone).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                  >
                    <MessageCircle className="h-4 w-4" /> Open WhatsApp
                  </a>
                )}
                {activeClient.phone && (
                  <a
                    href={`tel:${activeClient.phone}`}
                    className="rounded-md border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                )}
              </div>
            </header>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mx-auto max-w-2xl space-y-4">
                {/* Client detail card */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Client Details & Preferences
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Status: </span>
                      <span className="font-medium capitalize">{activeClient.status || "New"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category: </span>
                      <span className="font-medium capitalize">{activeClient.category}</span>
                    </div>
                  </div>
                  {activeClient.notes && (
                    <div className="mt-3 rounded-lg bg-muted p-2.5 text-xs text-muted-foreground">
                      💬 {activeClient.notes}
                    </div>
                  )}
                </div>

                {/* AI Extracted Requirement pill if present */}
                {activeReq && (
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-primary">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4" /> Saved Property Requirement
                      </span>
                      <span className="capitalize text-[10px] rounded bg-primary/15 px-2 py-0.5">
                        {activeReq.property_type || "Plot"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                      <div className="rounded-lg bg-card p-2 text-center border border-border/50">
                        <div className="text-[10px] text-muted-foreground">Location</div>
                        <div className="font-semibold truncate">{activeReq.location || "Any"}</div>
                      </div>
                      <div className="rounded-lg bg-card p-2 text-center border border-border/50">
                        <div className="text-[10px] text-muted-foreground">Min Budget</div>
                        <div className="font-semibold">{activeReq.budget_min ? `₹${(activeReq.budget_min / 100000).toFixed(1)}L` : "—"}</div>
                      </div>
                      <div className="rounded-lg bg-card p-2 text-center border border-border/50">
                        <div className="text-[10px] text-muted-foreground">Max Budget</div>
                        <div className="font-semibold">{activeReq.budget_max ? `₹${(activeReq.budget_max / 100000).toFixed(1)}L` : "—"}</div>
                      </div>
                      <div className="rounded-lg bg-card p-2 text-center border border-border/50">
                        <div className="text-[10px] text-muted-foreground">BHK</div>
                        <div className="font-semibold">{activeReq.bhk || "—"}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Input & WhatsApp sender */}
            <footer className="border-t border-border bg-card p-4">
              <form onSubmit={handleSendMessage} className="mx-auto flex max-w-2xl items-center gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Send WhatsApp message to ${activeClient.name}…`}
                  className="flex-1"
                />
                <Button type="submit" disabled={sending || !inputText.trim()} className="gap-2 shadow-[var(--shadow-glow)]">
                  <Send className="h-4 w-4" /> Send WhatsApp
                </Button>
              </form>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
