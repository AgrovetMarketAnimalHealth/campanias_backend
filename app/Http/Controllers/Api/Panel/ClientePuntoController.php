<?php

namespace App\Http\Controllers\Api\Panel;

use App\Http\Controllers\Controller;
use App\Http\Resources\Punto\ClientePuntoResource;
use App\Models\Cliente;
use App\Models\Punto;
use Illuminate\Http\Request;

class ClientePuntoController extends Controller{
    public function index(Request $request)
    {
        $perPage = min((int) $request->input('per_page', 50), 200);

        $puntos = Punto::with('cliente')
            ->orderByDesc('puntos')   // los de mayor peso primero
            ->paginate($perPage);

        return ClientePuntoResource::collection($puntos);
    }
}