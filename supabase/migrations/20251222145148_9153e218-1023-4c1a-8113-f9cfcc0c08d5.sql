-- Add ISO country code to landen table for geocoding restrictions
ALTER TABLE public.landen ADD COLUMN IF NOT EXISTS iso_code TEXT;

-- Update some common country codes
COMMENT ON COLUMN public.landen.iso_code IS 'ISO 3166-1 alpha-2 country code for geocoding (e.g., HR for Croatia, DE for Germany)';