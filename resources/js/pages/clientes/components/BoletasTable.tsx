import * as React from 'react'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table'
import {
    IconChevronLeft,
    IconChevronRight,
    IconLoader2,
    IconDotsVertical,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { BoletaDrawer } from './BoletaDrawer'
import { estadoBadgeColor, formatMonto } from '../utils'
import type { Boleta, PaginatedResponse } from '../types'

interface BoletasTableProps {
    data: PaginatedResponse<Boleta> | null
    loading: boolean
    page: number
    onPageChange: (p: number) => void
    estadoFilter: string
    onEstadoFilter: (v: string) => void
}

export function BoletasTable({
    data,
    loading,
    page,
    onPageChange,
    estadoFilter,
    onEstadoFilter,
}: BoletasTableProps) {
    const [selectedBoleta, setSelectedBoleta] = React.useState<Boleta | null>(null)
    const [drawerOpen, setDrawerOpen] = React.useState(false)

    const columns: ColumnDef<Boleta>[] = [
        {
            accessorKey: 'codigo',
            header: 'Código',
            cell: ({ row }) => (
                <Button
                    variant="link"
                    className="text-foreground px-0 font-mono text-xs"
                    onClick={() => { setSelectedBoleta(row.original); setDrawerOpen(true) }}
                >
                    {row.original.codigo}
                </Button>
            ),
        },
        {
            accessorKey: 'numero_boleta',
            header: 'N° Boleta',
            cell: ({ row }) => row.original.numero_boleta ?? '—',
        },
        {
            accessorKey: 'monto',
            header: 'Monto',
            cell: ({ row }) => <span className="font-medium">{formatMonto(row.original.monto)}</span>,
        },
        {
            accessorKey: 'puntos_otorgados',
            header: 'Puntos',
            cell: ({ row }) => (
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {row.original.puntos_otorgados.toLocaleString()}
                </span>
            ),
        },
        {
            accessorKey: 'estado',
            header: 'Estado',
            cell: ({ row }) => (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${estadoBadgeColor(row.original.estado)}`}>
                    {row.original.estado}
                </span>
            ),
        },
        {
            accessorKey: 'fecha',
            header: 'Fecha',
            cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.fecha}</span>,
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
                        <DropdownMenuItem onClick={() => { setSelectedBoleta(row.original); setDrawerOpen(true) }}>
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
        pageCount: data?.last_page ?? 1,
    })

    return (
        <div className="flex flex-col gap-4 px-4 lg:px-6">
            {/* Filtro estado */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Boletas</h3>
                <Select value={estadoFilter} onValueChange={onEstadoFilter}>
                    <SelectTrigger size="sm" className="w-36">
                        <SelectValue placeholder="Filtrar estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="aceptada">Aceptadas</SelectItem>
                        <SelectItem value="pendiente">Pendientes</SelectItem>
                        <SelectItem value="rechazada">Rechazadas</SelectItem>
                    </SelectContent>
                </Select>
            </div>

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
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <IconLoader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    Sin boletas registradas.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            {data && data.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        Página {data.current_page} de {data.last_page} — {data.total} boletas
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="size-8" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
                            <IconChevronLeft className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="size-8" disabled={page === data.last_page} onClick={() => onPageChange(page + 1)}>
                            <IconChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            )}

            <BoletaDrawer
                boleta={selectedBoleta}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
        </div>
    )
}