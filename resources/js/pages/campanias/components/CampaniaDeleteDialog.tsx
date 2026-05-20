"use client";

import * as React from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import { campaniaService } from '../services/campania.service';
import type { Campania } from '../types/campania.types';

interface Props {
    campania: Campania;
    onDeleted: (id: string) => void;
    children: React.ReactNode;
}

export function CampaniaDeleteDialog({ campania, onDeleted, children }: Props) {
    const [loading, setLoading] = React.useState(false);

    async function handleDelete() {
        setLoading(true);
        try {
            await campaniaService.destroy(campania.id);
            toast.success(`Campaña "${campania.nombre}" eliminada.`);
            onDeleted(campania.id);
        } catch {
            toast.error('No se pudo eliminar la campaña.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <IconTrash className="size-4 text-destructive" />
                        Eliminar campaña
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Estás seguro de que deseas eliminar la campaña{' '}
                        <span className="font-semibold text-foreground">"{campania.nombre}"</span>?
                        Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? 'Eliminando...' : 'Sí, eliminar'}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}