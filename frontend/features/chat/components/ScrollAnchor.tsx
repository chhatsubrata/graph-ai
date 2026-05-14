"use client"

import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"

type ScrollAnchorProps = {
  visible: boolean
  onJump: () => void
}

/** Floating control when the user has scrolled away from the latest messages */
export function ScrollAnchor({ visible, onJump }: ScrollAnchorProps) {
  if (!visible) return null

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-3 z-[60] flex items-center justify-center px-4"
      aria-live="polite"
    >
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="pointer-events-auto size-10 rounded-full border border-border/60 bg-background shadow-lg"
        onClick={onJump}
        aria-label="Jump to latest message"
        title="Jump to bottom"
      >
        <ChevronDown className="size-5" aria-hidden />
      </Button>
    </div>
  )
}
