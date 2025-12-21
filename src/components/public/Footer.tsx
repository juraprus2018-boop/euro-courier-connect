import { Link } from 'react-router-dom';
import { Truck, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                <Truck className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">Koerier</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Betrouwbare koeriersdiensten door heel Europa. Snel, veilig en betaalbaar.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-display font-semibold">Navigatie</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li><Link to="/routes" className="hover:text-foreground transition-colors">Routes</Link></li>
              <li><Link to="/offerte" className="hover:text-foreground transition-colors">Offerte</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-display font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+31 6 1234 5678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@koerier.nl</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Nederland</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-display font-semibold">Openingstijden</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Ma - Vr: 08:00 - 18:00</li>
              <li>Za: 09:00 - 14:00</li>
              <li>Zo: Gesloten</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Koerier. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  );
}