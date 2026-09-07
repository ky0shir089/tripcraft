import { TripPlan, DayItinerary, TravelStyle, PaceType } from '@/types/trip';
import { GenerateTripRequest, DestinationEntity } from '../types';
import { destinationRepository } from '../repositories/destinationRepository';
import { calculateBudget, generateAlternativeScenarios } from '../engines/budget';
import { getCityWeatherForecast } from '../engines/weather';
import { buildDayItinerary } from '../engines/itinerary';
import { generateGeminiText } from '../services/gemini';

// Dictionary of verified popular places for cities outside default dataset
const KNOWN_POPULAR_CITY_PLACES: Record<string, DestinationEntity[]> = {
  surabaya: [
    {
      id: 'sub-tugu-pahlawan',
      name: 'Tugu Pahlawan & Museum Sepuluh Nopember',
      city: 'Surabaya',
      description: 'Monumen ikonik lambang keberanian arek-arek Suroboyo dalam pertempuran 10 November.',
      category: 'history',
      preferenceCategory: 'sejarah',
      latitude: -7.2458,
      longitude: 112.7378,
      estimatedDurationMinutes: 90,
      estimatedCost: 15000,
      openingTime: '08:00',
      closingTime: '16:00',
      indoor: false,
      outdoor: true,
      popularityScore: 95,
      experienceScore: 93,
      zone: 'central',
    },
    {
      id: 'sub-rawon-setan',
      name: 'Rawon Setan Embong Malang',
      city: 'Surabaya',
      description: 'Rawon legendaris kuah kluwek hitam pekat dengan potongan daging sapi besar empuk.',
      category: 'culinary',
      preferenceCategory: 'kuliner',
      latitude: -7.2618,
      longitude: 112.7423,
      estimatedDurationMinutes: 60,
      estimatedCost: 45000,
      openingTime: '08:00',
      closingTime: '23:00',
      indoor: true,
      outdoor: false,
      popularityScore: 96,
      experienceScore: 94,
      zone: 'central',
    },
    {
      id: 'sub-bebek-sinjay',
      name: 'Bebek Sinjay Tunjungan',
      city: 'Surabaya',
      description: 'Bebek goreng garing gurih dengan taburan kremes bumbu serundeng dan sambal pencit mangga.',
      category: 'culinary',
      preferenceCategory: 'kuliner',
      latitude: -7.2589,
      longitude: 112.7392,
      estimatedDurationMinutes: 60,
      estimatedCost: 40000,
      openingTime: '10:00',
      closingTime: '21:00',
      indoor: true,
      outdoor: false,
      popularityScore: 94,
      experienceScore: 92,
      zone: 'central',
    },
    {
      id: 'sub-monkasel',
      name: 'Monumen Kapal Selam (Monkasel)',
      city: 'Surabaya',
      description: 'Kapal selam tempur KRI Pasopati 410 asli buatan Soviet yang dijadikan museum edukatif.',
      category: 'culture',
      preferenceCategory: 'budaya',
      latitude: -7.2655,
      longitude: 112.7503,
      estimatedDurationMinutes: 75,
      estimatedCost: 20000,
      openingTime: '08:00',
      closingTime: '21:00',
      indoor: false,
      outdoor: false,
      popularityScore: 90,
      experienceScore: 89,
      zone: 'central',
    },
    {
      id: 'sub-suramadu',
      name: 'Jembatan Suramadu Viewpoint',
      city: 'Surabaya',
      description: 'Jembatan kabel pancang terpanjang di Indonesia yang menghubungkan Pulau Jawa dan Madura.',
      category: 'nature',
      preferenceCategory: 'alam',
      latitude: -7.1993,
      longitude: 112.7806,
      estimatedDurationMinutes: 90,
      estimatedCost: 15000,
      openingTime: '00:00',
      closingTime: '23:59',
      indoor: false,
      outdoor: true,
      popularityScore: 92,
      experienceScore: 90,
      zone: 'north',
    },
    {
      id: 'sub-spikoe',
      name: 'Pusat Oleh-Oleh Spikoe Resep Kuno',
      city: 'Surabaya',
      description: 'Lapis Surabaya legendaris dengan tekstur mentega lembut dan aroma rempah harum.',
      category: 'shopping',
      preferenceCategory: 'shopping',
      latitude: -7.2754,
      longitude: 112.7485,
      estimatedDurationMinutes: 60,
      estimatedCost: 100000,
      openingTime: '08:00',
      closingTime: '20:00',
      indoor: true,
      outdoor: false,
      popularityScore: 91,
      experienceScore: 90,
      zone: 'central',
    },
  ],
  semarang: [
    {
      id: 'smg-lawang-sewu',
      name: 'Lawang Sewu Heritage',
      city: 'Semarang',
      description: 'Gedung bersejarah megah bekas kantor kereta api Belanda dengan pintu dan kaca patri antik.',
      category: 'history',
      preferenceCategory: 'sejarah',
      latitude: -6.9839,
      longitude: 110.4103,
      estimatedDurationMinutes: 90,
      estimatedCost: 20000,
      openingTime: '08:00',
      closingTime: '20:00',
      indoor: false,
      outdoor: true,
      popularityScore: 97,
      experienceScore: 95,
      zone: 'central',
    },
    {
      id: 'smg-sam-poo-kong',
      name: 'Klenteng Agung Sam Poo Kong',
      city: 'Semarang',
      description: 'Situs petilasan Laksamana Cheng Ho berarsitektur megah Tiongkok perpaduan budaya Jawa.',
      category: 'culture',
      preferenceCategory: 'budaya',
      latitude: -6.9961,
      longitude: 110.3981,
      estimatedDurationMinutes: 80,
      estimatedCost: 35000,
      openingTime: '08:00',
      closingTime: '20:00',
      indoor: false,
      outdoor: true,
      popularityScore: 94,
      experienceScore: 92,
      zone: 'west',
    },
    {
      id: 'smg-kota-lama',
      name: 'Kota Lama Semarang & Gereja Blenduk',
      city: 'Semarang',
      description: 'Kawasan Little Netherlands dengan deretan gedung cagar budaya kolonial Eropa abad ke-18.',
      category: 'culture',
      preferenceCategory: 'budaya',
      latitude: -6.9682,
      longitude: 110.4277,
      estimatedDurationMinutes: 90,
      estimatedCost: 10000,
      openingTime: '00:00',
      closingTime: '23:59',
      indoor: false,
      outdoor: true,
      popularityScore: 96,
      experienceScore: 94,
      zone: 'central',
    },
    {
      id: 'smg-lumpia',
      name: 'Lumpia Gang Lombok No. 1',
      city: 'Semarang',
      description: 'Lumpia basah dan goreng isi rebung udang legendaris tertua di Semarang sejak abad ke-19.',
      category: 'culinary',
      preferenceCategory: 'kuliner',
      latitude: -6.9744,
      longitude: 110.4284,
      estimatedDurationMinutes: 50,
      estimatedCost: 30000,
      openingTime: '08:00',
      closingTime: '17:00',
      indoor: true,
      outdoor: false,
      popularityScore: 95,
      experienceScore: 93,
      zone: 'central',
    },
    {
      id: 'smg-soto-bangkong',
      name: 'Soto Bangkong Asli Semarang',
      city: 'Semarang',
      description: 'Soto ayam berkuah bening kecokelatan bumbu rempah bawang putih dan sate kerang gurih.',
      category: 'culinary',
      preferenceCategory: 'kuliner',
      latitude: -6.9939,
      longitude: 110.4312,
      estimatedDurationMinutes: 60,
      estimatedCost: 35000,
      openingTime: '07:00',
      closingTime: '22:00',
      indoor: true,
      outdoor: false,
      popularityScore: 92,
      experienceScore: 90,
      zone: 'central',
    },
    {
      id: 'smg-simpang-lima',
      name: 'Simpang Lima & Kuliner Tahu Pong',
      city: 'Semarang',
      description: 'Pusat landmark keramaian malam kota Semarang dengan sepeda hias dan aneka street food khas.',
      category: 'shopping',
      preferenceCategory: 'kuliner',
      latitude: -6.9904,
      longitude: 110.4229,
      estimatedDurationMinutes: 75,
      estimatedCost: 40000,
      openingTime: '16:00',
      closingTime: '23:59',
      indoor: false,
      outdoor: true,
      popularityScore: 93,
      experienceScore: 91,
      zone: 'central',
    },
  ],
  solo: [
    {
      id: 'slo-kraton',
      name: 'Keraton Surakarta Hadiningrat',
      city: 'Solo',
      description: 'Istana resmi Kasunanan Surakarta dengan museum pusaka kerajaan dan pohon beringin kembar.',
      category: 'culture',
      preferenceCategory: 'budaya',
      latitude: -7.5779,
      longitude: 110.8281,
      estimatedDurationMinutes: 90,
      estimatedCost: 20000,
      openingTime: '09:00',
      closingTime: '14:00',
      indoor: false,
      outdoor: true,
      popularityScore: 94,
      experienceScore: 92,
      zone: 'central',
    },
    {
      id: 'slo-pura-mangkunegaran',
      name: 'Pura Mangkunegaran Solo',
      city: 'Solo',
      description: 'Istana kadipaten bergaya Jawa-Eropa dengan pendopo joglo terbesar di Indonesia.',
      category: 'culture',
      preferenceCategory: 'budaya',
      latitude: -7.5667,
      longitude: 110.8228,
      estimatedDurationMinutes: 80,
      estimatedCost: 30000,
      openingTime: '08:30',
      closingTime: '15:00',
      indoor: false,
      outdoor: true,
      popularityScore: 93,
      experienceScore: 91,
      zone: 'central',
    },
    {
      id: 'slo-pasar-gede-timlo',
      name: 'Pasar Gede Harjonagoro & Timlo Sastro',
      city: 'Solo',
      description: 'Pasar bersejarah karya Thomas Karsten dengan kuliner timlo ayam sosis kuah bening segar.',
      category: 'culinary',
      preferenceCategory: 'kuliner',
      latitude: -7.5694,
      longitude: 110.8306,
      estimatedDurationMinutes: 75,
      estimatedCost: 35000,
      openingTime: '06:30',
      closingTime: '16:00',
      indoor: true,
      outdoor: false,
      popularityScore: 95,
      experienceScore: 93,
      zone: 'central',
    },
    {
      id: 'slo-laweyan',
      name: 'Kampung Batik Laweyan',
      city: 'Solo',
      description: 'Sentra perajin batik tertua dengan lorong sempit dinding tinggi arsitektur saudagar tempo dulu.',
      category: 'shopping',
      preferenceCategory: 'shopping',
      latitude: -7.5683,
      longitude: 110.7958,
      estimatedDurationMinutes: 90,
      estimatedCost: 50000,
      openingTime: '08:00',
      closingTime: '20:00',
      indoor: false,
      outdoor: true,
      popularityScore: 92,
      experienceScore: 90,
      zone: 'west',
    },
    {
      id: 'slo-serabi-notosuman',
      name: 'Serabi Notosuman Ny. Handayani',
      city: 'Solo',
      description: 'Serabi santan lembut bertepi renyah dengan rasa polos dan cokelat legendaris sejak 1923.',
      category: 'shopping',
      preferenceCategory: 'kuliner',
      latitude: -7.5756,
      longitude: 110.8197,
      estimatedDurationMinutes: 45,
      estimatedCost: 35000,
      openingTime: '06:00',
      closingTime: '18:00',
      indoor: true,
      outdoor: false,
      popularityScore: 96,
      experienceScore: 94,
      zone: 'central',
    },
  ],
  bogor: [
    {
      id: 'bgr-kebun-raya',
      name: 'Kebun Raya Bogor & Museum Zoologi',
      city: 'Bogor',
      description: 'Kebun botani tertua di Asia Tenggara seluas 87 hektar dengan Danau Gunting dan koleksi ribuan flora.',
      category: 'nature',
      preferenceCategory: 'alam',
      latitude: -6.5976,
      longitude: 106.7996,
      estimatedDurationMinutes: 120,
      estimatedCost: 25000,
      openingTime: '08:00',
      closingTime: '16:00',
      indoor: false,
      outdoor: true,
      popularityScore: 96,
      experienceScore: 94,
      zone: 'central',
    },
    {
      id: 'bgr-suryakencana',
      name: 'Wisata Kuliner Jalan Suryakencana & Soto Kuning',
      city: 'Bogor',
      description: 'Kawasan pecinan legendaris pusat kuliner soto kuning santan, sate sumsum, dan asinan khas Bogor.',
      category: 'culinary',
      preferenceCategory: 'kuliner',
      latitude: -6.6044,
      longitude: 106.8017,
      estimatedDurationMinutes: 75,
      estimatedCost: 50000,
      openingTime: '08:00',
      closingTime: '21:00',
      indoor: false,
      outdoor: true,
      popularityScore: 95,
      experienceScore: 93,
      zone: 'central',
    },
    {
      id: 'bgr-taman-safari',
      name: 'Taman Safari Indonesia Cisarua',
      city: 'Bogor',
      description: 'Konservasi satwa liar kelas dunia di kawasan Puncak berhawa sejuk pegunungan.',
      category: 'family',
      preferenceCategory: 'family',
      latitude: -6.7183,
      longitude: 106.9497,
      estimatedDurationMinutes: 180,
      estimatedCost: 225000,
      openingTime: '08:30',
      closingTime: '17:00',
      indoor: false,
      outdoor: true,
      popularityScore: 97,
      experienceScore: 95,
      zone: 'south',
    },
    {
      id: 'bgr-kopi-daong',
      name: 'Kopi Daong Pancawati',
      city: 'Bogor',
      description: 'Kedai kopi hits bernuansa alam di tengah rindangnya hutan pinus lereng Gunung Pangrango.',
      category: 'cafe',
      preferenceCategory: 'kuliner',
      latitude: -6.6892,
      longitude: 106.8778,
      estimatedDurationMinutes: 90,
      estimatedCost: 45000,
      openingTime: '09:00',
      closingTime: '21:00',
      indoor: false,
      outdoor: true,
      popularityScore: 92,
      experienceScore: 91,
      zone: 'south',
    },
    {
      id: 'bgr-roti-unyil',
      name: 'Roti Unyil Venus Pajajaran',
      city: 'Bogor',
      description: 'Oleh-oleh ikonik roti mini aneka rasa jagung manis, sosis keju, dan cokelat legendaris sejak 1992.',
      category: 'shopping',
      preferenceCategory: 'shopping',
      latitude: -6.6111,
      longitude: 106.8122,
      estimatedDurationMinutes: 50,
      estimatedCost: 60000,
      openingTime: '06:00',
      closingTime: '21:00',
      indoor: true,
      outdoor: false,
      popularityScore: 94,
      experienceScore: 92,
      zone: 'central',
    },
  ],
};

