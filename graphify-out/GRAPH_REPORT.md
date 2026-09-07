# Graph Report - .  (2026-09-07)

## Corpus Check
- Corpus is ~24,008 words - fits in a single context window. You may not need a graph.

## Summary
- 325 nodes · 574 edges · 21 communities (16 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.76)
- Token cost: 3,810 input · 1,200 output

## Community Hubs (Navigation)
- Destination & Configuration API
- Itinerary Views & Chatbot
- TypeScript Environment References
- Landing Page & Config Wizard
- Runtime Dependencies
- Trip API & Chat Handlers
- Trip Planning & Calculation Engines
- Components JSON Config
- PRD Specs & AI Architecture
- DevDependencies & Tooling
- App Root Layout & Fonts
- Badge UI Component
- ESLint Configuration
- Next.js Build Config
- PostCSS Tailwind Config
- Static SVG Assets

## God Nodes (most connected - your core abstractions)
1. `TripPlan` - 24 edges
2. `compilerOptions` - 16 edges
3. `TripRepository` - 13 edges
4. `DestinationEntity` - 11 edges
5. `Button()` - 10 edges
6. `runBackendVerification()` - 10 edges
7. `generateTripPlanPipeline()` - 10 edges
8. `ActivityPreference` - 10 edges
9. `buildDayItinerary()` - 9 edges
10. `modifyItineraryViaChat()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Globe SVG Icon` --semantically_similar_to--> `TripCraft System`  [INFERRED] [semantically similar]
  public/globe.svg → docs/TripCraft_PRD.md
- `TripCraft Next.js Starter README` --references--> `Next.js Brand Logo`  [INFERRED]
  README.md → public/next.svg
- `TripCraft Next.js Starter README` --references--> `Vercel Brand Logo`  [INFERRED]
  README.md → public/vercel.svg
- `TripCraft Next.js Starter README` --conceptually_related_to--> `Next.js Agent Rules`  [INFERRED]
  README.md → AGENTS.md
- `TripCraft Tech Stack Architecture` --conceptually_related_to--> `TripCraft Next.js Starter README`  [INFERRED]
  docs/TripCraft_PRD.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **TripCraft Multi-Step AI Planning Pipeline** — docs_tripcraft_prd_ai_trip_planner, docs_tripcraft_prd_route_optimization_engine, docs_tripcraft_prd_budget_engine, docs_tripcraft_prd_weather_integration, docs_tripcraft_prd_itinerary_engine [EXTRACTED 1.00]
- **TripCraft Backend Persistence & API Layer** — docs_tripcraft_prd_database_schema, docs_tripcraft_prd_tech_stack_architecture, docs_tripcraft_prd_tripcraft_system [EXTRACTED 1.00]
- **Next.js Framework Baseline & Agent Configuration** — readme_nextjs_boilerplate_readme, agents_nextjs_agent_rules, claude_md_instructions, public_next_logo, public_vercel_logo [INFERRED 0.85]

## Communities (21 total, 5 thin omitted)

### Community 0 - "Destination & Configuration API"
Cohesion: 0.14
Nodes (25): ACTIVITY_LIST, RATING_OPTIONS, Slider(), AllocationPercent, STYLE_ALLOCATIONS, RATING_WEIGHTS, DestinationQueryFilter, DestinationRepository (+17 more)

### Community 1 - "Itinerary Views & Chatbot"
Cohesion: 0.11
Nodes (18): BudgetBreakdownView(), BudgetBreakdownViewProps, INITIAL_MESSAGES, SUGGESTION_CHIPS, TripChatbot(), TripChatbotProps, ItineraryView(), ItineraryViewProps (+10 more)

### Community 2 - "TypeScript Environment References"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 3 - "Landing Page & Config Wizard"
Cohesion: 0.10
Nodes (17): Home(), TripConfigWizard(), TripConfigWizardProps, LandingHero(), LandingHeroProps, Navbar(), NavbarProps, AIGenerationProgress() (+9 more)

### Community 4 - "Runtime Dependencies"
Cohesion: 0.07
Nodes (27): @base-ui/react, class-variance-authority, cn, lucide-react, next, dependencies, @base-ui/react, class-variance-authority (+19 more)

### Community 5 - "Trip API & Chat Handlers"
Cohesion: 0.13
Nodes (10): POST(), RouteContext, modifyItineraryViaChat(), TripRepository, generateGeminiText(), processChatWithAI(), verifyGemini(), ChatModificationRequest (+2 more)

### Community 6 - "Trip Planning & Calculation Engines"
Cohesion: 0.17
Nodes (21): POST(), GET(), DESTINATIONS_DATA, calculateBudget(), generateAlternativeScenarios(), addMinutes(), buildDayItinerary(), mapCategory() (+13 more)

### Community 7 - "Components JSON Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "PRD Specs & AI Architecture"
Cohesion: 0.12
Nodes (20): Next.js Agent Rules, Claude Project Instructions, AI Trip Planner Pipeline, Alternative Itinerary Scenarios, Budget Engine, TripCraft Database Schema, Itinerary Engine, Maps Integration (+12 more)

### Community 10 - "DevDependencies & Tooling"
Cohesion: 0.11
Nodes (19): babel-plugin-react-compiler, eslint, eslint-config-next, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss (+11 more)

### Community 12 - "App Root Layout & Fonts"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

## Knowledge Gaps
- **99 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+94 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TripPlan` connect `Trip API & Chat Handlers` to `Destination & Configuration API`, `Itinerary Views & Chatbot`, `Landing Page & Config Wizard`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `Button()` connect `Itinerary Views & Chatbot` to `Destination & Configuration API`, `Dialog & Sheet Modals`, `Landing Page & Config Wizard`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _99 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Destination & Configuration API` be split into smaller, more focused modules?**
  _Cohesion score 0.1371794871794872 - nodes in this community are weakly interconnected._
- **Should `Itinerary Views & Chatbot` be split into smaller, more focused modules?**
  _Cohesion score 0.10967741935483871 - nodes in this community are weakly interconnected._
- **Should `TypeScript Environment References` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `Landing Page & Config Wizard` be split into smaller, more focused modules?**
  _Cohesion score 0.09852216748768473 - nodes in this community are weakly interconnected._