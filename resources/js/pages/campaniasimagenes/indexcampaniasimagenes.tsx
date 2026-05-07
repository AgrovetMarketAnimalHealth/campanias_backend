import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import campaniasImagenes from '@/routes/campaniasImagenes'
    const { campania_id } = usePage().props as { campania_id: string | number };

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Campañas Imágenes',
        href: campaniasImagenes.index(campania_id).url
    },
];

export default function IndexCampaniasImagenes() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Campañas Imágenes" />

            <div className="flex flex-col gap-6 py-6">
                <div className="px-4 lg:px-6">
                    <h1 className="text-xl font-semibold">
                        Campañas Imágenes
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Gestiona las imágenes de las campañas.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}