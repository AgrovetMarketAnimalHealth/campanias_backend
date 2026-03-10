import { IconUser, IconBuildingStore, IconMail, IconPhone, IconMapPin, IconCalendar } from '@tabler/icons-react'
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
import { Separator } from '@/components/ui/separator'
import type { Cliente } from '../types'
import {
    nombreCompleto,
    docLabel,
    docValor,
    estadoBadgeClass,
    tipoBadgeClass,
    formatFechaHora,
} from '../utils'

interface ClienteDrawerProps {
    cliente: Cliente | null
    open: boolean
    onClose: () => void
}

export function ClienteDrawer({ cliente, open, onClose }: ClienteDrawerProps) {
    if (!cliente) return null

    const isJur  = cliente.tipo_persona === 'juridica'
    const nombre = nombreCompleto(cliente)

    return (
        <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
            <DrawerContent className="max-w-md">
                <DrawerHeader className="gap-1">
                    <DrawerTitle className="flex items-center gap-2">
                        {isJur
                            ? <IconBuildingStore className="size-5 text-indigo-500" />
                            : <IconUser className="size-5 text-sky-500" />
                        }
                        {nombre}
                    </DrawerTitle>
                    <DrawerDescription>Detalle del inscrito</DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-col gap-5 overflow-y-auto px-4 text-sm">

                    {/* Tipo + Estado */}
                    <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tipoBadgeClass(cliente.tipo_persona)}`}>
                            {isJur ? 'Persona Jurídica' : 'Persona Natural'}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${estadoBadgeClass(cliente.estado)}`}>
                            {cliente.estado.charAt(0).toUpperCase() + cliente.estado.slice(1)}
                        </span>
                    </div>

                    <Separator />

                    {/* Documento + Departamento */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-xs">{docLabel(cliente.tipo_persona)}</span>
                            <span className="font-mono font-medium">{docValor(cliente)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-xs flex items-center gap-1">
                                <IconMapPin className="size-3" /> Departamento
                            </span>
                            <span className="font-medium">{cliente.departamento}</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Contacto */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <IconMail className="size-4 text-muted-foreground shrink-0" />
                            <span className="truncate font-medium">{cliente.email}</span>
                        </div>
                        {cliente.telefono && (
                            <div className="flex items-center gap-2">
                                <IconPhone className="size-4 text-muted-foreground shrink-0" />
                                <span className="font-medium">{cliente.telefono}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <IconCalendar className="size-4 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground text-xs">Inscrito el</span>
                            <span className="font-medium">{formatFechaHora(cliente.created_at)}</span>
                        </div>
                    </div>

                </div>

                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline" className="w-full">Cerrar</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}