import { createSelector } from "@reduxjs/toolkit"

import type { RootState } from "@/lib/store"
import type { Chat, ComposerState, Message } from "./types"

const EMPTY_MESSAGE_IDS: readonly string[] = []

function messageTextLength(message: Message): number {
  let n = 0
  for (const p of message.parts) {
    if (p.type === "text") {
      n += p.markdown.length
    }
  }
  return n
}

export function selectChat(state: RootState, chatId: string): Chat | undefined {
  return state.chat.chats[chatId]
}

export function selectMessageIds(state: RootState, chatId: string): string[] {
  return state.chat.chats[chatId]?.messageIds ?? []
}

export function selectMessage(state: RootState, messageId: string): Message | undefined {
  return state.chat.messages[messageId]
}

const selectIdList = (state: RootState, chatId: string) => {
  if (!chatId) return EMPTY_MESSAGE_IDS
  return state.chat.chats[chatId]?.messageIds ?? EMPTY_MESSAGE_IDS
}

const selectStreamIdForChat = (state: RootState, chatId: string) => {
  if (!chatId) return ""
  return state.chat.chats[chatId]?.streamingAssistantMessageId ?? ""
}

const selectMessageBodiesSignature = (state: RootState, chatId: string) => {
  if (!chatId) return ""
  const ids = state.chat.chats[chatId]?.messageIds ?? EMPTY_MESSAGE_IDS
  const parts: string[] = []
  for (const id of ids) {
    const m = state.chat.messages[id]
    if (!m) continue
    parts.push(`${m.id}:${m.status}:${messageTextLength(m)}:${m.thinkingMarkdown.length}`)
  }
  return parts.join(";")
}

/** Memoized stable string for scroll pinning (avoids spurious layout work on unrelated renders). */
export const selectChatScrollFingerprint = createSelector(
  [selectIdList, selectStreamIdForChat, selectMessageBodiesSignature],
  (ids, streamId, bodies) => {
    const idKey = Array.isArray(ids) ? ids.join(",") : ""
    if (!idKey && !streamId && !bodies) return "__empty__"
    return `${idKey}|${streamId}|${bodies}`
  }
)

export function selectMessagesForChat(state: RootState, chatId: string): Message[] {
  const ids = selectMessageIds(state, chatId)
  return ids
    .map((id) => state.chat.messages[id])
    .filter((m): m is Message => Boolean(m))
}

export function selectIsStreaming(state: RootState, chatId: string): boolean {
  return Boolean(state.chat.chats[chatId]?.streamingAssistantMessageId)
}

export function selectComposer(state: RootState, chatId: string): ComposerState {
  return state.chat.composerByChatId[chatId] ?? { promptText: "", attachments: [] }
}

export function selectActiveChatId(state: RootState): string | null {
  return state.chat.activeChatId
}
