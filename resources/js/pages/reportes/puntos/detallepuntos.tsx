import { Head, Link } from '@inertiajs/react'
import * as React from 'react'
import AppLayout from '@/layouts/app-layout'
import type { BreadcrumbItem } from '@/types'
import { Button } from '@/components/ui/button'
import { IconArrowLeft, IconMedal, IconTrophy } from '@tabler/icons-react'
import { ExportarBoletos } from './components/ExportarBoletos'
import { puntoService } from './services/puntoService'
import { formatPuntos, nombreCompleto } from './utils'
import type { Campania, PaginatedResponse, Punto } from './types'

interface Props {
    campania: Campania
}

function positionClass(position: number): string {
    if (position === 1) return 'text-yellow-600'
    if (position === 2) return 'text-slate-500'
    if (position === 3) return 'text-amber-700'
    return 'text-muted-foreground'
}

export default function DetallePuntos({ campania }: Props) {
    const [data, setData] = React.useState<PaginatedResponse<Punto> | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [page, setPage] = React.useState(1)

    React.useEffect(() => {
        setLoading(true)
        puntoService.getPuntos({ campania_id: campania.id, page, per_page: 50 })
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [campania.id, page])

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Puntos', href: '/promo-concierto/backoffice/panel/reportes/puntos' },
        { title: campania.nombre, href: '#' },
    ]

    const rows = data?.data ?? []
    const lastPage = data?.meta.last_page ?? 1

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ranking - ${campania.nombre}`} />
            <div className="flex flex-1 flex-col gap-6 py-6">
                <div className="flex flex-col gap-4 px-4 lg:px-6">
                    <Link href="/promo-concierto/backoffice/panel/reportes/puntos" className="w-fit">
                        <Button variant="ghost" size="sm" className="gap-2 px-0">
                            <IconArrowLeft className="size-4" /> Volver a campañas
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{campania.activa ? 'Campaña activa' : 'Campaña inactiva'}</span>
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight">Ranking de {campania.nombre}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Participantes ordenados por puntos. Los ganadores aparecen primero.
                        </p>
                    </div>
                    {campania.activa && <ExportarBoletos campaniaId={campania.id} />}
                </div>

                <div className="overflow-hidden rounded-xl border mx-4 lg:mx-6">
                    {loading ? (
                        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Cargando participantes...</div>
                    ) : rows.length === 0 ? (
                        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Esta campaña todavía no tiene participantes con puntos.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">Posición</th>
                                        <th className="px-4 py-3">Participante</th>
                                        <th className="px-4 py-3">Tipo</th>
                                        <th className="px-4 py-3">Departamento</th>
                                        <th className="px-4 py-3 text-right">Puntos / Boletos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {rows.map((punto, index) => {
                                        const position = (page - 1) * (data?.meta.per_page ?? 50) + index + 1
                                        const winner = punto.cliente_ganador === true
                                        return (
                                            <tr key={punto.cliente_id} className={winner ? 'bg-yellow-50/70 dark:bg-yellow-950/20' : 'hover:bg-muted/30'}>
                                                <td className={`px-4 py-4 font-semibold ${positionClass(position)}`}>
                                                    <span className="inline-flex items-center gap-1">
                                                        {winner ? <IconTrophy className="size-4 text-yellow-500" /> : position <= 3 ? <IconMedal className="size-4" /> : null}
                                                        {winner ? 'Ganador' : position}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="font-medium">{nombreCompleto(punto.cliente_tipo, punto.cliente_nom, punto.cliente_apl)}</div>
                                                    <div className="text-xs text-muted-foreground">{punto.cliente_email}</div>
                                                </td>
                                                <td className="px-4 py-4">{punto.cliente_tipo === 'juridica' ? 'Jurídica' : 'Natural'}</td>
                                                <td className="px-4 py-4">{punto.cliente_departamento}</td>
                                                <td className="px-4 py-4 text-right font-semibold">{formatPuntos(punto.puntos).toLocaleString()}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {lastPage > 1 && (
                    <div className="flex items-center justify-end gap-2 px-4 lg:px-6">
                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Anterior</Button>
                        <span className="text-sm text-muted-foreground">Página {page} de {lastPage}</span>
                        <Button variant="outline" size="sm" disabled={page === lastPage} onClick={() => setPage((current) => current + 1)}>Siguiente</Button>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}