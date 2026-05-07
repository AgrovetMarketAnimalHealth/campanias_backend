// ─── Entidades ────────────────────────────────────────────────────────────────

export interface UserMini {
    id: number
    nombre: string
}

export interface Campania {
    id: string
    nombre: string
    dominio?: string | null
    api_key?: string
    activa: boolean

    creador?: UserMini
    actualizador?: UserMini

    created_at: string
    updated_at: string
}

// ─── Paginación ───────────────────────────────────────────────────────────────

export interface PaginatedMeta {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: PaginatedMeta
}

// ─── Filtros ──────────────────────────────────────────────────────────────────

export interface CampaniaFilters {
    search?: string
    activa?: boolean
    per_page?: number
    page?: number
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface StoreCampaniaPayload {
    nombre: string
    dominio?: string | null
    activa?: boolean
}

export type UpdateCampaniaPayload = Partial<StoreCampaniaPayload>

// ─── Respuesta con api_key visible (solo al crear) ───────────────────────────

export interface CampaniaSecure {
    id: string
    nombre: string
    api_key: string
}