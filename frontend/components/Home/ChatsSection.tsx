import { ChatFooterNote } from "@/components/ChatSection/chat-footer-note"
import { ChatHeader } from "@/components/ChatSection/chat-header"
import { ChatHero } from "@/components/ChatSection/chat-hero"
import { ChatPromptBox } from "@/components/ChatSection/chat-prompt-box"
import { ChatSuggestionCards } from "@/components/ChatSection/chat-suggestion-cards"
import { SidebarInset } from "@/components/ui/sidebar"

export default function ChatsSection() {
  return (
    <SidebarInset className="min-h-svh bg-muted/40 p-4">
      <main className="mx-auto flex min-h-[calc(100svh-32px)] w-full max-w-7xl flex-col rounded-2xl p-4 md:p-5">
        <ChatHeader />
        <div className="mx-auto flex w-full max-w-[980px] flex-1 flex-col">
          <ChatHero />
          <ChatPromptBox />
          <ChatSuggestionCards />
          <ChatFooterNote />
        </div>
      </main>
    </SidebarInset>
  )
}