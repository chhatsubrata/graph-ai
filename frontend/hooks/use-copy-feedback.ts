"use client"

import * as React from "react"

const DEFAULT_RESET_MS = 2000

export function useCopyFeedback(resetMs: number = DEFAULT_RESET_MS) {
  const [copied, setCopied] = React.useState(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  React.useEffect(() => () => clearTimer(), [clearTimer])

  const copy = React.useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        clearTimer()
        setCopied(true)
        timerRef.current = setTimeout(() => {
          setCopied(false)
          timerRef.current = null
        }, resetMs)
      } catch (e) {
        console.error("Clipboard copy failed", e)
      }
    },
    [clearTimer, resetMs]
  )

  return { copied, copy }
}
