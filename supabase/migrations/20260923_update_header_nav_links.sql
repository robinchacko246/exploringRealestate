-- ─────────────────────────────────────────────────────────────────────────────
-- Update header nav links to include the new public pages
-- Run this in Supabase SQL Editor to update your nav immediately
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO admin_settings (key, value)
VALUES
  ('header_link_1_label', 'Buy'),
  ('header_link_1_url',   '/listings'),
  ('header_link_2_label', 'About Us'),
  ('header_link_2_url',   '/about'),
  ('header_link_3_label', 'Services'),
  ('header_link_3_url',   '/services'),
  ('header_link_4_label', 'Contact'),
  ('header_link_4_url',   '/contact'),
  ('header_link_5_label', 'FAQ'),
  ('header_link_5_url',   '/faq'),
  ('header_link_6_label', 'Testimonials'),
  ('header_link_6_url',   '/testimonials')
ON CONFLICT (key) DO UPDATE
  SET value      = EXCLUDED.value,
      updated_at = now();
