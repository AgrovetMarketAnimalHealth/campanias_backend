import { Head } from '@inertiajs/react'
import * as React from 'react'
import AppLayout from '@/layouts/app-layout'
import type { BreadcrumbItem } from '@/types'
import reportes from '@/routes/reportes'
import { PuntosTable } from './components/PuntosTable'
import { ExportarBoletos } from './components/ExportarBoletos'
import { puntoService } from './services/puntoService'
import type { PaginatedResponse, Punto } from './types/index'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Puntos',
        href: reportes.puntos.index().url,
    },
]

export default function Puntos() {
    const [data, setData]       = React.useState<PaginatedResponse<Punto> | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [page, setPage]       = React.useState(1)

    React.useEffect(() => {
        setLoading(true)
        puntoService
            .getPuntos({ page, per_page: 50 })
            .then((res) => setData(res))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [page])

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Puntos" />
            <div className="flex flex-1 flex-col gap-6 py-6">
                <div className="px-4 lg:px-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Ranking de Puntos</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Clientes ordenados por puntos acumulados. Cada punto equivale a un boleto en el sorteo.
                        </p>
                    </div>
                    <ExportarBoletos />
                </div>
                <PuntosTable
                    data={data}
                    loading={loading}
                    page={page}
                    onPageChange={setPage}
                />
            </div>
        </AppLayout>
    )
}