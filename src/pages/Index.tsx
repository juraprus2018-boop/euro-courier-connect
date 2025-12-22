import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLand } from '@/hooks/useLand';
import { LandThemeProvider } from '@/components/LandThemeProvider';
import { SEOHead } from '@/components/SEOHead';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { HeroSection } from '@/components/public/HeroSection';
import { SearchRoutes } from '@/components/public/SearchRoutes';
import { RouteCard } from '@/components/public/RouteCard';
import { USPSection } from '@/components/public/USPSection';
import { FAQSection } from '@/components/public/FAQSection';
import { CTASection } from '@/components/public/CTASection';
import { Loader2 } from 'lucide-react';
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

  // Fetch destinations for this land (country-specific site)
  const { data: bestemmingen } = useQuery({
    queryKey: ['land-bestemmingen', land?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buitenland_steden')
        .select('*')
        .eq('land_id', land!.id)
        .order('naam')
        .limit(8);
      if (error) throw error;
      return data;
    },
    enabled: !!land,
  });

  if (landLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Country-specific site
  if (land) {
    return (
      <LandThemeProvider>
        <div className="min-h-screen flex flex-col">
          <SEOHead 
            title={land.meta_title || undefined}
            description={land.meta_description || undefined}
            landNaam={land.naam}
          />
          <Header landNaam={land.naam} />
          
          <main className="flex-1">
            <HeroSection 
              landNaam={land.naam}
              heroTitel={land.hero_titel}
              heroSubtitel={land.hero_subtitel}
            />
            
            {/* Search Section */}
            <section className="py-16 bg-muted/50">
              <div className="container">
                <div className="text-center mb-8">
                  <h2 className="font-display text-3xl font-bold">Zoek uw route</h2>
                  <p className="mt-2 text-muted-foreground">
                    Vind direct de route en prijs voor uw zending naar {land.naam}
                  </p>
                </div>
                <SearchRoutes />
              </div>
            </section>

            {/* Destinations in this country */}
            {bestemmingen && bestemmingen.length > 0 && (
              <section className="py-16">
                <div className="container">
                  <div className="text-center mb-8">
                    <h2 className="font-display text-3xl font-bold">
                      Bestemmingen in {land.naam}
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                      Wij rijden naar deze steden in {land.naam}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {bestemmingen.map((stad) => (
                      <Link
                        key={stad.id}
                        to={`/bestemming/${stad.slug}`}
                        className="p-4 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all text-center"
                      >
                        <h3 className="font-display font-semibold">{stad.naam}</h3>
                      </Link>
                    ))}
                  </div>
                  <div className="text-center mt-6">
                    <Link 
                      to="/bestemmingen" 
                      className="text-primary hover:underline font-medium"
                    >
                      Bekijk alle bestemmingen →
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Popular Routes Section */}
            <section className="py-16 bg-muted/50">
              <div className="container">
                <div className="text-center mb-8">
                  <h2 className="font-display text-3xl font-bold">
                    Populaire routes naar {land.naam}
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Onze meest gevraagde koeriersroutes
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
                      Nog geen routes beschikbaar. Neem contact op voor een offerte.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <USPSection landNaam={land.naam} />
            
            <FAQSection landNaam={land.naam} customFaq={land.faq || undefined} />
            
            <CTASection landNaam={land.naam} />
          </main>
          
          <Footer />
        </div>
      </LandThemeProvider>
    );
  }

  // Main site (deeuropakoerier.nl) - show overview of all countries
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead />
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        
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

        {/* Popular Routes Section */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl font-bold">
                Populaire routes
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
                  Nog geen routes beschikbaar.
                </p>
              </div>
            )}
          </div>
        </section>

        <USPSection />
        
        <FAQSection />
        
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
