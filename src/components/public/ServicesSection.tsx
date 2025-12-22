import { Truck, Package, Clock, Shield, MapPin, Headphones } from 'lucide-react';

const services = [
  {
    icon: Truck,
    title: 'Expresvervoer',
    description: 'Spoedziendingen binnen 24 uur bezorgd. Ideaal voor tijdkritieke leveringen naar heel Europa.',
  },
  {
    icon: Package,
    title: 'Palletvervoer',
    description: 'Van kleine pakketten tot volledige pallets. Wij vervoeren alles veilig en efficiënt.',
  },
  {
    icon: Clock,
    title: 'Geplande ritten',
    description: 'Vaste rijtijden naar populaire bestemmingen. Betrouwbaar en voorspelbaar transport.',
  },
  {
    icon: Shield,
    title: 'Verzekerd transport',
    description: 'Al uw zendingen zijn volledig verzekerd. Rust en zekerheid voor waardevolle goederen.',
  },
  {
    icon: MapPin,
    title: 'Deur-tot-deur',
    description: 'Wij halen op en leveren af. Geen gedoe met depots of tussenstops.',
  },
  {
    icon: Headphones,
    title: 'Persoonlijke service',
    description: 'Altijd een vast aanspreekpunt. Wij kennen u en uw zendingen.',
  },
];

export function ServicesSection() {
  return (
    <section className="py-20 lg:py-28 bg-muted/50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-semibold uppercase tracking-wider text-sm">Onze diensten</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-4">
            Alles voor uw Europese transport
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Van spoedzending tot regulier transport – wij bieden een complete oplossing voor al uw koeriersbehoeften door heel Europa.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={service.title}
              className="group relative bg-card rounded-2xl p-8 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary transition-colors duration-300">
                <service.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-display text-xl font-bold mt-6">{service.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
