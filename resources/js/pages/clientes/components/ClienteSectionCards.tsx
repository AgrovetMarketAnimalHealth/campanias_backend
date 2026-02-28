import { IconReceipt, IconCircleCheck, IconClock, IconCoins } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import type { Cliente } from '../types'

interface ClienteSectionCardsProps {
    cliente: Cliente
}

export function ClienteSectionCards({ cliente }: ClienteSectionCardsProps) {
    const totalBoletas =
        cliente.boletas_aceptadas + cliente.boletas_pendientes + cliente.boletas_rechazadas

    const tasaAprobacion = totalBoletas > 0
        ? Math.round((cliente.boletas_aceptadas / totalBoletas) * 100)
        : 0

    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">

            {/* Total Boletas */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription className="flex items-center gap-1.5">
                        <IconReceipt className="size-4" /> Total Boletas
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {totalBoletas}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            {tasaAprobacion}% aprobadas
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Boletas registradas
                    </div>
                    <div className="text-muted-foreground">
                        Desde {cliente.registrado_en}
                    </div>
                </CardFooter>
            </Card>

            {/* Aceptadas */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription className="flex items-center gap-1.5">
                        <IconCircleCheck className="size-4 text-emerald-500" /> Aceptadas
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-emerald-600 dark:text-emerald-400">
                        {cliente.boletas_aceptadas}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                            Aprobadas
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Boletas validadas
                    </div>
                    <div className="text-muted-foreground">
                        Con puntos otorgados
                    </div>
                </CardFooter>
            </Card>

            {/* Pendientes */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription className="flex items-center gap-1.5">
                        <IconClock className="size-4 text-amber-500" /> Pendientes
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-amber-600 dark:text-amber-400">
                        {cliente.boletas_pendientes}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                            En revisión
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Esperando validación
                    </div>
                    <div className="text-muted-foreground">
                        Requieren atención
                    </div>
                </CardFooter>
            </Card>

            {/* Puntos */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription className="flex items-center gap-1.5">
                        <IconCoins className="size-4 text-yellow-500" /> Puntos Acumulados
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {cliente.total_puntos.toLocaleString()}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                            <IconCoins className="size-3" /> pts
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Total acumulado
                    </div>
                    <div className="text-muted-foreground">
                        {cliente.boletas_rechazadas} boletas rechazadas
                    </div>
                </CardFooter>
            </Card>

        </div>
    )
}