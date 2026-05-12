"use client"

import MainSection from "@/components/Home/MainSection"
import { SyncRouteChatId } from "@/features/chat/components/SyncRouteChatId"
import { useParams } from "next/navigation"

export default function ProjectChatPage() {
  const params = useParams()
  const chatId = typeof params?.chatId === "string" ? params.chatId : ""
  if (!chatId) {
    return <div className="p-6 text-sm text-muted-foreground">Invalid chat</div>
  }
  return (
    <SyncRouteChatId chatId={chatId}>
      <MainSection />
    </SyncRouteChatId>
  )
}
