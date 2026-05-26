import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"


const Layout = ({children}:{children: React.ReactNode}) => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex min-h-0 flex-1 flex-col bg-accent/20">
            {children}
            </SidebarInset>
        </SidebarProvider>

    );
};

export default Layout;