import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Globe, MapPin, Route, FileText, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    landen: 0,
    nlPlaatsen: 0,
    buitenlandSteden: 0,
    routes: 0,
    aanvragen: 0,
    nieuweAanvragen: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: landenCount },
        { count: nlPlaatsenCount },
        { count: buitenlandStedenCount },
        { count: routesCount },
        { count: aanvragenCount },
        { count: nieuweAanvragenCount },
      ] = await Promise.all([
        supabase.from('landen').select('*', { count: 'exact', head: true }),
        supabase.from('nl_plaatsen').select('*', { count: 'exact', head: true }),
        supabase.from('buitenland_steden').select('*', { count: 'exact', head: true }),
        supabase.from('routes').select('*', { count: 'exact', head: true }),
        supabase.from('aanvragen').select('*', { count: 'exact', head: true }),
        supabase.from('aanvragen').select('*', { count: 'exact', head: true }).eq('status', 'nieuw'),
      ]);

      setStats({
        landen: landenCount || 0,
        nlPlaatsen: nlPlaatsenCount || 0,
        buitenlandSteden: buitenlandStedenCount || 0,
        routes: routesCount || 0,
        aanvragen: aanvragenCount || 0,
        nieuweAanvragen: nieuweAanvragenCount || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Landen', value: stats.landen, icon: Globe, color: 'bg-primary/10 text-primary' },
    { label: 'NL Plaatsen', value: stats.nlPlaatsen, icon: MapPin, color: 'bg-accent/10 text-accent' },
    { label: 'Buitenlandse Steden', value: stats.buitenlandSteden, icon: MapPin, color: 'bg-success/10 text-success' },
    { label: 'Routes', value: stats.routes, icon: Route, color: 'bg-primary/10 text-primary' },
    { label: 'Aanvragen', value: stats.aanvragen, icon: FileText, color: 'bg-accent/10 text-accent' },
    { label: 'Nieuwe Aanvragen', value: stats.nieuweAanvragen, icon: FileText, color: 'bg-warning/10 text-warning' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overzicht van uw koeriersplatform.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-display text-3xl font-bold">{stat.value.toLocaleString('nl-NL')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;