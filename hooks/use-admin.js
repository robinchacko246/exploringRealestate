"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./use-auth";
import { supabase } from "@/integrations/supabase/client";

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState("agent");
  const [loading, setLoading] = useState(true);

  const checkRole = useCallback(async () => {
    if (!user) {
      setRole("agent");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) {
        console.warn("[useAdmin] Failed to fetch user_roles:", error.message);
        setRole("agent");
      } else if (data && data.length > 0) {
        const rolesList = data.map((r) => r.role);
        if (rolesList.includes("admin")) setRole("admin");
        else if (rolesList.includes("manager")) setRole("manager");
        else setRole("agent");
      } else {
        setRole("agent");
      }
    } catch (err) {
      console.error("[useAdmin] Error checking admin status:", err);
      setRole("agent");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      checkRole();
    }
  }, [authLoading, checkRole]);

  const isAdmin = role === "admin";
  const isManager = role === "manager" || isAdmin;

  return {
    user,
    role,
    isAdmin,
    isManager,
    loading: authLoading || loading,
    refetch: checkRole,
  };
}
