# PRD — TripCraft
## Asisten Perencana Rute & Estimasi Anggaran Wisata

**Version:** 1.0  
**Status:** Draft  
**Product Type:** AI Travel Planner  
**Target Platform:** Web / Mobile Web  
**Primary Language:** Bahasa Indonesia  
**Tone:** Santai, ramah, komunikatif seperti pemandu wisata lokal

---

## 1. Product Overview

**TripCraft** adalah chatbot AI yang membantu pengguna merencanakan perjalanan berdasarkan:

- Destinasi
- Tanggal dan durasi perjalanan
- Jumlah wisatawan
- Budget
- Preferensi aktivitas
- Gaya perjalanan
- Moda transportasi
- Preferensi akomodasi
- Preferensi kuliner

TripCraft menghasilkan **itinerary harian yang realistis**, estimasi biaya perjalanan, rekomendasi destinasi, serta alternatif rute berdasarkan kondisi seperti cuaca dan jarak antar lokasi.

### Contoh Input

> Saya mau liburan ke Bandung 3 hari 2 malam untuk 2 orang. Budget 3 juta. Suka kuliner dan alam, tapi nggak mau itinerary terlalu padat.

### Contoh Output

```text
BANDUNG — 3D2N
2 orang
Budget: Rp3.000.000

Hari 1
Jakarta → Bandung
10:00 Berangkat
13:00 Check-in
14:30 Braga
17:00 Kuliner
19:30 Jalan-jalan malam

Hari 2
08:00 Sarapan
09:00 Kawah Putih
13:00 Makan siang
15:00 Situ Patenggang
19:00 Dinner

Hari 3
08:00 Sarapan
09:30 Pasar Baru
12:00 Checkout
13:00 Pulang

Estimasi biaya:
Transportasi   Rp700.000
Hotel           Rp900.000
Kuliner         Rp650.000
Aktivitas       Rp350.000
Buffer          Rp400.000
────────────────────────
TOTAL           Rp3.000.000
```

---

## 2. Problem Statement

Merencanakan perjalanan biasanya membutuhkan banyak aplikasi:

- Google Maps untuk rute
- Search engine untuk destinasi
- Aplikasi booking untuk hotel
- Aplikasi cuaca
- Kalkulator untuk budget
- Spreadsheet untuk itinerary

Akibatnya pengguna harus melakukan banyak **manual research** dan sering menghasilkan itinerary yang tidak realistis.

### Masalah Utama

1. Sulit menentukan destinasi yang sesuai budget.
2. Jarak antar destinasi sering tidak diperhitungkan.
3. Itinerary terlalu padat.
4. Estimasi biaya tidak terstruktur.
5. Kondisi cuaca tidak diperhitungkan.
6. Sulit menemukan alternatif ketika suatu destinasi tidak cocok.

---

## 3. Product Goals

### Primary Goal

Membantu pengguna membuat **rencana perjalanan lengkap dalam beberapa menit**.

### Success Criteria

TripCraft harus mampu:

- Membuat itinerary berdasarkan budget.
- Mengoptimalkan urutan destinasi.
- Menghindari perjalanan bolak-balik yang tidak perlu.
- Mengestimasi biaya.
- Menyesuaikan itinerary berdasarkan preferensi.
- Menyediakan alternatif.
- Menyesuaikan itinerary berdasarkan cuaca.

---

## 4. Target Users

### Persona 1 — Budget Traveler

```text
Usia       : 20–35
Budget     : Rp1–5 juta
Tujuan     : Traveling murah
Prioritas  : Transportasi + kuliner
```

### Persona 2 — Family Traveler

```text
Usia       : 30–50
Jumlah     : 3–6 orang
Prioritas  : Kenyamanan
Preferensi : Hotel nyaman + aktivitas keluarga
```

### Persona 3 — Couple Traveler

```text
Jumlah     : 2 orang
Prioritas  : Experience
Preferensi : Kuliner + tempat aesthetic
```

### Persona 4 — Flexible Traveler

Tidak memiliki itinerary tertentu dan meminta AI menentukan perjalanan terbaik.

