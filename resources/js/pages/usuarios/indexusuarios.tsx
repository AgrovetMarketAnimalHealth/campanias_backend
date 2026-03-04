import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { UsuariosDataTable } from './components/UsuariosDataTable';
import type { BreadcrumbItem } from '@/types';
import usuarios from '@/routes/usuarios';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: usuarios.index().url,
    },
];

export default function IndexUsuarios() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <div className="flex flex-col gap-4 py-4">
                <div className="px-4 lg:px-6">
                    <h1 className="text-xl font-semibold">Usuarios</h1>
                    <p className="text-sm text-muted-foreground">
                        Gestiona los usuarios del sistema y sus roles asignados.
                    </p>
                </div>
                <UsuariosDataTable />
            </div>
        </AppLayout>
    );
}