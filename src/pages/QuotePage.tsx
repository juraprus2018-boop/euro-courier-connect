import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { QuoteForm } from '@/components/public/QuoteForm';
import { PageBreadcrumb } from '@/components/public/PageBreadcrumb';

const QuotePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container max-w-3xl">
          <PageBreadcrumb items={[{ label: 'Offerte aanvragen' }]} className="mb-6" />
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold">Offerte aanvragen</h1>
            <p className="mt-2 text-muted-foreground">
              Vul het formulier in en ontvang binnen 1 uur een vrijblijvende offerte.
            </p>
          </div>

          <QuoteForm />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuotePage;