> Tentukan liburan 3 hari dengan budget 5 juta.

---

## 5. User Journey

```text
User
 │
 ▼
Input Trip
 │
 ├── Destination
 ├── Date
 ├── Duration
 ├── Travelers
 ├── Budget
 └── Preferences
 │
 ▼
AI Trip Planner
 │
 ├── Destination Research
 ├── Route Optimization
 ├── Cost Estimation
 ├── Weather Check
 └── Preference Matching
 │
 ▼
Trip Plan
 │
 ├── Itinerary
 ├── Map
 ├── Budget
 └── Alternatives
 │
 ▼
User Adjustment
 │
 ├── Ganti hotel
 ├── Kurangi budget
 ├── Tambah destinasi
 └── Buat itinerary lebih santai
 │
 ▼
Final Trip Plan
```

---

## 6. Functional Requirements

### 6.1 Trip Configuration

User dapat menentukan:

| Parameter | Required |
|---|---|
| Destination | ✅ |
| Start Date | ✅ |
| End Date / Duration | ✅ |
| Number of Travelers | ✅ |
| Budget | ✅ |
| Travel Style | ❌ |
| Activities | ❌ |
| Transportation | ❌ |
| Accommodation | ❌ |
| Food Preference | ❌ |

### Travel Style

```text
Budget
Backpacker
Balanced
Comfort
Luxury
```

---

## 7. Preference System

TripCraft menggunakan preference scoring.

### Activity Categories

```text
Kuliner
Alam
Pantai
Budaya
Sejarah
Shopping
Nightlife
Adventure
Family
Religi
Photography
```

User dapat memilih:

```text
❤️ Sangat suka
👍 Suka
😐 Netral
👎 Tidak suka
🚫 Hindari
```

---

## 8. AI Trip Planner

AI menjadi orchestrator utama.

### Input

```json
{
  "destination": "Bandung",
  "duration": 3,
  "travelers": 2,
  "budget": 3000000,
  "travel_style": "balanced",
  "preferences": [
    "kuliner",
    "alam"
  ],
  "pace": "relaxed"
}
```

### AI Processing

```text
Trip Request
     │
     ▼
Preference Analyzer
     │
     ▼
Destination Candidate Generator
     │
     ▼
Location Data
     │
     ▼
Route Optimizer
     │
     ▼
Budget Calculator
     │
     ▼
Weather Analyzer
     │
     ▼
Itinerary Generator
     │
     ▼
Validation
     │
     ▼
Final Itinerary
```

---

## 9. Itinerary Engine

Salah satu fitur paling penting adalah memastikan itinerary **realistis**, bukan hanya daftar tempat.

Setiap aktivitas memiliki:

```text
Location
Opening Hours
Duration
Travel Time
Estimated Cost
Category
Indoor / Outdoor
```

Contoh:

```json
{
  "location": "Kawah Putih",
  "duration": 180,
  "estimated_cost": 50000,
  "category": "nature",
  "outdoor": true
}
```

AI kemudian menghitung:

```text
Visit Time
+
Travel Time
+
Meal Time
+
Rest Time
```

---

## 10. Route Optimization

TripCraft harus mengurangi perjalanan yang tidak perlu.

### Contoh Buruk

```text
Hotel
 ↓
North Bandung
 ↓
South Bandung
 ↓
North Bandung
 ↓
Downtown
```

### Optimized

```text
Hotel
 ↓
North Bandung
 ↓
North Bandung
 ↓
Downtown
 ↓
Hotel
```

Konsepnya mirip **Traveling Salesman Problem (TSP)** dengan constraint:

- Opening hours
- Closing hours
- Travel time
- User preference
- Budget
- Weather
- Duration

---

## 11. Pace / Intensity

User dapat menentukan intensitas perjalanan.

### Relaxed

```text
2–4 aktivitas / hari
```

### Balanced

```text
4–6 aktivitas / hari
```

### Packed

```text
6+ aktivitas / hari
```

AI juga harus memberikan warning:

> ⚠️ Hari ke-2 cukup padat. Waktu perjalanan sekitar 3 jam.

---

