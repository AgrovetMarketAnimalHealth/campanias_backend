<?php
namespace App\Http\Requests\Admin\Campanias;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCampaniasRequests extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255', Rule::unique('campanias', 'nombre')],
            'url'    => ['required', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'activa' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la campaña es obligatorio.',
            'nombre.unique'   => 'Ya existe una campaña con ese nombre.',
            'url.required'    => 'El identificador es obligatorio.',
            'url.regex'       => 'El identificador solo puede contener letras minúsculas, números y guiones (ej: suralan-sorteo).',
        ];
    }
}
