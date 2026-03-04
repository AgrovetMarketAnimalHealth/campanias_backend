import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import type { BreadcrumbItem } from '@/types'
import { NotificacionesTable } from './components/NotificacionesTable'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notificaciones',
        href: '/promo-concierto/backoffice/panel/notificaciones',
    },
]

export default function Notificaciones() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notificaciones" />
            <div className="flex flex-1 flex-col gap-6 py-6">
                <div className="px-4 lg:px-6">
                    <h1 className="text-2xl font-semibold tracking-tight">Notificaciones</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Historial de notificaciones enviadas y reenvío de fallidas.
                    </p>
                </div>
                <NotificacionesTable />
            </div>
        </AppLayout>
    )
}