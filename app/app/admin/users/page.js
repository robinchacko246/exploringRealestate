"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  Building2,
  Phone,
  Mail,
  MoreVertical,
  CheckCircle,
  Sparkles,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedNewRole, setSelectedNewRole] = useState("agent");

  // Fetch profiles and user_roles
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: async () => {
      const [profilesRes, rolesRes, propertiesRes, clientsRes, subsRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("user_roles").select("*"),
        supabase.from("properties").select("id, agent_id"),
        supabase.from("clients").select("id, agent_id"),
        supabase.from("subscriptions").select("agent_id, plan_name, status"),
      ]);

      const profiles = profilesRes.data ?? [];
      const roles = rolesRes.data ?? [];
      const properties = propertiesRes.data ?? [];
      const clients = clientsRes.data ?? [];
      const subs = subsRes.data ?? [];

      return profiles.map((profile) => {
        const userRoleObj = roles.find((r) => r.user_id === profile.id);
        const userProperties = properties.filter((p) => p.agent_id === profile.id);
        const userClients = clients.filter((c) => c.agent_id === profile.id);
        const userSub = subs.find((s) => s.agent_id === profile.id);

        return {
          ...profile,
          role: userRoleObj?.role ?? "agent",
          roleId: userRoleObj?.id,
          propertiesCount: userProperties.length,
          clientsCount: userClients.length,
          planName: userSub?.plan_name ?? "Free Starter",
          subStatus: userSub?.status ?? "active",
        };
      });
    },
  });

  // Role update mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole, existingRoleId }) => {
      if (existingRoleId) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("id", existingRoleId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("User role updated successfully!");
      queryClient.invalidateQueries(["admin-users-list"]);
      setIsRoleModalOpen(false);
    },
    onError: (err) => {
      toast.error(`Failed to update role: ${err.message}`);
    },
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const managerCount = users.filter((u) => u.role === "manager").length;
  const agentCount = users.filter((u) => u.role === "agent").length;

  const openRoleDialog = (user) => {
    setSelectedUser(user);
    setSelectedNewRole(user.role);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = () => {
    if (!selectedUser) return;
    updateRoleMutation.mutate({
      userId: selectedUser.id,
      newRole: selectedNewRole,
      existingRoleId: selectedUser.roleId,
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-amber-500" />
            <h1 className="font-display text-2xl font-bold tracking-tight">
              User & Agent Control Center
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage user accounts, assign admin & manager permissions, and inspect platform agents.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-muted transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh List
        </button>
      </div>

      {/* Role Counts KPI */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs uppercase text-muted-foreground font-medium">Total Users</div>
          <div className="mt-1 font-display text-2xl font-bold">{users.length}</div>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="text-xs uppercase text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Admins
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-amber-600 dark:text-amber-400">
            {adminCount}
          </div>
        </div>
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
          <div className="text-xs uppercase text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
            <Shield className="h-3.5 w-3.5" /> Managers
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-blue-600 dark:text-blue-400">
            {managerCount}
          </div>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="text-xs uppercase text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> Agents
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {agentCount}
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, company, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Role Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="admin">Admins ({adminCount})</option>
            <option value="manager">Managers ({managerCount})</option>
            <option value="agent">Agents ({agentCount})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground font-semibold">
            <tr>
              <th className="px-5 py-3.5">User Details</th>
              <th className="px-5 py-3.5">Company & Contact</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Properties & Clients</th>
              <th className="px-5 py-3.5">Subscription</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-600 font-bold text-sm">
                        {(u.full_name || "U").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {u.full_name || "Unnamed User"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          ID: {u.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      {u.company && (
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{u.company}</span>
                        </div>
                      )}
                      {u.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                      {!u.company && !u.phone && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                        u.role === "admin"
                          ? "bg-amber-500/20 text-amber-600 border border-amber-500/40"
                          : u.role === "manager"
                          ? "bg-blue-500/20 text-blue-600 border border-blue-500/40"
                          : "bg-emerald-500/15 text-emerald-600"
                      }`}
                    >
                      {u.role === "admin" && <ShieldCheck className="h-3.5 w-3.5" />}
                      {u.role === "manager" && <Shield className="h-3.5 w-3.5" />}
                      {u.role}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{u.propertiesCount}</span> Properties
                      <span className="mx-1.5">•</span>
                      <span className="font-semibold text-foreground">{u.clientsCount}</span> Clients
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
                      {u.planName}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => openRoleDialog(u)}
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-600 transition-all"
                    >
                      Edit Role
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Role Change Modal */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
              Manage User Role
            </DialogTitle>
            <DialogDescription>
              Update permissions for <strong>{selectedUser?.full_name || "User"}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Select Assignable Role
              </label>

              <div className="grid gap-3">
                <label
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                    selectedNewRole === "admin"
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-amber-500" />
                    <div>
                      <div className="text-sm font-bold">Admin</div>
                      <div className="text-xs text-muted-foreground">
                        Full platform access: moderation, revenue, user management.
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={selectedNewRole === "admin"}
                    onChange={() => setSelectedNewRole("admin")}
                    className="h-4 w-4 accent-amber-500"
                  />
                </label>

                <label
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                    selectedNewRole === "manager"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="text-sm font-bold">Manager</div>
                      <div className="text-xs text-muted-foreground">
                        Listings moderation and property catalog oversight.
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    value="manager"
                    checked={selectedNewRole === "manager"}
                    onChange={() => setSelectedNewRole("manager")}
                    className="h-4 w-4 accent-blue-500"
                  />
                </label>

                <label
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                    selectedNewRole === "agent"
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-emerald-500" />
                    <div>
                      <div className="text-sm font-bold">Agent</div>
                      <div className="text-xs text-muted-foreground">
                        Standard CRM workspace (properties, clients, requirements).
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    value="agent"
                    checked={selectedNewRole === "agent"}
                    onChange={() => setSelectedNewRole("agent")}
                    className="h-4 w-4 accent-emerald-500"
                  />
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => setIsRoleModalOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRole}
              disabled={updateRoleMutation.isPending}
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {updateRoleMutation.isPending ? "Saving..." : "Save Role Assignment"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
