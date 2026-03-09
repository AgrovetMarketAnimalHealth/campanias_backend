import * as React from 'react'
import { IconFileZip, IconLoader2, IconDownload, IconAlertCircle } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { puntoService } from '../services/puntoService'

export function ExportarBoletos() {
    type Estado = 'idle' | 'generando' | 'listo' | 'error'

    const [estado, setEstado]           = React.useState<Estado>('idle')
    const [urlDescarga, setUrlDescarga] = React.useState('')
    const [filename, setFilename]       = React.useState('')
    const [segundos, setSegundos]       = React.useState(0)
    const [errorMsg, setErrorMsg]       = React.useState('')

    const pollingRef    = React.useRef<ReturnType<typeof setInterval> | null>(null)
    const cronometroRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

    const limpiar = () => {
        if (pollingRef.current)    clearInterval(pollingRef.current)
        if (cronometroRef.current) clearInterval(cronometroRef.current)
    }

    React.useEffect(() => () => limpiar(), [])

    async function iniciar() {
        if (estado === 'generando') return
        setEstado('generando')
        setSegundos(0)
        setErrorMsg('')

        try {
            const res = await puntoService.exportarBoletos()
            setFilename(res.filename)

            cronometroRef.current = setInterval(() => setSegundos(s => s + 1), 1000)

            pollingRef.current = setInterval(async () => {
                try {
                    const status = await puntoService.estadoBoletos(res.filename)
                    if (status.listo && status.url) {
                        setUrlDescarga(status.url)
                        setEstado('listo')
                        limpiar()
                    }
                } catch { /* sigue esperando */ }
            }, 3000)

        } catch (e: any) {
            setEstado('error')
            setErrorMsg(e?.response?.data?.message ?? 'Error al iniciar la exportación')
            limpiar()
        }
    }

    return (
        <div className="flex items-center gap-3 flex-wrap">
            <Button
                onClick={iniciar}
                disabled={estado === 'generando'}
                variant={estado === 'listo' ? 'outline' : 'default'}
                className="gap-2"
            >
                {estado === 'idle'      && <><IconFileZip className="size-4" /> Generar boletos ZIP</>}
                {estado === 'generando' && <><IconLoader2 className="size-4 animate-spin" /> Generando... {segundos}s</>}
                {estado === 'listo'     && <><IconFileZip className="size-4" /> Generar de nuevo</>}
                {estado === 'error'     && <><IconAlertCircle className="size-4" /> Reintentar</>}
            </Button>

            {estado === 'listo' && urlDescarga && (
                <Button asChild variant="default" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <a href={urlDescarga} download={filename}>
                        <IconDownload className="size-4" />
                        Descargar ZIP
                    </a>
                </Button>
            )}

            {estado === 'error' && (
                <p className="text-destructive text-sm flex items-center gap-1">
                    <IconAlertCircle className="size-4" /> {errorMsg}
                </p>
            )}
        </div>
    )
}