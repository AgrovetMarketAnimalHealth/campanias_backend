import * as React from 'react'
import {
    flexRender, getCoreRowModel,
    useReactTable, type ColumnDef,
} from '@tanstack/react-table'
import {
    IconChevronLeft, IconChevronRight,
    IconChevronsLeft, IconChevronsRight,
    IconDotsVertical, IconLoader2, IconSearch,
    IconSend, IconMailX, IconClock,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { notificacionService } from '../services/notificacionService'
import { estadoBadgeClass, formatFecha } from '../utils'
import type { Notificacion, PaginatedResponse, EstadoEnvio } from '../types'

export function NotificacionesTable() {
    const [data, setData]       = React.useState<PaginatedResponse<Notificacion> | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch]   = React.useState('')
    const [estado, setEstado]   = React.useState<EstadoEnvio>('todos')
    const [page, setPage]       = React.useState(1)
    const [reenviando, setRe]   = React.useState<string | null>(null)

    const fetch = React.useCallback(() => {
        setLoading(true)
        notificacionService
            .getNotificaciones({ search, estado, page })
            .then(setData)
            .finally(() => setLoading(false))
    }, [search, estado, page])

    React.useEffect(() => {
        const t = setTimeout(fetch, 300)
        return () => clearTimeout(t)
    }, [fetch])

    async function handleReenviar(id: string) {
        setRe(id)
        try {
            await notificacionService.reenviar(id)
            fetch()
        } finally {
            setRe(null)
        }
    }

    const estadoIcon = (e: string) => {
        if (e === 'enviado')  return <IconSend className="size-3.5 text-emerald-500" />
        if (e === 'fallido')  return <IconMailX className="size-3.5 text-red-500" />
        return <IconClock className="size-3.5 text-amber-500" />
    }

    const columns: ColumnDef<Notificacion>[] = [
        {
            accessorKey: 'destinatario_email',
            header: 'Destinatario',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.cliente?.nombre ?? '—'}</span>
                    <span className="text-muted-foreground text-xs">{row.original.destinatario_email}</span>
                </div>
            ),
        },
        {
            accessorKey: 'asunto',
            header: 'Asunto',
            cell: ({ row }) => (
                <span className="text-sm line-clamp-1 max-w-[220px]">{row.original.asunto}</span>
            ),
        },
        {
            accessorKey: 'tipo',
            header: 'Tipo',
            cell: ({ row }) => (
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                    {row.original.tipo}
                </span>
            ),
        },
        {
            accessorKey: 'estado_envio',
            header: 'Estado',
            cell: ({ row }) => (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoBadgeClass(row.original.estado_envio)}`}>
                    {estadoIcon(row.original.estado_envio)}
                    {row.original.estado_envio}
                </span>
            ),
        },
        {
            accessorKey: 'intentos',
            header: 'Intentos',
            cell: ({ row }) => (
                <span className="text-sm text-center block">{row.original.intentos}</span>
            ),
        },
        {
            accessorKey: 'enviado_at',
            header: 'Enviado',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">{formatFecha(row.original.enviado_at)}</span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Creado',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">{formatFecha(row.original.created_at)}</span>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                            <IconDotsVertical className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        {row.original.estado_envio === 'fallido' && (
                            <DropdownMenuItem
                                disabled={reenviando === row.original.id}
                                onClick={() => handleReenviar(row.original.id)}
                            >
                                {reenviando === row.original.id ? 'Reenviando...' : 'Reenviar'}
                            </DropdownMenuItem>
                        )}
                        {row.original.estado_envio !== 'fallido' && (
                            <DropdownMenuItem disabled className="text-muted-foreground">
                                Sin acciones
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    const table = useReactTable({
        data: data?.data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: data?.meta.last_page ?? 1,
    })

    const lastPage = data?.meta.last_page ?? 1
    const total    = data?.meta.total ?? 0
    const estados: EstadoEnvio[] = ['todos', 'enviado', 'pendiente', 'fallido']

    return (
        <div className="flex flex-col gap-4 px-4 lg:px-6">
            {/* Filtros */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1 rounded-lg border bg-muted p-1 w-fit">
                    {estados.map((e) => (
                        <button
                            key={e}
                            onClick={() => { setEstado(e); setPage(1) }}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-all ${
                                estado === e
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {e === 'todos' ? 'Todos' : e}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-72">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar email, asunto..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                    />
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader className="bg-muted sticky top-0 z-10">
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center">
                                    <IconLoader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-muted/50">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                                    No se encontraron notificaciones.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                    {total} notificaciones — Página {page} de {lastPage}
                </span>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="hidden size-8 lg:flex"
                        disabled={page === 1} onClick={() => setPage(1)}>
                        <IconChevronsLeft className="size-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="size-8"
                        disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                        <IconChevronLeft className="size-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="size-8"
                        disabled={page === lastPage} onClick={() => setPage((p) => p + 1)}>
                        <IconChevronRight className="size-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="hidden size-8 lg:flex"
                        disabled={page === lastPage} onClick={() => setPage(lastPage)}>
                        <IconChevronsRight className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}