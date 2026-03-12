import * as React from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts'
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
    ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart'
import type { MetricasPeriodo, Preset } from '../types'
import { labelDia, labelMes } from '../utils'

const chartConfig = {
    pendiente: { label: 'Pendientes', color: 'var(--chart-3)' },
    aceptada:  { label: 'Aceptadas',  color: 'var(--chart-1)' },
    rechazada: { label: 'Rechazadas', color: 'var(--chart-2)' },
} satisfies ChartConfig

interface Props {
    datos: MetricasPeriodo | null
    loading: boolean
    preset: Preset
}

export function GraficoBoletas({ datos, loading, preset }: Props) {
    const usarDias = preset === 'hoy' || preset === '1m'

    const chartData = React.useMemo(() => {
        if (!datos) return []
        if (usarDias) {
            const lista = Array.isArray(datos.por_dia) ? datos.por_dia : []
            return lista.map((d) => ({
                label:     labelDia(d.fecha),
                pendiente: d.pendiente,
                aceptada:  d.aceptada,
                rechazada: d.rechazada,
            }))
        }
        const lista = Array.isArray(datos.por_mes) ? datos.por_mes : []
        return lista.map((d) => ({
            label:     labelMes(d.mes),
            pendiente: d.pendiente,
            aceptada:  d.aceptada,
            rechazada: d.rechazada,
        }))
    }, [datos, usarDias])

    return (
        <Card className="pt-0">
            <CardHeader className="border-b py-5">
                <CardTitle>Boletas por {usarDias ? 'día' : 'mes'}</CardTitle>
                <CardDescription>
                    {loading
                        ? 'Cargando datos…'
                        : (datos?.total_periodo ?? 0) > 0
                            ? `${(datos!.total_periodo).toLocaleString()} boletas en el período`
                            : 'Sin datos para el período seleccionado'}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                {loading ? (
                    <div className="flex h-[250px] w-full items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex h-[250px] w-full items-center justify-center text-sm text-muted-foreground">
                        Sin datos para el período seleccionado
                    </div>
                ) : (
                    <div className="min-w-0 w-full">
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <LineChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={usarDias ? 16 : 8}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    allowDecimals={false}
                                    width={32}
                                    tick={{ fontSize: 12 }}
                                />
                                <ChartTooltip
                                    content={<ChartTooltipContent labelFormatter={(v) => v} indicator="dot" />}
                                />
                                <Legend />
                                <Line dataKey="pendiente" stroke="var(--color-pendiente)" strokeWidth={2} dot={false} isAnimationActive={false} />
                                <Line dataKey="aceptada"  stroke="var(--color-aceptada)"  strokeWidth={2} dot={false} isAnimationActive={false} />
                                <Line dataKey="rechazada" stroke="var(--color-rechazada)" strokeWidth={2} dot={false} isAnimationActive={false} />
                            </LineChart>
                        </ChartContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}