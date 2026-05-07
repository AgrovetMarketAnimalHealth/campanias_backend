"use client";

import * as React from 'react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconDotsVertical,
    IconLoader2,
    IconPlus,
    IconSearch,
    IconEdit,
    IconTrash,
    IconToggleLeft,
    IconToggleRight,
    IconGripVertical,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { CampaniaDrawer } from './CampaniaDrawer';
import { campaniasService } from '../services/campanias.service';
import type { Campania, PaginatedResponse, CampaniaFilters } from '../types/compania.types';

function DragHandle({ id }: { id: string }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground/50 cursor-grab active:cursor-grabbing"
            data-drag-id={id}
        >
            <IconGripVertical className="size-4" />
            <span className="sr-only">Arrastrar</span>
        </Button>
    );
}

export function CampaniasTable() {
    const [data, setData] = React.useState<PaginatedResponse<Campania> | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');
    const [debouncedSearch, setDebouncedSearch] = React.useState('');
    const [activaFilter, setActivaFilter] = React.useState<boolean | null>(null);
    const [page, setPage] = React.useState(1);
    const perPage = 15;

    // Solo actualiza debouncedSearch 500ms después de que el usuario para de escribir
    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500)
        return () => clearTimeout(timer)
    }, [search]);

    const [editingCampania, setEditingCampania] = React.useState<Campania | null>(null);
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [campaniaToDelete, setCampaniaToDelete] = React.useState<Campania | null>(null);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            const filters: CampaniaFilters = { search: debouncedSearch, page, per_page: perPage };
            if (activaFilter !== null) filters.activa = activaFilter;
            const response = await campaniasService.index(filters);
            setData(response);
        } catch {
            toast.error('Error al cargar las campañas');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, activaFilter, page]);

    // Resetea la página cuando cambia el search o el filtro
    React.useEffect(() => { setPage(1); }, [debouncedSearch, activaFilter]);

    React.useEffect(() => { fetchData(); }, [fetchData]);

    const handleEdit = (campania: Campania) => {
        setEditingCampania(campania);
        setDrawerOpen(true);
    };

    const handleDelete = (campania: Campania) => {
        setCampaniaToDelete(campania);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!campaniaToDelete) return;
        try {
            await campaniasService.destroy(campaniaToDelete.id);
            toast.success('Campaña eliminada correctamente');
            fetchData();
        } catch {
            toast.error('Error al eliminar la campaña');
        } finally {
            setDeleteDialogOpen(false);
            setCampaniaToDelete(null);
        }
    };

    const handleToggleActiva = async (campania: Campania) => {
        try {
            await campaniasService.toggleActiva(campania.id);
            toast.success(`Campaña ${campania.activa ? 'desactivada' : 'activada'} correctamente`);
            fetchData();
        } catch {
            toast.error('Error al cambiar el estado de la campaña');
        }
    };

    const handleUpdated = () => {
        setDrawerOpen(false);
        setEditingCampania(null);
        fetchData();
    };

    const columns: ColumnDef<Campania>[] = [
        {
            id: 'drag',
            header: () => null,
            cell: ({ row }) => <DragHandle id={row.original.id} />,
        },
        {
            accessorKey: 'nombre',
            header: 'Nombre',
            cell: ({ row }) => (
                <div className="font-medium">{row.original.nombre}</div>
            ),
        },
        {
            accessorKey: 'dominio',
            header: 'Dominio',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.dominio || '—'}
                </span>
            ),
        },
        {
            accessorKey: 'activa',
            header: 'Estado',
            cell: ({ row }) => (
                <Badge variant={row.original.activa ? 'default' : 'secondary'}>
                    {row.original.activa ? 'Activa' : 'Inactiva'}
                </Badge>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Creada',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {row.original.created_at}
                </span>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const campania = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground data-[state=open]:bg-muted">
                                <IconDotsVertical className="size-4" />
                                <span className="sr-only">Acciones</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleEdit(campania)} className="gap-2 cursor-pointer">
                                <IconEdit className="size-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActiva(campania)} className="gap-2 cursor-pointer">
                                {campania.activa
                                    ? <><IconToggleRight className="size-4" /> Desactivar</>
                                    : <><IconToggleLeft  className="size-4" /> Activar</>
                                }
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleDelete(campania)}
                                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                            >
                                <IconTrash className="size-4" /> Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: data?.data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    const meta        = data?.meta;
    const currentPage = meta?.current_page ?? 1;
    const lastPage    = meta?.last_page    ?? 1;
    const total       = meta?.total        ?? 0;
    const from        = meta?.from         ?? 0;
    const to          = meta?.to           ?? 0;

    return (
        <div className="flex flex-col gap-4">
            {/* Filtros */}
            <div className="flex flex-wrap items-end gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        className="pl-8 h-9"
                        placeholder="Buscar campañas..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="activa-filter" className="text-sm">Estado:</Label>
                    <select
                        id="activa-filter"
                        className="h-9 px-3 py-1 text-sm border border-input bg-background rounded-md"
                        value={activaFilter === null ? 'todas' : activaFilter ? 'activas' : 'inactivas'}
                        onChange={(e) => {
                            const v = e.target.value;
                            setActivaFilter(v === 'todas' ? null : v === 'activas');
                            setPage(1);
                        }}
                    >
                        <option value="todas">Todas</option>
                        <option value="activas">Activas</option>
                        <option value="inactivas">Inactivas</option>
                    </select>
                </div>
                <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => { setEditingCampania(null); setDrawerOpen(true); }}
                >
                    <IconPlus className="size-4" /> Nueva campaña
                </Button>
            </div>

            {/* Tabla */}
            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader className="bg-muted sticky top-0 z-10">
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((h) => (
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
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <IconLoader2 className="size-4 animate-spin" />
                                        Cargando…
                                    </div>
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
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No se encontraron campañas.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            {lastPage > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        Mostrando {from}–{to} de {total} campañas
                    </span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(1)}          disabled={currentPage === 1}><IconChevronsLeft  className="size-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={currentPage === 1}><IconChevronLeft   className="size-4" /></Button>
                        <span className="text-sm">Página {currentPage} de {lastPage}</span>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={currentPage === lastPage}><IconChevronRight  className="size-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(lastPage)}    disabled={currentPage === lastPage}><IconChevronsRight className="size-4" /></Button>
                    </div>
                </div>
            )}

            {/* Drawer crear / editar */}
            <CampaniaDrawer
                campania={editingCampania}
                open={drawerOpen}
                onClose={() => { setDrawerOpen(false); setEditingCampania(null); }}
                onUpdated={handleUpdated}
            />

            {/* Confirmar eliminar */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar campaña?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. La campaña "{campaniaToDelete?.nombre}" será eliminada permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}