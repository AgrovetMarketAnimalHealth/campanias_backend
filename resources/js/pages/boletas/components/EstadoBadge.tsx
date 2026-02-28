import { Badge } from '@/components/ui/badge';
import { IconCircleCheckFilled, IconClock, IconXboxX } from '@tabler/icons-react';
import type { EstadoBoleta } from '../types/boleta.types';

interface Props {
    estado: EstadoBoleta;
}

const config: Record<EstadoBoleta, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
    pendiente: {
        label: 'Pendiente',
        variant: 'outline',
        icon: <IconClock className="size-3 text-yellow-500" />,
    },
    aceptada: {
        label: 'Aceptada',
        variant: 'outline',
        icon: <IconCircleCheckFilled className="size-3 fill-green-500 dark:fill-green-400" />,
    },
    rechazada: {
        label: 'Rechazada',
        variant: 'outline',
        icon: <IconXboxX className="size-3 text-red-500" />,
    },
};

export function EstadoBadge({ estado }: Props) {
    const { label, variant, icon } = config[estado];
    return (
        <Badge variant={variant} className="gap-1 px-1.5 text-muted-foreground">
            {icon}
            {label}
        </Badge>
    );
}