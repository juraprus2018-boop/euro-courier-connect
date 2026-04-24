import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, CheckCircle, LucideIcon } from 'lucide-react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { SEOHead } from '@/components/SEOHead';
import { SpoedKoerierSection } from '@/components/public/SpoedKoerierSection';
import { PageBreadcrumb } from '@/components/public/PageBreadcrumb';
import { Button } from '@/components/ui/button';
import { CONTACT } from '@/lib/contact';

interface ServicePageLayoutProps {
  metaTitle: string;
  metaDescription: string;
  badge: string;
  title: string;
  intro: string;
  icon: LucideIcon;
  features: { title: string; description: string }[];
  children?: ReactNode;
}

export function ServicePageLayout({
  metaTitle,
  metaDescription,
  badge,
  title,
  intro,
  icon: Icon,
  features,
  children,
}: ServicePageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title={metaTitle} description={metaDescription} />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-gradient-dark text-primary-foreground py-20">
          <div className="container">
            <PageBreadcrumb
              items={[
                { label: 'Diensten' },
                { label: title },
              ]}
              className="mb-6 text-primary-foreground/80 [&_a:hover]:text-primary-foreground [&_[aria-current]]:text-primary-foreground [&_svg]:text-primary-foreground/60"
            />
            <div className="max-w-3xl">
              <span className="inline-block text-accent font-semibold uppercase tracking-widest text-sm">
                {badge}
              </span>
              <h1 className="font-display text-4xl lg:text-5xl font-bold mt-3">{title}</h1>
              <p className="mt-6 text-lg text-primary-foreground/80">{intro}</p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                  <Link to="/offerte">
                    Offerte aanvragen
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <a href={CONTACT.telefoonHref}>
                    <Phone className="mr-2 h-5 w-5" />
                    {CONTACT.telefoon}
                  </a>
                </Button>
              </div>
            </div>

            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block opacity-10">
              <Icon className="h-72 w-72" />
            </div>
          </div>
        </section>

        {/* Spoed banner */}
        <SpoedKoerierSection />

        {/* Features */}
        <section className="py-16">
          <div className="container max-w-5xl">
            <h2 className="font-display text-3xl font-bold text-center">
              Waarom kiezen voor onze {badge.toLowerCase()}?
            </h2>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex gap-4 p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
                >
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                    <p className="mt-1 text-muted-foreground">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Extra content */}
        {children && (
          <section className="py-16 bg-muted/40">
            <div className="container max-w-3xl prose prose-neutral">
              {children}
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="py-16">
          <div className="container max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold">Direct contact?</h2>
            <p className="mt-3 text-muted-foreground">
              Bel of mail ons voor een passende offerte op maat.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild>
                <a href={CONTACT.telefoonHref}>
                  <Phone className="mr-2 h-5 w-5" />
                  {CONTACT.telefoon}
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/offerte">Offerte aanvragen</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
