import axios from 'axios'
import type { Cliente, Boleta, PaginatedResponse } from '../types'

export const clienteService = {
    async getClientes(params: {
        search?: string
        tipo_persona?: string
        departamento?: string
        estado?: string
        page?: number
        per_page?: number
    }): Promise<PaginatedResponse<Cliente>> {
        const filtered = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== 'todas')
        )
        const { data } = await axios.get('/cliente', { params: filtered })
        return data
    },

    async getBoletas(
        clienteId: string,
        params: { estado?: string; page?: number; per_page?: number }
    ): Promise<PaginatedResponse<Boleta>> {
        const filtered = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
        )
        const { data } = await axios.get(`/cliente/${clienteId}/boletas`, { params: filtered })
        return data
    },
}