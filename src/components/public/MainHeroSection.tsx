import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MainHeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/80 to-foreground/60" />
      
      <div className="container relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-2 mb-6 animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-accent">Dagelijkse ritten door heel Europa</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-background leading-tight animate-fade-in">
            Uw betrouwbare
            <span className="block text-accent">koerierspartner</span>
            voor heel Europa
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-background/80 max-w-2xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Al meer dan 15 jaar verzorgen wij professionele koeriersdiensten van Nederland naar alle hoeken van Europa. 
            Snel, betrouwbaar en met persoonlijke service.
          </p>
          
          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6" asChild>
              <Link to="/offerte">
                Gratis offerte aanvragen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10 text-lg px-8 py-6" asChild>
              <a href="tel:+31612345678">
                <Phone className="mr-2 h-5 w-5" />
                Direct bellen
              </a>
            </Button>
          </div>
          
          {/* Quick contact */}
          <div className="mt-10 flex flex-col sm:flex-row gap-6 text-background/70 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <a href="tel:+31612345678" className="flex items-center gap-2 hover:text-accent transition-colors">
              <Phone className="h-5 w-5" />
              <span>+31 6 1234 5678</span>
            </a>
            <a href="mailto:info@deeuropakoerier.nl" className="flex items-center gap-2 hover:text-accent transition-colors">
              <Mail className="h-5 w-5" />
              <span>info@deeuropakoerier.nl</span>
            </a>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 rounded-full border-2 border-background/30 flex items-start justify-center p-2">
          <div className="w-1 h-3 rounded-full bg-background/50 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
