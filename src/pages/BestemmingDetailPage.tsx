import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLand } from '@/hooks/useLand';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { PageBreadcrumb } from '@/components/public/PageBreadcrumb';
import { Loader2, MapPin, ArrowRight, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BestemmingDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { land, loading: landLoading } = useLand();

  // Fetch the city
  const { data: stad, isLoading: stadLoading } = useQuery({
    queryKey: ['bestemming', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buitenland_steden')
        .select(`
          *,
          land:landen(*)
        `)
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch routes to this city
  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ['routes-naar', stad?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          nl_plaats:nl_plaatsen(*)
        `)
        .eq('buitenland_stad_id', stad!.id)
        .order('afstand_km');
      
      if (error) throw error;
      return data;
    },
    enabled: !!stad?.id,
  });

  if (landLoading || stadLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // On a country-specific site, only show destinations belonging to that country
  const wrongLand = land && stad && stad.land_id !== land.id;

  if (!stad || wrongLand) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header landNaam={land?.naam} />
        <main className="flex-1 py-12">
          <div className="container text-center">
            <h1 className="font-display text-2xl font-bold mb-4">Bestemming niet gevonden</h1>
            <Link to="/bestemmingen" className="text-primary hover:underline">
              Terug naar bestemmingen
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const landNaam = stad.land?.naam || land?.naam;

  return (
    <div className="min-h-screen flex flex-col">
      <Header landNaam={land?.naam} />
      
      <main className="flex-1 py-12">
        <div className="container">
          <PageBreadcrumb
            items={[
              { label: 'Bestemmingen', to: '/bestemmingen' },
              { label: stad.naam },
            ]}
            className="mb-6"
          />

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-primary">
                <Truck className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">
                  Koerier naar {stad.naam}
                </h1>
                {landNaam && (
                  <p className="text-muted-foreground">{landNaam}</p>
                )}
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Wij verzorgen betrouwbare koeriersdiensten van Nederland naar {stad.naam}. 
              Kies hieronder uw vertrekplaats voor een directe offerte.
            </p>
          </div>

          {/* Routes list */}
          <div className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-4">
              Vertrekplaatsen in Nederland
            </h2>
            
            {routesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !routes || routes.length === 0 ? (
              <div className="text-center py-12 bg-muted/50 rounded-xl">
                <p className="text-muted-foreground mb-4">
                  Nog geen routes beschikbaar naar {stad.naam}.
                </p>
                <Button asChild>
                  <Link to="/offerte">Vraag een offerte aan</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {routes.map((route) => (
                  <Link
                    key={route.id}
                    to={`/route/${route.slug}`}
                    className="group flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {route.nl_plaats?.naam}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {route.afstand_km} km • vanaf €{route.geschatte_prijs}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <h3 className="font-display text-xl font-semibold mb-2">
              Uw stad niet in de lijst?
            </h3>
            <p className="text-muted-foreground mb-4">
              Wij verzorgen ook transport vanaf andere locaties in Nederland.
            </p>
            <Button asChild size="lg">
              <Link to="/offerte">Vraag een offerte aan</Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BestemmingDetailPage;
