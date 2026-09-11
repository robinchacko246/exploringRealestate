import { NextResponse } from "next/server";

/**
 * POST /api/n8n-webhook
 *
 * Server-side proxy to n8n — solves:
 *  1. CORS: browser never talks to n8n directly
 *  2. Security: the real n8n URL stays server-side (no NEXT_PUBLIC_)
 *  3. Resilience: never returns 500 — n8n failures are non-fatal
 */
export async function POST(request) {
  const n8nUrl = process.env.N8N_WEBHOOK_URL;

  if (!n8nUrl) {
    console.warn("[n8n] N8N_WEBHOOK_URL is not set — skipping webhook");
    return NextResponse.json({ ok: true, skipped: true });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  try {
    // 10-second timeout — never hang the user's save action
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Read the raw text — n8n may return HTML when workflow is inactive
    const text = await response.text();

    if (!response.ok) {
      console.warn(
        `[n8n] Webhook returned ${response.status}. ` +
        `Is the workflow activated? Response: ${text.slice(0, 200)}`
      );
    } else {
      console.log("[n8n] Webhook delivered successfully:", response.status);
    }

    // Always return 200 to the client — n8n state is non-critical
    return NextResponse.json({ ok: true, n8n_status: response.status });

  } catch (err) {
    if (err.name === "AbortError") {
      console.warn("[n8n] Webhook timed out after 10s");
    } else {
      console.error("[n8n] Proxy error:", err.message);
    }
    // Never let n8n failure break the property save flow
    return NextResponse.json({ ok: true, error: "webhook_unreachable" });
  }
}
