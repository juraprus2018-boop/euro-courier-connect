-- Add sync routes fields to landen table
ALTER TABLE public.landen 
ADD COLUMN IF NOT EXISTS sync_routes_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS sync_routes_status text DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS sync_routes_progress integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS sync_routes_total integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS sync_routes_last_run timestamp with time zone,
ADD COLUMN IF NOT EXISTS sync_routes_last_message text;

-- Add unique constraint on routes to prevent duplicates (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'routes_nl_buitenland_unique'
  ) THEN
    ALTER TABLE public.routes ADD CONSTRAINT routes_nl_buitenland_unique UNIQUE (nl_plaats_id, buitenland_stad_id);
  END IF;
END $$;