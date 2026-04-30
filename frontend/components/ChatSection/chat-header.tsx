"use client"

import { useState } from "react"
import { AudioWaveform, Check, ChevronDown, Download, Link2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const dummyApiModels = [
  "gpt-4o-mini",
  "gpt-4.1",
  "gpt-4.1-mini",
  "claude-3.7-sonnet",
  "gemini-2.0-flash",
]

export function ChatHeader() {
  const [selectedModel, setSelectedModel] = useState(dummyApiModels[0])

  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-3">
      <div className="flex items-center gap-2">
        {/* <SidebarTrigger className="size-8 rounded-md border border-border bg-background" /> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-8 rounded-md border-border bg-background px-2 text-sm"
            >
              <span className="mr-1 inline-flex size-4 items-center justify-center rounded-full bg-accent p-3 text-[16px] font-semibold text-accent-foreground">
                <AudioWaveform className="h-4 w-4" />
              </span>
              {selectedModel}
              <ChevronDown className="ml-1 size-3.5 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            {dummyApiModels.map((model) => (
              <DropdownMenuItem key={model} onSelect={() => setSelectedModel(model)} className="text-sm">
                <span className="flex-1">{model}</span>
                {selectedModel === model ? <Check className="size-4" /> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="icon" className="size-8 rounded-md">
          <Link2 className="size-4" />
        </Button>
        <Button variant="outline" className="h-8 rounded-md px-3 text-sm">
          <Download className="mr-2 size-3.5" />
          Export chat
        </Button>
        <Button className="h-8 rounded-md bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/90">
          Upgrade
        </Button>
      </div>
    </div>
  )
}
