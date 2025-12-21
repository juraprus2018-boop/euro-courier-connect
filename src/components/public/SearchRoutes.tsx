import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SearchRoutes() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (from.trim() && to.trim()) {
      navigate(`/routes?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
      <Input
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        placeholder="Vertrekplaats (NL)"
        className="flex-1"
      />
      <Input
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="Bestemming"
        className="flex-1"
      />
      <Button type="submit" size="lg">
        <Search className="mr-2 h-4 w-4" />
        Zoeken
      </Button>
    </form>
  );
}