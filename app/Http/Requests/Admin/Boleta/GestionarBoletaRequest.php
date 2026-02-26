<?php

namespace App\Http\Requests\Admin\Boleta;

use Illuminate\Foundation\Http\FormRequest;

class GestionarBoletaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'puntos'      => ['sometimes', 'integer', 'min:1'],
            'observacion' => ['sometimes', 'string', 'max:500'],
        ];
    }
}