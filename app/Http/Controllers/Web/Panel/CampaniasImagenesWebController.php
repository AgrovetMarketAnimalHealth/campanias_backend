<?php

namespace App\Http\Controllers\Web\Panel;

use App\Http\Controllers\Controller;
use App\Http\Resources\Campanias\CampaniasResource;
use App\Models\CampaniaImagenes;
use App\Models\Campanias;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CampaniasImagenesWebController extends Controller{
    public function index(string $campania_id)
    {
        Gate::authorize('viewAny', CampaniaImagenes::class);
        $campania = Campanias::findOrFail($campania_id);
        
        return response()->json([
            'campania' => new CampaniasResource($campania),
        ]);
    }
}
