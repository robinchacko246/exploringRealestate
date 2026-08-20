"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search, Send, Phone, MoreVertical, Sparkles, BrainCircuit } from "lucide-react";

export default function InboxPage() {
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState("");

  const { data: convos = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*, clients(id, name, category, status)")
        .order("last_message_at", { ascending: false, nullsFirst: false });
      return data ?? [];
    },
  });

  const filtered = convos.filter((c) => !q || c.clients?.name?.toLowerCase().includes(q.toLowerCase()));
  const active = filtered.find((c) => c.id === selected) ?? filtered[0];

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 md:grid-cols-[340px_1fr]">
      {/* Conversation list */}
      <aside className="flex flex-col border-r border-border bg-card">
        <div className="border-b border-border p-4">
          <h1 className="font-display text-xl font-bold">Inbox</h1>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations…" className="pl-9" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <EmptyInbox />
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`flex w-full items-center gap-3 border-b border-border/50 p-3 text-left transition hover:bg-accent ${active?.id === c.id ? "bg-accent" : ""}`}
              >
                <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/15 font-semibold text-primary">
                  {c.clients?.name?.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-semibold">{c.clients?.name ?? "Unknown"}</span>
                    {c.last_message_at && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(c.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{c.last_message ?? "No messages yet"}</div>
                </div>
                {c.unread_count > 0 && (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {c.unread_count}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat panel */}
      <section className="flex flex-col bg-muted/40">
        {!active ? (
          <div className="grid flex-1 place-items-center text-center">
            <div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-card shadow-[var(--shadow-soft)]">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold">Your WhatsApp inbox lives here</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Connect WhatsApp Business API to sync chats. Until then, you can log conversations manually from each client.
              </p>
            </div>
          </div>
        ) : (
          <>
            <header className="flex items-center justify-between border-b border-border bg-card px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 font-semibold text-primary">
                  {active.clients?.name?.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{active.clients?.name}</div>
                  <div className="text-xs capitalize text-muted-foreground">{active.clients?.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="rounded-md p-2 hover:bg-accent"><Phone className="h-4 w-4" /></button>
                <button className="rounded-md p-2 hover:bg-accent"><MoreVertical className="h-4 w-4" /></button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mx-auto max-w-2xl space-y-3">
                <SampleBubble incoming text="Hi, looking for a 10 cent plot near Kakkanad — budget around 45 lakh" />
                <SampleBubble text="Hi Rajesh! Got it — I have 3 matching plots. Sending details now 🏡" />
                <div className="my-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> AI extracted requirement
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <Pill label="Location" value="Kakkanad" />
                    <Pill label="Budget" value="₹45L" />
                    <Pill label="Size" value="10 cents" />
                    <Pill label="Type" value="Plot" />
                  </div>
                </div>
                <SampleBubble incoming text="Perfect, send pictures please 📸" />
              </div>
            </div>

            <footer className="border-t border-border bg-card p-4">
              <div className="mx-auto flex max-w-2xl items-center gap-2">
                <button className="rounded-lg border border-border px-2.5 py-2 text-xs hover:bg-accent">
                  <BrainCircuit className="inline h-3.5 w-3.5" /> AI reply
                </button>
                <Input placeholder="Type a message…" className="flex-1" />
                <button className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-glow)] hover:bg-primary/90">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}

function SampleBubble({ text, incoming }) {
  return (
    <div className={`flex ${incoming ? "" : "justify-end"}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${incoming ? "rounded-tl-sm bg-chat-incoming" : "rounded-tr-sm bg-chat-outgoing"}`}>
        {text}
      </div>
    </div>
  );
}

function Pill({ label, value }) {
  return (
    <div className="rounded-lg bg-card px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function EmptyInbox() {
  return (
    <div className="p-8 text-center text-sm text-muted-foreground">
      No conversations yet. They&apos;ll appear here once you connect WhatsApp or log a chat.
    </div>
  );
}
