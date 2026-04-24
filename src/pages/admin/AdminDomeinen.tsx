import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, CheckCircle2, XCircle, AlertTriangle, ExternalLink, Globe, ArrowRight } from 'lucide-react';

interface Land {
  id: string;
  naam: string;
  domein: string | null;
  actief: boolean;
}

interface DomainCheck {
  domein: string;
  apex: {
    host: string;
    ips: string[];
    cnames: string[];
    pointsToServer: boolean;
    redirectChain: string[];
    finalUrl: string;
    finalHost: string | null;
    finalStatus: number;
    error?: string;
  };
  www: {
    host: string;
    ips: string[];
    cnames: string[];
    pointsToServer: boolean;
    redirectChain: string[];
    finalUrl: string;
    finalHost: string | null;
    finalStatus: number;
    error?: string;
  };
  expectedIp: string;
  checkedAt: string;
}

const DEFAULT_EXPECTED_IP = '136.144.162.73';

const AdminDomeinen = () => {
  const { toast } = useToast();
  const [landen, setLanden] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState<Record<string, DomainCheck | { error: string }>>({});
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [verwachtIp, setVerwachtIp] = useState<string>(DEFAULT_EXPECTED_IP);

  useEffect(() => {
    fetchLanden();
  }, []);

  const fetchLanden = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('landen')
      .select('id, naam, domein, actief')
      .order('naam');

    if (error) {
      toast({ title: 'Fout bij laden landen', variant: 'destructive' });
    } else {
      setLanden(data || []);
    }
    setLoading(false);
  };

  const checkDomain = async (land: Land) => {
    if (!land.domein) {
      toast({ title: `Geen domein ingesteld voor ${land.naam}`, variant: 'destructive' });
      return;
    }
    setCheckingId(land.id);
    const { data, error } = await supabase.functions.invoke('check-domain', {
      body: { domein: land.domein, verwacht_ip: verwachtIp || DEFAULT_EXPECTED_IP },
    });

    if (error) {
      setChecks(prev => ({ ...prev, [land.id]: { error: error.message } }));
      toast({ title: 'Check mislukt', description: error.message, variant: 'destructive' });
    } else {
      setChecks(prev => ({ ...prev, [land.id]: data }));
    }
    setCheckingId(null);
  };

  const checkAll = async () => {
    for (const land of landen.filter(l => l.domein)) {
      await checkDomain(land);
    }
    toast({ title: 'Alle domeinen gecheckt' });
  };

  const StatusBadge = ({ ok, label }: { ok: boolean; label: string }) => (
    <Badge variant={ok ? 'default' : 'destructive'} className="gap-1">
      {ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {label}
    </Badge>
  );

  const renderCheck = (land: Land) => {
    const result = checks[land.id];
    if (!result) return null;
    if ('error' in result) {
      return (
        <Alert variant="destructive" className="mt-3">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Fout</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      );
    }

    const expectedHost = result.domein;
    const apexEffective = result.apex.finalHost;
    const wwwEffective = result.www.finalHost;
    const apexResolvesToOwnDomain = apexEffective === expectedHost || apexEffective === `www.${expectedHost}`;
    const wwwResolvesToOwnDomain = wwwEffective === expectedHost || wwwEffective === `www.${expectedHost}`;

    return (
      <div className="mt-4 space-y-4">
        {/* Effective destination */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">EFFECTIEF DOELDOMEIN (wat bezoekers zien)</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono">{result.apex.host}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className={`font-mono font-semibold ${apexResolvesToOwnDomain ? 'text-success' : 'text-destructive'}`}>
                {apexEffective || '— (geen response)'}
              </span>
              {result.apex.finalStatus > 0 && (
                <Badge variant="outline" className="text-xs">{result.apex.finalStatus}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono">{result.www.host}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className={`font-mono font-semibold ${wwwResolvesToOwnDomain ? 'text-success' : 'text-destructive'}`}>
                {wwwEffective || '— (geen response)'}
              </span>
              {result.www.finalStatus > 0 && (
                <Badge variant="outline" className="text-xs">{result.www.finalStatus}</Badge>
              )}
            </div>
          </div>
          {(!apexResolvesToOwnDomain || !wwwResolvesToOwnDomain) && (
            <Alert variant="destructive" className="mt-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Domein redirect naar ander domein</AlertTitle>
              <AlertDescription>
                Bezoekers van {expectedHost} komen uit op een ander domein. Controleer de redirect-instellingen bij je domein-registrar.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* DNS Records */}
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">A-RECORD APEX ({result.apex.host})</span>
              <StatusBadge ok={result.apex.pointsToServer} label={result.apex.pointsToServer ? 'OK' : 'Verkeerd'} />
            </div>
            {result.apex.ips.length > 0 ? (
              <div className="space-y-1">
                {result.apex.ips.map(ip => (
                  <div key={ip} className="flex items-center gap-2 text-sm font-mono">
                    {ip === result.expectedIp ? (
                      <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                    ) : (
                      <XCircle className="h-3 w-3 text-destructive shrink-0" />
                    )}
                    {ip}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Geen A-record gevonden</p>
            )}
            {result.apex.cnames.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">CNAME: {result.apex.cnames.join(', ')}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">Verwacht: {result.expectedIp}</p>
          </div>

          <div className="p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">A-RECORD WWW ({result.www.host})</span>
              <StatusBadge ok={result.www.pointsToServer} label={result.www.pointsToServer ? 'OK' : 'Verkeerd'} />
            </div>
            {result.www.ips.length > 0 ? (
              <div className="space-y-1">
                {result.www.ips.map(ip => (
                  <div key={ip} className="flex items-center gap-2 text-sm font-mono">
                    {ip === result.expectedIp ? (
                      <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                    ) : (
                      <XCircle className="h-3 w-3 text-destructive shrink-0" />
                    )}
                    {ip}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Geen A-record gevonden</p>
            )}
            {result.www.cnames.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">CNAME: {result.www.cnames.join(', ')}</p>
            )}
          </div>
        </div>

        {/* Redirect chains */}
        {(result.apex.redirectChain.length > 1 || result.www.redirectChain.length > 1) && (
          <div className="p-3 rounded-lg border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">REDIRECT KETEN</p>
            {result.apex.redirectChain.length > 1 && (
              <div className="mb-3">
                <p className="text-xs font-semibold mb-1">{result.apex.host}</p>
                <div className="space-y-1">
                  {result.apex.redirectChain.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-muted-foreground">{i + 1}.</span>
                      <span className="break-all">{url}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.www.redirectChain.length > 1 && (
              <div>
                <p className="text-xs font-semibold mb-1">{result.www.host}</p>
                <div className="space-y-1">
                  {result.www.redirectChain.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-muted-foreground">{i + 1}.</span>
                      <span className="break-all">{url}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Gecheckt: {new Date(result.checkedAt).toLocaleString('nl-NL')}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Globe className="h-7 w-7" />
              Domein status
            </h1>
            <p className="text-muted-foreground mt-1">
              Controleer DNS, redirect-keten en effectief doeldomein per land
            </p>
          </div>
          <Button onClick={checkAll} disabled={checkingId !== null}>
            {checkingId !== null ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Check alle domeinen
          </Button>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Wat wordt gecontroleerd?</AlertTitle>
          <AlertDescription className="space-y-1 mt-2 text-sm">
            <p>• <strong>A-record</strong> apex en www moeten wijzen naar <code className="text-xs">185.158.133.1</code></p>
            <p>• <strong>TXT-record</strong> op <code className="text-xs">_lovable.domein</code> voor verificatie</p>
            <p>• <strong>Redirect-keten</strong> – waar bezoekers daadwerkelijk uitkomen</p>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {landen.filter(l => l.domein).map(land => (
            <Card key={land.id}>
              <CardHeader>
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {land.naam}
                      {!land.actief && <Badge variant="outline">Inactief</Badge>}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <a 
                        href={`https://${land.domein}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        {land.domein}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => checkDomain(land)}
                    disabled={checkingId === land.id}
                  >
                    {checkingId === land.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Check nu
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderCheck(land)}
              </CardContent>
            </Card>
          ))}

          {landen.filter(l => l.domein).length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Geen landen met domein ingesteld. Voeg een domein toe via Admin → Landen.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDomeinen;
