import axios from 'axios'
import type { Notificacion, PaginatedResponse } from '../types'

export const notificacionService = {
    async getNotificaciones(params: {
        search?: string
        estado?: string
        tipo?: string
        page?: number
        per_page?: number
    }): Promise<PaginatedResponse<Notificacion>> {
        const filtered = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== 'todos')
        )
        const { data } = await axios.get('/promo-concierto/backoffice/notificacion', { params: filtered })
        return data
    },

    async reenviar(id: string): Promise<{ message: string }> {
        const { data } = await axios.post(`/promo-concierto/backoffice/notificacion/${id}/reenviar`)
        return data
    },
}