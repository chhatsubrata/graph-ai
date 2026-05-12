import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Chat, ComposerState, Message, MessagePart, PasteAttachment } from "../model/types"
import { createId } from "../model/types"

export interface ChatEntity extends Chat {
  messageIds: string[]
}

export interface ChatState {
  chats: Record<string, ChatEntity>
  messages: Record<string, Message>
  /** Composer draft keyed by chat id */
  composerByChatId: Record<string, ComposerState>
  /** Currently focused thread in the main UI */
  activeChatId: string | null
}

const defaultComposer = (): ComposerState => ({
  promptText: "",
  attachments: [],
})

const initialState: ChatState = {
  chats: {},
  messages: {},
  composerByChatId: {},
  activeChatId: null,
}

function touchChat(state: ChatState, chatId: string) {
  const chat = state.chats[chatId]
  if (chat) {
    chat.updatedAt = Date.now()
  }
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    ensureChat: (
      state,
      action: PayloadAction<{ chatId: string; title?: string }>
    ) => {
      const { chatId, title = "New chat" } = action.payload
      if (state.chats[chatId]) return
      const now = Date.now()
      state.chats[chatId] = {
        id: chatId,
        title,
        createdAt: now,
        updatedAt: now,
        messageIds: [],
        streamingAssistantMessageId: null,
      }
      state.composerByChatId[chatId] = defaultComposer()
    },

    setActiveChat: (state, action: PayloadAction<{ chatId: string }>) => {
      state.activeChatId = action.payload.chatId
    },

    startNewChat: (state) => {
      const chatId = createId()
      const now = Date.now()
      state.chats[chatId] = {
        id: chatId,
        title: "New chat",
        createdAt: now,
        updatedAt: now,
        messageIds: [],
        streamingAssistantMessageId: null,
      }
      state.composerByChatId[chatId] = defaultComposer()
      state.activeChatId = chatId
    },

    setChatTitle: (
      state,
      action: PayloadAction<{ chatId: string; title: string }>
    ) => {
      const c = state.chats[action.payload.chatId]
      if (c) c.title = action.payload.title
    },

    setComposerPrompt: (
      state,
      action: PayloadAction<{ chatId: string; text: string }>
    ) => {
      const { chatId, text } = action.payload
      if (!state.composerByChatId[chatId]) {
        state.composerByChatId[chatId] = defaultComposer()
      }
      state.composerByChatId[chatId].promptText = text
    },

    addComposerAttachment: (
      state,
      action: PayloadAction<{ chatId: string; attachment: PasteAttachment }>
    ) => {
      const { chatId, attachment } = action.payload
      if (!state.composerByChatId[chatId]) {
        state.composerByChatId[chatId] = defaultComposer()
      }
      state.composerByChatId[chatId].attachments.push(attachment)
    },

    removeComposerAttachment: (
      state,
      action: PayloadAction<{ chatId: string; attachmentId: string }>
    ) => {
      const comp = state.composerByChatId[action.payload.chatId]
      if (!comp) return
      comp.attachments = comp.attachments.filter((a) => a.id !== action.payload.attachmentId)
    },

    updateComposerAttachment: (
      state,
      action: PayloadAction<{ chatId: string; attachment: PasteAttachment }>
    ) => {
      const comp = state.composerByChatId[action.payload.chatId]
      if (!comp) return
      const idx = comp.attachments.findIndex((a) => a.id === action.payload.attachment.id)
      if (idx >= 0) comp.attachments[idx] = action.payload.attachment
    },

    clearComposer: (state, action: PayloadAction<{ chatId: string }>) => {
      state.composerByChatId[action.payload.chatId] = defaultComposer()
    },

    updateUserMessage: (
      state,
      action: PayloadAction<{
        messageId: string
        parts: MessagePart[]
        apiContent: string
      }>
    ) => {
      const msg = state.messages[action.payload.messageId]
      if (!msg || msg.role !== "user") return
      msg.parts = action.payload.parts
      msg.apiContent = action.payload.apiContent
      touchChat(state, msg.chatId)
    },

    truncateMessagesAfter: (
      state,
      action: PayloadAction<{ chatId: string; messageId: string }>
    ) => {
      const chat = state.chats[action.payload.chatId]
      if (!chat) return
      const idx = chat.messageIds.indexOf(action.payload.messageId)
      if (idx === -1) return
      const toDrop = chat.messageIds.slice(idx + 1)
      for (const id of toDrop) delete state.messages[id]
      chat.messageIds = chat.messageIds.slice(0, idx + 1)
      if (
        chat.streamingAssistantMessageId &&
        toDrop.includes(chat.streamingAssistantMessageId)
      ) {
        chat.streamingAssistantMessageId = null
      }
      touchChat(state, action.payload.chatId)
    },

    addUserMessage: (
      state,
      action: PayloadAction<{
        chatId: string
        parts: MessagePart[]
        apiContent: string
      }>
    ) => {
      const { chatId, parts, apiContent } = action.payload
      const chat = state.chats[chatId]
      if (!chat) return
      const id = createId()
      const msg: Message = {
        id,
        chatId,
        role: "user",
        createdAt: Date.now(),
        status: "complete",
        parts,
        thinkingMarkdown: "",
        apiContent,
      }
      state.messages[id] = msg
      chat.messageIds.push(id)
      touchChat(state, chatId)
    },

    beginAssistantMessage: (
      state,
      action: PayloadAction<{ chatId: string; messageId: string }>
    ) => {
      const { chatId, messageId: id } = action.payload
      const chat = state.chats[chatId]
      if (!chat) return
      const msg: Message = {
        id,
        chatId,
        role: "assistant",
        createdAt: Date.now(),
        status: "streaming",
        parts: [{ type: "text", markdown: "" }],
        thinkingMarkdown: "",
      }
      state.messages[id] = msg
      chat.messageIds.push(id)
      chat.streamingAssistantMessageId = id
      touchChat(state, chatId)
    },

    appendAssistantDelta: (
      state,
      action: PayloadAction<{
        messageId: string
        text: string
        channel: "answer" | "thinking"
      }>
    ) => {
      const { messageId, text, channel } = action.payload
      const msg = state.messages[messageId]
      if (!msg || msg.role !== "assistant") return
      if (channel === "thinking") {
        msg.thinkingMarkdown += text
      } else {
        const textPart = msg.parts.find((p): p is Extract<MessagePart, { type: "text" }> => p.type === "text")
        if (textPart) {
          textPart.markdown += text
        } else {
          msg.parts.unshift({ type: "text", markdown: text })
        }
      }
    },

    setAssistantMessageStatus: (
      state,
      action: PayloadAction<{
        chatId: string
        messageId: string
        status: Message["status"]
        errorMessage?: string
      }>
    ) => {
      const { chatId, messageId, status, errorMessage } = action.payload
      const msg = state.messages[messageId]
      if (!msg) return
      msg.status = status
      if (errorMessage !== undefined) msg.errorMessage = errorMessage
      const chat = state.chats[chatId]
      if (chat && chat.streamingAssistantMessageId === messageId) {
        if (status === "complete" || status === "error") {
          chat.streamingAssistantMessageId = null
        }
      }
      touchChat(state, chatId)
    },
  },
})

export const {
  ensureChat,
  setActiveChat,
  startNewChat,
  setChatTitle,
  setComposerPrompt,
  addComposerAttachment,
  removeComposerAttachment,
  updateComposerAttachment,
  clearComposer,
  addUserMessage,
  updateUserMessage,
  truncateMessagesAfter,
  beginAssistantMessage,
  appendAssistantDelta,
  setAssistantMessageStatus,
} = chatSlice.actions

export default chatSlice.reducer
