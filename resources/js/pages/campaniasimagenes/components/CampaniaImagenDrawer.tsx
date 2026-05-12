"use client"

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Drawer, DrawerClose, DrawerContent, DrawerDescription,
    DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useIsMobile } from '@/hooks/use-mobile'
import {
    IconAlertCircle, IconCircleCheck, IconPhoto, IconDeviceDesktop,
    IconDeviceTablet, IconDeviceMobile, IconTrash, IconUpload,
    IconEye, IconEyeOff, IconSortAscending,
} from '@tabler/icons-react'
import { storeImagenSchema, type StoreImagenForm } from '../schemas/campaniasimagenes.schemas'
import { createImagen, updateImagen, deleteImagenCampo } from '../services/campaniasimagenes.services'
import type { CampaniaImagen, FeedbackState, ServerValidationError } from '../types/index'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildErrorDetails(errors: Record<string, string[]>): string[] {
    return Object.values(errors).flat()
}

// ─── Image Preview ────────────────────────────────────────────────────────────

function ImagePreview({
    url,
    label,
    campo,
    onDelete,
}: {
    url: string | null
    label: string
    campo: string
    onDelete?: (campo: string) => void
}) {
    const [loading, setLoading] = React.useState(true)

    if (!url) return null

    return (
        <div className="relative rounded-lg overflow-hidden border bg-muted/20">
            <div className="absolute top-2 left-2 z-10">
                <Badge variant="secondary" className="text-xs gap-1">{label}</Badge>
            </div>
            {onDelete && (
                <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 z-10 size-6"
                    onClick={() => onDelete(campo)}
                >
                    <IconTrash className="size-3" />
                </Button>
            )}
            <div className="min-h-[120px] flex items-center justify-center">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                )}
                <img
                    src={url}
                    alt={label}
                    className="w-full object-contain max-h-[180px]"
                    onLoad={() => setLoading(false)}
                    onError={() => setLoading(false)}
                />
            </div>
        </div>
    )
}

// ─── File Input ───────────────────────────────────────────────────────────────

function FileInput({
    id,
    label,
    icon: Icon,
    onChange,
    error,
}: {
    id: string
    label: string
    icon: React.ElementType
    onChange: (file: File | undefined) => void
    error?: string
}) {
    const [fileName, setFileName] = React.useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        setFileName(file?.name ?? null)
        onChange(file)
    }

    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id} className="flex items-center gap-1.5 text-xs">
                <Icon className="size-3.5" /> {label}
            </Label>
            <label
                htmlFor={id}
                className="flex items-center gap-2 cursor-pointer rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground hover:bg-muted/40 transition-colors"
            >
                <IconUpload className="size-3.5 shrink-0" />
                <span className="truncate">{fileName ?? 'Seleccionar imagen...'}</span>
                <input
                    id={id}
                    type="file"
                    accept="image/jpg,image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={handleChange}
                />
            </label>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    )
}

// ─── Toggle Visibility ────────────────────────────────────────────────────────

