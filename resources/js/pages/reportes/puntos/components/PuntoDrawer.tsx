import { IconCoins, IconUser, IconBuildingStore, IconTicket } from '@tabler/icons-react'
import {
    Drawer, DrawerClose, DrawerContent,
    DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Punto } from '../types'
import { formatPuntos, nombreCompleto, docLabel, docValor, tipoBadgeColor } from '../utils'

interface PuntoDrawerProps {
    punto: Punto | null
    open: boolean
    onClose: () => void
}

export function PuntoDrawer({ punto, open, onClose }: PuntoDrawerProps) {
    if (!punto) return null

    const pts    = formatPuntos(punto.puntos)
    const nombre = nombreCompleto(punto.cliente_tipo, punto.cliente_nom, punto.cliente_apl)
    const isJur  = punto.cliente_tipo === 'juridica'

    return (
        <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
            <DrawerContent className="max-w-md">
                <DrawerHeader className="gap-1">
                    <DrawerTitle className="flex items-center gap-2">
                        {isJur ? <IconBuildingStore className="size-5" /> : <IconUser className="size-5" />}
                        {nombre}
                    </DrawerTitle>
                    <DrawerDescription>
                        Detalle de puntos y boletos del sorteo
                    </DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-col gap-5 overflow-y-auto px-4 text-sm">

                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Tipo</span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tipoBadgeColor(punto.cliente_tipo)}`}>
                            {isJur ? 'Persona Jurídica' : 'Persona Natural'}
                        </span>
                    </div>

                    <Separator />

                    {punto.imagen && (
                        <div className="flex justify-center">
                            <img src={punto.imagen} alt="Logo" className="h-12 object-contain" />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-xs">{docLabel(punto.cliente_tipo)}</span>
                            <span className="font-mono font-medium">
                                {docValor(punto.cliente_tipo, punto.cliente_dni, punto.cliente_ruc)}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-xs">Departamento</span>
                            <span className="font-medium">{punto.cliente_departamento}</span>
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                            <span className="text-muted-foreground text-xs">Email</span>
                            <span className="font-medium truncate">{punto.cliente_email}</span>
                        </div>
                        {punto.telefono && (
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground text-xs">Teléfono</span>
                                <span className="font-medium">{punto.telefono}</span>
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <IconCoins className="size-5 text-amber-500" />
                            <span className="font-semibold text-amber-700 dark:text-amber-300">Puntos acumulados</span>
                        </div>
                        <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                            {pts.toLocaleString()}
                        </span>
                    </div>

                    <div className="rounded-xl bg-muted p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <IconTicket className="size-5 text-muted-foreground" />
                            <span className="font-semibold text-muted-foreground">Boletos en sorteo</span>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-bold">{pts.toLocaleString()}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">1 boleto por cada punto</p>
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