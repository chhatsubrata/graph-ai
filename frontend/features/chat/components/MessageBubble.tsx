"use client"

import * as React from "react"
import {
  Download,
  FileCode2,
  FileText,
  MoreHorizontal,
  Pencil,
  RotateCw,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { CopyIconButton, CopyTextDropdownMenuItem } from "@/components/ui/copy-icon-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Message, PasteAttachment } from "@/features/chat/model/types"
import { createId } from "@/features/chat/model/types"
import { AssistantMarkdown } from "@/features/chat/components/AssistantMarkdown"
import { PasteAttachmentChip } from "@/features/chat/components/PasteAttachmentChip"
import { selectIsStreaming } from "@/features/chat/model/selectors"
import { useAppSelector } from "@/lib/store"
import { cn } from "@/lib/utils"

export type EditAndRegeneratePayload = {
  messageId: string
  prompt: string
  attachments: PasteAttachment[]
}

type MessageBubbleProps = {
  message: Message
  onRequestComposerFocus?: () => void
  onEditAndRegenerate?: (payload: EditAndRegeneratePayload) => void | Promise<void>
}

function textFromParts(message: Message) {
  return message.parts
    .filter((p): p is Extract<(typeof message.parts)[number], { type: "text" }> => p.type === "text")
    .map((p) => p.markdown)
    .join("\n\n")
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function shareOrCopy(text: string) {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ text })
      return
    } catch {
      /* fall through */
    }
  }
  await navigator.clipboard.writeText(text)
}

/** Matches `buildUserDisplayParts` collapsed paste line: _title (N lines)_ */
const COLLAPSED_PASTE_LINE = /^_(.+) \((\d+) lines\)_$/

function isCodeLikePreview(title: string) {
  return /["'`]|^import |^export |^const |^function |^class |^interface |^type |^#include |^def /.test(
    title.trim()
  )
}

/** Parses `buildUserApiContent` segments: `\n\n---\n<previewTitle>\n\n<full pasted text>` */
function pasteBodiesByPreviewTitle(apiContent: string | undefined): Map<string, string> {
  const map = new Map<string, string>()
  if (!apiContent) return map
  const blocks = apiContent.split(/\n\n---\n/)
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i]
    const splitAt = block.indexOf("\n\n")
    if (splitAt === -1) continue
    const title = block.slice(0, splitAt).trim()
    const fullText = block.slice(splitAt + 2)
    if (title) map.set(title, fullText)
  }
  return map
}

function UserMessageBody({
  body,
  pasteBodies,
  onOpenPastePreview,
}: {
  body: string
  pasteBodies: Map<string, string>
  onOpenPastePreview: (title: string, fullText: string) => void
}) {
  const segments = body.split(/\n\n/).filter((s) => s.length > 0)
  return (
    <div className="flex min-w-0 flex-col gap-2 text-left">
      {segments.map((raw, i) => {
        const seg = raw.trim()
        const m = seg.match(COLLAPSED_PASTE_LINE)
        if (m) {
          const title = m[1]
          const lineCount = m[2]
          const Icon = isCodeLikePreview(title) ? FileCode2 : FileText
          const fullText = pasteBodies.get(title)
          const canExpand = Boolean(fullText)
          const chipClass =
            "flex min-w-0 max-w-full items-center gap-2 rounded-lg border border-border/70 bg-white/80 px-2.5 py-2 text-xs dark:bg-background/60"
          const chipInner = (
            <>
              <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex-1 truncate font-medium text-foreground" title={title}>
                {title}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{lineCount} lines</span>
            </>
          )
          return canExpand ? (
            <button
              key={i}
              type="button"
              className={cn(chipClass, "cursor-pointer text-left transition-colors hover:bg-muted/60")}
              onClick={() => onOpenPastePreview(title, fullText!)}
              aria-label={`View full pasted content: ${title}`}
            >
              {chipInner}
            </button>
          ) : (
            <div key={i} className={chipClass}>
              {chipInner}
            </div>
          )
        }
        return (
          <div key={i} className="wrap-break-word whitespace-pre-wrap leading-relaxed">
            {raw}
          </div>
        )
      })}
    </div>
  )
}

