import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItem {
  vraag: string;
  antwoord: string;
}

interface FAQSectionProps {
  landNaam?: string;
  customFaq?: FAQItem[];
}

const DEFAULT_FAQ: FAQItem[] = [
  {
    vraag: 'Hoe snel wordt mijn zending bezorgd?',
    antwoord: 'Afhankelijk van de bestemming bezorgen wij uw zending binnen 24 tot 48 uur. Wij rijden dagelijks vaste routes door Europa.'
  },
  {
    vraag: 'Wat kost een koeriersdienst?',
    antwoord: 'De prijs hangt af van de afstand en het formaat van uw zending. Gebruik onze routecalculator voor een directe prijsindicatie, of vraag een offerte aan voor een exact tarief.'
  },
  {
    vraag: 'Zijn mijn goederen verzekerd tijdens transport?',
    antwoord: 'Ja, al onze transporten zijn volledig verzekerd. Wij bieden standaard transportverzekering en op verzoek aanvullende verzekering voor waardevolle zendingen.'
  },
  {
    vraag: 'Kan ik mijn zending volgen?',
    antwoord: 'Ja, u ontvangt een track & trace code waarmee u uw zending realtime kunt volgen. Wij houden u ook proactief op de hoogte van de status.'
  },
  {
    vraag: 'Wat voor soort goederen vervoeren jullie?',
    antwoord: 'Wij vervoeren uiteenlopende goederen: van documenten en pakketten tot pallets en machines. Neem contact op voor specifieke vragen over uw lading.'
  },
  {
    vraag: 'Hoe kan ik een zending aanmelden?',
    antwoord: 'U kunt eenvoudig online een offerte aanvragen via onze website. Na goedkeuring plannen wij de ophaling in op de door u gewenste datum.'
  }
];

export function FAQSection({ landNaam, customFaq }: FAQSectionProps) {
  const faqItems = customFaq && customFaq.length > 0 ? customFaq : DEFAULT_FAQ;
  
  // Generate land-specific FAQ items
  const landSpecificFaq: FAQItem[] = landNaam ? [
    {
      vraag: `Hoe vaak rijden jullie naar ${landNaam}?`,
      antwoord: `Wij rijden meerdere keren per week naar ${landNaam}. Afhankelijk van de bestemming kunnen wij vaak binnen 24-48 uur leveren.`
    },
    ...faqItems.slice(0, 5)
  ] : faqItems;

  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold">
            Veelgestelde vragen
          </h2>
          <p className="mt-2 text-muted-foreground">
            {landNaam 
              ? `Alles over koeriersdiensten naar ${landNaam}`
              : 'Alles wat u wilt weten over onze koeriersdiensten'
            }
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {landSpecificFaq.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-display font-semibold">
                  {item.vraag}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.antwoord}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* FAQ Schema for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": landSpecificFaq.map(item => ({
              "@type": "Question",
              "name": item.vraag,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.antwoord
              }
            }))
          })}
        </script>
      </div>
    </section>
  );
}
