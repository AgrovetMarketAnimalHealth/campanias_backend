import type { CampaniaPaginado } from '../types/campania.types';

const BASE = '/promo-concierto/backoffice/campania';

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
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
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export const campaniaService = {
    async index(): Promise<CampaniaPaginado> {
        return apiFetch<CampaniaPaginado>(BASE);
    },
};