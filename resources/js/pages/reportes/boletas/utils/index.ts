import type { Boleta } from '../types'

export function estadoBadgeClass(estado: Boleta['estado']): string {
    switch (estado) {
        case 'aceptada':  return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        case 'pendiente': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        case 'rechazada': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        default:          return 'bg-muted text-muted-foreground'
    }
}

export function formatMonto(monto: number): string {
    return `S/ ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
}

export function formatFecha(iso: string): string {
    return new Date(iso).toLocaleDateString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
}

export function formatFechaHora(iso: string): string {
    return new Date(iso).toLocaleString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
}

export function hoy(): string {
    return new Date().toISOString().split('T')[0]
}

export function fechaHaceNMeses(n: number): string {
    const d = new Date()
    d.setMonth(d.getMonth() - n)
    return d.toISOString().split('T')[0]
}

export function labelDia(fecha: string): string {
    const d = new Date(fecha + 'T00:00:00')
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

export function labelMes(mes: string): string {
    const [y, m] = mes.split('-')
    const d = new Date(Number(y), Number(m) - 1, 1)
    return d.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })
}