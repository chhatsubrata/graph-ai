"use client"

import * as React from "react"

import { NavFavorites } from "@/components/Sidebar/nav-recents"
import { NavProjects } from "@/components/Sidebar/nav-projects"
import { NavQuickActions } from "@/components/Sidebar/nav-quick-actions"
import { NavUser } from "@/components/Sidebar/nav-user"
import { TeamSwitcher } from "@/components/Sidebar/nav-teamSwitcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { data } from "@/data/dummy"

export function SidebarLeft({
  collapsible = "icon",
  ...props
}: React.ComponentProps<typeof Sidebar> & { collapsible?: "icon" | "offcanvas" | "none" }) {
  return (
    <Sidebar className="border-r-0 relative" collapsible={collapsible} {...props}>
      <div className="absolute top-0 right-[-25px] z-10 mt-2">
        <SidebarTrigger className="flex w-full justify-end [&_svg]:size-4.5!" />
      </div>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <NavQuickActions />
        <NavProjects projects={data.projects} />
      </SidebarHeader>
      <SidebarContent>
        <NavFavorites favorites={data.recents} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
