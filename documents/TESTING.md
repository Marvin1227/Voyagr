# TESTING.md — How We Verify Things Work

---

## Philosophy

We write **unit tests only** for v1. The goal is confidence in the logic that is hardest to debug manually: AI response parsing, auth token handling, the RAG pipeline, and mapActions processing.

Tests should be fast (no real HTTP calls), focused (one behaviour per test), and maintained alongside the code they test. A test that nobody trusts or runs is worse than no test.

**Coverage target: 70% minimum** on both frontend and backend, measured on logic code (services, hooks, utilities) — not on config files, DTOs, or generated code.

---

## Frontend Testing (Jest + React Testing Library)

### What we test

| Area | What to test |
|---|---|
| `useMapActions` hook | Does it call the correct Mapbox method for each `mapAction` type? |
| `MayaResponse` parsing | Does the service correctly extract `text` and `mapActions` from the API response? |
| `useChatStore` | Does `sendMessage` append messages correctly? Does it handle loading/error states? |
| `useAuth` / `useAuthStore` | Does token refresh fire correctly on 401? Does logout clear state? |
| `InputBar` component | Does it disable on loading? Does it clear after send? |
| `MayaMessage` component | Does it render markdown correctly? Does it handle empty `mapActions`? |

### What we do NOT test

- Mapbox GL JS rendering (it's a third-party canvas, not our logic)
- External API responses (mocked at the service layer)
- CSS / visual appearance

### Test file location
Co-locate tests with the files they test:
```
src/hooks/useMapActions.ts
src/hooks/useMapActions.test.ts

src/features/chat/ChatPanel.tsx
src/features/chat/ChatPanel.test.tsx
```

### Example: testing mapActions processing

```typescript
// src/hooks/useMapActions.test.ts
import { renderHook } from '@testing-library/react';
import { useMapActions } from './useMapActions';
import { useChatStore } from '../store/useChatStore';

const mockFlyTo = jest.fn();
jest.mock('../features/map/MapContext', () => ({
  useMap: () => ({ flyTo: mockFlyTo }),
}));

it('calls flyTo when mapAction type is flyTo', () => {
  useChatStore.setState({
    lastResponse: {
      text: 'Här är ett resmål',
      mapActions: [{ type: 'flyTo', lat: 36.72, lng: -4.42, destination: 'Malaga' }],
    },
  });

  renderHook(() => useMapActions());

  expect(mockFlyTo).toHaveBeenCalledWith(
    expect.objectContaining({ center: [-4.42, 36.72] })
  );
});
```

### Example: testing store behaviour

```typescript
// src/store/useChatStore.test.ts
import { act } from '@testing-library/react';
import { useChatStore } from './useChatStore';
import * as chatService from '../services/chatService';

jest.mock('../services/chatService');

it('appends user and assistant messages after sendMessage', async () => {
  (chatService.send as jest.Mock).mockResolvedValue({
    text: 'Maya svarar',
    mapActions: [],
  });

  await act(async () => {
    await useChatStore.getState().sendMessage('Jag vill resa till Spanien');
  });

  const { messages } = useChatStore.getState();
  expect(messages).toHaveLength(2);
  expect(messages[0].role).toBe('user');
  expect(messages[1].role).toBe('assistant');
  expect(messages[1].content).toBe('Maya svarar');
});
```

### Running frontend tests
```bash
cd frontend
npm run test           # single run
npm run test:watch     # watch mode during development
npm run test:coverage  # with coverage report
```

---

## Backend Testing (JUnit 5 + Mockito)

### What we test

| Class | What to test |
|---|---|
| `RagOrchestrator` | Does it call all external clients? Does it build the context block correctly? |
| `ClaudeClient` | Does it correctly parse the JSON response into `MayaResponse`? Does it handle malformed JSON? |
| `MapActionParser` | Does it extract `mapActions` from various valid and invalid response shapes? |
| `AuthService` | Does login return tokens? Does it reject wrong passwords? |
| `JwtUtil` | Does it generate valid tokens? Does it reject expired tokens? |
| `ChatController` | Does it return 401 for unauthenticated requests? Does it return 200 with the right shape? |

### What we do NOT test

- Spring Boot infrastructure (autoconfiguration, JPA wiring)
- External API responses (all external clients are mocked with Mockito)
- Database queries in isolation (tested via integration tests in v2)

### Test file location
Mirror the main source tree under `src/test`:
```
src/main/java/com/voyagr/ai/RagOrchestrator.java
src/test/java/com/voyagr/ai/RagOrchestratorTest.java
```

### Example: testing the RAG orchestrator

```java
// RagOrchestratorTest.java
@ExtendWith(MockitoExtension.class)
class RagOrchestratorTest {

    @Mock WeatherClient weatherClient;
    @Mock PlacesClient placesClient;
    @Mock FlightClient flightClient;

    @InjectMocks RagOrchestrator orchestrator;

    @Test
    void shouldIncludeWeatherDataInContext() {
        when(weatherClient.fetch(any())).thenReturn(new WeatherData("Soligt", 24));
        when(placesClient.fetch(any())).thenReturn(List.of());
        when(flightClient.fetch(any())).thenReturn(List.of());

        RagContext context = orchestrator.buildContext("Malaga");

        assertThat(context.weather().description()).isEqualTo("Soligt");
        verify(weatherClient).fetch("Malaga");
    }
}
```

### Example: testing JWT validation

```java
// JwtUtilTest.java
class JwtUtilTest {

    JwtUtil jwtUtil = new JwtUtil("test-secret-key-minimum-32-chars-long");

    @Test
    void shouldGenerateAndValidateToken() {
        String token = jwtUtil.generateAccessToken("user-uuid-123");
        assertThat(jwtUtil.isValid(token)).isTrue();
        assertThat(jwtUtil.extractUserId(token)).isEqualTo("user-uuid-123");
    }

    @Test
    void shouldRejectExpiredToken() {
        String expired = jwtUtil.generateTokenWithExpiry("user-uuid-123", Duration.ZERO);
        assertThat(jwtUtil.isValid(expired)).isFalse();
    }
}
```

### Running backend tests
```bash
cd backend
./mvnw test                          # all tests
./mvnw test -Dtest=RagOrchestratorTest  # specific class
./mvnw verify                        # tests + coverage report (target/site/jacoco)
```

---

## Coverage Reports

```bash
# Frontend
npm run test:coverage
# Report at: frontend/coverage/index.html

# Backend
./mvnw verify
# Report at: backend/target/site/jacoco/index.html
```

Minimum coverage thresholds (enforced in CI when added):
- Frontend: 70% line coverage on `src/hooks/` and `src/store/`
- Backend: 70% line coverage on `service/` and `ai/`

---

## What v2 Testing Will Add

These are out of scope for v1 but planned:
- Integration tests for the full RAG pipeline (real DB, mocked external APIs)
- Contract tests for the `MayaResponse` JSON shape
- E2E tests for the auth flow (Playwright)
