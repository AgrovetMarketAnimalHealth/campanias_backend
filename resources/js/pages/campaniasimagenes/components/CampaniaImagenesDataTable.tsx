"use client"

import * as React from 'react'
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
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type Row,
    type VisibilityState,
} from '@tanstack/react-table'
import {
    IconLayoutColumns,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconSearch,
    IconDotsVertical,
    IconPhoto,
    IconEye,
    IconLoader,
    IconGripVertical,
    IconPlus,
    IconToggleLeft,
    IconTrash,
    IconPencil,
    IconDeviceDesktop,
    IconDeviceTablet,
    IconDeviceMobile,
    IconCircleCheckFilled,
    IconCircleDotted,
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { CampaniaImagenDrawer } from './CampaniaImagenDrawer'
import {
    fetchImagenes,
    toggleActiva,
    deleteImagen,
    reordenarImagenes,
} from '../services/campaniasimagenes.services'
import type { CampaniaImagen, Filtros, PaginadoResponse } from '../types/index'

// ─── Drag Handle ──────────────────────────────────────────────────────────────

function DragHandle({ id }: { id: string }) {
    const { attributes, listeners } = useSortable({ id })
    return (
        <Button
            {...attributes}
            {...listeners}
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-7 hover:bg-transparent cursor-grab"
        >
            <IconGripVertical className="text-muted-foreground size-3" />
            <span className="sr-only">Arrastrar para reordenar</span>
        </Button>
    )
}

// ─── Draggable Row ────────────────────────────────────────────────────────────

function DraggableRow({ row }: { row: Row<CampaniaImagen> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    })

    return (
        <TableRow
            data-state={row.getIsSelected() && 'selected'}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{ transform: CSS.Transform.toString(transform), transition }}
        >
            {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    )
}

// ─── Visibility Pills ─────────────────────────────────────────────────────────

