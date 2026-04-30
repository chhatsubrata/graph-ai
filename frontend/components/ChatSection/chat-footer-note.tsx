"use client"

import { CircleHelp, Languages } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ChatFooterNote() {
  return (
    <div className="mt-auto pt-14">
      <div className="text-center text-xs text-muted-foreground">
        Join the valerius community for more insights{" "}
        <a href="#" className="font-medium text-primary underline underline-offset-2">
          Join Discord
        </a>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" size="icon" className="size-8 rounded-full bg-background">
          <Languages className="size-4" />
        </Button>
        <Button variant="outline" size="icon" className="size-8 rounded-full bg-background">
          <CircleHelp className="size-4" />
        </Button>
      </div>
    </div>
  )
}
