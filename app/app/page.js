"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Building2, Flame, CalendarClock, ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";

function StatCard({ icon: Icon, label, value, hint, accent }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${accent ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [clients, properties, hot, today] = await Promise.all([
        supabase.from("clients").select("id, category", { count: "exact" }),
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("clients").select("id", { count: "exact", head: true }).eq("status", "hot"),
        supabase
          .from("reminders")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending")
          .lte("due_at", new Date(new Date().setHours(23, 59, 59)).toISOString()),
      ]);
      const buyers = clients.data?.filter((c) => c.category === "buyer").length ?? 0;
      const sellers = clients.data?.filter((c) => c.category === "seller").length ?? 0;
      return {
        total: clients.count ?? 0,
        buyers,
        sellers,
        properties: properties.count ?? 0,
        hot: hot.count ?? 0,
        today: today.count ?? 0,
      };
    },
  });

  const { data: recentClients } = useQuery({
    queryKey: ["recent-clients"],
    queryFn: async () => {
      const { data } = await supabase
        .from("clients")
        .select("id, name, category, status, last_contact_at, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  const { data: todayReminders } = useQuery({
    queryKey: ["today-reminders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reminders")
        .select("id, title, due_at, type, clients(name)")
        .eq("status", "pending")
        .order("due_at", { ascending: true })
        .limit(5);
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Good day 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here&apos;s what&apos;s happening across your pipeline.</p>
        </div>
        <Link href="/app/clients" className="text-xs font-medium text-primary hover:underline">
          View pipeline <ArrowUpRight className="ml-0.5 inline h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total clients" value={stats?.total ?? 0} hint={`${stats?.buyers ?? 0} buyers · ${stats?.sellers ?? 0} sellers`} />
        <StatCard icon={Building2} label="Properties" value={stats?.properties ?? 0} hint="In your listings" />
        <StatCard icon={Flame} label="Hot leads" value={stats?.hot ?? 0} hint="High priority" accent />
        <StatCard icon={CalendarClock} label="Today's follow-ups" value={stats?.today ?? 0} hint="Pending reminders" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent clients</h2>
            <Link href="/app/clients" className="text-xs font-medium text-primary hover:underline">See all</Link>
          </div>
          {recentClients && recentClients.length > 0 ? (
            <div className="divide-y divide-border">
              {recentClients.map((c) => (
                <Link
                  key={c.id}
                  href="/app/clients"
                  className="flex items-center gap-3 py-3 hover:opacity-80"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {c.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs capitalize text-muted-foreground">{c.category}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    c.status === "hot" ? "bg-destructive/15 text-destructive"
                    : c.status === "active" ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                  }`}>{c.status}</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={Users} title="No clients yet" hint="Add your first client to start tracking requirements." cta="Add client" to="/app/clients" />
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Today&apos;s follow-ups</h2>
            <Link href="/app/reminders" className="text-xs font-medium text-primary hover:underline">All</Link>
          </div>
          {todayReminders && todayReminders.length > 0 ? (
            <div className="space-y-3">
              {todayReminders.map((r) => (
                <div key={r.id} className="rounded-lg border border-border/60 p-3">
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{r.clients?.name ?? "—"}</span>
                    <span>{new Date(r.due_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={CalendarClock} title="All clear" hint="No follow-ups due today." />
          )}
        </div>
      </div>

      {/* AI nudge */}
      <div className="overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-accent to-card p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">AI Insight</div>
            <h3 className="mt-1 font-display text-lg font-semibold">
              Connect WhatsApp to unlock AI matching
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sync your WhatsApp Business chats so PropertyFlow can auto-extract requirements and match them to your listings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, hint, cta, to }) {
  return (
    <div className="grid place-items-center py-10 text-center">
      <Icon className="h-8 w-8 text-muted-foreground/50" />
      <div className="mt-3 text-sm font-medium">{title}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
      {cta && to && (
        <Link href={to} className="mt-3 text-xs font-medium text-primary hover:underline">{cta}</Link>
      )}
    </div>
  );
}
