<?php

namespace App\Http\Controllers\Api\Panel;

use App\Filters\Campania\ActivaCampaniaFilter;
use App\Filters\Campania\SearchCampaniaFilter;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Campanias\StoreCampaniasRequest;
use App\Http\Requests\Admin\Campanias\UpdateCampaniasRequest;
use App\Http\Resources\Campanias\CampaniasResource;
use App\Models\Campanias;
use App\Services\CampaniaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Pipeline;

class CampaniasController extends Controller{
    public function __construct(
        private readonly CampaniaService $campaniaService
    ) {}
    public function index(Request $request): AnonymousResourceCollection{
        Gate::authorize('viewAny', Campanias::class);
        $query = Pipeline::send(Campanias::query())
            ->through([
                new SearchCampaniaFilter($request->input('search')),
                new ActivaCampaniaFilter($request->input('activa')),
            ])
            ->thenReturn()
            ->with(['creador', 'actualizador'])
            ->latest();

        return CampaniasResource::collection(
            $query->paginate($request->input('per_page', 15))
        );
    }
    public function store(StoreCampaniasRequest $request): JsonResponse{
        Gate::authorize('create', Campanias::class);
        $campania = $this->campaniaService->crear($request->validated());
        return response()->json(
            new CampaniasResource($campania->load('creador')),
            201
        );
    }
    public function show(Campanias $campania): CampaniasResource{
        Gate::authorize('view', $campania);
        return new CampaniasResource($campania->load(['creador', 'actualizador']));
    }
    public function update(UpdateCampaniasRequest $request, Campanias $campania): CampaniasResource{
        Gate::authorize('update', $campania);
        $campania = $this->campaniaService->actualizar($campania, $request->validated());
        return new CampaniasResource($campania->load(['creador', 'actualizador']));
    }
    public function destroy(Campanias $campania): JsonResponse{
        Gate::authorize('delete', $campania);
        $this->campaniaService->eliminar($campania);
        return response()->json(['message' => 'Campaña eliminada correctamente.']);
    }
    public function toggleActiva(Campanias $campania): CampaniasResource{
        Gate::authorize('update', $campania);
        $campania = $this->campaniaService->toggleActiva($campania);
        return new CampaniasResource($campania);
    }
}
