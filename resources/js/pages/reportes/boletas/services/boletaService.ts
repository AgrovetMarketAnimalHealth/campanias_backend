import type { MetricasPeriodo, PaginatedResponse, Boleta } from '../types'

const BASE = '/promo-concierto/backoffice/tickets'

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : ''
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        ...options,
    })
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message ?? `HTTP ${res.status}`)
    }
    return res.json()
}

export const boletaService = {
    async getMetricas(params: { fecha_inicio: string; fecha_fin: string }): Promise<MetricasPeriodo> {
        const q = new URLSearchParams(params)
        return apiFetch<MetricasPeriodo>(`${BASE}/metricas?${q}`)
    },

    async getListado(params: {
        fecha_inicio?: string
        fecha_fin?: string
        estado?: string
        page?: number
        per_page?: number
    }): Promise<PaginatedResponse<Boleta>> {
        const limpio = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
        ) as Record<string, string>
        return apiFetch<PaginatedResponse<Boleta>>(`${BASE}/listado?${new URLSearchParams(limpio)}`)
    },

    exportarUrl(params: { fecha_inicio: string; fecha_fin: string; estado?: string }): string {
        const limpio = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
        ) as Record<string, string>
        return `${BASE}/exportar?${new URLSearchParams(limpio)}`
    },

    async enviarReporte(params: {
        email_destino: string
        fecha_inicio: string
        fecha_fin: string
    }): Promise<void> {
        await apiFetch<void>(`${BASE}/enviar-reporte`, {
            method: 'POST',
            body: JSON.stringify(params),
        })
    },
}