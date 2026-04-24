import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { RouteCard } from '@/components/public/RouteCard';
import { SearchRoutes } from '@/components/public/SearchRoutes';
import { PageBreadcrumb } from '@/components/public/PageBreadcrumb';
import { supabase } from '@/integrations/supabase/client';
import { useLand } from '@/hooks/useLand';
import { Loader2 } from 'lucide-react';

interface RouteData {
  id: string;
  slug: string;
  afstand_km: number;
  geschatte_prijs: number;
  nl_plaats: { naam: string };
  buitenland_stad: { naam: string; land_id: string };
}

const RoutesPage = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { land, isHoofdsite, loading: landLoading } = useLand();

  const from = searchParams.get('from');
  const to = searchParams.get('to');

  useEffect(() => {
    const fetchRoutes = async () => {
      if (landLoading) return;
      
      setLoading(true);
      
      // If we have a land, first get the cities for that land
      let cityIds: string[] = [];
      if (land) {
        const { data: steden } = await supabase
          .from('buitenland_steden')
          .select('id')
          .eq('land_id', land.id);
        
        if (steden) {
          cityIds = steden.map(s => s.id);
        }
      }
      
      let query = supabase
        .from('routes')
        .select(`
          id,
          slug,
          afstand_km,
          geschatte_prijs,
          nl_plaats:nl_plaatsen(naam),
          buitenland_stad:buitenland_steden(naam, land_id)
        `)
        .order('afstand_km', { ascending: true })
        .limit(100);

      // Filter by land if applicable
      if (land && cityIds.length > 0) {
        query = query.in('buitenland_stad_id', cityIds);
      }

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
  }, [from, to, land, landLoading]);

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
      
      <main className="flex-1 py-12">
        <div className="container">
          <PageBreadcrumb items={[{ label: 'Routes' }]} className="mb-6" />
          <h1 className="font-display text-3xl font-bold mb-2">
            {land ? `Routes naar ${land.naam}` : 'Beschikbare routes'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {land 
              ? `Alle koeriersroutes van Nederland naar ${land.naam}.`
              : 'Vind de route die bij u past en vraag direct een offerte aan.'
            }
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
                {land 
                  ? `Geen routes gevonden naar ${land.naam}. Vraag een offerte aan voor uw specifieke route.`
                  : 'Geen routes gevonden. Probeer andere zoektermen of vraag een offerte aan voor uw specifieke route.'
                }
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