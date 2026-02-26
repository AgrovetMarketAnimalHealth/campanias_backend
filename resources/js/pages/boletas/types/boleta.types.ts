export type EstadoBoleta = 'pendiente' | 'aceptada' | 'rechazada';

export interface Boleta {
    id: string;
    cliente_id: string;
    cliente_tipo: string;
    cliente_dni: string | null;
    cliente_ruc: string | null;
    cliente_nom: string;
    codigo: string;
    archivo: string | null;
    puntos_otorgados: number;
    monto: number;
    numero_boleta: string;
    estado: EstadoBoleta;
    observacion: string;
    created_at: string;
    updated_at: string | null;
}

export interface BoletaPaginado {
    data: Boleta[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface BoletaFiltros {
    search: string;
    estado: EstadoBoleta | '';
    fecha_desde: string;
    fecha_hasta: string;
    per_page: number;
    page: number;
}

export interface UpdateBoletaPayload {
    estado: 'aceptada' | 'rechazada';
    numero_boleta: string;
    monto: number;
    puntos?: number;
    observacion?: string;
}