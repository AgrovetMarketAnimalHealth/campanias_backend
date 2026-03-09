export function formatPuntos(puntos: string | number | null): number {
    if (puntos === null || puntos === undefined) return 0
    return typeof puntos === 'string' ? parseFloat(puntos) : puntos
}

export function nombreCompleto(tipo: string, nom: string, apl: string | null): string {
    if (tipo === 'juridica') return nom
    return [nom, apl].filter(Boolean).join(' ')
}

export function docLabel(tipo: string): string {
    return tipo === 'juridica' ? 'RUC' : 'DNI'
}

export function docValor(tipo: string, dni: string | null, ruc: string | null): string {
    return (tipo === 'juridica' ? ruc : dni) ?? '—'
}

export function tipoBadgeColor(tipo: string): string {
    return tipo === 'juridica'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
}