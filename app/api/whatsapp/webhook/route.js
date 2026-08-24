import { NextResponse } from "next/server";
import { supabase } from "@/integrations/supabase/client";

// 1. Meta Webhook Verification GET Request
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "propertyflow_webhook_secret";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp Webhook Verified!");
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// 2. Incoming WhatsApp Message Webhook POST Request
export async function POST(req) {
  try {
    const body = await req.json();

    // Check if this is a WhatsApp message notification
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: "ignored" });
    }

    const msg = messages[0];
    const fromPhone = msg.from; // Sender's phone number e.g. "919876543210"
    const textBody = msg.text?.body || "";
    const senderName = value?.contacts?.[0]?.profile?.name || `WhatsApp Lead (${fromPhone})`;

    if (!textBody) {
      return NextResponse.json({ status: "no_text_body" });
    }

    // A. Check if client exists by phone number, or auto-create client profile
    let { data: client } = await supabase
      .from("clients")
      .select("*")
      .or(`phone.eq.${fromPhone},whatsapp.eq.${fromPhone},phone.eq.+${fromPhone},whatsapp.eq.+${fromPhone}`)
      .maybeSingle();

    if (!client) {
      const { data: newClient } = await supabase
        .from("clients")
        .insert({
          name: senderName,
          phone: `+${fromPhone}`,
          whatsapp: `+${fromPhone}`,
          category: "buyer",
          status: "new",
          notes: textBody,
        })
        .select()
        .single();
      client = newClient;
    }

    // B. Save conversation log
    if (client) {
      const { data: convo } = await supabase
        .from("conversations")
        .select("*")
        .eq("client_id", client.id)
        .maybeSingle();

      if (convo) {
        await supabase
          .from("conversations")
          .update({
            last_message: textBody,
            last_message_at: new Date().toISOString(),
          })
          .eq("id", convo.id);
      } else {
        await supabase.from("conversations").insert({
          client_id: client.id,
          last_message: textBody,
          last_message_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "WhatsApp message auto-logged & client processed",
      client: client?.name,
    });
  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
