import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { PageBreadcrumb } from '@/components/public/PageBreadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock, Building2 } from 'lucide-react';
import { CONTACT } from '@/lib/contact';
import { SEOHead } from '@/components/SEOHead';

const ContactPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title="Contact | De Europa Koerier" description="Neem contact op met De Europa Koerier in Eindhoven. Bel 085 7602 999 of mail naar info@deeuropakoerier.nl." />
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <PageBreadcrumb items={[{ label: 'Contact' }]} className="mb-6" />
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl font-bold">Contact</h1>
            <p className="mt-2 text-muted-foreground">
              Neem contact met ons op voor vragen of een persoonlijk advies.
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg">Hoofdkantoor</h2>
                  <p className="text-muted-foreground mt-1">
                    {CONTACT.adres}<br />
                    {CONTACT.postcode}, {CONTACT.plaats}
                  </p>
                  <p className="text-sm text-muted-foreground mt-3">
                    BTW: {CONTACT.btw}<br />
                    KvK: {CONTACT.kvk}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">Telefoonnummer</h3>
                    <a href={CONTACT.telefoonHref} className="text-muted-foreground mt-1 block hover:text-foreground transition-colors">
                      {CONTACT.telefoon}
                    </a>
                    <p className="text-sm text-muted-foreground">Ma-Vr: 08:00 - 18:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">E-mail</h3>
                    <a href={CONTACT.emailHref} className="text-muted-foreground mt-1 block hover:text-foreground transition-colors break-all">
                      {CONTACT.email}
                    </a>
                    <p className="text-sm text-muted-foreground">Reactie binnen 24 uur</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">Adres</h3>
                    <p className="text-muted-foreground mt-1">
                      {CONTACT.adres}<br />
                      {CONTACT.postcode} {CONTACT.plaats}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">Openingstijden</h3>
                    <p className="text-muted-foreground mt-1">Ma-Vr: 08:00 - 18:00</p>
                    <p className="text-sm text-muted-foreground">Za: 09:00 - 14:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
