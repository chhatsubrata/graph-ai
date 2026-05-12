# AI Assistant UI - 3 Day Execution Playbook

Use this as your practical build checklist for creating a Claude/ChatGPT-style UI in this repo.

---

## How to use this file

- Work top-to-bottom.
- Do not start Day 2 until Day 1 acceptance checks pass.
- Update the progress tracker at the end of each work session.
- If blocked, write the blocker directly under the related task.

---

## Repository baseline (current)

- Shell/layout exists:
  - `frontend/components/Home/MainSection.tsx`
  - `frontend/components/Home/Sidebar.tsx`
  - `frontend/components/Home/ChatsSection.tsx`
- Composer prototype exists:
  - `frontend/components/ChatSection/chat-prompt-box.tsx`
- Chat routes are placeholders:
  - `frontend/app/chat/[id]/page.tsx`
  - `frontend/components/Chats/page.tsx`
- Dummy data exists but split:
  - `frontend/data/dummyAPIResponses.json`
  - `frontend/data/dummy.js`

---

## Final target architecture

### Chat components

Create/organize under `frontend/components/ChatSection/`:

- `chat-layout.tsx`
- `chat-header.tsx` (keep, reduce scope)
- `chat-empty-state.tsx`
- `chat-message-list.tsx`
- `chat-message-item.tsx`
- `chat-message-user.tsx`
- `chat-message-assistant.tsx`
- `chat-streaming-indicator.tsx`
- `chat-composer.tsx` (from prompt box)
- `chat-composer-toolbar.tsx`
- `chat-scroll-anchor.tsx`

### Sidebar conversation components

Create under `frontend/components/Sidebar/`:

- `conversation-list.tsx`
- `conversation-item.tsx`
- `conversation-search.tsx`
- `conversation-actions-menu.tsx`
- `new-chat-button.tsx`

### Domain/state

Create under `frontend/lib/chat/`:

- `mock-data.ts`
- `chat-store.ts`
- `chat-actions.ts`
- `chat-selectors.ts`

Types:

- Prefer `frontend/lib/types/chat.ts`
- Or keep in `frontend/utils/types.ts` if you want one shared types file

Hooks under `frontend/hooks/`:

- `use-chat-stream.ts`
- `use-chat-scroll.ts`
- `use-chat-shortcuts.ts`

---

## Day 1 - Foundation + Static conversation UI

**Goal:** Route-driven conversation rendering with typed mock data.

### Tasks

- [ ] Define strict chat types (`MessageRole`, `MessageStatus`, `Message`, `Conversation`).
- [ ] Consolidate dummy data into one typed module (`frontend/lib/chat/mock-data.ts`).
- [ ] Replace placeholder route in `frontend/app/chat/[id]/page.tsx`.
- [ ] Build message rendering path:
  - [ ] `chat-message-list.tsx`
  - [ ] `chat-message-item.tsx`
  - [ ] `chat-message-user.tsx`
  - [ ] `chat-message-assistant.tsx`
- [ ] Move hero/cards/footer into `chat-empty-state.tsx`.
- [ ] Show empty state only when no messages.

### Acceptance checks (must pass)

- [ ] Opening `/chat/[id]` shows message timeline from typed data.
- [ ] Empty state and active conversation state are separate.
- [ ] No duplicate dummy source of truth remains.
- [ ] No `any` used in new chat domain code.

---

## Day 2 - Composer + Streaming lifecycle

**Goal:** End-to-end send -> stream -> complete/abort flow.

### Tasks

- [ ] Refactor `chat-prompt-box.tsx` into:
  - [ ] `chat-composer.tsx`
  - [ ] `chat-composer-toolbar.tsx`
- [ ] Keep strong composer ergonomics:
  - [ ] Enter sends
  - [ ] Shift+Enter newline
  - [ ] Escape blur
  - [ ] autosize textarea
- [ ] Create store (`chat-store.ts`) with:
  - [ ] conversations
  - [ ] messagesByConversationId
  - [ ] streaming state
  - [ ] draftByConversationId
