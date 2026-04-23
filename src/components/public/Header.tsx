import { Link } from 'react-router-dom';
import { Truck, Phone, MapPin, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const services = [
  { label: 'Internationaal transport', to: '/internationaal-transport' },
  { label: 'Kunsttransport', to: '/kunsttransport' },
  { label: 'Medisch transport', to: '/medisch-transport' },
  { label: 'On-Board Koeriersdienst', to: '/on-board-koeriersdienst' },
];

interface HeaderProps {
  landNaam?: string;
}

export function Header({ landNaam }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Generate site name based on country
  const siteNaam = landNaam ? `De ${landNaam} Koerier` : 'De Europa Koerier';
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold text-foreground">
              {siteNaam}
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 outline-none">
              Diensten
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-popover">
              {services.map((s) => (
                <DropdownMenuItem key={s.to} asChild>
                  <Link to={s.to}>{s.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/bestemmingen" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Bestemmingen
          </Link>
          <Link to="/routes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Routes
          </Link>
          <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <a href="tel:+31857602999" className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="h-4 w-4" />
            <span>085 7602 999</span>
          </a>
          <Button asChild className="hidden sm:inline-flex">
            <Link to="/offerte">Offerte aanvragen</Link>
          </Button>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="container py-4 flex flex-col gap-4">
            <Link 
              to="/" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Diensten</p>
              <div className="flex flex-col gap-2 pl-2">
                {services.map((s) => (
                  <Link
                    key={s.to}
                    to={s.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link 
              to="/bestemmingen" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MapPin className="h-4 w-4" />
              Bestemmingen
            </Link>
            <Link 
              to="/routes" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Routes
            </Link>
            <Link 
              to="/contact" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Button asChild className="w-full">
              <Link to="/offerte" onClick={() => setMobileMenuOpen(false)}>
                Offerte aanvragen
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}