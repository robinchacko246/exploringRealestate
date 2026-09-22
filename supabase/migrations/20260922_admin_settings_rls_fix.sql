-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: Add INSERT policy for admins on admin_settings
-- The upsert in the settings page requires both INSERT and UPDATE permissions.
-- The original migration only had UPDATE, causing RLS violations on new keys.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Admins can insert admin settings"
  ON public.admin_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );
