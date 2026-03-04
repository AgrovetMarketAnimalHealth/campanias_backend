export interface Usuario {
    id: number;
    name: string;
    email: string;
    activo: boolean;
    creacion: string;
    role: string | null;
    role_id: number | null;
}

export interface UsuarioPaginado {
    data: Usuario[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
}

export interface UsuarioFiltros {
    search: string;
    status: string;
    per_page: number;
    page: number;
}