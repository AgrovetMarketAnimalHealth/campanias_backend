import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
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
import type { MetricasPeriodo, Preset } from '../types'
import { hoy, fechaHaceNMeses } from '../utils'

const chartConfig = {
    aceptada: {
        label: 'Aceptadas',
        color: 'var(--chart-1)',
    },
    rechazada: {
        label: 'Rechazadas',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig

interface GraficoInscritosProps {
    datos: MetricasPeriodo | null
    loading: boolean
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

function labelDia(fecha: string) {
    const d = new Date(fecha + 'T00:00:00')
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

function labelMes(mes: string) {
    const [year, month] = mes.split('-')
    const d = new Date(Number(year), Number(month) - 1, 1)
    return d.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })
}

export function GraficoInscritos({
    datos,
    loading,
    fechaInicio,
    fechaFin,
    preset,
    onPresetChange,
    onFechaInicioChange,
    onFechaFinChange,
    onConsultar,
}: GraficoInscritosProps) {

    const usarDias = preset === '1m'

    const chartData = React.useMemo(() => {
        if (!datos) return []

        if (usarDias) {
            return (datos.inscritos_por_dia_estado ?? []).map((d) => ({
                label: labelDia(d.fecha),
                aceptada: d.aceptada,
                rechazada: d.rechazada,
            }))
        }

        return (datos.inscritos_por_mes_estado ?? []).map((d) => ({
            label: labelMes(d.mes),
            aceptada: d.aceptada,
            rechazada: d.rechazada,
        }))
    }, [datos, usarDias])

    const totalPeriodo = datos?.total_periodo ?? 0

    return (
        <Card className="pt-0">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Boletas por {usarDias ? 'día' : 'mes'}</CardTitle>
                    <CardDescription>
                        {totalPeriodo > 0
                            ? `${totalPeriodo.toLocaleString()} inscritos en el período`
                            : 'Selecciona un período para ver los datos'}
                    </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2">
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
                    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="fillAceptada" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="var(--color-aceptada)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-aceptada)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="fillRechazada" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="var(--color-rechazada)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-rechazada)" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={usarDias ? 16 : 32}
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
                            <Area
                                dataKey="rechazada"
                                type="natural"
                                fill="url(#fillRechazada)"
                                stroke="var(--color-rechazada)"
                                stackId="a"
                            />
                            <Area
                                dataKey="aceptada"
                                type="natural"
                                fill="url(#fillAceptada)"
                                stroke="var(--color-aceptada)"
                                stackId="a"
                            />
                            <ChartLegend
                                content={(props) => <ChartLegendContent {...props} />}
                            />
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}