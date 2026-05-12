"use client"

import { useCallback, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import {
  addUserMessage,
  appendAssistantDelta,
  beginAssistantMessage,
  clearComposer,
  ensureChat,
  setAssistantMessageStatus,
  setChatTitle,
  truncateMessagesAfter,
  updateUserMessage,
} from "@/features/chat/state/chatSlice"
import { createId } from "@/features/chat/model/types"
import type { Message, MessagePart, PasteAttachment } from "@/features/chat/model/types"
import { selectComposer, selectMessagesForChat } from "@/features/chat/model/selectors"
import { streamOllamaChat } from "@/features/chat/transport/ollamaStream"
import { getChatEnv } from "@/features/chat/lib/chatEnv"
import { store } from "@/lib/store"
import type { RootState } from "@/lib/store"

function buildUserDisplayParts(prompt: string, attachments: PasteAttachment[]): MessagePart[] {
  const lines: string[] = []
  if (prompt.trim()) lines.push(prompt.trim())
  for (const a of attachments) {
    lines.push(`_${a.previewTitle} (${a.lineCount} lines)_`)
  }
  return [{ type: "text", markdown: lines.join("\n\n") }]
}

function buildUserApiContent(prompt: string, attachments: PasteAttachment[]): string {
  const parts: string[] = []
  if (prompt.trim()) parts.push(prompt.trim())
  for (const a of attachments) {
    parts.push(`\n\n---\n${a.previewTitle}\n\n${a.fullText}`)
  }
  return parts.join("")
}

const ASSISTANT_MARKDOWN_SYSTEM = `You answer in GitHub-Flavored Markdown.

Whenever you show source code (TypeScript, TSX/JSX, JavaScript, Python, JSON, HTML, CSS, bash, etc.), put it in fenced code blocks with the correct language tag. Example:

\`\`\`tsx
export function Example() {
  return <div className="p-4">Hello</div>
}
\`\`\`

Do not paste multi-line code as plain paragraphs. Use fenced blocks for anything longer than one line or that looks like code.`

function messagesToOllamaPayload(history: Message[]): { role: string; content: string }[] {
  const out: { role: string; content: string }[] = []
  for (const m of history) {
    if (m.status === "error") continue
    if (m.role === "user") {
      const content =
        m.apiContent ??
        m.parts
          .filter((p): p is Extract<MessagePart, { type: "text" }> => p.type === "text")
          .map((p) => p.markdown)
          .join("\n\n")
      out.push({ role: "user", content })
      continue
    }
    if (m.role === "assistant") {
      if (m.status === "streaming") continue
      const textPart = m.parts.find((p) => p.type === "text")
      const content = textPart && textPart.type === "text" ? textPart.markdown : ""
      out.push({ role: "assistant", content })
    }
  }
  return out
}

export function useChatController(chatId: string) {
  const dispatch = useAppDispatch()
  const composer = useAppSelector((s) => selectComposer(s, chatId))
  const abortRef = useRef<AbortController | null>(null)
  const flushRef = useRef({ answer: "", thinking: "" })
  const rafRef = useRef(0)
  const assistantIdRef = useRef<string | null>(null)

  const flushPendingDeltas = useCallback(() => {
    const messageId = assistantIdRef.current
    if (!messageId) return
    const { answer, thinking } = flushRef.current
    flushRef.current = { answer: "", thinking: "" }
    if (thinking) {
      dispatch(appendAssistantDelta({ messageId, text: thinking, channel: "thinking" }))
    }
    if (answer) {
      dispatch(appendAssistantDelta({ messageId, text: answer, channel: "answer" }))
    }
  }, [dispatch])

  const scheduleFlush = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      flushPendingDeltas()
    })
  }, [flushPendingDeltas])

  const stopGeneration = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    flushPendingDeltas()
    abortRef.current?.abort()
    abortRef.current = null
    const aid = assistantIdRef.current
    if (aid) {
      dispatch(
        setAssistantMessageStatus({
          chatId,
          messageId: aid,
          status: "complete",
        })
      )
    }
    assistantIdRef.current = null
    flushRef.current = { answer: "", thinking: "" }
  }, [chatId, dispatch, flushPendingDeltas])

  const runAssistantStream = useCallback(async () => {
    const { baseUrl, apiKey, model } = getChatEnv()
    const afterUser = selectMessagesForChat(store.getState() as RootState, chatId)
    const ollamaMessages = [
      { role: "system", content: ASSISTANT_MARKDOWN_SYSTEM },
      ...messagesToOllamaPayload(afterUser),
    ]

    const assistantId = createId()
    assistantIdRef.current = assistantId
    dispatch(beginAssistantMessage({ chatId, messageId: assistantId }))

    const controller = new AbortController()
    abortRef.current = controller

    await streamOllamaChat({
      baseUrl,
      apiKey,
      model,
      messages: ollamaMessages,
      signal: controller.signal,
      onDelta: (text, channel) => {
        if (channel === "answer") flushRef.current.answer += text
        else flushRef.current.thinking += text
        scheduleFlush()
      },
      onDone: () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = 0
        }
        flushPendingDeltas()
        dispatch(
          setAssistantMessageStatus({
            chatId,
            messageId: assistantId,
            status: "complete",
          })
        )
        assistantIdRef.current = null
        abortRef.current = null
      },
      onError: (message) => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = 0
        }
        flushPendingDeltas()
        dispatch(
          setAssistantMessageStatus({
            chatId,
            messageId: assistantId,
            status: "error",
            errorMessage: message,
          })
        )
        assistantIdRef.current = null
        abortRef.current = null
      },
    })
  }, [chatId, dispatch, flushPendingDeltas, scheduleFlush])

  const sendFromComposer = useCallback(async () => {
    const prompt = composer.promptText
    const attachments = composer.attachments
    if (!prompt.trim() && attachments.length === 0) return

    dispatch(ensureChat({ chatId }))
    const st = store.getState() as RootState
    if (st.chat.chats[chatId]?.streamingAssistantMessageId) return

    const parts = buildUserDisplayParts(prompt, attachments)
    const apiContent = buildUserApiContent(prompt, attachments)

    dispatch(addUserMessage({ chatId, parts, apiContent }))
    dispatch(clearComposer({ chatId }))

    if (!prompt.trim().slice(0, 80) && attachments[0]) {
      dispatch(setChatTitle({ chatId, title: attachments[0].previewTitle.slice(0, 48) }))
    } else if (prompt.trim()) {
      dispatch(setChatTitle({ chatId, title: prompt.trim().slice(0, 48) }))
    }

    await runAssistantStream()
  }, [chatId, composer.attachments, composer.promptText, dispatch, runAssistantStream])

  const editAndRegenerate = useCallback(
    async ({
      messageId,
      prompt,
      attachments,
    }: {
      messageId: string
      prompt: string
      attachments: PasteAttachment[]
    }) => {
      if (!prompt.trim() && attachments.length === 0) return

      if (abortRef.current) {
        abortRef.current.abort()
        abortRef.current = null
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
      flushRef.current = { answer: "", thinking: "" }
      assistantIdRef.current = null

      const parts = buildUserDisplayParts(prompt, attachments)
      const apiContent = buildUserApiContent(prompt, attachments)

      dispatch(updateUserMessage({ messageId, parts, apiContent }))
      dispatch(truncateMessagesAfter({ chatId, messageId }))

      await runAssistantStream()
    },
    [chatId, dispatch, runAssistantStream]
  )

  return {
    sendFromComposer,
    stopGeneration,
    editAndRegenerate,
    composer,
  }
}
