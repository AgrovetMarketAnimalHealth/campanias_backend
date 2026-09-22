import axios from 'axios'
import type { Punto, PaginatedResponse, ExportStatus } from '../types'

const BASE = '/promo-concierto/backoffice/punto'

export const puntoService = {
    async getPuntos(params: {
        page?: number
        per_page?: number
        campania_id?: string
    }): Promise<PaginatedResponse<Punto>> {
        const filtered = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
        )
        const { data } = await axios.get(BASE, { params: filtered })
        return data
    },

    async exportarBoletos(campaniaId: string): Promise<{ filename: string; url: string }> {
        const { data } = await axios.post(`${BASE}/exportar-boletos`, {
            campania_id: campaniaId,
        })
        return data
    },

    async estadoBoletos(filename: string): Promise<ExportStatus> {
        const { data } = await axios.get(`${BASE}/estado-boletos/${filename}`)
        return data
    },
}