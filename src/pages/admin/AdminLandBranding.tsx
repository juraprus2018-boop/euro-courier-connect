import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Plus, Trash2, Palette, FileText, Search, HelpCircle } from 'lucide-react';

interface FAQItem {
  vraag: string;
  antwoord: string;
}

interface Land {
  id: string;
  naam: string;
  slug: string;
  domein: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  hero_titel: string | null;
  hero_subtitel: string | null;
  hero_afbeelding_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  faq: FAQItem[] | null;
}

const COLOR_PRESETS = [
  { naam: 'Blauw (standaard)', primary: '220 90% 56%', secondary: '38 92% 50%' },
  { naam: 'Oranje', primary: '25 95% 53%', secondary: '220 90% 56%' },
  { naam: 'Groen', primary: '142 76% 36%', secondary: '38 92% 50%' },
  { naam: 'Rood', primary: '0 84% 60%', secondary: '220 90% 56%' },
  { naam: 'Paars', primary: '262 83% 58%', secondary: '38 92% 50%' },
  { naam: 'Teal', primary: '173 80% 40%', secondary: '38 92% 50%' },
  { naam: 'Roze', primary: '330 80% 60%', secondary: '220 90% 56%' },
  { naam: 'Indigo', primary: '239 84% 67%', secondary: '38 92% 50%' },
];