function createFallbackCityDestinations(city: string): DestinationEntity[] {
  const norm = city.toLowerCase().trim();
  let matchedKey: string | null = null;
  if (norm.includes('surabaya')) matchedKey = 'surabaya';
  else if (norm.includes('semarang')) matchedKey = 'semarang';
  else if (norm.includes('solo') || norm.includes('surakarta')) matchedKey = 'solo';
  else if (norm.includes('bogor')) matchedKey = 'bogor';

  if (matchedKey && KNOWN_POPULAR_CITY_PLACES[matchedKey]) {
    return KNOWN_POPULAR_CITY_PLACES[matchedKey];
  }

  const slug = city.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return [
    {
      id: `${slug}-1`,
      name: `Alun-Alun & Landmark Ikonik ${city}`,
      city,
      description: `Pusat rekreasi publik dan landmark cagar budaya paling terkenal di ${city}.`,
      category: 'culture',
      preferenceCategory: 'budaya',
      latitude: -7.25,
      longitude: 112.75,
      estimatedDurationMinutes: 90,
      estimatedCost: 20000,
      openingTime: '08:00',
      closingTime: '21:00',
      indoor: false,
      outdoor: true,
      popularityScore: 92,
      experienceScore: 90,
      zone: 'central',
    },
    {
      id: `${slug}-2`,
      name: `Sentra Kuliner Pagi & Sarapan Khas ${city}`,
      city,
      description: `Mencicipi menu sarapan otentik legendaris resep turun-temurun warga ${city}.`,
      category: 'culinary',
      preferenceCategory: 'kuliner',
      latitude: -7.26,
      longitude: 112.74,
      estimatedDurationMinutes: 60,
      estimatedCost: 35000,
      openingTime: '07:30',
      closingTime: '21:00',
      indoor: true,
      outdoor: false,
      popularityScore: 94,
      experienceScore: 92,
      zone: 'central',
    },
    {
      id: `${slug}-3`,
      name: `Kawasan Wisata Alam & Panorama Pemandangan ${city}`,
      city,
      description: `Spot pemandangan alam asri terbuka dan rekreasi keluarga di sekitar ${city}.`,
      category: 'nature',
      preferenceCategory: 'alam',
      latitude: -7.2,
      longitude: 112.7,
      estimatedDurationMinutes: 120,
      estimatedCost: 35000,
      openingTime: '08:30',
      closingTime: '17:30',
      indoor: false,
      outdoor: true,
      popularityScore: 89,
      experienceScore: 88,
      zone: 'north',
    },
    {
      id: `${slug}-4`,
      name: `Resto Pilihan Kuliner Tradisional ${city}`,
      city,
      description: `Menikmati hidangan khas unggulan ${city} dengan cita rasa bumbu lokal khas.`,
      category: 'culinary',
      preferenceCategory: 'kuliner',
      latitude: -7.24,
      longitude: 112.72,
      estimatedDurationMinutes: 75,
      estimatedCost: 55000,
      openingTime: '10:00',
      closingTime: '21:30',
      indoor: true,
      outdoor: false,
      popularityScore: 91,
      experienceScore: 89,
      zone: 'central',
    },
    {
      id: `${slug}-5`,
      name: `Pusat Oleh-Oleh & Kerajinan Khas ${city}`,
      city,
      description: `Pusat belanja suvenir, kerajinan tangan, dan camilan khas produksi lokal ${city}.`,
      category: 'shopping',
      preferenceCategory: 'shopping',
      latitude: -7.27,
      longitude: 112.76,
      estimatedDurationMinutes: 60,
      estimatedCost: 65000,
      openingTime: '09:00',
      closingTime: '21:00',
      indoor: true,
      outdoor: false,
      popularityScore: 88,
      experienceScore: 87,
      zone: 'central',
    },
  ];
}

