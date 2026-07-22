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
            'valor_minimo' => ['required', 'numeric', 'min:0'],
            'activa' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la campaña es obligatorio.',
            'nombre.unique'   => 'Ya existe otra campaña con ese nombre.',
            'url.required'    => 'El identificador es obligatorio.',
            'url.regex'       => 'El identificador solo puede contener letras minúsculas, números, guiones y barras (ej: promo-chayanne/veterinarios).',
            'valor_minimo.required' => 'El valor mínimo es obligatorio.',
            'valor_minimo.numeric'  => 'El valor mínimo debe ser un número.',
            'valor_minimo.min'      => 'El valor mínimo no puede ser negativo.',
            'activa.required' => 'El estado activa es obligatorio.',
        ];
    }
}