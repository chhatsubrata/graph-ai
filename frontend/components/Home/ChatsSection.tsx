"use client"

import * as React from "react"

import { ChatFooterNote } from "@/components/ChatSection/chat-footer-note"
import { ChatHeader } from "@/components/ChatSection/chat-header"
import { ChatHero } from "@/components/ChatSection/chat-hero"
import { ChatSuggestionCards } from "@/components/ChatSection/chat-suggestion-cards"
import { ChatPromptBox, type ChatPromptBoxHandle } from "@/components/ChatSection/chat-prompt-box"
import { SidebarInset } from "@/components/ui/sidebar"
import { MessageList } from "@/features/chat/components/MessageList"
import {
  selectActiveChatId,
  selectMessagesForChat,
} from "@/features/chat/model/selectors"
import { useChatController } from "@/features/chat/state/useChatController"
import { useAppSelector } from "@/lib/store"

/** Keeps `useChatController` mounted when the UI swaps landing vs thread `ChatPromptBox` (same chat), so Stop still aborts the in-flight stream. */
function ChatsSectionForChat({ chatId }: { chatId: string }) {
  const messages = useAppSelector((s) => selectMessagesForChat(s, chatId))
  const hasThread = messages.length > 0
  const { sendFromComposer, stopGeneration, editAndRegenerate } = useChatController(chatId)

  const promptRef = React.useRef<ChatPromptBoxHandle>(null)
  const threadPaneRef = React.useRef<HTMLDivElement>(null)

  const focusComposer = React.useCallback(() => {
    promptRef.current?.focus()
  }, [])

  React.useEffect(() => {
    if (!hasThread) return
    const pane = threadPaneRef.current
    if (!pane) return

    const onWheel = (event: WheelEvent) => {
      const scroll = document.getElementById("thread-message-scroll")
      if (!scroll) return
      if (!pane.contains(event.target as Node)) return
      if (scroll.contains(event.target as Node)) return
      scroll.scrollTop += event.deltaY
      event.preventDefault()
    }

    pane.addEventListener("wheel", onWheel, { passive: false })
    return () => pane.removeEventListener("wheel", onWheel)
  }, [hasThread, chatId])

  return (
    <SidebarInset className="flex h-full min-h-0 max-h-full min-w-0 flex-1 flex-col overflow-hidden bg-muted/40 p-4">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-2xl p-4 md:p-5">
        <div className="shrink-0">
          <ChatHeader showUtilityActions={hasThread} />
        </div>
        <div
          className={
            hasThread
              ? "flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden"
              : "mx-auto flex min-h-0 w-full max-w-[980px] flex-1 flex-col"
          }
        >
          {!hasThread ? (
            <>
              <div className="mx-auto flex w-full max-w-[980px] flex-1 flex-col">
                <ChatHero />
                <ChatPromptBox
                  ref={promptRef}
                  chatId={chatId}
                  variant="landing"
                  sendFromComposer={sendFromComposer}
                  stopGeneration={stopGeneration}
                />
                <ChatSuggestionCards
                  chatId={chatId}
                  onAfterPick={() => promptRef.current?.focus()}
                />
              </div>
              <ChatFooterNote />
            </>
          ) : (
            <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
              <div
                ref={threadPaneRef}
                className="relative flex min-h-0 min-w-0 flex-col overflow-hidden"
              >
                <MessageList
                  chatId={chatId}
                  onRequestComposerFocus={focusComposer}
                  onEditAndRegenerate={editAndRegenerate}
                />
              </div>
              <div className="relative z-20 shrink-0 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
                <div className="mx-auto w-full max-w-3xl">
                  <ChatPromptBox
                    ref={promptRef}
                    chatId={chatId}
                    variant="thread"
                    sendFromComposer={sendFromComposer}
                    stopGeneration={stopGeneration}
                  />
                </div>
                <p className="mx-auto mt-2 max-w-3xl px-2 text-center text-[11px] leading-snug text-muted-foreground/85">
                  AI can make mistakes. Check important info.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarInset>
  )
}

export default function ChatsSection() {
  const activeChatId = useAppSelector(selectActiveChatId)

  if (activeChatId === null) {
    return (
      <SidebarInset className="flex h-full min-h-0 max-h-full min-w-0 flex-1 flex-col overflow-hidden bg-muted/40 p-4">
        <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-2xl p-4 md:p-5">
          <ChatHeader />
          <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
            Loading…
          </div>
        </div>
      </SidebarInset>
    )
  }

  return <ChatsSectionForChat chatId={activeChatId} />
}
