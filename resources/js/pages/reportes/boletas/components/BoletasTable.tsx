import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import type { PaginatedResponse, Boleta } from '../types'
import { estadoBadgeClass, formatMonto, formatFecha } from '../utils'

interface Props {
    data: PaginatedResponse<Boleta> | null
    loading: boolean
    page: number
    onPageChange: (p: number) => void
    onRowClick: (b: Boleta) => void
}

export function BoletasTable({ data, loading, page, onPageChange, onRowClick }: Props) {
    return (
        <div className="flex flex-col gap-3">
            <div className="rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>N° Boleta</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Puntos</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 7 }).map((_, j) => (
                                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : !data || data.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                                    Sin resultados para los filtros aplicados
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.data.map((b) => (
                                <TableRow
                                    key={b.id}
                                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                                    onClick={() => onRowClick(b)}
                                >
                                    <TableCell className="font-mono text-xs">{b.codigo}</TableCell>
                                    <TableCell className="font-medium">
                                        {b.cliente
                                            ? `${b.cliente.nombre} ${b.cliente.apellidos ?? ''}`.trim()
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{b.numero_boleta}</TableCell>
                                    <TableCell className="font-medium">{formatMonto(b.monto)}</TableCell>
                                    <TableCell>{b.puntos_otorgados}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${estadoBadgeClass(b.estado)}`}>
                                            {b.estado.charAt(0).toUpperCase() + b.estado.slice(1)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {formatFecha(b.created_at)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {data && data.last_page > 1 && (
                <div className="flex items-center justify-between px-1 text-sm text-muted-foreground">
                    <span>Mostrando {data.from}–{data.to} de {data.total.toLocaleString()} boletas</span>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
                            <IconChevronLeft className="size-4" />
                        </Button>
                        <span className="px-2 font-medium">{page} / {data.last_page}</span>
                        <Button variant="outline" size="icon" disabled={page === data.last_page} onClick={() => onPageChange(page + 1)}>
                            <IconChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}