-- Subscriptions and billing table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL DEFAULT 'free',
  plan_name TEXT NOT NULL DEFAULT 'Free Starter Plan',
  amount_paid BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents insert own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents update own subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = agent_id);