## 12. Budget Engine

Budget dibagi menjadi:

```text
Transportasi
Akomodasi
Kuliner
Aktivitas
Shopping
Parkir / Tol
Miscellaneous
Emergency Buffer
```

### Formula

```text
Total Cost =
Transportation
+ Accommodation
+ Food
+ Activities
+ Miscellaneous
+ Buffer
```

### Contoh Budget Allocation

Untuk gaya Balanced:

```text
Hotel             30%
Transportasi      25%
Kuliner           20%
Aktivitas         10%
Miscellaneous      5%
Buffer            10%
```

Persentase tidak hardcoded dan dapat disesuaikan berdasarkan travel style.

---

## 13. Budget Warning

### Over Budget

```text
Budget:
Rp3.000.000

Estimated:
Rp3.750.000

⚠️ Melebihi budget Rp750.000
```

Kemudian memberikan solusi:

```text
Alternatif:

1. Turunkan hotel
   - Hemat Rp400.000

2. Kurangi 1 aktivitas
   - Hemat Rp100.000

3. Gunakan transportasi umum
   - Hemat Rp250.000
```

---

## 14. Weather Integration

Integrasi weather API digunakan untuk:

```text
Temperature
Rain Probability
Weather Condition
Humidity
Wind
```

Contoh:

> 🌧️ Hari ke-2 kemungkinan hujan 70%.

AI kemudian mengubah itinerary:

```text
Outdoor
Kawah Putih

↓

Indoor
Museum / Cafe / Shopping
```

### Important

Weather bukan hanya ditampilkan, tetapi **digunakan sebagai input itinerary optimization**.

---

## 15. Maps Integration

Maps API digunakan untuk:

- Geocoding
- Distance
- Travel time
- Directions
- Location coordinates

Contoh:

```text
Hotel
 ↓ 15 min
Braga
 ↓ 8 min
Asia Afrika
 ↓ 12 min
Alun-Alun
```

---

## 16. Destination Recommendation

TripCraft dapat memberikan alternatif.

Contoh:

> Saya suka kuliner dan budaya.

AI:

### Recommended

🥇 Braga  
🥈 Jalan Asia Afrika  
🥉 Sudirman Street

### Alternative

- Chinatown
- Pasar Baru
- Saung Angklung Udjo

Setiap destinasi memiliki:

```text
Match Score
Distance
Estimated Cost
Recommended Duration
Best Time
```

---

## 17. Recommendation Scoring

Gunakan weighted scoring:

```text
Score =
Preference Match × 30%
Budget Fit       × 20%
Distance         × 15%
Popularity       × 10%
Weather Fit      × 10%
Time Fit         × 10%
Experience       × 5%
```

Output:

```text
Braga
★★★★★ 92/100

Preference   95
Budget       90
Distance     93
Weather      88
Time Fit     95
```

---

## 18. Chatbot Interaction

TripCraft harus bersifat conversational.

### Example 1

**User:**

> Tambahkan tempat makan seafood.

**TripCraft:**

> Bisa! Aku tambahkan seafood untuk makan malam hari ke-2. Aku akan cari yang masih dekat dengan rute supaya nggak muter jauh.

### Example 2

**User:**

> Hotelnya terlalu mahal.

**TripCraft:**

> Bisa. Aku bisa turunkan kelas hotel dan mengalokasikan selisihnya ke kuliner atau aktivitas.

### Example 3

**User:**

> Buat lebih santai.

**TripCraft:**

> Siap. Aku kurangi 2 aktivitas dan kasih waktu istirahat lebih panjang.

---

## 19. Itinerary Output

### Header

```text
🌴 BANDUNG TRIP
3 Hari · 2 Malam
2 Travelers
Budget Rp3.000.000
```

### Daily Plan

```text
DAY 1
────────────

08:00 🚗 Departure

12:00 🍜 Lunch

14:00 📸 Destination

17:00 ☕ Cafe

19:00 🍜 Dinner
```

Setiap activity:

```text
⏱ Duration
📍 Location
💰 Cost
🚗 Travel time
🌤 Weather
```

---

## 20. Map View

