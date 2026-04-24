import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Standaard verwacht IP (eigen server bij TransIP). Kan overschreven worden
// via de instelling `verwacht_server_ip` in de tabel `instellingen`, of
// via de body parameter `verwacht_ip`.
const DEFAULT_EXPECTED_IP = '136.144.162.73';

interface DnsAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DnsResponse {
  Status: number;
  Answer?: DnsAnswer[];
}

// Type 1 = A, 5 = CNAME, 16 = TXT
async function dnsLookup(name: string, type: 'A' | 'CNAME' | 'TXT'): Promise<DnsResponse> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`;
  const res = await fetch(url, { headers: { Accept: 'application/dns-json' } });
  if (!res.ok) throw new Error(`DNS lookup failed: ${res.status}`);
  return await res.json();
}

async function traceRedirects(url: string, maxHops = 5): Promise<{ chain: string[]; finalUrl: string; finalStatus: number; error?: string }> {
  const chain: string[] = [];
  let current = url;
  let finalStatus = 0;

  for (let i = 0; i < maxHops; i++) {
    chain.push(current);
    try {
      const res = await fetch(current, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0 (DomainCheck)' } });
      finalStatus = res.status;
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (!loc) break;
        current = loc.startsWith('http') ? loc : new URL(loc, current).toString();
      } else {
        return { chain, finalUrl: current, finalStatus };
      }
    } catch (e) {
      return { chain, finalUrl: current, finalStatus, error: (e as Error).message };
    }
  }
  return { chain, finalUrl: current, finalStatus };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domein } = await req.json();
    if (!domein) {
      return new Response(JSON.stringify({ error: 'Geen domein opgegeven' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cleanDomain = domein.replace(/^https?:\/\//, '').replace(/\/$/, '').trim().toLowerCase();
    const wwwDomain = cleanDomain.startsWith('www.') ? cleanDomain : `www.${cleanDomain}`;
    const apexDomain = cleanDomain.startsWith('www.') ? cleanDomain.slice(4) : cleanDomain;

    // Run all checks in parallel
    const [apexA, wwwA, apexCname, wwwCname, txtRecords, apexTrace, wwwTrace] = await Promise.all([
      dnsLookup(apexDomain, 'A').catch(() => null),
      dnsLookup(wwwDomain, 'A').catch(() => null),
      dnsLookup(apexDomain, 'CNAME').catch(() => null),
      dnsLookup(wwwDomain, 'CNAME').catch(() => null),
      dnsLookup(`_lovable.${apexDomain}`, 'TXT').catch(() => null),
      traceRedirects(`http://${apexDomain}`).catch((e) => ({ chain: [`http://${apexDomain}`], finalUrl: '', finalStatus: 0, error: e.message })),
      traceRedirects(`http://${wwwDomain}`).catch((e) => ({ chain: [`http://${wwwDomain}`], finalUrl: '', finalStatus: 0, error: e.message })),
    ]);

    const apexIps = apexA?.Answer?.filter(a => a.type === 1).map(a => a.data) ?? [];
    const wwwIps = wwwA?.Answer?.filter(a => a.type === 1).map(a => a.data) ?? [];
    const apexCnames = apexCname?.Answer?.filter(a => a.type === 5).map(a => a.data) ?? [];
    const wwwCnames = wwwCname?.Answer?.filter(a => a.type === 5).map(a => a.data) ?? [];
    const txt = txtRecords?.Answer?.filter(a => a.type === 16).map(a => a.data.replace(/^"|"$/g, '')) ?? [];

    const apexPointsToLovable = apexIps.includes(LOVABLE_IP);
    const wwwPointsToLovable = wwwIps.includes(LOVABLE_IP);
    const hasLovableTxt = txt.some(t => t.includes('lovable_verify') || t.includes('lovable'));

    // Determine effective destination
    const finalApexHost = apexTrace.finalUrl ? new URL(apexTrace.finalUrl).hostname : null;
    const finalWwwHost = wwwTrace.finalUrl ? new URL(wwwTrace.finalUrl).hostname : null;

    return new Response(JSON.stringify({
      domein: cleanDomain,
      apex: {
        host: apexDomain,
        ips: apexIps,
        cnames: apexCnames,
        pointsToLovable: apexPointsToLovable,
        redirectChain: apexTrace.chain,
        finalUrl: apexTrace.finalUrl,
        finalHost: finalApexHost,
        finalStatus: apexTrace.finalStatus,
        error: apexTrace.error,
      },
      www: {
        host: wwwDomain,
        ips: wwwIps,
        cnames: wwwCnames,
        pointsToLovable: wwwPointsToLovable,
        redirectChain: wwwTrace.chain,
        finalUrl: wwwTrace.finalUrl,
        finalHost: finalWwwHost,
        finalStatus: wwwTrace.finalStatus,
        error: wwwTrace.error,
      },
      verification: {
        txtRecords: txt,
        hasLovableTxt,
      },
      expectedIp: LOVABLE_IP,
      checkedAt: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
