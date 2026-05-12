"use client"

import * as React from "react"
import { useAppDispatch } from "@/lib/store"
import { store } from "@/lib/store"
import { startNewChat } from "@/features/chat/state/chatSlice"

/** Ensures the home shell has a thread id before the chat panel reads Redux. */
export function InitializeHomeChat() {
  const dispatch = useAppDispatch()

  React.useLayoutEffect(() => {
    if (store.getState().chat.activeChatId === null) {
      dispatch(startNewChat())
    }
  }, [dispatch])

  return null
}