// PRD Section 25 AI Architecture: Multi-Stage Deterministic + Reasoning Pipeline
export async function generateTripPlanPipeline(
  req: GenerateTripRequest
): Promise<TripPlan> {
  // 1. Stage 1: Trip Specification & Defaults
  const destinationCity = req.destination?.trim() || 'Bandung';
  const durationDays = Math.max(1, Math.min(14, req.durationDays || 3));
  const travelers = Math.max(1, req.travelers || 2);
  const budget = Math.max(500000, req.budget || 3000000);
  const travelStyle: TravelStyle = req.travelStyle || 'balanced';
  const pace: PaceType = req.pace || 'balanced';
  const preferences = req.preferences || {
    kuliner: 'like',
    alam: 'like',
    budaya: 'neutral',
  };

  // 2. Stage 2: Weather Retrieval
  const weatherForecasts = await getCityWeatherForecast(
    destinationCity,
    durationDays,
    req.startDate
  );

  // 3. Stage 3: Destination Candidate Retrieval & Ranking
  const averageActivityBudget = Math.round((budget * 0.1) / (durationDays * 4));
  const scoredDestinations = destinationRepository.recommend(
    destinationCity,
    preferences,
    averageActivityBudget,
    weatherForecasts[0]?.rainChance >= 60,
    30 // fetch top 30 candidates
  );

  // If no city specific destinations found, fallback to tailored city destinations
  const candidatePool: DestinationEntity[] =
    scoredDestinations.length > 0
      ? scoredDestinations.map((s) => s.destination)
      : createFallbackCityDestinations(destinationCity);

  // 4. Stage 4: Day-by-Day Route Clustering & Activity Distribution
  const days: DayItinerary[] = [];
  const itemsPerDay = pace === 'relaxed' ? 3 : pace === 'packed' ? 6 : 4;
  let totalActivitiesCost = 0;

  // Split candidates across days by zones or sequence
  for (let d = 1; d <= durationDays; d++) {
    const weather = weatherForecasts[d - 1] || weatherForecasts[0];
    const startIndex = ((d - 1) * itemsPerDay) % candidatePool.length;
    let dayCandidates = candidatePool.slice(startIndex, startIndex + itemsPerDay);

    // If slice underfills, wrap around
    if (dayCandidates.length < itemsPerDay) {
      dayCandidates = [
        ...dayCandidates,
        ...candidatePool.slice(0, itemsPerDay - dayCandidates.length),
      ];
    }

    const theme =
      d === 1
        ? 'City Arrival, Heritage & Kuliner Legendaris'
        : d === 2
        ? 'Eksplorasi Alam & Pemandangan Ikonik'
        : 'Wisata Belanja, Santai & Oleh-Oleh Khas';

    const dayItinerary = buildDayItinerary(
      d,
      `Hari ${d}`,
      theme,
      dayCandidates,
      weather,
      pace
    );

    dayItinerary.activities.forEach((act) => {
      totalActivitiesCost += act.cost;
    });

    days.push(dayItinerary);
  }

  // 5. Stage 5: Budget Engine Calculation & Validation
  const budgetResult = calculateBudget(
    budget,
    travelStyle,
    durationDays,
    travelers,
    totalActivitiesCost
  );

  // 6. Stage 6: Alternative Scenarios Generation (Section 22)
  const totalActivitiesCount = days.reduce(
    (acc, day) => acc + day.activities.length,
    0
  );
  const alternatives = generateAlternativeScenarios(budget, totalActivitiesCount);

  // 7. Stage 7: Final Structured Plan Assembly
  const tripId = `trip-${Date.now()}`;
  let title = `${destinationCity} ${travelStyle === 'luxury' ? 'Eksklusif' : 'Eksplorasi'} & Wisata`;

  // AI-generated catchy title with Gemini (2.5s timeout with deterministic fallback)
  try {
    const aiTitle = await generateGeminiText(
      `Buat 1 judul rencana liburan singkat menarik (maksimal 5 kata) untuk ${destinationCity} gaya ${travelStyle} ${durationDays} hari. Format hanya judul polos tanpa tanda kutip.`,
      'Kamu adalah copywriter travel lokal Indonesia.',
      2500
    );
    if (aiTitle && aiTitle.length < 50) {
      title = aiTitle.replace(/["']/g, '').trim();
    }
  } catch {
    // Fallback stays as default title
  }

  return {
    id: tripId,
    title,
    destination: `${destinationCity}, Indonesia`,
    durationText: `${durationDays} Hari · ${durationDays - 1} Malam`,
    travelers,
    budgetTotal: budget,
    travelStyle,
    pace,
    overallHealthScore: budgetResult.healthScore,
    days,
    budget: budgetResult.breakdown,
    alternatives,
    savingsTips: budgetResult.savingTips,
  };
}
