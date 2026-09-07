-- ─────────────────────────────────────────────────────────────────────────────
-- Public property listings: owner-submitted properties (no auth required)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.public_property_listings (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  listing_type     TEXT         NOT NULL DEFAULT 'sell',  -- 'sell' | 'rent'
  property_type    TEXT,                                   -- apartment | villa | house | plot | commercial | land
  title            TEXT         NOT NULL,
  location         TEXT,
  price            NUMERIC,
  bhk              INTEGER,
  land_size_cents  NUMERIC,
  description      TEXT,
  owner_name       TEXT         NOT NULL,
  owner_phone      TEXT         NOT NULL,
  images           TEXT[]       DEFAULT ARRAY[]::TEXT[],
  status           TEXT         NOT NULL DEFAULT 'available'
);

-- Enable Row Level Security
ALTER TABLE public.public_property_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can read available listings (powers the /listings page)
CREATE POLICY "Public can view submitted listings"
  ON public.public_property_listings
  FOR SELECT
  TO anon, authenticated
  USING (status = 'available');

-- Anyone (owner, guest) can submit a new property listing
CREATE POLICY "Anyone can submit a property"
  ON public.public_property_listings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
