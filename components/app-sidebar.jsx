"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  BellRing,
  CreditCard,
  Sparkles,
  LogOut,
  ShieldCheck,
  UserCheck,
  Inbox,
  BarChart3,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";

const main = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard },
  { title: "Clients", url: "/app/clients", icon: Users },
  { title: "Properties", url: "/app/properties", icon: Building2 },
  { title: "Reminders", url: "/app/reminders", icon: BellRing },
  { title: "Billing & Plans", url: "/app/billing", icon: CreditCard },
];

const adminNav = [
  { title: "Admin Overview", url: "/app/admin", icon: ShieldCheck },
  { title: "User & Roles", url: "/app/admin/users", icon: UserCheck },
  { title: "Public Listings", url: "/app/admin/listings", icon: Inbox },
  { title: "Subscriptions", url: "/app/admin/subscriptions", icon: CreditCard },
  { title: "All Properties", url: "/app/admin/properties", icon: Building2 },
  { title: "Analytics", url: "/app/admin/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = usePathname();
  const { user } = useAuth();
  const { isAdmin, role } = useAdmin();
  const router = useRouter();

  const isActive = (url) =>
    url === "/app" ? pathname === "/app" : pathname.startsWith(url);

  const initials = (user?.email ?? "U").slice(0, 2).toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border/40">
        <Link href="/app" className="flex items-center gap-2 px-2 py-3">
          <div
            className="grid h-9 w-9 place-items-center rounded-lg text-primary-foreground shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sparkles className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold text-sidebar-foreground">PropertyFlow</span>
              <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">Realtor CRM</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {main.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation Group (Rendered ONLY if user is an Admin) */}
        {isAdmin && (
          <SidebarGroup className="mt-2">
            <div className="flex items-center justify-between px-2">
              <SidebarGroupLabel className="text-sidebar-foreground/50 flex items-center gap-1.5 font-semibold text-amber-500/90">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin Console</span>
              </SidebarGroupLabel>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                      <Link href={item.url} className="flex items-center gap-3 text-amber-600 dark:text-amber-400 hover:text-amber-500">
                        <item.icon className="h-4 w-4 shrink-0 text-amber-500" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/40 p-2">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-medium text-sidebar-foreground">{user?.email}</span>
              <span className="text-[10px] text-sidebar-foreground/50 capitalize flex items-center gap-1">
                {isAdmin ? (
                  <span className="text-amber-500 font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 inline" /> Admin
                  </span>
                ) : (
                  <span>Agent</span>
                )}
              </span>
            </div>
          )}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/auth");
            }}
            className="rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
