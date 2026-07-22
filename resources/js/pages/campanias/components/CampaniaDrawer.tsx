"use client";

import * as React from 'react';
import { useForm, useController } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Drawer, DrawerClose, DrawerContent, DrawerDescription,
    DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    IconBroadcast, IconLink, IconCalendar, IconClock,
    IconAlertCircle, IconCircleCheck, IconPencil, IconPlus,
    IconTrash, IconCoin,
} from '@tabler/icons-react';
import { ActivaBadge } from './ActivaBadge';
import { CampaniaDeleteDialog } from './CampaniaDeleteDialog';
import { campaniaService } from '../services/campania.service';
import { crearCampaniaSchema, editarCampaniaSchema } from '../schemas/campania.schemas';
import type { CrearCampaniaForm, EditarCampaniaForm } from '../schemas/campania.schemas';
import type { Campania } from '../types/campania.types';

interface ServerValidationError {
    errors?: Record<string, string[]>;
    message?: string;
}

interface FeedbackState {
    type: 'success' | 'error';
    message: string;
    details?: string[];
}

function buildErrorDetails(errors: Record<string, string[]>): string[] {
    return Object.values(errors).flat();
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
}

function FeedbackAlert({ feedback }: { feedback: FeedbackState }) {
    return (
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
    );
}

function toSlug(value: string) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s\-/]/g, '')   // ← permite también "/"
        .replace(/\s+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/\/{2,}/g, '/');          // ← colapsa "//" en "/"
}

// ─── Ver / Editar detalle ─────────────────────────────────────────────────────

interface ViewProps {
    campania: Campania;
    onUpdated: (campania: Campania) => void;
    onDeleted?: (id: string) => void;
    children: React.ReactNode;
}

