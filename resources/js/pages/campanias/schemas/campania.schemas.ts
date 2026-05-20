import { z } from 'zod';

const urlSlugSchema = z
    .string({ required_error: 'El identificador es obligatorio.' })
    .min(1, 'El identificador es obligatorio.')
    .max(255, 'Máximo 255 caracteres.')
    .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Solo letras minúsculas, números y guiones (ej: suralan-sorteo).',
    );

export const crearCampaniaSchema = z.object({
    nombre: z
        .string({ required_error: 'El nombre es obligatorio.' })
        .min(1, 'El nombre es obligatorio.')
        .max(255, 'Máximo 255 caracteres.'),
    url: urlSlugSchema,
    activa: z.boolean().default(true),
});

export const editarCampaniaSchema = z.object({
    nombre: z
        .string({ required_error: 'El nombre es obligatorio.' })
        .min(1, 'El nombre es obligatorio.')
        .max(255, 'Máximo 255 caracteres.'),
    url: urlSlugSchema,
    activa: z.boolean(),
});

export type CrearCampaniaForm = z.infer<typeof crearCampaniaSchema>;
export type EditarCampaniaForm = z.infer<typeof editarCampaniaSchema>;