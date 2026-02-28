"use client";

import * as React from 'react';
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type Row,
    type VisibilityState,
} from '@tanstack/react-table';
import {
    IconLayoutColumns,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconSearch,
    IconDotsVertical,
    IconCircleCheckFilled,
    IconXboxX,
    IconPhoto,
    IconEye,
    IconLoader,
    IconGripVertical,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { EstadoBadge } from './EstadoBadge';
import { BoletaDrawer } from './BoletaDrawer';
import { boletaService } from '../services/boleta.service';
import type { Boleta, BoletaFiltros, BoletaPaginado, EstadoBoleta } from '../types/boleta.types';

// ─── Drag Handle ─────────────────────────────────────────────────────────────

function DragHandle({ id }: { id: number }) {
    const { attributes, listeners } = useSortable({ id });
    return (
        <Button
            {...attributes}
            {...listeners}
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-7 hover:bg-transparent cursor-grab"
        >
            <IconGripVertical className="text-muted-foreground size-3" />
            <span className="sr-only">Drag to reorder</span>
        </Button>
    );
}

// ─── Draggable Row ───────────────────────────────────────────────────────────

function DraggableRow({ row }: { row: Row<Boleta> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    });

    return (
        <TableRow
            data-state={row.getIsSelected() && 'selected'}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
        >
            {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function BoletasDataTable() {
    const [paginado, setPaginado] = React.useState<BoletaPaginado | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const [filtros, setFiltros] = React.useState<BoletaFiltros>({
        search: '',
        estado: 'pendiente',
        fecha_desde: '',
        fecha_hasta: '',
        per_page: 15,
        page: 1,
    });

    const [searchInput, setSearchInput] = React.useState('');
    const searchTimeout = React.useRef<ReturnType<typeof setTimeout>>();
    const sortableId = React.useId();

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {}),
    );

    const fetchData = React.useCallback(async (params: BoletaFiltros) => {
        setLoading(true);
        try {
            const data = await boletaService.index(params);
            setPaginado(data);
        } catch {
            toast.error('Error al cargar las boletas');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData(filtros);
    }, [filtros, fetchData]);

    const handleSearch = (value: string) => {
        setSearchInput(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setFiltros(f => ({ ...f, search: value, page: 1 }));
        }, 400);
    };

    const handleEstado = (value: string) => {
        setFiltros(f => ({ ...f, estado: value as EstadoBoleta | '', page: 1 }));
    };

    const handleFecha = (key: 'fecha_desde' | 'fecha_hasta', value: string) => {
        setFiltros(f => ({ ...f, [key]: value, page: 1 }));
    };

    const handleUpdated = (updated: Boleta) => {
        setPaginado(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                data: prev.data.map(b => b.id === updated.id ? updated : b),
            };
        });
    };

    const handleAccionRapida = () => {
        toast.info('Abre el detalle para completar los datos requeridos (N° comprobante, monto y motivo).');
    };

    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => paginado?.data.map(({ id }) => id) ?? [],
        [paginado],
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setPaginado(prev => {
                if (!prev) return prev;
                const oldIndex = dataIds.indexOf(active.id);
                const newIndex = dataIds.indexOf(over.id);
                return { ...prev, data: arrayMove(prev.data, oldIndex, newIndex) };
            });
        }
    }

    const boletas = paginado?.data ?? [];

    const columns: ColumnDef<Boleta>[] = [
        // ── Drag ──────────────────────────────────────────────
        {
            id: 'drag',
            header: () => null,
            cell: ({ row }) => <DragHandle id={row.original.id} />,
        },
        // ── Código ────────────────────────────────────────────
        {
            accessorKey: 'codigo',
            header: 'Código',
            cell: ({ row }) => (
                <BoletaDrawer boleta={row.original} onUpdated={handleUpdated}>
                    <Button variant="link" className="px-0 font-mono text-xs text-foreground h-auto">
                        {row.original.codigo}
                    </Button>
                </BoletaDrawer>
            ),
        },
        // ── Cliente ───────────────────────────────────────────
        {
            id: 'cliente',
            header: 'Cliente',
            cell: ({ row }) => {
                const b = row.original;
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-sm">{b.cliente_nom}</span>
                        <span className="text-xs text-muted-foreground">
                            {b.cliente_dni ? `DNI: ${b.cliente_dni}` : ''}
                            {b.cliente_dni && b.cliente_ruc ? ' · ' : ''}
                            {b.cliente_ruc ? `RUC: ${b.cliente_ruc}` : ''}
                        </span>
                    </div>
                );
            },
        },
        // ── N° Comprobante ────────────────────────────────────
        {
            accessorKey: 'numero_boleta',
            header: 'N° Comprobante',
            cell: ({ row }) => (
                <span className="font-mono text-xs">
                    {row.original.numero_boleta || <span className="text-muted-foreground">—</span>}
                </span>
            ),
        },
        // ── Monto ─────────────────────────────────────────────
        {
            accessorKey: 'monto',
            header: () => <div className="text-right">Monto</div>,
            cell: ({ row }) => (
                <div className="text-right tabular-nums text-xs">
                    {row.original.monto > 0
                        ? `S/ ${Number(row.original.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
                        : <span className="text-muted-foreground">—</span>}
                </div>
            ),
        },
        // ── Estado ────────────────────────────────────────────
        {
            accessorKey: 'estado',
            header: 'Estado',
            cell: ({ row }) => <EstadoBadge estado={row.original.estado} />,
        },
        // ── Puntos ────────────────────────────────────────────
        {
            accessorKey: 'puntos_otorgados',
            header: () => <div className="text-right">Puntos</div>,
            cell: ({ row }) => (
                <div className="text-right font-medium tabular-nums">
                    {row.original.puntos_otorgados > 0
                        ? Number(row.original.puntos_otorgados).toLocaleString('es-PE', { minimumFractionDigits: 2 })
                        : <span className="text-muted-foreground">—</span>}
                </div>
            ),
        },
        // ── Observación ───────────────────────────────────────
        {
            accessorKey: 'observacion',
            header: 'Observación',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground max-w-[180px] truncate block">
                    {row.original.observacion}
                </span>
            ),
        },
        // ── Fecha ─────────────────────────────────────────────
        {
            accessorKey: 'created_at',
            header: 'Fecha',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {row.original.created_at}
                </span>
            ),
        },
        // ── Acciones ──────────────────────────────────────────
        {
            id: 'actions',
            cell: ({ row }) => {
                const boleta = row.original;
                const esPendiente = boleta.estado === 'pendiente';
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground data-[state=open]:bg-muted">
                                <IconDotsVertical className="size-4" />
                                <span className="sr-only">Acciones</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <BoletaDrawer boleta={boleta} onUpdated={handleUpdated}>
                                <DropdownMenuItem onSelect={e => e.preventDefault()} className="gap-2 cursor-pointer">
                                    <IconEye className="size-4" /> Ver detalle
                                </DropdownMenuItem>
                            </BoletaDrawer>
                            {boleta.archivo && (
                                <DropdownMenuItem asChild>
                                    <a href={boleta.archivo} target="_blank" rel="noopener noreferrer" className="gap-2 cursor-pointer flex items-center">
                                        <IconPhoto className="size-4" /> Ver imagen
                                    </a>
                                </DropdownMenuItem>
                            )}
                            {esPendiente && (
                                <>
                                    <DropdownMenuSeparator />
                                    <BoletaDrawer boleta={boleta} onUpdated={handleUpdated}>
                                        <DropdownMenuItem onSelect={e => e.preventDefault()} className="gap-2 cursor-pointer text-green-600 focus:text-green-600">
                                            <IconCircleCheckFilled className="size-4" /> Aceptar
                                        </DropdownMenuItem>
                                    </BoletaDrawer>
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer"
                                        variant="destructive"
                                        onClick={handleAccionRapida}
                                    >
                                        <IconXboxX className="size-4" /> Rechazar
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: boletas,
        columns,
        state: { columnVisibility, rowSelection },
        getRowId: row => String(row.id),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualFiltering: true,
        pageCount: paginado?.last_page ?? 1,
    });

    return (
        <div className="flex flex-col gap-4">
            {/* Filtros */}
            <div className="flex flex-wrap items-end gap-3 px-4 lg:px-6">
                <div className="relative flex-1 min-w-[200px]">
                    <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        className="pl-8 h-8"
                        placeholder="Buscar por cliente, código, DNI, RUC..."
                        value={searchInput}
                        onChange={e => handleSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Estado</Label>
                    <Select value={filtros.estado} onValueChange={handleEstado}>
                        <SelectTrigger size="sm" className="w-36">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="aceptada">Aceptada</SelectItem>
                            <SelectItem value="rechazada">Rechazada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Desde</Label>
                    <Input type="date" className="h-8 w-36 text-sm" value={filtros.fecha_desde} onChange={e => handleFecha('fecha_desde', e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Hasta</Label>
                    <Input type="date" className="h-8 w-36 text-sm" value={filtros.fecha_hasta} onChange={e => handleFecha('fecha_hasta', e.target.value)} />
                </div>

                <div className="ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <IconLayoutColumns className="size-4" />
                                <span className="hidden lg:inline">Columnas</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {table.getAllColumns()
                                .filter(col => typeof col.accessorFn !== 'undefined' && col.getCanHide())
                                .map(col => (
                                    <DropdownMenuCheckboxItem
                                        key={col.id}
                                        className="capitalize"
                                        checked={col.getIsVisible()}
                                        onCheckedChange={val => col.toggleVisibility(!!val)}
                                    >
                                        {col.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Tabla con DnD */}
            <div className="overflow-hidden rounded-lg border mx-4 lg:mx-6">
                <DndContext
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={handleDragEnd}
                    sensors={sensors}
                    id={sortableId}
                >
                    <Table>
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            {table.getHeaderGroups().map(hg => (
                                <TableRow key={hg.id}>
                                    {hg.headers.map(h => (
                                        <TableHead key={h.id}>
                                            {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-32 text-center">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <IconLoader className="size-4 animate-spin" />
                                            Cargando...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows.length ? (
                                <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                                    {table.getRowModel().rows.map(row => (
                                        <DraggableRow key={row.id} row={row} />
                                    ))}
                                </SortableContext>
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                                        No se encontraron boletas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </DndContext>
            </div>

            {/* Paginación */}
            {paginado && (
                <div className="flex items-center justify-between px-4 lg:px-6">
                    <div className="text-sm text-muted-foreground hidden lg:block">
                        {table.getFilteredSelectedRowModel().rows.length > 0
                            ? `${table.getFilteredSelectedRowModel().rows.length} de ${paginado.total} seleccionadas`
                            : `Mostrando ${paginado.from ?? 0}–${paginado.to ?? 0} de ${paginado.total} boletas`}
                    </div>
                    <div className="flex w-full items-center gap-6 lg:w-fit">
                        <div className="hidden items-center gap-2 lg:flex">
                            <Label htmlFor="per-page" className="text-sm">Por página</Label>
                            <Select
                                value={String(filtros.per_page)}
                                onValueChange={v => setFiltros(f => ({ ...f, per_page: Number(v), page: 1 }))}
                            >
                                <SelectTrigger size="sm" className="w-16" id="per-page">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 15, 25, 50].map(n => (
                                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center text-sm font-medium">
                            Página {paginado.current_page} de {paginado.last_page}
                        </div>

                        <div className="ml-auto flex items-center gap-2 lg:ml-0">
                            <Button variant="outline" size="icon" className="hidden size-8 lg:flex"
                                onClick={() => setFiltros(f => ({ ...f, page: 1 }))}
                                disabled={paginado.current_page === 1}>
                                <IconChevronsLeft className="size-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="size-8"
                                onClick={() => setFiltros(f => ({ ...f, page: f.page - 1 }))}
                                disabled={paginado.current_page === 1}>
                                <IconChevronLeft className="size-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="size-8"
                                onClick={() => setFiltros(f => ({ ...f, page: f.page + 1 }))}
                                disabled={paginado.current_page === paginado.last_page}>
                                <IconChevronRight className="size-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="hidden size-8 lg:flex"
                                onClick={() => setFiltros(f => ({ ...f, page: paginado.last_page }))}
                                disabled={paginado.current_page === paginado.last_page}>
                                <IconChevronsRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}