export function CampaniaDrawer({ campania, onUpdated, onDeleted, children }: ViewProps) {
    const isMobile = useIsMobile();
    const [open, setOpen] = React.useState(false);
    const [modo, setModo] = React.useState<'ver' | 'editar'>('ver');

    React.useEffect(() => {
        if (!open) setModo('ver');
    }, [open]);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('es-PE', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    return (
        <Drawer open={open} onOpenChange={setOpen} direction={isMobile ? 'bottom' : 'right'}>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle className="flex items-center gap-2">
                        <IconBroadcast className="size-4" />
                        {campania.nombre}
                    </DrawerTitle>
                    <DrawerDescription className="flex items-center gap-2">
                        <ActivaBadge activa={campania.activa} />
                        <span className="text-xs text-muted-foreground">/{campania.url}</span>
                    </DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    {modo === 'ver' ? (
                        <>
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <IconLink className="size-3" /> Identificador
                                </p>
                                <p className="font-mono text-sm font-medium">/{campania.url}</p>
                            </div>

                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <IconCoin className="size-3" /> Valor mínimo
                                </p>
                                <p className="text-sm font-medium">{formatCurrency(campania.valor_minimo)}</p>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 gap-3">
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                        <IconCalendar className="size-3" /> Creada
                                    </p>
                                    <p className="text-sm font-medium">{formatDate(campania.created_at)}</p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                        <IconClock className="size-3" /> Última actualización
                                    </p>
                                    <p className="text-sm font-medium">{formatDate(campania.updated_at)}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 gap-1.5"
                                    onClick={() => setModo('editar')}
                                >
                                    <IconPencil className="size-3.5" />
                                    Editar
                                </Button>
                                {onDeleted && (
                                    <CampaniaDeleteDialog
                                        campania={campania}
                                        onDeleted={(id) => { onDeleted(id); setOpen(false); }}
                                    >
                                        <Button size="sm" variant="destructive" className="flex-1 gap-1.5">
                                            <IconTrash className="size-3.5" />
                                            Eliminar
                                        </Button>
                                    </CampaniaDeleteDialog>
                                )}
                            </div>
                        </>
                    ) : (
                        <EditarForm
                            campania={campania}
                            onUpdated={(updated) => { onUpdated(updated); setModo('ver'); }}
                            onCancel={() => setModo('ver')}
                        />
                    )}
                </div>

                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">Cerrar</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

// ─── Formulario editar ────────────────────────────────────────────────────────

function EditarForm({
    campania,
    onUpdated,
    onCancel,
}: {
    campania: Campania;
    onUpdated: (c: Campania) => void;
    onCancel: () => void;
}) {
    const [feedback, setFeedback] = React.useState<FeedbackState | null>(null);

    const form = useForm<EditarCampaniaForm>({
        resolver: zodResolver(editarCampaniaSchema),
        defaultValues: {
            nombre: campania.nombre,
            url: campania.url,
            valor_minimo: campania.valor_minimo,
            activa: campania.activa,
        },
    });

    const handleSubmit = form.handleSubmit(
        async (values) => {
            setFeedback(null);
            try {
                const updated = await campaniaService.update(campania.id, values);
                setFeedback({ type: 'success', message: `Campaña "${updated.nombre}" actualizada.` });
                onUpdated(updated);
            } catch (error) {
                const err = error as ServerValidationError;
                setFeedback({
                    type: 'error',
                    message: err?.message ?? 'Error al actualizar la campaña.',
                    details: err?.errors ? buildErrorDetails(err.errors) : undefined,
                });
            }
        },
        (validationErrors) => {
            // Se dispara cuando el formulario NO pasa la validación de Zod.
            setFeedback({
                type: 'error',
                message: 'Revisa los campos marcados en rojo.',
                details: Object.values(validationErrors)
                    .map((e) => e?.message)
                    .filter((m): m is string => !!m),
            });
        }
    );

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <CampaniaFormFields form={form} />
            {feedback && <FeedbackAlert feedback={feedback} />}
            <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" className="flex-1" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" size="sm" className="flex-1" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </Button>
            </div>
        </form>
    );
}

// ─── Crear campaña (drawer) ───────────────────────────────────────────────────

interface CreateProps {
    onCreated: (campania: Campania) => void;
    children: React.ReactNode;
}

export function CampaniaCreateDrawer({ onCreated, children }: CreateProps) {
    const isMobile = useIsMobile();
    const [open, setOpen] = React.useState(false);
    const [feedback, setFeedback] = React.useState<FeedbackState | null>(null);

    const form = useForm<CrearCampaniaForm>({
        resolver: zodResolver(crearCampaniaSchema),
        defaultValues: { nombre: '', url: '', valor_minimo: 0, activa: true },
    });

    React.useEffect(() => {
        if (!open) {
            form.reset();
            setFeedback(null);
        }
    }, [open, form]);

    const handleSubmit = form.handleSubmit(
        async (values) => {
            setFeedback(null);
            try {
                const created = await campaniaService.store(values);
                setFeedback({ type: 'success', message: `Campaña "${created.nombre}" creada correctamente.` });
                onCreated(created);
                setTimeout(() => setOpen(false), 1200);
            } catch (error) {
                const err = error as ServerValidationError;
                setFeedback({
                    type: 'error',
                    message: err?.message ?? 'Error al crear la campaña.',
                    details: err?.errors ? buildErrorDetails(err.errors) : undefined,
                });
            }
        },
        (validationErrors) => {
            setFeedback({
                type: 'error',
                message: 'Revisa los campos marcados en rojo.',
                details: Object.values(validationErrors)
                    .map((e) => e?.message)
                    .filter((m): m is string => !!m),
            });
        }
    );

    return (
        <Drawer open={open} onOpenChange={setOpen} direction={isMobile ? 'bottom' : 'right'}>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle className="flex items-center gap-2">
                        <IconPlus className="size-4" />
                        Nueva campaña
                    </DrawerTitle>
                    <DrawerDescription>
                        Completa los datos para registrar una nueva campaña.
                    </DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-col gap-4 overflow-y-auto px-4">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <CampaniaFormFields form={form} />
                        {feedback && <FeedbackAlert feedback={feedback} />}
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Guardando...' : 'Crear campaña'}
                        </Button>
                    </form>
                </div>

                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

// ─── Campos compartidos ───────────────────────────────────────────────────────

type AnyForm =
    | ReturnType<typeof useForm<CrearCampaniaForm>>
    | ReturnType<typeof useForm<EditarCampaniaForm>>;

function CampaniaFormFields({ form }: { form: AnyForm }) {
    const f = form as ReturnType<typeof useForm<CrearCampaniaForm>>;
    const errors = f.formState.errors;

    return (
        <>
            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                    id="nombre"
                    placeholder="Ej: Campaña Verano 2025"
                    {...f.register('nombre')}
                />
                {errors.nombre && (
                    <p className="text-xs text-destructive">{errors.nombre.message}</p>
                )}
            </div>

            {/* Identificador slug */}
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="url">Identificador *</Label>
                <div className="flex items-center rounded-md border focus-within:ring-2 focus-within:ring-ring overflow-hidden">
                    <span className="px-3 py-2 text-sm text-muted-foreground bg-muted border-r select-none">
                        /
                    </span>
                    <input
                        id="url"
                        placeholder="suralan-sorteo"
                        className="flex-1 bg-transparent px-3 py-2 text-sm font-mono outline-none placeholder:text-muted-foreground"
                        {...f.register('url')}
                        onChange={(e) => {
                            f.setValue('url', toSlug(e.target.value), { shouldValidate: true, shouldDirty: true });
                        }}
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    Solo minúsculas, números y guiones. Ej: <code className="bg-muted px-1 rounded">suralan-sorteo</code>
                </p>
                {errors.url && (
                    <p className="text-xs text-destructive">{errors.url.message}</p>
                )}
            </div>

            {/* Valor mínimo */}
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="valor_minimo">Valor mínimo *</Label>
                <div className="flex items-center rounded-md border focus-within:ring-2 focus-within:ring-ring overflow-hidden">
                    <span className="px-3 py-2 text-sm text-muted-foreground bg-muted border-r select-none">
                        S/
                    </span>
                    <input
                        id="valor_minimo"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                        {...f.register('valor_minimo')}
                    />
                </div>
                {errors.valor_minimo && (
                    <p className="text-xs text-destructive">{errors.valor_minimo.message}</p>
                )}
            </div>

            {/* Activa — checkbox */}
            <ActivaCheckbox form={f} />
        </>
    );
}

function ActivaCheckbox({ form }: { form: ReturnType<typeof useForm<CrearCampaniaForm>> }) {
    const { field } = useController({ name: 'activa', control: form.control });

    return (
        <div className="flex items-start gap-3 rounded-lg border p-3">
            <Checkbox
                id="activa"
                checked={!!field.value}
                onCheckedChange={(val) => field.onChange(!!val)}
                className="mt-0.5"
            />
            <div className="flex flex-col gap-0.5">
                <Label htmlFor="activa" className="text-sm font-medium cursor-pointer leading-none">
                    Campaña activa
                </Label>
                <p className="text-xs text-muted-foreground">
                    Las campañas inactivas no reciben nuevas boletas.
                </p>
            </div>
        </div>
    );
}