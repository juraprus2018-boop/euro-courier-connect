import { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Calculator, Euro, MapPin, Globe, Search, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface Prijsberekening {
  id: string;
  created_at: string;
  host: string | null;
  land_id: string | null;
  land_naam: string | null;
  ophaal_adres: string | null;
  aflever_adres: string | null;
  afstand_km: number | null;
  rijtijd_minuten: number | null;
  km_tarief: number | null;
  berekende_prijs: number | null;
  ip_adres: string | null;
  user_agent: string | null;
  referer: string | null;
}

const AdminPrijsberekeningen = () => {
  const [items, setItems] = useState<Prijsberekening[]>([]);
  const [loading, setLoading] = useState(true);
  const [hostFilter, setHostFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('prijsberekeningen')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) {
      toast({ title: 'Fout', description: error.message, variant: 'destructive' });
    } else {
      setItems((data as Prijsberekening[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hosts = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.host && set.add(i.host));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (hostFilter !== 'all' && i.host !== hostFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          (i.ophaal_adres?.toLowerCase().includes(s) ?? false) ||
          (i.aflever_adres?.toLowerCase().includes(s) ?? false) ||
          (i.ip_adres?.toLowerCase().includes(s) ?? false) ||
          (i.land_naam?.toLowerCase().includes(s) ?? false)
        );
      }
      return true;
    });
  }, [items, hostFilter, search]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const totalPrice = filtered.reduce((sum, i) => sum + (Number(i.berekende_prijs) || 0), 0);
    const avgPrice = total > 0 ? totalPrice / total : 0;
    const totalKm = filtered.reduce((sum, i) => sum + (Number(i.afstand_km) || 0), 0);
    const uniqueHosts = new Set(filtered.map((i) => i.host).filter(Boolean)).size;
    return { total, avgPrice, totalKm, uniqueHosts };
  }, [filtered]);

  const handleDelete = async (id: string) => {
    if (!confirm('Verwijder deze berekening?')) return;
    const { error } = await supabase.from('prijsberekeningen').delete().eq('id', id);
    if (error) {
      toast({ title: 'Fout', description: error.message, variant: 'destructive' });
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast({ title: 'Verwijderd' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8 text-primary" />
            Prijsberekeningen
          </h1>
          <p className="text-muted-foreground mt-1">
            Overzicht van alle prijsberekeningen die bezoekers maken op uw websites.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Berekeningen</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Calculator className="h-8 w-8 text-primary/40" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gem. prijs</p>
                  <p className="text-2xl font-bold">€{Math.round(stats.avgPrice)}</p>
                </div>
                <Euro className="h-8 w-8 text-accent/40" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Totaal km</p>
                  <p className="text-2xl font-bold">{Math.round(stats.totalKm)}</p>
                </div>
                <MapPin className="h-8 w-8 text-primary/40" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Domeinen</p>
                  <p className="text-2xl font-bold">{stats.uniqueHosts}</p>
                </div>
                <Globe className="h-8 w-8 text-primary/40" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Domein</label>
              <Select value={hostFilter} onValueChange={setHostFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle domeinen</SelectItem>
                  {hosts.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Zoeken (adres, IP, land)</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Zoek op adres, IP-adres of land..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nog geen prijsberekeningen{hostFilter !== 'all' ? ' voor dit domein' : ''}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Domein</TableHead>
                      <TableHead>Land</TableHead>
                      <TableHead>Ophaal</TableHead>
                      <TableHead>Aflever</TableHead>
                      <TableHead className="text-right">Km</TableHead>
                      <TableHead className="text-right">Prijs</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="whitespace-nowrap text-xs">
                          {format(new Date(i.created_at), 'dd MMM HH:mm', { locale: nl })}
                        </TableCell>
                        <TableCell>
                          {i.host ? (
                            <Badge variant="outline" className="font-mono text-xs">
                              {i.host}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>{i.land_naam || <span className="text-muted-foreground">-</span>}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs" title={i.ophaal_adres || ''}>
                          {i.ophaal_adres || '-'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs" title={i.aflever_adres || ''}>
                          {i.aflever_adres || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {i.afstand_km ? Math.round(Number(i.afstand_km)) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {i.berekende_prijs ? `€${Math.round(Number(i.berekende_prijs))}` : '-'}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{i.ip_adres || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(i.id)}
                            title="Verwijderen"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPrijsberekeningen;
