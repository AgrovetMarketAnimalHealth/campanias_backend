import { Head, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import type { BreadcrumbItem } from '@/types'
import type { CampaniasImagenesPageProps } from './types'
import { CampaniaImagenesDataTable } from './components/CampaniaImagenesDataTable'

export default function IndexCampaniasImagenes() {
    const { campania } = usePage().props as CampaniasImagenesPageProps

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Campañas',
            href:  '/promo-concierto/backoffice/panel/companiasj',
        },
        {
            title: campania.data.nombre,
            href:  `/promo-concierto/backoffice/panel/companias/${campania.data.id}/imagenes`,
        },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Imágenes — ${campania.data.nombre}`} />

            <div className="flex flex-col gap-6 py-6">

                {/* Header */}
                <div className="px-4 lg:px-6">
                    <h1 className="text-xl font-semibold">Imágenes de campaña</h1>
                    <p className="text-sm text-muted-foreground">
                        Gestiona las imágenes de la campaña.
                    </p>
                </div>

                {/* Campaña card */}
                <div className="px-4 lg:px-6">
                    <div className="rounded-lg border bg-card p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold">{campania.data.nombre}</h2>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                campania.data.activa
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                    : 'bg-muted text-muted-foreground'
                            }`}>
                                {campania.data.activa ? 'Activa' : 'Inactiva'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs text-muted-foreground">Dominio</span>
                                {campania.data.dominio ? (
                                    <a
                                        href={campania.data.dominio}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline underline-offset-4 truncate"
                                    >
                                        {campania.data.dominio}
                                    </a>
                                ) : (
                                    <span className="text-muted-foreground">—</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs text-muted-foreground">Creada</span>
                                <span>{campania.data.created_at}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs text-muted-foreground">Última modificación</span>
                                <span>{campania.data.updated_at}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <CampaniaImagenesDataTable campaniaId={campania.data.id} />

            </div>
        </AppLayout>
    )
}