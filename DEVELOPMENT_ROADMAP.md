# Graph AI - Complete Development Roadmap

## Project Snapshot

- **Project Name:** Graph AI
- **Goal:** Build a ChatGPT-like assistant that lets users create chats, stream responses in real time, and persist conversation history with strong reliability.
- **Target Users:** Developers, students, and power users who want a low-cost AI chat app using local/free models.
- **Core Stack:**
  - Frontend: Next.js
  - Backend: Node.js + Express
  - Database: PostgreSQL + TypeORM
  - AI Inference: Ollama
  - Deployment: Vercel (frontend) + Render (backend + Postgres)

---

## 1) Project Phases (MVP to Production)

## Phase 0 - Foundation (Week 1)
- Monorepo setup, shared types, lint/format/test baseline, env config.
- Local Docker-based Postgres and local Ollama setup.
- CI pipeline skeleton for lint + unit tests.

## Phase 1 - Core MVP (Weeks 2-4)
- User can create chats, send prompts, receive streamed model responses.
- Messages are persisted in Postgres.
- Basic chat list/history and chat detail views.

## Phase 2 - Product Usability (Weeks 5-6)
- Auth + user isolation.
- Better error states, retries, regeneration, model selection.
- Conversation management (rename/delete/archive/search).

## Phase 3 - Production Hardening (Weeks 7-8)
- Observability, rate limits, security, performance tuning.
- Deployment automation and rollback process.
- Backups and data retention policy.

## Phase 4 - Scale Features (Weeks 9-12)
- Multi-model routing and fallbacks.
- Vector memory (optional pgvector), prompt templates, analytics.
- Team/workspace support (if needed).

---

## 2) Phase Breakdown into Concrete Tasks

## Phase 0 - Foundation
- [ ] Create monorepo workspaces: `apps/web`, `apps/api`, `packages/shared`.
- [ ] Setup TypeScript configs (base + app-specific).
- [ ] Add ESLint + Prettier + import/order rules.
- [ ] Add `dotenv` strategy for web/api and `.env.example`.
- [ ] Add Docker Compose for local Postgres.
- [ ] Install and verify Ollama local model (`llama3.1:8b` or chosen model).
- [ ] Setup TypeORM in API with migrations enabled.
- [ ] Add initial health endpoint (`GET /health`).
- [ ] Add CI workflow (lint, typecheck, unit tests).

## Phase 1 - Core MVP
- [ ] Design DB schema for users/chats/messages (see schema section below).
- [ ] Create migrations for `users`, `chats`, `messages`.
- [ ] Build chat REST endpoints:
  - [ ] `POST /chats`
  - [ ] `GET /chats`
  - [ ] `GET /chats/:chatId/messages`
  - [ ] `POST /chats/:chatId/messages`
- [ ] Build streaming endpoint from API to frontend:
  - [ ] `POST /chat/completions/stream` (SSE recommended).
- [ ] Implement Ollama service wrapper:
  - [ ] model invocation
  - [ ] stream token handling
  - [ ] timeout + cancellation
- [ ] Persist user message before model call.
- [ ] Persist assistant message incrementally or final-on-complete.
- [ ] Build Next.js chat page:
  - [ ] chat list sidebar
  - [ ] message timeline
  - [ ] input composer + send button + enter-to-send
  - [ ] streaming token rendering
- [ ] Add loading/error/partial-response UI states.
- [ ] Add basic E2E smoke test for send -> stream -> save flow.

## Phase 2 - Product Usability
- [ ] Add authentication (JWT/session, whichever you prefer).
- [ ] Add auth middleware in Express (`requireAuth`).
- [ ] Scope all queries by `userId`.
- [ ] Add model selector in UI and persist per chat.
- [ ] Add regenerate response endpoint.
- [ ] Add chat rename/delete/archive endpoints.
- [ ] Add optimistic UI updates for sending messages.
- [ ] Add pagination for messages and chats.
- [ ] Add request validation (zod/class-validator) for all endpoints.

