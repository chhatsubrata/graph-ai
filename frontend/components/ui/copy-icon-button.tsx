"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useCopyFeedback } from "@/hooks/use-copy-feedback"
import { cn } from "@/lib/utils"

type CopyIconButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick" | "children"> & {
  text: string
  copiedLabel?: string
  copyLabel?: string
  copiedIconClassName?: string
  iconClassName?: string
}

export function CopyIconButton({
  text,
  className,
  copiedLabel = "Copied",
  copyLabel = "Copy",
  copiedIconClassName = "size-4 text-emerald-500 motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-150 dark:text-emerald-400",
  iconClassName = "size-4",
  variant = "ghost",
  size = "icon",
  disabled,
  title,
  ...props
}: CopyIconButtonProps) {
  const { copied, copy } = useCopyFeedback()

  const label = copied ? copiedLabel : copyLabel

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={disabled}
      title={title ?? label}
      aria-label={label}
      {...props}
      className={cn(className)}
      onClick={() => void copy(text)}
    >
      <span className="sr-only" aria-live="polite">
        {copied ? copiedLabel : copyLabel}
      </span>
      {copied ? (
        <Check className={copiedIconClassName} aria-hidden />
      ) : (
        <Copy className={iconClassName} aria-hidden />
      )}
    </Button>
  )
}

type CopyTextDropdownMenuItemProps = Omit<
  React.ComponentProps<typeof DropdownMenuItem>,
  "onSelect"
> & {
  text: string
  srLabel?: string
}

export function resolveCopyUrl(href: string): string {
  if (typeof window === "undefined") return href
  if (href.startsWith("http://") || href.startsWith("https://")) return href
  if (href === "#" || href === "") return window.location.href
  try {
    return new URL(href, window.location.origin).href
  } catch {
    return window.location.href
  }
}

export function CopyTextDropdownMenuItem({
  text,
  srLabel = "Copy message",
  className,
  ...props
}: CopyTextDropdownMenuItemProps) {
  const { copied, copy } = useCopyFeedback()

  return (
    <DropdownMenuItem className={cn(className)} {...props} onSelect={() => void copy(text)}>
      {copied ? (
        <Check
          className="size-4 text-emerald-500 motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-150 dark:text-emerald-400"
          aria-hidden
        />
      ) : (
        <Copy className="size-4 text-muted-foreground" aria-hidden />
      )}
      <span className="sr-only">{copied ? "Copied" : srLabel}</span>
    </DropdownMenuItem>
  )
}

type CopyLinkDropdownMenuItemProps = Omit<
  React.ComponentProps<typeof DropdownMenuItem>,
  "onSelect"
> & {
  href: string
}

export function CopyLinkDropdownMenuItem({
  href,
  className,
  ...props
}: CopyLinkDropdownMenuItemProps) {
  const { copied, copy } = useCopyFeedback()

  return (
    <DropdownMenuItem
      className={cn(className)}
      {...props}
      onSelect={() => void copy(resolveCopyUrl(href))}
    >
      {copied ? (
        <Check
          className="size-4 text-emerald-500 motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-150 dark:text-emerald-400"
          aria-hidden
        />
      ) : (
        <Copy className="size-4 text-muted-foreground" aria-hidden />
      )}
      <span className="sr-only">{copied ? "Copied" : "Copy link"}</span>
    </DropdownMenuItem>
  )
}
