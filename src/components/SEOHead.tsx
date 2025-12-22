import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  landNaam?: string;
}

export function SEOHead({ title, description, landNaam }: SEOHeadProps) {
  const siteNaam = landNaam ? `De ${landNaam} Koerier` : 'De Europa Koerier';
  
  const defaultTitle = landNaam 
    ? `${siteNaam} - Koerier naar ${landNaam} | Dagelijkse ritten`
    : 'De Europa Koerier - Betrouwbare koeriersdiensten door Europa';
    
  const defaultDescription = landNaam
    ? `Professionele koeriersdienst van Nederland naar ${landNaam}. Dagelijks op pad, snelle levering, 100% verzekerd. Vraag direct een offerte aan!`
    : 'Professioneel transport van Nederland naar heel Europa. Dagelijks op pad voor uw zendingen. Betrouwbaar, snel en betaalbaar.';

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
    </Helmet>
  );
}
