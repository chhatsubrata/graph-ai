export type SseEvent = { event: string; data: string }

/**
 * Split buffer on SSE event delimiter and parse each complete block.
 * Incomplete tail is returned as remainder.
 */
export function parseSseBuffer(buffer: string): { events: SseEvent[]; remainder: string } {
  const events: SseEvent[] = []
  const blocks = buffer.split("\n\n")
  const remainder = blocks.pop() ?? ""

  for (const eventBlock of blocks) {
    const lines = eventBlock.split("\n")
    let eventName = "message"
    let data = ""

    for (const line of lines) {
      if (line.startsWith(":")) continue
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim()
      }
      if (line.startsWith("data:")) {
        data += line.slice(5).trim()
      }
    }

    events.push({ event: eventName, data })
  }

  return { events, remainder }
}

export interface OllamaStreamChunk {
  type: "answer" | "thinking" | "none"
  text: string
}

/** Match backend/stream-test.html extractChunk */
export function extractOllamaChunk(payload: unknown): OllamaStreamChunk {
  if (!payload || typeof payload !== "object") {
    return { type: "none", text: "" }
  }
  const p = payload as Record<string, unknown>
  const message = p.message as Record<string, unknown> | undefined
  if (message && typeof message.content === "string" && message.content.length > 0) {
    return { type: "answer", text: message.content }
  }
  if (message && typeof message.thinking === "string") {
    return { type: "thinking", text: message.thinking }
  }
  if (typeof p.response === "string" && p.response.length > 0) {
    return { type: "answer", text: p.response }
  }
  return { type: "none", text: "" }
}
