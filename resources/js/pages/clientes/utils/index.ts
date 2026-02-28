export function formatMonto(monto: string | number | null): string {
    if (monto === null || monto === undefined) return 'S/ 0.00'
    const num = typeof monto === 'string' ? parseFloat(monto) : monto
    return `S/ ${num.toFixed(2)}`
}

export function estadoBadgeColor(estado: string): string {
    switch (estado) {
        case 'aceptada':  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
        case 'pendiente': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
        case 'rechazada': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
        default:          return 'bg-muted text-muted-foreground'
    }
}

export function tipoPersonaLabel(tipo: string): string {
    return tipo === 'natural' ? 'Persona Natural' : 'Persona Jurídica'
}