import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CTASectionProps {
  landNaam?: string;
}

export function CTASection({ landNaam }: CTASectionProps) {
  return (
    <section className="py-16 bg-gradient-dark text-primary-foreground">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl lg:text-4xl font-bold">
            {landNaam 
              ? `Zending naar ${landNaam}?`
              : 'Klaar om te verzenden?'
            }
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            {landNaam
              ? `Vraag nu vrijblijvend een offerte aan voor uw transport naar ${landNaam}. Binnen 24 uur reactie!`
              : 'Vraag nu vrijblijvend een offerte aan. Wij reageren binnen 24 uur met een scherp tarief.'
            }
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              asChild
            >
              <Link to="/offerte">
                Offerte aanvragen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline-light" asChild>
              <a href="tel:+31612345678">
                <Phone className="mr-2 h-4 w-4" />
                Bel direct
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
