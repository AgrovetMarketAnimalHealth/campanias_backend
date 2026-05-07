<?php

namespace App\Http\Requests\Admin\Campanias;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCampaniasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $campaniaId = $this->route('campania');

        return [
            'nombre'       => ['sometimes', 'required', 'string', 'max:255'],
            'dominio'      => ['sometimes', 'required', 'string', 'max:255', Rule::unique('campanias', 'dominio')->ignore($campaniaId)],
            'activa'       => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'   => 'El nombre de la campaña es obligatorio.',
            'dominio.unique'    => 'Este dominio ya está en uso por otra campaña.',
            'activa.boolean'    => 'El campo activa debe ser un valor booleano.',
        ];
    }
}
