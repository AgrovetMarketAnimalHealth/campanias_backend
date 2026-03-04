"use client";

import * as React from 'react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';
import {
    IconSearch, IconDotsVertical, IconShieldPlus,
    IconLoader, IconPencil, IconTrash, IconShield,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RolDrawer } from './RolDrawer';
import { rolService } from '../services/rol.service';
import type { Rol, Permiso } from '../types/rol.types';

// ─── Acciones por fila (separado para evitar re-render loops con Radix) ──────

function AccionesRow({
    rol,
    onActualizado,
    onEliminar,
}: {
    rol: Rol;
    onActualizado: (r: Rol) => void;
    onEliminar: (r: Rol) => void;
}) {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [rolCompleto, setRolCompleto] = React.useState<Rol | null>(null);
    const [permisosLazy, setPermisosLazy] = React.useState<Permiso[]>([]);
    const [loadingRol, setLoadingRol] = React.useState(false);

    const handleEditarClick = async () => {
        setLoadingRol(true);
        try {
            const [rolData, permisosData] = await Promise.all([
                rolService.show(rol.id),
                rolService.permisos(),
            ]);
            setRolCompleto(rolData);
            setPermisosLazy(permisosData.permissions);
            setDrawerOpen(true);
        } catch {
            toast.error('Error al cargar el rol');
        } finally {
            setLoadingRol(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground data-[state=open]:bg-muted"
                    >
                        {loadingRol
                            ? <IconLoader className="size-4 animate-spin" />
                            : <IconDotsVertical className="size-4" />
                        }
                        <span className="sr-only">Acciones</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={handleEditarClick}
                        disabled={loadingRol}
                    >
                        <IconPencil className="size-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        variant="destructive"
                        onClick={() => onEliminar(rol)}
                    >
                        <IconTrash className="size-4" /> Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {rolCompleto && (
                <RolDrawer
                    rol={rolCompleto}
                    permisos={permisosLazy}
                    onSuccess={onActualizado}
                    open={drawerOpen}
                    onOpenChange={setDrawerOpen}
                >
                    <span className="hidden" />
                </RolDrawer>
            )}
        </>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function RolesDataTable() {
    const [roles, setRoles] = React.useState<Rol[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');
    const [deleteTarget, setDeleteTarget] = React.useState<Rol | null>(null);
    const [deleting, setDeleting] = React.useState(false);
    const [nuevoDrawerOpen, setNuevoDrawerOpen] = React.useState(false);
    const [permisosNuevo, setPermisosNuevo] = React.useState<Permiso[]>([]);
    const [loadingNuevo, setLoadingNuevo] = React.useState(false);

    // Carga inicial - solo roles, permisos se cargan lazy al editar
    React.useEffect(() => {
        rolService.index()
            .then(res => setRoles(res.data))
            .catch(() => toast.error('Error al cargar los roles'))
            .finally(() => setLoading(false));
    }, []);

    const rolesFiltrados = React.useMemo(() => {
        if (!search.trim()) return roles;
        return roles.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    }, [roles, search]);

    const handleNuevoClick = async () => {
        if (permisosNuevo.length === 0) {
            setLoadingNuevo(true);
            try {
                const data = await rolService.permisos();
                setPermisosNuevo(data.permissions);
            } catch {
                toast.error('Error al cargar los permisos');
                return;
            } finally {
                setLoadingNuevo(false);
            }
        }
        setNuevoDrawerOpen(true);
    };

    const handleCreado = (nuevo: Rol) => {
        setRoles(prev => [...prev, nuevo]);
        toast.success(`Rol "${nuevo.name}" creado correctamente.`);
    };

    const handleActualizado = (actualizado: Rol) => {
        setRoles(prev => prev.map(r => r.id === actualizado.id ? actualizado : r));
        toast.success(`Rol "${actualizado.name}" actualizado.`);
    };

    const handleEliminar = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await rolService.destroy(deleteTarget.id);
            setRoles(prev => prev.filter(r => r.id !== deleteTarget.id));
            toast.success(`Rol "${deleteTarget.name}" eliminado.`);
        } catch {
            toast.error('No se pudo eliminar el rol. Puede estar en uso.');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    const columns: ColumnDef<Rol>[] = [
        {
            accessorKey: 'name',
            header: 'Nombre',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <IconShield className="size-4 text-muted-foreground shrink-0" />
                    <span className="font-medium capitalize">{row.original.name}</span>
                </div>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Creado',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {row.original.created_at}
                </span>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => <AccionesRow
                rol={row.original}
                onActualizado={handleActualizado}
                onEliminar={setDeleteTarget}
            />,
        },
    ];

    const table = useReactTable({
        data: rolesFiltrados,
        columns,
        getRowId: row => String(row.id),
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <div className="flex flex-col gap-4">
                {/* Filtros + Botón crear */}
                <div className="flex flex-wrap items-center gap-3 px-4 lg:px-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            className="pl-8 h-8"
                            placeholder="Buscar rol..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <Button size="sm" className="gap-1.5 ml-auto" onClick={handleNuevoClick} disabled={loadingNuevo}>
                        {loadingNuevo
                            ? <IconLoader className="size-4 animate-spin" />
                            : <IconShieldPlus className="size-4" />
                        }
                        Nuevo rol
                    </Button>
                    {permisosNuevo.length > 0 && (
                        <RolDrawer
                            permisos={permisosNuevo}
                            onSuccess={handleCreado}
                            open={nuevoDrawerOpen}
                            onOpenChange={setNuevoDrawerOpen}
                        >
                            <span className="hidden" />
                        </RolDrawer>
                    )}
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
                                        No se encontraron roles.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Contador */}
                <div className="px-4 lg:px-6 text-xs text-muted-foreground">
                    {rolesFiltrados.length} {rolesFiltrados.length === 1 ? 'rol' : 'roles'} encontrados
                </div>
            </div>

            {/* AlertDialog confirmar eliminación */}
            <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar rol?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás a punto de eliminar el rol <strong>"{deleteTarget?.name}"</strong>.
                            Esta acción no se puede deshacer y puede afectar a los usuarios que lo tienen asignado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleEliminar}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting
                                ? <><IconLoader className="size-4 animate-spin" /> Eliminando...</>
                                : 'Sí, eliminar'
                            }
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}