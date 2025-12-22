import { Link } from 'react-router-dom';
import { ArrowRight, Phone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const benefits = [
  'Gratis en vrijblijvende offerte',
  'Binnen 24 uur reactie',
  'Persoonlijk advies op maat',
  'Geen verplichtingen',
];

export function MainCTASection() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-dark" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-2 mb-6">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-accent">Direct contact mogelijk</span>
          </span>
          
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-background">
            Klaar om te verzenden?
          </h2>
          <p className="mt-6 text-lg text-background/70 max-w-2xl mx-auto">
            Vraag vandaag nog een vrijblijvende offerte aan. Wij denken graag met u mee over de beste transportoplossing voor uw goederen.
          </p>
          
          {/* Benefits */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-background/80">
                <CheckCircle className="h-5 w-5 text-accent" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
          
          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6" asChild>
              <Link to="/offerte">
                Offerte aanvragen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10 text-lg px-8 py-6" asChild>
              <a href="tel:+31612345678">
                <Phone className="mr-2 h-5 w-5" />
                +31 6 1234 5678
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
