-- Add theme colors and branding to landen table
ALTER TABLE public.landen 
ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '210 100% 50%',
ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '210 80% 60%',
ADD COLUMN IF NOT EXISTS hero_titel text,
ADD COLUMN IF NOT EXISTS hero_subtitel text,
ADD COLUMN IF NOT EXISTS hero_afbeelding_url text,
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS faq jsonb DEFAULT '[]'::jsonb;

-- Add comments for clarity
COMMENT ON COLUMN public.landen.primary_color IS 'HSL waarde voor primaire kleur (bijv. 210 100% 50%)';
COMMENT ON COLUMN public.landen.secondary_color IS 'HSL waarde voor secundaire kleur';
COMMENT ON COLUMN public.landen.faq IS 'JSON array met FAQ items [{vraag: string, antwoord: string}]';