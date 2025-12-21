import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const quoteSchema = z.object({
  ophaal_adres: z.string().min(1, 'Ophaaladres is verplicht').max(500),
  ophaal_postcode: z.string().max(20).optional(),
  ophaal_plaats: z.string().min(1, 'Ophaalplaats is verplicht').max(100),
  aflever_adres: z.string().min(1, 'Afleveradres is verplicht').max(500),
  aflever_postcode: z.string().max(20).optional(),
  aflever_plaats: z.string().min(1, 'Afleverplaats is verplicht').max(100),
  datum: z.string().optional(),
  tijd_voorkeur: z.string().optional(),
  zending_type: z.string().optional(),
  gewicht_kg: z.string().optional(),
  lengte_cm: z.string().optional(),
  breedte_cm: z.string().optional(),
  hoogte_cm: z.string().optional(),
  omschrijving: z.string().max(2000).optional(),
  contact_naam: z.string().min(1, 'Naam is verplicht').max(100),
  contact_email: z.string().email('Ongeldig e-mailadres').max(255),
  contact_telefoon: z.string().max(50).optional(),
  contact_bedrijf: z.string().max(100).optional(),
  opmerkingen: z.string().max(2000).optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
  routeId?: string;
  landId?: string;
  defaultOphaalPlaats?: string;
  defaultAfleverPlaats?: string;
}

export function QuoteForm({ routeId, landId, defaultOphaalPlaats, defaultAfleverPlaats }: QuoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      ophaal_plaats: defaultOphaalPlaats || '',
      aflever_plaats: defaultAfleverPlaats || '',
    },
  });

  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('aanvragen').insert({
        route_id: routeId || null,
        land_id: landId || null,
        ophaal_adres: data.ophaal_adres,
        ophaal_postcode: data.ophaal_postcode || null,
        ophaal_plaats: data.ophaal_plaats,
        aflever_adres: data.aflever_adres,
        aflever_postcode: data.aflever_postcode || null,
        aflever_plaats: data.aflever_plaats,
        datum: data.datum || null,
        tijd_voorkeur: data.tijd_voorkeur || null,
        zending_type: data.zending_type || null,
        gewicht_kg: data.gewicht_kg ? parseFloat(data.gewicht_kg) : null,
        lengte_cm: data.lengte_cm ? parseFloat(data.lengte_cm) : null,
        breedte_cm: data.breedte_cm ? parseFloat(data.breedte_cm) : null,
        hoogte_cm: data.hoogte_cm ? parseFloat(data.hoogte_cm) : null,
        omschrijving: data.omschrijving || null,
        contact_naam: data.contact_naam,
        contact_email: data.contact_email,
        contact_telefoon: data.contact_telefoon || null,
        contact_bedrijf: data.contact_bedrijf || null,
        opmerkingen: data.opmerkingen || null,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: 'Aanvraag verzonden!',
        description: 'We nemen zo snel mogelijk contact met u op.',
      });
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast({
        title: 'Er ging iets mis',
        description: 'Probeer het later opnieuw.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-success/50 bg-success/5">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <Send className="h-8 w-8 text-success" />
          </div>
          <h3 className="font-display text-xl font-bold">Bedankt voor uw aanvraag!</h3>
          <p className="mt-2 text-muted-foreground">
            We hebben uw offerteaanvraag ontvangen en nemen binnen 24 uur contact met u op.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Offerte aanvragen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">Ophaaladres</h4>
              
              <div className="space-y-2">
                <Label htmlFor="ophaal_adres">Adres *</Label>
                <Input id="ophaal_adres" {...register('ophaal_adres')} placeholder="Straat en huisnummer" />
                {errors.ophaal_adres && <p className="text-sm text-destructive">{errors.ophaal_adres.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ophaal_postcode">Postcode</Label>
                  <Input id="ophaal_postcode" {...register('ophaal_postcode')} placeholder="1234 AB" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ophaal_plaats">Plaats *</Label>
                  <Input id="ophaal_plaats" {...register('ophaal_plaats')} placeholder="Amsterdam" />
                  {errors.ophaal_plaats && <p className="text-sm text-destructive">{errors.ophaal_plaats.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">Afleveradres</h4>
              
              <div className="space-y-2">
                <Label htmlFor="aflever_adres">Adres *</Label>
                <Input id="aflever_adres" {...register('aflever_adres')} placeholder="Straat en huisnummer" />
                {errors.aflever_adres && <p className="text-sm text-destructive">{errors.aflever_adres.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aflever_postcode">Postcode</Label>
                  <Input id="aflever_postcode" {...register('aflever_postcode')} placeholder="75001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aflever_plaats">Plaats *</Label>
                  <Input id="aflever_plaats" {...register('aflever_plaats')} placeholder="Parijs" />
                  {errors.aflever_plaats && <p className="text-sm text-destructive">{errors.aflever_plaats.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="datum">Gewenste datum</Label>
              <Input id="datum" type="date" {...register('datum')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tijd_voorkeur">Tijdvoorkeur</Label>
              <Select onValueChange={(value) => setValue('tijd_voorkeur', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ochtend">Ochtend (08:00-12:00)</SelectItem>
                  <SelectItem value="middag">Middag (12:00-17:00)</SelectItem>
                  <SelectItem value="avond">Avond (17:00-21:00)</SelectItem>
                  <SelectItem value="flexibel">Flexibel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zending_type">Type zending</Label>
              <Select onValueChange={(value) => setValue('zending_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pallet">Pallet</SelectItem>
                  <SelectItem value="pakket">Pakket</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="meubel">Meubel</SelectItem>
                  <SelectItem value="auto-onderdeel">Auto-onderdeel</SelectItem>
                  <SelectItem value="overig">Overig</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gewicht_kg">Gewicht (kg)</Label>
              <Input id="gewicht_kg" type="number" step="0.1" {...register('gewicht_kg')} placeholder="25" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lengte_cm">Lengte (cm)</Label>
              <Input id="lengte_cm" type="number" {...register('lengte_cm')} placeholder="100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breedte_cm">Breedte (cm)</Label>
              <Input id="breedte_cm" type="number" {...register('breedte_cm')} placeholder="60" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hoogte_cm">Hoogte (cm)</Label>
              <Input id="hoogte_cm" type="number" {...register('hoogte_cm')} placeholder="40" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="omschrijving">Omschrijving zending</Label>
            <Textarea id="omschrijving" {...register('omschrijving')} placeholder="Beschrijf wat u wilt versturen..." rows={3} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_naam">Uw naam *</Label>
              <Input id="contact_naam" {...register('contact_naam')} placeholder="Jan Jansen" />
              {errors.contact_naam && <p className="text-sm text-destructive">{errors.contact_naam.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">E-mailadres *</Label>
              <Input id="contact_email" type="email" {...register('contact_email')} placeholder="jan@bedrijf.nl" />
              {errors.contact_email && <p className="text-sm text-destructive">{errors.contact_email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_telefoon">Telefoonnummer</Label>
              <Input id="contact_telefoon" {...register('contact_telefoon')} placeholder="+31 6 12345678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_bedrijf">Bedrijfsnaam</Label>
              <Input id="contact_bedrijf" {...register('contact_bedrijf')} placeholder="Uw Bedrijf B.V." />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opmerkingen">Opmerkingen</Label>
            <Textarea id="opmerkingen" {...register('opmerkingen')} placeholder="Extra informatie of wensen..." rows={3} />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verzenden...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Offerte aanvragen
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}