Map menampilkan:

```text
Hotel
   │
   ├── Destination 1
   │
   ├── Destination 2
   │
   └── Destination 3
```

User dapat toggle:

```text
📍 Attractions
🍜 Restaurants
🏨 Hotels
☕ Cafes
🚗 Transport
```

---

## 21. Trip Summary

### Cost Breakdown

```text
🏨 Hotel          Rp900.000
🚗 Transport      Rp700.000
🍜 Food           Rp650.000
🎟 Activities     Rp350.000
🛍 Misc           Rp100.000
🛟 Buffer         Rp300.000
──────────────────────────
TOTAL             Rp3.000.000
```

### Budget Health

```text
████████░░ 80%

Within Budget ✅
```

---

## 22. Alternative Scenarios

TripCraft harus bisa membuat beberapa versi itinerary.

### Option A — Cheapest

```text
Rp2.200.000
```

### Option B — Balanced

```text
Rp3.000.000
```

### Option C — Comfort

```text
Rp4.200.000
```

User tidak perlu membuat itinerary ulang dari awal.

---

## 23. Database Design

Untuk MVP dapat menggunakan **PostgreSQL**.

### Users

```text
users
-----
id
name
email
created_at
```

### Trips

```text
trips
-----
id
user_id
destination
start_date
end_date
travelers
budget
travel_style
pace
created_at
```

### Preferences

```text
trip_preferences
----------------
id
trip_id
category
preference
weight
```

### Destinations

```text
destinations
------------
id
name
description
latitude
longitude
category
estimated_duration
estimated_cost
opening_time
closing_time
indoor
outdoor
```

### Itinerary

```text
itineraries
-----------
id
trip_id
day
date
```

### Activities

```text
itinerary_activities
--------------------
id
itinerary_id
destination_id
start_time
end_time
travel_time
estimated_cost
sequence
```

### Expenses

```text
trip_expenses
-------------
id
trip_id
category
description
estimated_cost
actual_cost
```

---

## 24. API Architecture

```text
Frontend
   │
   ▼
Next.js
   │
   ▼
API Layer
   │
   ├──────────────┐
   ▼              ▼
AI Service     Trip Service
   │              │
   ▼              ▼
LLM          PostgreSQL
   │
   ├── Maps API
   ├── Weather API
   └── Places API
```

Recommended stack:

**Next.js + Node.js/TypeScript + PostgreSQL + Drizzle**

---

## 25. AI Architecture

Jangan membuat satu prompt besar yang langsung menghasilkan itinerary.

Gunakan pipeline:

```text
USER REQUEST
     ↓
Intent Parser
     ↓
Trip Specification
     ↓
Destination Retrieval
     ↓
Candidate Ranking
     ↓
Route Optimization
     ↓
Budget Calculation
     ↓
Weather Adjustment
     ↓
LLM Itinerary Writer
     ↓
Itinerary Validator
     ↓
FINAL RESPONSE
```

LLM bertugas terutama pada:

- Understanding user intent
- Recommendation reasoning
- Natural language
- Adjusting itinerary
- Conversational interaction

Sedangkan kalkulasi seperti **budget, jarak, waktu, dan constraint** sebaiknya dilakukan oleh backend.

---

## 26. LLM Prompt Configuration

### System Personality

```text
You are TripCraft, a friendly local travel planner.

Speak Indonesian in a casual, warm and conversational style.

Act like a knowledgeable local travel guide.

Prioritize:
1. Realistic schedules
2. Budget accuracy
3. Efficient routes
4. User preferences
5. Safety and comfort

Never create impossible schedules.
Never invent travel times, prices or opening hours
when reliable data is available through integrations.
```

### Temperature

```text
0.7
```

Cocok untuk:

- Alternatif destinasi
- Variasi aktivitas
- Conversational responses

Untuk angka biaya, waktu, dan rute, gunakan deterministic backend logic.

---

## 27. API Integration

### Maps

Digunakan untuk:

```text
Geocoding
Distance Matrix
Directions
Places
```

### Weather

Digunakan untuk:

```text
Forecast
Rain probability
Temperature
Weather condition
```

