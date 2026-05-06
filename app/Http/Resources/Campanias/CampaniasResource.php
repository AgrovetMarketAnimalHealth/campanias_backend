<?php

namespace App\Http\Resources\Campanias;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaniasResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
        ];
    }
}