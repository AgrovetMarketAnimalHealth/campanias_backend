import axios from 'axios'
import type { Campania, PaginatedResponse } from '../types'

export const campaniaService = {
    async getCampanias(): Promise<PaginatedResponse<Campania>> {
        const { data } = await axios.get('/promo-concierto/backoffice/campania')
        return data
    },
}