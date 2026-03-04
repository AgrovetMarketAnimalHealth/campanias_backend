export interface Permiso {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

export interface Rol {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions?: Permiso[];
}

export interface RolForm {
    name: string;
    permissions: number[];
}