export function estadoBadgeClass(estado: string): string {
    switch (estado) {
        case 'enviado':  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
        case 'fallido':  return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
        case 'pendiente': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
        default:         return 'bg-muted text-muted-foreground'
    }
}

export function formatFecha(iso: string | null): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}