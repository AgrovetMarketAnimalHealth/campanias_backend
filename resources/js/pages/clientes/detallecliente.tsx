import * as React from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import type { BreadcrumbItem } from '@/types'
import clientes from '@/routes/clientes'
import { clienteService } from './services/clienteService'
import { ClienteSectionCards } from './components/ClienteSectionCards'
import { BoletasTable } from './components/BoletasTable'
import { tipoPersonaLabel } from './utils'
import type { Cliente, Boleta, PaginatedResponse } from './types'
import { IconArrowLeft, IconUser, IconBuilding, IconMailCheck } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { IconLoader2 } from '@tabler/icons-react'

interface Props {
    clienteId: string
}

export default function DetalleCliente({ clienteId }: Props) {
    const [cliente, setCliente]     = React.useState<Cliente | null>(null)
    const [boletas, setBoletas]     = React.useState<PaginatedResponse<Boleta> | null>(null)
    const [loadingC, setLoadingC]   = React.useState(true)
    const [loadingB, setLoadingB]   = React.useState(true)
    const [boletaPage, setBoletaPage]     = React.useState(1)
    const [boletaEstado, setBoletaEstado] = React.useState('')

    // Cargar datos del cliente desde la lista
    React.useEffect(() => {
        clienteService
            .getClientes({ page: 1, per_page: 100 })
            .then((res) => {
                const found = res.data.find((c) => c.id === clienteId) ?? null
                setCliente(found)
            })
            .finally(() => setLoadingC(false))
    }, [clienteId])

    // Cargar boletas
    React.useEffect(() => {
        setLoadingB(true)
        clienteService
            .getBoletas(clienteId, {
                estado: boletaEstado || undefined,
                page: boletaPage,
            })
            .then(setBoletas)
            .finally(() => setLoadingB(false))
    }, [clienteId, boletaPage, boletaEstado])

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Clientes', href: clientes.index().url },
        { title: cliente ? `${cliente.nombre} ${cliente.apellidos}` : '...', href: '#' },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={cliente ? `${cliente.nombre} ${cliente.apellidos}` : 'Detalle Cliente'} />

            <div className="flex flex-1 flex-col gap-6 py-6">
                {/* Header */}
                <div className="flex items-center gap-4 px-4 lg:px-6">
                    <Button variant="ghost" size="icon" onClick={() => router.visit(clientes.index().url)}>
                        <IconArrowLeft className="size-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {loadingC ? '...' : cliente ? `${cliente.nombre} ${cliente.apellidos}` : 'Cliente no encontrado'}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-0.5">{cliente?.email}</p>
                    </div>
                </div>

                {loadingC ? (
                    <div className="flex items-center justify-center h-40">
                        <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ) : cliente ? (
                    <>
                        {/* Info básica */}
                        <div className="grid grid-cols-2 gap-3 px-4 lg:px-6 sm:grid-cols-3 lg:grid-cols-6">
                            <div className="rounded-lg border bg-card p-4">
                                <Label className="text-xs text-muted-foreground">Tipo</Label>
                                <p className="mt-1 font-medium text-sm flex items-center gap-1.5">
                                    {cliente.tipo_persona === 'natural'
                                        ? <IconUser className="size-3.5 text-muted-foreground" />
                                        : <IconBuilding className="size-3.5 text-muted-foreground" />}
                                    {tipoPersonaLabel(cliente.tipo_persona)}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <Label className="text-xs text-muted-foreground">DNI / RUC</Label>
                                <p className="mt-1 font-mono font-medium text-sm">{cliente.dni ?? cliente.ruc ?? '—'}</p>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <Label className="text-xs text-muted-foreground">Departamento</Label>
                                <p className="mt-1 font-medium text-sm">{cliente.departamento ?? '—'}</p>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <Label className="text-xs text-muted-foreground">Teléfono</Label>
                                <p className="mt-1 font-medium text-sm">{cliente.telefono ?? '—'}</p>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <Label className="text-xs text-muted-foreground">Estado</Label>
                                <p className="mt-1 font-medium text-sm capitalize">{cliente.estado}</p>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <Label className="text-xs text-muted-foreground">Email verificado</Label>
                                <p className="mt-1 text-sm flex items-center gap-1.5">
                                    {cliente.email_verificado
                                        ? <><IconMailCheck className="size-4 text-emerald-500" /> <span className="font-medium text-emerald-600">Sí</span></>
                                        : <span className="text-muted-foreground">No</span>}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        {/* Cards resumen */}
                        <ClienteSectionCards cliente={cliente} />

                        <Separator />

                        {/* Boletas */}
                        <BoletasTable
                            data={boletas}
                            loading={loadingB}
                            page={boletaPage}
                            onPageChange={setBoletaPage}
                            estadoFilter={boletaEstado}
                            onEstadoFilter={(v) => { setBoletaEstado(v); setBoletaPage(1) }}
                        />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-40 text-muted-foreground">
                        Cliente no encontrado.
                    </div>
                )}
            </div>
        </AppLayout>
    )
}