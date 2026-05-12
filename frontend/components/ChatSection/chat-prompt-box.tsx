"use client"

import * as React from "react"
import {
  ChevronDown,
  Loader2,
  Mic,
  Monitor,
  Plus,
  Search,
  SendHorizontal,
  Square,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PasteAttachmentChip } from "@/features/chat/components/PasteAttachmentChip"
import {
  addComposerAttachment,
  removeComposerAttachment,
  setComposerPrompt,
  updateComposerAttachment,
} from "@/features/chat/state/chatSlice"
import { selectComposer, selectIsStreaming } from "@/features/chat/model/selectors"
import { createId } from "@/features/chat/model/types"
import type { PasteAttachment } from "@/features/chat/model/types"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const LINE_COLLAPSE = 4
const CHAR_COLLAPSE = 1800

function guessPasteKind(text: string): PasteAttachment["kind"] {
  if (text.includes("```")) return "code"
  if (
    /^(\s*(import|export|const|function|class|interface|type|enum|#include|def |fn |let |var |async ))/m.test(
      text
    )
  ) {
    return "code"
  }
  return "pasted_text"
}

function buildPasteAttachment(text: string): PasteAttachment {
  const lines = text.split(/\r?\n/)
  const kind = guessPasteKind(text)
  const rawTitle = lines[0]?.trim() || (kind === "code" ? "Pasted code" : "Pasted text")
  const previewTitle = rawTitle.length > 56 ? `${rawTitle.slice(0, 53)}…` : rawTitle
  return {
    id: createId(),
    kind,
    previewTitle,
    lineCount: lines.length,
    fullText: text,
  }
}

function shouldCollapsePaste(text: string): boolean {
  const lines = text.split(/\r?\n/)
  return lines.length > LINE_COLLAPSE || text.length > CHAR_COLLAPSE
}

export type ChatPromptVariant = "landing" | "thread"

export type ChatPromptBoxProps = {
  chatId: string
  variant?: ChatPromptVariant
  sendFromComposer: () => Promise<void>
  stopGeneration: () => void
}

export type ChatPromptBoxHandle = {
  focus: () => void
}

export const ChatPromptBox = React.forwardRef<ChatPromptBoxHandle, ChatPromptBoxProps>(
  function ChatPromptBox({ chatId, variant = "thread", sendFromComposer, stopGeneration }, ref) {
    const dispatch = useAppDispatch()
    const composer = useAppSelector((s) => selectComposer(s, chatId))
    const isStreaming = useAppSelector((s) => selectIsStreaming(s, chatId))

    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [sending, setSending] = React.useState(false)
    const [editOpen, setEditOpen] = React.useState(false)
    const [editDraft, setEditDraft] = React.useState("")
    const [editTargetId, setEditTargetId] = React.useState<string | null>(null)

    const prompt = composer.promptText
    const attachments = composer.attachments
    const hasContent = prompt.trim().length > 0 || attachments.length > 0

    React.useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
    }))

    React.useEffect(() => {
      const textareaElement = textareaRef.current
      if (!textareaElement) return

      textareaElement.style.height = "0px"
      const maxH = 220
      const nextHeight = Math.min(textareaElement.scrollHeight, maxH)
      textareaElement.style.height = `${nextHeight}px`
    }, [prompt])

    const openEdit = (a: PasteAttachment) => {
      setEditTargetId(a.id)
      setEditDraft(a.fullText)
      setEditOpen(true)
    }

    const saveEdit = () => {
      if (!editTargetId) return
      const target = attachments.find((x) => x.id === editTargetId)
      if (!target) return
      const lines = editDraft.split(/\r?\n/)
      const next: PasteAttachment = {
        ...target,
        fullText: editDraft,
        lineCount: lines.length,
        previewTitle:
          (lines[0]?.trim() || target.previewTitle).length > 56
            ? `${(lines[0]?.trim() || "").slice(0, 53)}…`
            : lines[0]?.trim() || target.previewTitle,
      }
      dispatch(updateComposerAttachment({ chatId, attachment: next }))
      setEditOpen(false)
      setEditTargetId(null)
    }

    const ingestPlainText = (text: string) => {
      if (!text) return
      if (shouldCollapsePaste(text)) {
        dispatch(addComposerAttachment({ chatId, attachment: buildPasteAttachment(text) }))
      } else {
        dispatch(
          setComposerPrompt({
            chatId,
            text: prompt ? `${prompt}\n${text}` : text,
          })
        )
      }
    }

    const onPaste: React.ClipboardEventHandler<HTMLTextAreaElement> = (e) => {
      const text = e.clipboardData.getData("text/plain")
      if (!text || !shouldCollapsePaste(text)) return
      e.preventDefault()
      dispatch(addComposerAttachment({ chatId, attachment: buildPasteAttachment(text) }))
    }

    const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      const file = e.target.files?.[0]
      e.target.value = ""
      if (!file) return
      void file.text().then((text) => ingestPlainText(text))
    }

    const handleSend = async () => {
      if (isStreaming || sending) return
      if (!hasContent) return
      setSending(true)
      try {
        await sendFromComposer()
      } finally {
        setSending(false)
      }
    }

    const handlePromptKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.nativeEvent.isComposing) return

      const isEnter = event.key === "Enter"
      const wantsNewLine = event.shiftKey || event.altKey
      const wantsForceSend = event.metaKey || event.ctrlKey

      if (isEnter && (wantsForceSend || !wantsNewLine)) {
        event.preventDefault()
        void handleSend()
      }

      if (event.key === "Escape") {
        textareaRef.current?.blur()
      }
    }

    const placeholder =
      variant === "landing"
        ? "Type / for search modes and shortcuts"
        : "Ask anything"

    return (
      <div
        className={cn(
          variant === "landing"
            ? "mt-10 rounded-3xl border border-border/80 bg-background p-5 shadow-md"
            : "mt-0 w-full rounded-[1.75rem] border border-border/50 bg-card p-4 shadow-2xl ring-1 ring-border/40"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          tabIndex={-1}
          accept=".txt,.md,.ts,.tsx,.js,.jsx,.json,.css,.html,.py,.rs,.go,.sql,text/plain"
          onChange={onFileChange}
        />

        {attachments.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((a) => (
              <PasteAttachmentChip
                key={a.id}
                attachment={a}
                onRemove={() => dispatch(removeComposerAttachment({ chatId, attachmentId: a.id }))}
                onExpand={() => openEdit(a)}
              />
            ))}
          </div>
        ) : null}

        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(event) => dispatch(setComposerPrompt({ chatId, text: event.target.value }))}
          onKeyDown={handlePromptKeyDown}
          onPaste={onPaste}
          placeholder={placeholder}
          rows={1}
          disabled={isStreaming}
          className="min-h-12 w-full pt-2 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-full text-muted-foreground hover:bg-muted"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming}
              aria-label="Add file"
            >
              <Plus className="size-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-9 gap-1.5 rounded-full border-0 bg-muted/80 px-3 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <Search className="size-3.5 opacity-70" />
                  Search
                  <ChevronDown className="size-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem disabled>Web search (soon)</DropdownMenuItem>
                <DropdownMenuItem disabled>Academic (soon)</DropdownMenuItem>
                <DropdownMenuItem disabled>Writing (soon)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden size-9 shrink-0 rounded-full text-muted-foreground hover:bg-muted sm:inline-flex"
              aria-label="Computer"
              title="Computer"
            >
              <Monitor className="size-4" />
            </Button>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 rounded-full text-muted-foreground hover:bg-muted"
              aria-label="Voice input"
              title="Voice input"
            >
              <Mic className="size-5" />
            </Button>

            {isStreaming ? (
              <Button
                type="button"
                size="icon"
                className="size-10 shrink-0 rounded-full bg-foreground text-background hover:bg-foreground/90"
                onClick={stopGeneration}
                aria-label="Stop generating"
              >
                <Square className="size-4 fill-current" />
              </Button>
            ) : (
              <Button
                type="button"
                size="icon"
                className={cn(
                  "size-10 shrink-0 rounded-full transition-colors",
                  hasContent
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
                onClick={() => void handleSend()}
                disabled={!hasContent || sending}
                aria-label={hasContent ? "Send message" : "Send"}
              >
                {sending ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <SendHorizontal className="size-5" />
                )}
              </Button>
            )}
          </div>
        </div>

        <Sheet open={editOpen} onOpenChange={setEditOpen}>
          <SheetContent
            side="bottom"
            className={cn(
              "flex min-h-0 flex-col gap-0 overflow-hidden p-0",
              "data-[side=bottom]:h-[min(92dvh,calc(100dvh-env(safe-area-inset-bottom,0px)))]",
              "data-[side=bottom]:max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-bottom,0px)))]"
            )}
          >
            <SheetHeader className="shrink-0">
              <SheetTitle className="truncate pr-8">Edit pasted content</SheetTitle>
            </SheetHeader>
            <div className="mx-4 flex min-h-0 flex-1 flex-col overflow-hidden">
              <textarea
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                rows={1}
                className="min-h-0 w-full flex-1 resize-none overflow-auto whitespace-pre rounded-md border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-foreground outline-none"
                spellCheck={false}
              />
            </div>
            <SheetFooter className="mt-auto flex shrink-0 flex-row flex-wrap items-center justify-end gap-2 border-t border-border px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="shrink-0"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" size="lg" className="shrink-0" onClick={saveEdit}>
                Save
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    )
  }
)
