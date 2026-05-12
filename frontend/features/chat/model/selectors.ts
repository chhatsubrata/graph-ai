import type { RootState } from "@/lib/store"
import type { Chat, ComposerState, Message } from "./types"

export function selectChat(state: RootState, chatId: string): Chat | undefined {
  return state.chat.chats[chatId]
}

export function selectMessageIds(state: RootState, chatId: string): string[] {
  return state.chat.chats[chatId]?.messageIds ?? []
}

export function selectMessage(state: RootState, messageId: string): Message | undefined {
  return state.chat.messages[messageId]
}

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
