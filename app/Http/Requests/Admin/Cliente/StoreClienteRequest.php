<?php

namespace App\Http\Requests\Admin\Cliente;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'campania_id' => ['required', 'uuid', Rule::exists('campanias', 'id')->where('activa', true)],
            'tipo_persona'  => ['required', Rule::in(['natural', 'juridica'])],
            'nombre'      => ['required', 'string', 'max:150'],
            'apellidos'   => ['nullable', 'required_if:tipo_persona,natural', 'string', 'max:150'],
            'dni' => [
                'nullable',
                'required_if:tipo_persona,natural',
                'digits:8',
                Rule::unique('clientes', 'dni'),
            ],
            'ruc' => [
                'nullable',
                'required_if:tipo_persona,juridica',
                'digits:11',
                Rule::unique('clientes', 'ruc'),
            ],
            'departamento' => ['required', 'string', 'max:100'],
            'email'        => ['required', 'email', 'max:150', Rule::unique('clientes', 'email')],
            'telefono'     => ['required', 'string', 'max:20'],
            'archivo_comprobante' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }
}
