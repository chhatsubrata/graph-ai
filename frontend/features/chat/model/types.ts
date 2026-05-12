export type MessageRole = "user" | "assistant" | "system"

export type MessageStatus = "pending" | "streaming" | "complete" | "error"

export type MessagePart =
  | { type: "text"; markdown: string }
  | { type: "code"; language: string; text: string }

export interface PasteAttachment {
  id: string
  kind: "pasted_text" | "code"
  previewTitle: string
  lineCount: number
  fullText: string
}

export interface ComposerState {
  promptText: string
  attachments: PasteAttachment[]
}

export interface Chat {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  streamingAssistantMessageId: string | null
}

export interface Message {
  id: string
  chatId: string
  role: MessageRole
  createdAt: number
  status: MessageStatus
  parts: MessagePart[]
  /** Reasoning / thinking stream (Ollama-style), shown separately when present */
  thinkingMarkdown: string
  errorMessage?: string
  /** Full user message for the model (includes collapsed paste bodies) */
  apiContent?: string
}

export function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}
