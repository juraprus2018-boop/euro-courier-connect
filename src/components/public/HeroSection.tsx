import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  landNaam?: string;
  heroTitel?: string | null;
  heroSubtitel?: string | null;
}

export function HeroSection({ landNaam, heroTitel, heroSubtitel }: HeroSectionProps) {
  const siteNaam = landNaam ? `De ${landNaam} Koerier` : 'De Europa Koerier';

  const title = heroTitel || (landNaam
    ? `Spoedkoerier naar ${landNaam}`
    : 'Spoedkoerier door heel Europa');

  const subtitle = heroSubtitel || (landNaam
    ? `Dagelijkse spoedkoeriersdienst van Nederland naar ${landNaam}. Direct van A naar B, 24/7 beschikbaar.`
    : 'Professionele spoedkoerier van Nederland naar heel Europa. Dagelijks op pad voor uw zendingen.');

  return (
    <section className="relative overflow-hidden bg-gradient-dark py-20 lg:py-32">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          {/* Site branding */}
          <p className="text-accent font-display font-semibold mb-4 animate-fade-in">
            {siteNaam}
          </p>
          
          <h1 className="font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl animate-fade-in">
            {title}
          </h1>
          <p className="mt-6 text-lg text-primary-foreground/80 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {subtitle}
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
              <Link to="/offerte">
                Offerte aanvragen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline-light" asChild>
              <Link to="/bestemmingen">Bekijk bestemmingen</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-4 rounded-xl bg-primary-foreground/10 p-6 backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
              <Truck className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-primary-foreground">
                {landNaam ? `Direct naar ${landNaam}` : 'Dagelijks op pad'}
              </h3>
              <p className="text-sm text-primary-foreground/70">
                {landNaam ? 'Meerdere ritten per week' : 'Vaste routes door Europa'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl bg-primary-foreground/10 p-6 backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
              <Clock className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-primary-foreground">Snelle levering</h3>
              <p className="text-sm text-primary-foreground/70">Binnen 24-48 uur</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl bg-primary-foreground/10 p-6 backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
              <Shield className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-primary-foreground">100% verzekerd</h3>
              <p className="text-sm text-primary-foreground/70">Volledige dekking</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}