import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { landId, action } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Handle stop action
  if (action === 'stop') {
    console.log(`Stopping sync for land: ${landId}`);
    await supabase.from('landen').update({ 
      sync_routes_status: 'stopped',
      sync_routes_last_message: 'Sync gestopt door gebruiker'
    }).eq('id', landId);
    
    return new Response(JSON.stringify({ success: true, message: 'Sync gestopt' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Handle clear routes action
  if (action === 'clear') {
    console.log(`Clearing all routes for land: ${landId}`);
    
    // Get all buitenland_steden for this land
    const { data: steden } = await supabase
      .from('buitenland_steden')
      .select('id')
      .eq('land_id', landId);
    
    if (steden && steden.length > 0) {
      const stadIds = steden.map(s => s.id);
      let totalDeleted = 0;
      
      // Delete in batches of 100 to avoid "Bad Request" errors
      const batchSize = 100;
      for (let i = 0; i < stadIds.length; i += batchSize) {
        const batch = stadIds.slice(i, i + batchSize);
        
        const { error: deleteError, count } = await supabase
          .from('routes')
          .delete({ count: 'exact' })
          .in('buitenland_stad_id', batch);
        
        if (deleteError) {
          console.error('Error deleting routes batch:', deleteError);
          // Continue with next batch instead of failing completely
        } else {
          totalDeleted += count || 0;
        }
      }
      
      // Reset sync status
      await supabase.from('landen').update({ 
        sync_routes_status: 'idle',
        sync_routes_progress: 0,
        sync_routes_total: 0,
        sync_routes_last_message: `${totalDeleted} routes verwijderd`
      }).eq('id', landId);
      
      console.log(`Deleted ${totalDeleted} routes for land ${landId}`);
      return new Response(JSON.stringify({ success: true, deleted: totalDeleted, message: `${totalDeleted} routes verwijderd` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ success: true, deleted: 0, message: 'Geen routes om te verwijderen' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log(`Starting sync routes for land: ${landId}`);

  // Get land info
  const { data: land, error: landError } = await supabase
    .from('landen')
    .select('*')
    .eq('id', landId)
    .single();

  if (landError || !land) {
    console.error('Land not found:', landError);
    return new Response(JSON.stringify({ error: 'Land niet gevonden' }), { 
      status: 404, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  // Get settings
  const { data: instellingen } = await supabase
    .from('instellingen')
    .select('sleutel, waarde');

  const settings: Record<string, string> = {};
  instellingen?.forEach((item: { sleutel: string; waarde: string }) => {
    settings[item.sleutel] = item.waarde;
  });

  const depotLat = parseFloat(settings.depot_latitude || '51.4386732');
  const depotLon = parseFloat(settings.depot_longitude || '5.5223595');
  const kmTarief = land.km_tarief || parseFloat(settings.km_tarief || '0.50');

  console.log(`Settings: km_tarief=${kmTarief}, depot=${depotLat},${depotLon}`);

  // Get all cities for this land that don't have routes yet or need updates
  const { data: steden, error: stedenError } = await supabase
    .from('buitenland_steden')
    .select('*')
    .eq('land_id', landId)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (stedenError) {
    console.error('Error fetching steden:', stedenError);
    return new Response(JSON.stringify({ error: 'Fout bij ophalen steden' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  // Get all NL places
  const { data: nlPlaatsen, error: nlError } = await supabase
    .from('nl_plaatsen')
    .select('*')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (nlError) {
    console.error('Error fetching NL plaatsen:', nlError);
    return new Response(JSON.stringify({ error: 'Fout bij ophalen NL plaatsen' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  const totalRoutes = (steden?.length || 0) * (nlPlaatsen?.length || 0);
  console.log(`Total routes to check: ${totalRoutes} (${steden?.length} steden x ${nlPlaatsen?.length} NL plaatsen)`);

  // Update status to running
  await supabase.from('landen').update({ 
    sync_routes_status: 'running',
    sync_routes_progress: 0,
    sync_routes_total: totalRoutes,
    sync_routes_last_message: 'Routes worden gegenereerd...'
  }).eq('id', landId);

  const slugify = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  let generated = 0;
  let skipped = 0;
  let errors = 0;
  let progress = 0;

  for (const stad of steden || []) {
    // Check if sync was stopped
    const { data: currentLand } = await supabase
      .from('landen')
      .select('sync_routes_status')
      .eq('id', landId)
      .single();
    
    if (currentLand?.sync_routes_status === 'stopped') {
      console.log('Sync stopped by user');
      const message = `Gestopt: ${generated} nieuwe routes, ${skipped} al bestaand, ${errors} fouten`;
      await supabase.from('landen').update({ 
        sync_routes_progress: progress,
        sync_routes_last_run: new Date().toISOString(),
        sync_routes_last_message: message
      }).eq('id', landId);
      
      return new Response(JSON.stringify({ 
        success: true, 
        stopped: true,
        generated, 
        skipped, 
        errors,
        message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    for (const plaats of nlPlaatsen || []) {
      progress++;

      // Update progress every 50 routes
      if (progress % 50 === 0) {
        await supabase.from('landen').update({ 
          sync_routes_progress: progress,
          sync_routes_last_message: `Bezig: ${progress}/${totalRoutes} (${generated} nieuw, ${skipped} bestaand)`
        }).eq('id', landId);
      }

      try {
        // Check if route already exists
        const { data: existingRoute } = await supabase
          .from('routes')
          .select('id')
          .eq('nl_plaats_id', plaats.id)
          .eq('buitenland_stad_id', stad.id)
          .maybeSingle();

        if (existingRoute) {
          skipped++;
          continue;
        }

        // Calculate route using OSRM
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${depotLon},${depotLat};${plaats.longitude},${plaats.latitude};${stad.longitude},${stad.latitude};${depotLon},${depotLat}?overview=false`;
        
        const response = await fetch(osrmUrl);
        const data = await response.json();

        if (data.routes && data.routes[0]) {
          const totalDistanceKm = Math.round(data.routes[0].distance / 1000);
          const prijs = Math.round(totalDistanceKm * kmTarief);

          const { error: insertError } = await supabase.from('routes').insert({
            nl_plaats_id: plaats.id,
            buitenland_stad_id: stad.id,
            afstand_km: totalDistanceKm,
            geschatte_prijs: prijs,
            slug: `${slugify(plaats.naam)}-naar-${slugify(stad.naam)}`,
          });

          if (insertError) {
            // If duplicate error, just skip
            if (insertError.code === '23505') {
              skipped++;
            } else {
              console.error('Insert error:', insertError);
              errors++;
            }
          } else {
            generated++;
          }
        }

        // Rate limit to avoid OSRM throttling
        await new Promise(r => setTimeout(r, 100));
      } catch (err) {
        console.error(`Error for ${plaats.naam} -> ${stad.naam}:`, err);
        errors++;
      }
    }
  }

  // Update final status
  const message = `Klaar: ${generated} nieuwe routes, ${skipped} al bestaand, ${errors} fouten`;
  console.log(message);

  await supabase.from('landen').update({ 
    sync_routes_status: 'completed',
    sync_routes_progress: totalRoutes,
    sync_routes_last_run: new Date().toISOString(),
    sync_routes_last_message: message
  }).eq('id', landId);

  return new Response(JSON.stringify({ 
    success: true, 
    generated, 
    skipped, 
    errors,
    message 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
