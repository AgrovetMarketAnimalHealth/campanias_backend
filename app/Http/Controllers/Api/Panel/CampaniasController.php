<?php

namespace App\Http\Controllers\Api\Panel;

use App\Filters\Campania\NombreCampaniaFilter;
use App\Filters\Campania\EstadoCampaniaFilter;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Campanias\StoreCampaniasRequests;
use App\Http\Requests\Admin\Campanias\UpdateCampaniasRequests;
use App\Http\Resources\Campanias\CampaniasResource;
use App\Models\Campania;
use App\Services\CampaniaService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Pipeline;

class CampaniasController extends Controller
{
    public function __construct(
        private readonly CampaniaService $campaniaService
    ) {}

    public function index(Request $request)
    {
        Gate::authorize('viewAny', Campania::class);

        $perPage = $request->input('per_page', 15);
        $nombre  = $request->input('nombre');
        $activa  = $request->input('activa');

        $query = Pipeline::send(Campania::query())
            ->through([
                new NombreCampaniaFilter($nombre),
                new EstadoCampaniaFilter($activa),
            ])
            ->thenReturn()
            ->latest('created_at');

        return CampaniasResource::collection($query->paginate($perPage));
    }

    public function show(Campania $campania)
    {
        Gate::authorize('view', $campania);

        return new CampaniasResource($campania);
    }

    public function store(StoreCampaniasRequests $request)
    {
        $campania = $this->campaniaService->crear(
            $request->validated('nombre'),
            $request->validated('url'),
            (float) $request->validated('valor_minimo'),
            (bool) $request->validated('activa'),
        );

        return new CampaniasResource($campania);
    }

    public function update(UpdateCampaniasRequests $request, Campania $campania)
    {
        $campania = $this->campaniaService->actualizar(
            $campania,
            $request->validated('nombre'),
            $request->validated('url'),
            (float) $request->validated('valor_minimo'),
            (bool) $request->validated('activa'),
        );

        return new CampaniasResource($campania);
    }

    public function destroy(Campania $campania)
    {
        Gate::authorize('delete', $campania);

        $this->campaniaService->eliminar($campania);

        return response()->noContent();
    }
}