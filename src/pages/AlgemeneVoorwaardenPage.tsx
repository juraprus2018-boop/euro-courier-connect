import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { SEOHead } from '@/components/SEOHead';
import { FileText } from 'lucide-react';

const AlgemeneVoorwaardenPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Algemene voorwaarden | De Europa Koerier"
        description="Lees de algemene voorwaarden van De Europa Koerier voor binnenlands en internationaal koerierstransport."
      />
      <Header />

      <main className="flex-1 py-12">
        <div className="container max-w-3xl">
          <h1 className="font-display text-3xl font-bold mb-8">Algemene voorwaarden</h1>

          <div className="prose prose-neutral max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="font-display text-xl font-semibold">Artikel 1: Definities</h2>
              <ol className="list-decimal pl-6 space-y-3 text-muted-foreground">
                <li>
                  <strong className="text-foreground">AVC</strong> – Algemene Vervoercondities 2002 zoals laatstelijk vastgesteld door de Stichting vervoeradres en gedeponeerd ter Griffie van de Arrondissementsrechtbank te Amsterdam en Rotterdam. Voor binnenlandsvervoer hanteren wij deze voorwaarden.
                </li>
                <li>
                  <strong className="text-foreground">CMR</strong> – Verdrag betreffende de overeenkomst tot internationaal vervoer van goederen over de weg (Genève 1956), zoals aangevuld door het protocol van 1978.
                </li>
                <li>
                  <strong className="text-foreground">Koerier</strong> – Degene die zich jegens de afzender heeft verbonden zo spoedig mogelijk een zending te vervoeren en aan de geadresseerde af te leveren, waarbij het aflevertijdstip dan wel de aflevertermijn waarop de zending in ieder geval moet worden afgeleverd, bij de opdracht wordt overeengekomen.
                </li>
                <li>
                  <strong className="text-foreground">Zending</strong> – Een zaak dan wel het geheel van zaken dat gelijktijdig vervoerd wordt en bestemd is voor een ontvanger.
                </li>
                <li><strong className="text-foreground">Afzender</strong> – De contractuele wederpartij van de koerier.</li>
                <li>
                  <strong className="text-foreground">Ontvanger</strong> – Geadresseerde of (mede)bewoner dan wel ondergeschikte werkzaam op het afleveradres aan wie de koerier de zending dient af te leveren.
                </li>
                <li><strong className="text-foreground">De Europa Koerier</strong> – Wij, het koeriersbedrijf.</li>
                <li><strong className="text-foreground">Onderaannemer</strong> – Koeriersbedrijf dat namens De Europa Koerier een zending vervoert.</li>
                <li>
                  <strong className="text-foreground">Overmacht</strong> – Omstandigheden, voor zover een zorgvuldig koerier deze niet heeft kunnen vermijden en voor zover zulk een koerier de gevolgen daarvan niet heeft kunnen verhinderen.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold">Artikel 2: Werkingssfeer</h2>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li>Op binnenlandse koeriersdiensten zijn naast deze voorwaarden de AVC van toepassing voor zover daarvan in deze voorwaarden niet wordt afgeweken.</li>
                <li>Op grensoverschrijdende koeriersdiensten is van toepassing het CMR, alsmede de met het CMR niet strijdige bepalingen genoemd in lid 1 van dit artikel.</li>
              </ol>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold">Artikel 3: Verplichtingen van de koerier</h2>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li>De koerier is verplicht de overeengekomen zending op de overeengekomen plaats en tijd in ontvangst te nemen.</li>
                <li>Indien de koerier niet voldoet aan de in lid 1 genoemde verplichting heeft de afzender het recht, onverminderd zijn recht schadevergoeding te vorderen, de overeenkomst onmiddellijk op te zeggen.</li>
                <li>De koerier is verplicht de zending uiterlijk op het overeengekomen tijdstip dan wel binnen de overeengekomen termijn af te leveren aan de ontvanger.</li>
                <li>De artikelen 9 lid 3 en 13 lid 3 AVC inzake vertraging zijn niet van toepassing.</li>
              </ol>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold">Artikel 4: Verplichting van de afzender</h2>
              <p className="text-muted-foreground">
                De afzender is verplicht ter voldoening aan douane- en andere formaliteiten, welke voor de aflevering van de zending moeten worden vervuld, de nodige bescheiden bij de vrachtbrief te voegen en ter beschikking van de koerier te stellen en hem alle noodzakelijke inlichtingen te verschaffen.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold">Artikel 5: Aansprakelijkheid van de koerier</h2>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Zending beschadigd:</strong>
              </p>
              <ul className="space-y-2">
                <li>
                  <a href="/documents/avc.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
                    <FileText className="h-4 w-4" />
                    Zie voorwaarden AVC voor binnenlandsvervoer (PDF)
                  </a>
                </li>
                <li>
                  <a href="/documents/cmr.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
                    <FileText className="h-4 w-4" />
                    Zie voorwaarden CMR voor buitenlandsvervoer (PDF)
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold">Artikel 6: Uitbetaling aan onderaannemers</h2>
              <p className="text-muted-foreground">
                De betalingstermijn voor facturen van onderaannemers aan De Europa Koerier bedraagt standaard 30 dagen tenzij de opdrachtgever zelf er langer de tijd voor neemt; de betalingstermijn is dan hetzelfde als de betalingstermijn van de afzender van de onderhavige zending, plus twee werkdagen. Door het accepteren van de vervoersopdracht door de onderaannemer verklaart deze zich hiermee akkoord.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold">Artikel 7: Arbitrage</h2>
              <p className="text-muted-foreground">
                Alle geschillen die tussen partijen ontstaan met betrekking tot de onderhavige overeenkomst kunnen worden beslecht door middel van arbitrage overeenkomstig het Reglement van de Stichting Arbitrage voor Logistiek, gevestigd te Den Haag.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AlgemeneVoorwaardenPage;
