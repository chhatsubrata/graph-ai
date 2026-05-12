"use client"

import { FileCode2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PasteAttachment } from "@/features/chat/model/types"

type PasteAttachmentChipProps = {
  attachment: PasteAttachment
  onRemove: () => void
  onExpand: () => void
}

export function PasteAttachmentChip({
  attachment,
  onRemove,
  onExpand,
}: PasteAttachmentChipProps) {
  const Icon = attachment.kind === "code" ? FileCode2 : FileText
  return (
    <div className="flex max-w-full items-center gap-2 rounded-lg border border-border bg-muted/60 px-2 py-1.5 text-xs">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <button
        type="button"
        className="min-w-0 flex-1 truncate text-left font-medium text-foreground underline-offset-2 hover:underline"
        onClick={onExpand}
      >
        {attachment.previewTitle} · {attachment.lineCount} lines
      </button>
      <Button type="button" variant="ghost" size="sm" className="h-7 shrink-0 px-2" onClick={onRemove}>
        Remove
      </Button>
    </div>
  )
}
