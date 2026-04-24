import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

// Top 10 grootste steden in Nederland met coördinaten
const top10NederlandseSteden = [
  { naam: "Amsterdam", gemeente: "Amsterdam", provincie: "Noord-Holland", latitude: 52.3676, longitude: 4.9041 },
  { naam: "Rotterdam", gemeente: "Rotterdam", provincie: "Zuid-Holland", latitude: 51.9225, longitude: 4.4792 },
  { naam: "Den Haag", gemeente: "'s-Gravenhage", provincie: "Zuid-Holland", latitude: 52.0705, longitude: 4.3007 },
  { naam: "Utrecht", gemeente: "Utrecht", provincie: "Utrecht", latitude: 52.0907, longitude: 5.1214 },
  { naam: "Eindhoven", gemeente: "Eindhoven", provincie: "Noord-Brabant", latitude: 51.4416, longitude: 5.4697 },
  { naam: "Groningen", gemeente: "Groningen", provincie: "Groningen", latitude: 53.2194, longitude: 6.5665 },
  { naam: "Tilburg", gemeente: "Tilburg", provincie: "Noord-Brabant", latitude: 51.5555, longitude: 5.0913 },
  { naam: "Almere", gemeente: "Almere", provincie: "Flevoland", latitude: 52.3508, longitude: 5.2647 },
  { naam: "Breda", gemeente: "Breda", provincie: "Noord-Brabant", latitude: 51.5719, longitude: 4.7683 },
  { naam: "Nijmegen", gemeente: "Nijmegen", provincie: "Gelderland", latitude: 51.8126, longitude: 5.8372 },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  console.log('Starting NL places import - clearing existing and importing top 10...');

  try {
    // Stap 1: Verwijder alle bestaande plaatsen
    console.log('Clearing all existing nl_plaatsen...');
    const { error: deleteError } = await supabase
      .from('nl_plaatsen')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('Error clearing plaatsen:', deleteError);
      throw new Error(`Fout bij legen plaatsen: ${deleteError.message}`);
    }
    console.log('All existing plaatsen cleared');

    // Stap 2: Importeer top 10 steden
    const plaatsenToInsert = top10NederlandseSteden.map(stad => ({
      naam: stad.naam,
      slug: slugify(stad.naam),
      gemeente: stad.gemeente,
      provincie: stad.provincie,
      latitude: stad.latitude,
      longitude: stad.longitude,
    }));

    console.log('Inserting top 10 cities:', plaatsenToInsert.map(p => p.naam).join(', '));

    const { error: insertError } = await supabase
      .from('nl_plaatsen')
      .upsert(plaatsenToInsert, { 
        onConflict: 'slug',
        ignoreDuplicates: false 
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error(`Fout bij importeren: ${insertError.message}`);
    }

    console.log('Import complete: 10 cities imported');

    return new Response(JSON.stringify({ 
      success: true, 
      imported: 10,
      cleared: true,
      cities: plaatsenToInsert.map(p => p.naam)
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
