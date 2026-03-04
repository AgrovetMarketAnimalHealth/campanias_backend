"use client";

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Drawer, DrawerClose, DrawerContent, DrawerDescription,
    DrawerFooter, DrawerHeader, DrawerTitle,
} from '@/components/ui/drawer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { usuarioService } from '../services/usuario.service';
import { storeUsuarioSchema, updateUsuarioSchema } from '../schemas/usuario.schemas';
import type { StoreUsuarioForm, UpdateUsuarioForm } from '../schemas/usuario.schemas';
import type { Usuario } from '../types/usuario.types';
import type { Rol } from '@/pages/roles/types/rol.types';
import {
    IconUser, IconAlertCircle, IconCircleCheck, IconLoader, IconMail, IconLock,
} from '@tabler/icons-react';

interface Props {
    usuario?: Usuario;
    roles: Rol[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (usuario: Usuario) => void;
}

interface FeedbackState {
    type: 'success' | 'error';
    message: string;
    details?: string[];
}

export function UsuarioDrawer({ usuario, roles, open, onOpenChange, onSuccess }: Props) {
    const isMobile = useIsMobile();
    const esEdicion = !!usuario;
    const [feedback, setFeedback] = React.useState<FeedbackState | null>(null);

    const schema = esEdicion ? updateUsuarioSchema : storeUsuarioSchema;

    const { register, handleSubmit, reset, control, setValue, watch, formState: { errors, isSubmitting } } =
        useForm<StoreUsuarioForm | UpdateUsuarioForm>({
            resolver: zodResolver(schema),
            defaultValues: {
                name:     usuario?.name ?? '',
                email:    usuario?.email ?? '',
                password: '',
                activo:   usuario?.activo ?? true,
                role_id:  usuario?.role_id ?? undefined,
            },
        });

    React.useEffect(() => {
        if (open) {
            reset({
                name:     usuario?.name ?? '',
                email:    usuario?.email ?? '',
                password: '',
                activo:   usuario?.activo ?? true,
                role_id:  usuario?.role_id ?? undefined,
            });
            setFeedback(null);
        }
    }, [open, usuario, reset]);

    const activoVal = watch('activo');

    const onSubmit = handleSubmit(async (values) => {
        setFeedback(null);
        try {
            const payload: Record<string, unknown> = { ...values };
            // En edición, no enviar password si está vacío
            if (esEdicion && !payload.password) delete payload.password;

            const resultado = esEdicion
                ? await usuarioService.update(usuario!.id, payload)
                : await usuarioService.store(payload);

            setFeedback({
                type: 'success',
                message: esEdicion
                    ? `Usuario "${resultado.name}" actualizado correctamente.`
                    : `Usuario "${resultado.name}" creado correctamente.`,
            });
            onSuccess(resultado);
            if (!esEdicion) reset({ name: '', email: '', password: '', activo: true, role_id: undefined });
        } catch (error: unknown) {
            const err = error as { errors?: Record<string, string[]>; message?: string };
            setFeedback({
                type: 'error',
                message: err?.message ?? 'Error al guardar el usuario.',
                details: err?.errors ? Object.values(err.errors).flat() : undefined,
            });
        }
    });

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction={isMobile ? 'bottom' : 'right'}>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle className="flex items-center gap-2">
                        <IconUser className="size-4" />
                        {esEdicion ? `Editar: ${usuario!.name}` : 'Nuevo usuario'}
                    </DrawerTitle>
                    <DrawerDescription>
                        {esEdicion
                            ? 'Modifica los datos del usuario. Deja la contraseña vacía para no cambiarla.'
                            : 'Completa los datos para crear un nuevo usuario.'}
                    </DrawerDescription>
                </DrawerHeader>

                <form onSubmit={onSubmit} className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    {/* Nombre */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="u-name">Nombre completo *</Label>
                        <Input id="u-name" placeholder="Ej: Juan Pérez" {...register('name')} />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="u-email" className="flex items-center gap-1.5">
                            <IconMail className="size-3.5" /> Correo electrónico *
                        </Label>
                        <Input id="u-email" type="email" placeholder="correo@ejemplo.com" {...register('email')} />
                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="u-password" className="flex items-center gap-1.5">
                            <IconLock className="size-3.5" />
                            {esEdicion ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
                        </Label>
                        <Input
                            id="u-password"
                            type="password"
                            placeholder={esEdicion ? 'Dejar vacío para no cambiar' : 'Mínimo 8 caracteres'}
                            {...register('password')}
                        />
                        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                    </div>

                    <Separator />

                    {/* Rol */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="u-role">Rol *</Label>
                        <Controller
                            name="role_id"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value ? String(field.value) : ''}
                                    onValueChange={val => field.onChange(Number(val))}
                                >
                                    <SelectTrigger id="u-role">
                                        <SelectValue placeholder="Seleccionar rol..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map(r => (
                                            <SelectItem key={r.id} value={String(r.id)}>
                                                <span className="capitalize">{r.name}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.role_id && <p className="text-xs text-destructive">{errors.role_id.message}</p>}
                    </div>

                    {/* Activo */}
                    <div className="flex items-center gap-2.5 rounded-lg border p-3">
                        <Checkbox
                            id="u-activo"
                            checked={activoVal}
                            onCheckedChange={val => setValue('activo', !!val, { shouldValidate: true })}
                        />
                        <div className="flex flex-col gap-0.5">
                            <Label htmlFor="u-activo" className="cursor-pointer font-medium">
                                Usuario activo
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Los usuarios inactivos no pueden iniciar sesión.
                            </p>
                        </div>
                    </div>

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
                    <Button type="submit" className="flex-1" disabled={isSubmitting} onClick={onSubmit}>
                        {isSubmitting
                            ? <><IconLoader className="size-4 animate-spin mr-1" /> Guardando...</>
                            : esEdicion ? 'Guardar cambios' : 'Crear usuario'
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