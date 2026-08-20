import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const ExtractInput = z.object({
  message: z.string().min(3).max(5000),
  clientName: z.string().max(200).optional(),
});

const ExtractedSchema = z.object({
  intent: z.enum(["buy", "sell", "rent", "invest", "unknown"]),
  property_type: z.enum(["plot", "villa", "apartment", "house", "commercial", "land"]).nullable(),
  location: z.string().nullable(),
  nearby: z.string().nullable(),
  budget_min: z.number().nullable(),
  budget_max: z.number().nullable(),
  land_size_cents: z.number().nullable(),
  bhk: z.number().int().nullable(),
  urgency: z.enum(["low", "medium", "high"]).nullable(),
  summary: z.string(),
  client_name: z.string().nullable(),
});

export async function extractRequirement(input) {
  const data = ExtractInput.parse(input);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const userMsg = data.clientName
    ? `Client name: ${data.clientName}\n\nMessage:\n${data.message}`
    : `Message:\n${data.message}`;

  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-extract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ message: data.message, clientName: data.clientName }),
  });

  if (res.ok) {
    const json = await res.json();
    return ExtractedSchema.parse(json);
  }

  // Client-side fallback mock
  return {
    intent: "buy",
    property_type: null,
    location: null,
    nearby: null,
    budget_min: null,
    budget_max: null,
    land_size_cents: null,
    bhk: null,
    urgency: null,
    summary: `Requirement from: "${userMsg.slice(0, 80)}..."`,
    client_name: data.clientName ?? null,
  };
}

export async function saveExtractedRequirement(input) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const e = input.extracted;
  const { data: row, error } = await supabase
    .from("requirements")
    .insert({
      agent_id: session.user.id,
      client_id: input.client_id,
      property_type: e.property_type,
      location: e.location,
      nearby: e.nearby,
      budget_min: e.budget_min,
      budget_max: e.budget_max,
      land_size_cents: e.land_size_cents,
      bhk: e.bhk,
      notes: e.summary,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { id: row.id };
}

export async function matchProperties(input) {
  let q = supabase.from("properties").select("*").eq("status", "available").limit(50);
  if (input.property_type) q = q.eq("property_type", input.property_type);
  if (input.budget_max) q = q.lte("price", input.budget_max);
  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);

  const scored = (rows ?? []).map((p) => {
    let score = 0;
    const reasons = [];
    if (input.property_type && p.property_type === input.property_type) {
      score += 30;
      reasons.push("Type match");
    }
    if (input.location && p.location && p.location.toLowerCase().includes(input.location.toLowerCase())) {
      score += 25;
      reasons.push("Location match");
    }
    if (input.budget_max && p.price && p.price <= input.budget_max) {
      score += 20;
      reasons.push("Within budget");
    }
    if (input.budget_min && p.price && p.price >= input.budget_min) score += 5;
    if (input.bhk && p.bhk === input.bhk) {
      score += 15;
      reasons.push(`${input.bhk}BHK match`);
    }
    if (input.land_size_cents && p.land_size_cents) {
      const diff = Math.abs(Number(p.land_size_cents) - input.land_size_cents);
      if (diff <= 2) {
        score += 15;
        reasons.push("Size match");
      } else if (diff <= 5) score += 5;
    }
    return { property: p, score, reasons };
  });

  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 10);
}
