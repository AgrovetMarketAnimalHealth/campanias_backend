"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog, DialogClose, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    IconAlertCircle, IconCircleCheck, IconBroadcast,
    IconLink, IconPencil, IconPlus,
} from '@tabler/icons-react';
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

// ─── Modo Crear ──────────────────────────────────────────────────────────────

interface CreateProps {
    onCreated: (campania: Campania) => void;
    children: React.ReactNode;
}

export function CampaniaCreateDialog({ onCreated, children }: CreateProps) {
    const [open, setOpen] = React.useState(false);
    const [feedback, setFeedback] = React.useState<FeedbackState | null>(null);

    const form = useForm<CrearCampaniaForm>({
        resolver: zodResolver(crearCampaniaSchema),
        defaultValues: { nombre: '', url: '', activa: true },
    });

    React.useEffect(() => {
        if (!open) {
            form.reset();
            setFeedback(null);
        }
    }, [open, form]);

    const handleSubmit = form.handleSubmit(async (values) => {
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
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconPlus className="size-4" />
                        Nueva campaña
                    </DialogTitle>
                    <DialogDescription>
                        Completa los datos para registrar una nueva campaña.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
                    <CampaniaFormFields form={form} />
                    {feedback && <FeedbackAlert feedback={feedback} />}
                    <DialogFooter className="gap-2 pt-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Guardando...' : 'Crear campaña'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Modo Editar ─────────────────────────────────────────────────────────────

interface EditProps {
    campania: Campania;
    onUpdated: (campania: Campania) => void;
    children: React.ReactNode;
}

export function CampaniaEditDialog({ campania, onUpdated, children }: EditProps) {
    const [open, setOpen] = React.useState(false);
    const [feedback, setFeedback] = React.useState<FeedbackState | null>(null);

    const form = useForm<EditarCampaniaForm>({
        resolver: zodResolver(editarCampaniaSchema),
        defaultValues: {
            nombre: campania.nombre,
            url: campania.url,
            activa: campania.activa,
        },
    });

    React.useEffect(() => {
        if (open) {
            form.reset({ nombre: campania.nombre, url: campania.url, activa: campania.activa });
            setFeedback(null);
        }
    }, [open, campania, form]);

    const handleSubmit = form.handleSubmit(async (values) => {
        setFeedback(null);
        try {
            const updated = await campaniaService.update(campania.id, values);
            setFeedback({ type: 'success', message: `Campaña "${updated.nombre}" actualizada.` });
            onUpdated(updated);
            setTimeout(() => setOpen(false), 1200);
        } catch (error) {
            const err = error as ServerValidationError;
            setFeedback({
                type: 'error',
                message: err?.message ?? 'Error al actualizar la campaña.',
                details: err?.errors ? buildErrorDetails(err.errors) : undefined,
            });
        }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconPencil className="size-4" />
                        Editar campaña
                    </DialogTitle>
                    <DialogDescription>
                        Modifica los datos de <span className="font-medium">{campania.nombre}</span>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
                    <CampaniaFormFields form={form} />
                    {feedback && <FeedbackAlert feedback={feedback} />}
                    <DialogFooter className="gap-2 pt-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Campos compartidos ───────────────────────────────────────────────────────

type AnyForm =
    | ReturnType<typeof useForm<CrearCampaniaForm>>
    | ReturnType<typeof useForm<EditarCampaniaForm>>;

function toSlug(value: string) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')   // quitar tildes
        .replace(/[^a-z0-9\s-]/g, '')      // solo letras, números, espacios y guión
        .replace(/\s+/g, '-')              // espacios → guión
        .replace(/-{2,}/g, '-');           // guiones dobles → uno
}

function CampaniaFormFields({ form }: { form: AnyForm }) {
    const f = form as ReturnType<typeof useForm<CrearCampaniaForm>>;
    const errors = f.formState.errors;

    return (
        <>
            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre">
                    <IconBroadcast className="inline size-3.5 mr-1 text-muted-foreground" />
                    Nombre *
                </Label>
                <Input
                    id="nombre"
                    placeholder="Ej: Campaña Verano 2025"
                    {...f.register('nombre')}
                />
                {errors.nombre && (
                    <p className="text-xs text-destructive">{errors.nombre.message}</p>
                )}
            </div>

            {/* Identificador (slug) */}
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="url">
                    <IconLink className="inline size-3.5 mr-1 text-muted-foreground" />
                    Identificador *
                </Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none pointer-events-none">
                        /
                    </span>
                    <Input
                        id="url"
                        placeholder="suralan-sorteo"
                        className="pl-5 font-mono text-sm"
                        {...f.register('url')}
                        onChange={(e) => {
                            const slug = toSlug(e.target.value);
                            f.setValue('url', slug, { shouldValidate: true });
                        }}
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    Solo letras minúsculas, números y guiones. Ej: <code className="bg-muted px-1 rounded">suralan-sorteo</code>
                </p>
                {errors.url && (
                    <p className="text-xs text-destructive">{errors.url.message}</p>
                )}
            </div>

            {/* Activa */}
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                    <Label htmlFor="activa" className="text-sm font-medium cursor-pointer">
                        Campaña activa
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Las campañas inactivas no reciben nuevas boletas.
                    </p>
                </div>
                <Switch
                    id="activa"
                    checked={f.watch('activa')}
                    onCheckedChange={(val) => f.setValue('activa', val)}
                />
            </div>
        </>
    );
}

// ─── FeedbackAlert ────────────────────────────────────────────────────────────

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