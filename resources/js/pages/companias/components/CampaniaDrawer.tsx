"use client"

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    IconBuildingStore,
    IconLoader2,
    IconToggleRight,
    IconUser,
} from '@tabler/icons-react'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { StoreCampaniaSchema, type StoreCampaniaSchemaType } from '../schemas/compania.schemas'
import { campaniasService } from '../services/campanias.service'
import type { Campania } from '../types/compania.types'

interface CampaniaDrawerProps {
    /** null → crear | Campania → editar */
    campania: Campania | null
    open: boolean
    onClose: () => void
    onUpdated: () => void
}

export function CampaniaDrawer({ campania, open, onClose, onUpdated }: CampaniaDrawerProps) {
    const isEditing = !!campania
    const [saving, setSaving] = React.useState(false)

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<StoreCampaniaSchemaType>({
        resolver: zodResolver(StoreCampaniaSchema),
        defaultValues: { nombre: '', dominio: '', activa: true },
    })

    // Sincroniza el form cuando abre
    React.useEffect(() => {
        if (open) {
            reset(
                campania
                    ? { nombre: campania.nombre, dominio: campania.dominio ?? '', activa: campania.activa }
                    : { nombre: '', dominio: '', activa: true }
            )
        }
    }, [open, campania, reset])

    const activaValue = watch('activa')

    const onSubmit = async (values: StoreCampaniaSchemaType) => {
        setSaving(true)
        try {
            if (isEditing) {
                await campaniasService.update(campania.id, values)
                toast.success('Campaña actualizada correctamente')
            } else {
                await campaniasService.store(values)
                toast.success('Campaña creada correctamente')
            }
            onUpdated()
        } catch {
            toast.error(isEditing ? 'Error al actualizar la campaña' : 'Error al crear la campaña')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
            <DrawerContent className="max-w-md">
                <DrawerHeader className="gap-1">
                    <DrawerTitle className="flex items-center gap-2">
                        <IconBuildingStore className="size-5" />
                        {isEditing ? `Editar: ${campania.nombre}` : 'Nueva campaña'}
                    </DrawerTitle>
                    {isEditing && (
                        <DrawerDescription className="text-xs font-mono text-muted-foreground">
                            ID: {campania.id}
                        </DrawerDescription>
                    )}
                </DrawerHeader>

                <form
                    id="campania-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-5 overflow-y-auto px-4 text-sm"
                >
                    {/* Nombre */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="nombre">
                            Nombre <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="nombre"
                            placeholder="Ej: Campaña verano 2025"
                            {...register('nombre')}
                        />
                        {errors.nombre && (
                            <p className="text-xs text-destructive">{errors.nombre.message}</p>
                        )}
                    </div>

                    {/* Dominio */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="dominio">Dominio</Label>
                        <Input
                            id="dominio"
                            placeholder="https://mi-sitio.com"
                            {...register('dominio')}
                        />
                        {errors.dominio && (
                            <p className="text-xs text-destructive">{errors.dominio.message}</p>
                        )}
                    </div>

                    {/* Activa */}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex flex-col gap-0.5">
                            <span className="font-medium flex items-center gap-1">
                                <IconToggleRight className="size-4" /> Campaña activa
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Controla si la campaña está habilitada
                            </span>
                        </div>
                        <Switch
                            checked={activaValue ?? true}
                            onCheckedChange={(v) => setValue('activa', v)}
                        />
                    </div>

                    {/* Info solo lectura al editar */}
                    {isEditing && (campania.creador || campania.actualizador) && (
                        <>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                {campania.creador && (
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <IconUser className="size-3" /> Creado por
                                        </span>
                                        <span className="font-medium">{campania.creador.nombre}</span>
                                    </div>
                                )}
                                {campania.actualizador && (
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <IconUser className="size-3" /> Actualizado por
                                        </span>
                                        <span className="font-medium">{campania.actualizador.nombre}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </form>

                <DrawerFooter className="flex-row gap-2">
                    <Button
                        type="submit"
                        form="campania-form"
                        className="flex-1"
                        disabled={saving}
                    >
                        {saving && <IconLoader2 className="size-4 animate-spin mr-2" />}
                        {isEditing ? 'Guardar cambios' : 'Crear campaña'}
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline" className="flex-1" onClick={onClose}>
                            Cancelar
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}