import { z } from 'zod';

const camposBase = {
    numero_boleta: z
        .string({ required_error: 'El número de comprobante es requerido' })
        .min(1, 'El número de comprobante es requerido')
        .max(100, 'Máximo 100 caracteres'),
    monto: z
        .number({ invalid_type_error: 'El monto es requerido' })
        .min(0.01, 'El monto debe ser mayor a 0'),
};

export const aceptarBoletaSchema = z.object({
    ...camposBase,
    puntos: z
        .number({ invalid_type_error: 'Los puntos son requeridos' })
        .int('Los puntos deben ser números enteros')
        .min(1, 'Los puntos deben ser mayores a 0')
        .max(9999999, 'Valor máximo excedido'),
    observacion: z.string().optional(),
});

export const rechazarBoletaSchema = z.object({
    ...camposBase,
    observacion: z
        .string()
        .min(5, 'La observación debe tener al menos 5 caracteres')
        .max(500, 'Máximo 500 caracteres'),
});

export type AceptarBoletaForm = z.infer<typeof aceptarBoletaSchema>;
export type RechazarBoletaForm = z.infer<typeof rechazarBoletaSchema>;