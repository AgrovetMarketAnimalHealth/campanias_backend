import * as React from 'react'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table'
import {
    IconChevronLeft, IconChevronRight,
    IconLoader2, IconDotsVertical, IconMedal, IconTrophy,
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

function getRowClassName(isWinner: boolean, index: number) {
    if (isWinner) {
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20 border-l-4 border-yellow-500 hover:bg-yellow-100/50 dark:hover:bg-yellow-900/40'
    }
    return index % 2 === 0 ? 'hover:bg-muted/50' : 'bg-muted/20 hover:bg-muted/50'
}

// Fila separadora entre ganadores y no-ganadores
function SeparatorRow({ colSpan }: { colSpan: number }) {
    return (
        <TableRow className="pointer-events-none">
            <TableCell colSpan={colSpan} className="py-1 px-4 bg-muted/40">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <div className="h-px flex-1 bg-border" />
                    <span>Participantes</span>
                    <div className="h-px flex-1 bg-border" />
                </div>
            </TableCell>
        </TableRow>
    )
}

export function PuntosTable({ data, loading, page, onPageChange }: PuntosTableProps) {
    const [selected, setSelected]     = React.useState<Punto | null>(null)
    const [drawerOpen, setDrawerOpen] = React.useState(false)

    const perPage = data?.meta.per_page ?? 50
    const offset  = (page - 1) * perPage   // offset global para ranking de no-ganadores

    // Ganadores primero (ordenados por puntos desc), luego no-ganadores (también desc)
    const { sortedData, winnersCount } = React.useMemo(() => {
        if (!data?.data) return { sortedData: [], winnersCount: 0 }

        const winners    = data.data.filter(p => p.cliente_ganador === true)
        const nonWinners = data.data.filter(p => !p.cliente_ganador)

        winners.sort((a, b)    => Number(b.puntos) - Number(a.puntos))
        nonWinners.sort((a, b) => Number(b.puntos) - Number(a.puntos))

        return {
            sortedData:   [...winners, ...nonWinners],
            winnersCount: winners.length,
        }
    }, [data?.data])

    const columns: ColumnDef<Punto>[] = [
        {
            id: 'pos',
            header: '#',
            cell: ({ row }) => {
                const p        = row.original
                const isWinner = p.cliente_ganador === true

                if (isWinner) {
                    return (
                        <div className="flex items-center gap-1">
                            <IconTrophy className="size-5 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 ml-1">
                                GANADOR
                            </span>
                        </div>
                    )
                }

                // Posición real dentro de los no-ganadores en toda la paginación:
                // row.index es el índice dentro de sortedData; restamos winnersCount
                // para obtener el índice dentro del sub-grupo de no-ganadores, luego
                // sumamos el offset global para mantener el ranking entre páginas.
                const nonWinnerIndex = row.index - winnersCount
                const pos = offset + nonWinnerIndex + 1

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
                const p        = row.original
                const isWinner = p.cliente_ganador === true
                return (
                    <div className="flex flex-col gap-0.5">
                        <Button
                            variant="link"
                            className={`px-0 h-auto text-sm justify-start ${isWinner ? 'font-bold text-yellow-700 dark:text-yellow-400' : 'text-foreground font-semibold'}`}
                            onClick={() => { setSelected(p); setDrawerOpen(true) }}
                        >
                            {nombreCompleto(p.cliente_tipo, p.cliente_nom, p.cliente_apl)}
                            {isWinner && (
                                <IconTrophy className="size-3 ml-1 text-yellow-500" />
                            )}
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
                const p        = row.original
                const pts      = formatPuntos(p.puntos)
                const isWinner = p.cliente_ganador === true
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className={`text-base font-bold ${isWinner ? 'text-yellow-600 dark:text-yellow-400' : 'text-amber-600 dark:text-amber-400'}`}>
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
        data: sortedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: data?.meta.last_page ?? 1,
    })

    const rows = table.getRowModel().rows

    return (
        <div className="flex flex-col gap-4 px-4 lg:px-6">
            {/* Leyenda */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground border rounded-lg p-2 bg-muted/30">
                <div className="flex items-center gap-1">
                    <IconMedal className="size-3 text-yellow-500" />
                    <span>Top 3</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-50 dark:bg-yellow-950/30 border-l-2 border-yellow-500 rounded" />
                    <span>Cliente Ganador</span>
                </div>
                <div className="flex items-center gap-1">
                    <IconTrophy className="size-3 text-yellow-500" />
                    <span>Premiado</span>
                </div>
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
                        ) : rows.length ? (
                            rows.map((row, i) => {
                                const isWinner      = row.original.cliente_ganador === true
                                // Insertar separador entre el último ganador y el primer no-ganador
                                const showSeparator = !isWinner && i === winnersCount && winnersCount > 0

                                return (
                                    <React.Fragment key={row.id}>
                                        {showSeparator && (
                                            <SeparatorRow colSpan={columns.length} />
                                        )}
                                        <TableRow className={getRowClassName(isWinner, i - winnersCount)}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </React.Fragment>
                                )
                            })
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

            {/* Paginación — solo se muestra si hay más de 1 página */}
            {data && data.meta.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        Página {data.meta.current_page} de {data.meta.last_page} — {data.meta.total} clientes
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline" size="icon" className="size-8"
                            disabled={page === 1}
                            onClick={() => onPageChange(page - 1)}
                        >
                            <IconChevronLeft className="size-4" />
                        </Button>
                        <Button
                            variant="outline" size="icon" className="size-8"
                            disabled={page === data.meta.last_page}
                            onClick={() => onPageChange(page + 1)}
                        >
                            <IconChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            )}

            <PuntoDrawer
                punto={selected}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onUpdate={(updated) => {
                    if (data?.data) {
                        const index = data.data.findIndex(c => c.id === updated.id)
                        if (index !== -1) {
                            const newData = [...data.data]
                            newData[index] = updated
                        }
                    }
                    setSelected(updated)
                }}
            />
        </div>
    )
}
