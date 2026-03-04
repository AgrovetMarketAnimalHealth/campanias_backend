import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Auth } from '@/types';
import { dashboard } from '@/routes';
import  ResetPassword  from './auth/change-password';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

function getMensajeBienvenida(nombre: string): { saludo: string; mensaje: string } {
    const hora = new Date().getHours();

    if (hora >= 0 && hora < 6) {
        return {
            saludo: `Buenas madrugadas, ${nombre} 🌙`,
            mensaje: '¡Qué dedicación! Las boletas de Chayanne no se revisan solas — gracias por estar aquí a esta hora.',
        };
    } else if (hora >= 6 && hora < 12) {
        return {
            saludo: `Buenos días, ${nombre} ☀️`,
            mensaje: '¡Arranca el día con energía! Hay boletas esperando tu revisión para que los fans de Chayanne consigan sus entradas.',
        };
    } else if (hora >= 12 && hora < 19) {
        return {
            saludo: `Buenas tardes, ${nombre} 🌤️`,
            mensaje: 'La tarde es perfecta para revisar boletas. Cada aprobación acerca a un fan más al Meet & Greet de Chayanne.',
        };
    } else {
        return {
            saludo: `Buenas noches, ${nombre} 🌆`,
            mensaje: '¡Terminando el día con todo! Los fans agradecen tu trabajo para que el sueño de conocer a Chayanne se haga realidad.',
        };
    }
}

export default function Dashboard() {
    const { auth, mustReset } = usePage<{ auth: Auth; mustReset: boolean }>().props;

    // Si debe resetear contraseña, mostrar solo esa pantalla sin layout
    if (mustReset) {
        return (
            <>
                <Head title="Cambiar contraseña" />
                <ResetPassword />
            </>
        );
    }

    const nombre = auth.user?.name?.split(' ')[0] ?? 'Administrador';
    const { saludo, mensaje } = getMensajeBienvenida(nombre);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                {/* Mensaje de bienvenida */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-5">
                    <h1 className="text-xl font-semibold tracking-tight">{saludo}</h1>
                    <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{mensaje}</p>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>

                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}