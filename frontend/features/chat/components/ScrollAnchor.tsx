"use client"

import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"

type ScrollAnchorProps = {
  visible: boolean
  onJump: () => void
}

/** Floating control when user has scrolled away from the latest messages */
export function ScrollAnchor({ visible, onJump }: ScrollAnchorProps) {
  if (!visible) return null
  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      className="pointer-events-auto absolute bottom-5 left-1/2 z-20 size-10 -translate-x-1/2 rounded-full border border-border/60 bg-background shadow-lg"
      onClick={onJump}
      aria-label="Jump to latest message"
      title="Jump to latest"
    >
      <ChevronDown className="size-5" aria-hidden />
    </Button>
  )
}
