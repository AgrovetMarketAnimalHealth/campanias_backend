import { z } from 'zod';

export const storeUsuarioSchema = z.object({
    name:     z.string().min(1, 'El nombre es obligatorio').max(100),
    email:    z.string().min(1, 'El correo es obligatorio').email('Correo inválido').max(120),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    activo:   z.boolean(),
    role_id:  z.number({ required_error: 'El rol es obligatorio' }).min(1, 'El rol es obligatorio'),
});

export const updateUsuarioSchema = z.object({
    name:     z.string().min(1, 'El nombre es obligatorio').max(100),
    email:    z.string().min(1, 'El correo es obligatorio').email('Correo inválido').max(150),
    password: z.string().min(8, 'Mínimo 8 caracteres').or(z.literal('')).optional(),
    activo:   z.boolean(),
    role_id:  z.number({ required_error: 'El rol es obligatorio' }).min(1, 'El rol es obligatorio'),
});

export type StoreUsuarioForm = z.infer<typeof storeUsuarioSchema>;
export type UpdateUsuarioForm = z.infer<typeof updateUsuarioSchema>;