import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Search } from 'lucide-react';

interface NlPlaats {
  id: string;
  naam: string;
  slug: string;
  gemeente: string | null;
  provincie: string | null;
}

const AdminNlPlaatsen = () => {
  const [plaatsen, setPlaatsen] = useState<NlPlaats[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const { toast } = useToast();

  const fetchPlaatsen = async () => {
    setLoading(true);
    
    let query = supabase
      .from('nl_plaatsen')
      .select('*', { count: 'exact' })
      .order('naam')
      .limit(100);

    if (search) {
      query = query.ilike('naam', `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching plaatsen:', error);
    } else {
      setPlaatsen(data || []);
      setTotal(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlaatsen();
  }, [search]);

  const handleImport = async () => {
    setImporting(true);
    
    try {
      const { error } = await supabase.functions.invoke('import-nl-plaatsen');
      
      if (error) {
        throw error;
      }
      
      toast({ title: 'Import gestart', description: 'De import draait op de achtergrond.' });
      
      // Wait a bit and refresh
      setTimeout(() => {
        fetchPlaatsen();
        setImporting(false);
      }, 5000);
    } catch (error) {
      console.error('Import error:', error);
      toast({ title: 'Import mislukt', variant: 'destructive' });
      setImporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Nederlandse Plaatsen</h1>
            <p className="text-muted-foreground mt-1">
              {total.toLocaleString('nl-NL')} plaatsen in database
            </p>
          </div>
          <Button onClick={handleImport} disabled={importing}>
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importeren...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Plaatsen importeren
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek plaats..."
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
                    <TableHead>Naam</TableHead>
                    <TableHead>Gemeente</TableHead>
                    <TableHead>Provincie</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plaatsen.map((plaats) => (
                    <TableRow key={plaats.id}>
                      <TableCell className="font-medium">{plaats.naam}</TableCell>
                      <TableCell>{plaats.gemeente || '-'}</TableCell>
                      <TableCell>{plaats.provincie || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {plaatsen.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        {search ? 'Geen plaatsen gevonden' : 'Nog geen plaatsen geïmporteerd. Klik op "Plaatsen importeren" om te starten.'}
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

export default AdminNlPlaatsen;