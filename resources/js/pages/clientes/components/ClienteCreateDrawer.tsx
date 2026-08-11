"use client";

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { toast } from 'sonner'
import {
    Drawer, DrawerClose, DrawerContent, DrawerDescription,
    DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/use-mobile'
import {
    IconUpload, IconX, IconAlertCircle, IconUserPlus,
} from '@tabler/icons-react'
import { clienteSchema, clienteRegistroSchema, type ClienteRegistroFormValues } from '../schemas'
import { clienteService } from '../services/clienteService'
import type { Cliente, Campania } from '../types'

const PERU_DEPARTAMENTOS = [
    'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
    'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín',
    'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios',
    'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna',
    'Tumbes', 'Ucayali',
]

const FORM_ID = 'cliente-create-form'

interface ServerValidationError {
    errors?: Record<string, string[]>
    message?: string
}

interface FeedbackState {
    type: 'error'
    message: string
    details?: string[]
}

interface Props {
    campania: Campania | null
    onCreated: (cliente: Cliente) => void
    children: React.ReactNode
}

function Req() {
    return <span className="text-destructive">*</span>
}

function onlyDigits(value: string, maxLen: number) {
    return value.replace(/\D/g, '').slice(0, maxLen)
}

export function ClienteCreateDrawer({ campania, onCreated, children }: Props) {
    const isMobile = useIsMobile()
    const [open, setOpen] = React.useState(false)
    const [feedback, setFeedback] = React.useState<FeedbackState | null>(null)

    // Normaliza: si llega undefined en algún render, lo tratamos como null
    const campaniaSegura = campania ?? null

    const {
        control, register, handleSubmit, watch, reset, setError,
        formState: { errors, isSubmitting },
    } = useForm<ClienteRegistroFormValues>({
        resolver: zodResolver(clienteRegistroSchema),
        defaultValues: {
            tipo_persona: 'natural',
            nombre: '',
            apellidos: '',
            dni: '',
            ruc: '',
            departamento: '',
            email: '',
            telefono: '',
            archivo_comprobante: null,
        },
    })

    const tipoPersona = watch('tipo_persona')
    const archivo = watch('archivo_comprobante')

    React.useEffect(() => {
        if (open) {
            reset()
            setFeedback(null)
        }
    }, [open, reset])

    function buildErrorDetails(errs: Record<string, string[]>): string[] {
        return Object.values(errs).flat()
    }

    const onSubmit = handleSubmit(async (values) => {
        if (!campaniaSegura) {
            setFeedback({ type: 'error', message: 'Selecciona una campaña activa antes de registrar.' })
            return
        }
        setFeedback(null)
        try {
            const res = await clienteService.registrarCliente({
                campania_id: campaniaSegura.id,
                tipo_persona: values.tipo_persona,
                nombre: values.nombre,
                apellidos: values.tipo_persona === 'natural' ? values.apellidos : undefined,
                dni: values.tipo_persona === 'natural' ? values.dni : undefined,
                ruc: values.tipo_persona === 'juridica' ? values.ruc : undefined,
                departamento: values.departamento,
                email: values.email,
                telefono: values.telefono,
                archivo_comprobante: values.archivo_comprobante,
            })

            const cliente = clienteSchema.parse(res.data.cliente)
            onCreated(cliente)
            toast.success(res.message ?? 'Cliente registrado correctamente.')
            setOpen(false)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status
                const data = error.response?.data as ServerValidationError | undefined

                if (status === 422 && data?.errors) {
                    Object.entries(data.errors).forEach(([field, messages]) => {
                        setError(field as keyof ClienteRegistroFormValues, { message: messages[0] })
                    })
                    setFeedback({
                        type: 'error',
                        message: 'Revisa los campos marcados en rojo.',
                        details: buildErrorDetails(data.errors),
                    })
                    return
                }

                const msg = data?.message ?? 'No se pudo registrar el cliente.'
                setFeedback({ type: 'error', message: msg })
                toast.error(msg)
                return
            }
            setFeedback({ type: 'error', message: 'Ocurrió un error inesperado.' })
            toast.error('Ocurrió un error inesperado.')
        }
    })

    const FeedbackAlert = feedback ? (
        <Alert variant="destructive">
            <IconAlertCircle className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                <p>{feedback.message}</p>
                {feedback.details && feedback.details.length > 0 && (
                    <ul className="mt-1 list-disc pl-4 space-y-0.5">
                        {feedback.details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                )}
            </AlertDescription>
        </Alert>
    ) : null

    return (
        <Drawer open={open} onOpenChange={setOpen} direction={isMobile ? 'bottom' : 'right'}>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent className={!isMobile ? 'w-[500px] max-w-[90vw] right-0 h-full' : ''}>
                <DrawerHeader className="gap-1">
                    <DrawerTitle className="flex items-center gap-2">
                        <IconUserPlus className="size-4" />
                        {campaniaSegura ? campaniaSegura.nombre : 'Nueva campaña'} - {tipoPersona === 'juridica' ? 'jurídico' : 'natural'}
                    </DrawerTitle>
                    <DrawerDescription>
                        {campaniaSegura ? (
                            <>
                                Se registrará en la campaña{' '}
                                <strong className="font-semibold text-foreground">
                                    {campaniaSegura.nombre}
                                </strong>.
                            </>
                        ) : (
                            'Selecciona una campaña activa en el listado antes de registrar.'
                        )}
                    </DrawerDescription>
                </DrawerHeader>

                <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4 overflow-y-auto px-4 text-sm pb-4">
                    {/* Tipo de persona */}
                    <div className="flex flex-col gap-1.5">
                        <Label>Tipo de cliente</Label>
                        <Controller
                            control={control}
                            name="tipo_persona"
                            render={({ field }) => (
                                <div className="flex items-center gap-1 rounded-lg border bg-muted p-1 w-fit">
                                    {(['natural', 'juridica'] as const).map((tipo) => (
                                        <button
                                            key={tipo}
                                            type="button"
                                            onClick={() => field.onChange(tipo)}
                                            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-all ${
                                                field.value === tipo
                                                    ? 'bg-background shadow-sm text-foreground'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {tipo === 'natural' ? 'Natural' : 'Jurídica'}
                                        </button>
                                    ))}
                                </div>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5 col-span-2">
                            <Label htmlFor="nombre">
                                {tipoPersona === 'juridica' ? 'Razón social' : 'Nombres'} <Req />
                            </Label>
                            <Input id="nombre" {...register('nombre')} />
                            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
                        </div>

                        {tipoPersona === 'natural' && (
                            <>
                                <div className="flex flex-col gap-1.5 col-span-2">
                                    <Label htmlFor="apellidos">Apellidos <Req /></Label>
                                    <Input id="apellidos" {...register('apellidos')} />
                                    {errors.apellidos && (
                                        <p className="text-xs text-destructive">{errors.apellidos.message}</p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5 col-span-2">
                                    <Label htmlFor="dni">DNI <Req /></Label>
                                    <Controller
                                        control={control}
                                        name="dni"
                                        render={({ field }) => (
                                            <Input
                                                id="dni"
                                                inputMode="numeric"
                                                maxLength={8}
                                                placeholder="8 dígitos"
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(onlyDigits(e.target.value, 8))}
                                            />
                                        )}
                                    />
                                    {errors.dni && <p className="text-xs text-destructive">{errors.dni.message}</p>}
                                </div>
                            </>
                        )}

                        {tipoPersona === 'juridica' && (
                            <div className="flex flex-col gap-1.5 col-span-2">
                                <Label htmlFor="ruc">RUC <Req /></Label>
                                <Controller
                                    control={control}
                                    name="ruc"
                                    render={({ field }) => (
                                        <Input
                                            id="ruc"
                                            inputMode="numeric"
                                            maxLength={11}
                                            placeholder="11 dígitos"
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(onlyDigits(e.target.value, 11))}
                                        />
                                    )}
                                />
                                {errors.ruc && <p className="text-xs text-destructive">{errors.ruc.message}</p>}
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5 col-span-2">
                            <Label>Departamento <Req /></Label>
                            <Controller
                                control={control}
                                name="departamento"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona departamento" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PERU_DEPARTAMENTOS.map((d) => (
                                                <SelectItem key={d} value={d}>{d}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.departamento && (
                                <p className="text-xs text-destructive">{errors.departamento.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5 col-span-2">
                            <Label htmlFor="email">Email <Req /></Label>
                            <Input id="email" type="email" {...register('email')} />
                            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                        </div>

                        <div className="flex flex-col gap-1.5 col-span-2">
                            <Label htmlFor="telefono">Teléfono <Req /></Label>
                            <Controller
                                control={control}
                                name="telefono"
                                render={({ field }) => (
                                    <Input
                                        id="telefono"
                                        inputMode="numeric"
                                        maxLength={9}
                                        placeholder="9 dígitos"
                                        value={field.value ?? ''}
                                        onChange={(e) => field.onChange(onlyDigits(e.target.value, 9))}
                                    />
                                )}
                            />
                            {errors.telefono && <p className="text-xs text-destructive">{errors.telefono.message}</p>}
                        </div>
                    </div>

                    <Separator />

                    {/* Comprobante */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="archivo_comprobante">Comprobante (opcional)</Label>
                        <Controller
                            control={control}
                            name="archivo_comprobante"
                            render={({ field }) => (
                                <div className="flex items-center gap-2">
                                    <label
                                        htmlFor="archivo_comprobante"
                                        className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 w-full"
                                    >
                                        <IconUpload className="size-4 shrink-0" />
                                        {archivo ? archivo.name : 'Subir jpg, png o pdf (máx. 5MB)'}
                                    </label>
                                    <input
                                        id="archivo_comprobante"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        className="hidden"
                                        onChange={(e) => field.onChange(e.target.files?.[0] ?? null)}
                                    />
                                    {archivo && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 shrink-0"
                                            onClick={() => field.onChange(null)}
                                        >
                                            <IconX className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        />
                        {errors.archivo_comprobante && (
                            <p className="text-xs text-destructive">{errors.archivo_comprobante.message as string}</p>
                        )}
                    </div>

                    {FeedbackAlert}
                </form>

                <DrawerFooter className="flex-row gap-2">
                    <Button
                        type="submit"
                        form={FORM_ID}
                        className="flex-1"
                        disabled={isSubmitting || !campaniaSegura}
                    >
                        {isSubmitting ? 'Registrando...' : 'Registrar cliente'}
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline" className="flex-1">Cancelar</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}