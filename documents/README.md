# Voyagr

AI-driven travel planning web app. Instead of filling in search forms, the user has a conversation with **Maya** — an AI travel assistant who builds a complete, visual trip plan shown live on an interactive map.

> Voyagr replaces search-based travel platforms with a conversational AI agent that thinks, plans, and visualises trips on a map.

---

## How it works

1. User opens the chat panel and describes where they want to go
2. Maya asks follow-up questions and fetches live flight, weather, and POI data
3. Maya responds with a message **and** a `mapActions` sidecar
4. The map animates flight arcs, destination cards, and POI layers — automatically

```json
{
  "text": "Här är tre varma resmål i Europa...",
  "mapActions": [
    { "type": "flyTo", "destination": "Malaga", "lat": 36.72, "lng": -4.42, "price": "1 200 kr" },
    { "type": "flyTo", "destination": "Kreta",  "lat": 35.24, "lng": 24.80, "price": "1 450 kr" }
  ]
}
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 (SPA) |
| Backend | Spring Boot 3.x (Java 21) |
| Map | Mapbox GL JS v3 |
| AI | Claude API (`claude-haiku-4.5`) |
| State | Zustand |
| Database | PostgreSQL 16 |
| Auth | JWT + Spring Security |
| POI data | Google Places API + Overture Maps |
| Weather | OpenWeatherMap API |

---

## Local setup

### Prerequisites

- Node.js 20+
- Java 21 (JDK)
- Docker + Docker Compose

### First-time setup

```bash
# 1. Clone
git clone https://github.com/your-org/voyagr.git
cd voyagr

# 2. Start the database
docker-compose up -d

# 3. Backend environment
cp backend/.env.example backend/.env
# Fill in your API keys in backend/.env

# 4. Start the backend
cd backend
./mvnw spring-boot:run

# 5. Frontend environment
cp frontend/.env.example frontend/.env
# Add your Mapbox token to frontend/.env

# 6. Start the frontend
cd frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| Database | localhost:5432 |

### Environment variables

**`backend/.env`** (never committed)
```
DATABASE_URL=jdbc:postgresql://localhost:5432/voyagr
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=<minimum 32 random bytes, base64 encoded>
ANTHROPIC_API_KEY=
GOOGLE_PLACES_API_KEY=
OPENWEATHERMAP_API_KEY=
SKYSCANNER_API_KEY=
```

**`frontend/.env`** (public config only — no secrets)
```
VITE_API_BASE_URL=http://localhost:8080
VITE_MAPBOX_TOKEN=
```

---

## Architecture overview

```
Browser (React SPA)
        │
        │  REST / JSON
        ▼
Spring Boot API (Java 21)
        │
        ├── Claude API (Anthropic)     ← AI responses
        ├── Skyscanner / mock          ← Flight data (RAG)
        ├── OpenWeatherMap             ← Weather data (RAG)
        ├── Google Places API          ← Restaurants & POI
        ├── Overture Maps              ← Beaches, trails, parks
        └── PostgreSQL                 ← User data, preferences, sessions
```

Every chat message triggers the RAG pipeline: weather, flights, and POI data are fetched in parallel, injected into the Claude prompt, and the response drives both the chat UI and the map simultaneously.

See [ARCHITECTURE.md](ARCHITECTURE.md) for full detail including the database schema, package structure, and the AI ↔ Map coupling pattern.

---

## Monorepo structure

```
voyagr/
├── frontend/               # React + Vite SPA
│   └── src/
│       ├── features/       # chat/, map/, auth/
│       ├── hooks/          # useMapActions, useConversation, useAuth
│       ├── services/       # Axios API layer
│       ├── store/          # Zustand stores (auth, chat, map)
│       └── types/          # Shared TypeScript interfaces
│
├── backend/                # Spring Boot API
│   └── src/main/java/com/voyagr/
│       ├── controller/     # REST endpoints
│       ├── service/        # Business logic
│       ├── ai/             # RAG pipeline + Claude client
│       ├── external/       # Weather, Places, Flight clients
│       └── config/         # Security, CORS
│
└── docker-compose.yml      # Local PostgreSQL
```

---

## Running tests

```bash
# Frontend (Jest + React Testing Library)
cd frontend
npm run test
npm run test:coverage

# Backend (JUnit 5 + Mockito)
cd backend
./mvnw test
./mvnw verify   # tests + coverage report
```

Coverage target: 70% on logic code (services, hooks, utilities). See [TESTING.md](TESTING.md) for examples.

---

## Contributing

We use **GitHub Flow** and **Conventional Commits**.

```bash
# Start a feature
git checkout main && git pull
git checkout -b feature/your-feature-name

# Commit format
feat(chat): add draggable bottom sheet panel
fix(map): prevent arc animation crash on empty mapActions
```

PRs require 1 approval and passing tests before merge. Squash-merge only.

See [GIT-WORKFLOW.md](GIT-WORKFLOW.md) for the full workflow and PR template.

---

## Key rules

- **No API keys in frontend code** — all external calls go through Spring Boot
- **Map updates come only from `mapActions`** — never triggered directly by chat components
- **RAG is stateless** — fresh data fetched on every AI call, no caching
- **Maya responds in the user's browser language** (`navigator.language` → `userLocale`)

---

## Documentation

| File | Contents |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, RAG pipeline, database schema |
| [FRONTEND.md](FRONTEND.md) | UI patterns, Mapbox integration, Zustand stores |
| [API-AUTH.md](API-AUTH.md) | JWT auth flow, Spring Security, GDPR |
| [TECH-STACK.md](TECH-STACK.md) | Technology choices and trade-offs |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Coding standards, conventions, definition of done |
| [TESTING.md](TESTING.md) | Test strategy and examples |
| [GIT-WORKFLOW.md](GIT-WORKFLOW.md) | Branching, commits, PR process |
| [requirements.md](requirements.md) | Full functional and non-functional requirements |

---

## MVP scope

**In v1:**
- Maya AI chat (conversational travel planning, language-aware)
- Mapbox map with animated flight arcs, destination cards, POI layers
- RAG pipeline (live flight, weather, and POI data injected into every AI call)
- JWT authentication + user preferences

**Out of scope for v1:** native booking, Stripe payments, boarding passes, group trips, mobile app.
