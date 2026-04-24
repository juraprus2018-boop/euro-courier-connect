import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const forwardedFor = req.headers.get("x-forwarded-for") || "";
    const ip = forwardedFor.split(",")[0].trim() || req.headers.get("x-real-ip") || null;
    const userAgent = req.headers.get("user-agent") || null;
    const referer = req.headers.get("referer") || body.referer || null;
    const host = (body.host || "").toLowerCase().replace(/^www\./, "") || null;

    let landId: string | null = body.land_id ?? null;
    let landNaam: string | null = body.land_naam ?? null;

    if (!landId && host) {
      const { data: landen } = await supabase
        .from("landen")
        .select("id, naam, domein")
        .eq("actief", true);
      const match = landen?.find((l: any) => {
        if (!l.domein) return false;
        const d = l.domein
          .toLowerCase()
          .replace(/^https?:\/\//, "")
          .replace(/^www\./, "")
          .replace(/\/$/, "");
        return host === d || host.endsWith("." + d);
      });
      if (match) {
        landId = match.id;
        landNaam = match.naam;
      }
    }

    const { error } = await supabase.from("prijsberekeningen").insert({
      host,
      land_id: landId,
      land_naam: landNaam,
      ophaal_adres: body.ophaal_adres ?? null,
      aflever_adres: body.aflever_adres ?? null,
      pickup_lat: body.pickup_lat ?? null,
      pickup_lng: body.pickup_lng ?? null,
      destination_lat: body.destination_lat ?? null,
      destination_lng: body.destination_lng ?? null,
      afstand_km: body.afstand_km ?? null,
      rijtijd_minuten: body.rijtijd_minuten ?? null,
      km_tarief: body.km_tarief ?? null,
      berekende_prijs: body.berekende_prijs ?? null,
      ip_adres: ip,
      user_agent: userAgent,
      referer,
    });

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("log-prijsberekening error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
