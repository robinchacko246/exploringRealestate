-- Allow public users (anon) to upload images to the property-images bucket
-- but restrict them to the 'public-listings/' folder.

CREATE POLICY "Public can upload images to public-listings folder"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'property-images' AND 
  (storage.foldername(name))[1] = 'public-listings'
);

-- Note: We do not allow anon users to UPDATE or DELETE files for security reasons.
