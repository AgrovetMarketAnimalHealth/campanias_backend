import type { Boleta, BoletaFiltros, BoletaPaginado, UpdateBoletaPayload } from '../types/boleta.types';

const BASE = '/boleta';

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

interface ApiError extends Error {
    errors: Record<string, string[]>;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        ...options,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const err = new Error(body.message ?? `HTTP ${res.status}`) as ApiError;
        err.errors = body.errors ?? {};
        throw err;
    }

    return res.json();
}

export const boletaService = {
    async index(filtros: Partial<BoletaFiltros>): Promise<BoletaPaginado> {
        const params = new URLSearchParams();
        Object.entries(filtros).forEach(([k, v]) => {
            if (v !== '' && v !== undefined && v !== null) {
                params.append(k, String(v));
            }
        });
        return apiFetch<BoletaPaginado>(`${BASE}?${params.toString()}`);
    },

    async show(id: string): Promise<Boleta> {
        const data = await apiFetch<{ data: Boleta }>(`${BASE}/${id}`);
        return data.data;
    },

    async update(id: string, payload: UpdateBoletaPayload): Promise<Boleta> {
        const data = await apiFetch<{ data: Boleta }>(`${BASE}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
        return data.data;
    },
};