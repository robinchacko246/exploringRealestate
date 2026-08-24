"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const PLAN_CONFIGS = {
  free: {
    id: "free",
    name: "Starter Realtor (14-Day Trial)",
    price: 0,
    period: "14 Days Free",
    description: "14-day free trial for agents starting out.",
    maxClients: 10,
    maxProperties: 10,
    maxImagesPerProperty: 1,
    trialDays: 14,
    features: [
      "14-Day Free Trial Access",
      "Up to 10 Clients",
      "Up to 10 Property Listings",
      "1 Image per Property",
      "Property Matching Engine",
      "WhatsApp Contact Links",
    ],
  },
  pro_realtor: {
    id: "pro_realtor",
    name: "Pro Realtor",
    price: 499,
    period: "/ month",
    description: "For growing realtors needing more capacity.",
    maxClients: 50,
    maxProperties: 60,
    maxImagesPerProperty: 2,
    features: [
      "Up to 50 Clients",
      "Up to 60 Property Listings",
      "Up to 2 Images per Property",
      "AI Requirement Matcher",
      "WhatsApp Direct Inbox",
      "Priority Customer Support",
    ],
  },
  agency_team: {
    id: "agency_team",
    name: "Agency Team",
    price: 999,
    period: "/ month",
    description: "For agencies requiring unlimited capacity & team features.",
    maxClients: Infinity,
    maxProperties: Infinity,
    maxImagesPerProperty: Infinity,
    features: [
      "Unlimited Clients",
      "Unlimited Property Listings",
      "Unlimited Image Uploads",
      "Multi-Agent Team Accounts",
      "Custom Branding & Receipts",
      "CSV Data Exports",
    ],
  },
};

export function usePlanLimits() {
  const { user } = useAuth();

  const { data: activeSub, isLoading } = useQuery({
    queryKey: ["active-subscription"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") console.error(error);
      return data ?? null;
    },
  });

  const planId = activeSub?.plan_id || "free";
  const plan = PLAN_CONFIGS[planId] || PLAN_CONFIGS.free;

  // Calculate 14-day free trial remaining
  let isTrialExpired = false;
  let trialDaysRemaining = 14;

  if (planId === "free" && user?.created_at) {
    const createdDate = new Date(user.created_at);
    const diffMs = Date.now() - createdDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    trialDaysRemaining = Math.max(0, 14 - diffDays);
    if (diffDays >= 14) {
      isTrialExpired = true;
    }
  }

  function canAddClient(currentClientCount) {
    if (isTrialExpired) {
      return {
        allowed: false,
        reason: "Your 14-Day Free Trial has expired. Please upgrade your plan to continue adding clients.",
        expired: true,
      };
    }
    if (plan.maxClients === Infinity) return { allowed: true };
    if (currentClientCount >= plan.maxClients) {
      return {
        allowed: false,
        reason: `Your ${plan.name} allows up to ${plan.maxClients} clients. Upgrade your plan to add more clients.`,
        limit: plan.maxClients,
      };
    }
    return { allowed: true };
  }

  function canAddProperty(currentPropCount) {
    if (isTrialExpired) {
      return {
        allowed: false,
        reason: "Your 14-Day Free Trial has expired. Please upgrade your plan to continue adding properties.",
        expired: true,
      };
    }
    if (plan.maxProperties === Infinity) return { allowed: true };
    if (currentPropCount >= plan.maxProperties) {
      return {
        allowed: false,
        reason: `Your ${plan.name} allows up to ${plan.maxProperties} property listings. Upgrade your plan to add more properties.`,
        limit: plan.maxProperties,
      };
    }
    return { allowed: true };
  }

  function maxAllowedImages() {
    return plan.maxImagesPerProperty;
  }

  return {
    plan,
    planId,
    activeSub,
    isLoading,
    isTrialExpired,
    trialDaysRemaining,
    canAddClient,
    canAddProperty,
    maxAllowedImages,
  };
}
