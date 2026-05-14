"use client"

import * as React from "react"
import { shallowEqual } from "react-redux"

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
import { cn } from "@/lib/utils"

/** Keeps `useChatController` mounted when the UI swaps landing vs thread `ChatPromptBox` (same chat), so Stop still aborts the in-flight stream. */
function ChatsSectionForChat({ chatId }: { chatId: string }) {
  const messages = useAppSelector((s) => selectMessagesForChat(s, chatId), shallowEqual)
  const hasThread = messages.length > 0
  const { sendFromComposer, stopGeneration, editAndRegenerate } = useChatController(chatId)

  const promptRef = React.useRef<ChatPromptBoxHandle>(null)

  const focusComposer = React.useCallback(() => {
    promptRef.current?.focus()
  }, [])

  return (
    <SidebarInset
      className={cn(
        "flex h-full min-h-0 max-h-full min-w-0 flex-1 flex-col overflow-hidden bg-muted/40",
        hasThread ? "pl-3 pt-3 pb-3 pr-0 sm:pl-4" : "p-4"
      )}
    >
      <div
        className={cn(
          "flex min-h-0 w-full flex-1 flex-col overflow-hidden",
          hasThread ? "max-w-full" : "mx-auto max-w-7xl rounded-2xl p-4 md:p-5"
        )}
      >
        <div className={cn("shrink-0", hasThread && "px-4 sm:px-5")}>
          <div className={cn(hasThread && "mx-auto w-full max-w-7xl")}>
            <ChatHeader showUtilityActions={hasThread} />
          </div>
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
            <div className="grid min-h-0 min-w-0 w-full flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
              <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden">
                <MessageList
                  chatId={chatId}
                  onRequestComposerFocus={focusComposer}
                  onEditAndRegenerate={editAndRegenerate}
                />
              </div>
              <div className="relative z-30 shrink-0 border-t border-border/50 bg-muted/40 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
                <div className="mx-auto w-full max-w-2xl">
                  <ChatPromptBox
                    ref={promptRef}
                    chatId={chatId}
                    variant="thread"
                    sendFromComposer={sendFromComposer}
                    stopGeneration={stopGeneration}
                  />
                </div>
                <p className="mx-auto mt-2 max-w-2xl px-2 text-center text-[11px] leading-snug text-muted-foreground/85">
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
