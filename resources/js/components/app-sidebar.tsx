import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { LayoutGrid, FileText, Users, Bell, Shield, UserCog, BarChart2, Star } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar, SidebarContent, SidebarFooter,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem, Auth } from '@/types';
import AppLogo from './app-logo';
import { dashboard } from '@/routes';
import boletas from '@/routes/boletas';
import clientes from '@/routes/clientes';
import notificaciones from '@/routes/notificaciones';
import roles from '@/routes/roles';
import usuarios from '@/routes/usuarios';
import reportes from '@/routes/reportes';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
]

const panelNavItems: NavItem[] = [
    {
        title: 'Boletas',
        href: boletas.index(),
        icon: FileText,
        permission: 'ver boletas',
    },
    {
        title: 'Clientes',
        href: clientes.index(),
        icon: Users,
        permission: 'ver clientes',
    },
    {
        title: 'Notificaciones',
        href: notificaciones.index(),
        icon: Bell,
        permission: 'ver notificaciones',
    },
    {
        title: 'Usuarios',
        href: usuarios.index(),
        icon: UserCog,
        permission: 'ver usuarios',
    },
    {
        title: 'Roles',
        href: roles.index(),
        icon: Shield,
        permission: 'ver roles',
    },
]

const reportesNavItems: NavItem[] = [
    {
        title: 'Clientes',
        href: reportes.clientes.index(),
        icon: BarChart2,
        permission: 'ver clientes',
    },
    {
        title: 'Boletas',
        href: reportes.boletas.index(),
        icon: BarChart2,
        permission: 'ver clientes',
    },
    {
        title: 'Puntos',
        href: reportes.puntos.index(),
        icon: Star,
        permission: 'ver puntos',
    },
]

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props
    const perms = auth.permissions ?? []
    const isAdmin = auth.roles?.includes('administrador')

    const filteredPanel = panelNavItems.filter(item =>
        !item.permission || isAdmin || perms.includes(item.permission)
    )

    const filteredReportes = reportesNavItems.filter(item =>
        !item.permission || isAdmin || perms.includes(item.permission)
    )

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={mainNavItems} />
                <NavMain items={filteredPanel} />
                <NavMain label="Reportes" items={filteredReportes} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}