function VisibilityPills({ imagen }: { imagen: CampaniaImagen }) {
    return (
        <div className="flex gap-1">
            {[
                { key: 'visible_desktop', icon: IconDeviceDesktop },
                { key: 'visible_tablet',  icon: IconDeviceTablet },
                { key: 'visible_mobile',  icon: IconDeviceMobile },
            ].map(({ key, icon: Icon }) => {
                const visible = imagen[key as keyof CampaniaImagen] as boolean
                return (
                    <Badge
                        key={key}
                        variant={visible ? 'default' : 'secondary'}
                        className="gap-0.5 px-1.5 py-0.5 text-[10px]"
                    >
                        <Icon className="size-2.5" />
                    </Badge>
                )
            })}
        </div>
    )
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────

function DeleteDialog({
    imagen,
    campaniaId,
    onDeleted,
}: {
    imagen: CampaniaImagen
    campaniaId: string
    onDeleted: (id: string) => void
}) {
    const [loading, setLoading] = React.useState(false)

    const handleDelete = async () => {
        setLoading(true)
        try {
            await deleteImagen(campaniaId, imagen.id)
            onDeleted(imagen.id)
            toast.success('Imagen eliminada correctamente.')
        } catch {
            toast.error('No se pudo eliminar la imagen.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem
                    onSelect={e => e.preventDefault()}
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                    <IconTrash className="size-4" /> Eliminar
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminarán la imagen y todos sus archivos asociados.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading ? 'Eliminando...' : 'Eliminar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    campaniaId: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CampaniaImagenesDataTable({ campaniaId }: Props) {
    const [paginado, setPaginado] = React.useState<PaginadoResponse | null>(null)
    const [loading, setLoading]   = React.useState(true)
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [savingOrder, setSavingOrder] = React.useState(false)
    const [pendingOrder, setPendingOrder] = React.useState(false)

    const [filtros, setFiltros] = React.useState<Filtros>({
        seccion:  '',
        activa:   '',
        per_page: 15,
        page:     1,
    })

    const [seccionInput, setSeccionInput] = React.useState('')
    const searchTimeout = React.useRef<ReturnType<typeof setTimeout>>()
    const sortableId    = React.useId()
    const abortRef      = React.useRef<AbortController | null>(null)

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {}),
    )

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchData = React.useCallback(async (params: Filtros) => {
        abortRef.current?.abort()
        abortRef.current = new AbortController()
        setLoading(true)
        try {
            const data = await fetchImagenes(campaniaId, params)
            setPaginado(data)
            setPendingOrder(false)
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') return
            toast.error('Error al cargar las imágenes.')
        } finally {
            setLoading(false)
        }
    }, [campaniaId])

    React.useEffect(() => { fetchData(filtros) }, [filtros, fetchData])

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleSeccion = (value: string) => {
        setSeccionInput(value)
        clearTimeout(searchTimeout.current)
        searchTimeout.current = setTimeout(() => {
            setFiltros(f => ({ ...f, seccion: value, page: 1 }))
        }, 400)
    }

    const handleActiva = (value: string) => {
        setFiltros(f => ({ ...f, activa: value as Filtros['activa'], page: 1 }))
    }

    const handleUpdated = (updated: CampaniaImagen) => {
        setPaginado(prev => {
            if (!prev) return prev
            return { ...prev, data: prev.data.map(i => i.id === updated.id ? updated : i) }
        })
    }

    const handleCreated = (_created: CampaniaImagen) => {
        fetchData(filtros)
        toast.success('Imagen creada correctamente.')
    }

    const handleDeleted = (id: string) => {
        setPaginado(prev => {
            if (!prev) return prev
            return { ...prev, data: prev.data.filter(i => i.id !== id) }
        })
    }

    const handleToggle = async (imagen: CampaniaImagen) => {
        try {
            const updated = await toggleActiva(campaniaId, imagen.id)
            handleUpdated(updated)
            toast.success(`Imagen ${updated.activa ? 'activada' : 'desactivada'}.`)
        } catch {
            toast.error('No se pudo cambiar el estado.')
        }
    }

    // ── Drag & Drop ────────────────────────────────────────────────────────────
    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => paginado?.data.map(({ id }) => id) ?? [],
        [paginado],
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (active && over && active.id !== over.id) {
            setPaginado(prev => {
                if (!prev) return prev
                const oldIndex = dataIds.indexOf(active.id)
                const newIndex = dataIds.indexOf(over.id)
                return { ...prev, data: arrayMove(prev.data, oldIndex, newIndex) }
            })
            setPendingOrder(true)
        }
    }

    const handleSaveOrder = async () => {
        if (!paginado) return
        setSavingOrder(true)
        try {
            const orden = paginado.data.map((img, idx) => ({ id: img.id, orden: idx }))
            await reordenarImagenes(campaniaId, orden)
            toast.success('Orden guardado correctamente.')
            setPendingOrder(false)
        } catch {
            toast.error('Error al guardar el orden.')
        } finally {
            setSavingOrder(false)
        }
    }

    // ── Paginación ─────────────────────────────────────────────────────────────
    const currentPage = paginado?.meta.current_page ?? 1
    const lastPage    = paginado?.meta.last_page    ?? 1
    const totalItems  = paginado?.meta.total        ?? 0
    const fromItem    = paginado?.meta.from         ?? 0
    const toItem      = paginado?.meta.to           ?? 0

    const goToPage = (page: number) => setFiltros(f => ({ ...f, page }))

    const imagenes = paginado?.data ?? []

    // ── Columns ────────────────────────────────────────────────────────────────
    const columns: ColumnDef<CampaniaImagen>[] = [
        {
            id:     'drag',
            header: () => null,
            cell:   ({ row }) => <DragHandle id={row.original.id} />,
        },
        {
            accessorKey: 'orden',
            header:      'Orden',
            cell:        ({ row }) => (
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {row.original.orden}
                </span>
            ),
        },
        {
            id:     'preview',
            header: 'Vista previa',
            cell:   ({ row }) => {
                const img = row.original
                const url = img.imagen_desktop ?? img.imagen_tablet ?? img.imagen_mobile
                return url ? (
                    <div className="w-16 h-10 rounded border overflow-hidden bg-muted/20 flex items-center justify-center">
                        <img src={url} alt="preview" className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="w-16 h-10 rounded border border-dashed bg-muted/20 flex items-center justify-center">
                        <IconPhoto className="size-4 text-muted-foreground/40" />
                    </div>
                )
            },
        },
        {
            accessorKey: 'seccion',
            header:      'Sección',
            cell:        ({ row }) => (
                row.original.seccion
                    ? <Badge variant="outline" className="text-xs">{row.original.seccion}</Badge>
                    : <span className="text-muted-foreground text-xs">—</span>
            ),
        },
        {
            id:     'imagenes',
            header: 'Imágenes',
            cell:   ({ row }) => {
                const img = row.original
                return (
                    <div className="flex gap-1">
                        {[
                            { campo: 'imagen_desktop', icon: IconDeviceDesktop },
                            { campo: 'imagen_tablet',  icon: IconDeviceTablet },
                            { campo: 'imagen_mobile',  icon: IconDeviceMobile },
                        ].map(({ campo, icon: Icon }) => {
                            const hasImg = !!img[campo as keyof CampaniaImagen]
                            return (
                                <Icon
                                    key={campo}
                                    className={`size-4 ${hasImg ? 'text-primary' : 'text-muted-foreground/30'}`}
                                />
                            )
                        })}
                    </div>
                )
            },
        },
        {
            id:     'visibilidad',
            header: 'Visible en',
            cell:   ({ row }) => <VisibilityPills imagen={row.original} />,
        },
        {
            accessorKey: 'activa',
            header:      'Activa',
            cell:        ({ row }) => {
                const img = row.original
                return (
                    <div className="flex items-center gap-2">
                        {img.activa
                            ? <IconCircleCheckFilled className="size-4 text-green-500" />
                            : <IconCircleDotted className="size-4 text-muted-foreground" />}
                        <Switch
                            checked={img.activa}
                            onCheckedChange={() => handleToggle(img)}
                            className="scale-75"
                        />
                    </div>
                )
            },
        },
        {
            accessorKey: 'created_at',
            header:      'Creada',
            cell:        ({ row }) => (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {row.original.created_at}
                </span>
            ),
        },
        {
            id:   'actions',
            cell: ({ row }) => {
                const img = row.original
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
                            {(img.imagen_desktop ?? img.imagen_tablet ?? img.imagen_mobile) && (
                                <DropdownMenuItem asChild>
                                    <a
                                        href={img.imagen_desktop ?? img.imagen_tablet ?? img.imagen_mobile ?? '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="gap-2 cursor-pointer flex items-center"
                                    >
                                        <IconEye className="size-4" /> Ver imagen
                                    </a>
                                </DropdownMenuItem>
                            )}
                            <CampaniaImagenDrawer
                                campaniaId={campaniaId}
                                imagen={img}
                                onUpdated={handleUpdated}
                            >
                                <DropdownMenuItem
                                    onSelect={e => e.preventDefault()}
                                    className="gap-2 cursor-pointer"
                                >
                                    <IconPencil className="size-4" /> Editar
                                </DropdownMenuItem>
                            </CampaniaImagenDrawer>
                            <DropdownMenuItem
                                className="gap-2 cursor-pointer"
                                onClick={() => handleToggle(img)}
                            >
                                <IconToggleLeft className="size-4" />
                                {img.activa ? 'Desactivar' : 'Activar'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DeleteDialog
                                imagen={img}
                                campaniaId={campaniaId}
                                onDeleted={handleDeleted}
                            />
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const table = useReactTable({
        data:                     imagenes,
        columns,
        state:                    { columnVisibility },
        getRowId:                 row => String(row.id),
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel:          getCoreRowModel(),
        manualPagination:         true,
        manualFiltering:          true,
        pageCount:                lastPage,
    })

    return (
        <div className="flex flex-col gap-4">

            {/* Toolbar */}
            <div className="flex flex-wrap items-end gap-3 px-4 lg:px-6">
                <div className="relative flex-1 min-w-[180px]">
                    <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        className="pl-8 h-8"
                        placeholder="Filtrar por sección..."
                        value={seccionInput}
                        onChange={e => handleSeccion(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Estado</Label>
                    <Select value={filtros.activa || 'todos'} onValueChange={handleActiva}>
                        <SelectTrigger size="sm" className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="true">Activas</SelectItem>
                            <SelectItem value="false">Inactivas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {pendingOrder && (
                    <Button
                        size="sm"
                        variant="default"
                        onClick={handleSaveOrder}
                        disabled={savingOrder}
                        className="gap-1.5"
                    >
                        {savingOrder
                            ? <IconLoader className="size-3.5 animate-spin" />
                            : <IconGripVertical className="size-3.5" />}
                        {savingOrder ? 'Guardando...' : 'Guardar orden'}
                    </Button>
                )}

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

                    <CampaniaImagenDrawer
                        campaniaId={campaniaId}
                        onCreated={handleCreated}
                    >
                        <Button size="sm" className="gap-1.5">
                            <IconPlus className="size-4" />
                            Nueva imagen
                        </Button>
                    </CampaniaImagenDrawer>
                </div>
            </div>

            {/* Tabla */}
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
                                            {h.isPlaceholder
                                                ? null
                                                : flexRender(h.column.columnDef.header, h.getContext())}
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
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-32 text-center text-muted-foreground"
                                    >
                                        No se encontraron imágenes.
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
                        Mostrando {fromItem}–{toItem} de {totalItems} imágenes
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
    )
}