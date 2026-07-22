export interface Campania {
    id: string;
    nombre: string;
    url: string;
    activa: number;
    valor_minimo: number;
    created_at: string;
    updated_at: string;
}

export interface CampaniaPaginado {
    data: Campania[];
}