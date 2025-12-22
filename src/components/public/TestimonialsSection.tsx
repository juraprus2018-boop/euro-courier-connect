import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: 'Al jaren sturen we onze onderdelen via De Europa Koerier. Altijd op tijd, altijd betrouwbaar. Een echte aanrader!',
    author: 'Johan Vermeer',
    company: 'AutoParts B.V.',
    rating: 5,
  },
  {
    quote: 'De persoonlijke service maakt het verschil. Je spreekt altijd dezelfde mensen en ze denken echt mee met je.',
    author: 'Maria Jansen',
    company: 'Interiors & More',
    rating: 5,
  },
  {
    quote: 'Spoedzendingen zijn bij hen in goede handen. Vorige week nog binnen 18 uur in Kroatië afgeleverd!',
    author: 'Peter de Groot',
    company: 'Tech Solutions NL',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-muted/50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-semibold uppercase tracking-wider text-sm">Klantervaringen</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-4">
            Wat onze klanten zeggen
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.author}
              className="relative bg-card rounded-2xl p-8 border border-border"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Quote className="h-10 w-10 text-primary/20 absolute top-6 right-6" />
              
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                ))}
              </div>
              
              <blockquote className="text-lg text-foreground/90 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="mt-6 pt-6 border-t border-border">
                <div className="font-display font-semibold">{testimonial.author}</div>
                <div className="text-sm text-muted-foreground">{testimonial.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
