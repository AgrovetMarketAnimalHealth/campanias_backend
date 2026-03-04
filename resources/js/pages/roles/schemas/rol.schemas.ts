import { z } from 'zod';

export const rolSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50, 'Máximo 50 caracteres'),
    permissions: z.array(z.number()).min(1, 'Debe seleccionar al menos un permiso'),
});

export type RolFormData = z.infer<typeof rolSchema>;