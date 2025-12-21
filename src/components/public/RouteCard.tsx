import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RouteCardProps {
  nlPlaats: string;
  buitenlandStad: string;
  afstandKm: number;
  prijs: number;
  slug: string;
}

export function RouteCard({ nlPlaats, buitenlandStad, afstandKm, prijs, slug }: RouteCardProps) {
  return (
    <Link to={`/route/${slug}`}>
      <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{nlPlaats}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="font-medium text-foreground">{buitenlandStad}</span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{afstandKm} km</p>
              <p className="font-display font-bold text-lg text-primary">€{prijs.toFixed(0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}