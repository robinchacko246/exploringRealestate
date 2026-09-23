"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

import { getCachedSettings, setCachedSettings } from "@/lib/brand-cache";

const sbPublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function AppLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [brandName, setBrandName] = useState(() => getCachedSettings()?.brand_name || "PropertyFlow");

  useEffect(() => {
    sbPublic
      .from("admin_settings")
      .select("key, value")
      .then(({ data }) => {
        if (!data) return;
        const map = {};
        data.forEach((r) => { map[r.key] = r.value; });
        setCachedSettings(map);
        if (map.brand_name) setBrandName(map.brand_name);
      });
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl">
            <SidebarTrigger />
            <div className="text-sm font-medium text-muted-foreground">{brandName} Workspace</div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
