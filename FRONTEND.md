# FRONTEND.md — UI Patterns & Component Architecture

---

## Layout Model

The app is a single full-screen view. The map occupies 100% of the viewport. The chat panel floats on top as a draggable bottom sheet. There are no traditional pages with navigation — everything happens on one screen.

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│           Mapbox Map Canvas             │
│         (full screen, z-index 0)        │
│                                         │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │      Chat Panel (bottom sheet)    │  │
│  │      draggable, z-index 10        │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Message history            │  │  │
│  │  │  ...                        │  │  │
│  │  │  Maya: Här är tre resmål... │  │  │
│  │  └─────────────────────────────┘  │  │
│  │  [ Skriv ett meddelande...    ↑ ] │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## Mapbox GL JS Integration

### Initialisation
The map is initialised once and lives for the entire app session. It is never unmounted. This is critical — Mapbox GL instances are expensive to create and maps do not survive React re-renders gracefully.

```typescript
// src/features/map/MapCanvas.tsx
const mapRef = useRef<mapboxgl.Map | null>(null);
const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (mapRef.current || !containerRef.current) return;
  
  mapRef.current = new mapboxgl.Map({
    container: containerRef.current,
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [18.0686, 59.3293], // Stockholm
    zoom: 4,
    accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
  });

  return () => {
    mapRef.current?.remove();
    mapRef.current = null;
  };
}, []); // Empty deps — run once only
```

### The Map Context
The map instance is shared via a React context so child components (FlightArc, LayerControls, DestinationCard) can access it without prop drilling:

```typescript
// src/features/map/MapContext.tsx
export const MapContext = createContext<mapboxgl.Map | null>(null);
export const useMap = () => useContext(MapContext);
```

### Custom POI Layers
Each POI category (beaches, hiking, restaurants) is a Mapbox source + layer pair. They are added on map load and toggled by visibility:

```typescript
map.setLayoutProperty('beaches-layer', 'visibility', 'visible'); // or 'none'
```

Layer IDs follow the convention: `<category>-source` and `<category>-layer`.

---

## Processing `mapActions`

The `useMapActions` hook is the bridge between the AI and the map. It listens for new Maya responses and translates `mapActions` into Mapbox operations.

```typescript
// src/hooks/useMapActions.ts
export function useMapActions() {
  const map = useMap();
  const lastResponse = useChatStore(s => s.lastResponse);

  useEffect(() => {
    if (!map || !lastResponse?.mapActions) return;

    lastResponse.mapActions.forEach(action => {
      if (action.type === 'flyTo' && action.lat && action.lng) {
        drawFlightArc(map, {
          from: [18.0686, 59.3293], // Stockholm origin
          to: [action.lng, action.lat],
          destination: action.destination ?? '',
          price: action.price ?? '',
        });
      }
    });
  }, [lastResponse, map]);
}
```

**Rules:**
- Map updates are always side effects of `mapActions` — never triggered directly by chat components
- Chat components write to `useChatStore`, never to `useMapStore`
- `useMapActions` is mounted once at the app root level

---

## Chat Panel Architecture

The chat panel is a bottom sheet with three states: **collapsed** (just the input bar visible), **half** (40% height), **expanded** (80% height). The user can drag between states.

### Component tree
```
ChatPanel
├── DragHandle             (drag to resize)
├── MessageList
│   ├── UserMessage
│   └── MayaMessage
│       └── TypingIndicator  (shown while streaming)
└── InputBar
    ├── TextInput
    └── SendButton
```

### Conversation state
```typescript
// src/store/useChatStore.ts
interface ChatStore {
  messages: Message[];
  lastResponse: MayaResponse | null;
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
}
```

`sendMessage` calls `chatService.send()`, sets `isLoading`, and on response: appends Maya's message to `messages` and sets `lastResponse` (which triggers `useMapActions`).

---

## Zustand Store Patterns

### Store structure
```typescript
export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  lastResponse: null,
  isLoading: false,

  sendMessage: async (text) => {
    const userMessage: Message = { role: 'user', content: text };
    set(s => ({ messages: [...s.messages, userMessage], isLoading: true }));

    try {
      const response = await chatService.send([...get().messages, userMessage]);
      const mayaMessage: Message = { role: 'assistant', content: response.text };
      set(s => ({
        messages: [...s.messages, mayaMessage],
        lastResponse: response,
        isLoading: false,
      }));
    } catch (err) {
      set({ isLoading: false });
      // handle error
    }
  },
}));
```

### Selector pattern
Always select the minimum slice of state needed:
```typescript
// Good — only re-renders when isLoading changes
const isLoading = useChatStore(s => s.isLoading);

// Bad — re-renders on any store change
const store = useChatStore();
```

---

## API Service Layer

All API calls go through a central Axios instance with token injection:

```typescript
// src/services/api.ts
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      await useAuthStore.getState().refreshToken();
      return api.request(err.config); // retry original request
    }
    return Promise.reject(err);
  }
);
```

---

## Language Detection

Maya responds in the user's language. The frontend reads `navigator.language` on app load and sends it as `userLocale` with every chat request.

```typescript
// src/services/chatService.ts
const userLocale = navigator.language; // e.g. "sv-SE", "en-GB", "de-DE"

export const send = (messages: Message[]) =>
  api.post<MayaResponse>('/api/chat', { messages, userLocale });
```

The backend injects `userLocale` into the Claude system prompt so Maya matches the user's language automatically. If the user types in a different language than their locale, Maya follows the written language.

**UI copy** (buttons, placeholders, labels) is in English for v1. Full UI internationalisation (i18n) is a v2 concern.

---

## Styling Conventions

- CSS Modules for component-scoped styles: `ChatPanel.module.css`
- Global CSS variables for the design system (colours, spacing, typography) in `src/styles/globals.css`
- No inline styles
- Dark map theme as the base — UI components use dark backgrounds with high contrast text

### Design tokens (CSS variables)
```css
:root {
  --color-bg: #0f0f14;
  --color-surface: #1a1a24;
  --color-surface-elevated: #252534;
  --color-text-primary: #f0f0f5;
  --color-text-secondary: #8888aa;
  --color-accent: #4f8ef7;
  --color-accent-hover: #6aa0ff;
  --border-radius-sm: 8px;
  --border-radius-md: 16px;
  --border-radius-lg: 24px;
}
```
