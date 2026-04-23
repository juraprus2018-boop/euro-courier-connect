import { Globe2 } from 'lucide-react';
import { ServicePageLayout } from '@/components/public/ServicePageLayout';

const InternationaalTransportPage = () => (
  <ServicePageLayout
    metaTitle="Internationaal transport | De Europa Koerier"
    metaDescription="Internationaal koerierstransport vanuit Nederland naar heel Europa. Direct van A naar B, 24/7 beschikbaar. Vraag uw offerte aan."
    badge="Internationaal transport"
    title="Internationaal transport door heel Europa"
    intro="Van Nederland naar elke uithoek van Europa. Met onze eigen vloot bestelwagens en bakwagens met laadklep verzorgen wij directe ritten naar alle EU-landen, zonder overslag en zonder vertraging."
    icon={Globe2}
    features={[
      { title: 'Direct van A naar B', description: 'Geen overslag of distributiecentra. Uw zending blijft van ophaal tot aflevering bij dezelfde koerier.' },
      { title: 'Heel Europa', description: 'België, Duitsland, Frankrijk, Spanje, Italië, Polen, Verenigd Koninkrijk en alle andere EU-landen.' },
      { title: 'CMR verzekerd', description: 'Volledig verzekerd transport conform de internationale CMR-conventie voor wegvervoer.' },
      { title: 'Eigen koeriers', description: 'Wij werken met vaste, ervaren chauffeurs die de internationale routes door en door kennen.' },
      { title: '24/7 beschikbaar', description: 'Spoedrit nodig in het weekend of midden in de nacht? Wij staan altijd voor u klaar.' },
      { title: 'Track & trace', description: 'Op verzoek houden wij u realtime op de hoogte van de status van uw zending.' },
    ]}
  >
    <h2>Internationaal vervoer met persoonlijke service</h2>
    <p className="text-muted-foreground">
      Bij internationaal transport gaat snelheid en betrouwbaarheid hand in hand. Onze koeriers
      rijden dagelijks vaste routes door Europa en kennen elke douaneprocedure. U krijgt één vast
      aanspreekpunt en de zekerheid dat uw zending door dezelfde chauffeur wordt afgeleverd.
    </p>
    <p className="text-muted-foreground">
      Of het nu gaat om een spoedrit naar Parijs, een zending naar Madrid of een transport naar
      Warschau – wij regelen het. Onze bestelwagens en bakwagens met laadklep zijn uitgerust met
      GPS-tracking en geschikt voor zendingen tot enkele honderden kilo's.
    </p>
  </ServicePageLayout>
);

export default InternationaalTransportPage;
