import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Reusable breadcrumb for all public pages.
 * Always prepends "Home" (/) automatically.
 * Renders BreadcrumbList JSON-LD for SEO.
 */
export function PageBreadcrumb({ items, className = '' }: PageBreadcrumbProps) {
  const allItems: BreadcrumbItem[] = [{ label: 'Home', to: '/' }, ...items];
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      ...(item.to ? { item: `${origin}${item.to}` } : {}),
    })),
  };

  return (
    <nav
      aria-label="Kruimelpad"
      className={`flex items-center flex-wrap gap-1.5 text-sm text-muted-foreground ${className}`}
    >
      {allItems.map((item, idx) => {
        const isLast = idx === allItems.length - 1;
        return (
          <Fragment key={`${item.label}-${idx}`}>
            {idx > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
            )}
            {isLast || !item.to ? (
              <span
                className="font-medium text-foreground inline-flex items-center gap-1"
                aria-current={isLast ? 'page' : undefined}
              >
                {idx === 0 && <Home className="h-3.5 w-3.5" aria-hidden="true" />}
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                {idx === 0 && <Home className="h-3.5 w-3.5" aria-hidden="true" />}
                {item.label}
              </Link>
            )}
          </Fragment>
        );
      })}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  );
}
