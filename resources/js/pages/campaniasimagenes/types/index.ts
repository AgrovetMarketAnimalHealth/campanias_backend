export interface Campania {
    id: string
    nombre: string
    dominio: string | null
    activa: boolean
    created_at: string
    updated_at: string
}

export interface CampaniasImagenesPageProps {
    campania: {
        data: Campania
    }
}

export interface CampaniaImagen {
    id: string
    campania_id: string
    seccion: string | null
    orden: number
    imagen_desktop: string | null
    imagen_tablet: string | null
    imagen_mobile: string | null
    visible_desktop: boolean
    visible_tablet: boolean
    visible_mobile: boolean
    activa: boolean
    created_at: string
    updated_at: string
}

export interface PaginaMeta {
    current_page: number
    last_page: number
    total: number
    from: number
    to: number
    per_page: number
}

export interface PaginadoResponse {
    data: CampaniaImagen[]
    meta: PaginaMeta
}

export interface Filtros {
    seccion: string
    activa: '' | 'true' | 'false'
    per_page: number
    page: number
}

export interface ServerValidationError {
    errors?: Record<string, string[]>
    message?: string
}

export interface FeedbackState {
    type: 'success' | 'error'
    message: string
    details?: string[]
}