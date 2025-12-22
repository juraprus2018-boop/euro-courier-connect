import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLand } from '@/hooks/useLand';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { HeroSection } from '@/components/public/HeroSection';
import { SearchRoutes } from '@/components/public/SearchRoutes';
import { RouteCard } from '@/components/public/RouteCard';
import { Loader2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { land, isHoofdsite, loading: landLoading } = useLand();

  // Fetch popular routes (with optional land filter)
  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ['popular-routes', land?.id],
    queryFn: async () => {
      let query = supabase
        .from('routes')
        .select(`
          *,
          nl_plaats:nl_plaatsen(*),
          buitenland_stad:buitenland_steden(*, land:landen(*))
        `)
        .limit(6);

      if (land) {
        // Filter routes for this specific country
        const { data: steden } = await supabase
          .from('buitenland_steden')
          .select('id')
          .eq('land_id', land.id);
        
        if (steden && steden.length > 0) {
          query = query.in('buitenland_stad_id', steden.map(s => s.id));
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch all active countries for the main site
  const { data: landen } = useQuery({
    queryKey: ['landen'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landen')
        .select('*')
        .eq('actief', true)
        .order('naam');
      if (error) throw error;
      return data;
    },
    enabled: isHoofdsite,
  });

  if (landLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header landNaam={land?.naam} />
      
      <main className="flex-1">
        <HeroSection landNaam={land?.naam} />
        
        {/* Search Section */}
        <section className="py-16 bg-muted/50">
          <div className="container">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl font-bold">Zoek uw route</h2>
              <p className="mt-2 text-muted-foreground">
                Vind direct de route en prijs voor uw zending
              </p>
            </div>
            <SearchRoutes />
          </div>
        </section>

        {/* Countries Section (only on main site) */}
        {isHoofdsite && landen && landen.length > 0 && (
          <section className="py-16">
            <div className="container">
              <div className="text-center mb-8">
                <h2 className="font-display text-3xl font-bold">Onze bestemmingen</h2>
                <p className="mt-2 text-muted-foreground">
                  Wij rijden dagelijks naar deze landen
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {landen.map((l) => (
                  <a
                    key={l.id}
                    href={l.domein ? `https://${l.domein}` : `/routes?land=${l.slug}`}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold">{l.naam}</h3>
                      <p className="text-sm text-muted-foreground">
                        Vanaf €{l.km_tarief}/km
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Popular Routes Section */}
        <section className="py-16 bg-muted/50">
          <div className="container">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl font-bold">
                {land ? `Populaire routes naar ${land.naam}` : 'Populaire routes'}
              </h2>
              <p className="mt-2 text-muted-foreground">
                Bekijk onze meest gevraagde koeriersroutes
              </p>
            </div>
            
            {routesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : routes && routes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routes.map((route) => (
                  <RouteCard 
                    key={route.id} 
                    nlPlaats={route.nl_plaats?.naam || ''}
                    buitenlandStad={route.buitenland_stad?.naam || ''}
                    afstandKm={route.afstand_km}
                    prijs={route.geschatte_prijs}
                    slug={route.slug}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nog geen routes beschikbaar. Voeg eerst landen en steden toe via het admin panel.
                </p>
                <Link to="/admin" className="mt-4 inline-block text-primary hover:underline">
                  Ga naar admin →
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
