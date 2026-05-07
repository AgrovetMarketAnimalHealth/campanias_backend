import { z } from 'zod'

export const CampaniaSchema = z.object({
    id: z.string().uuid(),

    nombre: z.string().min(3, 'El nombre es obligatorio').max(150),

    dominio: z.string().url('Debe ser un dominio válido').optional().nullable(),

    api_key: z.string().optional(),

    activa: z.boolean(),

    creador:      z.object({ id: z.number(), nombre: z.string() }).optional(),
    actualizador: z.object({ id: z.number(), nombre: z.string() }).optional(),

    created_at: z.string(),
    updated_at: z.string(),
})

export const StoreCampaniaSchema = z.object({
    nombre: z.string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(150, 'El nombre no puede superar 150 caracteres'),

    dominio: z.string().url('Debe ser una URL válida').optional().nullable(),

    activa: z.boolean().optional(),
})

export const UpdateCampaniaSchema = StoreCampaniaSchema.partial()

export const CampaniaFiltersSchema = z.object({
    search:   z.string().optional(),
    activa:   z.boolean().optional(),
    per_page: z.number().optional(),
    page:     z.number().optional(),
})

export type CampaniaSchemaType        = z.infer<typeof CampaniaSchema>
export type StoreCampaniaSchemaType   = z.infer<typeof StoreCampaniaSchema>
export type UpdateCampaniaSchemaType  = z.infer<typeof UpdateCampaniaSchema>
export type CampaniaFiltersSchemaType = z.infer<typeof CampaniaFiltersSchema>