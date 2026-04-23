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
import { SpoedKoerierSection } from '@/components/public/SpoedKoerierSection';
// Main site components
import { MainHeroSection } from '@/components/public/MainHeroSection';
import { ServicesSection } from '@/components/public/ServicesSection';
import { CountriesSection } from '@/components/public/CountriesSection';
import { StatsSection } from '@/components/public/StatsSection';
import { TestimonialsSection } from '@/components/public/TestimonialsSection';
import { MainCTASection } from '@/components/public/MainCTASection';
import { PriceCalculator } from '@/components/public/PriceCalculator';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { land, isHoofdsite, loading: landLoading } = useLand();

  // Fetch popular routes (only for country-specific sites)
  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ['popular-routes', land?.id],
    queryFn: async () => {
      const { data: steden } = await supabase
        .from('buitenland_steden')
        .select('id')
        .eq('land_id', land!.id);
      
      if (!steden || steden.length === 0) return [];

      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          nl_plaats:nl_plaatsen(*),
          buitenland_stad:buitenland_steden(*, land:landen(*))
        `)
        .in('buitenland_stad_id', steden.map(s => s.id))
        .limit(6);
      
      if (error) throw error;
      return data;
    },
    enabled: !!land,
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

  // Country-specific site (e.g., kroatiekoerier.nl)
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

            <SpoedKoerierSection landNaam={land.naam} />
            
            {/* Price Calculator */}
            <PriceCalculator 
              landNaam={land.naam}
              kmTarief={land.km_tarief}
              restrictToCountry={land.iso_code || undefined}
            />

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

  // Main site (deeuropakoerier.nl) - Corporate landing page
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title="De Europa Koerier | Betrouwbare koeriersdiensten door heel Europa"
        description="Al meer dan 15 jaar uw betrouwbare koerierspartner voor transport van Nederland naar heel Europa. Dagelijkse ritten, persoonlijke service, 100% verzekerd."
      />
      <Header />
      
      <main className="flex-1">
        <MainHeroSection />
        <SpoedKoerierSection />
        <StatsSection />
        <PriceCalculator />
        <ServicesSection />
        <CountriesSection />
        <TestimonialsSection />
        <MainCTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
