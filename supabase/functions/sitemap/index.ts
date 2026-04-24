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
    const url = new URL(req.url);
    // Allow ?host=dekroatiekoerier.nl override; otherwise derive from forwarded header
    const hostParam = url.searchParams.get("host");
    const forwardedHost =
      req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const host = (hostParam || forwardedHost).toLowerCase().replace(/^www\./, "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Detect land by host
    const { data: landen } = await supabase
      .from("landen")
      .select("*")
      .eq("actief", true);

    const land = landen?.find((l: any) => {
      if (!l.domein) return false;
      const d = l.domein
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/$/, "");
      return host === d || host.endsWith("." + d);
    });

    const baseUrl = `https://${host || "deeuropakoerier.nl"}`;
    const today = new Date().toISOString().split("T")[0];

    const urls: Array<{ loc: string; priority: string; changefreq: string }> = [];

    // Common static pages
    const staticPaths = [
      { p: "/", priority: "1.0", changefreq: "daily" },
      { p: "/bestemmingen", priority: "0.9", changefreq: "weekly" },
      { p: "/routes", priority: "0.9", changefreq: "weekly" },
      { p: "/offerte", priority: "0.8", changefreq: "monthly" },
      { p: "/contact", priority: "0.7", changefreq: "monthly" },
      { p: "/faq", priority: "0.6", changefreq: "monthly" },
      { p: "/internationaal-transport", priority: "0.7", changefreq: "monthly" },
      { p: "/kunsttransport", priority: "0.7", changefreq: "monthly" },
      { p: "/medisch-transport", priority: "0.7", changefreq: "monthly" },
      { p: "/on-board-koeriersdienst", priority: "0.7", changefreq: "monthly" },
      { p: "/algemene-voorwaarden", priority: "0.3", changefreq: "yearly" },
      { p: "/privacybeleid", priority: "0.3", changefreq: "yearly" },
    ];
    staticPaths.forEach((s) =>
      urls.push({ loc: `${baseUrl}${s.p}`, priority: s.priority, changefreq: s.changefreq })
    );

    if (land) {
      // Country-specific: bestemmingen + routes for this country
      const { data: steden } = await supabase
        .from("buitenland_steden")
        .select("slug, id")
        .eq("land_id", land.id);

      steden?.forEach((s: any) => {
        urls.push({
          loc: `${baseUrl}/bestemming/${s.slug}`,
          priority: "0.8",
          changefreq: "weekly",
        });
      });

      if (steden && steden.length > 0) {
        const { data: routes } = await supabase
          .from("routes")
          .select("slug")
          .in(
            "buitenland_stad_id",
            steden.map((s: any) => s.id)
          );
        routes?.forEach((r: any) => {
          urls.push({
            loc: `${baseUrl}/route/${r.slug}`,
            priority: "0.7",
            changefreq: "monthly",
          });
        });
      }
    } else {
      // Main site: include all destinations + a sample of routes
      const { data: steden } = await supabase
        .from("buitenland_steden")
        .select("slug")
        .limit(500);
      steden?.forEach((s: any) => {
        urls.push({
          loc: `${baseUrl}/bestemming/${s.slug}`,
          priority: "0.6",
          changefreq: "weekly",
        });
      });

      const { data: routes } = await supabase
        .from("routes")
        .select("slug")
        .limit(2000);
      routes?.forEach((r: any) => {
        urls.push({
          loc: `${baseUrl}/route/${r.slug}`,
          priority: "0.5",
          changefreq: "monthly",
        });
      });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Sitemap error:", err);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        headers: { ...corsHeaders, "Content-Type": "application/xml" },
      }
    );
  }
});
