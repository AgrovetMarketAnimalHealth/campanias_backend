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
import { Label } from '@/components/ui/label'
import { useIsMobile } from '@/hooks/use-mobile'
import { IconUpload, IconX, IconAlertCircle, IconReceipt2 } from '@tabler/icons-react'
import { clienteService } from '../services/clienteService'
import { subirBoletaSchema, type SubirBoletaForm } from '../schemas'
import type { Boleta } from '../types'

const FORM_ID = 'boleta-upload-form'

interface ServerValidationError {
    message?: string
}

interface Props {
    clienteId: string
    clienteNombre?: string
    onUploaded: (boleta: Boleta) => void
    children: React.ReactNode
}

export function BoletaUploadDrawer({ clienteId, clienteNombre, onUploaded, children }: Props) {
    const isMobile = useIsMobile()
    const [open, setOpen] = React.useState(false)
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

    const {
        control, handleSubmit, watch, reset,
        formState: { errors, isSubmitting },
    } = useForm<SubirBoletaForm>({
        resolver: zodResolver(subirBoletaSchema),
        defaultValues: { archivo: undefined },
    })

    const archivo = watch('archivo')

    React.useEffect(() => {
        if (open) {
            reset()
            setErrorMsg(null)
        }
    }, [open, reset])

    const onSubmit = handleSubmit(async (values) => {
        setErrorMsg(null)
        try {
            const res = await clienteService.subirBoleta(clienteId, values.archivo)
            onUploaded(res.data)
            toast.success(res.message ?? 'Comprobante subido correctamente. Será revisado pronto.')
            setOpen(false)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const data = error.response?.data as ServerValidationError | undefined
                const msg = data?.message ?? 'No se pudo subir el comprobante.'
                setErrorMsg(msg)
                toast.error(msg)
                return
            }
            setErrorMsg('Ocurrió un error inesperado.')
            toast.error('Ocurrió un error inesperado.')
        }
    })

    return (
        <Drawer open={open} onOpenChange={setOpen} direction={isMobile ? 'bottom' : 'right'}>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent className={!isMobile ? 'w-[420px] max-w-[90vw] right-0 h-full' : ''}>
                <DrawerHeader className="gap-1">
                    <DrawerTitle className="flex items-center gap-2">
                        <IconReceipt2 className="size-4" />
                        Subir comprobante
                    </DrawerTitle>
                    <DrawerDescription>
                        {clienteNombre ? (
                            <>Se registrará para <strong className="font-semibold text-foreground">{clienteNombre}</strong>, en su campaña activa.</>
                        ) : (
                            'El comprobante se asociará a la campaña activa del cliente.'
                        )}
                    </DrawerDescription>
                </DrawerHeader>

                <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4 overflow-y-auto px-4 text-sm pb-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="archivo">
                            Archivo <span className="text-destructive">*</span>
                        </Label>
                        <Controller
                            control={control}
                            name="archivo"
                            render={({ field }) => (
                                <div className="flex items-center gap-2">
                                    <label
                                        htmlFor="archivo"
                                        className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 w-full"
                                    >
                                        <IconUpload className="size-4 shrink-0" />
                                        {field.value ? field.value.name : 'Subir jpg, png o pdf (máx. 5MB)'}
                                    </label>
                                    <input
                                        id="archivo"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        className="hidden"
                                        onChange={(e) => field.onChange(e.target.files?.[0])}
                                    />
                                    {field.value && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 shrink-0"
                                            onClick={() => field.onChange(undefined)}
                                        >
                                            <IconX className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        />
                        {errors.archivo && (
                            <p className="text-xs text-destructive">{errors.archivo.message as string}</p>
                        )}
                    </div>

                    {errorMsg && (
                        <Alert variant="destructive">
                            <IconAlertCircle className="size-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{errorMsg}</AlertDescription>
                        </Alert>
                    )}
                </form>

                <DrawerFooter className="flex-row gap-2">
                    <Button type="submit" form={FORM_ID} className="flex-1" disabled={isSubmitting || !archivo}>
                        {isSubmitting ? 'Subiendo...' : 'Subir comprobante'}
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline" className="flex-1">Cancelar</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}