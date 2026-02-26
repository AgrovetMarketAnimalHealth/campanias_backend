import * as React from 'react'
import { router } from '@inertiajs/react'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table'
import {
    IconChevronLeft, IconChevronRight,
    IconChevronsLeft, IconChevronsRight,
    IconDotsVertical, IconLoader2, IconSearch,
    IconUser, IconBuilding, IconMailCheck, IconCoins,
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
import { clienteService } from '../services/clienteService'
import { tipoPersonaLabel } from '../utils'
import type { Cliente, PaginatedResponse, TipoPersona } from '../types'
import clientes from '@/routes/clientes'

export function ClientesTable() {
    const [data, setData]           = React.useState<PaginatedResponse<Cliente> | null>(null)
    const [loading, setLoading]     = React.useState(true)
    const [search, setSearch]       = React.useState('')
    const [tipoPersona, setTipo]    = React.useState<TipoPersona>('todas')
    const [page, setPage]           = React.useState(1)

    React.useEffect(() => {
        const t = setTimeout(() => {
            setLoading(true)
            clienteService
                .getClientes({ search, tipo_persona: tipoPersona, page })
                .then(setData)
                .finally(() => setLoading(false))
        }, 300)
        return () => clearTimeout(t)
    }, [search, tipoPersona, page])

    function goToDetalle(id: string) {
        router.visit(clientes.show(id).url)
    }

    const columns: ColumnDef<Cliente>[] = [
        {
            accessorKey: 'nombre',
            header: 'Cliente',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <button
                        className="text-left font-medium hover:underline underline-offset-4 w-fit"
                        onClick={() => goToDetalle(row.original.id)}
                    >
                        {row.original.nombre} {row.original.apellidos}
                    </button>
                    <span className="text-muted-foreground text-xs">{row.original.email}</span>
                </div>
            ),
        },
        {
            accessorKey: 'tipo_persona',
            header: 'Tipo',
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    {row.original.tipo_persona === 'natural'
                        ? <IconUser className="size-3.5" />
                        : <IconBuilding className="size-3.5" />}
                    {tipoPersonaLabel(row.original.tipo_persona)}
                </div>
            ),
        },
        {
            accessorKey: 'departamento',
            header: 'Departamento',
            cell: ({ row }) => row.original.departamento ?? '—',
        },
        {
            accessorKey: 'dni',
            header: 'DNI / RUC',
            cell: ({ row }) => (
                <span className="font-mono text-xs">
                    {row.original.dni ?? row.original.ruc ?? '—'}
                </span>
            ),
        },
        {
            id: 'boletas',
            header: 'Boletas',
            cell: ({ row }) => {
                const { boletas_aceptadas, boletas_pendientes, boletas_rechazadas } = row.original
                return (
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="rounded-full px-2 py-0.5 font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">{boletas_aceptadas}</span>
                        <span className="rounded-full px-2 py-0.5 font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">{boletas_pendientes}</span>
                        <span className="rounded-full px-2 py-0.5 font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">{boletas_rechazadas}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: 'total_puntos',
            header: 'Puntos',
            cell: ({ row }) => (
                <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                    <IconCoins className="size-3.5" />
                    {row.original.total_puntos.toLocaleString()}
                </span>
            ),
        },
        {
            accessorKey: 'email_verificado',
            header: 'Verificado',
            cell: ({ row }) => row.original.email_verificado
                ? <IconMailCheck className="size-4 text-emerald-500" />
                : <span className="text-muted-foreground text-xs">—</span>,
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
                    <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => goToDetalle(row.original.id)}>
                            Detalle
                        </DropdownMenuItem>
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

    return (
        <div className="flex flex-col gap-4 px-4 lg:px-6">
            {/* Filtros */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1 rounded-lg border bg-muted p-1 w-fit">
                    {(['todas', 'natural', 'juridica'] as TipoPersona[]).map((tipo) => (
                        <button
                            key={tipo}
                            onClick={() => { setTipo(tipo); setPage(1) }}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-all ${
                                tipoPersona === tipo
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {tipo === 'todas' ? 'Todas' : tipo === 'natural' ? 'Natural' : 'Jurídica'}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-72">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar nombre, dni, email..."
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
                                    No se encontraron clientes.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación — usa meta.last_page y meta.total del JSON */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                    {total} clientes — Página {page} de {lastPage}
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