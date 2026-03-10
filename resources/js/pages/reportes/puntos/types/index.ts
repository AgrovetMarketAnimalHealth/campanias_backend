export interface Punto {
    id: string
    imagen: string | null
    puntos: string | number
    cliente_id: string
    cliente_tipo: 'natural' | 'juridica'
    cliente_nom: string
    cliente_apl: string | null
    cliente_dni: string | null
    cliente_ruc: string | null
    cliente_email: string
    cliente_departamento: string
    telefono: string | null
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

export interface ExportStatus {
    listo: boolean
    url?: string
    size?: number
}