-- ─────────────────────────────────────────────────────────────────────────────
-- Add hide_owner_contact and admin_contact_phone columns to public_property_listings
-- Default hide_owner_contact to TRUE so all owner listings route to Admin phone by default
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.public_property_listings 
ADD COLUMN IF NOT EXISTS hide_owner_contact BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS admin_contact_phone TEXT DEFAULT '+918138802204',
ADD COLUMN IF NOT EXISTS admin_contact_name TEXT DEFAULT 'PropertyFlow Desk';

-- Update all existing rows to default hide_owner_contact = true and admin_contact_phone = '+918138802204'
UPDATE public.public_property_listings
SET hide_owner_contact = true,
    admin_contact_phone = '+918138802204'
WHERE hide_owner_contact IS NULL 
   OR hide_owner_contact = false
   OR admin_contact_phone IS NULL 
   OR admin_contact_phone LIKE '%7907102204%';
