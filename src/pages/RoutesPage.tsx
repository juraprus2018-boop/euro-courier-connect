import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { RouteCard } from '@/components/public/RouteCard';
import { SearchRoutes } from '@/components/public/SearchRoutes';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface RouteData {
  id: string;
  slug: string;
  afstand_km: number;
  geschatte_prijs: number;
  nl_plaats: { naam: string };
  buitenland_stad: { naam: string };
}

const RoutesPage = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const from = searchParams.get('from');
  const to = searchParams.get('to');

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      
      let query = supabase
        .from('routes')
        .select(`
          id,
          slug,
          afstand_km,
          geschatte_prijs,
          nl_plaats:nl_plaatsen(naam),
          buitenland_stad:buitenland_steden(naam)
        `)
        .order('afstand_km', { ascending: true })
        .limit(100);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching routes:', error);
      } else {
        let filteredRoutes = (data || []) as unknown as RouteData[];
        
        if (from) {
          filteredRoutes = filteredRoutes.filter(r => 
            r.nl_plaats?.naam?.toLowerCase().includes(from.toLowerCase())
          );
        }
        if (to) {
          filteredRoutes = filteredRoutes.filter(r => 
            r.buitenland_stad?.naam?.toLowerCase().includes(to.toLowerCase())
          );
        }
        
        setRoutes(filteredRoutes);
      }
      
      setLoading(false);
    };

    fetchRoutes();
  }, [from, to]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container">
          <h1 className="font-display text-3xl font-bold mb-2">Beschikbare routes</h1>
          <p className="text-muted-foreground mb-8">
            Vind de route die bij u past en vraag direct een offerte aan.
          </p>

          <div className="mb-8">
            <SearchRoutes />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : routes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                Geen routes gevonden. Probeer andere zoektermen of vraag een offerte aan voor uw specifieke route.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {routes.map((route) => (
                <RouteCard
                  key={route.id}
                  nlPlaats={route.nl_plaats?.naam || ''}
                  buitenlandStad={route.buitenland_stad?.naam || ''}
                  afstandKm={Number(route.afstand_km)}
                  prijs={Number(route.geschatte_prijs)}
                  slug={route.slug}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RoutesPage;