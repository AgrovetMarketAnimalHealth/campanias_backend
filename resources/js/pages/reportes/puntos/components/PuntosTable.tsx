import * as React from 'react'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table'
import {
    IconChevronLeft, IconChevronRight,
    IconLoader2, IconDotsVertical, IconMedal,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PuntoDrawer } from './PuntoDrawer'
import { tipoBadgeColor, formatPuntos, nombreCompleto, docLabel, docValor } from '../utils'
import type { Punto, PaginatedResponse } from '../types'

interface PuntosTableProps {
    data: PaginatedResponse<Punto> | null
    loading: boolean
    page: number
    onPageChange: (p: number) => void
}

function medalColor(pos: number) {
    if (pos === 1) return 'text-yellow-500'
    if (pos === 2) return 'text-slate-400'
    if (pos === 3) return 'text-amber-600'
    return 'text-muted-foreground'
}

export function PuntosTable({ data, loading, page, onPageChange }: PuntosTableProps) {
    const [selected, setSelected]     = React.useState<Punto | null>(null)
    const [drawerOpen, setDrawerOpen] = React.useState(false)

    const perPage = data?.meta.per_page ?? 50
    const offset  = (page - 1) * perPage

    const columns: ColumnDef<Punto>[] = [
        {
            id: 'pos',
            header: '#',
            cell: ({ row }) => {
                const pos = offset + row.index + 1
                return (
                    <span className={`font-bold text-sm flex items-center gap-1 ${medalColor(pos)}`}>
                        {pos <= 3 && <IconMedal className="size-4" />}
                        {pos}
                    </span>
                )
            },
        },
        {
            id: 'cliente',
            header: 'Cliente',
            cell: ({ row }) => {
                const p = row.original
                return (
                    <div className="flex flex-col gap-0.5">
                        <Button
                            variant="link"
                            className="px-0 h-auto text-foreground font-semibold text-sm justify-start"
                            onClick={() => { setSelected(p); setDrawerOpen(true) }}
                        >
                            {nombreCompleto(p.cliente_tipo, p.cliente_nom, p.cliente_apl)}
                        </Button>
                        <span className="text-muted-foreground text-xs">{p.cliente_email}</span>
                    </div>
                )
            },
        },
        {
            id: 'tipo',
            header: 'Tipo',
            cell: ({ row }) => {
                const p = row.original
                return (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tipoBadgeColor(p.cliente_tipo)}`}>
                        {p.cliente_tipo === 'juridica' ? 'Jurídica' : 'Natural'}
                    </span>
                )
            },
        },
        {
            id: 'doc',
            header: 'Doc.',
            cell: ({ row }) => {
                const p = row.original
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground text-xs">{docLabel(p.cliente_tipo)}</span>
                        <span className="font-mono text-sm">{docValor(p.cliente_tipo, p.cliente_dni, p.cliente_ruc)}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: 'cliente_departamento',
            header: 'Departamento',
            cell: ({ row }) => <span className="text-sm">{row.original.cliente_departamento}</span>,
        },
        {
            id: 'puntos',
            header: 'Puntos / Boletos',
            cell: ({ row }) => {
                const pts = formatPuntos(row.original.puntos)
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-amber-600 dark:text-amber-400 text-base">
                            {pts.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-xs">
                            {pts} boleto{pts !== 1 ? 's' : ''}
                        </span>
                    </div>
                )
            },
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
                        <DropdownMenuItem onClick={() => { setSelected(row.original); setDrawerOpen(true) }}>
                            Ver detalle
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

    return (
        <div className="flex flex-col gap-4 px-4 lg:px-6">
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
                                    Sin registros de puntos.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {data && data.meta.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        Página {data.meta.current_page} de {data.meta.last_page} — {data.meta.total} clientes
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="size-8"
                            disabled={page === 1} onClick={() => onPageChange(page - 1)}>
                            <IconChevronLeft className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="size-8"
                            disabled={page === data.meta.last_page} onClick={() => onPageChange(page + 1)}>
                            <IconChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            )}

            <PuntoDrawer punto={selected} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </div>
    )
}