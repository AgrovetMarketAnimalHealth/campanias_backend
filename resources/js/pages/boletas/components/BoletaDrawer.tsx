"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Drawer, DrawerClose, DrawerContent, DrawerDescription,
    DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { EstadoBadge } from './EstadoBadge';
import { boletaService } from '../services/boleta.service';
import { aceptarBoletaSchema, rechazarBoletaSchema } from '../schemas/boleta.schemas';
import type { AceptarBoletaForm, RechazarBoletaForm } from '../schemas/boleta.schemas';
import type { Boleta } from '../types/boleta.types';
import {
    IconUser, IconId, IconCalendar, IconFileText, IconPhoto,
    IconCircleCheckFilled, IconXboxX, IconReceipt, IconCurrencyDollar,
    IconAlertCircle, IconCircleCheck,
} from '@tabler/icons-react';

interface Props {
    boleta: Boleta;
    onUpdated: (boleta: Boleta) => void;
    children: React.ReactNode;
}

interface ServerValidationError {
    errors?: Record<string, string[]>;
    message?: string;
}

interface FeedbackState {
    type: 'success' | 'error';
    message: string;
    details?: string[];
}

export function BoletaDrawer({ boleta, onUpdated, children }: Props) {
    const isMobile = useIsMobile();
    const [open, setOpen] = React.useState(false);
    const [accion, setAccion] = React.useState<'aceptar' | 'rechazar' | null>(null);
    const [loadingImg, setLoadingImg] = React.useState(true);
    const [feedback, setFeedback] = React.useState<FeedbackState | null>(null);
    const esPendiente = boleta.estado === 'pendiente';

    const isPdf = (url: string) =>
        /\.pdf(\?.*)?$/i.test(url) || url.includes('/pdf');

    // Limpia el feedback al cambiar de acción
    React.useEffect(() => { setFeedback(null); }, [accion]);

    function buildErrorDetails(errors: Record<string, string[]>): string[] {
        return Object.values(errors).flat();
    }

    const aceptarForm = useForm<AceptarBoletaForm>({
        resolver: zodResolver(aceptarBoletaSchema),
        defaultValues: { numero_boleta: '', monto: undefined, puntos: undefined, observacion: '' },
    });

    const rechazarForm = useForm<RechazarBoletaForm>({
        resolver: zodResolver(rechazarBoletaSchema),
        defaultValues: { numero_boleta: '', monto: undefined, observacion: '' },
    });

    const handleAceptar = aceptarForm.handleSubmit(async (values) => {
        setFeedback(null);
        try {
            const updated = await boletaService.update(boleta.id, {
                estado: 'aceptada',
                numero_boleta: values.numero_boleta,
                monto: values.monto,
                puntos: values.puntos,
                observacion: values.observacion,
            });
            setFeedback({ type: 'success', message: `Boleta ${boleta.codigo} aceptada correctamente.` });
            onUpdated(updated);
        } catch (error) {
            const err = error as ServerValidationError;
            setFeedback({
                type: 'error',
                message: err?.message ?? 'Error al aceptar la boleta.',
                details: err?.errors ? buildErrorDetails(err.errors) : undefined,
            });
        }
    });

    const handleRechazar = rechazarForm.handleSubmit(async (values) => {
        setFeedback(null);
        try {
            const updated = await boletaService.update(boleta.id, {
                estado: 'rechazada',
                numero_boleta: values.numero_boleta,
                monto: values.monto,
                observacion: values.observacion,
            });
            setFeedback({ type: 'success', message: `Boleta ${boleta.codigo} marcada como rechazada.` });
            onUpdated(updated);
        } catch (error) {
            const err = error as ServerValidationError;
            setFeedback({
                type: 'error',
                message: err?.message ?? 'Error al rechazar la boleta.',
                details: err?.errors ? buildErrorDetails(err.errors) : undefined,
            });
        }
    });

    // Bloque de Alert reutilizable
    const FeedbackAlert = feedback ? (
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
    ) : null;

    return (
        <Drawer open={open} onOpenChange={setOpen} direction={isMobile ? 'bottom' : 'right'}>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle className="flex items-center gap-2">
                        <IconFileText className="size-4" />
                        {boleta.codigo}
                    </DrawerTitle>
                    <DrawerDescription className="flex items-center gap-2">
                        <EstadoBadge estado={boleta.estado} />
                        <span className="text-xs text-muted-foreground">{boleta.created_at}</span>
                    </DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    {/* Info cliente */}
                    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                        <div className="flex items-center gap-2 font-medium text-xs uppercase text-muted-foreground tracking-wide">
                            <IconUser className="size-3" /> Cliente
                        </div>
                        <p className="font-semibold">{boleta.cliente_nom}</p>
                        <div className="flex gap-3 flex-wrap">
                            {boleta.cliente_dni && (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                    <IconId className="size-3" /> DNI: {boleta.cliente_dni}
                                </Badge>
                            )}
                            {boleta.cliente_ruc && (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                    <IconId className="size-3" /> RUC: {boleta.cliente_ruc}
                                </Badge>
                            )}
                            <Badge variant="outline" className="text-xs capitalize">
                                {boleta.cliente_tipo}
                            </Badge>
                        </div>
                    </div>

                    {/* Info boleta procesada */}
                    {!esPendiente && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <IconReceipt className="size-3" /> N° Comprobante
                                </p>
                                <p className="font-semibold font-mono text-sm">{boleta.numero_boleta || '—'}</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <IconCurrencyDollar className="size-3" /> Monto
                                </p>
                                <p className="font-semibold text-sm">
                                    {boleta.monto && boleta.monto > 0
                                        ? `S/ ${Number(boleta.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
                                        : '—'}
                                </p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground mb-1">Puntos otorgados</p>
                                <p className="font-semibold text-lg">
                                    {boleta.puntos_otorgados && boleta.puntos_otorgados > 0 ? boleta.puntos_otorgados : '—'}
                                </p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <IconCalendar className="size-3" /> Fecha
                                </p>
                                <p className="font-medium text-xs">{boleta.created_at}</p>
                            </div>
                        </div>
                    )}

                    {/* Observación */}
                    {!esPendiente && boleta.observacion && boleta.observacion !== '-' && (
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground mb-1">Observación</p>
                            <p className="text-sm">{boleta.observacion}</p>
                        </div>
                    )}

                    <Separator />

                    {/* Comprobante (imagen o PDF) */}
                    {boleta.archivo ? (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground flex items-center gap-1 uppercase tracking-wide font-medium">
                                <IconPhoto className="size-3" /> Comprobante
                            </p>
                            <div className="relative rounded-lg overflow-hidden border bg-muted/20 min-h-[200px] flex items-center justify-center">
                                {isPdf(boleta.archivo) ? (
                                    <iframe
                                        src={boleta.archivo}
                                        title="Comprobante PDF"
                                        className="w-full rounded-lg"
                                        style={{ height: 420, border: 'none' }}
                                    />
                                ) : (
                                    <>
                                        {loadingImg && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                            </div>
                                        )}
                                        <img
                                            src={boleta.archivo}
                                            alt="Comprobante"
                                            className="w-full object-contain max-h-[400px] rounded-lg"
                                            onLoad={() => setLoadingImg(false)}
                                            onError={() => setLoadingImg(false)}
                                        />
                                    </>
                                )}
                            </div>
                            <a
                                href={boleta.archivo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary underline underline-offset-2 inline-block"
                            >
                                {isPdf(boleta.archivo) ? 'Abrir PDF en nueva pestaña' : 'Abrir en nueva pestaña'}
                            </a>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm">
                            Sin imagen adjunta
                        </div>
                    )}

                    {/* Formularios solo si está pendiente */}
                    {esPendiente && (
                        <>
                            <Separator />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={accion === 'aceptar' ? 'default' : 'outline'}
                                    className="gap-1 flex-1"
                                    onClick={() => setAccion(accion === 'aceptar' ? null : 'aceptar')}
                                >
                                    <IconCircleCheckFilled className="size-4" />
                                    Aceptar
                                </Button>
                                <Button
                                    size="sm"
                                    variant={accion === 'rechazar' ? 'destructive' : 'outline'}
                                    className="gap-1 flex-1"
                                    onClick={() => setAccion(accion === 'rechazar' ? null : 'rechazar')}
                                >
                                    <IconXboxX className="size-4" />
                                    Rechazar
                                </Button>
                            </div>

                            {/* FORM ACEPTAR */}
                            {accion === 'aceptar' && (
                                <form
                                    onSubmit={handleAceptar}
                                    className="flex flex-col gap-3 rounded-lg border border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900 p-3"
                                >
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="numero_boleta_a">N° Comprobante *</Label>
                                            <Input
                                                id="numero_boleta_a"
                                                placeholder="Ej: F001-00012345"
                                                {...aceptarForm.register('numero_boleta')}
                                            />
                                            {aceptarForm.formState.errors.numero_boleta && (
                                                <p className="text-xs text-destructive">
                                                    {aceptarForm.formState.errors.numero_boleta.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="monto_a">Monto (S/) *</Label>
                                            <Input
                                                id="monto_a"
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                placeholder="Ej: 1500.00"
                                                {...aceptarForm.register('monto', { valueAsNumber: true })}
                                            />
                                            {aceptarForm.formState.errors.monto && (
                                                <p className="text-xs text-destructive">
                                                    {aceptarForm.formState.errors.monto.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="puntos_a">Puntos a otorgar *</Label>
                                        <Input
                                            id="puntos_a"
                                            type="number"
                                            step="1"
                                            min="1"
                                            placeholder="Ej: 3"
                                            {...aceptarForm.register('puntos', { valueAsNumber: true })}
                                        />
                                        {aceptarForm.formState.errors.puntos && (
                                            <p className="text-xs text-destructive">
                                                {aceptarForm.formState.errors.puntos.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="obs-aceptar">Observación (opcional)</Label>
                                        <Textarea
                                            id="obs-aceptar"
                                            rows={2}
                                            placeholder="Comentario adicional..."
                                            {...aceptarForm.register('observacion')}
                                        />
                                    </div>

                                    {FeedbackAlert}

                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="w-full"
                                        disabled={aceptarForm.formState.isSubmitting}
                                    >
                                        {aceptarForm.formState.isSubmitting ? 'Procesando...' : 'Confirmar aceptación'}
                                    </Button>
                                </form>
                            )}

                            {/* FORM RECHAZAR */}
                            {accion === 'rechazar' && (
                                <form
                                    onSubmit={handleRechazar}
                                    className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900 p-3"
                                >
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="numero_boleta_r">N° Comprobante *</Label>
                                            <Input
                                                id="numero_boleta_r"
                                                placeholder="Ej: F001-00012345"
                                                {...rechazarForm.register('numero_boleta')}
                                            />
                                            {rechazarForm.formState.errors.numero_boleta && (
                                                <p className="text-xs text-destructive">
                                                    {rechazarForm.formState.errors.numero_boleta.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="monto_r">Monto (S/) *</Label>
                                            <Input
                                                id="monto_r"
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                placeholder="Ej: 1500.00"
                                                {...rechazarForm.register('monto', { valueAsNumber: true })}
                                            />
                                            {rechazarForm.formState.errors.monto && (
                                                <p className="text-xs text-destructive">
                                                    {rechazarForm.formState.errors.monto.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="obs-rechazar">Motivo del rechazo *</Label>
                                        <Textarea
                                            id="obs-rechazar"
                                            rows={3}
                                            placeholder="Explica el motivo del rechazo..."
                                            {...rechazarForm.register('observacion')}
                                        />
                                        {rechazarForm.formState.errors.observacion && (
                                            <p className="text-xs text-destructive">
                                                {rechazarForm.formState.errors.observacion.message}
                                            </p>
                                        )}
                                    </div>

                                    {FeedbackAlert}

                                    <Button
                                        type="submit"
                                        size="sm"
                                        variant="destructive"
                                        className="w-full"
                                        disabled={rechazarForm.formState.isSubmitting}
                                    >
                                        {rechazarForm.formState.isSubmitting ? 'Procesando...' : 'Confirmar rechazo'}
                                    </Button>
                                </form>
                            )}
                        </>
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