### Places / POI

Digunakan untuk:

```text
Restaurant
Hotel
Attraction
Cafe
Shopping
```

---

## 28. MVP Scope

### MVP Wajib

- [x] Trip configuration
- [x] AI itinerary generation
- [x] Budget estimation
- [x] Destination recommendation
- [x] Route calculation
- [x] Weather integration
- [x] Chat-based modification
- [x] Save trip
- [x] Cost breakdown
- [x] Alternative itinerary

### Belum Diperlukan

- [ ] Hotel booking
- [ ] Flight booking
- [ ] Payment
- [ ] Affiliate marketplace
- [ ] Social features
- [ ] User reviews
- [ ] Loyalty program

---

## 29. MVP Screens

### Screen 1 — Landing

```text
┌─────────────────────────────┐
│       ✈️ TripCraft          │
│                             │
│ Plan your trip with AI      │
│                             │
│ Mau liburan ke mana?         │
│ [ Bandung                 ]  │
│                             │
│ Budget                       │
│ [ Rp 3.000.000            ]  │
│                             │
│ [ ✨ Buat Itinerary ]        │
└─────────────────────────────┘
```

### Screen 2 — Trip Configuration

```text
Destination
Dates
Travelers
Budget
Travel Style
Activities
Pace
Transportation
Accommodation
```

### Screen 3 — AI Generation

```text
✨ TripCraft sedang menyusun perjalanan...

✓ Mencari destinasi
✓ Mengoptimalkan rute
✓ Menghitung budget
✓ Mengecek cuaca
● Menyusun itinerary
```

### Screen 4 — Itinerary

```text
DAY 1
────────────

08:00 🚗 Departure

12:00 🍜 Lunch

14:00 📸 Destination

17:00 ☕ Cafe

19:00 🍜 Dinner
```

### Screen 5 — Budget

```text
TOTAL

Rp3.000.000

Hotel       ███████
Transport   █████
Food        ████
Activity    ██
Buffer      ██
```

---

## 30. Non-Functional Requirements

### Performance

Target:

```text
Initial page load < 2 sec
API response < 500 ms
AI itinerary < 15 sec
```

### Reliability

Jika API eksternal gagal:

```text
Weather unavailable
     ↓
Generate itinerary without weather
     ↓
Show warning
```

Jangan membuat seluruh itinerary gagal hanya karena satu API eksternal bermasalah.

---

## 31. Error Handling

### Budget Terlalu Kecil

> Budget Rp500.000 kemungkinan tidak cukup untuk itinerary 3 hari di Bali. Mau saya buat versi **super hemat**?

### Data Destinasi Tidak Ditemukan

> Aku belum menemukan data lokasi tersebut. Coba gunakan nama kota atau destinasi yang lebih spesifik.

### Weather Unavailable

> Data cuaca sedang tidak tersedia. Itinerary tetap dibuat berdasarkan kondisi normal.

---

## 32. Metrics / KPI

### Primary KPI

**Itinerary Completion Rate**

```text
Trips Generated
        ↓
Trips Saved
```

### Secondary KPI

```text
Average planning time
Itinerary regeneration rate
Budget adjustment rate
Destination click rate
Chat interaction rate
Trip save rate
```

### Quality KPI

```text
% itinerary within budget
% itinerary without schedule conflict
% activities within opening hours
Average route efficiency
```

---

## 33. Future Development

### Phase 2

- Hotel recommendation
- Restaurant recommendation
- Real-time traffic
- Public transportation
- Booking integration
- Flight integration

### Phase 3

- AI travel companion
- Live trip adjustment
- Expense tracking
- Group trip planning
- Shared itinerary
- Collaborative planning

### Phase 4 — Real-time AI Travel Assistant

Contoh:

> TripCraft, hujan deras di Bandung. Apa yang harus saya lakukan sekarang?

AI membaca:

```text
Current Location
Current Weather
Remaining Time
Budget
Existing Itinerary
Nearby Places
```

Kemudian membuat **real-time itinerary replacement**.

---

## 34. Unique Selling Proposition

