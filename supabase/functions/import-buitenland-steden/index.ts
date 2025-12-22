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

// Map country names to GeoNames country codes
const countryCodeMap: Record<string, string> = {
  'frankrijk': 'FR',
  'france': 'FR',
  'duitsland': 'DE',
  'germany': 'DE',
  'belgie': 'BE',
  'belgium': 'BE',
  'belgië': 'BE',
  'spanje': 'ES',
  'spain': 'ES',
  'italie': 'IT',
  'italy': 'IT',
  'italië': 'IT',
  'portugal': 'PT',
  'oostenrijk': 'AT',
  'austria': 'AT',
  'zwitserland': 'CH',
  'switzerland': 'CH',
  'polen': 'PL',
  'poland': 'PL',
  'tsjechie': 'CZ',
  'tsjechië': 'CZ',
  'czechia': 'CZ',
  'denemarken': 'DK',
  'denmark': 'DK',
  'zweden': 'SE',
  'sweden': 'SE',
  'noorwegen': 'NO',
  'norway': 'NO',
  'finland': 'FI',
  'engeland': 'GB',
  'verenigd koninkrijk': 'GB',
  'united kingdom': 'GB',
  'ierland': 'IE',
  'ireland': 'IE',
  'luxemburg': 'LU',
  'luxembourg': 'LU',
  'griekenland': 'GR',
  'greece': 'GR',
  'hongarije': 'HU',
  'hungary': 'HU',
  'roemenie': 'RO',
  'roemenië': 'RO',
  'romania': 'RO',
  'bulgarije': 'BG',
  'bulgaria': 'BG',
  'kroatie': 'HR',
  'kroatië': 'HR',
  'croatia': 'HR',
  'slovenie': 'SI',
  'slovenië': 'SI',
  'slovenia': 'SI',
  'slowakije': 'SK',
  'slovakia': 'SK',
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

    // Get country code from name
    const countryCode = countryCodeMap[landNaam.toLowerCase()];
    
    if (!countryCode) {
      console.error(`Unknown country: ${landNaam}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Onbekend land: ${landNaam}. Voeg de landcode toe aan de mapping.`,
          supportedCountries: Object.keys(countryCodeMap).filter((_, i, arr) => arr.indexOf(arr[i]) === i)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Country code for ${landNaam}: ${countryCode}`);

    // Use GeoNames API to fetch cities (free API, no key needed for small requests)
    // We'll use the public search endpoint
    const geoNamesUrl = `http://api.geonames.org/searchJSON?country=${countryCode}&featureClass=P&featureCode=PPL&featureCode=PPLA&featureCode=PPLA2&featureCode=PPLA3&featureCode=PPLC&maxRows=1000&username=demo&orderby=population`;
    
    console.log(`Fetching cities from GeoNames...`);
    
    const response = await fetch(geoNamesUrl);
    
    if (!response.ok) {
      // Fallback: use alternative free API
      console.log('GeoNames failed, trying alternative approach...');
      
      // Use Nominatim OpenStreetMap API as fallback
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?country=${countryCode}&featuretype=city&format=json&limit=500&addressdetails=1`;
      
      const nominatimResponse = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'CourierApp/1.0'
        }
      });
      
      if (!nominatimResponse.ok) {
        throw new Error('Failed to fetch cities from both GeoNames and Nominatim');
      }
      
      const nominatimData = await nominatimResponse.json();
      console.log(`Found ${nominatimData.length} cities from Nominatim`);
      
      const cities = nominatimData.map((place: any) => ({
        naam: place.display_name.split(',')[0],
        slug: slugify(place.display_name.split(',')[0]),
        land_id: landId,
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        route_generatie_status: 'pending'
      }));
      
      // Filter duplicates by slug
      const seenSlugs = new Set<string>();
      const uniqueCities = cities.filter((city: any) => {
        if (seenSlugs.has(city.slug)) return false;
        seenSlugs.add(city.slug);
        return true;
      });
      
      // Upsert in batches
      const batchSize = 100;
      let insertedCount = 0;
      
      for (let i = 0; i < uniqueCities.length; i += batchSize) {
        const batch = uniqueCities.slice(i, i + batchSize);
        const { error } = await supabase
          .from('buitenland_steden')
          .upsert(batch, { onConflict: 'slug' });
        
        if (error) {
          console.error('Batch insert error:', error);
        } else {
          insertedCount += batch.length;
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `${insertedCount} steden geïmporteerd voor ${landNaam}`,
          count: insertedCount
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geoData = await response.json();
    
    if (geoData.status) {
      console.error('GeoNames error:', geoData.status.message);
      throw new Error(geoData.status.message);
    }

    console.log(`Found ${geoData.geonames?.length || 0} cities from GeoNames`);

    const cities = (geoData.geonames || []).map((place: any) => ({
      naam: place.name,
      slug: slugify(place.name),
      land_id: landId,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lng),
      route_generatie_status: 'pending'
    }));

    // Filter duplicates by slug
    const seenSlugs = new Set<string>();
    const uniqueCities = cities.filter((city: any) => {
      if (seenSlugs.has(city.slug)) return false;
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
        console.log(`Inserted batch ${i / batchSize + 1}: ${batch.length} cities`);
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
