import { useEffect } from 'react';
import { useLand } from '@/hooks/useLand';

interface LandThemeProviderProps {
  children: React.ReactNode;
}

export function LandThemeProvider({ children }: LandThemeProviderProps) {
  const { land } = useLand();

  useEffect(() => {
    if (!land) return;

    const root = document.documentElement;
    
    // Apply land-specific colors
    if (land.primary_color) {
      root.style.setProperty('--primary', land.primary_color);
      root.style.setProperty('--ring', land.primary_color);
      
      // Update gradient with new primary color
      const hslMatch = land.primary_color.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
      if (hslMatch) {
        const [, h, s, l] = hslMatch;
        const gradientPrimary = `linear-gradient(135deg, hsl(${h} ${s}% ${l}%) 0%, hsl(${parseInt(h) + 30} ${s}% ${parseInt(l) + 5}%) 100%)`;
        root.style.setProperty('--gradient-primary', gradientPrimary);
        
        const gradientDark = `linear-gradient(135deg, hsl(${h} 47% 11%) 0%, hsl(${h} 47% 18%) 100%)`;
        root.style.setProperty('--gradient-dark', gradientDark);
      }
    }
    
    if (land.secondary_color) {
      root.style.setProperty('--accent', land.secondary_color);
    }

    return () => {
      // Reset to defaults when unmounting or changing land
      root.style.removeProperty('--primary');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--gradient-primary');
      root.style.removeProperty('--gradient-dark');
    };
  }, [land]);

  return <>{children}</>;
}