## Phase 3 - Production Hardening
- [ ] Add structured logging (pino/winston) with request IDs.
- [ ] Add error boundary + standardized API error format.
- [ ] Add rate limiting for chat generation endpoints.
- [ ] Add abuse controls (max tokens, max request size, prompt length checks).
- [ ] Add metrics (latency, token count, success rate, failure rate).
- [ ] Add DB indexes and query optimization.
- [ ] Add backup strategy for Postgres and restore test.
- [ ] Add security headers, CORS policy, and secrets management.

## Phase 4 - Scale Features
- [ ] Add model fallback strategy when chosen model unavailable.
- [ ] Add optional pgvector memory/RAG layer.
- [ ] Add prompt templates and system personas.
- [ ] Add usage analytics dashboard.
- [ ] Add workspace/team support with role-based permissions.

---

## 3) Priority Order (What First + Why)

1. **Core chat loop (send -> stream -> persist)**  
   - This is the product's core value; everything else depends on proving this loop works.
2. **Data model + migrations early**  
   - Prevents rework; chat apps get messy if schema is improvised late.
3. **Streaming pipeline before advanced UI polish**  
   - Streaming experience is the signature behavior users notice first.
4. **Auth + user isolation before public launch**  
   - Without this, data leakage risk is high.
5. **Observability + rate limits before growth**  
   - Needed to diagnose latency/cost/failure under real usage.
6. **Advanced features (RAG, teams, analytics) last**  
   - Only valuable after stable base functionality.

---

## 4) Monorepo Folder Structure Recommendation

```text
graph-ai/
  apps/
    web/                      # Next.js frontend
      app/
      components/
      lib/
      hooks/
      styles/
      tests/
    api/                      # Express backend
      src/
        config/
        modules/
          auth/
          chats/
          messages/
          models/
        middleware/
        services/
          ollama/
          streaming/
        db/
          entities/
          migrations/
        routes/
        utils/
      tests/
  packages/
    shared/                   # shared types, schemas, constants
      src/
        types/
        dto/
        constants/
  infra/
    docker/
      docker-compose.yml      # local postgres + optional services
    scripts/
  .github/
    workflows/
  DEVELOPMENT_ROADMAP.md
  package.json
```

---

## 5) API Design Plan (High-Level Endpoints)

## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Chats
- `POST /api/chats` - create chat
- `GET /api/chats` - list user chats (with cursor pagination)
- `GET /api/chats/:chatId` - get chat metadata
- `PATCH /api/chats/:chatId` - rename/update model
- `DELETE /api/chats/:chatId` - soft delete

## Messages
- `GET /api/chats/:chatId/messages?cursor=...&limit=...`
- `POST /api/chats/:chatId/messages` - add user message (non-streaming fallback)

## Generation/Streaming
- `POST /api/chat/completions/stream`
  - Input: `chatId`, `message`, `model`, optional `systemPrompt`
  - Output: SSE events (`start`, `token`, `done`, `error`)

## System
- `GET /health`
- `GET /ready`

## Suggested SSE Event Contract
- `event: start` -> `{ messageId, chatId, createdAt }`
- `event: token` -> `{ delta }`
- `event: done` -> `{ messageId, usage, finishReason }`
- `event: error` -> `{ code, message }`

---

## 6) Database Schema Planning (PostgreSQL + TypeORM)

## Core Tables
- `users`
  - `id (uuid pk)`
  - `email (unique)`
  - `password_hash`
  - `created_at`, `updated_at`

- `chats`
  - `id (uuid pk)`
  - `user_id (fk users.id)`
  - `title`
  - `model` (default model)
  - `is_archived (bool)`
  - `created_at`, `updated_at`, `last_message_at`

- `messages`
  - `id (uuid pk)`
  - `chat_id (fk chats.id)`
  - `user_id (nullable fk users.id)` # null for assistant/system if desired
  - `role (enum: system | user | assistant | tool)`
  - `content (text)`
  - `status (enum: pending | streaming | completed | failed | cancelled)`
  - `token_count_prompt (int nullable)`
  - `token_count_completion (int nullable)`
  - `error_code (nullable)`
  - `created_at`, `updated_at`

