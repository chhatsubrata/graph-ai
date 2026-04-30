"use client"

import * as React from "react"
import {
  Atom,
  Globe,
  Lightbulb,
  Link2,
  Mic,
  Paperclip,
  SendHorizontal,
  Target,
} from "lucide-react"

import { Button } from "@/components/ui/button"

export function ChatPromptBox() {
  const [prompt, setPrompt] = React.useState("")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const hasPrompt = prompt.trim().length > 0

  React.useEffect(() => {
    const textareaElement = textareaRef.current
    if (!textareaElement) return

    textareaElement.style.height = "0px"
    const nextHeight = Math.min(textareaElement.scrollHeight, 220)
    textareaElement.style.height = `${nextHeight}px`
  }, [prompt])

  const handleSend = () => {
    if (!hasPrompt) return
    setPrompt("")
  }

  const handlePromptKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return

    const isEnter = event.key === "Enter"
    const wantsNewLine = event.shiftKey || event.altKey
    const wantsForceSend = event.metaKey || event.ctrlKey

    if (isEnter && (wantsForceSend || !wantsNewLine)) {
      event.preventDefault()
      handleSend()
    }

    if (event.key === "Escape") {
      textareaRef.current?.blur()
    }
  }

  return (
    <div className="mt-10 rounded-2xl border border-border bg-background p-4 shadow-sm">
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={handlePromptKeyDown}
        placeholder="Ask me anything..."
        rows={1}
        className="min-h-12 w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/90"
      />

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-7 rounded-md border-border bg-accent dark:bg-accent px-3 text-xs text-accent-foreground"
          >
            <Atom className="mr-1.5 size-3.5" />
            Deeper Research
          </Button>
          <Button variant="ghost" size="icon" className="size-7 rounded-md">
            <Link2 className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 rounded-md">
            <Lightbulb className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-7 rounded-md">
            <Target className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 rounded-md">
            <Globe className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7 rounded-full border-border bg-accent text-accent-foreground"
            onClick={handleSend}
            disabled={!hasPrompt}
            aria-label={hasPrompt ? "Send message" : "Start voice input"}
          >
            {hasPrompt ? (
              <SendHorizontal className="size-4" />
            ) : (
              <Mic className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-muted/80 px-3 py-2">
        <button className="text-sm font-medium text-foreground">Saved prompts</button>
        <Button variant="outline" className="h-7 rounded-md border-border dark:bg-accent bg-background px-3 text-xs">
          <Paperclip className="mr-1.5 size-3.5" />
          Attach file
        </Button>
      </div>
    </div>
  )
}
