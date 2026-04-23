import { HeartPulse } from 'lucide-react';
import { ServicePageLayout } from '@/components/public/ServicePageLayout';

const MedischTransportPage = () => (
  <ServicePageLayout
    metaTitle="Medisch transport | De Europa Koerier"
    metaDescription="Spoed medisch transport door heel Europa: medicatie, monsters, organen, medische apparatuur. 24/7 direct van A naar B."
    badge="Medisch transport"
    title="Medisch transport – snel, veilig en op tijd"
    intro="In de medische sector telt elke minuut. Wij verzorgen spoedtransport van medicatie, laboratoriummonsters, medische apparatuur en andere kritieke zendingen voor ziekenhuizen, laboratoria en farmaceutische bedrijven – 24 uur per dag, 7 dagen per week."
    icon={HeartPulse}
    features={[
      { title: '24/7 spoeddienst', description: 'Onze koeriers staan dag en nacht klaar voor medische spoedritten – ook in het weekend en op feestdagen.' },
      { title: 'Direct van A naar B', description: 'Geen overslag, geen vertraging. Uw zending wordt direct van ophaal- naar afleveradres gebracht.' },
      { title: 'Geconditioneerd vervoer', description: 'Op verzoek vervoer onder temperatuurcontrole (gekoeld of bevroren) voor medicatie en monsters.' },
      { title: 'Discreet en hygiënisch', description: 'Onze chauffeurs werken volgens de geldende protocollen voor medisch transport.' },
      { title: 'Heel Europa', description: 'Spoedritten naar elk Europees land, ook over lange afstand. Wij rijden waar het pakket moet zijn.' },
      { title: 'Direct contact', description: 'Eén vast aanspreekpunt en realtime updates over de status van uw zending.' },
    ]}
  >
    <h2>Voor ziekenhuizen, laboratoria en apotheken</h2>
    <p className="text-muted-foreground">
      Of het nu gaat om een spoedlevering van een geneesmiddel, het transport van bloed- of
      weefselmonsters tussen laboratoria, of een vervangend onderdeel voor medische apparatuur –
      wij zorgen dat het op tijd is. Onze koeriers worden getraind in de zorgvuldige omgang met
      medische zendingen en respecteren strikte privacy- en hygiëneprotocollen.
    </p>
    <p className="text-muted-foreground">
      Wij rijden direct, zonder overslag of distributiecentra, zodat uw zending zo snel mogelijk
      bij de patiënt of het lab is. Bel ons direct voor een spoedrit – ook 's nachts en in het
      weekend zijn wij bereikbaar.
    </p>
  </ServicePageLayout>
);

export default MedischTransportPage;