function ToggleVisibility({
    field,
    label,
    icon: Icon,
    value,
    onChange,
}: {
    field: string
    label: string
    icon: React.ElementType
    value: boolean
    onChange: (v: boolean) => void
}) {
    return (
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <Label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <Icon className="size-3.5" /> {label}
            </Label>
            <div className="flex items-center gap-1.5">
                {value
                    ? <IconEye className="size-3 text-muted-foreground" />
                    : <IconEyeOff className="size-3 text-muted-foreground" />}
                <Switch checked={value} onCheckedChange={onChange} />
            </div>
        </div>
    )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    campaniaId: string
    imagen?: CampaniaImagen
    onCreated?: (imagen: CampaniaImagen) => void
    onUpdated?: (imagen: CampaniaImagen) => void
    children: React.ReactNode
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CampaniaImagenDrawer({
    campaniaId,
    imagen,
    onCreated,
    onUpdated,
    children,
}: Props) {
    const isMobile = useIsMobile()
    const [open, setOpen] = React.useState(false)
    const [feedback, setFeedback] = React.useState<FeedbackState | null>(null)
    const [deletingCampo, setDeletingCampo] = React.useState<string | null>(null)

    const modoEdicion = !!imagen

    const form = useForm<StoreImagenForm>({
        resolver: zodResolver(storeImagenSchema),
        defaultValues: {
            seccion:         imagen?.seccion         ?? '',
            orden:           imagen?.orden           ?? 0,
            visible_desktop: imagen?.visible_desktop ?? true,
            visible_tablet:  imagen?.visible_tablet  ?? true,
            visible_mobile:  imagen?.visible_mobile  ?? true,
            activa:          imagen?.activa          ?? true,
        },
    })

    React.useEffect(() => {
        if (!open) {
            form.reset({
                seccion:         imagen?.seccion         ?? '',
                orden:           imagen?.orden           ?? 0,
                visible_desktop: imagen?.visible_desktop ?? true,
                visible_tablet:  imagen?.visible_tablet  ?? true,
                visible_mobile:  imagen?.visible_mobile  ?? true,
                activa:          imagen?.activa          ?? true,
            })
            setFeedback(null)
        }
    }, [open])

    const handleSubmit = form.handleSubmit(async (values) => {
        setFeedback(null)

        const fd = new FormData()
        if (values.seccion)              fd.append('seccion',         values.seccion)
        if (values.orden !== undefined)  fd.append('orden',           String(values.orden))
        fd.append('visible_desktop', values.visible_desktop ? '1' : '0')
        fd.append('visible_tablet',  values.visible_tablet  ? '1' : '0')
        fd.append('visible_mobile',  values.visible_mobile  ? '1' : '0')
        fd.append('activa',          values.activa           ? '1' : '0')
        if (values.imagen_desktop) fd.append('imagen_desktop', values.imagen_desktop)
        if (values.imagen_tablet)  fd.append('imagen_tablet',  values.imagen_tablet)
        if (values.imagen_mobile)  fd.append('imagen_mobile',  values.imagen_mobile)

        try {
            if (modoEdicion) {
                const updated = await updateImagen(campaniaId, imagen!.id, fd)
                setFeedback({ type: 'success', message: 'Imagen actualizada correctamente.' })
                onUpdated?.(updated)
            } else {
                fd.append('campania_id', campaniaId)
                const created = await createImagen(campaniaId, fd)
                setFeedback({ type: 'success', message: 'Imagen creada correctamente.' })
                onCreated?.(created)
            }
        } catch (error) {
            const err = error as ServerValidationError
            setFeedback({
                type:    'error',
                message: err?.message ?? 'Error al guardar la imagen.',
                details: err?.errors  ? buildErrorDetails(err.errors) : undefined,
            })
        }
    })

    const handleDeleteImagen = async (campo: string) => {
        if (!imagen) return
        setDeletingCampo(campo)
        try {
            const updated = await deleteImagenCampo(campaniaId, imagen.id, campo)
            onUpdated?.(updated)
            setFeedback({ type: 'success', message: `Imagen de ${campo.replace('imagen_', '')} eliminada.` })
        } catch {
            setFeedback({ type: 'error', message: 'No se pudo eliminar la imagen.' })
        } finally {
            setDeletingCampo(null)
        }
    }

    return (
        <Drawer open={open} onOpenChange={setOpen} direction={isMobile ? 'bottom' : 'right'}>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle className="flex items-center gap-2">
                        <IconPhoto className="size-4" />
                        {modoEdicion ? 'Editar imagen' : 'Nueva imagen'}
                    </DrawerTitle>
                    <DrawerDescription className="flex items-center gap-2 flex-wrap">
                        {modoEdicion ? (
                            <>
                                <Badge variant={imagen!.activa ? 'default' : 'secondary'}>
                                    {imagen!.activa ? 'Activa' : 'Inactiva'}
                                </Badge>
                                {imagen!.seccion && (
                                    <Badge variant="outline">{imagen!.seccion}</Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                    Orden: {imagen!.orden}
                                </span>
                            </>
                        ) : (
                            <span className="text-xs text-muted-foreground">
                                Completa los datos de la nueva imagen
                            </span>
                        )}
                    </DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">

                    {/* Metadatos */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="seccion" className="text-xs">Sección</Label>
                            <Input
                                id="seccion"
                                placeholder="Ej: hero, banner, footer..."
                                className="h-8 text-sm"
                                {...form.register('seccion')}
                            />
                            {form.formState.errors.seccion && (
                                <p className="text-xs text-destructive">
                                    {form.formState.errors.seccion.message}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="orden" className="flex items-center gap-1 text-xs">
                                <IconSortAscending className="size-3" /> Orden
                            </Label>
                            <Input
                                id="orden"
                                type="number"
                                min={0}
                                className="h-8 text-sm"
                                {...form.register('orden', { valueAsNumber: true })}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Imágenes actuales (modo edición) */}
                    {modoEdicion && (
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Imágenes actuales
                            </p>
                            {!imagen!.imagen_desktop && !imagen!.imagen_tablet && !imagen!.imagen_mobile && (
                                <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                                    Sin imágenes cargadas aún
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-3">
                                <ImagePreview
                                    url={imagen!.imagen_desktop}
                                    label="Desktop"
                                    campo="imagen_desktop"
                                    onDelete={deletingCampo ? undefined : handleDeleteImagen}
                                />
                                <ImagePreview
                                    url={imagen!.imagen_tablet}
                                    label="Tablet"
                                    campo="imagen_tablet"
                                    onDelete={deletingCampo ? undefined : handleDeleteImagen}
                                />
                                <ImagePreview
                                    url={imagen!.imagen_mobile}
                                    label="Mobile"
                                    campo="imagen_mobile"
                                    onDelete={deletingCampo ? undefined : handleDeleteImagen}
                                />
                            </div>
                            {deletingCampo && (
                                <p className="text-xs text-muted-foreground animate-pulse">
                                    Eliminando imagen...
                                </p>
                            )}
                            <Separator />
                        </div>
                    )}

                    {/* Upload imágenes */}
                    <div className="space-y-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {modoEdicion ? 'Reemplazar imágenes' : 'Cargar imágenes'}
                        </p>
                        <div className="flex flex-col gap-3">
                            <FileInput
                                id="img_desktop"
                                label="Desktop"
                                icon={IconDeviceDesktop}
                                onChange={f => form.setValue('imagen_desktop', f)}
                                error={form.formState.errors.imagen_desktop?.message as string}
                            />
                            <FileInput
                                id="img_tablet"
                                label="Tablet"
                                icon={IconDeviceTablet}
                                onChange={f => form.setValue('imagen_tablet', f)}
                                error={form.formState.errors.imagen_tablet?.message as string}
                            />
                            <FileInput
                                id="img_mobile"
                                label="Mobile"
                                icon={IconDeviceMobile}
                                onChange={f => form.setValue('imagen_mobile', f)}
                                error={form.formState.errors.imagen_mobile?.message as string}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Formatos: JPG, PNG, WebP, GIF · Máx. 5 MB por imagen
                        </p>
                    </div>

                    <Separator />

                    {/* Visibilidad */}
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Visibilidad por dispositivo
                        </p>
                        <ToggleVisibility
                            field="visible_desktop"
                            label="Desktop"
                            icon={IconDeviceDesktop}
                            value={form.watch('visible_desktop')}
                            onChange={v => form.setValue('visible_desktop', v)}
                        />
                        <ToggleVisibility
                            field="visible_tablet"
                            label="Tablet"
                            icon={IconDeviceTablet}
                            value={form.watch('visible_tablet')}
                            onChange={v => form.setValue('visible_tablet', v)}
                        />
                        <ToggleVisibility
                            field="visible_mobile"
                            label="Mobile"
                            icon={IconDeviceMobile}
                            value={form.watch('visible_mobile')}
                            onChange={v => form.setValue('visible_mobile', v)}
                        />
                    </div>

                    <Separator />

                    {/* Estado */}
                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                        <Label className="text-xs cursor-pointer">Imagen activa</Label>
                        <Switch
                            checked={form.watch('activa')}
                            onCheckedChange={v => form.setValue('activa', v)}
                        />
                    </div>

                    {/* Feedback */}
                    {feedback && (
                        <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
                            {feedback.type === 'error'
                                ? <IconAlertCircle className="size-4" />
                                : <IconCircleCheck className="size-4" />}
                            <AlertTitle>{feedback.type === 'error' ? 'Error' : '¡Listo!'}</AlertTitle>
                            <AlertDescription>
                                <p>{feedback.message}</p>
                                {feedback.details && feedback.details.length > 0 && (
                                    <ul className="mt-1 list-disc pl-4 space-y-0.5">
                                        {feedback.details.map((d, i) => <li key={i}>{d}</li>)}
                                    </ul>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Button
                        type="button"
                        size="sm"
                        className="w-full"
                        disabled={form.formState.isSubmitting}
                        onClick={handleSubmit}
                    >
                        {form.formState.isSubmitting
                            ? 'Guardando...'
                            : modoEdicion ? 'Guardar cambios' : 'Crear imagen'}
                    </Button>

                </div>

                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">Cerrar</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}