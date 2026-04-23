import { Plane } from 'lucide-react';
import { ServicePageLayout } from '@/components/public/ServicePageLayout';

const OnBoardKoeriersdienstPage = () => (
  <ServicePageLayout
    metaTitle="On-Board Koeriersdienst (OBC) | De Europa Koerier"
    metaDescription="On-Board Courier service: een persoonlijke koerier reist mee met uw zending in het vliegtuig of voertuig. Maximale snelheid en zekerheid wereldwijd."
    badge="On-Board Koeriersdienst"
    title="On-Board Koeriersdienst (OBC) – persoonlijke begeleiding"
    intro="Wanneer er geen ruimte is voor risico, sturen wij een persoonlijke koerier met uw zending mee. Onze On-Board Couriers reizen met de eerstvolgende vlucht of vertrekken direct met de auto – en houden uw zending van ophaal tot aflevering onafgebroken in eigen hand."
    icon={Plane}
    features={[
      { title: 'Persoonlijke koerier', description: 'Eén vaste koerier reist mee met uw zending van het ophaaladres tot aan de bestemming.' },
      { title: 'Snelste optie', description: 'Wij boeken de eerstvolgende vlucht of vertrekken direct per auto. Sneller dan reguliere expresdiensten.' },
      { title: 'Maximale zekerheid', description: 'Uw zending wordt nooit uit het oog verloren. Geen overslag, geen risico op verlies.' },
      { title: 'Wereldwijd inzetbaar', description: 'Niet alleen Europa: onze OBC-koeriers vliegen ook intercontinentaal voor uw spoedzending.' },
      { title: 'Realtime updates', description: 'U ontvangt updates van vertrek, transfer en aankomst – stap voor stap.' },
      { title: 'Hoogwaardige zendingen', description: 'Ideaal voor prototypes, monsters, juwelen, contracten en andere onmisbare goederen.' },
    ]}
  >
    <h2>Wanneer kiest u voor On-Board Courier?</h2>
    <p className="text-muted-foreground">
      Een On-Board Courier is de oplossing wanneer een normale koerier of luchtvracht niet snel of
      niet zeker genoeg is. Denk aan een productieonderdeel dat dezelfde dag in een fabriek moet
      zijn, een prototype dat naar een internationale beurs moet, of een belangrijk contract dat
      persoonlijk getekend moet worden.
    </p>
    <p className="text-muted-foreground">
      Onze koerier haalt uw zending persoonlijk op, reist mee in cabine of voertuig en levert
      direct af bij de eindbestemming. U weet exact waar uw zending is, op elk moment. Bel ons
      voor de planning – wij vertrekken indien nodig binnen het uur.
    </p>
  </ServicePageLayout>
);

export default OnBoardKoeriersdienstPage;
