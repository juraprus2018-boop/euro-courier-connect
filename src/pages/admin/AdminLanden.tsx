import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/slugify';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';

interface Land {
  id: string;
  naam: string;
  slug: string;
  domein: string | null;
  km_tarief: number;
  actief: boolean;
}

const AdminLanden = () => {
  const [landen, setLanden] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLand, setEditingLand] = useState<Land | null>(null);
  const [formData, setFormData] = useState({
    naam: '',
    domein: '',
    km_tarief: '0.50',
    actief: true,
  });
  const { toast } = useToast();

  const fetchLanden = async () => {
    const { data, error } = await supabase
      .from('landen')
      .select('*')
      .order('naam');

    if (error) {
      console.error('Error fetching landen:', error);
    } else {
      setLanden(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLanden();
  }, []);

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
      const { error } = await supabase.from('landen').insert(landData);

      if (error) {
        toast({ title: 'Fout bij toevoegen', variant: 'destructive' });
      } else {
        toast({ title: 'Land toegevoegd' });
        fetchLanden();
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
                    <TableHead>Domein</TableHead>
                    <TableHead>€/km</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {landen.map((land) => (
                    <TableRow key={land.id}>
                      <TableCell className="font-medium">{land.naam}</TableCell>
                      <TableCell>{land.domein || '-'}</TableCell>
                      <TableCell>€{Number(land.km_tarief).toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${land.actief ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {land.actief ? 'Actief' : 'Inactief'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
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