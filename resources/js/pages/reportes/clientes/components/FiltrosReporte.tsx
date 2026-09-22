import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { Campania, Preset } from '../types'
import { hoy, fechaHaceNMeses } from '../utils'

const PRESETS: { key: Preset; label: string; meses: number | null }[] = [
    { key: 'hoy', label: 'Hoy',     meses: null },
    { key: '1m',  label: '1 mes',   meses: 1    },
    { key: '3m',  label: '3 meses', meses: 3    },
    { key: '6m',  label: '6 meses', meses: 6    },
    { key: '12m', label: '1 año',   meses: 12   },
]

interface FiltrosReporteProps {
    fechaInicio: string
    fechaFin: string
    estado: string
    campaniaId: string
    campanias: Campania[]
    preset: Preset
    onFechaInicioChange: (v: string) => void
    onFechaFinChange: (v: string) => void
    onEstadoChange: (v: string) => void
    onCampaniaChange: (v: string) => void
    onPresetChange: (inicio: string, fin: string, key: Preset) => void
    onConsultar: () => void
}

export function FiltrosReporte({
    fechaInicio, fechaFin, estado, campaniaId, campanias, preset,
    onFechaInicioChange, onFechaFinChange, onEstadoChange, onCampaniaChange,
    onPresetChange, onConsultar,
}: FiltrosReporteProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Presets */}
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

            {/* Estado */}
            <Select value={estado || 'todos'} onValueChange={(v) => onEstadoChange(v === 'todos' ? '' : v)}>
                <SelectTrigger className="w-36 h-9 text-sm">
                    <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="rechazado">Rechazado</SelectItem>
                </SelectContent>
            </Select>

            <Select value={campaniaId} onValueChange={onCampaniaChange}>
                <SelectTrigger className="w-48 h-9 text-sm">
                    <SelectValue placeholder="Selecciona una campaña" />
                </SelectTrigger>
                <SelectContent>
                    {campanias.map((campania) => (
                        <SelectItem key={campania.id} value={campania.id}>
                            {campania.nombre}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button size="sm" onClick={onConsultar}>Consultar</Button>
        </div>
    )
}