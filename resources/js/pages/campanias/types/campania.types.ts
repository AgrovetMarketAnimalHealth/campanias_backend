export interface Campania {
    id: string;
    nombre: string;
    url: string;
    activa: boolean;
    valor_minimo: number;
    created_at: string;
    updated_at: string;
}

export interface CampaniaFiltros {
    nombre: string;
    activa: string;
    per_page: number;
    page: number;
}

export interface CampaniaPaginado {
    data: Campania[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
}