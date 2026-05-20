"use client";

import * as React from 'react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
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
    IconLoader,
    IconEye,
    IconPencil,
    IconTrash,
    IconPlus,
    IconBroadcast,
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
import { ActivaBadge } from './ActivaBadge';
import { CampaniaCreateDrawer, CampaniaDrawer } from './CampaniaDrawer';
import { CampaniaDeleteDialog } from './CampaniaDeleteDialog';
import { campaniaService } from '../services/campania.service';
import type { Campania, CampaniaFiltros, CampaniaPaginado } from '../types/campania.types';


// ─── Main Component ──────────────────────────────────────────────────────────

export function CampaniasDataTable() {
    const [paginado, setPaginado] = React.useState<CampaniaPaginado | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

    const [filtros, setFiltros] = React.useState<CampaniaFiltros>({
        nombre: '',
        activa: '',
        per_page: 15,
        page: 1,
    });

    const [searchInput, setSearchInput] = React.useState('');
    const searchTimeout = React.useRef<ReturnType<typeof setTimeout>>();
    const abortControllerRef = React.useRef<AbortController | null>(null);

    const fetchData = React.useCallback(async (params: CampaniaFiltros) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        try {
            const data = await campaniaService.index(params);
            setPaginado(data);
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') return;
            toast.error('Error al cargar las campañas');
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
            setFiltros(f => ({ ...f, nombre: value, page: 1 }));
        }, 400);
    };

    const handleActiva = (value: string) => {
        setFiltros(f => ({ ...f, activa: value === 'todos' ? '' : value, page: 1 }));
    };

    const handleCreated = (created: Campania) => {
        toast.success(`Campaña "${created.nombre}" creada.`);
        setFiltros(f => ({ ...f, page: 1 }));
    };

    const handleUpdated = (updated: Campania) => {
        setPaginado(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                data: prev.data.map(c => c.id === updated.id ? updated : c),
            };
        });
    };

    const handleDeleted = (id: string) => {
        setPaginado(prev => {
            if (!prev) return prev;
            const filtered = prev.data.filter(c => c.id !== id);
            return {
                ...prev,
                data: filtered,
                meta: { ...prev.meta, total: prev.meta.total - 1 },
            };
        });
    };

    // Paginación
    const currentPage = paginado?.meta.current_page ?? 1;
    const lastPage    = paginado?.meta.last_page    ?? 1;
    const totalItems  = paginado?.meta.total        ?? 0;
    const fromItem    = paginado?.meta.from         ?? 0;
    const toItem      = paginado?.meta.to           ?? 0;

    const goToPage = (page: number) => setFiltros(f => ({ ...f, page }));

    const campanias = paginado?.data ?? [];

    const columns: ColumnDef<Campania>[] = [
        // ── Nombre ────────────────────────────────────────────
        {
            accessorKey: 'nombre',
            header: 'Nombre',
            cell: ({ row }) => (
                <CampaniaDrawer campania={row.original} onUpdated={handleUpdated}>
                    <Button variant="link" className="px-0 font-medium text-sm text-foreground h-auto gap-1.5">
                        <IconBroadcast className="size-3.5 text-muted-foreground shrink-0" />
                        {row.original.nombre}
                    </Button>
                </CampaniaDrawer>
            ),
        },
        // ── Identificador ────────────────────────────────────
        {
            accessorKey: 'url',
            header: 'Identificador',
            cell: ({ row }) => (
                <span className="font-mono text-xs text-muted-foreground">
                    /{row.original.url}
                </span>
            ),
        },
        // ── Estado ────────────────────────────────────────────
        {
            accessorKey: 'activa',
            header: 'Estado',
            cell: ({ row }) => <ActivaBadge activa={row.original.activa} />,
        },
        // ── Fecha ─────────────────────────────────────────────
        {
            accessorKey: 'created_at',
            header: 'Creada',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(row.original.created_at).toLocaleDateString('es-PE', {
                        day: '2-digit', month: 'short', year: 'numeric',
                    })}
                </span>
            ),
        },
        // ── Actualizada ───────────────────────────────────────
        {
            accessorKey: 'updated_at',
            header: 'Actualizada',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(row.original.updated_at).toLocaleDateString('es-PE', {
                        day: '2-digit', month: 'short', year: 'numeric',
                    })}
                </span>
            ),
        },
        // ── Acciones ──────────────────────────────────────────
        {
            id: 'actions',
            cell: ({ row }) => {
                const campania = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground data-[state=open]:bg-muted"
                            >
                                <IconDotsVertical className="size-4" />
                                <span className="sr-only">Acciones</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <CampaniaDrawer campania={campania} onUpdated={handleUpdated}>
                                <DropdownMenuItem
                                    onSelect={e => e.preventDefault()}
                                    className="gap-2 cursor-pointer"
                                >
                                    <IconEye className="size-4" /> Ver detalle
                                </DropdownMenuItem>
                            </CampaniaDrawer>

                            <CampaniaDrawer campania={campania} onUpdated={handleUpdated} onDeleted={handleDeleted}>
                                <DropdownMenuItem
                                    onSelect={e => e.preventDefault()}
                                    className="gap-2 cursor-pointer"
                                >
                                    <IconPencil className="size-4" /> Editar
                                </DropdownMenuItem>
                            </CampaniaDrawer>

                            <DropdownMenuSeparator />

                            <CampaniaDeleteDialog campania={campania} onDeleted={handleDeleted}>
                                <DropdownMenuItem
                                    onSelect={e => e.preventDefault()}
                                    className="gap-2 cursor-pointer"
                                    variant="destructive"
                                >
                                    <IconTrash className="size-4" /> Eliminar
                                </DropdownMenuItem>
                            </CampaniaDeleteDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: campanias,
        columns,
        state: { columnVisibility },
        getRowId: row => String(row.id),
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualFiltering: true,
        pageCount: lastPage,
    });

    return (
        <div className="flex flex-col gap-4">
            {/* Filtros + Crear */}
            <div className="flex flex-wrap items-end gap-3 px-4 lg:px-6">
                {/* Buscar */}
                <div className="relative flex-1 min-w-[200px]">
                    <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        className="pl-8 h-8"
                        placeholder="Buscar por nombre..."
                        value={searchInput}
                        onChange={e => handleSearch(e.target.value)}
                    />
                </div>

                {/* Estado */}
                <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Estado</Label>
                    <Select
                        value={filtros.activa === '' ? 'todos' : filtros.activa}
                        onValueChange={handleActiva}
                    >
                        <SelectTrigger size="sm" className="w-36">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="true">Activas</SelectItem>
                            <SelectItem value="false">Inactivas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Columnas + Nueva campaña */}
                <div className="ml-auto flex items-center gap-2">
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

                    <CampaniaCreateDrawer onCreated={handleCreated}>
                        <Button size="sm" className="gap-1.5">
                            <IconPlus className="size-4" />
                            Nueva campaña
                        </Button>
                    </CampaniaCreateDrawer>
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-hidden rounded-lg border mx-4 lg:mx-6">
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
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                                    No se encontraron campañas.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            {paginado && (
                <div className="flex items-center justify-between px-4 lg:px-6">
                    <div className="text-sm text-muted-foreground hidden lg:block">
                        Mostrando {fromItem}–{toItem} de {totalItems} campañas
                    </div>
                    <div className="flex w-full items-center gap-6 lg:w-fit">
                        <div className="hidden items-center gap-2 lg:flex">
                            <Label htmlFor="per-page-camp" className="text-sm">Por página</Label>
                            <Select
                                value={String(filtros.per_page)}
                                onValueChange={v => setFiltros(f => ({ ...f, per_page: Number(v), page: 1 }))}
                            >
                                <SelectTrigger size="sm" className="w-16" id="per-page-camp">
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
                            Página {currentPage} de {lastPage}
                        </div>

                        <div className="ml-auto flex items-center gap-2 lg:ml-0">
                            <Button
                                variant="outline" size="icon" className="hidden size-8 lg:flex"
                                onClick={() => goToPage(1)}
                                disabled={loading || currentPage === 1}
                            >
                                <IconChevronsLeft className="size-4" />
                            </Button>
                            <Button
                                variant="outline" size="icon" className="size-8"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={loading || currentPage === 1}
                            >
                                <IconChevronLeft className="size-4" />
                            </Button>
                            <Button
                                variant="outline" size="icon" className="size-8"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={loading || currentPage === lastPage}
                            >
                                <IconChevronRight className="size-4" />
                            </Button>
                            <Button
                                variant="outline" size="icon" className="hidden size-8 lg:flex"
                                onClick={() => goToPage(lastPage)}
                                disabled={loading || currentPage === lastPage}
                            >
                                <IconChevronsRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}