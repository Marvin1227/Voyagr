# DEVELOPMENT.md — Coding Standards & Local Setup

---

## Local Setup

### Prerequisites
- Node.js 20+
- Java 21 (JDK)
- Docker + Docker Compose
- Git

### First-time setup

```bash
# 1. Clone the repo
git clone https://github.com/your-org/voyagr.git
cd voyagr

# 2. Start the database
docker-compose up -d

# 3. Set up backend environment
cp backend/.env.example backend/.env
# Fill in your API keys in backend/.env

# 4. Start the backend
cd backend
./mvnw spring-boot:run

# 5. Set up frontend environment
cp frontend/.env.example frontend/.env
# frontend/.env contains only public config (Mapbox token)

# 6. Start the frontend
cd frontend
npm install
npm run dev
```

App runs at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- Database: `localhost:5432`

---

## Environment Variables

### `backend/.env`
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

### `frontend/.env`
```
VITE_API_BASE_URL=http://localhost:8080
VITE_MAPBOX_TOKEN=
```

**Rules:**
- Never commit `.env` files (both are in `.gitignore`)
- Never put secret keys in `frontend/.env` — Vite exposes all `VITE_` vars to the browser
- Keep `.env.example` files up to date when adding new variables

---

## Java Conventions (Backend)

### Package naming
```
com.voyagr.<layer>.<feature>
```
Examples: `com.voyagr.service.ChatService`, `com.voyagr.controller.AuthController`

### Naming
| Type | Convention | Example |
|---|---|---|
| Classes | PascalCase | `RagOrchestrator` |
| Methods | camelCase | `buildSystemPrompt()` |
| Constants | UPPER_SNAKE_CASE | `MAX_TOKEN_LENGTH` |
| Variables | camelCase | `accessToken` |

### Controller rules
- Controllers handle HTTP only: validate input, call service, return response
- No business logic in controllers
- Return `ResponseEntity<T>` with explicit HTTP status codes
- Use `@Valid` for request body validation

### Service rules
- All business logic lives in services
- Services are the only layer that calls repositories or external clients
- One service per domain area (Auth, Chat, User)

### DTO rules
- Separate request and response DTOs — never expose JPA entities directly
- DTOs are records (Java 16+) where possible:  `public record LoginRequest(String email, String password) {}`

### Error handling
- Use `@ControllerAdvice` with `@ExceptionHandler` for global error handling
- Return structured error responses: `{ "error": "message", "code": "ERROR_CODE" }`
- Never return raw exception stack traces to the client

---

## TypeScript/React Conventions (Frontend)

### File naming
| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `ChatPanel.tsx` |
| Hooks | camelCase with `use` prefix | `useMapActions.ts` |
| Services | camelCase with `Service` suffix | `chatService.ts` |
| Stores | camelCase with `use` prefix | `useChatStore.ts` |
| Types | PascalCase | `MapAction.ts` |

### Component rules
- One component per file
- Props interface defined above the component: `interface ChatPanelProps { ... }`
- No inline styles — use CSS modules or Tailwind classes
- Separate logic from rendering: extract complex logic into hooks

### TypeScript rules
- No `any` types — if you're tempted, define an interface instead
- Prefer `interface` over `type` for object shapes
- Explicit return types on all service functions and hooks

### The `mapActions` contract type
Always use this shared type definition:

```typescript
// src/types/ai.ts
export interface MapAction {
  type: 'flyTo' | 'showLayer' | 'clearMarkers';
  destination?: string;
  lat?: number;
  lng?: number;
  price?: string;
  summary?: string;
}

export interface MayaResponse {
  text: string;
  mapActions: MapAction[];
}
```

### State management rules
- Local UI state (open/closed, hover) → `useState`
- Shared app state (auth, chat history, map state) → Zustand store
- Never put derived state in the store — compute it with selectors

---

## Definition of Done

A feature is done when:
- [ ] Code is written and works as described in requirements
- [ ] Unit tests written and passing
- [ ] No TypeScript errors (`npm run typecheck` passes)
- [ ] No linter errors (`npm run lint` / `./mvnw checkstyle:check` passes)
- [ ] PR opened with description, screenshots if UI change
- [ ] At least 1 team member has reviewed and approved
- [ ] Merged to `main` via squash merge

---

## Running Tests

```bash
# Frontend tests
cd frontend
npm run test          # run all
npm run test:watch    # watch mode

# Backend tests
cd backend
./mvnw test           # run all
./mvnw test -pl :unit # unit tests only (if modules configured)
```

---

## Code Quality Tools

| Tool | Config file | What it checks |
|---|---|---|
| ESLint | `frontend/.eslintrc` | JS/TS lint rules |
| Prettier | `frontend/.prettierrc` | Code formatting |
| Checkstyle | `backend/checkstyle.xml` | Java style rules |
| TypeScript | `frontend/tsconfig.json` | Type checking |

Run all checks before opening a PR:
```bash
# Frontend
npm run lint && npm run typecheck

# Backend
./mvnw checkstyle:check
```
