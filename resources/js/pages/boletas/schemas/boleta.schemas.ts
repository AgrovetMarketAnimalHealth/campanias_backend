import { z } from 'zod';

const camposBase = {
    numero_boleta: z
        .string({ required_error: 'El número de comprobante es requerido' })
        .min(1, 'El número de comprobante es requerido')
        .max(100, 'Máximo 100 caracteres'),

    ruc_veterinaria: z
        .string({ required_error: 'El RUC de la veterinaria es requerido' })
        .length(11, 'El RUC debe tener exactamente 11 dígitos')
        .regex(/^[0-9]{11}$/, 'El RUC solo debe contener números'),
};

export function getAceptarBoletaSchema(montoMinimo: number) {
    const minimo = montoMinimo > 0 ? montoMinimo : 0.01;

    return z.object({
        ...camposBase,
        monto: z
            .number({ invalid_type_error: 'El monto es requerido' })
            .min(minimo, `El monto mínimo para aceptar es S/ ${minimo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`),
        puntos: z
            .number({ invalid_type_error: 'Los puntos son requeridos' })
            .int('Los puntos deben ser números enteros')
            .min(1, 'Los puntos deben ser mayores a 0')
            .max(9999999, 'Valor máximo excedido'),
        observacion: z.string().optional(),
    });
}

export const rechazarBoletaSchema = z.object({
    ...camposBase,
    monto: z
        .number({ invalid_type_error: 'El monto es requerido' })
        .min(0.01, 'El monto debe ser mayor a 0'),
    observacion: z
        .string()
        .min(5, 'La observación debe tener al menos 5 caracteres')
        .max(500, 'Máximo 500 caracteres'),
});

export type AceptarBoletaForm = z.infer<ReturnType<typeof getAceptarBoletaSchema>>;
export type RechazarBoletaForm = z.infer<typeof rechazarBoletaSchema>;