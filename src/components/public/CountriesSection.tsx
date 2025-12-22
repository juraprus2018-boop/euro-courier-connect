import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CountriesSection() {
  const { data: landen } = useQuery({
    queryKey: ['landen-actief'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landen')
        .select('*')
        .eq('actief', true)
        .order('naam');
      if (error) throw error;
      return data;
    },
  });

  if (!landen || landen.length === 0) return null;

  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-semibold uppercase tracking-wider text-sm">Onze bestemmingen</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-4">
            Wij rijden naar deze landen
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Dagelijkse koeriersdiensten naar populaire bestemmingen in Europa. 
            Elk land heeft een eigen gespecialiseerde website met routes en prijzen.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {landen.map((land) => (
            <a
              key={land.id}
              href={land.domein ? `https://${land.domein}` : `/land/${land.slug}`}
              target={land.domein ? '_blank' : '_self'}
              rel={land.domein ? 'noopener noreferrer' : undefined}
              className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary transition-colors duration-300">
                    <MapPin className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="font-display text-xl font-bold">{land.naam}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Bekijk routes en prijzen
                </p>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
