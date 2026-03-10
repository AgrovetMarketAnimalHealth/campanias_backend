export interface Cliente {
    id: string
    tipo_persona: 'natural' | 'juridica'
    nombre: string
    apellidos: string | null
    dni: string | null
    ruc: string | null
    departamento: string
    email: string
    telefono: string
    estado: 'pendiente' | 'activo' | 'rechazado'
    created_at: string
}

export interface MetricasGenerales {
    total_inscritos: number
    inscritos_hoy: number
    inscritos_mes: number
    activos: number
    pendientes: number
    rechazados: number
}

export interface InscritosPorMes {
    mes: string   // 'YYYY-MM'
    total: number
}

export interface MetricasPeriodo {
    rango: { inicio: string; fin: string }
    total_periodo: number
    inscritos_por_mes: InscritosPorMes[]
    por_estado: Record<string, number>
    por_tipo_persona: Record<string, number>
}

export interface PaginatedResponse<T> {
    data: T[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
}

export type Preset = '1m' | '3m' | '6m' | '12m'