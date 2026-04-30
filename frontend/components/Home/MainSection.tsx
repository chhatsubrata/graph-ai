import { SidebarLeft } from '@/components/Home/Sidebar'
import ChatsSection from '@/components/Home/ChatsSection'
import { SidebarProvider } from '@/components/ui/sidebar'

const MainSection = () => {
    return (
        <SidebarProvider>
            <div className="flex w-full">
                <SidebarLeft />
                <ChatsSection />
            </div>
        </SidebarProvider>
    )
}

export default MainSection