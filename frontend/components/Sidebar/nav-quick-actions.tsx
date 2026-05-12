"use client"

import { Plus, Search } from "lucide-react"

import {
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAppDispatch } from "@/lib/store"
import { startNewChat } from "@/features/chat/state/chatSlice"

export function NavQuickActions() {
  const dispatch = useAppDispatch()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="mt-2 space-y-2">
          <SidebarMenuButton
            type="button"
            className="h-8 justify-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary active:text-primary-foreground data-active:bg-primary data-active:text-primary-foreground group-data-[collapsible=icon]:gap-0"
            onClick={() => dispatch(startNewChat())}
          >
            <Plus className="size-4" />
            <span className="group-data-[collapsible=icon]:hidden">New chat</span>
          </SidebarMenuButton>

          <div className="relative group-data-[collapsible=icon]:hidden">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2" />
            <SidebarInput
              aria-label="Search"
              placeholder="Search"
              className="h-8 border-border bg-muted/50 pl-8 pr-3"
            />
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
