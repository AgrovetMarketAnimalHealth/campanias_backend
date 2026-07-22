import { z } from 'zod';

const urlSlugSchema = z
    .string({ required_error: 'El identificador es obligatorio.' })
    .min(1, 'El identificador es obligatorio.')
    .max(255, 'Máximo 255 caracteres.')
    .regex(
        /^[a-z0-9]+(?:[-/][a-z0-9]+)*\/?$/,
        'Solo letras minúsculas, números, guiones y barras (ej: promo-chayanne/veterinarios).',
    );

const valorMinimoSchema = z.coerce
    .number({ required_error: 'El valor mínimo es obligatorio.', invalid_type_error: 'Debe ser un número.' })
    .min(0, 'El valor mínimo no puede ser negativo.');

export const crearCampaniaSchema = z.object({
    nombre: z
        .string({ required_error: 'El nombre es obligatorio.' })
        .min(1, 'El nombre es obligatorio.')
        .max(255, 'Máximo 255 caracteres.'),
    url: urlSlugSchema,
    valor_minimo: valorMinimoSchema,
    activa: z.coerce.boolean().default(true),
});

export const editarCampaniaSchema = z.object({
    nombre: z
        .string({ required_error: 'El nombre es obligatorio.' })
        .min(1, 'El nombre es obligatorio.')
        .max(255, 'Máximo 255 caracteres.'),
    url: urlSlugSchema,
    valor_minimo: valorMinimoSchema,
    activa: z.coerce.boolean(),
});

export type CrearCampaniaForm = z.infer<typeof crearCampaniaSchema>;
export type EditarCampaniaForm = z.infer<typeof editarCampaniaSchema>;
