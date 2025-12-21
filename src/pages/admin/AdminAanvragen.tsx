import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface Aanvraag {
  id: string;
  ophaal_adres: string;
  ophaal_plaats: string;
  aflever_adres: string;
  aflever_plaats: string;
  contact_naam: string;
  contact_email: string;
  contact_telefoon: string | null;
  zending_type: string | null;
  gewicht_kg: number | null;
  status: string;
  created_at: string;
  opmerkingen: string | null;
}

const AdminAanvragen = () => {
  const [aanvragen, setAanvragen] = useState<Aanvraag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAanvraag, setSelectedAanvraag] = useState<Aanvraag | null>(null);
  const { toast } = useToast();

  const fetchAanvragen = async () => {
    const { data, error } = await supabase
      .from('aanvragen')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching aanvragen:', error);
    } else {
      setAanvragen(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAanvragen();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('aanvragen').update({ status }).eq('id', id);

    if (error) {
      toast({ title: 'Fout bij bijwerken', variant: 'destructive' });
    } else {
      toast({ title: 'Status bijgewerkt' });
      fetchAanvragen();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Weet u zeker dat u deze aanvraag wilt verwijderen?')) return;

    const { error } = await supabase.from('aanvragen').delete().eq('id', id);

    if (error) {
      toast({ title: 'Fout bij verwijderen', variant: 'destructive' });
    } else {
      toast({ title: 'Aanvraag verwijderd' });
      fetchAanvragen();
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      nieuw: 'bg-primary/10 text-primary',
      in_behandeling: 'bg-warning/10 text-warning',
      offerte_verzonden: 'bg-accent/10 text-accent',
      akkoord: 'bg-success/10 text-success',
      afgewezen: 'bg-destructive/10 text-destructive',
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.nieuw}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Aanvragen</h1>
          <p className="text-muted-foreground mt-1">Beheer binnenkomende offerteaanvragen.</p>
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
                    <TableHead>Datum</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aanvragen.map((aanvraag) => (
                    <TableRow key={aanvraag.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(aanvraag.created_at), 'd MMM yyyy', { locale: nl })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{aanvraag.contact_naam}</p>
                          <p className="text-sm text-muted-foreground">{aanvraag.contact_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{aanvraag.ophaal_plaats} → {aanvraag.aflever_plaats}</p>
                      </TableCell>
                      <TableCell>
                        <Select value={aanvraag.status} onValueChange={(value) => updateStatus(aanvraag.id, value)}>
                          <SelectTrigger className="w-[160px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nieuw">Nieuw</SelectItem>
                            <SelectItem value="in_behandeling">In behandeling</SelectItem>
                            <SelectItem value="offerte_verzonden">Offerte verzonden</SelectItem>
                            <SelectItem value="akkoord">Akkoord</SelectItem>
                            <SelectItem value="afgewezen">Afgewezen</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedAanvraag(aanvraag)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(aanvraag.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {aanvragen.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nog geen aanvragen ontvangen
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedAanvraag} onOpenChange={() => setSelectedAanvraag(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aanvraag details</DialogTitle>
          </DialogHeader>
          {selectedAanvraag && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Ophaaladres</h4>
                  <p>{selectedAanvraag.ophaal_adres}</p>
                  <p>{selectedAanvraag.ophaal_plaats}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Afleveradres</h4>
                  <p>{selectedAanvraag.aflever_adres}</p>
                  <p>{selectedAanvraag.aflever_plaats}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Contact</h4>
                  <p>{selectedAanvraag.contact_naam}</p>
                  <p>{selectedAanvraag.contact_email}</p>
                  <p>{selectedAanvraag.contact_telefoon || '-'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Zending</h4>
                  <p>Type: {selectedAanvraag.zending_type || '-'}</p>
                  <p>Gewicht: {selectedAanvraag.gewicht_kg ? `${selectedAanvraag.gewicht_kg} kg` : '-'}</p>
                </div>
              </div>
              {selectedAanvraag.opmerkingen && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Opmerkingen</h4>
                  <p className="text-sm">{selectedAanvraag.opmerkingen}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminAanvragen;