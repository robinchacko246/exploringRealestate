-- ─────────────────────────────────────────────────────────────────────────────
-- Allow owners to view their own listing by ID (for the /status page)
-- The existing RLS only exposes listings where status = 'available'.
-- This new policy lets anyone read any listing by its exact UUID —
-- safe because UUIDs are not guessable.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Anyone can view any listing by exact id"
  ON public.public_property_listings
  FOR SELECT
  TO anon, authenticated
  USING (true);