export const MessageBubble = React.memo(function MessageBubble({
  message,
  onRequestComposerFocus,
  onEditAndRegenerate,
}: MessageBubbleProps) {
  const body = textFromParts(message)
  const isUser = message.role === "user"
  const hasAnswerText = body.trim().length > 0
  const isStreamingChat = useAppSelector((s) => selectIsStreaming(s, message.chatId))
  const pasteBodies = React.useMemo(
    () => pasteBodiesByPreviewTitle(message.apiContent),
    [message.apiContent]
  )
  const [userPastePreview, setUserPastePreview] = React.useState<{
    title: string
    fullText: string
    attachmentId?: string
  } | null>(null)
  const [pastePreviewDraft, setPastePreviewDraft] = React.useState("")

  React.useEffect(() => {
    setPastePreviewDraft(userPastePreview?.fullText ?? "")
  }, [userPastePreview])

  const previewEditable = Boolean(userPastePreview?.attachmentId)

  const savePastePreviewEdit = React.useCallback(() => {
    const attachmentId = userPastePreview?.attachmentId
    if (!attachmentId) return
    const next = pastePreviewDraft
    setEditAttachments((prev) =>
      prev.map((a) =>
        a.id === attachmentId
          ? {
              ...a,
              fullText: next,
              lineCount: next.split(/\r?\n/).length,
            }
          : a
      )
    )
    setUserPastePreview(null)
  }, [pastePreviewDraft, userPastePreview])

  const [isEditing, setIsEditing] = React.useState(false)
  const [editPrompt, setEditPrompt] = React.useState("")
  const [editAttachments, setEditAttachments] = React.useState<PasteAttachment[]>([])
  const editTextareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (!isEditing) return
    const el = editTextareaRef.current
    if (!el) return
    el.style.height = "0px"
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`
  }, [editPrompt, isEditing])

  React.useEffect(() => {
    if (!isEditing) return
    editTextareaRef.current?.focus()
    const el = editTextareaRef.current
    if (el) el.selectionStart = el.selectionEnd = el.value.length
  }, [isEditing])

  const beginEdit = React.useCallback(() => {
    if (isStreamingChat) return
    const promptLines: string[] = []
    const restored: PasteAttachment[] = []
    for (const raw of body.split(/\n\n/)) {
      const seg = raw.trim()
      const m = seg.match(COLLAPSED_PASTE_LINE)
      if (m) {
        const title = m[1]
        const lineCount = Number(m[2])
        const fullText = pasteBodies.get(title)
        if (fullText !== undefined) {
          restored.push({
            id: createId(),
            kind: isCodeLikePreview(title) ? "code" : "pasted_text",
            previewTitle: title,
            lineCount: Number.isFinite(lineCount) ? lineCount : fullText.split(/\r?\n/).length,
            fullText,
          })
          continue
        }
      }
      if (raw.length > 0) promptLines.push(raw)
    }
    setEditPrompt(promptLines.join("\n\n"))
    setEditAttachments(restored)
    setIsEditing(true)
  }, [body, isStreamingChat, pasteBodies])

  const cancelEdit = React.useCallback(() => {
    setIsEditing(false)
    setEditPrompt("")
    setEditAttachments([])
  }, [])

  const canSaveEdit = editPrompt.trim().length > 0 || editAttachments.length > 0

  const saveEdit = React.useCallback(async () => {
    if (!canSaveEdit) return
    if (!onEditAndRegenerate) return
    const payload: EditAndRegeneratePayload = {
      messageId: message.id,
      prompt: editPrompt,
      attachments: editAttachments,
    }
    setIsEditing(false)
    await onEditAndRegenerate(payload)
  }, [canSaveEdit, editAttachments, editPrompt, message.id, onEditAndRegenerate])

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === "Escape") {
      e.preventDefault()
      cancelEdit()
      return
    }
    const wantsNewline = e.shiftKey || e.altKey
    if (e.key === "Enter" && !wantsNewline) {
      e.preventDefault()
      void saveEdit()
    }
  }

  if (isUser) {
    return (
      <>
        <div className={cn("flex", isEditing ? "justify-stretch" : "justify-end")}>
          {isEditing ? (
            <div className="w-full">
              <div className="flex w-full flex-col gap-2 rounded-2xl bg-neutral-200/90 px-4 py-3 text-sm text-foreground shadow-sm dark:bg-muted">
                {editAttachments.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {editAttachments.map((a) => (
                      <PasteAttachmentChip
                        key={a.id}
                        attachment={a}
                        onRemove={() =>
                          setEditAttachments((prev) => prev.filter((x) => x.id !== a.id))
                        }
                        onExpand={() =>
                          setUserPastePreview({
                            title: a.previewTitle,
                            fullText: a.fullText,
                            attachmentId: a.id,
                          })
                        }
                      />
                    ))}
                  </div>
                ) : null}
                <textarea
                  ref={editTextareaRef}
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  rows={1}
                  className="min-h-12 w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  placeholder="Edit your message"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void saveEdit()}
                    disabled={!canSaveEdit || isStreamingChat}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="group flex max-w-[min(100%,80%)] flex-col items-end gap-1">
              <div
                className={cn(
                  "min-w-0 rounded-3xl px-4 py-2.5 text-[15px] leading-relaxed",
                  "bg-muted/90 text-foreground shadow-none ring-1 ring-border/30 dark:bg-muted/80"
                )}
              >
                <UserMessageBody
                  body={body}
                  pasteBodies={pasteBodies}
                  onOpenPastePreview={(title, fullText) => setUserPastePreview({ title, fullText })}
                />
              </div>
              <div className="flex items-center gap-0.5 pr-0.5 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                <CopyIconButton
                  text={body}
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  disabled={isStreamingChat}
                  copyLabel="Copy message"
                  copiedLabel="Copied"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  disabled={isStreamingChat || !onEditAndRegenerate}
                  title="Edit message"
                  aria-label="Edit message"
                  onClick={beginEdit}
                >
                  <Pencil className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <Sheet open={userPastePreview !== null} onOpenChange={(open) => !open && setUserPastePreview(null)}>
          <SheetContent
            side="bottom"
            className={cn(
              "flex min-h-0 flex-col gap-0 overflow-hidden p-0",
              /* Sheet base uses `data-[side=bottom]:h-auto`, which beats plain `h-*` — set height on the same variant */
              "data-[side=bottom]:h-[min(92dvh,calc(100dvh-env(safe-area-inset-bottom,0px)))]",
              "data-[side=bottom]:max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-bottom,0px)))]"
            )}
          >
            <SheetHeader className="shrink-0">
              <SheetTitle className="truncate pr-8" title={userPastePreview?.title}>
                Pasted content · {userPastePreview?.title}
              </SheetTitle>
            </SheetHeader>
            <div className="mx-4 flex min-h-0 flex-1 flex-col overflow-hidden">
              {previewEditable ? (
                <textarea
                  value={pastePreviewDraft}
                  onChange={(e) => setPastePreviewDraft(e.target.value)}
                  rows={1}
                  className="min-h-0 w-full flex-1 resize-none overflow-auto whitespace-pre rounded-md border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-foreground outline-none"
                  spellCheck={false}
                />
              ) : (
                <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap wrap-break-word rounded-md border border-border bg-muted/30 p-3 font-mono text-[11px] leading-relaxed text-foreground">
                  {userPastePreview?.fullText ?? ""}
                </pre>
              )}
            </div>
            <SheetFooter className="mt-auto flex shrink-0 flex-row flex-wrap items-center justify-end gap-2 border-t border-border px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <CopyIconButton
                text={previewEditable ? pastePreviewDraft : userPastePreview?.fullText ?? ""}
                variant="outline"
                size="icon-lg"
                className="shrink-0"
                copyLabel="Copy full paste"
                copiedLabel="Copied"
              />
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="shrink-0"
                onClick={() => setUserPastePreview(null)}
              >
                {previewEditable ? "Cancel" : "Close"}
              </Button>
              {previewEditable ? (
                <Button type="button" size="lg" className="shrink-0" onClick={savePastePreviewEdit}>
                  Save
                </Button>
              ) : null}
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  const streaming = message.status === "streaming"
  const showActionRow = hasAnswerText

  return (
    <div className="flex w-full min-w-0 justify-start">
      <div className="min-w-0 w-full max-w-full space-y-2.5">
        {message.thinkingMarkdown ? (
          <details className="rounded-lg border border-border/40 bg-muted/20 text-xs text-muted-foreground dark:bg-muted/15">
            <summary className="cursor-pointer select-none px-3 py-2 text-[11px] font-medium tracking-wide text-muted-foreground/90">
              Thinking
            </summary>
            <pre className="whitespace-pre-wrap wrap-break-word border-t border-border/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground/95">
              {message.thinkingMarkdown}
            </pre>
          </details>
        ) : null}

        {hasAnswerText ? (
          <div className="min-w-0 max-w-full px-0.5 py-0.5 text-[15px] leading-[1.65] text-foreground">
            <AssistantMarkdown markdown={body} isStreaming={streaming} />
          </div>
        ) : null}

        {message.status === "error" && message.errorMessage ? (
          <p className="text-sm text-destructive">{message.errorMessage}</p>
        ) : null}

        {streaming && !hasAnswerText ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex size-2 animate-pulse rounded-full bg-primary" aria-hidden />
            Generating…
          </div>
        ) : null}

        {showActionRow ? (
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                disabled={streaming}
                title="Share"
                onClick={() => void shareOrCopy(body)}
              >
                <Share2 className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                disabled={streaming}
                title="Download"
                onClick={() => downloadText(`assistant-${message.id.slice(0, 8)}.txt`, body)}
              >
                <Download className="size-4" />
              </Button>
              <CopyIconButton
                text={body}
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                disabled={streaming}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                disabled={streaming}
                title="Regenerate"
                onClick={() => {}}
              >
                <RotateCw className="size-4" />
              </Button>
            </div>

            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                disabled={streaming}
                title="Good response"
              >
                <ThumbsUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                disabled={streaming}
                title="Bad response"
              >
                <ThumbsDown className="size-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground"
                    disabled={streaming}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <CopyTextDropdownMenuItem text={body} />
                  <DropdownMenuItem onClick={() => downloadText(`assistant-${message.id.slice(0, 8)}.txt`, body)}>
                    Download as .txt
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
})
