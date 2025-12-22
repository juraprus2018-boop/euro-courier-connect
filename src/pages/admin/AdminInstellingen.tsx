import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, MapPin, Euro, Loader2 } from "lucide-react";

interface Instelling {
  id: string;
  sleutel: string;
  waarde: string;
  beschrijving: string | null;
}

export default function AdminInstellingen() {
  const [instellingen, setInstellingen] = useState<Instelling[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    km_tarief: "",
    depot_latitude: "",
    depot_longitude: "",
  });

  useEffect(() => {
    fetchInstellingen();
  }, []);

  const fetchInstellingen = async () => {
    try {
      const { data, error } = await supabase
        .from("instellingen")
        .select("*");

      if (error) throw error;

      setInstellingen(data || []);
      
      // Map to form data
      const newFormData = { ...formData };
      data?.forEach((item) => {
        if (item.sleutel in newFormData) {
          newFormData[item.sleutel as keyof typeof newFormData] = item.waarde;
        }
      });
      setFormData(newFormData);
    } catch (error) {
      console.error("Error fetching instellingen:", error);
      toast.error("Fout bij ophalen instellingen");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update each setting
      for (const [sleutel, waarde] of Object.entries(formData)) {
        const { error } = await supabase
          .from("instellingen")
          .update({ waarde })
          .eq("sleutel", sleutel);

        if (error) throw error;
      }

      toast.success("Instellingen opgeslagen");
    } catch (error) {
      console.error("Error saving instellingen:", error);
      toast.error("Fout bij opslaan instellingen");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Instellingen</h1>
          <p className="text-muted-foreground">Beheer algemene instellingen zoals km-tarief en depot locatie</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Tarieven
            </CardTitle>
            <CardDescription>
              Stel het kilometer tarief in voor prijsberekeningen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="km_tarief">Prijs per kilometer (€)</Label>
              <Input
                id="km_tarief"
                type="number"
                step="0.01"
                min="0"
                value={formData.km_tarief}
                onChange={(e) => setFormData({ ...formData, km_tarief: e.target.value })}
                placeholder="0.50"
              />
              <p className="text-sm text-muted-foreground">
                Dit tarief wordt gebruikt voor alle routeprijsberekeningen
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Depot Locatie
            </CardTitle>
            <CardDescription>
              De vaste locatie van waaruit alle routes starten en eindigen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="depot_latitude">Breedtegraad (Latitude)</Label>
                <Input
                  id="depot_latitude"
                  type="text"
                  value={formData.depot_latitude}
                  onChange={(e) => setFormData({ ...formData, depot_latitude: e.target.value })}
                  placeholder="51.4386732"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depot_longitude">Lengtegraad (Longitude)</Label>
                <Input
                  id="depot_longitude"
                  type="text"
                  value={formData.depot_longitude}
                  onChange={(e) => setFormData({ ...formData, depot_longitude: e.target.value })}
                  placeholder="5.5223595"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Route berekening: Depot → Ophaallocatie → Bestemming → Depot
            </p>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Opslaan...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Instellingen Opslaan
            </>
          )}
        </Button>
      </div>
    </AdminLayout>
  );
}
