<?php

namespace App\Http\Requests\Admin\Campanias;

use Illuminate\Foundation\Http\FormRequest;

class StoreCampaniasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre'       => ['required', 'string', 'max:255'],
            'dominio'      => ['required', 'string', 'max:255', 'unique:campanias,dominio'],
            'activa'       => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'   =>  'El nombre de la campaña es obligatorio.',
            'dominio.unique'    =>  'Este dominio ya está en uso por otra campaña.',
            'activa.boolean'    =>  'El campo activa debe ser un valor booleano.',
        ];
    }
}