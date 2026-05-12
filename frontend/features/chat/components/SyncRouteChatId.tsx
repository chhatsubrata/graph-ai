"use client"

import * as React from "react"
import { useAppDispatch } from "@/lib/store"
import { ensureChat, setActiveChat } from "@/features/chat/state/chatSlice"

type SyncRouteChatIdProps = {
  chatId: string
  children: React.ReactNode
}

/**
 * Applies route chat id to Redux before MainSection mounts, so no race with home init.
 */
export function SyncRouteChatId({ chatId, children }: SyncRouteChatIdProps) {
  const dispatch = useAppDispatch()
  const [ready, setReady] = React.useState(false)

  React.useLayoutEffect(() => {
    dispatch(ensureChat({ chatId }))
    dispatch(setActiveChat({ chatId }))
    setReady(true)
  }, [chatId, dispatch])

  if (!ready) {
    return (
      <div className="bg-muted/40 flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  return <>{children}</>
}
