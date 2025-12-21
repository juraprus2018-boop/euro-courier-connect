-- Landen tabel (10-20 bestemmingslanden)
CREATE TABLE public.landen (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  naam TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domein TEXT,
  km_tarief DECIMAL(10,4) NOT NULL DEFAULT 0.50,
  actief BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Nederlandse plaatsen (alle ~7000+ plaatsen)
CREATE TABLE public.nl_plaatsen (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  naam TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  gemeente TEXT,
  provincie TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Buitenlandse steden per land
CREATE TABLE public.buitenland_steden (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  land_id UUID NOT NULL REFERENCES public.landen(id) ON DELETE CASCADE,
  naam TEXT NOT NULL,
  slug TEXT NOT NULL,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  route_generatie_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(land_id, slug)
);

-- Routes (NL plaats -> buitenlandse stad)
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nl_plaats_id UUID NOT NULL REFERENCES public.nl_plaatsen(id) ON DELETE CASCADE,
  buitenland_stad_id UUID NOT NULL REFERENCES public.buitenland_steden(id) ON DELETE CASCADE,
  afstand_km DECIMAL(10,2) NOT NULL,
  geschatte_prijs DECIMAL(10,2) NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(nl_plaats_id, buitenland_stad_id)
);

-- Aanvragen/offertes
CREATE TABLE public.aanvragen (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
  land_id UUID REFERENCES public.landen(id) ON DELETE SET NULL,
  ophaal_adres TEXT NOT NULL,
  ophaal_postcode TEXT,
  ophaal_plaats TEXT NOT NULL,
  aflever_adres TEXT NOT NULL,
  aflever_postcode TEXT,
  aflever_plaats TEXT NOT NULL,
  datum DATE,
  tijd_voorkeur TEXT,
  zending_type TEXT,
  gewicht_kg DECIMAL(10,2),
  lengte_cm DECIMAL(10,2),
  breedte_cm DECIMAL(10,2),
  hoogte_cm DECIMAL(10,2),
  omschrijving TEXT,
  contact_naam TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_telefoon TEXT,
  contact_bedrijf TEXT,
  opmerkingen TEXT,
  status TEXT NOT NULL DEFAULT 'nieuw',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pagina teksten per website/land
CREATE TABLE public.pagina_teksten (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  land_id UUID REFERENCES public.landen(id) ON DELETE CASCADE,
  pagina_type TEXT NOT NULL,
  titel TEXT,
  subtitel TEXT,
  inhoud TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(land_id, pagina_type)
);

-- Admin gebruikers
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.landen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nl_plaatsen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buitenland_steden ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aanvragen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagina_teksten ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Public read policies (voor publieke website)
CREATE POLICY "Public read landen" ON public.landen FOR SELECT USING (actief = true);
CREATE POLICY "Public read nl_plaatsen" ON public.nl_plaatsen FOR SELECT USING (true);
CREATE POLICY "Public read buitenland_steden" ON public.buitenland_steden FOR SELECT USING (true);
CREATE POLICY "Public read routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Public read pagina_teksten" ON public.pagina_teksten FOR SELECT USING (true);

-- Public insert aanvragen (bezoekers kunnen offertes aanvragen)
CREATE POLICY "Public insert aanvragen" ON public.aanvragen FOR INSERT WITH CHECK (true);

-- Admin policies
CREATE POLICY "Admins manage landen" ON public.landen FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage nl_plaatsen" ON public.nl_plaatsen FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage buitenland_steden" ON public.buitenland_steden FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage routes" ON public.routes FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage aanvragen" ON public.aanvragen FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage pagina_teksten" ON public.pagina_teksten FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage admin_users" ON public.admin_users FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Indexes for performance
CREATE INDEX idx_routes_nl_plaats ON public.routes(nl_plaats_id);
CREATE INDEX idx_routes_buitenland_stad ON public.routes(buitenland_stad_id);
CREATE INDEX idx_routes_slug ON public.routes(slug);
CREATE INDEX idx_buitenland_steden_land ON public.buitenland_steden(land_id);
CREATE INDEX idx_nl_plaatsen_slug ON public.nl_plaatsen(slug);
CREATE INDEX idx_aanvragen_status ON public.aanvragen(status);
CREATE INDEX idx_aanvragen_land ON public.aanvragen(land_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_landen_updated_at BEFORE UPDATE ON public.landen FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_buitenland_steden_updated_at BEFORE UPDATE ON public.buitenland_steden FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_aanvragen_updated_at BEFORE UPDATE ON public.aanvragen FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pagina_teksten_updated_at BEFORE UPDATE ON public.pagina_teksten FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();