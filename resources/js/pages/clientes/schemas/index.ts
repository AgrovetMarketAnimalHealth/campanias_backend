import { z } from 'zod'
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']

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
    ganador: z.boolean(),
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

export const clienteRegistroSchema = z
    .object({
        tipo_persona: z.enum(['natural', 'juridica'], {
            required_error: 'Selecciona el tipo de cliente',
        }),
        nombre: z.string().min(1, 'El nombre es requerido').max(150),
        apellidos: z.string().max(150).optional().or(z.literal('')),
        dni: z.string().optional().or(z.literal('')),
        ruc: z.string().optional().or(z.literal('')),
        departamento: z.string().min(1, 'El departamento es requerido').max(100),
        email: z.string().min(1, 'El email es requerido').email('Email inválido').max(150),
        telefono: z.string().min(1, 'El teléfono es requerido').max(20),
        archivo_comprobante: z
            .instanceof(File)
            .nullable()
            .optional()
            .refine((f) => !f || f.size <= MAX_FILE_SIZE, 'El archivo no debe superar 5MB')
            .refine(
                (f) => !f || ACCEPTED_FILE_TYPES.includes(f.type),
                'Formato no permitido (solo jpg, png o pdf)'
            ),
    })

    .superRefine((data, ctx) => {
        if (data.tipo_persona === 'natural') {
            if (!data.apellidos) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['apellidos'],
                    message: 'Los apellidos son requeridos',
                })
            }
            if (!data.dni) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['dni'],
                    message: 'El DNI es requerido',
                })
            } else if (!/^\d{8}$/.test(data.dni)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['dni'],
                    message: 'El DNI debe tener 8 dígitos',
                })
            }
        }

        if (data.tipo_persona === 'juridica') {
            if (!data.ruc) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['ruc'],
                    message: 'El RUC es requerido',
                })
            } else if (!/^\d{11}$/.test(data.ruc)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['ruc'],
                    message: 'El RUC debe tener 11 dígitos',
                })
            }
        }
    })

    export const subirBoletaSchema = z.object({
        archivo: z
            .instanceof(File, { message: 'Debes seleccionar un archivo.' })
            .refine((f) => f.size <= MAX_FILE_SIZE, 'El archivo no debe superar 5MB')
            .refine(
                (f) => ACCEPTED_FILE_TYPES.includes(f.type),
                'Formato no permitido (solo jpg, png o pdf)'
            ),
    })

export type SubirBoletaForm = z.infer<typeof subirBoletaSchema>
export type ClienteRegistroFormValues = z.infer<typeof clienteRegistroSchema>
export type ClienteSchema = z.infer<typeof clienteSchema>
export type BoletaSchema = z.infer<typeof boletaSchema>