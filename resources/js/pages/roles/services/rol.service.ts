import rol from '@/routes/rol';
import roles from '@/routes/roles';
import type { Rol, Permiso, RolForm } from '../types/rol.types';

async function handleResponse<T>(res: Response): Promise<T> {
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
}

export const rolService = {
    async index(): Promise<{ data: Rol[] }> {
        const res = await fetch(rol.index().url, {
            headers: { Accept: 'application/json' },
        });
        return handleResponse(res);
    },

    async permisos(): Promise<{ permissions: Permiso[] }> {
        const res = await fetch(rol.indexPermisos().url, {
            headers: { Accept: 'application/json' },
        });
        return handleResponse(res);
    },

    async show(id: number): Promise<Rol> {
        const res = await fetch(rol.show(id).url, {
            headers: { Accept: 'application/json' },
        });
        return handleResponse(res);
    },

    async store(data: RolForm): Promise<Rol> {
        const res = await fetch(rol.store().url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-XSRF-TOKEN': decodeURIComponent(
                    document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''
                ),
            },
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    },

    async update(id: number, data: RolForm): Promise<Rol> {
        const res = await fetch(rol.update(id).url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-XSRF-TOKEN': decodeURIComponent(
                    document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''
                ),
            },
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    },

    async destroy(id: number): Promise<void> {
        const res = await fetch(rol.destroy(id).url, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'X-XSRF-TOKEN': decodeURIComponent(
                    document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''
                ),
            },
        });
        return handleResponse(res);
    },
};