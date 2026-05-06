<?php

namespace App\Http\Resources\CampaniaImagenes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaniaImagenesResources extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
        ];
    }
}