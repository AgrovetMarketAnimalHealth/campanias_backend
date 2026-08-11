import * as React from 'react'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle,
    SheetDescription, SheetFooter, SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { IconLoader2, IconUpload, IconUser, IconBuilding } from '@tabler/icons-react'
import { clienteService } from '../services/clienteService'
import type { Cliente, Campania, ClienteFormData } from '../types'

const DEPARTAMENTOS = [
    'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
    'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín',
    'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios',
    'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna',
    'Tumbes', 'Ucayali',
]

const FORM_INICIAL: ClienteFormData = {
    campania_id: '',
    tipo_persona: 'natural',
    tipo_registro: '',
    nombre: '',
    apellidos: '',
    dni: '',
    ruc: '',
    departamento: '',
    email: '',
    telefono: '',
    archivo_comprobante: null,
}

interface Props {
    open: boolean
    campanias: Campania[]
    onClose: () => void
    onCreated: (cliente: Cliente) => void
}

export function ClienteCreateDrawer({ open, campanias, onClose, onCreated }: Props) {
    const [form, setForm]       = React.useState<ClienteFormData>(FORM_INICIAL)
    const [errors, setErrors]   = React.useState<Record<string, string>>({})
    const [saving, setSaving]   = React.useState(false)
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

    // Resetea el form cada vez que se abre el drawer
    React.useEffect(() => {
        if (open) {
            setForm(FORM_INICIAL)
            setErrors({})
            setErrorMsg(null)
        }
    }, [open])

    function setField<K extends keyof ClienteFormData>(key: K, value: ClienteFormData[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
        if (errors[key]) {
            setErrors((prev) => {
                const next = { ...prev }
                delete next[key]
                return next
            })
        }
    }

    function validar(): boolean {
        const nuevosErrores: Record<string, string> = {}

        if (!form.campania_id) nuevosErrores.campania_id = 'Selecciona una campaña.'
        if (!form.tipo_registro.trim()) nuevosErrores.tipo_registro = 'Indica el tipo de registro.'
        if (!form.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.'
        if (!form.departamento) nuevosErrores.departamento = 'Selecciona un departamento.'
        if (!form.email.trim()) nuevosErrores.email = 'El email es obligatorio.'
        if (!form.telefono.trim()) nuevosErrores.telefono = 'El teléfono es obligatorio.'

        if (form.tipo_persona === 'natural') {
            if (!form.apellidos.trim()) nuevosErrores.apellidos = 'Los apellidos son obligatorios.'
            if (!/^\d{8}$/.test(form.dni)) nuevosErrores.dni = 'El DNI debe tener 8 dígitos.'
        } else {
            if (!/^\d{11}$/.test(form.ruc)) nuevosErrores.ruc = 'El RUC debe tener 11 dígitos.'
        }

        setErrors(nuevosErrores)
        return Object.keys(nuevosErrores).length === 0
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErrorMsg(null)

        if (!validar()) return

        setSaving(true)

        const payload = new FormData()
        payload.append('campania_id', form.campania_id)
        payload.append('tipo_persona', form.tipo_persona)
        payload.append('tipo_registro', form.tipo_registro)
        payload.append('nombre', form.nombre)
        payload.append('departamento', form.departamento)
        payload.append('email', form.email)
        payload.append('telefono', form.telefono)

        if (form.tipo_persona === 'natural') {
            payload.append('apellidos', form.apellidos)
            payload.append('dni', form.dni)
        } else {
            payload.append('ruc', form.ruc)
        }

        if (form.archivo_comprobante) {
            payload.append('archivo_comprobante', form.archivo_comprobante)
        }

        try {
            const res = await clienteService.createCliente(payload)
            onCreated(res.data.cliente)
            onClose()
        } catch (err: any) {
            if (err?.response?.status === 422 && err.response.data?.errors) {
                const backendErrors: Record<string, string> = {}
                Object.entries(err.response.data.errors as Record<string, string[]>).forEach(
                    ([campo, mensajes]) => { backendErrors[campo] = mensajes[0] }
                )
                setErrors(backendErrors)
            } else {
                setErrorMsg(err?.response?.data?.message ?? 'Ocurrió un error al registrar el cliente.')
            }
        } finally {
            setSaving(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <form onSubmit={handleSubmit} className="flex h-full flex-col">
                    <SheetHeader>
                        <SheetTitle>Agregar cliente</SheetTitle>
                        <SheetDescription>
                            Registra un cliente manualmente y vincúlalo a una campaña activa.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-col gap-4 px-4 pb-4">
                        {errorMsg && (
                            <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                                {errorMsg}
                            </div>
                        )}

                        {/* Campaña */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="campania_id">Campaña *</Label>
                            <Select
                                value={form.campania_id}
                                onValueChange={(v) => setField('campania_id', v)}
                            >
                                <SelectTrigger id="campania_id" className={errors.campania_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecciona una campaña" />
                                </SelectTrigger>
                                <SelectContent>
                                    {campanias.filter((c) => c.activa).map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.campania_id && <span className="text-xs text-red-500">{errors.campania_id}</span>}
                        </div>

                        {/* Tipo de registro */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="tipo_registro">Tipo de registro *</Label>
                            <Input
                                id="tipo_registro"
                                placeholder="ej. web, panel, evento"
                                value={form.tipo_registro}
                                onChange={(e) => setField('tipo_registro', e.target.value)}
                                className={errors.tipo_registro ? 'border-red-500' : ''}
                            />
                            {errors.tipo_registro && <span className="text-xs text-red-500">{errors.tipo_registro}</span>}
                        </div>

                        {/* Tipo de persona */}
                        <div className="grid gap-1.5">
                            <Label>Tipo de persona *</Label>
                            <div className="flex items-center gap-1 rounded-lg border bg-muted p-1 w-fit">
                                <button
                                    type="button"
                                    onClick={() => setField('tipo_persona', 'natural')}
                                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                                        form.tipo_persona === 'natural'
                                            ? 'bg-background shadow-sm text-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <IconUser className="size-3.5" /> Natural
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setField('tipo_persona', 'juridica')}
                                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                                        form.tipo_persona === 'juridica'
                                            ? 'bg-background shadow-sm text-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <IconBuilding className="size-3.5" /> Jurídica
                                </button>
                            </div>
                        </div>

                        {/* Nombre / Apellidos */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="nombre">
                                    {form.tipo_persona === 'natural' ? 'Nombre *' : 'Razón social *'}
                                </Label>
                                <Input
                                    id="nombre"
                                    value={form.nombre}
                                    onChange={(e) => setField('nombre', e.target.value)}
                                    className={errors.nombre ? 'border-red-500' : ''}
                                />
                                {errors.nombre && <span className="text-xs text-red-500">{errors.nombre}</span>}
                            </div>

                            {form.tipo_persona === 'natural' && (
                                <div className="grid gap-1.5">
                                    <Label htmlFor="apellidos">Apellidos *</Label>
                                    <Input
                                        id="apellidos"
                                        value={form.apellidos}
                                        onChange={(e) => setField('apellidos', e.target.value)}
                                        className={errors.apellidos ? 'border-red-500' : ''}
                                    />
                                    {errors.apellidos && <span className="text-xs text-red-500">{errors.apellidos}</span>}
                                </div>
                            )}
                        </div>

                        {/* DNI o RUC */}
                        {form.tipo_persona === 'natural' ? (
                            <div className="grid gap-1.5">
                                <Label htmlFor="dni">DNI *</Label>
                                <Input
                                    id="dni"
                                    inputMode="numeric"
                                    maxLength={8}
                                    value={form.dni}
                                    onChange={(e) => setField('dni', e.target.value.replace(/\D/g, ''))}
                                    className={errors.dni ? 'border-red-500' : ''}
                                />
                                {errors.dni && <span className="text-xs text-red-500">{errors.dni}</span>}
                            </div>
                        ) : (
                            <div className="grid gap-1.5">
                                <Label htmlFor="ruc">RUC *</Label>
                                <Input
                                    id="ruc"
                                    inputMode="numeric"
                                    maxLength={11}
                                    value={form.ruc}
                                    onChange={(e) => setField('ruc', e.target.value.replace(/\D/g, ''))}
                                    className={errors.ruc ? 'border-red-500' : ''}
                                />
                                {errors.ruc && <span className="text-xs text-red-500">{errors.ruc}</span>}
                            </div>
                        )}

                        {/* Departamento */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="departamento">Departamento *</Label>
                            <Select
                                value={form.departamento}
                                onValueChange={(v) => setField('departamento', v)}
                            >
                                <SelectTrigger id="departamento" className={errors.departamento ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecciona un departamento" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEPARTAMENTOS.map((d) => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.departamento && <span className="text-xs text-red-500">{errors.departamento}</span>}
                        </div>

                        {/* Email / Teléfono */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) => setField('email', e.target.value)}
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="telefono">Teléfono *</Label>
                            <Input
                                id="telefono"
                                value={form.telefono}
                                onChange={(e) => setField('telefono', e.target.value)}
                                className={errors.telefono ? 'border-red-500' : ''}
                            />
                            {errors.telefono && <span className="text-xs text-red-500">{errors.telefono}</span>}
                        </div>

                        {/* Boleta opcional */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="archivo_comprobante">Boleta / comprobante (opcional)</Label>
                            <label
                                htmlFor="archivo_comprobante"
                                className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2.5 text-sm text-muted-foreground cursor-pointer hover:bg-muted/50"
                            >
                                <IconUpload className="size-4 shrink-0" />
                                {form.archivo_comprobante ? form.archivo_comprobante.name : 'Subir archivo (jpg, png o pdf)'}
                            </label>
                            <input
                                id="archivo_comprobante"
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                className="hidden"
                                onChange={(e) => setField('archivo_comprobante', e.target.files?.[0] ?? null)}
                            />
                            {errors.archivo_comprobante && (
                                <span className="text-xs text-red-500">{errors.archivo_comprobante}</span>
                            )}
                        </div>
                    </div>

                    <SheetFooter className="mt-auto">
                        <SheetClose asChild>
                            <Button type="button" variant="outline" disabled={saving}>Cancelar</Button>
                        </SheetClose>
                        <Button type="submit" disabled={saving}>
                            {saving && <IconLoader2 className="size-4 mr-1.5 animate-spin" />}
                            Registrar cliente
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}