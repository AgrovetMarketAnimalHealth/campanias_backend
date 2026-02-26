import { IconReceipt, IconCoins, IconCalendar, IconPhoto, IconExternalLink } from '@tabler/icons-react'
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
import type { Boleta } from '../types'
import { estadoBadgeColor, formatMonto } from '../utils'

interface BoletaDrawerProps {
    boleta: Boleta | null
    open: boolean
    onClose: () => void
}

export function BoletaDrawer({ boleta, open, onClose }: BoletaDrawerProps) {
    if (!boleta) return null

    return (
        <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
            <DrawerContent className="max-w-md">
                <DrawerHeader className="gap-1">
                    <DrawerTitle className="flex items-center gap-2">
                        <IconReceipt className="size-5" />
                        {boleta.codigo}
                    </DrawerTitle>
                    <DrawerDescription>
                        Detalle completo de la boleta
                    </DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-col gap-5 overflow-y-auto px-4 text-sm">

                    {/* Estado */}
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Estado</span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${estadoBadgeColor(boleta.estado)}`}>
                            {boleta.estado}
                        </span>
                    </div>

                    <Separator />

                    {/* Info general */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-xs">N° Boleta</span>
                            <span className="font-medium">{boleta.numero_boleta ?? '—'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-xs">Monto</span>
                            <span className="font-semibold text-base">{formatMonto(boleta.monto)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-xs flex items-center gap-1">
                                <IconCoins className="size-3" /> Puntos Otorgados
                            </span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                                {boleta.puntos_otorgados.toLocaleString()} pts
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-xs flex items-center gap-1">
                                <IconCalendar className="size-3" /> Fecha
                            </span>
                            <span className="font-medium">{boleta.fecha}</span>
                        </div>
                    </div>

                    {boleta.observacion && (
                        <>
                            <Separator />
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground text-xs font-medium">Observación</span>
                                <p className="text-sm leading-relaxed">{boleta.observacion}</p>
                            </div>
                        </>
                    )}

                    <Separator />

                    {/* Archivo / Foto */}
                    <div className="flex flex-col gap-3">
                        <span className="text-muted-foreground text-xs font-medium flex items-center gap-1">
                            <IconPhoto className="size-3" /> Comprobante
                        </span>
                        {boleta.archivo_url ? (
                            <div className="relative group overflow-hidden rounded-lg border bg-muted">
                                <img
                                    src={boleta.archivo_url}
                                    alt="Comprobante de boleta"
                                    className="w-full object-contain max-h-64 transition-transform group-hover:scale-105"
                                />
                                <a
                                    href={boleta.archivo_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Button size="sm" variant="secondary">
                                        <IconExternalLink className="size-4 mr-1" />
                                        Ver completo
                                    </Button>
                                </a>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-32 rounded-lg border border-dashed bg-muted text-muted-foreground text-sm">
                                Sin comprobante adjunto
                            </div>
                        )}
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