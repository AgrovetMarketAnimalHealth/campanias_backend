<?php

namespace App\Http\Resources\Usuario;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource{
    public function toArray($request){
        $role = $this->roles->first();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'activo' => $this->activo,
            'creacion' => Carbon::parse($this->created_at)->format('d-m-Y H:i:s A'),
            'role' => $role ? $role->name : null,
            'role_id' => $role ? $role->id : null,
        ];
    }
}