import { Link } from '@inertiajs/react';
import { LayoutGrid, FileText, Users, Bell, Shield, UserCog } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';
import { dashboard } from '@/routes';
import boletas from '@/routes/boletas';
import clientes from '@/routes/clientes';
import notificaciones from '@/routes/notificaciones';
import roles from '@/routes/roles';
import usuarios from '@/routes/usuarios';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const panelNavItems: NavItem[] = [
    {
        title: 'Boletas',
        href: boletas.index(),
        icon: FileText,
    },
    {
        title: 'Clientes',
        href: clientes.index(),
        icon: Users,
    },
    {
        title: 'Notificaciones',
        href: notificaciones.index(),
        icon: Bell,
    },
    {
        title: 'Roles',
        href: roles.index(),
        icon: Shield,
    },
    {
        title: 'Usuarios',
        href: usuarios.index(),
        icon: UserCog,
    },
];

export function AppSidebar() {
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
                <NavMain items={panelNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}