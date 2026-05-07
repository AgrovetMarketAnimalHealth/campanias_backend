import axios from 'axios'
import type {
    Campania,
    CampaniaFilters,
    PaginatedResponse,
    StoreCampaniaPayload,
    UpdateCampaniaPayload,
} from '../types/compania.types'

const BASE = '/promo-concierto/backoffice/compania'

export const campaniasService = {
    async index(filters?: CampaniaFilters): Promise<PaginatedResponse<Campania>> {
        const res = await axios.get<PaginatedResponse<Campania>>(BASE, { params: filters })
        return res.data
    },

    async show(id: string): Promise<Campania> {
        const res = await axios.get<{ data: Campania }>(`${BASE}/${id}`)
        return res.data.data
    },

    async store(payload: StoreCampaniaPayload): Promise<Campania> {
        const res = await axios.post<{ data: Campania }>(BASE, payload)
        return res.data.data
    },

    async update(id: string, payload: UpdateCampaniaPayload): Promise<Campania> {
        const res = await axios.put<{ data: Campania }>(`${BASE}/${id}`, payload)
        return res.data.data
    },

    async destroy(id: string): Promise<void> {
        await axios.delete(`${BASE}/${id}`)
    },

    async toggleActiva(id: string): Promise<Campania> {
        const res = await axios.post<{ data: Campania }>(`${BASE}/${id}/toggle-activa`)
        return res.data.data
    },
}