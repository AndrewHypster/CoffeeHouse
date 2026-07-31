import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Building2, ChevronsUpDown, LogOut, Plus, User } from "lucide-react";
import { NAV_CONFIG } from '@/config/navigation'
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function AppSidebar() {
  const { data:session } = useSession()
  const userRole = session?.user.role || 'guest'

  useEffect(() => {
    console.log(session);
  }, [session])

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {NAV_CONFIG.map((group, key) => {
          // Фільтруємо пункти всередині групи
          const allowedItems = group.items.filter((item) =>
            item.roles.includes(userRole),
          );

          // Якщо в групі немає дозволених пунктів — не рендеримо її взагалі
          if (allowedItems.length === 0) return null;

          return (
            <SidebarGroup key={key}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarMenu>
                {allowedItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* <SidebarFooter>
        <SidebarMenu>
          {session && (
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <User className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.name || "Користувач"}
                      </span>
                      <span className="truncate text-xs">
                        {user?.role || "Role"}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="z-[101] w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg z-[100]"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                  >
                    <LogOut className="mr-2 size-4" />
                    Вийти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter> */}
    </Sidebar>
  );
}
