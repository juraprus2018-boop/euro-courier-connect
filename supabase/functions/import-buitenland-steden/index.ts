import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Map country names to ISO country codes for Overpass API
const countryCodeMap: Record<string, string> = {
  'frankrijk': 'France',
  'france': 'France',
  'duitsland': 'Germany',
  'germany': 'Germany',
  'belgie': 'Belgium',
  'belgium': 'Belgium',
  'belgië': 'Belgium',
  'spanje': 'Spain',
  'spain': 'Spain',
  'italie': 'Italy',
  'italy': 'Italy',
  'italië': 'Italy',
  'portugal': 'Portugal',
  'oostenrijk': 'Austria',
  'austria': 'Austria',
  'zwitserland': 'Switzerland',
  'switzerland': 'Switzerland',
  'polen': 'Poland',
  'poland': 'Poland',
  'tsjechie': 'Czechia',
  'tsjechië': 'Czechia',
  'czechia': 'Czechia',
  'denemarken': 'Denmark',
  'denmark': 'Denmark',
  'zweden': 'Sweden',
  'sweden': 'Sweden',
  'noorwegen': 'Norway',
  'norway': 'Norway',
  'finland': 'Finland',
  'engeland': 'United Kingdom',
  'verenigd koninkrijk': 'United Kingdom',
  'united kingdom': 'United Kingdom',
  'ierland': 'Ireland',
  'ireland': 'Ireland',
  'luxemburg': 'Luxembourg',
  'luxembourg': 'Luxembourg',
  'griekenland': 'Greece',
  'greece': 'Greece',
  'hongarije': 'Hungary',
  'hungary': 'Hungary',
  'roemenie': 'Romania',
  'roemenië': 'Romania',
  'romania': 'Romania',
  'bulgarije': 'Bulgaria',
  'bulgaria': 'Bulgaria',
  'kroatie': 'Croatia',
  'kroatië': 'Croatia',
  'croatia': 'Croatia',
  'slovenie': 'Slovenia',
  'slovenië': 'Slovenia',
  'slovenia': 'Slovenia',
  'slowakije': 'Slovakia',
  'slovakia': 'Slovakia',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { landId, landNaam } = await req.json();
    
    console.log(`Starting import for country: ${landNaam} (ID: ${landId})`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get country name for Overpass API
    const countryName = countryCodeMap[landNaam.toLowerCase()];
    
    if (!countryName) {
      console.error(`Unknown country: ${landNaam}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Onbekend land: ${landNaam}. Voeg de landcode toe aan de mapping.`,
          supportedCountries: [...new Set(Object.keys(countryCodeMap))]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Country name for Overpass: ${countryName}`);

    // Multiple Overpass API servers for fallback
    const overpassServers = [
      'https://overpass.kumi.systems/api/interpreter',
      'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
      'https://overpass-api.de/api/interpreter',
    ];

    // More reliable query: geocode the country into an area, then fetch cities/towns inside it.
    const overpassQuery = `
      [out:json][timeout:45];
      {{geocodeArea:${countryName}}}->.country;
      node["place"~"city|town"]["name"](area.country);
      out body;
    `;
    
    console.log(`Fetching cities from Overpass API...`);
    
    let overpassData = null;
    let lastError = null;

    // Try each server until one works
    for (const serverUrl of overpassServers) {
      try {
        console.log(`Trying Overpass server: ${serverUrl}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);
        
        const response = await fetch(serverUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `data=${encodeURIComponent(overpassQuery)}`,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          overpassData = await response.json();
          console.log(`Success with server: ${serverUrl}`);
          break;
        } else {
          lastError = `${serverUrl} returned ${response.status}`;
          console.log(`Server ${serverUrl} failed: ${response.status}`);
        }
      } catch (e) {
        lastError = e instanceof Error ? e.message : 'Unknown error';
        console.log(`Server ${serverUrl} error: ${lastError}`);
      }
    }

    if (!overpassData || !overpassData.elements) {
      console.error('All Overpass servers failed:', lastError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Kon steden niet ophalen. Alle servers zijn druk of niet bereikbaar. Probeer het over enkele minuten opnieuw.`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${overpassData.elements?.length || 0} places from Overpass`);

    if (overpassData.elements.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Geen steden gevonden voor ${landNaam}. Probeer het later opnieuw.`,
          hint: `Dit komt meestal door een drukke Overpass-server. Probeer opnieuw (eventueel een andere server) of probeer later.`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cities = overpassData.elements
      .filter((el: any) => el.tags?.name)
      .map((place: any) => ({
        naam: place.tags.name,
        slug: slugify(place.tags.name),
        land_id: landId,
        latitude: place.lat,
        longitude: place.lon,
        route_generatie_status: 'pending'
      }));

    // Filter duplicates by slug
    const seenSlugs = new Set<string>();
    const uniqueCities = cities.filter((city: any) => {
      if (!city.slug || seenSlugs.has(city.slug)) return false;
      seenSlugs.add(city.slug);
      return true;
    });

    console.log(`Unique cities after deduplication: ${uniqueCities.length}`);

    // Upsert in batches
    const batchSize = 100;
    let insertedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < uniqueCities.length; i += batchSize) {
      const batch = uniqueCities.slice(i, i + batchSize);
      const { error } = await supabase
        .from('buitenland_steden')
        .upsert(batch, { onConflict: 'slug' });
      
      if (error) {
        console.error('Batch insert error:', error);
        errorCount += batch.length;
      } else {
        insertedCount += batch.length;
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} cities`);
      }
    }

    console.log(`Import complete: ${insertedCount} cities inserted, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${insertedCount} steden geïmporteerd voor ${landNaam}`,
        count: insertedCount,
        errors: errorCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
