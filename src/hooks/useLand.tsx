import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Land {
  id: string;
  naam: string;
  slug: string;
  domein: string | null;
  km_tarief: number;
  actief: boolean;
}

export function useLand() {
  const [land, setLand] = useState<Land | null>(null);
  const [isHoofdsite, setIsHoofdsite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectLand = async () => {
      const hostname = window.location.hostname;
      
      // Check if this is the main admin site
      const hoofdsiteDomeinen = [
        'deeuropakoerier.nl',
        'www.deeuropakoerier.nl',
        'localhost',
        'lovableproject.com'
      ];
      
      const isHoofd = hoofdsiteDomeinen.some(d => hostname.includes(d));
      setIsHoofdsite(isHoofd);
      
      if (isHoofd) {
        setLoading(false);
        return;
      }
      
      // Try to find matching land by domain
      const { data } = await supabase
        .from('landen')
        .select('*')
        .eq('actief', true);
      
      if (data) {
        const matchedLand = data.find(l => 
          l.domein && hostname.includes(l.domein.replace('www.', '').replace('https://', ''))
        );
        
        if (matchedLand) {
          setLand(matchedLand);
        }
      }
      
      setLoading(false);
    };

    detectLand();
  }, []);

  return { land, isHoofdsite, loading };
}
