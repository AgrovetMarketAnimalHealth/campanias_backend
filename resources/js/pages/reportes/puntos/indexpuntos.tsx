import { Head } from '@inertiajs/react'
import * as React from 'react'
import AppLayout from '@/layouts/app-layout'
import type { BreadcrumbItem } from '@/types'
import reportes from '@/routes/reportes'
import { Link } from '@inertiajs/react'
import { IconArrowRight, IconCircleCheck, IconCircleX } from '@tabler/icons-react'
import type { Campania } from './types/index'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Puntos',
        href: reportes.puntos.index().url,
    },
]

interface Props {
    campanias: Campania[]
}

export default function Puntos({ campanias }: Props) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Puntos" />
            <div className="flex flex-1 flex-col gap-6 py-6">
                <div className="px-4 lg:px-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Campañas de puntos</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                                Selecciona una campaña para consultar sus participantes y ganadores.
                        </p>
                    </div>
                </div>
                <div className="grid gap-4 px-4 lg:grid-cols-2 lg:px-6">
                    {campanias.map((campania) => (
                        <Link
                            key={campania.id}
                            href={`/promo-concierto/backoffice/panel/reportes/puntos/${campania.id}`}
                            className="group rounded-xl border bg-card p-5 transition-colors hover:border-primary/60 hover:bg-muted/30"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        {campania.activa ? (
                                            <IconCircleCheck className="size-4 text-emerald-600" />
                                        ) : (
                                            <IconCircleX className="size-4 text-muted-foreground" />
                                        )}
                                        {campania.activa ? 'Activa' : 'Inactiva'}
                                    </div>
                                    <h2 className="text-lg font-semibold">{campania.nombre}</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Ver ranking de participantes
                                    </p>
                                </div>
                                <IconArrowRight className="mt-1 size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                            </div>
                        </Link>
                    ))}
                </div>
                {campanias.length === 0 && (
                    <div className="px-4 text-sm text-muted-foreground lg:px-6">
                        No hay campañas registradas.
                    </div>
                )}
            </div>
        </AppLayout>
    )
}