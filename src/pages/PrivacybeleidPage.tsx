import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { SEOHead } from '@/components/SEOHead';
import { CONTACT } from '@/lib/contact';

const items = [
  {
    titel: 'Welke gegevens hebben wij nodig',
    inhoud:
      'Om een rit uit te voeren, hebben wij het ophaaladres, afleveradres en het factuuradres nodig. Deze gegevens vragen wij per email of invulformulier op onze website.',
  },
  {
    titel: 'Wat doen wij met deze gegevens',
    inhoud: 'Wij gebruiken deze gegevens om de rit(ten) uit te voeren en om de factuur op te maken.',
  },
  {
    titel: 'Delen van gegevens met derden',
    inhoud:
      'Wij werken samen met diverse koeriersbedrijven. Deze hebben uiteraard de laad- en loslocaties nodig. Verder worden de gegevens niet gedeeld.',
  },
  {
    titel: 'Hoelang worden de gegevens opgeslagen',
    inhoud:
      'Als bedrijf zijn wij wettelijk verplicht facturen en communicatie 7 jaar op te slaan voor bijvoorbeeld de Belastingdienst. Deze gegevens staan op een beveiligde computer en zijn niet toegankelijk van buitenaf.',
  },
  {
    titel: 'Wie zijn er verantwoordelijk voor de persoons-/bedrijfsgegevens',
    inhoud: 'Hans de Koning en Benjamin de Wit zijn als eigenaren verantwoordelijk voor de omgang met de persoons-/bedrijfsgegevens.',
  },
  {
    titel: 'Wij vragen nooit de volgende type gegevens',
    inhoud: 'Ras, godsdienst, gezondheid, politieke opvattingen, genetische- of biometrische gegevens.',
  },
  {
    titel: 'Hoe beveiligen wij uw gegevens die per internet verzonden worden',
    inhoud:
      'Onze website beschikt over een goede beveiliging (SSL/TLS certificaten) voor het veilig verzenden van uw gegevens via ons invulformulier op de website en het verzenden van uw gegevens per email.',
  },
  {
    titel: 'Inzage gegevens',
    inhoud: `Wij verzamelen nooit meer gegevens dan dat u ons verstrekt. Wilt u alsnog weten wat wij over u weten dan kunt u dit via email bij ons opvragen. Mail hiervoor naar ${CONTACT.email}.`,
  },
  {
    titel: 'Verwijderen van de gegevens',
    inhoud:
      'Indien gewenst, kunnen wij direct na de rit de adresgegevens van het laad- en losadres digitaal verwijderen. Na betaling van de factuur, kunnen wij ook direct de factuurgegevens digitaal verwijderen. Zoals aangegeven bij punt 4, dienen wij de gegevens wel 7 jaar te bewaren. Dit doen we alleen uitgeprint op papier bij de wens de gegevens voor zover wettelijk toegestaan te verwijderen.',
  },
  {
    titel: 'Overige vragen',
    inhoud: `Heeft u overige vragen? Tijdens kantooruren beantwoorden wij graag al uw vragen. Bel hiervoor naar ${CONTACT.telefoon}.`,
  },
];

const PrivacybeleidPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Privacybeleid | De Europa Koerier"
        description="Lees hoe De Europa Koerier omgaat met uw persoons- en bedrijfsgegevens."
      />
      <Header />

      <main className="flex-1 py-12">
        <div className="container max-w-3xl">
          <h1 className="font-display text-3xl font-bold mb-8">Privacybeleid</h1>

          <ol className="space-y-6 list-decimal pl-6">
            {items.map((item) => (
              <li key={item.titel}>
                <h2 className="font-display text-lg font-semibold">{item.titel}</h2>
                <p className="text-muted-foreground mt-1">{item.inhoud}</p>
              </li>
            ))}
          </ol>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacybeleidPage;
