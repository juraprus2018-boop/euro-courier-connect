import { Truck, Clock, Shield, MapPin, Phone, Euro } from 'lucide-react';

interface USPSectionProps {
  landNaam?: string;
}

export function USPSection({ landNaam }: USPSectionProps) {
  const usps = [
    {
      icon: Truck,
      title: 'Dagelijkse ritten',
      description: landNaam 
        ? `Wij rijden meerdere keren per week naar ${landNaam}`
        : 'Vaste routes door heel Europa'
    },
    {
      icon: Clock,
      title: 'Snelle levering',
      description: 'Bezorging binnen 24-48 uur'
    },
    {
      icon: Shield,
      title: '100% verzekerd',
      description: 'Volledige transportverzekering'
    },
    {
      icon: MapPin,
      title: 'Track & Trace',
      description: 'Volg uw zending realtime'
    },
    {
      icon: Phone,
      title: 'Persoonlijk contact',
      description: 'Direct contact met uw chauffeur'
    },
    {
      icon: Euro,
      title: 'Scherpe tarieven',
      description: 'Transparante prijzen, geen verrassingen'
    }
  ];

  return (
    <section className="py-16 bg-muted/50">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold">
            Waarom kiezen voor ons?
          </h2>
          <p className="mt-2 text-muted-foreground">
            {landNaam 
              ? `Uw betrouwbare partner voor transport naar ${landNaam}`
              : 'Uw betrouwbare partner voor Europees transport'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {usps.map((usp, index) => (
            <div 
              key={index}
              className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <usp.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">{usp.title}</h3>
                <p className="text-muted-foreground mt-1">{usp.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
