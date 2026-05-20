import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import campanias from '@/routes/campanias';
import { CampaniasDataTable } from './components/CampaniasDataTable';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Campañas',
        href: campanias.index().url,
    },
];

export default function Campanias() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Campañas" />
            <div className="flex flex-col gap-6 py-6">
                <div className="px-4 lg:px-6">
                    <h1 className="text-xl font-semibold">Campañas</h1>
                    <p className="text-sm text-muted-foreground">
                        Gestiona y revisa las campañas creadas.
                    </p>
                </div>
                <CampaniasDataTable />
            </div>
        </AppLayout>
    );
}