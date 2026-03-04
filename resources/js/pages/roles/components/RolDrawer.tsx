"use client";

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Drawer, DrawerClose, DrawerContent, DrawerDescription,
    DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { rolService } from '../services/rol.service';
import { rolSchema, type RolFormData } from '../schemas/rol.schemas';
import type { Rol, Permiso } from '../types/rol.types';
import {
    IconShield, IconAlertCircle, IconCircleCheck,
    IconLoader, IconLock,
} from '@tabler/icons-react';

interface Props {
    rol?: Rol;
    permisos: Permiso[];
    onSuccess: (rol: Rol) => void;
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

interface FeedbackState {
    type: 'success' | 'error';
    message: string;
    details?: string[];
}

// Agrupa permisos por la palabra clave antes del espacio: "ver boletas" → "boletas"
function agruparPermisos(permisos: Permiso[]): Record<string, Permiso[]> {
    return permisos.reduce<Record<string, Permiso[]>>((acc, p) => {
        const partes = p.name.split(' ');
        const categoria = partes.slice(1).join(' ') || partes[0];
        if (!acc[categoria]) acc[categoria] = [];
        acc[categoria].push(p);
        return acc;
    }, {});
}

const ACCION_LABELS: Record<string, string> = {
    ver: 'Ver',
    crear: 'Crear',
    editar: 'Editar',
    eliminar: 'Eliminar',
};

export function RolDrawer({ rol, permisos, onSuccess, children, open: openProp, onOpenChange: onOpenChangeProp }: Props) {
    const isMobile = useIsMobile();
    const [openInternal, setOpenInternal] = React.useState(false);
    const open = openProp !== undefined ? openProp : openInternal;
    const setOpen = onOpenChangeProp ?? setOpenInternal;
    const [feedback, setFeedback] = React.useState<FeedbackState | null>(null);
    const esEdicion = !!rol;

    const permisosIniciales = rol?.permissions?.map(p => p.id) ?? [];

    const { register, handleSubmit, control, reset, watch, setValue, formState: { errors, isSubmitting } } =
        useForm<RolFormData>({
            resolver: zodResolver(rolSchema),
            defaultValues: {
                name: rol?.name ?? '',
                permissions: permisosIniciales,
            },
        });

    // Reset al abrir/cerrar
    React.useEffect(() => {
        if (open) {
            reset({
                name: rol?.name ?? '',
                permissions: rol?.permissions?.map(p => p.id) ?? [],
            });
            setFeedback(null);
        }
    }, [open, rol, reset]);

    const permisosSeleccionados = watch('permissions');
    const grupos = React.useMemo(() => agruparPermisos(permisos), [permisos]);

    function togglePermiso(id: number, current: number[]) {
        return current.includes(id)
            ? current.filter(p => p !== id)
            : [...current, id];
    }

    function toggleGrupo(ids: number[], current: number[]) {
        const todosSeleccionados = ids.every(id => current.includes(id));
        return todosSeleccionados
            ? current.filter(id => !ids.includes(id))
            : [...new Set([...current, ...ids])];
    }

    const onSubmit = handleSubmit(async (values) => {
        setFeedback(null);
        try {
            const resultado = esEdicion
                ? await rolService.update(rol!.id, values)
                : await rolService.store(values);

            setFeedback({
                type: 'success',
                message: esEdicion
                    ? `Rol "${resultado.name}" actualizado correctamente.`
                    : `Rol "${resultado.name}" creado correctamente.`,
            });
            onSuccess(resultado);
            if (!esEdicion) {
                reset({ name: '', permissions: [] });
            }
        } catch (error: unknown) {
            const err = error as { errors?: Record<string, string[]>; message?: string };
            setFeedback({
                type: 'error',
                message: err?.message ?? 'Error al guardar el rol.',
                details: err?.errors ? Object.values(err.errors).flat() : undefined,
            });
        }
    });

    return (
        <Drawer open={open} onOpenChange={setOpen} direction={isMobile ? 'bottom' : 'right'}>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle className="flex items-center gap-2">
                        <IconShield className="size-4" />
                        {esEdicion ? `Editar rol: ${rol!.name}` : 'Nuevo rol'}
                    </DrawerTitle>
                    <DrawerDescription>
                        {esEdicion
                            ? 'Modifica el nombre y los permisos del rol.'
                            : 'Define un nombre y asigna los permisos del nuevo rol.'}
                    </DrawerDescription>
                </DrawerHeader>

                <form onSubmit={onSubmit} className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    {/* Nombre */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="rol-name">Nombre del rol *</Label>
                        <Input
                            id="rol-name"
                            placeholder="Ej: supervisor, cajero..."
                            {...register('name')}
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    <Separator />

                    {/* Permisos agrupados */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-1.5">
                                <IconLock className="size-3.5" />
                                Permisos *
                            </Label>
                            <Badge variant="secondary" className="text-xs">
                                {permisosSeleccionados.length} seleccionados
                            </Badge>
                        </div>
                        {errors.permissions && (
                            <p className="text-xs text-destructive">{errors.permissions.message}</p>
                        )}
                    </div>

                    <Controller
                        name="permissions"
                        control={control}
                        render={({ field }) => (
                            <div className="flex flex-col gap-3">
                                {Object.entries(grupos).map(([categoria, perms]) => {
                                    const ids = perms.map(p => p.id);
                                    const todosCheck = ids.every(id => field.value.includes(id));
                                    const algunoCheck = ids.some(id => field.value.includes(id));

                                    return (
                                        <div key={categoria} className="rounded-lg border bg-muted/20 p-3 space-y-2">
                                            {/* Header categoría */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground capitalize">
                                                    {categoria}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange(toggleGrupo(ids, field.value))}
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    {todosCheck ? 'Quitar todos' : 'Seleccionar todos'}
                                                </button>
                                            </div>

                                            {/* Checkboxes de acciones */}
                                            <div className="grid grid-cols-2 gap-2">
                                                {perms.map(permiso => {
                                                    const accion = permiso.name.split(' ')[0];
                                                    const checked = field.value.includes(permiso.id);
                                                    return (
                                                        <div key={permiso.id} className="flex items-center gap-2">
                                                            <Checkbox
                                                                id={`perm-${permiso.id}`}
                                                                checked={checked}
                                                                onCheckedChange={(val) => {
                                                                    const next = val
                                                                        ? [...field.value, permiso.id]
                                                                        : field.value.filter(id => id !== permiso.id);
                                                                    field.onChange(next);
                                                                }}
                                                            />
                                                            <Label
                                                                htmlFor={`perm-${permiso.id}`}
                                                                className="cursor-pointer text-xs font-normal"
                                                            >
                                                                {ACCION_LABELS[accion] ?? accion}
                                                            </Label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    />

                    {/* Feedback */}
                    {feedback && (
                        <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
                            {feedback.type === 'error'
                                ? <IconAlertCircle className="size-4" />
                                : <IconCircleCheck className="size-4" />
                            }
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
                </form>

                <DrawerFooter className="flex-row gap-2">
                    <Button
                        type="submit"
                        className="flex-1"
                        disabled={isSubmitting}
                        onClick={onSubmit}
                    >
                        {isSubmitting
                            ? <><IconLoader className="size-4 animate-spin" /> Guardando...</>
                            : esEdicion ? 'Guardar cambios' : 'Crear rol'
                        }
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}