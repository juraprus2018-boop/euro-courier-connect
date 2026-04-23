import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { QuoteForm } from '@/components/public/QuoteForm';
import { supabase } from '@/integrations/supabase/client';
import { useLand } from '@/hooks/useLand';
import { Loader2, MapPin, ArrowRight, Truck, Clock, Euro } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RouteDetail {
  id: string;
  afstand_km: number;
  geschatte_prijs: number;
  nl_plaats: { id: string; naam: string };
  buitenland_stad: { id: string; naam: string; land: { id: string; naam: string } };
}

const RouteDetailPage = () => {
  const { slug } = useParams();
  const { land, loading: landLoading } = useLand();
  const [route, setRoute] = useState<RouteDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from('routes')
        .select(`
          id,
          afstand_km,
          geschatte_prijs,
          nl_plaats:nl_plaatsen(id, naam),
          buitenland_stad:buitenland_steden(id, naam, land:landen(id, naam))
        `)
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching route:', error);
      } else {
        setRoute(data as unknown as RouteDetail);
      }
      
      setLoading(false);
    };

    fetchRoute();
  }, [slug]);

  if (loading || landLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // On a country-specific site, only show routes that go to that country
  const wrongLand = land && route && route.buitenland_stad?.land?.id !== land.id;

  if (!route || wrongLand) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold">Route niet gevonden</h1>
            <p className="text-muted-foreground mt-2">Deze route bestaat niet of is niet meer beschikbaar.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const nlPlaats = route.nl_plaats?.naam || '';
  const buitenlandStad = route.buitenland_stad?.naam || '';
  const landNaam = route.buitenland_stad?.land?.naam || '';

  return (
    <div className="min-h-screen flex flex-col">
      <Header landNaam={landNaam} />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-dark py-16 text-primary-foreground">
          <div className="container">
            <div className="flex items-center gap-4 text-lg mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span className="font-semibold">{nlPlaats}</span>
              </div>
              <ArrowRight className="h-5 w-5" />
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span className="font-semibold">{buitenlandStad}</span>
              </div>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Koerier van {nlPlaats} naar {buitenlandStad}
            </h1>
            <p className="mt-4 text-primary-foreground/80 max-w-2xl">
              Betrouwbare koeriersdienst van {nlPlaats} naar {buitenlandStad}, {landNaam}. 
              Dagelijks op pad voor snelle en veilige leveringen.
            </p>
          </div>
        </section>

        {/* Route Info */}
        <section className="py-12">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Truck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Afstand</p>
                      <p className="font-display text-2xl font-bold">{Number(route.afstand_km).toLocaleString('nl-NL')} km</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                      <Euro className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vanaf</p>
                      <p className="font-display text-2xl font-bold">€{Number(route.geschatte_prijs).toFixed(0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                      <Clock className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Levertijd</p>
                      <p className="font-display text-2xl font-bold">24-48 uur</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="font-display text-2xl font-bold mb-4">
                  Over deze route
                </h2>
                <div className="prose prose-muted max-w-none">
                  <p>
                    Onze koeriersdienst van {nlPlaats} naar {buitenlandStad} biedt u een betrouwbare 
                    en snelle oplossing voor al uw transportbehoeften. Of u nu een enkel pakket, 
                    pallets of grotere zendingen wilt versturen, wij zorgen voor een veilige en 
                    tijdige levering.
                  </p>
                  <p>
                    Met een afstand van {Number(route.afstand_km).toLocaleString('nl-NL')} kilometer 
                    bieden wij deze route dagelijks aan tegen scherpe tarieven. Onze ervaren 
                    chauffeurs kennen de weg en zorgen ervoor dat uw zending in perfecte staat aankomt.
                  </p>
                  <h3>Wat we vervoeren</h3>
                  <ul>
                    <li>Pakketten en dozen</li>
                    <li>Pallets en stellingen</li>
                    <li>Meubels en apparatuur</li>
                    <li>Auto-onderdelen</li>
                    <li>Documenten en monsters</li>
                  </ul>
                  <h3>Onze service</h3>
                  <ul>
                    <li>Ophalen aan huis of bedrijf</li>
                    <li>Track & trace systeem</li>
                    <li>100% transportverzekering</li>
                    <li>Flexibele aflevertijden</li>
                    <li>Persoonlijke service</li>
                  </ul>
                </div>
              </div>

              <div>
                <QuoteForm 
                  routeId={route.id}
                  landId={route.buitenland_stad?.land?.id}
                  defaultOphaalPlaats={nlPlaats}
                  defaultAfleverPlaats={buitenlandStad}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default RouteDetailPage;