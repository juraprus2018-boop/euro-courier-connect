import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/slugify';
import { Plus, Loader2, Pencil, Trash2, MapPin } from 'lucide-react';

interface Land {
  id: string;
  naam: string;
  slug: string;
  domein: string | null;
  km_tarief: number;
  actief: boolean;
  steden_count?: number;
}

const AdminLanden = () => {
  const [landen, setLanden] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLand, setEditingLand] = useState<Land | null>(null);
  const [importing, setImporting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    naam: '',
    domein: '',
    km_tarief: '0.50',
    actief: true,
  });
  const { toast } = useToast();

  const fetchLanden = async () => {
    // Fetch landen with count of steden
    const { data, error } = await supabase
      .from('landen')
      .select('*')
      .order('naam');

    if (error) {
      console.error('Error fetching landen:', error);
      setLoading(false);
      return;
    }

    // Get steden count per land
    const { data: stedenData } = await supabase
      .from('buitenland_steden')
      .select('land_id');

    const stedenCountMap: Record<string, number> = {};
    (stedenData || []).forEach((stad: { land_id: string }) => {
      stedenCountMap[stad.land_id] = (stedenCountMap[stad.land_id] || 0) + 1;
    });

    const landenWithCount = (data || []).map(land => ({
      ...land,
      steden_count: stedenCountMap[land.id] || 0
    }));

    setLanden(landenWithCount);
    setLoading(false);
  };

  useEffect(() => {
    fetchLanden();
  }, []);

  const importSteden = async (landId: string, landNaam: string) => {
    setImporting(landId);
    toast({ title: `Steden importeren voor ${landNaam}...` });

    try {
      const { data, error } = await supabase.functions.invoke('import-buitenland-steden', {
        body: { landId, landNaam }
      });

      if (error) throw error;

      if (data.success) {
        toast({ title: data.message });
        fetchLanden();
      } else {
        toast({ title: data.error || 'Import mislukt', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({ title: 'Fout bij importeren steden', variant: 'destructive' });
    } finally {
      setImporting(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const landData = {
      naam: formData.naam,
      slug: slugify(formData.naam),
      domein: formData.domein || null,
      km_tarief: parseFloat(formData.km_tarief),
      actief: formData.actief,
    };

    if (editingLand) {
      const { error } = await supabase
        .from('landen')
        .update(landData)
        .eq('id', editingLand.id);

      if (error) {
        toast({ title: 'Fout bij opslaan', variant: 'destructive' });
      } else {
        toast({ title: 'Land bijgewerkt' });
        fetchLanden();
      }
    } else {
      // Insert new country and get the ID
      const { data: newLand, error } = await supabase
        .from('landen')
        .insert(landData)
        .select()
        .single();

      if (error) {
        toast({ title: 'Fout bij toevoegen', variant: 'destructive' });
      } else {
        toast({ title: 'Land toegevoegd, steden worden geïmporteerd...' });
        fetchLanden();
        
        // Automatically import cities for the new country
        if (newLand) {
          importSteden(newLand.id, formData.naam);
        }
      }
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Weet u zeker dat u dit land wilt verwijderen?')) return;

    const { error } = await supabase.from('landen').delete().eq('id', id);

    if (error) {
      toast({ title: 'Fout bij verwijderen', variant: 'destructive' });
    } else {
      toast({ title: 'Land verwijderd' });
      fetchLanden();
    }
  };

  const resetForm = () => {
    setFormData({ naam: '', domein: '', km_tarief: '0.50', actief: true });
    setEditingLand(null);
  };

  const openEditDialog = (land: Land) => {
    setEditingLand(land);
    setFormData({
      naam: land.naam,
      domein: land.domein || '',
      km_tarief: String(land.km_tarief),
      actief: land.actief,
    });
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Landen</h1>
            <p className="text-muted-foreground mt-1">Beheer bestemmingslanden en tarieven.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Land toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingLand ? 'Land bewerken' : 'Nieuw land'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="naam">Naam</Label>
                  <Input
                    id="naam"
                    value={formData.naam}
                    onChange={(e) => setFormData({ ...formData, naam: e.target.value })}
                    placeholder="Frankrijk"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domein">Domein (optioneel)</Label>
                  <Input
                    id="domein"
                    value={formData.domein}
                    onChange={(e) => setFormData({ ...formData, domein: e.target.value })}
                    placeholder="koerier-frankrijk.nl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="km_tarief">Kilometerprijs (€)</Label>
                  <Input
                    id="km_tarief"
                    type="number"
                    step="0.01"
                    value={formData.km_tarief}
                    onChange={(e) => setFormData({ ...formData, km_tarief: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="actief"
                    checked={formData.actief}
                    onCheckedChange={(checked) => setFormData({ ...formData, actief: checked })}
                  />
                  <Label htmlFor="actief">Actief</Label>
                </div>
                <Button type="submit" className="w-full">Opslaan</Button>
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
                    <TableHead>Naam</TableHead>
                    <TableHead>Steden</TableHead>
                    <TableHead>Domein</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[140px]">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {landen.map((land) => (
                    <TableRow key={land.id}>
                      <TableCell className="font-medium">{land.naam}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          {land.steden_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>{land.domein || '-'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${land.actief ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {land.actief ? 'Actief' : 'Inactief'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => importSteden(land.id, land.naam)}
                            disabled={importing === land.id}
                            title="Steden importeren"
                          >
                            {importing === land.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MapPin className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(land)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(land.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {landen.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nog geen landen toegevoegd
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

export default AdminLanden;