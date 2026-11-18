import * as React from 'react';
import axios from 'axios';
import {
    IconAlertCircle,
    IconDownload,
    IconFileText,
    IconLoader2,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { puntoService } from '../services/puntoService';
import type { OpcionSorteoDistribuidor } from '../types';

interface ApiErrorResponse {
    message?: string;
    errors?: Record<string, string[]>;
}

interface Exportacion {
    filename: string;
    url: string;
}

const MAX_BOLETOS = 10000;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseDistribuidores(json: string): OpcionSorteoDistribuidor[] {
    let parsed: unknown;

    try {
        parsed = JSON.parse(json);
    } catch {
        throw new Error('El contenido no es un JSON válido.');
    }

    if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > 500) {
        throw new Error(
            'Pega un arreglo JSON con entre 1 y 500 distribuidores.',
        );
    }

    const distribuidores = parsed.map((item, index) => {
        const prefix = `Registro ${index + 1}: `;
        if (!isRecord(item)) throw new Error(`${prefix}se esperaba un objeto.`);

        const {
            distribuidor_razon_social: razonSocial,
            opciones_sorteo: opciones,
            ruc,
            representante,
            celular,
        } = item;

        if (
            typeof razonSocial !== 'string' ||
            razonSocial.trim() === '' ||
            razonSocial.length > 255
        ) {
            throw new Error(
                `${prefix}distribuidor_razon_social debe ser un texto de hasta 255 caracteres.`,
            );
        }
        if (
            !Number.isSafeInteger(opciones) ||
            Number(opciones) < 1 ||
            Number(opciones) > MAX_BOLETOS
        ) {
            throw new Error(
                `${prefix}opciones_sorteo debe ser un entero entre 1 y ${MAX_BOLETOS}.`,
            );
        }
        if (typeof ruc !== 'string' || !/^\d{11}$/.test(ruc)) {
            throw new Error(`${prefix}ruc debe ser un texto de 11 dígitos.`);
        }
        if (
            typeof representante !== 'string' ||
            representante.trim() === '' ||
            representante.length > 255
        ) {
            throw new Error(
                `${prefix}representante debe ser un texto de hasta 255 caracteres.`,
            );
        }
        if (
            typeof celular !== 'string' ||
            celular.trim() === '' ||
            celular.length > 30
        ) {
            throw new Error(
                `${prefix}celular debe ser un texto de hasta 30 caracteres.`,
            );
        }

        return {
            distribuidor_razon_social: razonSocial.trim(),
            opciones_sorteo: Number(opciones),
            ruc,
            representante: representante.trim(),
            celular: celular.trim(),
        };
    });

    const total = distribuidores.reduce(
        (sum, item) => sum + item.opciones_sorteo,
        0,
    );
    if (total > MAX_BOLETOS) {
        throw new Error(
            `El total de opciones no puede superar los ${MAX_BOLETOS.toLocaleString()} boletos.`,
        );
    }

    return distribuidores;
}

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const response = error.response?.data;
        const details = Object.values(response?.errors ?? {})
            .flat()
            .join(' ');
        return response?.message || details || error.message;
    }

    return error instanceof Error
        ? error.message
        : 'No se pudo generar el archivo.';
}

export function ExportarBoletosDesdeJson({
    campaniaId,
}: {
    campaniaId: string;
}) {
    const [open, setOpen] = React.useState(false);
    const [json, setJson] = React.useState('');
    const [generando, setGenerando] = React.useState(false);
    const [error, setError] = React.useState('');
    const [exportacion, setExportacion] = React.useState<Exportacion | null>(
        null,
    );

    const totalOpciones = React.useMemo(() => {
        try {
            return parseDistribuidores(json).reduce(
                (total, item) => total + item.opciones_sorteo,
                0,
            );
        } catch {
            return null;
        }
    }, [json]);

    const generar = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setExportacion(null);

        let distribuidores: OpcionSorteoDistribuidor[];
        try {
            distribuidores = parseDistribuidores(json);
        } catch (validationError) {
            setError(getErrorMessage(validationError));
            return;
        }

        setGenerando(true);
        try {
            const result = await puntoService.exportarBoletosDesdeJson(
                campaniaId,
                distribuidores,
            );

            while (true) {
                await new Promise((resolve) => setTimeout(resolve, 3000));
                const status = await puntoService.estadoBoletos(
                    result.filename,
                );
                if (status.listo && status.url) {
                    setExportacion({
                        filename: result.filename,
                        url: status.url,
                    });
                    break;
                }
            }
        } catch (generationError) {
            setError(getErrorMessage(generationError));
        } finally {
            setGenerando(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => !generando && setOpen(nextOpen)}
        >
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <IconFileText className="size-4" />
                    Generar desde JSON
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Generar boletos desde JSON</DialogTitle>
                    <DialogDescription>
                        Pega el arreglo de distribuidores. Se generará un boleto
                        por cada opción_sorteo y se descargará un ZIP con los
                        PDF.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={generar} className="flex flex-col gap-4">
                    <Textarea
                        value={json}
                        onChange={(event) => setJson(event.target.value)}
                        placeholder={
                            '[\n  {\n    "distribuidor_razon_social": "DISTRIBUIDOR S.A.C.",\n    "opciones_sorteo": 68,\n    "ruc": "20600835506",\n    "representante": "Nombre del representante",\n    "celular": "950648934"\n  }\n]'
                        }
                        className="min-h-72 font-mono text-xs"
                        disabled={generando}
                        aria-label="JSON de opciones del sorteo"
                    />
                    {totalOpciones !== null && (
                        <p className="text-sm text-muted-foreground">
                            Total de boletos a generar:{' '}
                            <span className="font-semibold text-foreground">
                                {totalOpciones.toLocaleString()}
                            </span>
                        </p>
                    )}
                    {error && (
                        <p
                            role="alert"
                            className="flex items-start gap-2 text-sm text-destructive"
                        >
                            <IconAlertCircle className="mt-0.5 size-4 shrink-0" />
                            {error}
                        </p>
                    )}
                    {exportacion && (
                        <p className="text-sm text-emerald-700">
                            Los boletos están listos. Puedes descargar el
                            archivo.
                        </p>
                    )}
                    <DialogFooter className="gap-2">
                        {exportacion && (
                            <Button asChild variant="outline" className="gap-2">
                                <a
                                    href={exportacion.url}
                                    download={exportacion.filename}
                                >
                                    <IconDownload className="size-4" />
                                    Descargar ZIP
                                </a>
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={generando}
                            className="gap-2"
                        >
                            {generando ? (
                                <>
                                    <IconLoader2 className="size-4 animate-spin" />{' '}
                                    Generando PDF...
                                </>
                            ) : (
                                <>
                                    <IconFileText className="size-4" /> Generar
                                    boletos
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
