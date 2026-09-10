"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import {
  Users,
  Building2,
  Inbox,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function StatCard({ icon: Icon, label, value, hint, badgeText, badgeColor }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 font-display text-3xl font-bold tracking-tight">
            {value}
          </div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
            <Icon className="h-5 w-5" />
          </div>
          {badgeText && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${badgeColor}`}
            >
              {badgeText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { isAdmin } = useAdmin();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const [
        profilesRes,
        rolesRes,
        propertiesRes,
        publicListingsRes,
        pendingListingsRes,
        subsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("id, role"),
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("public_property_listings").select("*"),
        supabase
          .from("public_property_listings")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase.from("subscriptions").select("*"),
      ]);

      const publicListings = publicListingsRes.data ?? [];
      const subscriptions = subsRes.data ?? [];
      const roles = rolesRes.data ?? [];

      const totalRevenue = subscriptions.reduce(
        (sum, s) => sum + Number(s.amount_paid || 0),
        0
      );

      const activeProCount = subscriptions.filter(
        (s) => s.status === "active" && s.plan_id !== "free"
      ).length;

      const adminCount = roles.filter((r) => r.role === "admin").length;
      const managerCount = roles.filter((r) => r.role === "manager").length;
      const agentCount = roles.filter((r) => r.role === "agent").length;

      return {
        usersCount: profilesRes.count ?? roles.length ?? 1,
        adminCount,
        managerCount,
        agentCount: agentCount || (profilesRes.count ?? 1),
        crmProperties: propertiesRes.count ?? 0,
        publicListingsCount: publicListings.length,
        pendingModeration: pendingListingsRes.count ?? publicListings.filter(l => l.status === "pending").length,
        totalRevenue,
        activePaidSubs: activeProCount,
        recentSubmissions: publicListings.slice(0, 5),
        subscriptionsList: subscriptions.slice(0, 5),
      };
    },
  });

  const chartData = [
    { name: "Jan", revenue: 12000, listings: 8 },
    { name: "Feb", revenue: 24000, listings: 14 },
    { name: "Mar", revenue: 18000, listings: 12 },
    { name: "Apr", revenue: 35000, listings: 22 },
    { name: "May", revenue: 42000, listings: 28 },
    { name: "Jun", revenue: 58000, listings: 35 },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-background p-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-500" />
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Admin Command Center
            </h1>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              Superadmin Portal
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage agents, moderate public property submissions, monitor subscriptions & platform growth.
          </p>
        </div>

      </div>

      {/* Primary KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Platform Users / Agents"
          value={stats?.usersCount ?? 0}
          hint={`${stats?.agentCount ?? 0} Agents · ${stats?.adminCount ?? 1} Admins`}
          badgeText="Active Users"
          badgeColor="bg-blue-500/15 text-blue-600"
        />
        <StatCard
          icon={Inbox}
          label="Pending Moderation"
          value={stats?.pendingModeration ?? 0}
          hint="Submissions from /sell page"
          badgeText={stats?.pendingModeration ? "Needs Review" : "Up to date"}
          badgeColor={stats?.pendingModeration ? "bg-amber-500/15 text-amber-600" : "bg-emerald-500/15 text-emerald-600"}
        />
        <StatCard
          icon={Building2}
          label="Total Properties"
          value={(stats?.crmProperties ?? 0) + (stats?.publicListingsCount ?? 0)}
          hint={`${stats?.crmProperties ?? 0} Agent · ${stats?.publicListingsCount ?? 0} Public`}
          badgeText="Platform Catalog"
          badgeColor="bg-purple-500/15 text-purple-600"
        />
        <StatCard
          icon={CreditCard}
          label="Total Platform Revenue"
          value={`₹${(stats?.totalRevenue ?? 0).toLocaleString()}`}
          hint={`${stats?.activePaidSubs ?? 0} Active Paid Subscriptions`}
          badgeText="Financial"
          badgeColor="bg-emerald-500/15 text-emerald-600"
        />
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/app/admin/listings"
          className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500/15 text-amber-500">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold group-hover:text-amber-600">Moderate Listings</div>
              <div className="text-xs text-muted-foreground">Approve seller submissions</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/app/admin/users"
          className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-500/15 text-blue-500">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold group-hover:text-blue-600">User & Role Control</div>
              <div className="text-xs text-muted-foreground">Grant roles & manage agents</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/app/admin/subscriptions"
          className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/15 text-emerald-500">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold group-hover:text-emerald-600">Subscriptions & MRR</div>
              <div className="text-xs text-muted-foreground">Plans & Razorpay billing</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/app/admin/analytics"
          className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-purple-500/15 text-purple-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold group-hover:text-purple-600">System Analytics</div>
              <div className="text-xs text-muted-foreground">Platform revenue & growth</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Main Content Grid: Chart & Moderation Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue & Growth Widget */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                Revenue & Subscriptions Growth
              </h2>
              <p className="text-xs text-muted-foreground">Monthly revenue trajectory (INR)</p>
            </div>
            <Link
              href="/app/admin/analytics"
              className="text-xs font-medium text-amber-600 hover:underline flex items-center gap-1"
            >
              Full Analytics <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(val) => [`₹${val.toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Public Submissions Queue */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Latest Seller Submissions
              </h2>
              <p className="text-xs text-muted-foreground">Public property queue</p>
            </div>
            <Link
              href="/app/admin/listings"
              className="text-xs font-medium text-amber-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {stats?.recentSubmissions && stats.recentSubmissions.length > 0 ? (
            <div className="space-y-3">
              {stats.recentSubmissions.map((listing) => (
                <div
                  key={listing.id}
                  className="rounded-xl border border-border/70 p-3 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold truncate max-w-[180px]">
                        {listing.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {listing.location || "Location N/A"} · {listing.property_type}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        listing.status === "available"
                          ? "bg-emerald-500/15 text-emerald-600"
                          : listing.status === "pending"
                          ? "bg-amber-500/15 text-amber-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {listing.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Owner: {listing.owner_name} ({listing.owner_phone})</span>
                    <span className="font-semibold text-foreground">
                      ₹{Number(listing.price || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto opacity-80" />
              <div className="text-sm font-medium">All submissions clear</div>
              <div className="text-xs">No pending public listings requiring action.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
