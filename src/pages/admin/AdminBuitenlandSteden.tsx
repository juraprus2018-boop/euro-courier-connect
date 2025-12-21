import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/slugify';
import { Plus, Loader2, Trash2, RefreshCw } from 'lucide-react';

interface Land {
  id: string;
  naam: string;
}

interface BuitenlandStad {
  id: string;
  naam: string;
  slug: string;
  route_generatie_status: string;
  land: { naam: string };
}

const AdminBuitenlandSteden = () => {
  const [steden, setSteden] = useState<BuitenlandStad[]>([]);
  const [landen, setLanden] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ naam: '', land_id: '' });
  const { toast } = useToast();

  const fetchData = async () => {
    const [{ data: stedenData }, { data: landenData }] = await Promise.all([
      supabase.from('buitenland_steden').select('id, naam, slug, route_generatie_status, land:landen(naam)').order('naam'),
      supabase.from('landen').select('id, naam').eq('actief', true).order('naam'),
    ]);

    setSteden((stedenData || []) as unknown as BuitenlandStad[]);
    setLanden(landenData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.from('buitenland_steden').insert({
      naam: formData.naam,
      slug: slugify(formData.naam),
      land_id: formData.land_id,
      route_generatie_status: 'pending',
    }).select().single();

    if (error) {
      toast({ title: 'Fout bij toevoegen', variant: 'destructive' });
    } else {
      toast({ title: 'Stad toegevoegd', description: 'Route generatie wordt gestart...' });
      setDialogOpen(false);
      setFormData({ naam: '', land_id: '' });
      fetchData();

      // Trigger route generation
      supabase.functions.invoke('generate-routes', { body: { stadId: data.id } });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Weet u zeker dat u deze stad wilt verwijderen?')) return;

    const { error } = await supabase.from('buitenland_steden').delete().eq('id', id);

    if (error) {
      toast({ title: 'Fout bij verwijderen', variant: 'destructive' });
    } else {
      toast({ title: 'Stad verwijderd' });
      fetchData();
    }
  };

  const handleRegenerateRoutes = async (id: string) => {
    await supabase.from('buitenland_steden').update({ route_generatie_status: 'pending' }).eq('id', id);
    toast({ title: 'Route generatie gestart' });
    supabase.functions.invoke('generate-routes', { body: { stadId: id } });
    fetchData();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-warning/10 text-warning',
      generating: 'bg-primary/10 text-primary',
      completed: 'bg-success/10 text-success',
      error: 'bg-destructive/10 text-destructive',
    };
    const labels = {
      pending: 'Wachtend',
      generating: 'Genereren...',
      completed: 'Voltooid',
      error: 'Fout',
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Buitenlandse Steden</h1>
            <p className="text-muted-foreground mt-1">Voeg steden toe om routes te genereren.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Stad toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nieuwe stad</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="land">Land</Label>
                  <Select value={formData.land_id} onValueChange={(value) => setFormData({ ...formData, land_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer land" />
                    </SelectTrigger>
                    <SelectContent>
                      {landen.map((land) => (
                        <SelectItem key={land.id} value={land.id}>{land.naam}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="naam">Stadsnaam</Label>
                  <Input
                    id="naam"
                    value={formData.naam}
                    onChange={(e) => setFormData({ ...formData, naam: e.target.value })}
                    placeholder="Parijs"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!formData.land_id}>
                  Toevoegen & routes genereren
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
                    <TableHead>Stad</TableHead>
                    <TableHead>Land</TableHead>
                    <TableHead>Route Status</TableHead>
                    <TableHead className="w-[100px]">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {steden.map((stad) => (
                    <TableRow key={stad.id}>
                      <TableCell className="font-medium">{stad.naam}</TableCell>
                      <TableCell>{stad.land?.naam}</TableCell>
                      <TableCell>{getStatusBadge(stad.route_generatie_status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleRegenerateRoutes(stad.id)} title="Regenereer routes">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(stad.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {steden.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nog geen steden toegevoegd
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

export default AdminBuitenlandSteden;