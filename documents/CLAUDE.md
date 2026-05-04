# CLAUDE.md — Voyagr Master Context

> Paste this file at the start of every Claude prompt to give full project awareness.

---

## What is Voyagr?

Voyagr is an AI-driven travel planning web app. The core idea: instead of filling in search forms, the user has a conversation with an AI assistant (Maya) who builds a complete, visual travel plan — shown live on an interactive map.

**One sentence:** Voyagr replaces search-based travel platforms with a conversational AI agent that thinks, plans, and visualizes trips on a map.

---

## MVP Scope (v1)

**In scope:**
- Maya AI chat (conversational travel planning in Swedish)
- Mapbox map with animated flight arcs, destination cards, and POI layers
- AI ↔ Map coupling (Maya's responses update the map automatically via `mapActions`)
- RAG pipeline (real-time data from external APIs injected into every Claude prompt)
- User authentication (JWT)
- Basic user preferences (travel style, budget range)

**Explicitly out of scope for v1:**
- Native flight/hotel booking (Amadeus, Booking.com)
- Stripe payments
- Boarding passes / digital room keys
- Group trip planning
- Real-time budget tracker
- Proactive push notifications
- Mobile app

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React + Vite (SPA) | React 18, Vite 5 |
| Backend | Spring Boot (Java) | Java 21, Spring Boot 3.x |
| Map | Mapbox GL JS | v3 |
| AI | Claude API (Anthropic) | claude-sonnet-4-20250514 |
| POI data | Overture Maps (open) | — |
| Restaurants/Places | Google Places API | — |
| Weather | OpenWeatherMap API | — |
| Auth | JWT + Spring Security | — |
| Database | PostgreSQL | 16 |
| Build tool | Vite | 5 |
| Testing (FE) | Jest + React Testing Library | — |
| Testing (BE) | JUnit 5 + Mockito | — |

---

## Monorepo Structure

```
voyagr/
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── features/       # Feature modules (chat, map, auth)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API call layer
│   │   ├── store/          # Zustand state management
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helpers
│   ├── public/
│   └── vite.config.ts
│
├── backend/                # Spring Boot API
│   └── src/main/java/com/voyagr/
│       ├── controller/     # REST endpoints
│       ├── service/        # Business logic
│       ├── repository/     # Database access (JPA)
│       ├── model/          # JPA entities
│       ├── dto/            # Request/response shapes
│       ├── config/         # Spring config (Security, CORS)
│       └── ai/             # RAG pipeline + Claude integration
│
├── docs/                   # All documentation lives here
└── docker-compose.yml      # Local PostgreSQL
```

---

## Key Architectural Decisions

1. **All API keys live in backend `.env` only** — frontend never touches external API keys directly.
2. **AI responses carry a `mapActions` sidecar** — structured JSON that the map consumes independently of chat text.
3. **RAG is stateless per request** — fresh data fetched on every AI call; no caching of travel data.
4. **Swedish language** — Maya always responds in Swedish. System prompt enforces this.
5. **Mapbox GL JS over Google Maps** — more customizable, supports custom POI layers natively.
6. **Zustand over Redux** — lower boilerplate, sufficient for this app's state complexity.

---

## The AI ↔ Map Coupling Pattern

Every Maya response returns two things:

```json
{
  "text": "Här är tre varma resmål i Europa...",
  "mapActions": [
    { "type": "flyTo", "destination": "Malaga", "lat": 36.72, "lng": -4.42, "price": "1 200 kr" },
    { "type": "flyTo", "destination": "Kreta",  "lat": 35.24, "lng": 24.80, "price": "1 450 kr" }
  ]
}
```

The frontend parses `mapActions` and drives Mapbox animations. `text` drives the chat UI. They are independent but always delivered together.

---

## Maya's Personality (System Prompt Summary)

- Responds in **the user's language**, detected from the browser's `Accept-Language` / `navigator.language` sent as `userLocale` in every request
- Falls back to **English** if the locale is unrecognised
- Tone: enthusiastic but concrete — never vague
- Always provides budget + luxury alternatives when suggesting destinations
- Asks follow-up questions to refine preferences before committing to a plan
- Never fabricates prices — only uses data from the RAG pipeline

The system prompt contains: *"Always respond in the language indicated by the userLocale field. If userLocale is 'sv', respond in Swedish. If 'en', respond in English. Match the language exactly — do not switch mid-conversation unless the user writes in a different language."*

---

## What to Keep in Mind When Coding

- Never put API keys in frontend code
- All external API calls go through the Spring Boot backend
- Map state is driven by `mapActions` — do not manually trigger map updates from chat components
- Follow Conventional Commits for all commits
- All PRs require 1 review before merging to `main`
- Tests must pass before merge
