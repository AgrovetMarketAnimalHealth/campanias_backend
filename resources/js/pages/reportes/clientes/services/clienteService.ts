import type { MetricasPeriodo, PaginatedResponse, Cliente } from '../types'

export interface FiltrosListado {
    fecha_inicio?: string
    fecha_fin?: string
    estado?: string
    page?: number
    per_page?: number
}

const BASE = '/promo-concierto/backoffice/customers'

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : ''
}

interface ApiError extends Error {
    errors: Record<string, string[]>
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
        const err = new Error(body.message ?? `HTTP ${res.status}`) as ApiError
        err.errors = body.errors ?? {}
        throw err
    }

    return res.json()
}

export const clienteService = {

    async getMetricas(params: { fecha_inicio: string; fecha_fin: string }): Promise<MetricasPeriodo> {
        const q = new URLSearchParams(params)
        return apiFetch<MetricasPeriodo>(`${BASE}/metricas?${q.toString()}`)
    },

    async getListado(params: FiltrosListado): Promise<PaginatedResponse<Cliente>> {
        const limpio = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
        ) as Record<string, string>
        const q = new URLSearchParams(limpio)
        return apiFetch<PaginatedResponse<Cliente>>(`${BASE}/listado?${q.toString()}`)
    },

    exportarUrl(params: { fecha_inicio: string; fecha_fin: string; estado?: string }): string {
        const limpio = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
        ) as Record<string, string>
        const q = new URLSearchParams(limpio)
        return `${BASE}/exportar?${q.toString()}`
    },

    async enviarReporte(emailDestino: string): Promise<void> {
        await apiFetch<void>(`${BASE}/enviar-reporte`, {
            method: 'POST',
            body: JSON.stringify({ email_destino: emailDestino }),
        })
    },
}