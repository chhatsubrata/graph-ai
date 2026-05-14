"use client"

import * as React from "react"
import { shallowEqual } from "react-redux"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useAppSelector } from "@/lib/store"
import { MessageBubble, type EditAndRegeneratePayload } from "@/features/chat/components/MessageBubble"
import { ScrollAnchor } from "@/features/chat/components/ScrollAnchor"
import {
  selectChatScrollFingerprint,
  selectIsStreaming,
  selectMessagesForChat,
} from "@/features/chat/model/selectors"

type MessageListProps = {
  chatId: string
  onRequestComposerFocus?: () => void
  onEditAndRegenerate?: (payload: EditAndRegeneratePayload) => void | Promise<void>
}

/** Below this count, render a simple list (smoother for short threads + streaming). */
const VIRTUAL_THRESHOLD = 56

export function MessageList({ chatId, onRequestComposerFocus, onEditAndRegenerate }: MessageListProps) {
  const messages = useAppSelector((s) => selectMessagesForChat(s, chatId), shallowEqual)
  const scrollFingerprint = useAppSelector((s) => selectChatScrollFingerprint(s, chatId))
  const isStreaming = useAppSelector((s) => selectIsStreaming(s, chatId))
  const parentRef = React.useRef<HTMLDivElement>(null)
  const [pinnedBottom, setPinnedBottom] = React.useState(true)

  const useVirtual = messages.length >= VIRTUAL_THRESHOLD

  /** Distance from viewport bottom to scroll content bottom to count as “at bottom”. */
  const PINNED_BOTTOM_PX = 40
  const OVERFLOW_EPS_PX = 2

  const virtualizer = useVirtualizer({
    count: useVirtual ? messages.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 10,
    measureElement: (el) => el.getBoundingClientRect().height,
  })

  const syncPinnedToScroll = React.useCallback(() => {
    const el = parentRef.current
    if (!el) return
    const { scrollHeight, clientHeight, scrollTop } = el
    if (scrollHeight <= clientHeight + OVERFLOW_EPS_PX) {
      setPinnedBottom(true)
      return
    }
    const gap = scrollHeight - scrollTop - clientHeight
    setPinnedBottom(gap < PINNED_BOTTOM_PX)
  }, [])

  React.useLayoutEffect(() => {
    const el = parentRef.current
    if (!el) return
    const id = requestAnimationFrame(() => {
      if (pinnedBottom) {
        el.scrollTop = el.scrollHeight - el.clientHeight
      }
      syncPinnedToScroll()
    })
    return () => cancelAnimationFrame(id)
  }, [scrollFingerprint, pinnedBottom, isStreaming, syncPinnedToScroll])

  const onScroll = React.useCallback(() => {
    syncPinnedToScroll()
  }, [syncPinnedToScroll])

  const onWheelScrollPane = React.useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    const el = parentRef.current
    if (!el || el.scrollHeight <= el.clientHeight + OVERFLOW_EPS_PX) return
    if (event.deltaY < 0) {
      setPinnedBottom(false)
    }
  }, [])

  const virtualTotalSize = virtualizer.getTotalSize()
  React.useEffect(() => {
    syncPinnedToScroll()
  }, [scrollFingerprint, virtualTotalSize, messages.length, isStreaming, syncPinnedToScroll])

  React.useEffect(() => {
    const el = parentRef.current
    if (!el) return
    const ro = new ResizeObserver(() => syncPinnedToScroll())
    ro.observe(el)
    return () => ro.disconnect()
  }, [syncPinnedToScroll])

  const scrollToBottom = React.useCallback(() => {
    const el = parentRef.current
    if (!el) return
    const top = Math.max(0, el.scrollHeight - el.clientHeight)
    el.scrollTo({ top, behavior: "smooth" })
    setPinnedBottom(true)
  }, [])

  const items = virtualizer.getVirtualItems()

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-12 text-center text-sm text-muted-foreground">
        <p className="max-w-sm">Send a message to start. Long pastes collapse into chips like Claude.</p>
      </div>
    )
  }

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-col">
      <div
        id="thread-message-scroll"
        ref={parentRef}
        onScroll={onScroll}
        onWheel={onWheelScrollPane}
        className="thread-message-scroll-pane bg-muted/40 min-h-0 w-full flex-1 touch-pan-y scroll-pb-32 overflow-y-auto overflow-x-hidden overscroll-y-contain py-3 pb-3 [scrollbar-gutter:auto]"
      >
        <div className="mx-auto w-full max-w-2xl px-3 sm:px-5">
          {useVirtual ? (
            <div
              className="relative w-full"
              style={{ height: `${virtualizer.getTotalSize()}px` }}
            >
              {items.map((virtualRow) => {
                const message = messages[virtualRow.index]
                if (!message) return null
                return (
                  <div
                    key={message.id}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    className="absolute left-0 right-0 top-0 px-0 py-2.5"
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                  >
                    <MessageBubble
                      message={message}
                      onRequestComposerFocus={onRequestComposerFocus}
                      onEditAndRegenerate={onEditAndRegenerate}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {messages.map((message) => (
                <div key={message.id} className="py-2.5">
                  <MessageBubble
                    message={message}
                    onRequestComposerFocus={onRequestComposerFocus}
                    onEditAndRegenerate={onEditAndRegenerate}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ScrollAnchor visible={!pinnedBottom} onJump={scrollToBottom} />
    </div>
  )
}
