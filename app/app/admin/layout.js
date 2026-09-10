"use client";

import { useAdmin } from "@/hooks/use-admin";
import { Loader2, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }) {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm font-medium text-muted-foreground">Verifying admin permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl p-6 sm:p-12">
        <div className="rounded-2xl border border-destructive/30 bg-card p-8 text-center shadow-lg space-y-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Access Restricted
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              This area (<code className="text-destructive font-mono bg-destructive/10 px-1.5 py-0.5 rounded">/app/admin</code>) is accessible only to administrators. Your account does not have admin permissions.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Agent Workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
