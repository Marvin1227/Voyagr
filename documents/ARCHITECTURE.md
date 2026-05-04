# ARCHITECTURE.md — Voyagr System Design

---

## Overview

Voyagr is a monorepo containing a React SPA frontend and a Spring Boot backend. The two communicate exclusively via a REST API. All external service calls originate from the backend — the frontend never talks to external APIs directly.

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

---

## Frontend Architecture

**React 18 + Vite SPA.** No server-side rendering. The app is a single page with two dominant UI zones: the full-screen Mapbox map and the floating chat panel.

### State Management

Zustand is used for global state. Three primary stores:

| Store | Responsibility |
|---|---|
| `useAuthStore` | JWT tokens, user session, login/logout |
| `useChatStore` | Conversation history, loading state, Maya's responses |
| `useMapStore` | Active layers, flight arcs, destination cards, current viewport |

Chat and map stores are intentionally decoupled. The `mapActions` processor is a side-effect hook that reads from `useChatStore` and writes to `useMapStore` — neither store knows about the other directly.

### Component Structure

```
src/
├── features/
│   ├── chat/           # ChatPanel, MessageList, InputBar, TypingIndicator
│   ├── map/            # MapCanvas, FlightArc, DestinationCard, LayerControls
│   └── auth/           # LoginForm, RegisterForm, AuthGuard
├── components/         # Shared UI (Button, Modal, Spinner, etc.)
├── hooks/
│   ├── useMapActions.ts    # Processes mapActions from AI responses
│   ├── useConversation.ts  # Manages chat history + API calls
│   └── useAuth.ts          # Token refresh, session management
├── services/
│   ├── api.ts          # Axios instance with interceptors (token injection, refresh)
│   ├── chatService.ts  # POST /api/chat
│   └── authService.ts  # POST /api/auth/login, /register, /refresh
├── store/              # Zustand stores
└── types/              # Shared TypeScript interfaces
```

---

## Backend Architecture

**Spring Boot 3.x, Java 21.** Layered architecture: Controller → Service → Repository.

### Package Structure

```
com.voyagr/
├── controller/
│   ├── AuthController.java     # /api/auth/**
│   ├── ChatController.java     # /api/chat
│   └── UserController.java     # /api/user/**
├── service/
│   ├── AuthService.java
│   ├── ChatService.java        # Orchestrates the RAG pipeline
│   └── UserService.java
├── ai/
│   ├── RagOrchestrator.java    # Fetches external data, builds Claude prompt
│   ├── ClaudeClient.java       # HTTP client for Anthropic API
│   └── MapActionParser.java    # Extracts mapActions from Claude's JSON response
├── external/
│   ├── WeatherClient.java      # OpenWeatherMap
│   ├── PlacesClient.java       # Google Places
│   └── FlightClient.java       # Skyscanner (or mock)
├── repository/
│   ├── UserRepository.java
│   └── ConversationRepository.java
├── model/                      # JPA entities
├── dto/                        # Request/response bodies
├── config/
│   ├── SecurityConfig.java     # Spring Security + JWT filter
│   └── CorsConfig.java
└── util/
    └── JwtUtil.java
```

---

## The RAG Pipeline

This is the core of Voyagr. Every chat message triggers this flow:

```
1. User sends message → POST /api/chat

2. RagOrchestrator runs in parallel:
   ├── WeatherClient.fetch(destination_hints)
   ├── PlacesClient.fetch(destination_hints)
   └── FlightClient.fetch(origin="Stockholm", hints)

3. Data assembled into a context block:
   {
     "flights": [...],
     "weather": {...},
     "places": [...]
   }

4. Claude API called with:
   - System prompt (Maya's personality + language rules + response format)
   - `userLocale` from the request (e.g. "sv-SE", "en-GB") — Maya responds in this language
   - Injected context block (real-time data)
   - Full conversation history
   - User's current message

5. Claude returns structured response:
   {
     "text": "...",
     "mapActions": [...]
   }

6. Response returned to frontend
7. Frontend: text → chat UI, mapActions → Mapbox
```

### Claude Response Contract

The system prompt instructs Claude to always return valid JSON in this exact shape:

```json
{
  "text": "Natural language response in the user's locale language",
  "mapActions": [
    {
      "type": "flyTo",
      "destination": "string",
      "lat": number,
      "lng": number,
      "price": "string (SEK)",
      "summary": "string"
    }
  ]
}
```

`mapActions` may be an empty array `[]` if the response does not involve map changes (e.g. a follow-up clarifying question).

---

## Database Schema (v1)

```sql
users
  id            UUID PRIMARY KEY
  email         VARCHAR UNIQUE NOT NULL
  password_hash VARCHAR NOT NULL          -- bcrypt
  created_at    TIMESTAMP

user_preferences
  user_id       UUID REFERENCES users(id)
  travel_style  VARCHAR                   -- nature, culture, adventure, relaxation
  budget_range  VARCHAR                   -- budget, mid, luxury
  dietary_prefs VARCHAR[]
  updated_at    TIMESTAMP

refresh_tokens
  id            UUID PRIMARY KEY
  user_id       UUID REFERENCES users(id)
  token_hash    VARCHAR NOT NULL
  expires_at    TIMESTAMP
  revoked       BOOLEAN DEFAULT FALSE

conversations
  id            UUID PRIMARY KEY
  user_id       UUID REFERENCES users(id)
  messages      JSONB                     -- full history array
  created_at    TIMESTAMP
  updated_at    TIMESTAMP
```

---

## Security Architecture

See `API-AUTH.md` for full detail. Summary:

- JWT access tokens (15 min) + refresh tokens (30 days)
- Spring Security filter validates token on every protected request
- All API keys in `backend/.env` — never in frontend, never committed to Git
- Frontend ↔ Backend: CORS restricted to `localhost:5173` in dev

---

## Key Design Decisions & Rationale

| Decision | Why |
|---|---|
| Monorepo | Easier to keep frontend types and backend DTOs in sync during early development |
| Spring Boot over Node.js | Java type safety + Spring Security maturity for auth is a better fit long-term |
| Mapbox over Google Maps | Custom layer support, better GL performance, premium visual quality |
| Zustand over Redux | Lower boilerplate; sufficient for this complexity level |
| Stateless RAG (no cache) | Travel data (prices, availability) changes too fast to cache meaningfully |
| JSON sidecar for mapActions | Keeps chat logic and map logic fully decoupled — either can change independently |
