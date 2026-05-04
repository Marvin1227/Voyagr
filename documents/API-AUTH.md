# API-AUTH.md — Authentication & Security

---

## Authentication Strategy

Voyagr uses **JWT (JSON Web Tokens)** with a dual-token pattern: a short-lived access token for API calls and a long-lived refresh token for session continuity.

---

## Token Architecture

| Token | TTL | Storage | Purpose |
|---|---|---|---|
| Access Token | 15 minutes | Memory (Zustand store) | Sent with every API request |
| Refresh Token | 30 days | `HttpOnly` cookie | Obtains new access tokens silently |

**Why this split:**
- Access token is short-lived to limit damage if intercepted
- Refresh token in `HttpOnly` cookie means JavaScript cannot read it — XSS attacks cannot steal it
- Access token in memory (not `localStorage`) means it is cleared on tab close

---

## Auth Flow

### Registration
```
POST /api/auth/register
Body: { email, password }

1. Validate email format + password strength
2. Check email not already registered
3. Hash password with bcrypt (cost factor 12)
4. Persist user to DB
5. Return: { accessToken, user }
   Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Strict
```

### Login
```
POST /api/auth/login
Body: { email, password }

1. Look up user by email
2. bcrypt.compare(password, storedHash)
3. Generate access token (JWT, 15 min)
4. Generate refresh token (opaque UUID, stored hashed in DB)
5. Return: { accessToken, user }
   Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Strict
```

### Token Refresh
```
POST /api/auth/refresh
Cookie: refreshToken=<token> (sent automatically by browser)

1. Read refresh token from cookie
2. Hash it, look up in refresh_tokens table
3. Verify not revoked + not expired
4. Issue new access token
5. Return: { accessToken }
```

### Logout
```
POST /api/auth/logout
Header: Authorization: Bearer <accessToken>

1. Mark refresh token as revoked in DB
2. Clear Set-Cookie (empty refreshToken, maxAge=0)
3. Frontend clears accessToken from Zustand store
```

---

## JWT Structure

```json
Header:  { "alg": "HS256", "typ": "JWT" }
Payload: {
  "sub": "<user_uuid>",
  "email": "user@example.com",
  "iat": <issued_at_unix>,
  "exp": <expiry_unix>
}
```

- Secret key stored in `backend/.env` as `JWT_SECRET`
- Minimum 256-bit secret (32 random bytes)
- Never log or expose JWT payloads

---

## Spring Security Configuration

Every request passes through the `JwtAuthFilter` before reaching any controller.

```
Request arrives
      │
JwtAuthFilter
      ├── Is this a public endpoint? (/api/auth/**)  → pass through
      ├── Extract Bearer token from Authorization header
      ├── Validate signature + expiry
      ├── Set SecurityContextHolder with user details
      └── Proceed to controller
```

### Endpoint Security Matrix

| Endpoint | Access |
|---|---|
| `POST /api/auth/register` | Public |
| `POST /api/auth/login` | Public |
| `POST /api/auth/refresh` | Public (refresh token in cookie) |
| `POST /api/chat` | Authenticated |
| `GET /api/user/me` | Authenticated |
| `PUT /api/user/preferences` | Authenticated |
| `DELETE /api/user` | Authenticated |

---

## API Key Management

All external API keys are environment variables on the **backend only**.

```
backend/.env  (never committed to Git — in .gitignore)
├── JWT_SECRET=
├── ANTHROPIC_API_KEY=
├── GOOGLE_PLACES_API_KEY=
├── OPENWEATHERMAP_API_KEY=
├── SKYSCANNER_API_KEY=
└── DATABASE_URL=
```

**Rules:**
1. No API key ever appears in frontend code
2. No API key ever appears in a Git commit (`.env` files are gitignored globally)
3. All external HTTP calls originate from Spring Boot service classes, never from React
4. `backend/.env.example` is committed with placeholder values as documentation

---

## GDPR Requirements

| Requirement | Implementation |
|---|---|
| Right to access | `GET /api/user/export` returns all user data as JSON |
| Right to erasure | `DELETE /api/user` hard-deletes user + all associated data |
| Data minimisation | Only store what is needed (no tracking, no analytics beyond app function) |
| Storage location | PostgreSQL instance must run within the EU |
| Consent | Cookie consent banner on first visit; preferences stored locally |
| Privacy policy | Link in footer — must be present before launch |

---

## Password Policy

- Minimum 8 characters
- At least one uppercase, one lowercase, one number
- Validated on frontend (UX) and backend (enforcement)
- bcrypt cost factor: 12

---

## Future Auth (v2+)

These are **not in scope for v1** but are noted here to avoid architectural decisions that would block them later:

- 2FA (TOTP) required for payment-related actions
- OAuth2 social login (Google)
- Session management UI (see and revoke active devices)
