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
    activos: number
    pendientes: number
    rechazados: number
}

export interface MetricasPeriodo {
    rango: { inicio: string; fin: string }
    total_periodo: number
    inscritos_por_dia: { fecha: string; total: number }[]
    inscritos_por_mes: { mes: string; total: number }[]
    por_estado: Record<string, number>
    por_tipo_persona: Record<string, number>
    recientes: RecienteCliente[]
}

export interface RecienteCliente {
    id: string
    nombre: string
    email: string
    estado: string
    tipo_persona: string
    fecha: string
    hora: string
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

export type Preset = 'hoy' | '1m' | '3m' | '6m' | '12m'