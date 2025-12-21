import { Link } from 'react-router-dom';
import { Truck, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  landNaam?: string;
}

export function Header({ landNaam }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold text-foreground">
              Koerier
            </span>
            {landNaam && (
              <span className="text-xs text-muted-foreground">{landNaam}</span>
            )}
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/routes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Routes
          </Link>
          <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <a href="tel:+31612345678" className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="h-4 w-4" />
            <span>+31 6 1234 5678</span>
          </a>
          <Button asChild>
            <Link to="/offerte">Offerte aanvragen</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}