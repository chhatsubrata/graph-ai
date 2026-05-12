"use client"

import * as React from "react"

import { CopyIconButton } from "@/components/ui/copy-icon-button"

type CodeBlockProps = {
  code: string
  language?: string
}

export const CodeBlock = React.memo(function CodeBlock({
  code,
  language = "",
}: CodeBlockProps) {
  const [html, setHtml] = React.useState("")
  const lang = language

  React.useEffect(() => {
    if (!code) {
      setHtml("")
      return
    }
    let cancelled = false
    const timer = window.setTimeout(() => {
      void (async () => {
        const hljs = (await import("highlight.js")).default
        try {
          const result =
            lang && hljs.getLanguage(lang)
              ? hljs.highlight(code, { language: lang, ignoreIllegals: true })
              : hljs.highlightAuto(code)
          if (!cancelled) setHtml(result.value)
        } catch {
          if (!cancelled) setHtml("")
        }
      })()
    }, 280)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [code, lang])

  return (
    <div className="group relative my-3 isolate overflow-hidden rounded-lg border border-border bg-zinc-950 text-zinc-100">
      <CopyIconButton
        text={code}
        variant="secondary"
        size="sm"
        className="absolute right-2 top-2 z-10 h-7 opacity-0 transition-opacity group-hover:opacity-100"
        copiedIconClassName="size-3.5 text-emerald-400 motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-150"
        iconClassName="size-3.5"
      />
      <pre className="max-w-full overflow-x-auto overflow-y-visible p-3 text-xs leading-relaxed font-mono">
        {html ? (
          <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <code className="block min-w-0 whitespace-pre text-zinc-100">
            {code}
          </code>
        )}
      </pre>
    </div>
  )
})
