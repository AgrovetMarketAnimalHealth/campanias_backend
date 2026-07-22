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
            'nombre' => ['required', 'string', 'max:255', Rule::unique('campanias', 'nombre')->ignore($campaniaId)],
            'url' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:[-\/][a-z0-9]+)*\/?$/'],
            'activa' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la campaña es obligatorio.',
            'nombre.unique'   => 'Ya existe otra campaña con ese nombre.',
            'url.required'    => 'El identificador es obligatorio.',
            'url.regex' => 'El identificador solo puede contener letras minúsculas, números, guiones y barras (ej: promo-chayanne/veterinarios).',
            'activa.required' => 'El estado activa es obligatorio.',
        ];
    }
}