## Optional Table (if incremental persistence needed)
- `message_chunks`
  - `id (bigserial pk)`
  - `message_id (fk messages.id)`
  - `chunk_index (int)`
  - `delta (text)`
  - `created_at`

## Recommended Indexes
- `chats(user_id, last_message_at desc)`
- `messages(chat_id, created_at asc)`
- `messages(chat_id, status)`
- Optional full text index on `messages.content` for search.

---

## 7) Deployment Strategy (Vercel + Render)

## Frontend (Vercel)
- [ ] Deploy `apps/web`.
- [ ] Configure env vars: `NEXT_PUBLIC_API_URL`.
- [ ] Add preview deployments for PRs.

## Backend (Render)
- [ ] Deploy `apps/api` as web service.
- [ ] Attach managed Postgres in Render.
- [ ] Configure env vars:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `OLLAMA_BASE_URL`
  - `CORS_ORIGIN`
- [ ] Run migrations on deploy (safe startup hook).

## Ollama Hosting Strategy
- **Dev:** local machine running Ollama.
- **Prod option A:** dedicated VM with Ollama, API connects over private network.
- **Prod option B:** keep architecture provider-agnostic and swap to hosted LLM later.

## Release Flow
- [ ] `main` branch protected.
- [ ] PR checks required (lint, typecheck, tests).
- [ ] Tagged releases every milestone (`v0.1.0`, `v0.2.0`, etc.).

---

## 8) Testing Strategy

## Unit Tests
- [ ] Prompt validation/parsing.
- [ ] Chat service logic (title generation, model selection fallback).
- [ ] Ollama wrapper behavior (timeouts, stream parser).

## Integration Tests (API + DB)
- [ ] Create/list chats.
- [ ] Save/retrieve messages.
- [ ] Streaming endpoint emits valid event sequence.
- [ ] Auth middleware blocks unauthorized access.

## E2E Tests (Playwright/Cypress)
- [ ] User logs in.
- [ ] Creates chat and sends prompt.
- [ ] Sees streaming response tokens.
- [ ] Reloads page and sees persisted messages.

## Non-functional
- [ ] Load test streaming endpoint with concurrent requests.
- [ ] Failure tests: Ollama unavailable, DB timeout, client disconnect.

---

## 9) Scaling Considerations

- **Streaming transport:** Use SSE first (simpler than WebSockets for one-way token stream).
- **Backpressure:** Queue/reject when model concurrency exceeds limits.
- **Async jobs:** Add job queue later for long-running generations.
- **Connection management:** Tune Node + proxy timeouts for long streams.
- **DB growth:** Partition/archive old messages for heavy usage.
- **Caching:** Cache chat metadata and model lists.
- **Model abstraction:** Keep model provider interface (`generateStream`) to swap Ollama/OpenAI/others.
- **Security:** prompt injection safeguards and sensitive-data redaction pipeline.

---

## 10) Realistic Timeline (Solo Intermediate Developer)

## 0-2 Weeks
- Repo setup, TypeORM migrations, base API, local Ollama integration.

## 3-4 Weeks
- End-to-end MVP chat loop with streaming + persistence.
- Basic chat UI and message history.

## 5-6 Weeks
- Auth, user scoping, conversation management, UX quality.

## 7-8 Weeks
- Observability, error handling hardening, deployment polish.

## 9-12 Weeks
- Scale features (RAG/pgvector, analytics, model fallback, teams).

**MVP launch target:** ~4 weeks  
**Production-ready v1 target:** ~8 weeks  
**Advanced v1.5 target:** ~12 weeks

---

## Execution Checklist (Short Version)

- [ ] Finalize schema and run first migrations.
- [ ] Implement `POST /api/chat/completions/stream` with SSE.
- [ ] Persist user + assistant messages for each generation.
- [ ] Build chat UI with real-time token rendering.
- [ ] Add auth and per-user data scoping.
- [ ] Add logs/metrics/rate-limit before public users.
- [ ] Deploy web to Vercel, API + Postgres to Render.
- [ ] Add E2E smoke tests for full chat flow.

