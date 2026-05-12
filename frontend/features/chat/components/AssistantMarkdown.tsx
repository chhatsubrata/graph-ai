"use client"

import * as React from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import type { Components } from "react-markdown"
import { CodeBlock } from "@/features/chat/components/CodeBlock"

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), "className", ["class"]],
    pre: [...(defaultSchema.attributes?.pre ?? []), "className", ["class"]],
  },
}

type AssistantMarkdownProps = {
  markdown: string
  /** Kept for API compatibility; highlighting is debounced in CodeBlock while streaming. */
  isStreaming?: boolean
}

export const AssistantMarkdown = React.memo(function AssistantMarkdown({
  markdown,
  isStreaming: _isStreaming = false,
}: AssistantMarkdownProps) {
  const components = React.useMemo<Components>(
    () => ({
      pre({ children }) {
        return <>{children}</>
      },
      p({ children, ...props }) {
        return (
          <p className="min-w-0 max-w-full wrap-anywhere" {...props}>
            {children}
          </p>
        )
      },
      code({ className, children, ...props }) {
        const inline = !className
        const text = String(children).replace(/\n$/, "")
        if (inline) {
          return (
            <code
              className="rounded-md bg-muted px-1.5 py-0.5 text-[0.9em] font-mono text-foreground"
              {...props}
            >
              {children}
            </code>
          )
        }
        const language = className?.replace(/^language-/, "") ?? ""
        return <CodeBlock code={text} language={language} />
      },
    }),
    []
  )

  return (
    <div className="prose prose-sm dark:prose-invert min-w-0 max-w-full overflow-x-auto text-sm leading-relaxed [&_li]:wrap-anywhere [&_ol]:my-2 [&_p]:my-2 [&_ul]:my-2 [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        components={components}
      >
        {markdown}
      </Markdown>
    </div>
  )
})
