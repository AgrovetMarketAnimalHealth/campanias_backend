import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Preset } from '../types'
import { hoy, fechaHaceNMeses } from '../utils'

const PRESETS: { key: Preset; label: string; meses: number | null }[] = [
    { key: 'hoy', label: 'Hoy',     meses: null },
    { key: '1m',  label: '1 mes',   meses: 1    },
    { key: '3m',  label: '3 meses', meses: 3    },
    { key: '6m',  label: '6 meses', meses: 6    },
    { key: '12m', label: '1 año',   meses: 12   },
]

interface Props {
    fechaInicio: string
    fechaFin: string
    estado: string
    preset: Preset
    onFechaInicioChange: (v: string) => void
    onFechaFinChange: (v: string) => void
    onEstadoChange: (v: string) => void
    onPresetChange: (inicio: string, fin: string, key: Preset) => void
    onConsultar: () => void
}

export function FiltrosBoletas({
    fechaInicio, fechaFin, estado, preset,
    onFechaInicioChange, onFechaFinChange, onEstadoChange,
    onPresetChange, onConsultar,
}: Props) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1">
                {PRESETS.map((p) => (
                    <Button
                        key={p.key}
                        size="sm"
                        variant={preset === p.key ? 'default' : 'outline'}
                        onClick={() => {
                            const inicio = p.meses === null ? hoy() : fechaHaceNMeses(p.meses)
                            onPresetChange(inicio, hoy(), p.key)
                        }}
                    >
                        {p.label}
                    </Button>
                ))}
            </div>
            <div className="w-px h-6 bg-border mx-1" />
            <Input type="date" value={fechaInicio} onChange={(e) => onFechaInicioChange(e.target.value)} className="w-36 h-9 text-sm" />
            <span className="text-muted-foreground text-sm">→</span>
            <Input type="date" value={fechaFin} onChange={(e) => onFechaFinChange(e.target.value)} className="w-36 h-9 text-sm" />
            <Select value={estado || 'todos'} onValueChange={(v) => onEstadoChange(v === 'todos' ? '' : v)}>
                <SelectTrigger className="w-36 h-9 text-sm">
                    <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="aceptada">Aceptada</SelectItem>
                    <SelectItem value="rechazada">Rechazada</SelectItem>
                </SelectContent>
            </Select>
            <Button size="sm" onClick={onConsultar}>Consultar</Button>
        </div>
    )
}