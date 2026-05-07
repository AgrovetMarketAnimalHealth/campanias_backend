import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { CampaniasTable } from './components/CampaniasTable'
import type { BreadcrumbItem } from '@/types'
import companias from '@/routes/companias'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Campañas', href: companias.index().url },
]

export default function IndexCampanias() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Campañas" />
            <div className="flex flex-col gap-6 py-6">
                <div className="px-4 lg:px-6">
                    <h1 className="text-xl font-semibold">Campañas</h1>
                    <p className="text-sm text-muted-foreground">
                        Gestiona y revisa las campañas registradas.
                    </p>
                </div>
                <div className="px-4 lg:px-6">
                    <CampaniasTable />
                </div>
            </div>
        </AppLayout>
    )
}