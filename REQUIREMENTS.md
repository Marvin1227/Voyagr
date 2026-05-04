# requirements.md — Voyagr Product Requirements

---

## 1. Functional Requirements (v1 MVP)

### 1.1 User Authentication
- [ ] User can register with email + password
- [ ] User can log in and receive a JWT access token (15 min TTL) and refresh token (30 days TTL)
- [ ] Token refresh happens automatically without re-login
- [ ] User can log out (invalidates refresh token)
- [ ] Passwords stored with bcrypt

### 1.2 Maya AI Chat
- [ ] User can open a chat panel and send a message in any language
- [ ] Maya detects the user's language via `userLocale` (sent from `navigator.language` on the frontend) and responds in that language
- [ ] If `userLocale` is unrecognised or missing, Maya falls back to **English**
- [ ] If the user writes in a language that differs from their `userLocale`, Maya switches to match what the user is writing
- [ ] Maya asks follow-up questions to refine travel preferences before generating a plan
- [ ] Maya always provides at least two options: budget and premium
- [ ] Maya's responses include a `mapActions` array alongside chat text
- [ ] Conversation history is maintained within a session
- [ ] System prompt injects real-time data from external APIs before every Claude API call (RAG)

### 1.3 RAG Data Pipeline
- [ ] On every user query, the backend fetches:
  - Flight options from Skyscanner API (or mock in v1)
  - Weather data from OpenWeatherMap
  - POI data from Overture Maps / Google Places API
- [ ] Fetched data is injected into the Claude API system prompt
- [ ] AI response always contains concrete names, prices, and availability (no hallucinated data)

### 1.4 Interactive Map
- [ ] Map renders full-screen using Mapbox GL JS
- [ ] Chat panel floats over the map as a draggable bottom sheet
- [ ] Map animates flight arcs from Stockholm to suggested destinations
- [ ] Each arc displays the price inline
- [ ] Clicking an arc opens a destination card with: flight info, suggested hotels, top activities
- [ ] Map updates automatically when Maya replies (driven by `mapActions`)
- [ ] Map supports custom POI layers:
  - Beaches and swimming spots
  - Hiking trails and nature reserves
  - National parks
  - Local hidden gems (non-tourist)
  - Restaurants (filtered by preference and budget)
- [ ] User can type a "vibe filter" (e.g. "avkopplande ställen nära havet") and the map shows relevant layers

### 1.5 User Preferences
- [ ] User can set travel style (nature / culture / adventure / relaxation)
- [ ] User can set budget range
- [ ] User can set dietary preferences (affects restaurant recommendations)
- [ ] Preferences are persisted to the database and used in every RAG call

---

## 2. Non-Functional Requirements

### 2.1 Performance
- Map interactions (pan, zoom, layer toggle) must remain smooth at 60fps
- AI response time target: under 5 seconds end-to-end (including RAG data fetch)
- API endpoints respond within 500ms (excluding AI calls)

### 2.2 Security
- All API keys stored in backend `.env` — never in frontend code or version control
- All external API calls proxied through the Spring Boot backend
- JWT tokens validated on every protected request
- HTTPS enforced (when deployed)
- Passwords never stored in plaintext

### 2.3 Language & Localisation
- Maya responds in the user's browser language (`navigator.language`)
- Fallback language is English
- Maya adapts mid-conversation if the user switches language
- UI copy is in English by default (internationalisation of static UI text is a v2 concern)
- Dates and currencies formatted per the user's locale where possible; SEK used for Swedish locale

### 2.4 GDPR Compliance
- User can export all their personal data
- User can delete their account and all associated data
- No personal data stored outside the EU
- Explicit cookie consent on first visit
- Privacy policy and data retention policy documented

### 2.5 Accessibility
- Keyboard navigable chat panel
- Map controls accessible via keyboard
- Minimum contrast ratio WCAG AA

---

## 3. Out of Scope — v1

The following features are **intentionally excluded** from v1 to keep scope manageable. They are planned for future versions.

| Feature | Reason deferred |
|---|---|
| Native flight/hotel booking (Amadeus, Booking.com) | Requires partner agreements + payment flow |
| Stripe payments | Depends on booking integration |
| Boarding passes / digital room keys | Requires direct airline API agreements |
| Group trip planning | Significant UX + backend complexity |
| Real-time budget tracker | Depends on booking data |
| Proactive push notifications | Requires booking + deployment infrastructure |
| Mobile app (iOS/Android) | Post-web launch |
| Multi-language support (beyond Swedish) | Post-MVP |

---

## 4. Future Considerations

- When booking is added, all booking data lives in Voyagr (not email inboxes)
- "Min Resa" view will aggregate: boarding passes, hotel keys, day plans, booking references
- Price prediction and "notify me when price drops" feature
- Offline map caching for use during travel
