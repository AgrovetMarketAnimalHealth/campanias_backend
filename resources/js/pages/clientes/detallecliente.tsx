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
import { IconArrowLeft, IconUser, IconBuilding, IconMailCheck, IconMailX, IconCopy, IconCheck } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { IconLoader2 } from '@tabler/icons-react'

interface Props {
    clienteId: string
    verificationUrl: string | null
}

export default function DetalleCliente({ clienteId, verificationUrl }: Props) {
    const [cliente, setCliente]     = React.useState<Cliente | null>(null)
    const [boletas, setBoletas]     = React.useState<PaginatedResponse<Boleta> | null>(null)
    const [loadingC, setLoadingC]   = React.useState(true)
    const [loadingB, setLoadingB]   = React.useState(true)
    const [boletaPage, setBoletaPage]     = React.useState(1)
    const [boletaEstado, setBoletaEstado] = React.useState('')
    const [copied, setCopied]       = React.useState(false)

    const handleCopy = () => {
        if (!verificationUrl) return
        navigator.clipboard.writeText(verificationUrl).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

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

                            {/* Email verificado — ocupa más espacio si hay URL */}
                            <div className={`rounded-lg border bg-card p-4 ${verificationUrl ? 'col-span-2 sm:col-span-3 lg:col-span-2' : ''}`}>
                                <Label className="text-xs text-muted-foreground">Email verificado</Label>
                                {cliente.email_verificado ? (
                                    <p className="mt-1 text-sm flex items-center gap-1.5">
                                        <IconMailCheck className="size-4 text-emerald-500" />
                                        <span className="font-medium text-emerald-600">Sí</span>
                                    </p>
                                ) : verificationUrl ? (
                                    <div className="mt-2 flex flex-col gap-2">
                                        <p className="text-sm flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                                            <IconMailX className="size-4" />
                                            No verificado
                                        </p>
                                        <div className="flex items-center gap-2 rounded-md border bg-muted px-2 py-1.5">
                                            <span className="flex-1 truncate font-mono text-xs text-muted-foreground select-all">
                                                {verificationUrl}
                                            </span>
                                            <button
                                                onClick={handleCopy}
                                                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                                                title="Copiar enlace"
                                            >
                                                {copied
                                                    ? <IconCheck className="size-4 text-emerald-500" />
                                                    : <IconCopy className="size-4" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Copia el enlace y envíaselo al cliente para verificar su email.
                                        </p>
                                    </div>
                                ) : (
                                    <p className="mt-1 text-sm flex items-center gap-1.5">
                                        <IconMailX className="size-4 text-amber-500" />
                                        <span className="text-muted-foreground">No verificado</span>
                                    </p>
                                )}
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