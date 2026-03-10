import * as React from 'react'
import { IconSend } from '@tabler/icons-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { clienteService } from '../services/clienteService'

interface EnviarReporteDialogProps {
    open: boolean
    onClose: () => void
    fechaInicio: string
    fechaFin: string
}

export function EnviarReporteDialog({
    open,
    onClose,
    fechaInicio,
    fechaFin,
}: EnviarReporteDialogProps) {
    const [email,   setEmail]   = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [error,   setError]   = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState(false)

    function handleClose() {
        setEmail('')
        setError(null)
        setSuccess(false)
        onClose()
    }

    async function handleEnviar() {
        if (!email) return
        setLoading(true)
        setError(null)
        try {
            await clienteService.enviarReporte(email)
            setSuccess(true)
            setTimeout(handleClose, 1800)
        } catch {
            setError('Error al enviar el reporte. Verifica el email e intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconSend className="size-5" />
                        Enviar reporte por email
                    </DialogTitle>
                    <DialogDescription>
                        Se generará un Excel con los inscritos del período{' '}
                        <strong>{fechaInicio}</strong> al <strong>{fechaFin}</strong>{' '}
                        y se enviará al correo indicado.
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-4 text-center text-sm font-medium text-green-600 dark:text-green-400">
                        ✅ Reporte enviado correctamente a {email}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 py-2">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="email-destino">Email de destino</Label>
                            <Input
                                id="email-destino"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleEnviar()}
                            />
                        </div>
                        {error && (
                            <p className="text-xs text-destructive">{error}</p>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    {!success && (
                        <Button
                            onClick={handleEnviar}
                            disabled={!email || loading}
                        >
                            {loading ? 'Enviando…' : 'Enviar'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}