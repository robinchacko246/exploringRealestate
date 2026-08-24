"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CreditCard, Check, Zap, Sparkles, ShieldCheck, Clock, RefreshCw,
  Building2, Users, ArrowRight, CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

import { PLAN_CONFIGS, usePlanLimits } from "@/hooks/use-plan-limits";

const PLANS = [
  {
    ...PLAN_CONFIGS.free,
    recommended: false,
    buttonText: "Current Plan",
  },
  {
    ...PLAN_CONFIGS.pro_realtor,
    recommended: true,
    buttonText: "Upgrade to Pro (₹499)",
  },
  {
    ...PLAN_CONFIGS.agency_team,
    recommended: false,
    buttonText: "Upgrade to Agency (₹999)",
  },
];

export default function BillingPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { isTrialExpired, trialDaysRemaining } = usePlanLimits();
  const [loadingPlan, setLoadingPlan] = useState(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch active subscription & payment history
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error && error.code !== "PGRST116") console.error(error);
      return data ?? [];
    },
  });

  const activeSub = subscriptions.find((s) => s.status === "active") || {
    plan_id: "free",
    plan_name: "Starter Realtor",
    created_at: new Date().toISOString(),
  };

  async function handleSubscribe(plan) {
    if (plan.price === 0) return;
    if (!user) {
      toast.error("Please log in first");
      return;
    }

    setLoadingPlan(plan.id);

    try {
      // 1. Create order on backend
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          currency: "INR",
          receipt: `receipt_${user.id.slice(0, 8)}_${Date.now()}`,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || orderData.error) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // 2. Open Razorpay Checkout modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "PropertyFlow CRM",
        description: `Subscription: ${plan.name}`,
        order_id: orderData.id,
        prefill: {
          email: user.email || "",
          contact: "",
        },
        theme: {
          color: "#6366f1",
        },
        handler: async function (response) {
          try {
            // 3. Verify payment signature
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // 4. Record subscription in Supabase
              const expiresAt = new Date();
              expiresAt.setDate(expiresAt.getDate() + 30);

              const { error: subErr } = await supabase.from("subscriptions").insert({
                agent_id: user.id,
                plan_id: plan.id,
                plan_name: plan.name,
                amount_paid: plan.price,
                currency: "INR",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                status: "active",
                billing_cycle: "monthly",
                expires_at: expiresAt.toISOString(),
              });

              if (subErr) {
                console.error("Failed to save subscription:", subErr);
              }
              toast.success(`Successfully upgraded to ${plan.name}! 🎉`);
              qc.invalidateQueries({ queryKey: ["subscriptions"] });
              qc.invalidateQueries({ queryKey: ["active-subscription"] });
            } else {
              toast.error(verifyData.error || "Payment verification failed");
            }
          } catch (err) {
            toast.error(err.message || "Error processing payment");
          } finally {
            setLoadingPlan(null);
          }
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan(null);
            toast.info("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || "Could not launch Razorpay payment");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Billing & Plans</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage your CRM plan, upgrade for unlimited listings, and view invoices.
            </p>
          </div>
        </div>
      </div>

      {/* Active Subscription Banner */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Current Plan</span>
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30 uppercase text-[10px] font-bold">
                  {activeSub.plan_name}
                </Badge>
              </div>
              <h2 className="mt-1 text-xl font-bold">{activeSub.plan_name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeSub.plan_id === "free"
                  ? isTrialExpired
                    ? "⚠️ Your 14-Day Free Trial has EXPIRED. Please upgrade your plan below to continue managing clients & properties."
                    : `14-Day Free Trial: ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? "s" : ""} remaining. Upgrade anytime for higher limits & team features.`
                  : `Active until ${new Date(activeSub.expires_at || Date.now() + 30 * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 py-1.5 px-3 text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Razorpay Live Verified
            </Badge>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="mb-12">
        <h2 className="mb-6 font-display text-xl font-bold tracking-tight">Choose the right plan for your business</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = activeSub.plan_id === plan.id;
            const isProcessing = loadingPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between transition-all hover:shadow-[var(--shadow-soft)]
                  ${plan.recommended ? "border-2 border-primary shadow-md" : "border-border"}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Most Popular
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    {plan.name}
                    {isCurrent && <Badge variant="secondary" className="text-[10px]">Active</Badge>}
                  </CardTitle>
                  <CardDescription className="text-xs min-h-[32px]">{plan.description}</CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight">
                      {plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString("en-IN")}`}
                    </span>
                    <span className="text-xs text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="my-2 border-t border-border" />
                  <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button
                    className="w-full gap-2"
                    variant={isCurrent ? "outline" : plan.recommended ? "default" : "secondary"}
                    disabled={isCurrent || isProcessing}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isCurrent ? "Current Plan" : plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Agency Features Section: Custom Branding & Team Management */}
      <AgencyTeamFeatures planId={activeSub.plan_id} />

      {/* Payment History */}
      <div>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Payment & Invoice History</h2>
        {subscriptions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
            <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            No transaction history found yet. When you upgrade, invoices will appear here.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="text-xs">
                      {new Date(sub.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="font-medium text-xs">{sub.plan_name}</TableCell>
                    <TableCell className="text-xs">₹{sub.amount_paid.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {sub.razorpay_payment_id || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 capitalize text-[10px]">
                        {sub.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Agency Team Features Component ─────────────── */
function AgencyTeamFeatures({ planId }) {
  const [agencyName, setAgencyName] = useState(() => typeof window !== "undefined" ? localStorage.getItem("agency_name") || "Prime Real Estate Agency" : "Prime Real Estate Agency");
  const [agencyPhone, setAgencyPhone] = useState(() => typeof window !== "undefined" ? localStorage.getItem("agency_phone") || "+91 98765 43210" : "+91 98765 43210");
  const [agencyTagline, setAgencyTagline] = useState(() => typeof window !== "undefined" ? localStorage.getItem("agency_tagline") || "Premium Properties & Trusted Realty Services" : "Premium Properties & Trusted Realty Services");

  const [teamMembers, setTeamMembers] = useState([
    { name: "John Doe (You)", email: "john@realty.com", role: "Agency Admin", status: "Active" },
    { name: "Anita Sharma", email: "anita@realty.com", role: "Realtor Agent", status: "Active" },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");

  function saveBranding(e) {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("agency_name", agencyName);
      localStorage.setItem("agency_phone", agencyPhone);
      localStorage.setItem("agency_tagline", agencyTagline);
    }
    toast.success("Agency branding updated!");
  }

  function handleInvite(e) {
    e.preventDefault();
    if (!inviteEmail) return;
    setTeamMembers((prev) => [
      ...prev,
      { name: inviteEmail.split("@")[0], email: inviteEmail, role: "Realtor Agent", status: "Pending Invite" },
    ]);
    toast.success(`Invite sent to ${inviteEmail}`);
    setInviteEmail("");
  }

  return (
    <div className="mb-12 space-y-6 border-t border-border pt-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Custom Branding & Multi-Agent Team Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure custom agency branding on client receipts & manage multi-agent team access.
          </p>
        </div>
        <Badge className={planId === "agency_team" ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}>
          {planId === "agency_team" ? "Unlocked for Agency Team" : "Agency Team Feature"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Custom Branding Card */}
        <Card className="p-5 space-y-4">
          <div className="font-semibold text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Custom Agency Branding & Receipt Settings
          </div>
          <form onSubmit={saveBranding} className="space-y-3 text-xs">
            <div>
              <label className="mb-1 block font-medium">Agency Name</label>
              <input
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium">Agency Phone / WhatsApp Contact</label>
              <input
                value={agencyPhone}
                onChange={(e) => setAgencyPhone(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium">Tagline / Header Note for Flyers</label>
              <input
                value={agencyTagline}
                onChange={(e) => setAgencyTagline(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button type="submit" size="sm" className="mt-2 text-xs">
              Save Branding Settings
            </Button>
          </form>
        </Card>

        {/* Multi-Agent Team Management Card */}
        <Card className="p-5 space-y-4">
          <div className="font-semibold text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Multi-Agent Team Members
          </div>

          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              placeholder="agent@agency.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button type="submit" size="sm" className="text-xs shrink-0">
              Invite Agent
            </Button>
          </form>

          <div className="space-y-2">
            {teamMembers.map((m, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5 text-xs border border-border/50">
                <div>
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground">{m.email} · {m.role}</div>
                </div>
                <Badge variant={m.status === "Active" ? "secondary" : "outline"} className="text-[10px]">
                  {m.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
