-- Create instellingen table for global settings
CREATE TABLE public.instellingen (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sleutel text NOT NULL UNIQUE,
  waarde text NOT NULL,
  beschrijving text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.instellingen ENABLE ROW LEVEL SECURITY;

-- Admins can manage settings
CREATE POLICY "Admins manage instellingen"
ON public.instellingen
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Public can read settings (needed for price calculations)
CREATE POLICY "Public read instellingen"
ON public.instellingen
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_instellingen_updated_at
BEFORE UPDATE ON public.instellingen
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default values
INSERT INTO public.instellingen (sleutel, waarde, beschrijving) VALUES
  ('km_tarief', '0.50', 'Prijs per kilometer in euro'),
  ('depot_latitude', '51.4386732', 'Depot locatie breedtegraad'),
  ('depot_longitude', '5.5223595', 'Depot locatie lengtegraad');

-- Remove km_tarief from landen table (optional - keeping for backwards compatibility but won't be used)
COMMENT ON COLUMN public.landen.km_tarief IS 'DEPRECATED: Gebruik instellingen tabel voor km_tarief';