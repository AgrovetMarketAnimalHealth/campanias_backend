<?php

namespace App\Http\Controllers\Api\Panel;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class NotificacionesController extends Controller{
    public function index(Request $request): JsonResponse{
        Gate::authorize('viewAny', Notificacion::class);

        $query = Notificacion::with(['cliente', 'user'])
            ->latest('created_at');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('destinatario_email', 'like', "%$s%")
                  ->orWhere('asunto', 'like', "%$s%");
            });
        }

        if ($request->filled('estado') && $request->estado !== 'todos') {
            $query->where('estado_envio', $request->estado);
        }

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        $data = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'data'  => $data->map(fn($n) => $this->format($n)),
            'meta'  => [
                'current_page' => $data->currentPage(),
                'last_page'    => $data->lastPage(),
                'per_page'     => $data->perPage(),
                'total'        => $data->total(),
                'from'         => $data->firstItem(),
                'to'           => $data->lastItem(),
            ],
            'links' => [
                'first' => $data->url(1),
                'last'  => $data->url($data->lastPage()),
                'prev'  => $data->previousPageUrl(),
                'next'  => $data->nextPageUrl(),
            ],
        ]);
    }
    public function reenviar(string $id): JsonResponse{
        $notificacion = Notificacion::findOrFail($id);

        if ($notificacion->estado_envio !== 'fallido') {
            return response()->json(['message' => 'Solo se pueden reenviar notificaciones fallidas.'], 422);
        }

        // Aquí va tu lógica de reenvío (Brevo, mail, etc.)
        // Por ahora marcamos como pendiente para que el worker lo tome
        $notificacion->update([
            'estado_envio' => 'pendiente',
            'intentos'     => 0,
        ]);

        return response()->json(['message' => 'Notificación marcada para reenvío.']);
    }
    private function format(Notificacion $n): array{
        return [
            'id'                => $n->id,
            'tipo'              => $n->tipo,
            'destinatario_email'=> $n->destinatario_email,
            'asunto'            => $n->asunto,
            'estado_envio'      => $n->estado_envio,
            'intentos'          => $n->intentos,
            'enviado_at'        => $n->enviado_at?->toISOString(),
            'leido_at'          => $n->leido_at?->toISOString(),
            'created_at'        => $n->created_at?->toISOString(),
            'cliente'           => $n->cliente ? [
                'id'     => $n->cliente->id,
                'nombre' => $n->cliente->nombre . ' ' . $n->cliente->apellidos,
                'email'  => $n->cliente->email,
            ] : null,
        ];
    }
}
