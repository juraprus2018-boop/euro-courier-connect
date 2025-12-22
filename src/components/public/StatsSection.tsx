const stats = [
  { value: '15+', label: 'Jaar ervaring' },
  { value: '25+', label: 'Landen bereik' },
  { value: '50K+', label: 'Leveringen per jaar' },
  { value: '99%', label: 'Tevreden klanten' },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-gradient-dark">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className="text-center"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-accent">
                {stat.value}
              </div>
              <div className="mt-2 text-primary-foreground/70 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
