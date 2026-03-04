import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { RolesDataTable } from './components/RolesDataTable';
import type { BreadcrumbItem } from '@/types';
import roles from '@/routes/roles';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: roles.index().url,
    },
];

export default function IndexRoles() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="flex flex-col gap-4 py-4">
                <div className="px-4 lg:px-6">
                    <h1 className="text-xl font-semibold">Roles</h1>
                    <p className="text-sm text-muted-foreground">
                        Gestiona los roles y sus permisos de acceso al sistema.
                    </p>
                </div>
                <RolesDataTable />
            </div>
        </AppLayout>
    );
}