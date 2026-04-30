"use client"

import { Brain, CheckCircle2, RefreshCw } from "lucide-react"

const suggestionCards = [
  {
    title: "Synthesize Data",
    description: "Turn my meeting notes into 5 key bullet points for the team.",
    icon: RefreshCw,
  },
  {
    title: "Creative Brainstorm",
    description: "Generate 3 taglines for a new sustainable fashion brand.",
    icon: Brain,
  },
  {
    title: "Check Facts",
    description: "Compare key differences between GDPR and CCPA.",
    icon: CheckCircle2,
  },
]

export function ChatSuggestionCards() {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-3">
      {suggestionCards.map((card) => (
        <button
          key={card.title}
          className="rounded-2xl border border-border bg-background p-4 text-left shadow-sm transition hover:bg-muted"
        >
          <card.icon className="size-4 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium text-foreground">{card.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
        </button>
      ))}
    </div>
  )
}
