-- ─────────────────────────────────────────────────────────────────────────────
-- Add admin_notes column to public_property_listings
-- Stores rejection reasons and internal admin notes per listing
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.public_property_listings
ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT NULL;
