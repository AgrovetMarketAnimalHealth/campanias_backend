import { z } from 'zod'

export const storeImagenSchema = z.object({
    seccion:         z.string().max(100).optional().or(z.literal('')),
    orden:           z.number().int().min(0).optional(),
    imagen_desktop:  z.instanceof(File).optional(),
    imagen_tablet:   z.instanceof(File).optional(),
    imagen_mobile:   z.instanceof(File).optional(),
    visible_desktop: z.boolean().default(true),
    visible_tablet:  z.boolean().default(true),
    visible_mobile:  z.boolean().default(true),
    activa:          z.boolean().default(true),
})

export type StoreImagenForm = z.infer<typeof storeImagenSchema>