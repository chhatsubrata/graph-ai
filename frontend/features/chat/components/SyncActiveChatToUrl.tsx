"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { selectActiveChatId, selectIsStreaming } from "@/features/chat/model/selectors"
import { useAppSelector } from "@/lib/store"

/**
 * Sets `/chat/[chatId]` only while an assistant response is in progress for that chat
 * (streaming). Until then, stays on `/` so the URL is not updated on idle new chats.
 * Skips `/project/...` chat URLs.
 */
export function SyncActiveChatToUrl() {
  const pathname = usePathname()
  const router = useRouter()
  const activeChatId = useAppSelector(selectActiveChatId)
  const assistantStreaming =
    useAppSelector((s) => (activeChatId ? selectIsStreaming(s, activeChatId) : false))

  React.useEffect(() => {
    if (!activeChatId || !pathname) return
    if (pathname.startsWith("/project/")) return
    if (!assistantStreaming) return

    const target = `/chat/${activeChatId}`
    if (pathname === target) return

    const shouldSync =
      pathname === "/" || (pathname.startsWith("/chat/") && pathname !== target)

    if (shouldSync) {
      router.replace(target)
    }
  }, [activeChatId, assistantStreaming, pathname, router])

  return null
}
