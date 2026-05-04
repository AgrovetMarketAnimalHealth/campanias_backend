<?php

namespace App\Http\Requests\Admin\Cliente;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $cliente = $this->route('cliente');

        return [
            'nombre'       => ['sometimes', 'string', 'max:255'],
            'apellidos'    => ['sometimes', 'nullable', 'string', 'max:255'],
            'email'        => ['sometimes', 'email', 'max:255', Rule::unique('clientes', 'email')->ignore($cliente->id)],
            'dni'          => ['sometimes', 'nullable', 'string', 'max:20', Rule::unique('clientes', 'dni')->ignore($cliente->id)],
            'ruc'          => ['sometimes', 'nullable', 'string', 'max:20', Rule::unique('clientes', 'ruc')->ignore($cliente->id)],
            'telefono'     => ['sometimes', 'string', 'max:20'],
            'departamento' => ['sometimes', 'string', 'max:255'],
            'estado'       => ['sometimes', Rule::in(['pendiente', 'activo', 'rechazado'])],
        ];
    }
}
