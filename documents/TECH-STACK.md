# TECH-STACK.md — What We Use and Why

---

## Frontend

### React 18
**Purpose:** UI component framework  
**Why:** Industry standard, large ecosystem, strong TypeScript support. Concurrent rendering is useful for the chat + map dual-pane layout where both update independently.  
**Considered and rejected:** Vue 3 (smaller ecosystem for mapping libraries), Svelte (less team familiarity)

### Vite 5
**Purpose:** Build tool and dev server  
**Why:** Dramatically faster HMR than Webpack/CRA. Near-instant cold starts in development, which matters when iterating on map and chat interactions.  
**Considered and rejected:** Create React App (slow, deprecated), Next.js (SSR overhead not needed for a SPA with no SEO requirements in v1)

### TypeScript
**Purpose:** Type safety across the frontend codebase  
**Why:** The AI response contract (`mapActions`, conversation history) and API service layer benefit enormously from strong typing. Catches errors at compile time that would otherwise surface as map animation bugs.

### Zustand
**Purpose:** Global state management  
**Why:** Minimal boilerplate, simple API, sufficient for our three-store model (auth, chat, map). Redux would add significant overhead for no benefit at this team size.  
**Considered and rejected:** Redux Toolkit (over-engineered for this scope), React Context (performance issues with high-frequency map state updates), Jotai (less conventional, smaller community)

### Mapbox GL JS v3
**Purpose:** Interactive map rendering  
**Why:** Native support for custom vector tile layers (essential for our beach/hiking/POI layers). Better WebGL performance than Leaflet. More customisable than Google Maps — we can style every element to match Voyagr's visual identity.  
**Considered and rejected:** Google Maps JS API (limited custom layer support, usage costs scale poorly), Leaflet (not GPU-accelerated, limited 3D/animation support), Deck.gl (great for data viz but overkill here)

### Axios
**Purpose:** HTTP client  
**Why:** Interceptors make JWT injection and token refresh transparent. Cleaner than raw `fetch` for this level of API interaction.

---

## Backend

### Java 21
**Purpose:** Backend runtime  
**Why:** LTS release, virtual threads (Project Loom) improve throughput for the many parallel HTTP calls in the RAG pipeline. Strong typing matches well with the structured data contracts between AI and map.

### Spring Boot 3.x
**Purpose:** Application framework  
**Why:** Spring Security is mature and well-understood for JWT auth. Auto-configuration reduces boilerplate. The team's likely prior Java exposure makes it the pragmatic choice.  
**Considered and rejected:** Node.js/Express (weaker typing, Spring Security maturity hard to match), Quarkus (smaller community, less documentation for our use cases)

### Spring Security
**Purpose:** Authentication and authorisation  
**Why:** Battle-tested JWT filter chain, role-based access control, straightforward integration with our refresh token pattern.

### PostgreSQL 16
**Purpose:** Primary database  
**Why:** JSONB support for storing conversation history as structured JSON without a separate schema. Reliable, open-source, excellent Spring Data JPA integration.  
**Considered and rejected:** MongoDB (no real benefit for our data shape, extra operational complexity), MySQL (JSONB support inferior to PostgreSQL)

### Spring Data JPA + Hibernate
**Purpose:** ORM / database access layer  
**Why:** Reduces boilerplate for standard CRUD operations. The repository pattern maps cleanly onto our data model.

---

## AI & Data

### Anthropic Claude API (`claude-sonnet-4-20250514`)
**Purpose:** Powers Maya, the AI travel assistant  
**Why:** Best-in-class instruction following for structured JSON output (critical for the `mapActions` contract). Swedish language capability. Context window large enough to hold full conversation history + RAG data in a single call.

### OpenWeatherMap API
**Purpose:** Weather data for RAG pipeline  
**Why:** Free tier sufficient for v1. Reliable, well-documented, returns forecast data we can inject into the Claude prompt to inform seasonal recommendations.

### Google Places API
**Purpose:** Restaurants, hotels, and points of interest  
**Why:** Most comprehensive POI database globally. Rating and review data improves recommendation quality. Familiar API with good Java client support.

### Overture Maps
**Purpose:** Beaches, hiking trails, national parks, nature POI  
**Why:** Free and open. Fills the gap Google Places has for nature-specific data (beaches, trails, parks). The combination of Overture + Google Places gives us comprehensive coverage across all our POI layer categories.

---

## Infrastructure (Local Dev)

### Docker Compose
**Purpose:** Local PostgreSQL instance  
**Why:** Ensures all developers run the same database version without local installation differences. One command setup: `docker-compose up`.

### `.env` files
**Purpose:** Local environment variable management  
**Why:** Standard approach. Backend reads from `backend/.env`, frontend reads from `frontend/.env` (Vite env vars, public config only — no secrets).

---

## Testing

### Jest + React Testing Library
**Purpose:** Frontend unit tests  
**Why:** RTL encourages testing behaviour over implementation, which is important for components where Mapbox and chat state interact.

### JUnit 5 + Mockito
**Purpose:** Backend unit tests  
**Why:** Standard Java testing stack. Mockito makes it straightforward to mock external API clients (Claude, Weather, Places) in unit tests without real HTTP calls.

---

## What We Evaluated and Rejected (Summary)

| Technology | Rejected in favour of | Reason |
|---|---|---|
| Next.js | React + Vite | No SSR needed; SPA is simpler |
| Redux | Zustand | Too much boilerplate for our team size |
| Google Maps | Mapbox GL JS | Custom POI layers, better GL performance |
| MongoDB | PostgreSQL | JSONB gives us document storage without sacrificing relational guarantees |
| Node.js backend | Spring Boot | Spring Security maturity, Java type safety |
| Leaflet | Mapbox GL JS | No GPU acceleration, limited animation |
