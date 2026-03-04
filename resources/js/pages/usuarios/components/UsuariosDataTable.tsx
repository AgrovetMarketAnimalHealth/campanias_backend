"use client";

import * as React from 'react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';
import {
    IconSearch, IconDotsVertical, IconUserPlus, IconLoader,
    IconPencil, IconTrash, IconUser,
    IconChevronLeft, IconChevronRight,
    IconChevronsLeft, IconChevronsRight,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UsuarioDrawer } from './UsuarioDrawer';
import { usuarioService } from '../services/usuario.service';
import { rolService } from '@/pages/roles/services/rol.service';
import type { Usuario, UsuarioFiltros, UsuarioPaginado } from '../types/usuario.types';
import type { Rol } from '@/pages/roles/types/rol.types';

// ─── Fila de acciones ────────────────────────────────────────────────────────

function AccionesRow({
    usuario,
    onActualizado,
    onEliminar,
}: {
    usuario: Usuario;
    onActualizado: (u: Usuario) => void;
    onEliminar: (u: Usuario) => void;
}) {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [usuarioCompleto, setUsuarioCompleto] = React.useState<Usuario | null>(null);
    const [rolesLazy, setRolesLazy] = React.useState<Rol[]>([]);
    const [loading, setLoading] = React.useState(false);

    const handleEditar = async () => {
        setLoading(true);
        try {
            const [usuarioData, rolesData] = await Promise.all([
                usuarioService.show(usuario.id),
                rolService.index(),
            ]);
            setUsuarioCompleto(usuarioData);
            setRolesLazy(rolesData.data);
            setDrawerOpen(true);
        } catch {
            toast.error('Error al cargar el usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 text-muted-foreground data-[state=open]:bg-muted">
                        {loading
                            ? <IconLoader className="size-4 animate-spin" />
                            : <IconDotsVertical className="size-4" />
                        }
                        <span className="sr-only">Acciones</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handleEditar} disabled={loading}>
                        <IconPencil className="size-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 cursor-pointer" variant="destructive" onClick={() => onEliminar(usuario)}>
                        <IconTrash className="size-4" /> Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {usuarioCompleto && rolesLazy.length > 0 && (
                <UsuarioDrawer
                    usuario={usuarioCompleto}
                    roles={rolesLazy}
                    open={drawerOpen}
                    onOpenChange={setDrawerOpen}
                    onSuccess={onActualizado}
                />
            )}
        </>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function UsuariosDataTable() {
    const [paginado, setPaginado] = React.useState<UsuarioPaginado | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [deleteTarget, setDeleteTarget] = React.useState<Usuario | null>(null);
    const [deleting, setDeleting] = React.useState(false);

    // Drawer nuevo usuario
    const [nuevoOpen, setNuevoOpen] = React.useState(false);
    const [roles, setRoles] = React.useState<Rol[]>([]);
    const [loadingRoles, setLoadingRoles] = React.useState(false);

    const [filtros, setFiltros] = React.useState<UsuarioFiltros>({
        search: '',
        status: '',
        per_page: 15,
        page: 1,
    });
    const [searchInput, setSearchInput] = React.useState('');
    const searchTimeout = React.useRef<ReturnType<typeof setTimeout>>();

    const fetchData = React.useCallback(async (params: UsuarioFiltros) => {
        setLoading(true);
        try {
            const data = await usuarioService.index(params);
            setPaginado(data);
        } catch {
            toast.error('Error al cargar los usuarios');
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

    const handleNuevoClick = async () => {
        if (roles.length === 0) {
            setLoadingRoles(true);
            try {
                const data = await rolService.index();
                setRoles(data.data);
            } catch {
                toast.error('Error al cargar los roles');
                return;
            } finally {
                setLoadingRoles(false);
            }
        }
        setNuevoOpen(true);
    };

    const handleCreado = (nuevo: Usuario) => {
        toast.success(`Usuario "${nuevo.name}" creado.`);
        fetchData(filtros);
    };

    const handleActualizado = (actualizado: Usuario) => {
        toast.success(`Usuario "${actualizado.name}" actualizado.`);
        setPaginado(prev => {
            if (!prev) return prev;
            return { ...prev, data: prev.data.map(u => u.id === actualizado.id ? actualizado : u) };
        });
    };

    const handleEliminar = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await usuarioService.destroy(deleteTarget.id);
            toast.success(`Usuario "${deleteTarget.name}" eliminado.`);
            fetchData(filtros);
        } catch {
            toast.error('No se pudo eliminar el usuario.');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    const usuarios = paginado?.data ?? [];

    const columns: ColumnDef<Usuario>[] = [
        {
            accessorKey: 'name',
            header: 'Nombre',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <IconUser className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{row.original.name}</span>
                        <span className="text-xs text-muted-foreground">{row.original.email}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'role',
            header: 'Rol',
            cell: ({ row }) => row.original.role
                ? <Badge variant="secondary" className="capitalize text-xs">{row.original.role}</Badge>
                : <span className="text-xs text-muted-foreground">Sin rol</span>,
        },
        {
            accessorKey: 'activo',
            header: 'Estado',
            cell: ({ row }) => row.original.activo
                ? <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-500">Activo</Badge>
                : <Badge variant="secondary" className="text-xs">Inactivo</Badge>,
        },
        {
            accessorKey: 'creacion',
            header: 'Creado',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground whitespace-nowrap">{row.original.creacion}</span>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <AccionesRow
                    usuario={row.original}
                    onActualizado={handleActualizado}
                    onEliminar={setDeleteTarget}
                />
            ),
        },
    ];

    const table = useReactTable({
        data: usuarios,
        columns,
        getRowId: row => String(row.id),
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: paginado?.meta.last_page ?? 1,
    });

    return (
        <>
            <div className="flex flex-col gap-4">
                {/* Filtros */}
                <div className="flex flex-wrap items-end gap-3 px-4 lg:px-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            className="pl-8 h-8"
                            placeholder="Buscar por nombre o email..."
                            value={searchInput}
                            onChange={e => handleSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label className="text-xs text-muted-foreground">Estado</Label>
                        <Select
                            value={filtros.status}
                            onValueChange={val => setFiltros(f => ({ ...f, status: val === 'todos' ? '' : val, page: 1 }))}
                        >
                            <SelectTrigger size="sm" className="w-36">
                                <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                <SelectItem value="1">Activos</SelectItem>
                                <SelectItem value="0">Inactivos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button size="sm" className="gap-1.5 ml-auto" onClick={handleNuevoClick} disabled={loadingRoles}>
                        {loadingRoles
                            ? <IconLoader className="size-4 animate-spin" />
                            : <IconUserPlus className="size-4" />
                        }
                        Nuevo usuario
                    </Button>
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
                                            <IconLoader className="size-4 animate-spin" /> Cargando...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map(row => (
                                    <TableRow key={row.id}>
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
                                        No se encontraron usuarios.
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
                            Mostrando {paginado.meta.from ?? 0}–{paginado.meta.to ?? 0} de {paginado.meta.total} usuarios
                        </div>
                        <div className="flex w-full items-center gap-6 lg:w-fit">
                            <div className="hidden items-center gap-2 lg:flex">
                                <Label className="text-sm">Por página</Label>
                                <Select
                                    value={String(filtros.per_page)}
                                    onValueChange={v => setFiltros(f => ({ ...f, per_page: Number(v), page: 1 }))}
                                >
                                    <SelectTrigger size="sm" className="w-16">
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
                                Página {paginado.meta.current_page} de {paginado.meta.last_page}
                            </div>

                            <div className="ml-auto flex items-center gap-2 lg:ml-0">
                                <Button variant="outline" size="icon" className="hidden size-8 lg:flex"
                                    onClick={() => setFiltros(f => ({ ...f, page: 1 }))}
                                    disabled={paginado.meta.current_page === 1}>
                                    <IconChevronsLeft className="size-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="size-8"
                                    onClick={() => setFiltros(f => ({ ...f, page: f.page - 1 }))}
                                    disabled={paginado.meta.current_page === 1}>
                                    <IconChevronLeft className="size-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="size-8"
                                    onClick={() => setFiltros(f => ({ ...f, page: f.page + 1 }))}
                                    disabled={paginado.meta.current_page === paginado.meta.last_page}>
                                    <IconChevronRight className="size-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="hidden size-8 lg:flex"
                                    onClick={() => setFiltros(f => ({ ...f, page: paginado.meta.last_page }))}
                                    disabled={paginado.meta.current_page === paginado.meta.last_page}>
                                    <IconChevronsRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* AlertDialog eliminar */}
            <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás a punto de eliminar a <strong>"{deleteTarget?.name}"</strong>.
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleEliminar}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? <><IconLoader className="size-4 animate-spin" /> Eliminando...</> : 'Sí, eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Drawer nuevo usuario */}
            {roles.length > 0 && (
                <UsuarioDrawer
                    roles={roles}
                    open={nuevoOpen}
                    onOpenChange={setNuevoOpen}
                    onSuccess={handleCreado}
                />
            )}
        </>
    );
}