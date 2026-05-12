import ChatsSection from "@/components/Home/ChatsSection"
import { SidebarLeft } from "@/components/Home/Sidebar"
import { InitializeHomeChat } from "@/features/chat/components/InitializeHomeChat"
import { SyncActiveChatToUrl } from "@/features/chat/components/SyncActiveChatToUrl"
import { SidebarProvider } from "@/components/ui/sidebar"

const MainSection = () => {
  return (
    <SidebarProvider className="min-h-0 h-dvh max-h-dvh overflow-hidden">
      <InitializeHomeChat />
      <SyncActiveChatToUrl />
      <div className="flex min-h-0 h-full w-full flex-1">
        <SidebarLeft />
        <ChatsSection />
      </div>
    </SidebarProvider>
  )
}

export default MainSection