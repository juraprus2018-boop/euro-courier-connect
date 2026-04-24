import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { stadId } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  console.log(`Generating routes for stad: ${stadId}`);

  // Get settings from instellingen table
  const { data: instellingen } = await supabase
    .from('instellingen')
    .select('sleutel, waarde');

  const settings: Record<string, string> = {};
  instellingen?.forEach((item: { sleutel: string; waarde: string }) => {
    settings[item.sleutel] = item.waarde;
  });

  const kmTarief = parseFloat(settings.km_tarief || '0.50');
  const depotLat = parseFloat(settings.depot_latitude || '51.4386732');
  const depotLon = parseFloat(settings.depot_longitude || '5.5223595');

  console.log(`Settings: km_tarief=${kmTarief}, depot=${depotLat},${depotLon}`);

  // Get the city info
  const { data: stad } = await supabase
    .from('buitenland_steden')
    .select('*, land:landen(*)')
    .eq('id', stadId)
    .single();

  if (!stad) {
    return new Response(JSON.stringify({ error: 'Stad not found' }), { status: 404, headers: corsHeaders });
  }

  // Update status
  await supabase.from('buitenland_steden').update({ route_generatie_status: 'generating' }).eq('id', stadId);

  // Get all NL places
  const { data: nlPlaatsen } = await supabase.from('nl_plaatsen').select('*');

  const slugify = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  let generated = 0;

  for (const plaats of nlPlaatsen || []) {
    if (!plaats.latitude || !plaats.longitude || !stad.latitude || !stad.longitude) continue;

    try {
      // Route: Depot -> NL plaats (ophaal) -> Buitenland stad (bestemming) -> Depot
      // We need to calculate 3 segments:
      // 1. Depot to NL plaats
      // 2. NL plaats to Buitenland stad  
      // 3. Buitenland stad back to Depot
      
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${depotLon},${depotLat};${plaats.longitude},${plaats.latitude};${stad.longitude},${stad.latitude};${depotLon},${depotLat}?overview=false`;
      
      console.log(`Calculating route: Depot -> ${plaats.naam} -> ${stad.naam} -> Depot`);
      
      const response = await fetch(osrmUrl);
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        // Total distance for the complete round trip
        const totalDistanceKm = Math.round(data.routes[0].distance / 1000);
        const prijs = Math.round(totalDistanceKm * kmTarief);

        await supabase.from('routes').upsert({
          nl_plaats_id: plaats.id,
          buitenland_stad_id: stadId,
          afstand_km: totalDistanceKm,
          geschatte_prijs: prijs,
          slug: `${slugify(plaats.naam)}-naar-${slugify(stad.naam)}`,
        }, { onConflict: 'nl_plaats_id,buitenland_stad_id' });

        generated++;
        console.log(`Route generated: ${plaats.naam} -> ${stad.naam}: ${totalDistanceKm}km, €${prijs}`);
      }

      // Rate limit to avoid OSRM throttling
      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      console.error(`Error for ${plaats.naam}:`, err);
    }
  }

  await supabase.from('buitenland_steden').update({ route_generatie_status: 'completed' }).eq('id', stadId);

  console.log(`Generated ${generated} routes for ${stad.naam}`);

  return new Response(JSON.stringify({ success: true, generated }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
