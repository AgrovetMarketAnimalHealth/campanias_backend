export interface Boleta {
    id: string
    codigo: string
    numero_boleta: string
    monto: number
    puntos_otorgados: number
    estado: 'pendiente' | 'aceptada' | 'rechazada'
    observacion: string | null
    created_at: string
    cliente?: {
        id: string
        nombre: string
        apellidos: string | null
        tipo_persona: string
    }
}

export interface MetricasGenerales {
    total_boletas: number
    boletas_hoy: number
    boletas_mes: number
    pendientes: number
    aceptadas: number
    rechazadas: number
}

export interface PorDia {
    fecha: string
    pendiente: number
    aceptada: number
    rechazada: number
}

export interface PorMes {
    mes: string
    pendiente: number
    aceptada: number
    rechazada: number
}

export interface MetricasPeriodo {
    rango: { inicio: string; fin: string }
    total_periodo: number
    por_estado: Record<string, number>
    monto_aceptado: number
    por_dia: PorDia[]
    por_mes: PorMes[]
    recientes: RecienteBoleta[]
}

export interface RecienteBoleta {
    id: string
    codigo: string
    numero_boleta: string
    monto: number
    puntos_otorgados: number
    estado: string
    observacion: string | null
    cliente: string
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