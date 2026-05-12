"use client"

import MainSection from "@/components/Home/MainSection"
import { SyncRouteChatId } from "@/features/chat/components/SyncRouteChatId"
import { useParams } from "next/navigation"

export default function ChatPage() {
  const params = useParams()
  const id = typeof params?.id === "string" ? params.id : ""
  if (!id) {
    return <div className="p-6 text-sm text-muted-foreground">Invalid chat</div>
  }
  return (
    <SyncRouteChatId chatId={id}>
      <MainSection />
    </SyncRouteChatId>
  )
}
