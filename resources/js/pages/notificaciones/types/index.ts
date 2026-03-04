export type EstadoEnvio = 'enviado' | 'fallido' | 'pendiente' | 'todos'

export interface Notificacion {
    id: string
    tipo: string
    destinatario_email: string
    asunto: string
    estado_envio: 'enviado' | 'fallido' | 'pendiente'
    intentos: number
    enviado_at: string | null
    leido_at: string | null
    created_at: string
    cliente: {
        id: string
        nombre: string
        email: string
    } | null
}

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