import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import roles from '@/routes/roles';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: roles.index().url,
    },
];
export default function Roles() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
        </AppLayout>
    );
}