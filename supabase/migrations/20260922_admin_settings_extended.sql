-- ─────────────────────────────────────────────────────────────────────────────
-- Seed extended admin_settings defaults: branding, footer, listing rules
-- Run AFTER 20260920_admin_settings.sql
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.admin_settings (key, value)
VALUES
  -- ── Brand & Appearance ─────────────────────────────────────────────────────
  ('brand_name',          'PropertyFlow'),
  ('brand_tagline',       'Kerala''s #1 Property Platform'),
  ('brand_color',         '#009688'),
  ('brand_email',         'hello@propertyflow.in'),
  ('brand_whatsapp',      '+918138802204'),

  -- ── Public Footer ──────────────────────────────────────────────────────────
  ('footer_copyright',    '© 2026 PropertyFlow CRM. All rights reserved.'),
  ('footer_tagline',      'Made with ❤ in Kerala · Built for Indian realtors'),
  ('footer_link_1_label', 'Browse Listings'),
  ('footer_link_1_url',   '/listings'),
  ('footer_link_2_label', 'List Your Property'),
  ('footer_link_2_url',   '/sell'),
  ('footer_link_3_label', 'For Agents'),
  ('footer_link_3_url',   '/agentscrm'),
  ('footer_link_4_label', 'Privacy Policy'),
  ('footer_link_4_url',   '/privacy'),

  -- ── Listing Rules ──────────────────────────────────────────────────────────
  ('max_images_per_listing', '10'),
  ('auto_approve_listings',  'false'),
  ('listing_expiry_days',    '60'),
  ('require_price',          'false'),

  -- ── Notifications ──────────────────────────────────────────────────────────
  ('admin_notification_email', ''),
  ('notify_on_new_submission', 'true'),
  ('notify_on_enquiry',        'true')
ON CONFLICT (key) DO NOTHING;
