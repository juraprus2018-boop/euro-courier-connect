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

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  console.log('Starting NL places import...');

  // Sample Dutch cities - in production, fetch from CBS API
  const plaatsen = [
    { naam: 'Amsterdam', gemeente: 'Amsterdam', provincie: 'Noord-Holland', lat: 52.3676, lon: 4.9041 },
    { naam: 'Rotterdam', gemeente: 'Rotterdam', provincie: 'Zuid-Holland', lat: 51.9244, lon: 4.4777 },
    { naam: 'Den Haag', gemeente: "'s-Gravenhage", provincie: 'Zuid-Holland', lat: 52.0705, lon: 4.3007 },
    { naam: 'Utrecht', gemeente: 'Utrecht', provincie: 'Utrecht', lat: 52.0907, lon: 5.1214 },
    { naam: 'Eindhoven', gemeente: 'Eindhoven', provincie: 'Noord-Brabant', lat: 51.4416, lon: 5.4697 },
    { naam: 'Groningen', gemeente: 'Groningen', provincie: 'Groningen', lat: 53.2194, lon: 6.5665 },
    { naam: 'Tilburg', gemeente: 'Tilburg', provincie: 'Noord-Brabant', lat: 51.5555, lon: 5.0913 },
    { naam: 'Almere', gemeente: 'Almere', provincie: 'Flevoland', lat: 52.3508, lon: 5.2647 },
    { naam: 'Breda', gemeente: 'Breda', provincie: 'Noord-Brabant', lat: 51.5719, lon: 4.7683 },
    { naam: 'Nijmegen', gemeente: 'Nijmegen', provincie: 'Gelderland', lat: 51.8426, lon: 5.8546 },
    { naam: 'Apeldoorn', gemeente: 'Apeldoorn', provincie: 'Gelderland', lat: 52.2112, lon: 5.9699 },
    { naam: 'Haarlem', gemeente: 'Haarlem', provincie: 'Noord-Holland', lat: 52.3874, lon: 4.6462 },
    { naam: 'Arnhem', gemeente: 'Arnhem', provincie: 'Gelderland', lat: 51.9851, lon: 5.8987 },
    { naam: 'Enschede', gemeente: 'Enschede', provincie: 'Overijssel', lat: 52.2215, lon: 6.8937 },
    { naam: 'Amersfoort', gemeente: 'Amersfoort', provincie: 'Utrecht', lat: 52.1561, lon: 5.3878 },
    { naam: 'Zaanstad', gemeente: 'Zaanstad', provincie: 'Noord-Holland', lat: 52.4559, lon: 4.8286 },
    { naam: "'s-Hertogenbosch", gemeente: "'s-Hertogenbosch", provincie: 'Noord-Brabant', lat: 51.6998, lon: 5.3049 },
    { naam: 'Zwolle', gemeente: 'Zwolle', provincie: 'Overijssel', lat: 52.5168, lon: 6.0830 },
    { naam: 'Maastricht', gemeente: 'Maastricht', provincie: 'Limburg', lat: 50.8514, lon: 5.6910 },
    { naam: 'Leiden', gemeente: 'Leiden', provincie: 'Zuid-Holland', lat: 52.1601, lon: 4.4970 },
  ];

  const slugify = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  for (const plaats of plaatsen) {
    const { error } = await supabase.from('nl_plaatsen').upsert({
      naam: plaats.naam,
      slug: slugify(plaats.naam),
      gemeente: plaats.gemeente,
      provincie: plaats.provincie,
      latitude: plaats.lat,
      longitude: plaats.lon,
    }, { onConflict: 'slug' });

    if (error) console.error(`Error inserting ${plaats.naam}:`, error);
  }

  console.log(`Imported ${plaatsen.length} places`);

  return new Response(JSON.stringify({ success: true, count: plaatsen.length }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});