const AdminLandBranding = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [land, setLand] = useState<Land | null>(null);
  
  const [formData, setFormData] = useState({
    primary_color: '220 90% 56%',
    secondary_color: '38 92% 50%',
    hero_titel: '',
    hero_subtitel: '',
    hero_afbeelding_url: '',
    meta_title: '',
    meta_description: '',
    faq: [] as FAQItem[],
  });

  useEffect(() => {
    const fetchLand = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('landen')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast({ title: 'Land niet gevonden', variant: 'destructive' });
        navigate('/admin/landen');
        return;
      }

      const landData: Land = {
        ...data,
        faq: Array.isArray(data.faq) ? (data.faq as unknown as FAQItem[]) : null
      };

      setLand(landData);
      setFormData({
        primary_color: data.primary_color || '220 90% 56%',
        secondary_color: data.secondary_color || '38 92% 50%',
        hero_titel: data.hero_titel || '',
        hero_subtitel: data.hero_subtitel || '',
        hero_afbeelding_url: data.hero_afbeelding_url || '',
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        faq: Array.isArray(data.faq) ? (data.faq as unknown as FAQItem[]) : [],
      });
      setLoading(false);
    };

    fetchLand();
  }, [id]);

  const handleSave = async () => {
    if (!land) return;
    
    setSaving(true);
    
    const { error } = await supabase
      .from('landen')
      .update({
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        hero_titel: formData.hero_titel || null,
        hero_subtitel: formData.hero_subtitel || null,
        hero_afbeelding_url: formData.hero_afbeelding_url || null,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        faq: formData.faq.length > 0 ? JSON.parse(JSON.stringify(formData.faq)) : null,
      })
      .eq('id', land.id);

    if (error) {
      toast({ title: 'Fout bij opslaan', variant: 'destructive' });
    } else {
      toast({ title: 'Branding opgeslagen!' });
    }
    
    setSaving(false);
  };

  const addFAQItem = () => {
    setFormData({
      ...formData,
      faq: [...formData.faq, { vraag: '', antwoord: '' }]
    });
  };

  const updateFAQItem = (index: number, field: 'vraag' | 'antwoord', value: string) => {
    const newFaq = [...formData.faq];
    newFaq[index] = { ...newFaq[index], [field]: value };
    setFormData({ ...formData, faq: newFaq });
  };

  const removeFAQItem = (index: number) => {
    setFormData({
      ...formData,
      faq: formData.faq.filter((_, i) => i !== index)
    });
  };

  const applyColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setFormData({
      ...formData,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!land) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin/landen">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-display text-3xl font-bold">
                Branding: {land.naam}
              </h1>
              <p className="text-muted-foreground mt-1">
                Pas kleuren, teksten en SEO aan voor {land.domein || land.naam}
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Opslaan
          </Button>
        </div>

        <Tabs defaultValue="kleuren" className="space-y-6">
          <TabsList>
            <TabsTrigger value="kleuren" className="gap-2">
              <Palette className="h-4 w-4" />
              Kleuren
            </TabsTrigger>
            <TabsTrigger value="teksten" className="gap-2">
              <FileText className="h-4 w-4" />
              Teksten
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <Search className="h-4 w-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="faq" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="kleuren">
            <Card>
              <CardHeader>
                <CardTitle>Kleurenschema</CardTitle>
                <CardDescription>
                  Kies de kleuren voor de website van {land.naam}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Color Presets */}
                <div>
                  <Label className="mb-3 block">Snelle keuze</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.naam}
                        type="button"
                        onClick={() => applyColorPreset(preset)}
                        className="p-3 rounded-lg border border-border hover:border-primary transition-colors text-left"
                      >
                        <div className="flex gap-2 mb-2">
                          <div 
                            className="w-6 h-6 rounded-full" 
                            style={{ backgroundColor: `hsl(${preset.primary})` }} 
                          />
                          <div 
                            className="w-6 h-6 rounded-full" 
                            style={{ backgroundColor: `hsl(${preset.secondary})` }} 
                          />
                        </div>
                        <span className="text-sm font-medium">{preset.naam}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Color Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primaire kleur (HSL)</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-10 h-10 rounded-lg border border-border shrink-0" 
                        style={{ backgroundColor: `hsl(${formData.primary_color})` }} 
                      />
                      <Input
                        id="primary_color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        placeholder="220 90% 56%"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Format: hue saturation% lightness% (bijv. 220 90% 56%)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Accent kleur (HSL)</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-10 h-10 rounded-lg border border-border shrink-0" 
                        style={{ backgroundColor: `hsl(${formData.secondary_color})` }} 
                      />
                      <Input
                        id="secondary_color"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        placeholder="38 92% 50%"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-6 p-6 rounded-xl" style={{ 
                  background: `linear-gradient(135deg, hsl(${formData.primary_color}) 0%, hsl(${formData.primary_color.replace(/(\d+)%$/, (_, l) => `${Math.min(100, parseInt(l) + 10)}%`)}) 100%)`
                }}>
                  <p className="text-white font-display font-bold text-xl">Preview: De {land.naam} Koerier</p>
                  <p className="text-white/80 mt-1">Zo ziet de header eruit met deze kleuren</p>
                  <button 
                    className="mt-4 px-4 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: `hsl(${formData.secondary_color})`, color: 'white' }}
                  >
                    Offerte aanvragen
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Texts Tab */}
          <TabsContent value="teksten">
            <Card>
              <CardHeader>
                <CardTitle>Homepage teksten</CardTitle>
                <CardDescription>
                  Pas de teksten aan die op de homepage worden getoond
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hero_titel">Hero titel</Label>
                  <Input
                    id="hero_titel"
                    value={formData.hero_titel}
                    onChange={(e) => setFormData({ ...formData, hero_titel: e.target.value })}
                    placeholder={`Koerier naar ${land.naam}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Laat leeg voor standaard: "Koerier naar {land.naam}"
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero_subtitel">Hero subtitel</Label>
                  <Textarea
                    id="hero_subtitel"
                    value={formData.hero_subtitel}
                    onChange={(e) => setFormData({ ...formData, hero_subtitel: e.target.value })}
                    placeholder={`Dagelijkse koeriersdienst van Nederland naar ${land.naam}. Snel, veilig en betaalbaar.`}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero_afbeelding_url">Hero achtergrond afbeelding URL (optioneel)</Label>
                  <Input
                    id="hero_afbeelding_url"
                    value={formData.hero_afbeelding_url}
                    onChange={(e) => setFormData({ ...formData, hero_afbeelding_url: e.target.value })}
                    placeholder="https://example.com/afbeelding.jpg"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO instellingen</CardTitle>
                <CardDescription>
                  Optimaliseer voor zoekmachines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta titel</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder={`De ${land.naam} Koerier - Koerier naar ${land.naam} | Dagelijkse ritten`}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.meta_title.length}/60 karakters (aanbevolen max 60)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta beschrijving</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder={`Professionele koeriersdienst van Nederland naar ${land.naam}. Dagelijks op pad, snelle levering, 100% verzekerd.`}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.meta_description.length}/160 karakters (aanbevolen max 160)
                  </p>
                </div>

                {/* Preview */}
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Google preview:</p>
                  <div className="space-y-1">
                    <p className="text-primary text-lg hover:underline cursor-pointer">
                      {formData.meta_title || `De ${land.naam} Koerier - Koerier naar ${land.naam}`}
                    </p>
                    <p className="text-sm text-success">{land.domein || `de${land.slug}koerier.nl`}</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.meta_description || `Professionele koeriersdienst van Nederland naar ${land.naam}...`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Veelgestelde vragen</CardTitle>
                <CardDescription>
                  Voeg aangepaste FAQ items toe voor {land.naam}. Laat leeg voor standaard FAQ.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.faq.map((item, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <Label>Vraag {index + 1}</Label>
                          <Input
                            value={item.vraag}
                            onChange={(e) => updateFAQItem(index, 'vraag', e.target.value)}
                            placeholder="Bijv. Hoe snel wordt mijn zending bezorgd?"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Antwoord</Label>
                          <Textarea
                            value={item.antwoord}
                            onChange={(e) => updateFAQItem(index, 'antwoord', e.target.value)}
                            placeholder="Het antwoord op de vraag..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeFAQItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button 
                  variant="outline" 
                  onClick={addFAQItem}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  FAQ item toevoegen
                </Button>

                {formData.faq.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Geen aangepaste FAQ items. De standaard FAQ wordt getoond.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminLandBranding;
