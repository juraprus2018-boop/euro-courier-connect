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
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Country name for Overpass: ${countryName}`);

    // Use Overpass API (OpenStreetMap) - completely free, no limits for reasonable use
    // Query for cities and towns with population data
    const overpassQuery = `
      [out:json][timeout:60];
      area["name"="${countryName}"]["admin_level"="2"]->.country;
      (
        node["place"="city"](area.country);
        node["place"="town"](area.country);
      );
      out center;
    `;
    
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    
    console.log(`Fetching cities from Overpass API...`);
    
    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Overpass API error:', errorText);
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const overpassData = await response.json();
    
    console.log(`Found ${overpassData.elements?.length || 0} places from Overpass`);

    if (!overpassData.elements || overpassData.elements.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Geen steden gevonden voor ${landNaam}. Probeer het later opnieuw.`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
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
