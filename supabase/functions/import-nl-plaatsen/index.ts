import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const slugify = (text: string) => 
  text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  console.log('Starting NL places import from PDOK...');

  try {
    // PDOK WFS service for woonplaatsen (residential places)
    // This returns all official Dutch place names with coordinates
    const pdokUrl = 'https://service.pdok.nl/kadaster/bestuurlijkegebieden/wfs/v1_0?' +
      'service=WFS&version=2.0.0&request=GetFeature&' +
      'typeName=bestuurlijkegebieden:Gemeentegebied&' +
      'outputFormat=application/json&srsName=EPSG:4326';

    console.log('Fetching gemeenten from PDOK...');
    const gemeenteResponse = await fetch(pdokUrl);
    
    if (!gemeenteResponse.ok) {
      throw new Error(`PDOK gemeente request failed: ${gemeenteResponse.status}`);
    }

    const gemeenteData = await gemeenteResponse.json();
    console.log(`Fetched ${gemeenteData.features?.length || 0} gemeenten`);

    // Now fetch woonplaatsen (actual place names)
    const woonplaatsenUrl = 'https://service.pdok.nl/lv/bag/wfs/v1_0?' +
      'service=WFS&version=2.0.0&request=GetFeature&' +
      'typeName=bag:woonplaats&' +
      'outputFormat=application/json&srsName=EPSG:4326&' +
      'count=10000';

    console.log('Fetching woonplaatsen from PDOK BAG...');
    const woonplaatsenResponse = await fetch(woonplaatsenUrl);
    
    if (!woonplaatsenResponse.ok) {
      throw new Error(`PDOK woonplaatsen request failed: ${woonplaatsenResponse.status}`);
    }

    const woonplaatsenData = await woonplaatsenResponse.json();
    const features = woonplaatsenData.features || [];
    console.log(`Fetched ${features.length} woonplaatsen`);

    let imported = 0;
    let errors = 0;

    // Process in batches to avoid timeout
    const batchSize = 100;
    
    for (let i = 0; i < features.length; i += batchSize) {
      const batch = features.slice(i, i + batchSize);
      
      const plaatsenToInsert = batch.map((feature: any) => {
        const naam = feature.properties?.woonplaatsNaam || feature.properties?.naam;
        if (!naam) return null;

        // Get centroid from geometry
        let lat = null;
        let lon = null;
        
        if (feature.geometry) {
          if (feature.geometry.type === 'Point') {
            [lon, lat] = feature.geometry.coordinates;
          } else if (feature.geometry.type === 'MultiPolygon' || feature.geometry.type === 'Polygon') {
            // Calculate centroid for polygons
            const coords = feature.geometry.type === 'MultiPolygon' 
              ? feature.geometry.coordinates[0][0] 
              : feature.geometry.coordinates[0];
            
            if (coords && coords.length > 0) {
              let sumLon = 0, sumLat = 0;
              for (const coord of coords) {
                sumLon += coord[0];
                sumLat += coord[1];
              }
              lon = sumLon / coords.length;
              lat = sumLat / coords.length;
            }
          }
        }

        return {
          naam: naam,
          slug: slugify(naam),
          gemeente: feature.properties?.gemeenteNaam || null,
          provincie: feature.properties?.provincieNaam || null,
          latitude: lat,
          longitude: lon,
        };
      }).filter(Boolean);

      if (plaatsenToInsert.length > 0) {
        const { error } = await supabase
          .from('nl_plaatsen')
          .upsert(plaatsenToInsert, { 
            onConflict: 'slug',
            ignoreDuplicates: true 
          });

        if (error) {
          console.error(`Batch error at ${i}:`, error);
          errors++;
        } else {
          imported += plaatsenToInsert.length;
        }
      }

      // Small delay to prevent rate limiting
      if (i + batchSize < features.length) {
        await new Promise(r => setTimeout(r, 50));
      }
    }

    console.log(`Import complete: ${imported} places imported, ${errors} errors`);

    return new Response(JSON.stringify({ 
      success: true, 
      imported,
      total: features.length,
      errors 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Import error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
