import { useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin, Navigation, Euro, Truck, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const RouteMap = lazy(() => import('./RouteMap').then(m => ({ default: m.RouteMap })));

interface Coordinates {
  lat: number;
  lng: number;
}

interface PriceCalculatorProps {
  landNaam?: string;
  kmTarief?: number;
  restrictToCountry?: string;
}

export function PriceCalculator({ landNaam, kmTarief = 0.85, restrictToCountry }: PriceCalculatorProps) {
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodeAddress = async (address: string, countryCode?: string): Promise<Coordinates | null> => {
    try {
      const countryParam = countryCode ? `&countrycodes=${countryCode}` : '';
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}${countryParam}&limit=1`,
        { headers: { 'User-Agent': 'DeEuropaKoerier/1.0' } }
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch (err) {
      console.error('Geocoding error:', err);
      return null;
    }
  };

  const getRoute = async (start: Coordinates, end: Coordinates) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coords: [number, number][] = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        );
        return {
          distance: route.distance / 1000,
          duration: route.duration / 60,
          coordinates: coords
        };
      }
      return null;
    } catch (err) {
      console.error('Routing error:', err);
      return null;
    }
  };

  const calculatePrice = async () => {
    setLoading(true);
    setError(null);
    setRouteCoords([]);
    setDistance(null);
    setDuration(null);

    try {
      const pickup = await geocodeAddress(pickupAddress, 'NL');
      if (!pickup) {
        setError('Ophaaladres niet gevonden. Controleer het adres en probeer opnieuw.');
        setLoading(false);
        return;
      }
      setPickupCoords(pickup);

      const destination = await geocodeAddress(destinationAddress, restrictToCountry);
      if (!destination) {
        setError(`Afleveradres niet gevonden${restrictToCountry ? ` in ${landNaam}` : ''}. Controleer het adres en probeer opnieuw.`);
        setLoading(false);
        return;
      }
      setDestinationCoords(destination);

      const routeData = await getRoute(pickup, destination);
      if (!routeData) {
        setError('Kon geen route berekenen. Probeer andere adressen.');
        setLoading(false);
        return;
      }

      setRouteCoords(routeData.coordinates);
      setDistance(routeData.distance);
      setDuration(routeData.duration);
    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
    }

    setLoading(false);
  };

  const calculatedPrice = distance ? Math.round(distance * kmTarief) : null;
  const formattedDuration = duration 
    ? duration >= 60 
      ? `${Math.floor(duration / 60)}u ${Math.round(duration % 60)}min`
      : `${Math.round(duration)} min`
    : null;

  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-accent font-semibold uppercase tracking-wider text-sm">Prijscalculator</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-4">
            Bereken direct uw spoedkoerier prijs
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Voer uw ophaal- en afleveradres in en ontvang direct een prijsindicatie met routekaart
            {landNaam && ` voor transport naar ${landNaam}`}.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Route & Prijs Berekenen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pickup" className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  Ophaaladres (Nederland)
                </Label>
                <Input
                  id="pickup"
                  placeholder="Bijv. Hoofdstraat 1, Amsterdam"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination" className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  Afleveradres {landNaam ? `(${landNaam})` : '(Europa)'}
                </Label>
                <Input
                  id="destination"
                  placeholder={landNaam ? `Bijv. Centrum straat 10, Zagreb` : 'Bijv. Brandenburger Tor, Berlijn'}
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button 
                onClick={calculatePrice} 
                disabled={loading || !pickupAddress || !destinationAddress}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Berekenen...
                  </>
                ) : (
                  <>
                    <Navigation className="mr-2 h-4 w-4" />
                    Bereken prijs
                  </>
                )}
              </Button>

              {distance && calculatedPrice && (
                <div className="pt-6 border-t space-y-4">
                  <h3 className="font-display font-bold text-lg">Resultaat</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-xl bg-muted">
                      <MapPin className="h-5 w-5 mx-auto text-primary mb-2" />
                      <div className="text-2xl font-bold">{Math.round(distance)} km</div>
                      <div className="text-xs text-muted-foreground">Afstand</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted">
                      <Clock className="h-5 w-5 mx-auto text-primary mb-2" />
                      <div className="text-2xl font-bold">{formattedDuration}</div>
                      <div className="text-xs text-muted-foreground">Rijtijd</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-accent/10">
                      <Euro className="h-5 w-5 mx-auto text-accent mb-2" />
                      <div className="text-2xl font-bold text-accent">€{calculatedPrice}</div>
                      <div className="text-xs text-muted-foreground">Vanaf prijs</div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    * Dit is een indicatieve prijs gebaseerd op €{kmTarief.toFixed(2)}/km. 
                    De definitieve prijs kan afwijken op basis van gewicht, afmetingen en specifieke wensen.
                  </p>

                  <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
                    <Link to="/offerte">
                      Direct offerte aanvragen
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 overflow-hidden">
            <CardContent className="p-0 h-[500px]">
              <Suspense fallback={
                <div className="h-full flex items-center justify-center bg-muted">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }>
                <RouteMap 
                  pickupCoords={pickupCoords}
                  destinationCoords={destinationCoords}
                  routeCoords={routeCoords}
                />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}