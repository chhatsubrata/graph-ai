"use client"

import * as React from "react"
import { ChevronDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0])
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed" && !isMobile

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem className="w-full">
        <DropdownMenu
          onOpenChange={(open) => {
            if (!open) {
              triggerRef.current?.blur()
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              ref={triggerRef}
              className="w-full justify-between px-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!"
            >
              <div className="flex min-w-0 items-center gap-2 group-data-[collapsible=icon]:size-full group-data-[collapsible=icon]:justify-center">
                <div className="flex aspect-square size-5 items-center justify-center rounded-md bg-primary text-primary-foreground group-data-[collapsible=icon]:size-8">
                  <activeTeam.logo className="size-3 group-data-[collapsible=icon]:size-4" />
                </div>
                <span className="truncate text-left font-medium group-data-[collapsible=icon]:hidden">
                  {activeTeam.name}
                </span>
              </div>
              <ChevronDown className="opacity-50 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-0 rounded-lg data-[state=open]:animate-in"
            style={{
              width: isCollapsed ? "14rem" : "var(--radix-dropdown-menu-trigger-width)",
            }}
            align="start"
            side={isCollapsed ? "right" : "bottom"}
            sideOffset={isCollapsed ? 8 : 4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-xs border">
                  <team.logo className="size-4 shrink-0" />
                </div>
                {team.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
