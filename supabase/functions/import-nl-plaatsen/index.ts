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

  console.log('Starting NL places import from PDOK Locatieserver...');

  try {
    // Use PDOK Locatieserver to get all woonplaatsen
    // Total is about 2500 places, we fetch in batches of 100 (API max)
    const allPlaatsen: any[] = [];
    let start = 0;
    const rows = 100;
    let hasMore = true;

    while (hasMore) {
      // Properly encode the query parameter
      const baseUrl = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/free';
      const params = new URLSearchParams({
        q: 'type:woonplaats',
        rows: rows.toString(),
        start: start.toString()
      });
      const url = `${baseUrl}?${params.toString()}`;
      
      console.log(`Fetching woonplaatsen, start=${start}, url=${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        const text = await response.text();
        console.error(`PDOK error response: ${text}`);
        throw new Error(`PDOK request failed: ${response.status}`);
      }

      const data = await response.json();
      const docs = data.response?.docs || [];
      
      console.log(`Fetched ${docs.length} woonplaatsen at offset ${start}`);
      
      if (docs.length === 0) {
        hasMore = false;
      } else {
        allPlaatsen.push(...docs);
        start += rows;
        
        // Stop when we've fetched all
        if (docs.length < rows) {
          hasMore = false;
        }
        
        // Small delay between requests
        await new Promise(r => setTimeout(r, 100));
      }
    }

    console.log(`Total woonplaatsen fetched: ${allPlaatsen.length}`);

    let imported = 0;
    let errors = 0;
    const seen = new Set<string>();

    // Process in batches
    const batchSize = 100;
    
    for (let i = 0; i < allPlaatsen.length; i += batchSize) {
      const batch = allPlaatsen.slice(i, i + batchSize);
      
      const plaatsenToInsert = batch.map((doc: any) => {
        const naam = doc.woonplaatsnaam;
        if (!naam) return null;
        
        const slug = slugify(naam);
        
        // Skip duplicates
        if (seen.has(slug)) return null;
        seen.add(slug);

        // Parse coordinates from centroide_ll (format: "POINT(lon lat)")
        let lat = null;
        let lon = null;
        
        if (doc.centroide_ll) {
          const match = doc.centroide_ll.match(/POINT\(([^ ]+) ([^)]+)\)/);
          if (match) {
            lon = parseFloat(match[1]);
            lat = parseFloat(match[2]);
          }
        }

        return {
          naam: naam,
          slug: slug,
          gemeente: doc.gemeentenaam || null,
          provincie: doc.provincienaam || null,
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
    }

    console.log(`Import complete: ${imported} unique places imported, ${errors} batch errors`);

    return new Response(JSON.stringify({ 
      success: true, 
      imported,
      total: allPlaatsen.length,
      unique: seen.size,
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
