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

// Top 10 largest cities per country (by population)
const top10CitiesByCountry: Record<string, { name: string; lat: number; lon: number }[]> = {
  France: [
    { name: 'Paris', lat: 48.8566, lon: 2.3522 },
    { name: 'Marseille', lat: 43.2965, lon: 5.3698 },
    { name: 'Lyon', lat: 45.7640, lon: 4.8357 },
    { name: 'Toulouse', lat: 43.6047, lon: 1.4442 },
    { name: 'Nice', lat: 43.7102, lon: 7.2620 },
    { name: 'Nantes', lat: 47.2184, lon: -1.5536 },
    { name: 'Montpellier', lat: 43.6108, lon: 3.8767 },
    { name: 'Strasbourg', lat: 48.5734, lon: 7.7521 },
    { name: 'Bordeaux', lat: 44.8378, lon: -0.5792 },
    { name: 'Lille', lat: 50.6292, lon: 3.0573 },
  ],
  Germany: [
    { name: 'Berlin', lat: 52.5200, lon: 13.4050 },
    { name: 'Hamburg', lat: 53.5511, lon: 9.9937 },
    { name: 'München', lat: 48.1351, lon: 11.5820 },
    { name: 'Köln', lat: 50.9375, lon: 6.9603 },
    { name: 'Frankfurt am Main', lat: 50.1109, lon: 8.6821 },
    { name: 'Stuttgart', lat: 48.7758, lon: 9.1829 },
    { name: 'Düsseldorf', lat: 51.2277, lon: 6.7735 },
    { name: 'Leipzig', lat: 51.3397, lon: 12.3731 },
    { name: 'Dortmund', lat: 51.5136, lon: 7.4653 },
    { name: 'Essen', lat: 51.4556, lon: 7.0116 },
  ],
  Belgium: [
    { name: 'Brussel', lat: 50.8503, lon: 4.3517 },
    { name: 'Antwerpen', lat: 51.2194, lon: 4.4025 },
    { name: 'Gent', lat: 51.0543, lon: 3.7174 },
    { name: 'Charleroi', lat: 50.4108, lon: 4.4446 },
    { name: 'Luik', lat: 50.6326, lon: 5.5797 },
    { name: 'Brugge', lat: 51.2093, lon: 3.2247 },
    { name: 'Namen', lat: 50.4674, lon: 4.8720 },
    { name: 'Leuven', lat: 50.8798, lon: 4.7005 },
    { name: 'Mechelen', lat: 51.0259, lon: 4.4776 },
    { name: 'Aalst', lat: 50.9369, lon: 4.0355 },
  ],
  Spain: [
    { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
    { name: 'Barcelona', lat: 41.3851, lon: 2.1734 },
    { name: 'Valencia', lat: 39.4699, lon: -0.3763 },
    { name: 'Sevilla', lat: 37.3891, lon: -5.9845 },
    { name: 'Zaragoza', lat: 41.6488, lon: -0.8891 },
    { name: 'Málaga', lat: 36.7213, lon: -4.4214 },
    { name: 'Murcia', lat: 37.9922, lon: -1.1307 },
    { name: 'Palma de Mallorca', lat: 39.5696, lon: 2.6502 },
    { name: 'Las Palmas', lat: 28.1235, lon: -15.4363 },
    { name: 'Bilbao', lat: 43.2630, lon: -2.9350 },
  ],
  Italy: [
    { name: 'Rome', lat: 41.9028, lon: 12.4964 },
    { name: 'Milaan', lat: 45.4642, lon: 9.1900 },
    { name: 'Napels', lat: 40.8518, lon: 14.2681 },
    { name: 'Turijn', lat: 45.0703, lon: 7.6869 },
    { name: 'Palermo', lat: 38.1157, lon: 13.3615 },
    { name: 'Genua', lat: 44.4056, lon: 8.9463 },
    { name: 'Bologna', lat: 44.4949, lon: 11.3426 },
    { name: 'Florence', lat: 43.7696, lon: 11.2558 },
    { name: 'Catania', lat: 37.5079, lon: 15.0830 },
    { name: 'Venetië', lat: 45.4408, lon: 12.3155 },
  ],
  Portugal: [
    { name: 'Lissabon', lat: 38.7223, lon: -9.1393 },
    { name: 'Porto', lat: 41.1579, lon: -8.6291 },
    { name: 'Vila Nova de Gaia', lat: 41.1239, lon: -8.6118 },
    { name: 'Braga', lat: 41.5518, lon: -8.4229 },
    { name: 'Amadora', lat: 38.7597, lon: -9.2395 },
    { name: 'Almada', lat: 38.6790, lon: -9.1565 },
    { name: 'Coimbra', lat: 40.2033, lon: -8.4103 },
    { name: 'Funchal', lat: 32.6669, lon: -16.9241 },
    { name: 'Setúbal', lat: 38.5244, lon: -8.8882 },
    { name: 'Aveiro', lat: 40.6405, lon: -8.6538 },
  ],
  Austria: [
    { name: 'Wenen', lat: 48.2082, lon: 16.3738 },
    { name: 'Graz', lat: 47.0707, lon: 15.4395 },
    { name: 'Linz', lat: 48.3069, lon: 14.2858 },
    { name: 'Salzburg', lat: 47.8095, lon: 13.0550 },
    { name: 'Innsbruck', lat: 47.2692, lon: 11.4041 },
    { name: 'Klagenfurt', lat: 46.6247, lon: 14.3053 },
    { name: 'Villach', lat: 46.6103, lon: 13.8558 },
    { name: 'Wels', lat: 48.1575, lon: 14.0289 },
    { name: 'Sankt Pölten', lat: 48.2047, lon: 15.6256 },
    { name: 'Dornbirn', lat: 47.4125, lon: 9.7417 },
  ],
  Switzerland: [
    { name: 'Zürich', lat: 47.3769, lon: 8.5417 },
    { name: 'Genève', lat: 46.2044, lon: 6.1432 },
    { name: 'Basel', lat: 47.5596, lon: 7.5886 },
    { name: 'Lausanne', lat: 46.5197, lon: 6.6323 },
    { name: 'Bern', lat: 46.9480, lon: 7.4474 },
    { name: 'Winterthur', lat: 47.5001, lon: 8.7500 },
    { name: 'Luzern', lat: 47.0502, lon: 8.3093 },
    { name: 'St. Gallen', lat: 47.4245, lon: 9.3767 },
    { name: 'Lugano', lat: 46.0037, lon: 8.9511 },
    { name: 'Biel', lat: 47.1368, lon: 7.2467 },
  ],
  Poland: [
    { name: 'Warschau', lat: 52.2297, lon: 21.0122 },
    { name: 'Krakau', lat: 50.0647, lon: 19.9450 },
    { name: 'Łódź', lat: 51.7592, lon: 19.4560 },
    { name: 'Wrocław', lat: 51.1079, lon: 17.0385 },
    { name: 'Poznań', lat: 52.4064, lon: 16.9252 },
    { name: 'Gdańsk', lat: 54.3520, lon: 18.6466 },
    { name: 'Szczecin', lat: 53.4285, lon: 14.5528 },
    { name: 'Bydgoszcz', lat: 53.1235, lon: 18.0084 },
    { name: 'Lublin', lat: 51.2465, lon: 22.5684 },
    { name: 'Katowice', lat: 50.2649, lon: 19.0238 },
  ],
  Czechia: [
    { name: 'Praag', lat: 50.0755, lon: 14.4378 },
    { name: 'Brno', lat: 49.1951, lon: 16.6068 },
    { name: 'Ostrava', lat: 49.8209, lon: 18.2625 },
    { name: 'Plzeň', lat: 49.7384, lon: 13.3736 },
    { name: 'Liberec', lat: 50.7663, lon: 15.0543 },
    { name: 'Olomouc', lat: 49.5938, lon: 17.2509 },
    { name: 'České Budějovice', lat: 48.9745, lon: 14.4743 },
    { name: 'Hradec Králové', lat: 50.2104, lon: 15.8252 },
    { name: 'Ústí nad Labem', lat: 50.6607, lon: 14.0323 },
    { name: 'Pardubice', lat: 50.0343, lon: 15.7812 },
  ],
  Denmark: [
    { name: 'Kopenhagen', lat: 55.6761, lon: 12.5683 },
    { name: 'Aarhus', lat: 56.1629, lon: 10.2039 },
    { name: 'Odense', lat: 55.4038, lon: 10.4024 },
    { name: 'Aalborg', lat: 57.0488, lon: 9.9217 },
    { name: 'Frederiksberg', lat: 55.6786, lon: 12.5251 },
    { name: 'Esbjerg', lat: 55.4670, lon: 8.4519 },
    { name: 'Randers', lat: 56.4607, lon: 10.0367 },
    { name: 'Kolding', lat: 55.4904, lon: 9.4722 },
    { name: 'Horsens', lat: 55.8607, lon: 9.8503 },
    { name: 'Vejle', lat: 55.7113, lon: 9.5364 },
  ],
  Sweden: [
    { name: 'Stockholm', lat: 59.3293, lon: 18.0686 },
    { name: 'Göteborg', lat: 57.7089, lon: 11.9746 },
    { name: 'Malmö', lat: 55.6049, lon: 13.0038 },
    { name: 'Uppsala', lat: 59.8586, lon: 17.6389 },
    { name: 'Västerås', lat: 59.6099, lon: 16.5448 },
    { name: 'Örebro', lat: 59.2753, lon: 15.2134 },
    { name: 'Linköping', lat: 58.4108, lon: 15.6214 },
    { name: 'Helsingborg', lat: 56.0465, lon: 12.6945 },
    { name: 'Jönköping', lat: 57.7826, lon: 14.1618 },
    { name: 'Norrköping', lat: 58.5877, lon: 16.1924 },
  ],
  Norway: [
    { name: 'Oslo', lat: 59.9139, lon: 10.7522 },
    { name: 'Bergen', lat: 60.3913, lon: 5.3221 },
    { name: 'Trondheim', lat: 63.4305, lon: 10.3951 },
    { name: 'Stavanger', lat: 58.9700, lon: 5.7331 },
    { name: 'Drammen', lat: 59.7440, lon: 10.2045 },
    { name: 'Fredrikstad', lat: 59.2181, lon: 10.9298 },
    { name: 'Kristiansand', lat: 58.1599, lon: 8.0182 },
    { name: 'Sandnes', lat: 58.8521, lon: 5.7352 },
    { name: 'Tromsø', lat: 69.6492, lon: 18.9553 },
    { name: 'Sarpsborg', lat: 59.2839, lon: 11.1097 },
  ],
  Finland: [
    { name: 'Helsinki', lat: 60.1699, lon: 24.9384 },
    { name: 'Espoo', lat: 60.2055, lon: 24.6559 },
    { name: 'Tampere', lat: 61.4978, lon: 23.7610 },
    { name: 'Vantaa', lat: 60.2934, lon: 25.0378 },
    { name: 'Turku', lat: 60.4518, lon: 22.2666 },
    { name: 'Oulu', lat: 65.0121, lon: 25.4651 },
    { name: 'Lahti', lat: 60.9827, lon: 25.6612 },
    { name: 'Kuopio', lat: 62.8924, lon: 27.6770 },
    { name: 'Jyväskylä', lat: 62.2426, lon: 25.7473 },
    { name: 'Pori', lat: 61.4851, lon: 21.7974 },
  ],
  'United Kingdom': [
    { name: 'Londen', lat: 51.5074, lon: -0.1278 },
    { name: 'Birmingham', lat: 52.4862, lon: -1.8904 },
    { name: 'Manchester', lat: 53.4808, lon: -2.2426 },
    { name: 'Liverpool', lat: 53.4084, lon: -2.9916 },
    { name: 'Leeds', lat: 53.8008, lon: -1.5491 },
    { name: 'Glasgow', lat: 55.8642, lon: -4.2518 },
    { name: 'Edinburgh', lat: 55.9533, lon: -3.1883 },
    { name: 'Bristol', lat: 51.4545, lon: -2.5879 },
    { name: 'Sheffield', lat: 53.3811, lon: -1.4701 },
    { name: 'Newcastle', lat: 54.9783, lon: -1.6178 },
  ],
  Ireland: [
    { name: 'Dublin', lat: 53.3498, lon: -6.2603 },
    { name: 'Cork', lat: 51.8985, lon: -8.4756 },
    { name: 'Limerick', lat: 52.6638, lon: -8.6267 },
    { name: 'Galway', lat: 53.2707, lon: -9.0568 },
    { name: 'Waterford', lat: 52.2593, lon: -7.1101 },
    { name: 'Drogheda', lat: 53.7189, lon: -6.3478 },
    { name: 'Dundalk', lat: 54.0027, lon: -6.4180 },
    { name: 'Swords', lat: 53.4597, lon: -6.2181 },
    { name: 'Bray', lat: 53.2009, lon: -6.0987 },
    { name: 'Navan', lat: 53.6527, lon: -6.6816 },
  ],
  Luxembourg: [
    { name: 'Luxemburg', lat: 49.6116, lon: 6.1319 },
    { name: 'Esch-sur-Alzette', lat: 49.4958, lon: 5.9806 },
    { name: 'Differdange', lat: 49.5242, lon: 5.8914 },
    { name: 'Dudelange', lat: 49.4806, lon: 6.0875 },
    { name: 'Ettelbruck', lat: 49.8475, lon: 6.1044 },
    { name: 'Diekirch', lat: 49.8678, lon: 6.1558 },
    { name: 'Wiltz', lat: 49.9686, lon: 5.9331 },
    { name: 'Echternach', lat: 49.8114, lon: 6.4217 },
    { name: 'Rumelange', lat: 49.4597, lon: 6.0311 },
    { name: 'Grevenmacher', lat: 49.6747, lon: 6.4411 },
  ],
  Greece: [
    { name: 'Athene', lat: 37.9838, lon: 23.7275 },
    { name: 'Thessaloniki', lat: 40.6401, lon: 22.9444 },
    { name: 'Patras', lat: 38.2466, lon: 21.7346 },
    { name: 'Heraklion', lat: 35.3387, lon: 25.1442 },
    { name: 'Larissa', lat: 39.6390, lon: 22.4191 },
    { name: 'Volos', lat: 39.3666, lon: 22.9507 },
    { name: 'Ioannina', lat: 39.6650, lon: 20.8537 },
    { name: 'Chania', lat: 35.5138, lon: 24.0180 },
    { name: 'Chalcis', lat: 38.4633, lon: 23.5947 },
    { name: 'Agrinio', lat: 38.6218, lon: 21.4073 },
  ],
  Hungary: [
    { name: 'Boedapest', lat: 47.4979, lon: 19.0402 },
    { name: 'Debrecen', lat: 47.5316, lon: 21.6273 },
    { name: 'Szeged', lat: 46.2530, lon: 20.1414 },
    { name: 'Miskolc', lat: 48.1035, lon: 20.7784 },
    { name: 'Pécs', lat: 46.0727, lon: 18.2323 },
    { name: 'Győr', lat: 47.6875, lon: 17.6504 },
    { name: 'Nyíregyháza', lat: 47.9495, lon: 21.7244 },
    { name: 'Kecskemét', lat: 46.9062, lon: 19.6913 },
    { name: 'Székesfehérvár', lat: 47.1860, lon: 18.4221 },
    { name: 'Szombathely', lat: 47.2307, lon: 16.6218 },
  ],
  Romania: [
    { name: 'Boekarest', lat: 44.4268, lon: 26.1025 },
    { name: 'Cluj-Napoca', lat: 46.7712, lon: 23.6236 },
    { name: 'Timișoara', lat: 45.7489, lon: 21.2087 },
    { name: 'Iași', lat: 47.1585, lon: 27.6014 },
    { name: 'Constanța', lat: 44.1598, lon: 28.6348 },
    { name: 'Craiova', lat: 44.3302, lon: 23.7949 },
    { name: 'Brașov', lat: 45.6427, lon: 25.5887 },
    { name: 'Galați', lat: 45.4353, lon: 28.0080 },
    { name: 'Ploiești', lat: 44.9462, lon: 26.0306 },
    { name: 'Oradea', lat: 47.0465, lon: 21.9189 },
  ],
  Bulgaria: [
    { name: 'Sofia', lat: 42.6977, lon: 23.3219 },
    { name: 'Plovdiv', lat: 42.1354, lon: 24.7453 },
    { name: 'Varna', lat: 43.2141, lon: 27.9147 },
    { name: 'Burgas', lat: 42.5048, lon: 27.4626 },
    { name: 'Ruse', lat: 43.8356, lon: 25.9657 },
    { name: 'Stara Zagora', lat: 42.4258, lon: 25.6345 },
    { name: 'Pleven', lat: 43.4170, lon: 24.6067 },
    { name: 'Sliven', lat: 42.6817, lon: 26.3292 },
    { name: 'Dobrich', lat: 43.5667, lon: 27.8333 },
    { name: 'Shumen', lat: 43.2712, lon: 26.9361 },
  ],
  Croatia: [
    { name: 'Zagreb', lat: 45.8150, lon: 15.9819 },
    { name: 'Split', lat: 43.5081, lon: 16.4402 },
    { name: 'Rijeka', lat: 45.3271, lon: 14.4422 },
    { name: 'Osijek', lat: 45.5511, lon: 18.6939 },
    { name: 'Zadar', lat: 44.1194, lon: 15.2314 },
    { name: 'Pula', lat: 44.8666, lon: 13.8496 },
    { name: 'Slavonski Brod', lat: 45.1603, lon: 18.0156 },
    { name: 'Karlovac', lat: 45.4929, lon: 15.5553 },
    { name: 'Varaždin', lat: 46.3057, lon: 16.3366 },
    { name: 'Šibenik', lat: 43.7350, lon: 15.8952 },
  ],
  Slovenia: [
    { name: 'Ljubljana', lat: 46.0569, lon: 14.5058 },
    { name: 'Maribor', lat: 46.5547, lon: 15.6459 },
    { name: 'Celje', lat: 46.2286, lon: 15.2602 },
    { name: 'Kranj', lat: 46.2386, lon: 14.3556 },
    { name: 'Velenje', lat: 46.3594, lon: 15.1108 },
    { name: 'Koper', lat: 45.5469, lon: 13.7294 },
    { name: 'Novo Mesto', lat: 45.8042, lon: 15.1689 },
    { name: 'Ptuj', lat: 46.4200, lon: 15.8700 },
    { name: 'Trbovlje', lat: 46.1528, lon: 15.0536 },
    { name: 'Kamnik', lat: 46.2256, lon: 14.6119 },
  ],
  Slovakia: [
    { name: 'Bratislava', lat: 48.1486, lon: 17.1077 },
    { name: 'Košice', lat: 48.7164, lon: 21.2611 },
    { name: 'Prešov', lat: 48.9986, lon: 21.2391 },
    { name: 'Žilina', lat: 49.2231, lon: 18.7394 },
    { name: 'Banská Bystrica', lat: 48.7395, lon: 19.1530 },
    { name: 'Nitra', lat: 48.3069, lon: 18.0864 },
    { name: 'Trnava', lat: 48.3774, lon: 17.5883 },
    { name: 'Martin', lat: 49.0636, lon: 18.9214 },
    { name: 'Trenčín', lat: 48.8945, lon: 18.0442 },
    { name: 'Poprad', lat: 49.0600, lon: 20.2975 },
  ],
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

    console.log(`Country name: ${countryName}`);

    // Get top 10 cities for this country
    const cities = top10CitiesByCountry[countryName];
    
    if (!cities || cities.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Geen steden gevonden voor ${landNaam}. Voeg steden toe aan de top10 lijst.`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Importing ${cities.length} top cities for ${countryName}`);

    const cityData = cities.map((city) => ({
      naam: city.name,
      slug: slugify(city.name),
      land_id: landId,
      latitude: city.lat,
      longitude: city.lon,
      route_generatie_status: 'pending'
    }));

    // Upsert cities
    const { error } = await supabase
      .from('buitenland_steden')
      .upsert(cityData, { onConflict: 'land_id,slug' });
    
    if (error) {
      console.error('Insert error:', error);
      return new Response(
        JSON.stringify({ success: false, error: `Fout bij importeren: ${error.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Import complete: ${cities.length} cities imported for ${landNaam}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${cities.length} steden geïmporteerd voor ${landNaam} (top 10 grootste steden)`,
        count: cities.length
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
