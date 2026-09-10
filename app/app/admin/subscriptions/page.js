"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Sparkles,
  CheckCircle,
  Calendar,
  Zap,
  Award,
  RefreshCw,
  Search,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminSubscriptionsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState("pro");

  // Fetch subscriptions with agent profiles
  const { data: subscriptions = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-subscriptions-list"],
    queryFn: async () => {
      const [subsRes, profilesRes] = await Promise.all([
        supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name, company"),
      ]);

      const subs = subsRes.data ?? [];
      const profiles = profilesRes.data ?? [];

      return subs.map((sub) => {
        const profile = profiles.find((p) => p.id === sub.agent_id);
        return {
          ...sub,
          agentName: profile?.full_name || "Agent",
          company: profile?.company || "Independent",
        };
      });
    },
  });

  // Manual Subscription Grant mutation
  const grantSubMutation = useMutation({
    mutationFn: async ({ agentId, planId, planName, amountPaid }) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error } = await supabase.from("subscriptions").insert({
        agent_id: agentId,
        plan_id: planId,
        plan_name: planName,
        amount_paid: amountPaid,
        currency: "INR",
        billing_cycle: "monthly",
        status: "active",
        starts_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Subscription upgraded successfully!");
      queryClient.invalidateQueries(["admin-subscriptions-list"]);
      setIsUpgradeModalOpen(false);
    },
    onError: (err) => {
      toast.error(`Upgrade failed: ${err.message}`);
    },
  });

  const totalRevenue = subscriptions.reduce((sum, s) => sum + Number(s.amount_paid || 0), 0);
  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const proCount = activeSubs.filter((s) => s.plan_id === "pro").length;
  const enterpriseCount = activeSubs.filter((s) => s.plan_id === "enterprise").length;

  const filteredSubs = subscriptions.filter(
    (s) =>
      s.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.plan_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.razorpay_payment_id || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-500" />
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Subscriptions & Revenue Oversight
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Track subscription revenue, Razorpay payments, and manage agent plan tiers.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-muted transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Billing Data
        </button>
      </div>

      {/* Financial Metrics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <div className="text-xs uppercase font-semibold text-emerald-600 dark:text-emerald-400">
            Total Revenue
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">All-time transactions</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs uppercase font-medium text-muted-foreground">
            Active Subscriptions
          </div>
          <div className="mt-2 font-display text-3xl font-bold">{activeSubs.length}</div>
          <div className="mt-1 text-xs text-muted-foreground">Paying subscribers</div>
        </div>

        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5">
          <div className="text-xs uppercase font-semibold text-purple-600 dark:text-purple-400">
            Pro Agent Tier
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-purple-600 dark:text-purple-400">
            {proCount}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">₹999 / month</div>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="text-xs uppercase font-semibold text-amber-600 dark:text-amber-400">
            Agency Enterprise Tier
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-amber-600 dark:text-amber-400">
            {enterpriseCount}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">₹2,999 / month</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by agent name, plan, or payment ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Subscriptions Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground font-semibold">
            <tr>
              <th className="px-5 py-3.5">Agent Details</th>
              <th className="px-5 py-3.5">Plan Tier</th>
              <th className="px-5 py-3.5">Amount Paid</th>
              <th className="px-5 py-3.5">Razorpay Payment ID</th>
              <th className="px-5 py-3.5">Status & Expires</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredSubs.length > 0 ? (
              filteredSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-foreground">{sub.agentName}</div>
                    <div className="text-xs text-muted-foreground">{sub.company}</div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                        sub.plan_id === "enterprise"
                          ? "bg-amber-500/20 text-amber-600 border border-amber-500/30"
                          : sub.plan_id === "pro"
                          ? "bg-purple-500/20 text-purple-600 border border-purple-500/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {sub.plan_id === "enterprise" && <Sparkles className="h-3 w-3" />}
                      {sub.plan_id === "pro" && <Zap className="h-3 w-3" />}
                      {sub.plan_name}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-display font-bold text-foreground">
                    ₹{Number(sub.amount_paid || 0).toLocaleString()}
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                    {sub.razorpay_payment_id || "N/A (Direct / Admin)"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          sub.status === "active"
                            ? "bg-emerald-500/15 text-emerald-600"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {sub.status}
                      </span>
                      {sub.expires_at && (
                        <div className="text-[11px] text-muted-foreground">
                          Exp: {new Date(sub.expires_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedAgent(sub);
                        setIsUpgradeModalOpen(true);
                      }}
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all"
                    >
                      Grant Upgrade
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  No subscription records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Grant Subscription Modal */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-500" />
              Upgrade Agent Subscription
            </DialogTitle>
            <DialogDescription>
              Grant a premium plan to <strong>{selectedAgent?.agentName || "Agent"}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Select Target Tier
            </label>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => setTargetPlan("pro")}
                className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  targetPlan === "pro"
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div>
                  <div className="text-sm font-bold">Pro Agent Plan</div>
                  <div className="text-xs text-muted-foreground">₹999 / mo · Unlimited Clients & Reminders</div>
                </div>
                <Zap className="h-5 w-5 text-purple-500" />
              </button>

              <button
                type="button"
                onClick={() => setTargetPlan("enterprise")}
                className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  targetPlan === "enterprise"
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div>
                  <div className="text-sm font-bold">Agency Enterprise Plan</div>
                  <div className="text-xs text-muted-foreground">₹2,999 / mo · Full AI Suite & Priority Support</div>
                </div>
                <Sparkles className="h-5 w-5 text-amber-500" />
              </button>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setIsUpgradeModalOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                grantSubMutation.mutate({
                  agentId: selectedAgent.agent_id,
                  planId: targetPlan,
                  planName: targetPlan === "enterprise" ? "Agency Enterprise Plan" : "Pro Agent Plan",
                  amountPaid: targetPlan === "enterprise" ? 2999 : 999,
                })
              }
              disabled={grantSubMutation.isPending}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
            >
              {grantSubMutation.isPending ? "Granting..." : "Confirm Subscription Upgrade"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
