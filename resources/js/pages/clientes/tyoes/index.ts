export type TipoPersona = 'natural' | 'juridica' | 'todas'

export interface Cliente {
    id: string
    nombre: string
    apellidos: string
    departamento: string
    dni: string | null
    ruc: string | null
    tipo_persona: 'natural' | 'juridica'
    email: string
    telefono: string | null
    estado: string
    email_verificado: boolean
    total_puntos: number
    boletas_aceptadas: number
    boletas_pendientes: number
    boletas_rechazadas: number
    registrado_en: string
}

export interface Boleta {
    id: string
    codigo: string
    numero_boleta: string | null
    monto: string | number | null
    puntos_otorgados: number
    estado: 'aceptada' | 'pendiente' | 'rechazada'
    observacion: string | null
    archivo_url: string | null
    fecha: string
}

// Estructura real del JSON de Laravel Resource con paginación
export interface PaginatedMeta {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
}

export interface PaginatedLinks {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: PaginatedMeta
    links: PaginatedLinks
}