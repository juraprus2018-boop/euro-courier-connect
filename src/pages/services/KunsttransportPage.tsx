import { Palette } from 'lucide-react';
import { ServicePageLayout } from '@/components/public/ServicePageLayout';

const KunsttransportPage = () => (
  <ServicePageLayout
    metaTitle="Kunsttransport | De Europa Koerier"
    metaDescription="Veilig en discreet kunsttransport door heel Europa. Klimaatbeheerst, verzekerd en met ervaren koeriers. Vraag een offerte aan."
    badge="Kunsttransport"
    title="Veilig kunsttransport voor galeries en verzamelaars"
    intro="Kunstwerken vragen om een speciale aanpak. Wij vervoeren schilderijen, beelden en andere waardevolle kunst met de grootste zorg, voorzien van professionele verpakking, klimaatcontrole en een volledige verzekering."
    icon={Palette}
    features={[
      { title: 'Discreet en vertrouwelijk', description: 'Wij respecteren de waarde en gevoeligheid van uw kunstwerken. Geen openbare informatie, geen omwegen.' },
      { title: 'Direct van A naar B', description: 'Geen overslag, geen tussenopslag. Uw kunstwerk wordt rechtstreeks naar de bestemming gebracht.' },
      { title: 'Klimaatbeheerd vervoer', description: 'Op verzoek vervoer in een geconditioneerde wagen om temperatuur en luchtvochtigheid te beheersen.' },
      { title: 'Aanvullende verzekering', description: 'Standaard verzekerd, met optie tot aanvullende all-risk verzekering voor topstukken.' },
      { title: 'Galeries en musea', description: 'Wij werken voor veilinghuizen, galeries, musea en particuliere verzamelaars in heel Europa.' },
      { title: 'Ervaren koeriers', description: 'Onze chauffeurs zijn getraind in het zorgvuldig laden, vastzetten en lossen van kunst.' },
    ]}
  >
    <h2>Van galerie tot expositie</h2>
    <p className="text-muted-foreground">
      Of u nu een schilderij naar een veilinghuis in Londen wilt brengen of een sculptuur naar een
      expositie in Berlijn – wij zorgen dat het kunstwerk in perfecte staat aankomt. Wij rijden
      direct, zonder overslag, en zorgen dat het kunstwerk altijd onder toezicht blijft van
      dezelfde koerier.
    </p>
    <p className="text-muted-foreground">
      Op verzoek leveren wij maatwerk verpakkingen, kratten en kunstdekens. Ook discrete ophaal en
      aflevering buiten openingstijden behoort tot de mogelijkheden.
    </p>
  </ServicePageLayout>
);

export default KunsttransportPage;
