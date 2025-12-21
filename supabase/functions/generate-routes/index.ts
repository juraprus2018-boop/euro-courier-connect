import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { stadId } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  console.log(`Generating routes for stad: ${stadId}`);

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
      // Call OSRM for distance
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${plaats.longitude},${plaats.latitude};${stad.longitude},${stad.latitude}?overview=false`;
      const response = await fetch(osrmUrl);
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const distanceKm = Math.round(data.routes[0].distance / 1000);
        const prijs = distanceKm * Number(stad.land.km_tarief);

        await supabase.from('routes').upsert({
          nl_plaats_id: plaats.id,
          buitenland_stad_id: stadId,
          afstand_km: distanceKm,
          geschatte_prijs: prijs,
          slug: `${slugify(plaats.naam)}-naar-${slugify(stad.naam)}`,
        }, { onConflict: 'nl_plaats_id,buitenland_stad_id' });

        generated++;
      }

      // Rate limit
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