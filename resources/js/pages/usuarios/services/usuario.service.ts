import usuario from '@/routes/usuario';
import type { Usuario, UsuarioPaginado, UsuarioFiltros } from '../types/usuario.types';

function xsrf(): string {
    return decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '');
}

async function handleResponse<T>(res: Response): Promise<T> {
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
}

export const usuarioService = {
    async index(filtros: Partial<UsuarioFiltros> = {}): Promise<UsuarioPaginado> {
        const params = new URLSearchParams();
        if (filtros.search)   params.set('search', filtros.search);
        if (filtros.status !== undefined && filtros.status !== '') params.set('status', filtros.status);
        if (filtros.per_page) params.set('per_page', String(filtros.per_page));
        if (filtros.page)     params.set('page', String(filtros.page));

        const url = usuario.index().url + (params.toString() ? `?${params}` : '');
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        return handleResponse(res);
    },

    async show(id: number): Promise<Usuario> {
        const res = await fetch(usuario.show(id).url, {
            headers: { Accept: 'application/json' },
        });
        const data = await handleResponse<{ user: Usuario }>(res);
        return data.user;
    },

    async store(payload: Record<string, unknown>): Promise<Usuario> {
        const res = await fetch(usuario.store().url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-XSRF-TOKEN': xsrf(),
            },
            body: JSON.stringify(payload),
        });
        return handleResponse(res);
    },

    async update(id: number, payload: Record<string, unknown>): Promise<Usuario> {
        const res = await fetch(usuario.update(id).url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-XSRF-TOKEN': xsrf(),
            },
            body: JSON.stringify(payload),
        });
        const data = await handleResponse<{ user: Usuario }>(res);
        return data.user;
    },

    async destroy(id: number): Promise<void> {
        const res = await fetch(usuario.destroy(id).url, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'X-XSRF-TOKEN': xsrf(),
            },
        });
        return handleResponse(res);
    },
};