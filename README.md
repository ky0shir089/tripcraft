# TripCraft ✈️🗺️

> AI-powered smart travel itinerary planner and route optimizer.

TripCraft generates personalized multi-day travel itineraries based on destination, budget, travel style, and preferences. Combines algorithmic route clustering with Google Gemini AI for smart scheduling, budget tracking, and real-time itinerary chat adjustments.

---

## ✨ Features

- **Multi-Engine Planning Pipeline:**
  - **Scoring Engine:** Ranks destinations by traveler preferences, budget ceiling, popularity, and visit duration.
  - **Route & TSP Optimizer:** Calculates Haversine distances, clusters attractions geographically (e.g., North vs. South Bandung), and minimizes transit time.
  - **Budget Engine:** Allocates funds across accommodation, transportation, dining, activities, and contingency buffers with over-budget alerts.
  - **Weather Engine:** Forecasts conditions and warns against outdoor activities during rain or bad weather.
- **Gemini 2.5 Flash Integration:**
  - Context-aware trip descriptions and local insider tips.
  - Conversational chatbot (`TripChatbot`) to add, remove, or swap destinations on the fly.
- **Interactive Itinerary UI:**
  - Day-by-day timeline view with estimated travel and visit times.
  - Route map preview and interactive budget breakdown cards.
  - Fast-track quick generator and multi-step custom trip wizard.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [Base UI](https://base-ui.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
- **AI Model:** Google Gemini (`gemini-2.5-flash`) via Google AI Studio API

---

## 📁 Project Structure

```text
src/
├── app/                  # Next.js App Router pages and API routes
│   ├── api/
│   │   ├── chat/         # Conversational itinerary modification endpoint
│   │   ├── destinations/ # Destination lookup API
│   │   ├── trips/        # Trip generation & management endpoints
│   │   └── weather/      # Weather forecast endpoint
│   ├── layout.tsx
│   └── page.tsx          # Main interactive trip planner app
├── components/
│   ├── budget/           # Budget breakdown & cost charts
│   ├── chat/             # AI trip assistant floating drawer
│   ├── config/           # Step-by-step trip configuration wizard
│   ├── itinerary/        # Day cards, timelines, and route map view
│   ├── landing/          # Hero banner and quick-generator form
│   └── ui/               # Reusable UI component library
├── data/                 # Sample trip templates and mock data
├── server/
│   ├── engines/          # Scoring, Route (TSP), Budget, and Weather engines
│   ├── pipeline/         # Trip planner orchestrator and chat modifier
│   ├── repositories/     # Destination and trip data access layer
│   └── services/         # Gemini API client
└── types/                # Shared TypeScript models and interfaces
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- npm, pnpm, or bun

### 1. Clone & Install

```bash
git clone https://github.com/ky0shir089/tripcraft.git
cd tripcraft
npm install
```

### 2. Environment Variables

Create `.env.local` in root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

*(Note: If unset, fallback mode uses built-in heuristic planning engine).*

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in browser.

### 4. Run Backend Verification Tests

Validate scoring, route optimization, budget engine, and pipeline logic:

```bash
npx tsx src/server/__tests__/verify-backend.ts
```

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile and build production bundle |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint checks |

---

## 📄 License

MIT License.
