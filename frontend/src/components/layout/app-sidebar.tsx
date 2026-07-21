import {
  LayoutDashboard,
  Package,
  ShieldCheck,
  Tags,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/auth-context'

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  UserCog,
  ShieldCheck,
}

export function AppSidebar() {
  const { user } = useAuth()
  const visibleMenus = (user?.permissions ?? []).filter((p) => p.can_view)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="size-4" />
          </div>
          <span className="truncate font-semibold">Py CRUD Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenus.map((menu) => {
                const Icon = ICONS[menu.icon] ?? Package
                return (
                  <SidebarMenuItem key={menu.menu_key}>
                    <SidebarMenuButton asChild tooltip={menu.menu_label}>
                      <NavLink
                        to={menu.path}
                        end={menu.path === '/'}
                        className={({ isActive }) =>
                          isActive ? 'font-medium text-sidebar-accent-foreground' : ''
                        }
                      >
                        <Icon />
                        <span>{menu.menu_label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
