<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Resources\Notificacion\NotificacionResource;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NotificacionController extends Controller{
    public function index(Request $request)
    {
        try {
            $cliente = $this->getAuthenticatedCliente();
            
            $validated = $request->validate([
                'filtro' => 'nullable|in:todas,no_leidas',
                'per_page' => 'nullable|integer|min:1|max:100'
            ]);

            $notificaciones = Notificacion::where('cliente_id', $cliente->id)
                ->enviado()
                ->whereIn('tipo', $this->getTiposPermitidos())
                ->when($validated['filtro'] ?? 'todas' === 'no_leidas', function ($query) {
                    $query->noLeido();
                })
                ->latest()
                ->paginate($validated['per_page'] ?? 10);

            return response()->json([
                'success' => true,
                'data' => NotificacionResource::collection($notificaciones),
                'meta' => [
                    'total' => $notificaciones->total(),
                    'per_page' => $notificaciones->perPage(),
                    'current_page' => $notificaciones->currentPage(),
                    'last_page' => $notificaciones->lastPage(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener notificaciones: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las notificaciones'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    public function show(string $id)
    {
        try {
            $cliente = $this->getAuthenticatedCliente();
            
            $notificacion = Notificacion::where('cliente_id', $cliente->id)
                ->enviado()
                ->whereIn('tipo', $this->getTiposPermitidos())
                ->findOrFail($id);

            if (!$notificacion->leido_at) {
                $notificacion->marcarComoLeida();
            }

            return response()->json([
                'success' => true,
                'data' => new NotificacionResource($notificacion)
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Notificación no encontrada'
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            Log::error('Error al obtener notificación: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la notificación'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    public function marcarLeida(string $id)
    {
        try {
            $cliente = $this->getAuthenticatedCliente();
            
            $notificacion = Notificacion::where('cliente_id', $cliente->id)
                ->enviado()
                ->whereIn('tipo', $this->getTiposPermitidos())
                ->findOrFail($id);

            if ($notificacion->leido_at) {
                return response()->json([
                    'success' => true,
                    'message' => 'La notificación ya estaba marcada como leída'
                ]);
            }

            $notificacion->marcarComoLeida();

            return response()->json([
                'success' => true,
                'message' => 'Notificación marcada como leída exitosamente'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Notificación no encontrada'
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            Log::error('Error al marcar notificación como leída: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al marcar la notificación como leída'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    public function contadorNoLeidas()
    {
        try {
            $cliente = $this->getAuthenticatedCliente();
            
            $cantidad = Notificacion::where('cliente_id', $cliente->id)
                ->enviado()
                ->whereIn('tipo', $this->getTiposPermitidos())
                ->noLeido()
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'no_leidas' => $cantidad
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error al contar notificaciones no leídas: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el contador de notificaciones'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    private function getAuthenticatedCliente()
    {
        $cliente = Auth::guard('sanctum')->user();
        
        if (!$cliente) {
            throw new \Exception('Cliente no autenticado');
        }
        
        return $cliente;
    }
    private function getTiposPermitidos(): array{
        return [
            'boleta_aceptada',
            'boleta_rechazada',
            'boleta_pendiente',
            'puntos_acreditados',
        ];
    }
}