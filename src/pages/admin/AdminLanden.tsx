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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/slugify';
import { Plus, Loader2, Pencil, Trash2, MapPin, RefreshCw, Check, AlertCircle, Square, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

// Supported countries that can be imported
const SUPPORTED_COUNTRIES = [
  { naam: 'België', domeinSuggestie: 'koerier-belgie.nl' },
  { naam: 'Bulgarije', domeinSuggestie: 'koerier-bulgarije.nl' },
  { naam: 'Denemarken', domeinSuggestie: 'koerier-denemarken.nl' },
  { naam: 'Duitsland', domeinSuggestie: 'koerier-duitsland.nl' },
  { naam: 'Finland', domeinSuggestie: 'koerier-finland.nl' },
  { naam: 'Frankrijk', domeinSuggestie: 'koerier-frankrijk.nl' },
  { naam: 'Griekenland', domeinSuggestie: 'koerier-griekenland.nl' },
  { naam: 'Hongarije', domeinSuggestie: 'koerier-hongarije.nl' },
  { naam: 'Ierland', domeinSuggestie: 'koerier-ierland.nl' },
  { naam: 'Italië', domeinSuggestie: 'koerier-italie.nl' },
  { naam: 'Kroatië', domeinSuggestie: 'koerier-kroatie.nl' },
  { naam: 'Luxemburg', domeinSuggestie: 'koerier-luxemburg.nl' },
  { naam: 'Noorwegen', domeinSuggestie: 'koerier-noorwegen.nl' },
  { naam: 'Oostenrijk', domeinSuggestie: 'koerier-oostenrijk.nl' },
  { naam: 'Polen', domeinSuggestie: 'koerier-polen.nl' },
  { naam: 'Portugal', domeinSuggestie: 'koerier-portugal.nl' },
  { naam: 'Roemenië', domeinSuggestie: 'koerier-roemenie.nl' },
  { naam: 'Slovenië', domeinSuggestie: 'koerier-slovenie.nl' },
  { naam: 'Slowakije', domeinSuggestie: 'koerier-slowakije.nl' },
  { naam: 'Spanje', domeinSuggestie: 'koerier-spanje.nl' },
  { naam: 'Tsjechië', domeinSuggestie: 'koerier-tsjechie.nl' },
  { naam: 'Verenigd Koninkrijk', domeinSuggestie: 'koerier-engeland.nl' },
  { naam: 'Zweden', domeinSuggestie: 'koerier-zweden.nl' },
  { naam: 'Zwitserland', domeinSuggestie: 'koerier-zwitserland.nl' },
];

interface Land {
  id: string;
  naam: string;
  slug: string;
  domein: string | null;
  km_tarief: number;
  actief: boolean;
  steden_count?: number;
  sync_routes_enabled?: boolean;
  sync_routes_status?: string;
  sync_routes_progress?: number;
  sync_routes_total?: number;
  sync_routes_last_run?: string;
  sync_routes_last_message?: string;
}

const AdminLanden = () => {
  const [landen, setLanden] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLand, setEditingLand] = useState<Land | null>(null);
  const [importing, setImporting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    naam: '',
    domein: '',
    km_tarief: '0.50',
    actief: true,
  });
  const { toast } = useToast();

  // Poll for sync status updates
  useEffect(() => {
    const hasRunningSync = landen.some(l => l.sync_routes_status === 'running');
    if (!hasRunningSync) return;

    const interval = setInterval(() => {
      fetchLanden();
    }, 3000);

    return () => clearInterval(interval);
  }, [landen]);

  const fetchLanden = async () => {
    setLoading(true);

    // Fetch landen
    const { data, error } = await supabase
      .from('landen')
      .select('*')
      .order('naam');

    if (error) {
      console.error('Error fetching landen:', error);
      toast({ title: 'Fout bij ophalen landen', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const landenList = (data || []) as Land[];

    // Fetch steden count per land using exact counts (no 1000-row limit)
    const countPairs = await Promise.all(
      landenList.map(async (land) => {
        const { count, error: countError } = await supabase
          .from('buitenland_steden')
          .select('id', { count: 'exact', head: true })
          .eq('land_id', land.id);

        if (countError) {
          console.error('Error counting steden for land', land.id, countError);
        }

        return [land.id, count ?? 0] as const;
      })
    );

    const stedenCountMap = Object.fromEntries(countPairs) as Record<string, number>;

    const landenWithCount = landenList.map((land) => ({
      ...land,
      steden_count: stedenCountMap[land.id] || 0,
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

  const syncRoutes = async (landId: string, landNaam: string) => {
    setSyncing(landId);
    toast({ title: `Routes synchroniseren voor ${landNaam}...` });

    try {
      const { data, error } = await supabase.functions.invoke('sync-routes-land', {
        body: { landId }
      });

      if (error) throw error;

      if (data.success) {
        toast({ title: data.message });
        fetchLanden();
      } else {
        toast({ title: data.error || 'Sync mislukt', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({ title: 'Fout bij synchroniseren routes', variant: 'destructive' });
    } finally {
      setSyncing(null);
    }
  };

  const stopSync = async (landId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-routes-land', {
        body: { landId, action: 'stop' }
      });

      if (error) throw error;
      toast({ title: data.message || 'Sync gestopt' });
      fetchLanden();
    } catch (error) {
      console.error('Stop sync error:', error);
      toast({ title: 'Fout bij stoppen sync', variant: 'destructive' });
    }
  };

  const clearRoutes = async (landId: string, landNaam: string) => {
    if (!confirm(`Weet je zeker dat je ALLE routes voor ${landNaam} wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
      return;
    }

    toast({ title: `Routes verwijderen voor ${landNaam}...` });

    try {
      const { data, error } = await supabase.functions.invoke('sync-routes-land', {
        body: { landId, action: 'clear' }
      });

      if (error) throw error;

      if (data.success) {
        toast({ title: data.message });
        fetchLanden();
      } else {
        toast({ title: data.error || 'Verwijderen mislukt', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Clear routes error:', error);
      toast({ title: 'Fout bij verwijderen routes', variant: 'destructive' });
    }
  };

  const toggleSyncEnabled = async (land: Land) => {
    const newValue = !land.sync_routes_enabled;
    
    const { error } = await supabase
      .from('landen')
      .update({ sync_routes_enabled: newValue })
      .eq('id', land.id);

    if (error) {
      toast({ title: 'Fout bij wijzigen sync instelling', variant: 'destructive' });
      return;
    }

    toast({ title: newValue ? 'Route sync ingeschakeld' : 'Route sync uitgeschakeld' });
    
    // If enabled, start syncing immediately
    if (newValue) {
      syncRoutes(land.id, land.naam);
    }
    
    fetchLanden();
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
                  <Label htmlFor="naam">Land</Label>
                  {editingLand ? (
                    <Input
                      id="naam"
                      value={formData.naam}
                      disabled
                      className="bg-muted"
                    />
                  ) : (
                    <Select
                      value={formData.naam}
                      onValueChange={(value) => {
                        const country = SUPPORTED_COUNTRIES.find(c => c.naam === value);
                        setFormData({ 
                          ...formData, 
                          naam: value,
                          domein: country?.domeinSuggestie || ''
                        });
                      }}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecteer een land" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {SUPPORTED_COUNTRIES
                          .filter(c => !landen.some(l => l.naam === c.naam))
                          .map((country) => (
                            <SelectItem key={country.naam} value={country.naam}>
                              {country.naam}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
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
                    <TableHead>Sync Routes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[140px]">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {landen.map((land) => {
                    const isRunning = land.sync_routes_status === 'running';
                    const progress = land.sync_routes_total ? 
                      Math.round((land.sync_routes_progress || 0) / land.sync_routes_total * 100) : 0;

                    return (
                      <TableRow key={land.id}>
                        <TableCell className="font-medium">{land.naam}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            <MapPin className="h-3 w-3" />
                            {land.steden_count || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2 min-w-[200px]">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={land.sync_routes_enabled || false}
                                onCheckedChange={() => toggleSyncEnabled(land)}
                                disabled={isRunning}
                              />
                              <span className="text-sm">
                                {land.sync_routes_enabled ? 'Aan' : 'Uit'}
                              </span>
                              {isRunning && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-2 text-destructive hover:text-destructive ml-auto"
                                  onClick={() => stopSync(land.id)}
                                  title="Stop sync"
                                >
                                  <Square className="h-3 w-3 mr-1" />
                                  Stop
                                </Button>
                              )}
                              {land.sync_routes_status === 'completed' && (
                                <Check className="h-4 w-4 text-success ml-auto" />
                              )}
                              {land.sync_routes_status === 'stopped' && (
                                <AlertCircle className="h-4 w-4 text-warning ml-auto" />
                              )}
                            </div>
                            
                            {isRunning && (
                              <div className="space-y-1">
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-muted-foreground">
                                  {land.sync_routes_progress || 0} / {land.sync_routes_total || 0}
                                </p>
                              </div>
                            )}
                            
                            {land.sync_routes_last_run && !isRunning && (
                              <p className="text-xs text-muted-foreground">
                                Laatste sync: {formatDistanceToNow(new Date(land.sync_routes_last_run), { addSuffix: true, locale: nl })}
                              </p>
                            )}
                            
                            {land.sync_routes_last_message && !isRunning && (
                              <p className="text-xs text-muted-foreground truncate max-w-[180px]" title={land.sync_routes_last_message}>
                                {land.sync_routes_last_message}
                              </p>
                            )}
                          </div>
                        </TableCell>
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
                              onClick={() => syncRoutes(land.id, land.naam)}
                              disabled={isRunning || syncing === land.id}
                              title="Routes synchroniseren"
                            >
                              {(isRunning || syncing === land.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </Button>
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
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => clearRoutes(land.id, land.naam)}
                              disabled={isRunning}
                              title="Alle routes legen"
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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