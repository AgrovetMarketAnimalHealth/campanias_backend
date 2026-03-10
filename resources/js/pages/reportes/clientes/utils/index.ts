import type { Cliente } from '../types'

export function nombreCompleto(cliente: Cliente): string {
    if (cliente.tipo_persona === 'juridica') return cliente.nombre
    return [cliente.nombre, cliente.apellidos].filter(Boolean).join(' ')
}

export function docLabel(tipo: Cliente['tipo_persona']): string {
    return tipo === 'juridica' ? 'RUC' : 'DNI'
}

export function docValor(cliente: Cliente): string {
    return (cliente.tipo_persona === 'juridica' ? cliente.ruc : cliente.dni) ?? '—'
}

export function estadoBadgeClass(estado: Cliente['estado']): string {
    switch (estado) {
        case 'activo':    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        case 'pendiente': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        case 'rechazado': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        default:          return 'bg-muted text-muted-foreground'
    }
}

export function tipoBadgeClass(tipo: Cliente['tipo_persona']): string {
    return tipo === 'juridica'
        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
        : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
}

export function formatFecha(iso: string): string {
    return new Date(iso).toLocaleDateString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
}

export function formatFechaHora(iso: string): string {
    return new Date(iso).toLocaleString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

/** 'YYYY-MM' → 'Ene 25' */
export function labelMes(mes: string): string {
    const [y, m] = mes.split('-')
    const nombres = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    return `${nombres[parseInt(m) - 1]} ${y.slice(2)}`
}

export function hoy(): string {
    return new Date().toISOString().split('T')[0]
}

export function fechaHaceNMeses(n: number): string {
    const d = new Date()
    d.setMonth(d.getMonth() - n)
    return d.toISOString().split('T')[0]
}