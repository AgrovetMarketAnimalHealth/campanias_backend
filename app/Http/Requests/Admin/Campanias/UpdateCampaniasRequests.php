<?php

namespace App\Http\Requests\Admin\Campanias;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCampaniasRequests extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $campaniaId = $this->route('campania')?->id;

        return [
            'nombre'  => ['required', 'string', 'max:255', Rule::unique('campanias', 'nombre')->ignore($campaniaId)],
            'url'     => ['required', 'url', 'max:500'],
            'api_key' => ['required', 'string', 'max:255'],
            'activa'  => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'  => 'El nombre de la campaña es obligatorio.',
            'nombre.unique'    => 'Ya existe otra campaña con ese nombre.',
            'url.required'     => 'La URL es obligatoria.',
            'url.url'          => 'La URL debe ser una dirección válida.',
            'api_key.required' => 'La API key es obligatoria.',
            'activa.required'  => 'El estado activa es obligatorio.',
        ];
    }
}