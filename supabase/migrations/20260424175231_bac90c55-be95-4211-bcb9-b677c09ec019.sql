CREATE TABLE public.prijsberekeningen (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  host text,
  land_id uuid REFERENCES public.landen(id) ON DELETE SET NULL,
  land_naam text,
  ophaal_adres text,
  aflever_adres text,
  pickup_lat numeric,
  pickup_lng numeric,
  destination_lat numeric,
  destination_lng numeric,
  afstand_km numeric,
  rijtijd_minuten numeric,
  km_tarief numeric,
  berekende_prijs numeric,
  ip_adres text,
  user_agent text,
  referer text
);

ALTER TABLE public.prijsberekeningen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage prijsberekeningen"
ON public.prijsberekeningen
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Public insert prijsberekeningen"
ON public.prijsberekeningen
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE INDEX idx_prijsberekeningen_created_at ON public.prijsberekeningen(created_at DESC);
CREATE INDEX idx_prijsberekeningen_land_id ON public.prijsberekeningen(land_id);
CREATE INDEX idx_prijsberekeningen_host ON public.prijsberekeningen(host);