import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl font-bold">Contact</h1>
            <p className="mt-2 text-muted-foreground">
              Neem contact met ons op voor vragen of een persoonlijk advies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">Telefoon</h3>
                    <p className="text-muted-foreground mt-1">+31 6 1234 5678</p>
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
                    <p className="text-muted-foreground mt-1">info@koerier.nl</p>
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
                    <p className="text-muted-foreground mt-1">Nederland</p>
                    <p className="text-sm text-muted-foreground">Landelijke dekking</p>
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