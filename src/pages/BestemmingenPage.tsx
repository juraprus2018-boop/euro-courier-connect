import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLand } from '@/hooks/useLand';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { PageBreadcrumb } from '@/components/public/PageBreadcrumb';
import { Loader2, MapPin, ArrowRight } from 'lucide-react';

const BestemmingenPage = () => {
  const { land, isHoofdsite, loading: landLoading } = useLand();

  const { data: steden, isLoading } = useQuery({
    queryKey: ['bestemmingen', land?.id],
    queryFn: async () => {
      let query = supabase
        .from('buitenland_steden')
        .select(`
          *,
          land:landen(*)
        `)
        .order('naam');

      if (land) {
        query = query.eq('land_id', land.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !landLoading,
  });

  if (landLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const siteNaam = land ? `De ${land.naam} Koerier` : 'De Europa Koerier';

  return (
    <div className="min-h-screen flex flex-col">
      <Header landNaam={land?.naam} />
      
      <main className="flex-1 py-12">
        <div className="container">
          <PageBreadcrumb items={[{ label: 'Bestemmingen' }]} className="mb-6" />
          <h1 className="font-display text-3xl font-bold mb-2">
            {land ? `Bestemmingen in ${land.naam}` : 'Alle bestemmingen'}
          </h1>
          <p className="text-muted-foreground mb-8">
            Kies een stad om de beschikbare routes te bekijken
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !steden || steden.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                Nog geen bestemmingen beschikbaar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {steden.map((stad) => (
                <Link
                  key={stad.id}
                  to={`/bestemming/${stad.slug}`}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold group-hover:text-primary transition-colors">
                      {stad.naam}
                    </h3>
                    {!land && stad.land && (
                      <p className="text-sm text-muted-foreground">
                        {stad.land.naam}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BestemmingenPage;