- [ ] Create actions (`chat-actions.ts`):
  - [ ] `sendMessage`
  - [ ] `appendChunk`
  - [ ] `completeStream`
  - [ ] `abortStream`
  - [ ] `regenerateMessage`
- [ ] Create `use-chat-stream.ts`:
  - [ ] append user message immediately
  - [ ] create assistant streaming placeholder
  - [ ] append chunks incrementally
  - [ ] complete/error handling
- [ ] Add `chat-streaming-indicator.tsx` and stop button UX.

### Acceptance checks (must pass)

- [ ] User message appears instantly.
- [ ] Assistant response grows incrementally.
- [ ] Stop generation cancels stream safely.
- [ ] Error state allows retry/regenerate.

---

## Day 3 - Conversations, mobile, and product polish

**Goal:** Market-ready usability and navigation.

### Tasks

- [ ] Build sidebar conversation system:
  - [ ] `conversation-list.tsx`
  - [ ] `conversation-item.tsx`
  - [ ] `conversation-search.tsx`
  - [ ] `conversation-actions-menu.tsx` (rename/pin/delete)
  - [ ] `new-chat-button.tsx`
- [ ] Group chats by date sections:
  - [ ] Today
  - [ ] Yesterday
  - [ ] Previous 7 days
  - [ ] Older
- [ ] Route integration:
  - [ ] sidebar click opens `/chat/[id]`
  - [ ] drafts preserved per conversation
  - [ ] title auto-generated from first user message
- [ ] Add scroll and shortcut hooks:
  - [ ] `use-chat-scroll.ts`
  - [ ] `use-chat-shortcuts.ts`
- [ ] Mobile pass:
  - [ ] sidebar as sheet/drawer
  - [ ] sticky composer with safe area
  - [ ] touch-friendly controls
- [ ] Final polish:
  - [ ] message actions (copy/regenerate)
  - [ ] loading, offline, and error surfaces
  - [ ] consistent spacing/typography

### Acceptance checks (must pass)

- [ ] Conversation CRUD works reliably.
- [ ] Navigation + streaming + composer remain stable together.
- [ ] Desktop and mobile flows are both usable.

---

## Recommended type contract

```ts
export type MessageRole = "user" | "assistant" | "tool" | "system";

export type MessageStatus = "pending" | "streaming" | "completed" | "error";

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: string;
  model?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
}
```

---

## Engineering guardrails (important)

- Keep one source of truth for chat data.
- Keep route files thin; move logic to components/hooks/store.
- Do incremental stream appends; never replace entire message list per token.
- Avoid magic strings in status/role fields; use typed unions/constants.
- Prefer small focused components over one giant chat component.

---

## Priority order (when you start coding)

1. `frontend/utils/types.ts` or `frontend/lib/types/chat.ts`
2. `frontend/lib/chat/mock-data.ts`
3. `frontend/app/chat/[id]/page.tsx`
4. `frontend/components/ChatSection/chat-message-list.tsx`
5. `frontend/components/ChatSection/chat-message-item.tsx`
6. `frontend/components/ChatSection/chat-composer.tsx`
7. `frontend/lib/chat/chat-store.ts`
8. `frontend/hooks/use-chat-stream.ts`
9. Sidebar conversation components

---

## Session progress tracker

### Day 1

- Status: `not started`
- Completed:
  - 
- Blockers:
  - 
- Next action:
  - 

### Day 2

- Status: `not started`
- Completed:
  - 
- Blockers:
  - 
- Next action:
  - 

### Day 3

- Status: `not started`
- Completed:
  - 
- Blockers:
  - 
- Next action:
  - 

---

## Quick self-review checklist

- [ ] Message list is the center of the experience, not the hero.
- [ ] Streaming feels fast and controllable.
- [ ] Sidebar conversations are easy to manage.
- [ ] Mobile composer and navigation are reliable.
- [ ] Types are strict and reusable across components/hooks/store.

