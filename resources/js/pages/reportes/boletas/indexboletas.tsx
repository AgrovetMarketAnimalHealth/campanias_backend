import { Head } from '@inertiajs/react'
import * as React from 'react'
import AppLayout from '@/layouts/app-layout'
import type { BreadcrumbItem } from '@/types'
import { Button } from '@/components/ui/button'
import { IconDownload, IconSend } from '@tabler/icons-react'

import { GraficoBoletas }       from './components/GraficoBoletas'
import { FiltrosBoletas }       from './components/FiltrosBoletas'
import { BoletasTable }         from './components/BoletasTable'
import { BoletaDrawer }         from './components/BoletaDrawer'
import { EnviarBoletasDialog }  from './components/EnviarBoletasDialog'
import { boletaService }        from './services/boletaService'
import type {
    MetricasGenerales, MetricasPeriodo,
    PaginatedResponse, Boleta, Preset,
} from './types'
import { hoy } from './utils'

interface Props { metricas: MetricasGenerales }

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes', href: '#' },
    { title: 'Boletas',  href: '#' },
]

function KpiCard({ label, value, accent }: { label: string; value: number; accent: string }) {
    return (
        <div className={`rounded-xl border bg-card p-4 flex flex-col gap-1.5 border-t-4 ${accent}`}>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
            <span className="text-3xl font-extrabold tracking-tight">{value.toLocaleString()}</span>
        </div>
    )
}

export default function Boletas({ metricas }: Props) {

    const [fechaInicio, setFechaInicio] = React.useState(hoy())
    const [fechaFin,    setFechaFin]    = React.useState(hoy())
    const [preset,      setPreset]      = React.useState<Preset>('hoy')
    const [estado,      setEstado]      = React.useState('')
    const [page,        setPage]        = React.useState(1)

    const [metrPeriodo,  setMetrPeriodo]  = React.useState<MetricasPeriodo | null>(null)
    const [listado,      setListado]      = React.useState<PaginatedResponse<Boleta> | null>(null)
    const [loadingChart, setLoadingChart] = React.useState(true)
    const [loadingTable, setLoadingTable] = React.useState(true)

    const [drawerBoleta, setDrawerBoleta] = React.useState<Boleta | null>(null)
    const [openDrawer,   setOpenDrawer]   = React.useState(false)
    const [openEnviar,   setOpenEnviar]   = React.useState(false)

    function cargarGrafico(inicio = fechaInicio, fin = fechaFin) {
        setLoadingChart(true)
        boletaService.getMetricas({ fecha_inicio: inicio, fecha_fin: fin })
            .then(setMetrPeriodo).catch(console.error)
            .finally(() => setLoadingChart(false))
    }

    function cargarListado(inicio = fechaInicio, fin = fechaFin, p = page, est = estado) {
        setLoadingTable(true)
        boletaService.getListado({ fecha_inicio: inicio, fecha_fin: fin, estado: est || undefined, page: p, per_page: 25 })
            .then(setListado).catch(console.error)
            .finally(() => setLoadingTable(false))
    }

    React.useEffect(() => { cargarGrafico(); cargarListado() }, [])
    React.useEffect(() => { cargarListado(fechaInicio, fechaFin, page, estado) }, [page])

    function handlePresetChange(inicio: string, fin: string, key: Preset) {
        setFechaInicio(inicio); setFechaFin(fin); setPreset(key); setPage(1)
        cargarGrafico(inicio, fin); cargarListado(inicio, fin, 1, estado)
    }

    function handleConsultar() {
        setPage(1); cargarGrafico(); cargarListado(fechaInicio, fechaFin, 1, estado)
    }

    function handleEstadoChange(v: string) {
        setEstado(v); setPage(1); cargarListado(fechaInicio, fechaFin, 1, v)
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Boletas" />
            <div className="flex flex-1 flex-col gap-6 py-6">

                {/* Encabezado */}
                <div className="px-4 lg:px-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Reporte de Boletas</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Visualiza y exporta las boletas por período.
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" onClick={() => window.location.href = boletaService.exportarUrl({ fecha_inicio: fechaInicio, fecha_fin: fechaFin, estado: estado || undefined })} className="gap-1.5">
                            <IconDownload className="size-4" /> Exportar Excel
                        </Button>
                        <Button onClick={() => setOpenEnviar(true)} className="gap-1.5">
                            <IconSend className="size-4" /> Enviar reporte
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="px-4 lg:px-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <KpiCard label="Total boletas"  value={metricas.total_boletas}  accent="border-t-blue-500"   />
                    <KpiCard label="Boletas hoy"    value={metricas.boletas_hoy}    accent="border-t-teal-500"   />
                    <KpiCard label="Este mes"       value={metricas.boletas_mes}    accent="border-t-indigo-500" />
                    <KpiCard label="Pendientes"     value={metricas.pendientes}     accent="border-t-amber-500"  />
                    <KpiCard label="Aceptadas"      value={metricas.aceptadas}      accent="border-t-green-500"  />
                    <KpiCard label="Rechazadas"     value={metricas.rechazadas}     accent="border-t-red-500"    />
                </div>

                {/* Filtros */}
                <div className="px-4 lg:px-6">
                    <FiltrosBoletas
                        fechaInicio={fechaInicio} fechaFin={fechaFin}
                        estado={estado} preset={preset}
                        onFechaInicioChange={setFechaInicio}
                        onFechaFinChange={setFechaFin}
                        onEstadoChange={handleEstadoChange}
                        onPresetChange={handlePresetChange}
                        onConsultar={handleConsultar}
                    />
                </div>

                {/* Gráfico */}
                <div className="px-4 lg:px-6">
                    <GraficoBoletas datos={metrPeriodo} loading={loadingChart} preset={preset} />
                </div>

                {/* Tabla */}
                <div className="px-4 lg:px-6">
                    <BoletasTable
                        data={listado} loading={loadingTable}
                        page={page} onPageChange={setPage}
                        onRowClick={(b) => { setDrawerBoleta(b); setOpenDrawer(true) }}
                    />
                </div>
            </div>

            <BoletaDrawer boleta={drawerBoleta} open={openDrawer} onClose={() => setOpenDrawer(false)} />
            <EnviarBoletasDialog open={openEnviar} onClose={() => setOpenEnviar(false)} fechaInicio={fechaInicio} fechaFin={fechaFin} />
        </AppLayout>
    )
}