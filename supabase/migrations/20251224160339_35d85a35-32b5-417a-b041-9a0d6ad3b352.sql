-- Create storage bucket for car images
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for car images bucket
CREATE POLICY "Public can view car images"
ON storage.objects FOR SELECT
USING (bucket_id = 'car-images');

CREATE POLICY "Authenticated users can upload car images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'car-images');

CREATE POLICY "Authenticated users can update car images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'car-images');

CREATE POLICY "Authenticated users can delete car images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'car-images');