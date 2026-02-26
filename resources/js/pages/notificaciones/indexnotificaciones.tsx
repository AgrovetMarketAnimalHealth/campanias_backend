import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import notificaciones from '@/routes/notificaciones';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notificaciones',
        href: notificaciones.index().url,
    },
];
export default function Notificaciones() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notificaciones" />
        </AppLayout>
    );
}