import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req) {
  try {
    const { amount, currency = "INR", receipt = "receipt_" + Date.now() } = await req.json();

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json({ error: "Razorpay credentials not configured" }, { status: 500 });
    }

    const instance = new Razorpay({
      key_id: key_id.replace(/^"|"$/g, ""),
      key_secret: key_secret.replace(/^"|"$/g, ""),
    });

    const order = await instance.orders.create({
      amount: Math.round(Number(amount) * 100), // amount in paise
      currency,
      receipt,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay order error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
