import axios from 'axios';
import type { Campania, CampaniaFiltros, CampaniaPaginado } from '../types/campania.types';

interface ServerError {
    message?: string;
    errors?: Record<string, string[]>;
}

function normalizeError(error: unknown): ServerError {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        return {
            message: data?.message ?? error.message ?? 'Error inesperado.',
            errors: data?.errors,
        };
    }
    return { message: 'Error inesperado.' };
}

export const campaniaService = {
    async index(params: Partial<CampaniaFiltros>): Promise<CampaniaPaginado> {
        const cleanParams: Record<string, string | number> = {};

        if (params.nombre)   cleanParams.nombre   = params.nombre;
        if (params.activa !== undefined && params.activa !== '')
                             cleanParams.activa   = params.activa;
        if (params.per_page) cleanParams.per_page = params.per_page;
        if (params.page)     cleanParams.page     = params.page;

        try {
            const { data } = await axios.get<CampaniaPaginado>('/promo-concierto/backoffice/campania', {
                params: cleanParams,
            });
            return data;
        } catch (error) {
            throw normalizeError(error);
        }
    },

    async show(id: string): Promise<Campania> {
        try {
            const { data } = await axios.get<{ data: Campania }>(`/promo-concierto/backoffice/campania/${id}`);
            return data.data;
        } catch (error) {
            throw normalizeError(error);
        }
    },

    async store(payload: {
        nombre: string;
        url: string;
        activa: boolean;
    }): Promise<Campania> {
        try {
            const { data } = await axios.post<{ data: Campania }>('/promo-concierto/backoffice/campania', payload);
            return data.data;
        } catch (error) {
            throw normalizeError(error);
        }
    },

    async update(
        id: string,
        payload: {
            nombre: string;
            url: string;
            activa: boolean;
        },
    ): Promise<Campania> {
        try {
            const { data } = await axios.put<{ data: Campania }>(`/promo-concierto/backoffice/campania/${id}`, payload);
            return data.data;
        } catch (error) {
            throw normalizeError(error);
        }
    },

    async destroy(id: string): Promise<void> {
        try {
            await axios.delete(`/promo-concierto/backoffice/campania/${id}`);
        } catch (error) {
            throw normalizeError(error);
        }
    },
};