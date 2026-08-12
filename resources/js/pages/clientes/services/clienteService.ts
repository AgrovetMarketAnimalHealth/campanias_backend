import axios from 'axios'
import type { Cliente, Boleta, PaginatedResponse } from '../types'

export const clienteService = {
    async getClientes(params: {
        search?: string
        tipo_persona?: string
        departamento?: string
        estado?: string
        campania_id?: string
        page?: number
        per_page?: number
    }): Promise<PaginatedResponse<Cliente>> {
        const filtered = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== 'todas')
        )
        const { data } = await axios.get('/promo-concierto/backoffice/cliente', { params: filtered })
        return data
    },

    async getBoletas(
        clienteId: string,
        params: { estado?: string; page?: number; per_page?: number }
    ): Promise<PaginatedResponse<Boleta>> {
        const filtered = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
        )
        const { data } = await axios.get(
            `/promo-concierto/backoffice/cliente/${clienteId}/boletas`,
            { params: filtered }
        )
        return data
    },

    async updateCliente(
        clienteId: string,
        payload: Record<string, string>
    ): Promise<Cliente> {
        const { data } = await axios.put(
            `/promo-concierto/backoffice/cliente/${clienteId}`,
            payload
        )
        return data.data
    },

    async registrarCliente(payload: {
        campania_id: string
        tipo_persona: string
        nombre: string
        apellidos?: string
        dni?: string
        ruc?: string
        departamento: string
        email: string
        telefono: string
        archivo_comprobante?: File | null
    }): Promise<{ success: boolean; message: string; data: { cliente: Cliente; boleta: Boleta | null } }> {
        const formData = new FormData()
        Object.entries(payload).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') return
            formData.append(key, value as string | Blob)
        })

        const { data } = await axios.post('/promo-concierto/backoffice/cliente', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },

    async subirBoleta(
        clienteId: string,
        archivo: File
    ): Promise<{ success: boolean; message: string; data: Boleta }> {
        const formData = new FormData()
        formData.append('cliente_id', clienteId)
        formData.append('archivo', archivo)

        const { data } = await axios.post('/promo-concierto/backoffice/boleta', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },
}