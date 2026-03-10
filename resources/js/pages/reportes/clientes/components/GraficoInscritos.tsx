import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { InscritosPorMes, Preset } from '../types'
import { labelMes, hoy, fechaHaceNMeses } from '../utils'

const chartConfig = {
    total: {
        label: 'Inscritos',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig

interface GraficoInscritosProps {
    datos: InscritosPorMes[]
    loading: boolean
    totalPeriodo: number
    fechaInicio: string
    fechaFin: string
    preset: Preset
    onPresetChange: (inicio: string, fin: string, key: Preset) => void
    onFechaInicioChange: (v: string) => void
    onFechaFinChange: (v: string) => void
    onConsultar: () => void
}

const PRESETS: { key: Preset; label: string; meses: number }[] = [
    { key: '1m',  label: '1 mes',   meses: 1  },
    { key: '3m',  label: '3 meses', meses: 3  },
    { key: '6m',  label: '6 meses', meses: 6  },
    { key: '12m', label: '1 año',   meses: 12 },
]

export function GraficoInscritos({
    datos,
    loading,
    totalPeriodo,
    fechaInicio,
    fechaFin,
    preset,
    onPresetChange,
    onFechaInicioChange,
    onFechaFinChange,
    onConsultar,
}: GraficoInscritosProps) {

    const chartData = datos.map((d) => ({
        mes: labelMes(d.mes),
        total: d.total,
    }))

    return (
        <Card className="pt-0">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Inscritos por mes</CardTitle>
                    <CardDescription>
                        {totalPeriodo > 0
                            ? `${totalPeriodo.toLocaleString()} inscritos en el período`
                            : 'Selecciona un período para ver los datos'}
                    </CardDescription>
                </div>

                {/* Controles de filtro */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Select de preset rápido */}
                    <Select
                        value={preset}
                        onValueChange={(val) => {
                            const p = PRESETS.find((x) => x.key === val)!
                            onPresetChange(fechaHaceNMeses(p.meses), hoy(), p.key)
                        }}
                    >
                        <SelectTrigger className="w-[130px] rounded-lg" aria-label="Período">
                            <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {PRESETS.map((p) => (
                                <SelectItem key={p.key} value={p.key} className="rounded-lg">
                                    {p.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Rango personalizado */}
                    <Input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => onFechaInicioChange(e.target.value)}
                        className="w-36 h-9 text-sm"
                    />
                    <span className="text-muted-foreground text-sm">→</span>
                    <Input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => onFechaFinChange(e.target.value)}
                        className="w-36 h-9 text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={onConsultar}>
                        Consultar
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                {loading ? (
                    <div className="flex aspect-auto h-[250px] w-full items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex aspect-auto h-[250px] w-full items-center justify-center text-sm text-muted-foreground">
                        Sin datos para el período seleccionado
                    </div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <BarChart data={chartData} margin={{ left: -8 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="mes"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={16}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                allowDecimals={false}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) => value}
                                        indicator="dot"
                                    />
                                }
                            />
                            <Bar
                                dataKey="total"
                                fill="var(--color-total)"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={56}
                            />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}