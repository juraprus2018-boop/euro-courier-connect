import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { SEOHead } from '@/components/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CONTACT } from '@/lib/contact';

const faq = [
  {
    vraag: 'Wat voor soort zendingen vervoert De Europa Koerier?',
    antwoord:
      'De Europa Koerier is gespecialiseerd in het vervoeren van diverse soorten zendingen, waaronder medische goederen, kunstwerken, vertrouwelijke documenten en algemene goederen. Onze diensten zijn beschikbaar voor zowel particulieren als bedrijven.',
  },
  {
    vraag: 'In welke landen bezorgt De Europa Koerier?',
    antwoord:
      'De Europa Koerier bezorgt zendingen door heel Europa, inclusief de Benelux, Duitsland, Frankrijk, Spanje, Italië en het Verenigd Koninkrijk. We streven er altijd naar om uw zendingen zo snel mogelijk te leveren, ongeacht de bestemming.',
  },
  {
    vraag: 'Wat voor soort voertuigen gebruikt De Europa Koerier?',
    antwoord:
      'Bij De Europa Koerier beschikken wij over een breed scala aan voertuigen, van bestelwagens voor kleine zendingen tot bakwagens met laadklep voor grotere zendingen. Onze bestelwagens, bestelbussen en bakwagens met laadklep staan dag en nacht 7 dagen per week tot uw beschikking. Al onze voertuigen zijn goed onderhouden en uitgerust met GPS tracking, zodat we uw zendingen op de voet kunnen volgen.',
  },
  {
    vraag: 'Hoe kan ik een zending boeken bij De Europa Koerier?',
    antwoord: `U kunt een zending boeken door telefonisch contact met ons op te nemen via ${CONTACT.telefoon} of ons online contactformulier in te vullen. Wij zullen vervolgens een offerte voor u opstellen en u informeren over de beste verzendopties voor uw specifieke zending.`,
  },
  {
    vraag: 'Hoeveel kost het om een zending te versturen met De Europa Koerier?',
    antwoord:
      'De kosten voor het versturen van een zending variëren afhankelijk van verschillende factoren, zoals het gewicht en de afstand van de zending, het type goederen dat wordt verzonden en de gewenste levertijd. Wij stellen altijd een offerte op maat voor u op, zodat u precies weet wat de kosten zijn voor uw specifieke zending.',
  },
  {
    vraag: 'Hoe kan ik de status van mijn zending volgen?',
    antwoord:
      'Bij De Europa Koerier begrijpen we dat het belangrijk is om de status van uw zending te kunnen volgen. Op verzoek houden wij u op de hoogte van de voortgang, zoals "zending opgehaald", "aangekomen in land van bestemming", en "afgeleverd".',
  },
  {
    vraag: 'Wat gebeurt er als mijn zending verloren of beschadigd raakt?',
    antwoord:
      'Hoewel wij er alles aan doen om ervoor te zorgen dat uw zendingen veilig en op tijd worden geleverd, kan er soms iets misgaan. In dat geval nemen wij direct contact met u op om het probleem op te lossen.',
  },
  {
    vraag: 'Hoe kan ik contact opnemen met De Europa Koerier?',
    antwoord: `Stel een vraag, vraag een offerte aan of boek direct uw koerier. Dit kan telefonisch: ${CONTACT.telefoon}. Natuurlijk kunt u ons ook per email bereiken op ${CONTACT.email}.`,
  },
];

const FaqPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Veelgestelde vragen | De Europa Koerier"
        description="Antwoorden op de meest gestelde vragen over De Europa Koerier: zendingen, landen, voertuigen, prijzen en meer."
      />
      <Header />

      <main className="flex-1 py-12">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl font-bold">Veelgestelde vragen</h1>
            <p className="mt-2 text-muted-foreground">Alles wat u wilt weten over De Europa Koerier</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faq.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-display font-semibold">{item.vraag}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.antwoord}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faq.map((item) => ({
                '@type': 'Question',
                name: item.vraag,
                acceptedAnswer: { '@type': 'Answer', text: item.antwoord },
              })),
            })}
          </script>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FaqPage;