TripCraft sebaiknya tidak diposisikan hanya sebagai:

> **AI yang membuat itinerary.**

Positioning yang lebih kuat:

> **AI travel planner yang memastikan itinerary kamu realistis, sesuai budget, dan tidak bikin capek.**

### Tiga Value Proposition

#### 💰 Budget-aware

> Liburan sesuai kemampuan.

#### 🗺️ Route-aware

> Nggak muter-muter.

#### 🌦️ Context-aware

> Itinerary menyesuaikan kondisi.

---

## 35. Recommended Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| UI | Tailwind + shadcn/ui |
| Backend | Node.js / Next.js API |
| Database | PostgreSQL |
| ORM | Drizzle |
| Authentication | Better Auth |
| AI | LLM API |
| Maps | Google Maps / Mapbox |
| Weather | OpenWeather / WeatherAPI |
| Places | Google Places / Mapbox |
| Cache | Redis |
| Background Job | BullMQ |
| Deployment | Vercel + Managed PostgreSQL |

### Architecture

```text
                    ┌───────────────┐
                    │   Next.js UI  │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Trip API     │
                    └───────┬───────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
        ┌─────────┐    ┌─────────┐    ┌──────────┐
        │   AI    │    │Postgres │    │  Redis   │
        └────┬────┘    └─────────┘    └──────────┘
             │
       ┌─────┼───────────────┐
       ▼     ▼               ▼
     Maps  Weather         Places
```

---

## 36. MVP Development Priority

### Sprint 1 — Foundation

```text
Authentication
Trip CRUD
Database
Trip configuration
Basic chatbot
```

### Sprint 2 — AI Planner

```text
AI intent parser
Destination recommendation
Itinerary generator
Budget calculator
```

### Sprint 3 — Intelligence

```text
Maps
Route optimization
Weather
Opening hours
Itinerary validation
```

### Sprint 4 — UX

```text
Interactive itinerary
Budget visualization
Map
Chat modification
Alternative itinerary
Save/share trip
```

---

## 37. Core MVP User Flow

```text
"TripCraft, saya mau ke Jogja
3 hari 2 malam
2 orang
budget 3 juta
suka kuliner dan budaya."

             ↓

        ✨ ANALYZING

             ↓

┌─────────────────────────────┐
│ YOGYAKARTA                  │
│ 3D2N · 2 People             │
│ Budget Rp3.000.000          │
├─────────────────────────────┤
│                             │
│ Day 1  Culture + Kuliner    │
│ Day 2  Heritage + Food      │
│ Day 3  Shopping + Culinary  │
│                             │
├─────────────────────────────┤
│ Estimated Rp2.850.000       │
│ ✅ Within Budget             │
└─────────────────────────────┘

"Kurangin aktivitasnya."

             ↓

AI otomatis menyusun ulang.
```

---

## 38. Product Principle

**LLM jangan dijadikan kalkulator atau mesin routing.**

LLM digunakan sebagai:

```text
Reasoning Layer
+
Recommendation Layer
+
Conversation Layer
```

Backend digunakan sebagai:

```text
Data Layer
+
Calculation Layer
+
Routing Layer
+
Validation Layer
```

Dengan pendekatan ini TripCraft dapat memberikan itinerary yang lebih:

- Konsisten
- Realistis
- Terukur
- Mudah divalidasi
- Mudah dikembangkan
- Lebih aman terhadap hallucination

---

## 39. Final Product Vision

TripCraft berkembang dari:

```text
AI Itinerary Generator
```

menjadi:

```text
AI Travel Planning Engine
```

dan pada akhirnya:

```text
AI Personal Travel Companion
```

yang memahami:

```text
WHO
  ↓
User & Travel Preferences

WHERE
  ↓
Destination & Location

WHEN
  ↓
Date, Time & Weather

HOW
  ↓
Transport & Route

HOW MUCH
  ↓
Budget & Expenses

WHAT NEXT
  ↓
Real-time Recommendation
```

**Final Vision:**

> **TripCraft — Your AI travel companion that plans the trip, manages the budget, optimizes the route, and adapts the journey in real time.**
