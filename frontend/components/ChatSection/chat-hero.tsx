"use client"

import Lottie from "lottie-react"
import botAnimation from "@/public/lottie/bot.json"

export function ChatHero() {
  return (
    <div className="flex flex-col items-center pt-10">
      <div className="relative mb-5 size-36">
        <div className="absolute -inset-2 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,hsl(var(--primary)/0.35)_80deg,transparent_160deg,transparent_360deg)] blur-[1px] animate-[spin_10s_linear_infinite]" />
        <div className="absolute inset-2 rounded-full bg-primary/10 blur-md animate-[pulse_5s_ease-in-out_infinite]" />
        <div className="relative size-36 rounded-full bg-accent shadow-md">
          <Lottie animationData={botAnimation} loop autoplay className="size-full" />
        </div>
      </div>
      <h2 className="text-3xl font-semibold tracking-tight text-muted-foreground">
        Hello, Subrata
      </h2>
      <p className="mt-1.5 text-4xl font-semibold tracking-tight text-foreground">
        How can I assist you today?
      </p>
    </div>
  )
}
