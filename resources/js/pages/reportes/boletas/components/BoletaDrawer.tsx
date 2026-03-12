import {
    IconReceipt, IconUser, IconCoin,
    IconCalendar, IconNotes, IconHash,
} from '@tabler/icons-react'
import {
    Drawer, DrawerClose, DrawerContent,
    DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Boleta } from '../types'
import { estadoBadgeClass, formatMonto, formatFechaHora } from '../utils'

interface Props {
    boleta: Boleta | null
    open: boolean
    onClose: () => void
}

export function BoletaDrawer({ boleta, open, onClose }: Props) {
    if (!boleta) return null

    return (
        <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
            <DrawerContent className="max-w-md">
                <DrawerHeader className="gap-1">
                    <DrawerTitle className="flex items-center gap-2">
                        <IconReceipt className="size-5 text-blue-500" />
                        {boleta.codigo}
                    </DrawerTitle>
                    <DrawerDescription>Detalle de la boleta</DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-col gap-5 overflow-y-auto px-4 text-sm">
                    {/* Estado */}
                    <div className="flex items-center justify-between">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${estadoBadgeClass(boleta.estado)}`}>
                            {boleta.estado.charAt(0).toUpperCase() + boleta.estado.slice(1)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                            {formatFechaHora(boleta.created_at)}
                        </span>
                    </div>

                    <Separator />

                    {/* Cliente */}
                    {boleta.cliente && (
                        <div className="flex items-center gap-2">
                            <IconUser className="size-4 text-muted-foreground shrink-0" />
                            <span className="font-medium">
                                {boleta.cliente.nombre} {boleta.cliente.apellidos ?? ''}
                            </span>
                        </div>
                    )}

                    {/* N° Boleta + Monto */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-xs flex items-center gap-1">
                                <IconHash className="size-3" /> N° Boleta
                            </span>
                            <span className="font-mono font-medium">{boleta.numero_boleta}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-xs">Monto</span>
                            <span className="font-semibold text-base">{formatMonto(boleta.monto)}</span>
                        </div>
                    </div>

                    {/* Puntos */}
                    <div className="flex items-center gap-2">
                        <IconCoin className="size-4 text-amber-500 shrink-0" />
                        <span className="text-muted-foreground text-xs">Puntos otorgados:</span>
                        <span className="font-semibold">{boleta.puntos_otorgados}</span>
                    </div>

                    {/* Observación */}
                    {boleta.observacion && (
                        <>
                            <Separator />
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground text-xs flex items-center gap-1">
                                    <IconNotes className="size-3" /> Observación
                                </span>
                                <p className="text-sm">{boleta.observacion}</p>
                            </div>
                        </>
                    )}
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