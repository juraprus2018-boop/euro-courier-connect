import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, ArrowRight } from 'lucide-react';

interface RouteData {
  id: string;
  slug: string;
  afstand_km: number;
  geschatte_prijs: number;
  nl_plaats: { naam: string };
  buitenland_stad: { naam: string; land: { naam: string } };
}

const AdminRoutes = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchRoutes = async () => {
    setLoading(true);
    
    const { data, error, count } = await supabase
      .from('routes')
      .select(`
        id,
        slug,
        afstand_km,
        geschatte_prijs,
        nl_plaats:nl_plaatsen(naam),
        buitenland_stad:buitenland_steden(naam, land:landen(naam))
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching routes:', error);
    } else {
      let filteredData = (data || []) as unknown as RouteData[];
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredData = filteredData.filter(r => 
          r.nl_plaats?.naam?.toLowerCase().includes(searchLower) ||
          r.buitenland_stad?.naam?.toLowerCase().includes(searchLower)
        );
      }
      
      setRoutes(filteredData);
      setTotal(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoutes();
  }, [search]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Routes</h1>
          <p className="text-muted-foreground mt-1">
            {total.toLocaleString('nl-NL')} routes gegenereerd
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek op plaats of stad..."
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Land</TableHead>
                    <TableHead>Afstand</TableHead>
                    <TableHead>Prijs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{route.nl_plaats?.naam}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{route.buitenland_stad?.naam}</span>
                        </div>
                      </TableCell>
                      <TableCell>{route.buitenland_stad?.land?.naam}</TableCell>
                      <TableCell>{Number(route.afstand_km).toLocaleString('nl-NL')} km</TableCell>
                      <TableCell>€{Number(route.geschatte_prijs).toFixed(0)}</TableCell>
                    </TableRow>
                  ))}
                  {routes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {search ? 'Geen routes gevonden' : 'Nog geen routes gegenereerd'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminRoutes;