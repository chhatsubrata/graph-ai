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

  React.useLayoutEffect(() => {
    dispatch(ensureChat({ chatId }))
    dispatch(setActiveChat({ chatId }))
  }, [chatId, dispatch])

  return <>{children}</>
}
