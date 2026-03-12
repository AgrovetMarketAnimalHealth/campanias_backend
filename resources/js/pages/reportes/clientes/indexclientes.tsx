import { Head } from '@inertiajs/react'
import * as React from 'react'
import AppLayout from '@/layouts/app-layout'
import type { BreadcrumbItem } from '@/types'
import { Button } from '@/components/ui/button'
import { IconDownload, IconSend } from '@tabler/icons-react'

import { GraficoInscritos }    from './components/GraficoInscritos'
import { FiltrosReporte }      from './components/FiltrosReporte'
import { ClientesTable }       from './components/ClientesTable'
import { ClienteDrawer }       from './components/ClienteDrawer'
import { EnviarReporteDialog } from './components/EnviarReporteDialog'
import { clienteService }      from './services/clienteService'
import type {
    MetricasGenerales,
    MetricasPeriodo,
    PaginatedResponse,
    Cliente,
    Preset,
} from './types'
import { hoy } from './utils'

interface Props {
    metricas: MetricasGenerales
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes', href: '#' },
    { title: 'Inscritos', href: '#' },
]

function KpiCard({ label, value, accent }: { label: string; value: number; accent: string }) {
    return (
        <div className={`rounded-xl border bg-card p-4 flex flex-col gap-1.5 border-t-4 ${accent}`}>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
            </span>
            <span className="text-3xl font-extrabold tracking-tight">
                {value.toLocaleString()}
            </span>
        </div>
    )
}

export default function Clientes({ metricas }: Props) {

    // ── Filtros ──────────────────────────────────────────────────────────
    const [fechaInicio, setFechaInicio] = React.useState(hoy())
    const [fechaFin,    setFechaFin]    = React.useState(hoy())
    const [preset,      setPreset]      = React.useState<Preset>('hoy')
    const [estado,      setEstado]      = React.useState('')
    const [page,        setPage]        = React.useState(1)

    // ── Datos ────────────────────────────────────────────────────────────
    const [metrPeriodo,  setMetrPeriodo]  = React.useState<MetricasPeriodo | null>(null)
    const [listado,      setListado]      = React.useState<PaginatedResponse<Cliente> | null>(null)
    const [loadingChart, setLoadingChart] = React.useState(true)
    const [loadingTable, setLoadingTable] = React.useState(true)

    // ── UI ───────────────────────────────────────────────────────────────
    const [drawerCliente, setDrawerCliente] = React.useState<Cliente | null>(null)
    const [openDrawer,    setOpenDrawer]    = React.useState(false)
    const [openEnviar,    setOpenEnviar]    = React.useState(false)

    // ── Loaders ──────────────────────────────────────────────────────────
    function cargarGrafico(inicio = fechaInicio, fin = fechaFin) {
        setLoadingChart(true)
        clienteService
            .getMetricas({ fecha_inicio: inicio, fecha_fin: fin })
            .then(setMetrPeriodo)
            .catch(console.error)
            .finally(() => setLoadingChart(false))
    }

    function cargarListado(inicio = fechaInicio, fin = fechaFin, p = page, est = estado) {
        setLoadingTable(true)
        clienteService
            .getListado({ fecha_inicio: inicio, fecha_fin: fin, estado: est || undefined, page: p, per_page: 25 })
            .then(setListado)
            .catch(console.error)
            .finally(() => setLoadingTable(false))
    }

    // Carga inicial: HOY por defecto
    React.useEffect(() => {
        cargarGrafico()
        cargarListado()
    }, [])

    // Cambio de página
    React.useEffect(() => {
        cargarListado(fechaInicio, fechaFin, page, estado)
    }, [page])

    // ── Handlers ─────────────────────────────────────────────────────────
    function handlePresetChange(inicio: string, fin: string, key: Preset) {
        setFechaInicio(inicio)
        setFechaFin(fin)
        setPreset(key)
        setPage(1)
        cargarGrafico(inicio, fin)
        cargarListado(inicio, fin, 1, estado)
    }

    function handleConsultar() {
        setPage(1)
        cargarGrafico()
        cargarListado(fechaInicio, fechaFin, 1, estado)
    }

    function handleEstadoChange(v: string) {
        setEstado(v)
        setPage(1)
        cargarListado(fechaInicio, fechaFin, 1, v)
    }

    function handleRowClick(c: Cliente) {
        setDrawerCliente(c)
        setOpenDrawer(true)
    }

    function handleExportar() {
        window.location.href = clienteService.exportarUrl({
            fecha_inicio: fechaInicio,
            fecha_fin:    fechaFin,
            estado:       estado || undefined,
        })
    }

    // ─────────────────────────────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inscritos" />

            <div className="flex flex-1 flex-col gap-6 py-6">

                {/* Encabezado */}
                <div className="px-4 lg:px-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Reporte de Inscritos</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Visualiza y exporta los clientes inscritos por período.
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" onClick={handleExportar} className="gap-1.5">
                            <IconDownload className="size-4" />
                            Exportar Excel
                        </Button>
                        <Button onClick={() => setOpenEnviar(true)} className="gap-1.5">
                            <IconSend className="size-4" />
                            Enviar reporte
                        </Button>
                    </div>
                </div>

                {/* KPIs globales — datos del server, no cambian con el filtro */}
                <div className="px-4 lg:px-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <KpiCard label="Total inscritos" value={metricas.total_inscritos} accent="border-t-blue-500"   />
                    <KpiCard label="Inscritos hoy"   value={metricas.inscritos_hoy}   accent="border-t-teal-500"   />
                    <KpiCard label="Activos"         value={metricas.activos}         accent="border-t-green-500"  />
                    <KpiCard label="Pendientes"      value={metricas.pendientes}      accent="border-t-amber-500"  />
                    <KpiCard label="Rechazados"      value={metricas.rechazados}      accent="border-t-red-500"    />
                </div>

                {/* Filtros */}
                <div className="px-4 lg:px-6">
                    <FiltrosReporte
                        fechaInicio={fechaInicio}
                        fechaFin={fechaFin}
                        estado={estado}
                        preset={preset}
                        onFechaInicioChange={setFechaInicio}
                        onFechaFinChange={setFechaFin}
                        onEstadoChange={handleEstadoChange}
                        onPresetChange={handlePresetChange}
                        onConsultar={handleConsultar}
                    />
                </div>

                {/* Gráfico */}
                <div className="px-4 lg:px-6">
                    <GraficoInscritos
                        datos={metrPeriodo}
                        loading={loadingChart}
                        preset={preset}
                    />
                </div>

                {/* Tabla */}
                <div className="px-4 lg:px-6">
                    <ClientesTable
                        data={listado}
                        loading={loadingTable}
                        page={page}
                        onPageChange={setPage}
                        onRowClick={handleRowClick}
                    />
                </div>

            </div>

            <ClienteDrawer
                cliente={drawerCliente}
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
            />

            <EnviarReporteDialog
                open={openEnviar}
                onClose={() => setOpenEnviar(false)}
                fechaInicio={fechaInicio}
                fechaFin={fechaFin}
            />
        </AppLayout>
    )
}