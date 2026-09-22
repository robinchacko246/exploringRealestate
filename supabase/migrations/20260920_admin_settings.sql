-- ─────────────────────────────────────────────────────────────────────────────
-- Admin Settings: global key-value config managed from the Admin portal
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.admin_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default admin contact details
INSERT INTO public.admin_settings (key, value)
VALUES
  ('admin_contact_phone', '+918138802204'),
  ('admin_contact_name',  'PropertyFlow Desk')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Anyone (public) can READ admin settings — needed for /sell page and /listings page
CREATE POLICY "Public can read admin settings"
  ON public.admin_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated admins can UPDATE admin settings
CREATE POLICY "Admins can update admin settings"
  ON public.admin_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );
