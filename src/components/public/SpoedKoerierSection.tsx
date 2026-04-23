import { Zap, ArrowRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CONTACT } from '@/lib/contact';

interface SpoedKoerierSectionProps {
  landNaam?: string;
}

export function SpoedKoerierSection({ landNaam }: SpoedKoerierSectionProps) {
  return (
    <section className="py-16 bg-accent/10 border-y border-accent/20">
      <div className="container">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-8 text-center lg:text-left">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent text-accent-foreground flex-shrink-0 shadow-lg">
            <Zap className="h-10 w-10" />
          </div>

          <div className="flex-1">
            <span className="inline-block text-accent font-bold uppercase tracking-widest text-sm">
              Spoedkoerier
            </span>
            <h2 className="font-display text-3xl lg:text-4xl font-bold mt-2">
              SPOED KOERIER – wij rijden direct van A naar B
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Geen tussenstops, geen overslag, geen vertraging. Onze koerier vertrekt
              direct na uw boeking en rijdt rechtstreeks naar{' '}
              {landNaam ? landNaam : 'de bestemming'}. 24/7 beschikbaar.
            </p>
          </div>

          <div className="flex flex-col gap-3 flex-shrink-0">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
              <a href={CONTACT.telefoonHref}>
                <Phone className="mr-2 h-5 w-5" />
                {CONTACT.telefoon}
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/offerte">
                Direct offerte
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
