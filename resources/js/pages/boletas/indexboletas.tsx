import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { BoletasDataTable } from './components/BoletasDataTable';
import boletas from '@/routes/boletas';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Boletas',
        href: boletas.index().url
    },
];

export default function Boletas() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Boletas" />
            <div className="flex flex-col gap-6 py-6">
                <div className="px-4 lg:px-6">
                    <h1 className="text-xl font-semibold">Boletas</h1>
                    <p className="text-sm text-muted-foreground">
                        Gestiona y revisa las boletas enviadas por los clientes.
                    </p>
                </div>
                <BoletasDataTable />
            </div>
        </AppLayout>
    );
}