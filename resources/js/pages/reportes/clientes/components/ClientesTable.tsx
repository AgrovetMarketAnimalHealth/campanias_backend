import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import type { PaginatedResponse, Cliente } from '../types'
import {
    nombreCompleto,
    docValor,
    estadoBadgeClass,
    tipoBadgeClass,
    formatFecha,
} from '../utils'

interface ClientesTableProps {
    data: PaginatedResponse<Cliente> | null
    loading: boolean
    page: number
    onPageChange: (p: number) => void
    onRowClick: (c: Cliente) => void
}

export function ClientesTable({
    data,
    loading,
    page,
    onPageChange,
    onRowClick,
}: ClientesTableProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead>Nombre / Razón social</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Documento</TableHead>
                            <TableHead>Departamento</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Inscripción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 7 }).map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : !data || data.data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center text-muted-foreground py-12"
                                >
                                    Sin resultados para los filtros aplicados
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.data.map((c) => (
                                <TableRow
                                    key={c.id}
                                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                                    onClick={() => onRowClick(c)}
                                >
                                    <TableCell className="font-medium">
                                        {nombreCompleto(c)}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tipoBadgeClass(c.tipo_persona)}`}>
                                            {c.tipo_persona === 'juridica' ? 'Jurídica' : 'Natural'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {docValor(c)}
                                    </TableCell>
                                    <TableCell>{c.departamento}</TableCell>
                                    <TableCell className="text-muted-foreground max-w-[180px] truncate">
                                        {c.email}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${estadoBadgeClass(c.estado)}`}>
                                            {c.estado.charAt(0).toUpperCase() + c.estado.slice(1)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {formatFecha(c.created_at)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            {data && data.last_page > 1 && (
                <div className="flex items-center justify-between px-1 text-sm text-muted-foreground">
                    <span>
                        Mostrando {data.from}–{data.to} de{' '}
                        {data.total.toLocaleString()} inscritos
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={page === 1}
                            onClick={() => onPageChange(page - 1)}
                        >
                            <IconChevronLeft className="size-4" />
                        </Button>
                        <span className="px-2 font-medium">
                            {page} / {data.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={page === data.last_page}
                            onClick={() => onPageChange(page + 1)}
                        >
                            <IconChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}