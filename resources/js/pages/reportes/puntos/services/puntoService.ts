import axios from 'axios'
import type { Punto, PaginatedResponse, ExportStatus } from '../types'

const BASE = '/promo-concierto/backoffice/punto'

export const puntoService = {
    async getPuntos(params: {
        page?: number
        per_page?: number
    }): Promise<PaginatedResponse<Punto>> {
        const filtered = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
        )
        const { data } = await axios.get(BASE, { params: filtered })
        return data
    },

    async exportarBoletos(): Promise<{ filename: string; url: string }> {
        const { data } = await axios.post(`${BASE}/exportar-boletos`)
        return data
    },

    async estadoBoletos(filename: string): Promise<ExportStatus> {
        const { data } = await axios.get(`${BASE}/estado-boletos/${filename}`)
        return data
    },
}