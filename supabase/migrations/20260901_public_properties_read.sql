-- Allow anyone (anon + authenticated) to read available properties
-- This powers the public /listings showcase website
CREATE POLICY "Public can view available properties"
  ON public.properties
  FOR SELECT
  TO anon, authenticated
  USING (status = 'available');
