import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

export type ExtractedRequirement = z.infer<typeof ExtractedSchema>;

const SYSTEM = `You are a real estate intake assistant for Indian property agents.
Parse the client message and return STRICT JSON matching the schema.
Rules:
- Budgets are in Indian rupees as integers (convert: "45 lakh"=4500000, "1.2 crore"=12000000, "50L"=5000000).
- land_size_cents: 1 cent ≈ 435.6 sqft. Convert acre/ground/sqft to cents.
- property_type: plot/villa/apartment/house/commercial/land only. Use null if unclear.
- bhk: integer or null.
- Always include a concise one-line summary.
- Use null (not 0 or "") for unknown fields.`;

export const extractRequirement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => ExtractInput.parse(data))
  .handler(async ({ data }): Promise<ExtractedRequirement> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const userMsg = data.clientName
      ? `Client name: ${data.clientName}\n\nMessage:\n${data.message}`
      : `Message:\n${data.message}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userMsg },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "save_requirement",
              description: "Save the structured client requirement",
              parameters: {
                type: "object",
                properties: {
                  intent: { type: "string", enum: ["buy", "sell", "rent", "invest", "unknown"] },
                  property_type: {
                    type: ["string", "null"],
                    enum: ["plot", "villa", "apartment", "house", "commercial", "land", null],
                  },
                  location: { type: ["string", "null"] },
                  nearby: { type: ["string", "null"] },
                  budget_min: { type: ["number", "null"] },
                  budget_max: { type: ["number", "null"] },
                  land_size_cents: { type: ["number", "null"] },
                  bhk: { type: ["integer", "null"] },
                  urgency: { type: ["string", "null"], enum: ["low", "medium", "high", null] },
                  summary: { type: "string" },
                  client_name: { type: ["string", "null"] },
                },
                required: ["intent", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "save_requirement" } },
      }),
    });

    if (res.status === 429) throw new Error("AI rate limit reached. Try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace settings.");
    if (!res.ok) throw new Error(`AI gateway error ${res.status}: ${await res.text()}`);

    const json = await res.json();
    const args = json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("AI did not return structured output");
    const parsed = ExtractedSchema.parse(JSON.parse(args));
    return parsed;
  });

const SaveInput = z.object({
  client_id: z.string().uuid(),
  extracted: ExtractedSchema,
});

export const saveExtractedRequirement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => SaveInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const e = data.extracted;
    const { data: row, error } = await supabase
      .from("requirements")
      .insert({
        agent_id: userId,
        client_id: data.client_id,
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
  });

const MatchInput = z.object({
  property_type: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  budget_min: z.number().nullable().optional(),
  budget_max: z.number().nullable().optional(),
  land_size_cents: z.number().nullable().optional(),
  bhk: z.number().nullable().optional(),
});

export const matchProperties = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => MatchInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase.from("properties").select("*").eq("status", "available").limit(50);
    if (data.property_type) q = q.eq("property_type", data.property_type as any);
    if (data.budget_max) q = q.lte("price", data.budget_max);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    // Score in JS for fuzzy fields
    const scored = (rows ?? []).map((p: any) => {
      let score = 0;
      const reasons: string[] = [];
      if (data.property_type && p.property_type === data.property_type) {
        score += 30;
        reasons.push("Type match");
      }
      if (data.location && p.location && p.location.toLowerCase().includes(data.location.toLowerCase())) {
        score += 25;
        reasons.push("Location match");
      }
      if (data.budget_max && p.price && p.price <= data.budget_max) {
        score += 20;
        reasons.push("Within budget");
      }
      if (data.budget_min && p.price && p.price >= data.budget_min) score += 5;
      if (data.bhk && p.bhk === data.bhk) {
        score += 15;
        reasons.push(`${data.bhk}BHK match`);
      }
      if (data.land_size_cents && p.land_size_cents) {
        const diff = Math.abs(Number(p.land_size_cents) - data.land_size_cents);
        if (diff <= 2) {
          score += 15;
          reasons.push("Size match");
        } else if (diff <= 5) score += 5;
      }
      return { property: p, score, reasons };
    });

    return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 10);
  });
