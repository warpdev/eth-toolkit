import { CalldataDecoder } from "@/features/calldata-decoder";
import { 
  Sidebar, 
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Home() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <h2 className="font-semibold">Ethereum Tools</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>Calldata Decoder</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Calldata Encoder</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center justify-between p-2">
              <span className="text-xs text-muted-foreground">v0.1.0</span>
              <ThemeToggle />
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 p-8 overflow-auto">
          <div className="w-full max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Ethereum Developer Toolkit</h1>
            <CalldataDecoder />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}