import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import type { BreadcrumbItem } from '@/types'
import clientes from '@/routes/clientes'
import { ClientesTable } from './components/ClientesTable'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clientes',
        href: clientes.index().url,
    },
]

export default function Clientes() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clientes" />
            <div className="flex flex-1 flex-col gap-6 py-6">
                <div className="px-4 lg:px-6">
                    <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Gestiona los clientes registrados y revisa sus boletas.
                    </p>
                </div>
                <ClientesTable />
            </div>
        </AppLayout>
    )
}