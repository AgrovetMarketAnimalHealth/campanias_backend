<?php

namespace App\Http\Controllers\Api\Panel;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CampaniaImagenes\StoreCampaniasImagenesRequests;
use App\Http\Requests\Admin\CampaniaImagenes\UpdateCampaniasImagenesRequests;
use App\Http\Resources\CampaniaImagenes\CampaniaImagenesResources;
use App\Models\CampaniaImagenes;
use App\Models\Campanias;
use App\Services\CampaniaImagenesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class CampaniasImagenesController extends Controller{
    public function __construct(
        private readonly CampaniaImagenesService $imagenService
    ) {}
    public function index(Request $request, Campanias $campania): AnonymousResourceCollection{
        Gate::authorize('viewAny', CampaniaImagenes::class);
        $imagenes = CampaniaImagenes::query()
            ->where('campania_id', $campania->id)
            ->when($request->filled('seccion'), fn ($q) => $q->where('seccion', $request->input('seccion')))
            ->when($request->filled('activa'),  fn ($q) => $q->where('activa', filter_var($request->input('activa'), FILTER_VALIDATE_BOOLEAN)))
            ->orderBy('orden')
            ->orderBy('created_at')
            ->paginate($request->input('per_page', 15));
        return CampaniaImagenesResources::collection($imagenes);
    }
    public function store(StoreCampaniasImagenesRequests $request, Campanias $campania): JsonResponse{
        Gate::authorize('create', CampaniaImagenes::class);
        $imagen = $this->imagenService->crear(
            array_merge($request->validated(), ['campania_id' => $campania->id])
        );
        return response()->json(new CampaniaImagenesResources($imagen), 201);
    }
    public function show(Campanias $campania, CampaniaImagenes $imagen): CampaniaImagenesResources{
        Gate::authorize('view', $imagen);
        $this->verificarPertenencia($campania, $imagen);
        return new CampaniaImagenesResources($imagen);
    }
    public function update(UpdateCampaniasImagenesRequests $request, Campanias $campania, CampaniaImagenes $imagen): CampaniaImagenesResources{
        Gate::authorize('update', $imagen);
        $this->verificarPertenencia($campania, $imagen);
        $imagen = $this->imagenService->actualizar($imagen, $request->validated());
        return new CampaniaImagenesResources($imagen);
    }
    public function destroy(Campanias $campania, CampaniaImagenes $imagen): JsonResponse{
        Gate::authorize('delete', $imagen);
        $this->verificarPertenencia($campania, $imagen);
        $this->imagenService->eliminar($imagen);
        return response()->json(['message' => 'Imagen eliminada correctamente.']);
    }
    public function destroyImagen(Campanias $campania, CampaniaImagenes $imagen, string $campo): CampaniaImagenesResources{
        Gate::authorize('update', $imagen);
        $this->verificarPertenencia($campania, $imagen);
        $imagen = $this->imagenService->eliminarImagen($imagen, $campo);
        return new CampaniaImagenesResources($imagen);
    }
    public function toggleActiva(Campanias $campania, CampaniaImagenes $imagen): CampaniaImagenesResources{
        Gate::authorize('update', $imagen);
        $this->verificarPertenencia($campania, $imagen);
        $imagen = $this->imagenService->toggleActiva($imagen);
        return new CampaniaImagenesResources($imagen);
    }
    public function reordenar(Request $request, Campanias $campania): JsonResponse{
        Gate::authorize('update', Campanias::class);
        $request->validate([
            'orden'         => ['required', 'array', 'min:1'],
            'orden.*.id'    => ['required', 'uuid', 'exists:campania_imagenes,id'],
            'orden.*.orden' => ['required', 'integer', 'min:0'],
        ]);
        $this->imagenService->reordenar($request->input('orden'));
        return response()->json(['message' => 'Orden actualizado correctamente.']);
    }
    private function verificarPertenencia(Campanias $campania, CampaniaImagenes $imagen): void{
        abort_if(
            $imagen->campania_id !== $campania->id,
            404,
            'La imagen no pertenece a esta campaña.'
        );
    }
}