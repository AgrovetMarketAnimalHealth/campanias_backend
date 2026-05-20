"use client";

import { Badge } from '@/components/ui/badge';
import { IconCircleCheckFilled, IconCircleXFilled } from '@tabler/icons-react';

interface Props {
    activa: boolean;
}

export function ActivaBadge({ activa }: Props) {
    if (activa) {
        return (
            <Badge
                variant="outline"
                className="gap-1 border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400"
            >
                <IconCircleCheckFilled className="size-3" />
                Activa
            </Badge>
        );
    }

    return (
        <Badge
            variant="outline"
            className="gap-1 border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400"
        >
            <IconCircleXFilled className="size-3" />
            Inactiva
        </Badge>
    );
}