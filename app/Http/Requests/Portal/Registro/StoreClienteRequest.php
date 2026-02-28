<?php

namespace App\Http\Requests\Portal\Registro;

use Illuminate\Foundation\Http\FormRequest;

class StoreClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $esNatural = $this->input('tipo_persona') === 'natural';

        return [
            'tipo_persona'        => ['required', 'in:natural,juridica'],
            'nombre'              => ['required', 'string', 'max:100'],
            'apellidos'           => $esNatural
                                        ? ['required', 'string', 'max:100']
                                        : ['nullable', 'string', 'max:100'],
            'dni'                 => $esNatural
                                        ? ['required', 'digits:8', 'unique:clientes,dni']
                                        : ['nullable'],
            'ruc'                 => !$esNatural
                                        ? ['required', 'digits:11', 'unique:clientes,ruc']
                                        : ['nullable'],
            'departamento'        => ['required', 'string', 'max:100'],
            'email'               => ['required', 'email:rfc,dns', 'unique:clientes,email', 'max:150'],
            'telefono'            => ['required', 'string', 'max:20', 'unique:clientes,telefono'],
            'archivo_comprobante' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'acepta_politicas'    => ['required', 'accepted'],
            'acepta_terminos'     => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'tipo_persona.required'         => 'Selecciona el tipo de persona.',
            'tipo_persona.in'               => 'Tipo de persona no válido.',
            'nombre.required'               => 'El nombre es obligatorio.',
            'nombre.string'                 => 'El nombre debe ser texto válido.',
            'apellidos.required'            => 'Los apellidos son obligatorios.',
            'apellidos.string'              => 'Los apellidos deben ser texto válido.',
            'dni.required'                  => 'El DNI es obligatorio.',
            'dni.digits'                    => 'El DNI debe tener exactamente 8 dígitos.',
            'dni.unique'                    => 'Este DNI ya está registrado.',
            'ruc.required'                  => 'El RUC es obligatorio.',
            'ruc.digits'                    => 'El RUC debe tener exactamente 11 dígitos.',
            'ruc.unique'                    => 'Este RUC ya está registrado.',
            'departamento.required'         => 'El departamento es obligatorio.',
            'departamento.string'           => 'El departamento debe ser texto válido.',
            'email.required'                => 'El correo es obligatorio.',
            'email.email'                   => 'Ingresa un correo válido.',
            'email.unique'                  => 'Este correo ya está registrado.',
            'telefono.required'             => 'El teléfono es obligatorio.',
            'telefono.unique'               => 'Este teléfono ya está registrado.',
            'archivo_comprobante.required'  => 'Debes subir un comprobante.',
            'archivo_comprobante.mimes'     => 'El comprobante debe ser JPG, PNG o PDF.',
            'archivo_comprobante.max'       => 'El comprobante no debe superar los 5MB.',
            'acepta_politicas.accepted'     => 'Debes aceptar las políticas de privacidad.',
            'acepta_terminos.accepted'      => 'Debes aceptar los términos y condiciones.',
        ];
    }
}