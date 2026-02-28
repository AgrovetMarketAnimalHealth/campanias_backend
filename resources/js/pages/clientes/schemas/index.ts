import { z } from 'zod'

export const clienteSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    apellidos: z.string(),
    departamento: z.string(),
    dni: z.string().nullable(),
    ruc: z.string().nullable(),
    tipo_persona: z.enum(['natural', 'juridica']),
    email: z.string().email(),
    telefono: z.string().nullable(),
    estado: z.string(),
    email_verificado: z.boolean(),
    total_puntos: z.number(),
    boletas_aceptadas: z.number(),
    boletas_pendientes: z.number(),
    boletas_rechazadas: z.number(),
    registrado_en: z.string(),
})

export const boletaSchema = z.object({
    id: z.string(),
    codigo: z.string(),
    numero_boleta: z.string().nullable(),
    monto: z.union([z.string(), z.number()]).nullable(),
    puntos_otorgados: z.number(),
    estado: z.enum(['aceptada', 'pendiente', 'rechazada']),
    observacion: z.string().nullable(),
    archivo_url: z.string().nullable(),
    fecha: z.string(),
})

export type ClienteSchema = z.infer<typeof clienteSchema>
export type BoletaSchema = z.infer<typeof boletaSchema>