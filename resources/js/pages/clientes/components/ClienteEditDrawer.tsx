import * as React from 'react'
import { IconUser, IconBuilding, IconLoader2 } from '@tabler/icons-react'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { clienteService } from '../services/clienteService'
import type { Cliente } from '../types'
import { toast } from 'sonner'

interface ClienteEditDrawerProps {
    cliente: Cliente | null
    open: boolean
    onClose: () => void
    onUpdated: (updated: Cliente) => void
}

interface FormState {
    nombre: string
    apellidos: string
    email: string
    telefono: string
    dni: string
    ruc: string
    departamento: string
    estado: string
}

const DEPARTAMENTOS = [
    'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho',
    'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco',
    'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima',
    'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura',
    'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali',
]

export function ClienteEditDrawer({ cliente, open, onClose, onUpdated }: ClienteEditDrawerProps) {
    const [form, setForm] = React.useState<FormState>({
        nombre: '',
        apellidos: '',
        email: '',
        telefono: '',
        dni: '',
        ruc: '',
        departamento: '',
        estado: '',
    })
    const [saving, setSaving] = React.useState(false)
    const [errors, setErrors] = React.useState<Partial<FormState>>({})

    // Sincronizar form cuando cambia el cliente
    React.useEffect(() => {
        if (cliente) {
            setForm({
                nombre:       cliente.nombre       ?? '',
                apellidos:    cliente.apellidos     ?? '',
                email:        cliente.email         ?? '',
                telefono:     cliente.telefono      ?? '',
                dni:          cliente.dni           ?? '',
                ruc:          cliente.ruc           ?? '',
                departamento: cliente.departamento  ?? '',
                estado:       cliente.estado        ?? '',
            })
            setErrors({})
        }
    }, [cliente])

    if (!cliente) return null

    const esNatural = cliente.tipo_persona === 'natural'

    const set = (key: keyof FormState) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setForm(f => ({ ...f, [key]: e.target.value }))
        setErrors(er => ({ ...er, [key]: undefined }))
    }

    const handleSubmit = async () => {
        setSaving(true)
        setErrors({})
        try {
            const payload: Record<string, string> = {
                nombre:       form.nombre,
                apellidos:    form.apellidos,
                email:        form.email,
                telefono:     form.telefono,
                departamento: form.departamento,
                estado:       form.estado,
            }
            if (esNatural) {
                payload.dni = form.dni
            } else {
                payload.ruc = form.ruc
            }

            const updated = await clienteService.updateCliente(cliente.id, payload)
            onUpdated(updated)
            toast.success('Cliente actualizado correctamente')
            onClose()
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'errors' in err) {
                setErrors((err as { errors: Partial<FormState> }).errors)
            } else {
                toast.error('Error al actualizar el cliente')
            }
        } finally {
            setSaving(false)
        }
    }

    return (
        <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
            <DrawerContent className="max-w-md">
                <DrawerHeader className="gap-1">
                    <DrawerTitle className="flex items-center gap-2">
                        {esNatural
                            ? <IconUser className="size-4" />
                            : <IconBuilding className="size-4" />}
                        Editar cliente
                    </DrawerTitle>
                    <DrawerDescription>
                        {cliente.nombre} {cliente.apellidos}
                    </DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-col gap-5 overflow-y-auto px-4">

                    {/* Nombre y apellidos */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input id="nombre" value={form.nombre} onChange={set('nombre')} />
                            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="apellidos">Apellidos</Label>
                            <Input id="apellidos" value={form.apellidos} onChange={set('apellidos')} />
                            {errors.apellidos && <p className="text-xs text-destructive">{errors.apellidos}</p>}
                        </div>
                    </div>

                    <Separator />

                    {/* Email y teléfono */}
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={form.email} onChange={set('email')} />
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                            <p className="text-xs text-muted-foreground">
                                Si cambias el email, el cliente deberá verificarlo nuevamente.
                            </p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input id="telefono" value={form.telefono} onChange={set('telefono')} />
                            {errors.telefono && <p className="text-xs text-destructive">{errors.telefono}</p>}
                        </div>
                    </div>

                    <Separator />

                    {/* DNI o RUC según tipo */}
                    <div className="flex flex-col gap-1.5">
                        {esNatural ? (
                            <>
                                <Label htmlFor="dni">DNI</Label>
                                <Input id="dni" value={form.dni} onChange={set('dni')} maxLength={8} />
                                {errors.dni && <p className="text-xs text-destructive">{errors.dni}</p>}
                            </>
                        ) : (
                            <>
                                <Label htmlFor="ruc">RUC</Label>
                                <Input id="ruc" value={form.ruc} onChange={set('ruc')} maxLength={11} />
                                {errors.ruc && <p className="text-xs text-destructive">{errors.ruc}</p>}
                            </>
                        )}
                    </div>

                    <Separator />

                    {/* Departamento */}
                    <div className="flex flex-col gap-1.5">
                        <Label>Departamento</Label>
                        <Select
                            value={form.departamento}
                            onValueChange={(v) => setForm(f => ({ ...f, departamento: v }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar departamento" />
                            </SelectTrigger>
                            <SelectContent>
                                {DEPARTAMENTOS.map((dep) => (
                                    <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.departamento && <p className="text-xs text-destructive">{errors.departamento}</p>}
                    </div>

                    <Separator />

                    {/* Estado */}
                    <div className="flex flex-col gap-1.5">
                        <Label>Estado</Label>
                        <Select
                            value={form.estado}
                            onValueChange={(v) => setForm(f => ({ ...f, estado: v }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pendiente">Pendiente</SelectItem>
                                <SelectItem value="activo">Activo</SelectItem>
                                <SelectItem value="rechazado">Rechazado</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.estado && <p className="text-xs text-destructive">{errors.estado}</p>}
                    </div>

                </div>

                <DrawerFooter className="flex flex-row gap-2">
                    <DrawerClose asChild>
                        <Button variant="outline" className="flex-1" disabled={saving}>
                            Cancelar
                        </Button>
                    </DrawerClose>
                    <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
                        {saving
                            ? <><IconLoader2 className="size-4 animate-spin mr-2" />Guardando...</>
                            : 'Guardar cambios'}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}