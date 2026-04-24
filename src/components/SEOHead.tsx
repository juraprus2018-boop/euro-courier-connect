import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  landNaam?: string;
  canonicalPath?: string;
  noindex?: boolean;
}

export function SEOHead({ title, description, landNaam, canonicalPath, noindex }: SEOHeadProps) {
  const siteNaam = landNaam ? `De ${landNaam} Koerier` : 'De Europa Koerier';

  const defaultTitle = landNaam
    ? `Spoedkoerier ${landNaam} | ${siteNaam} - Dagelijks op pad`
    : 'Spoedkoerier Europa | De Europa Koerier - Snel & betrouwbaar';

  const defaultDescription = landNaam
    ? `Spoedkoerier van Nederland naar ${landNaam}. Direct van A naar B, 24/7 beschikbaar, 100% verzekerd. Vraag nu een offerte aan!`
    : 'Spoedkoerier door heel Europa. Direct transport van Nederland naar uw bestemming. 24/7 beschikbaar, 100% verzekerd, dagelijks op pad.';

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;

  // Build canonical URL based on current host
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const path = canonicalPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const canonicalUrl = `${origin}${path}`;

  return (
    <Helmet>
      <html lang="nl" />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteNaam} />
      <meta property="og:locale" content="nl_NL" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
    </Helmet>
  );
}
