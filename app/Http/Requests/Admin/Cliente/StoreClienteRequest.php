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

    public function messages(): array
    {
        return [
            'campania_id.required' => 'La campaña es obligatoria.',
            'campania_id.uuid'     => 'El identificador de la campaña no es válido.',
            'campania_id.exists'   => 'La campaña seleccionada no existe o no está activa.',

            'tipo_persona.required' => 'El tipo de persona es obligatorio.',
            'tipo_persona.in'       => 'El tipo de persona debe ser "natural" o "jurídica".',

            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.string'   => 'El nombre debe ser un texto válido.',
            'nombre.max'      => 'El nombre no debe superar los 150 caracteres.',

            'apellidos.required_if' => 'Los apellidos son obligatorios para personas naturales.',
            'apellidos.string'      => 'Los apellidos deben ser un texto válido.',
            'apellidos.max'         => 'Los apellidos no deben superar los 150 caracteres.',

            'dni.required_if' => 'El DNI es obligatorio para personas naturales.',
            'dni.digits'       => 'El DNI debe tener exactamente 8 dígitos.',
            'dni.unique'       => 'Ya existe un cliente registrado con este DNI.',

            'ruc.required_if' => 'El RUC es obligatorio para personas jurídicas.',
            'ruc.digits'       => 'El RUC debe tener exactamente 11 dígitos.',
            'ruc.unique'       => 'Ya existe un cliente registrado con este RUC.',

            'departamento.required' => 'El departamento es obligatorio.',
            'departamento.string'   => 'El departamento debe ser un texto válido.',
            'departamento.max'      => 'El departamento no debe superar los 100 caracteres.',

            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email'     => 'El correo electrónico no tiene un formato válido.',
            'email.max'       => 'El correo electrónico no debe superar los 150 caracteres.',
            'email.unique'    => 'Ya existe un cliente registrado con este correo electrónico.',

            'telefono.required' => 'El teléfono es obligatorio.',
            'telefono.string'   => 'El teléfono debe ser un texto válido.',
            'telefono.max'      => 'El teléfono no debe superar los 20 caracteres.',

            'archivo_comprobante.file'  => 'El comprobante debe ser un archivo válido.',
            'archivo_comprobante.mimes' => 'El comprobante debe ser un archivo con formato JPG, JPEG, PNG o PDF.',
            'archivo_comprobante.max'   => 'El comprobante no debe superar los 5 MB.',
        ];
    }

    public function attributes(): array
    {
        return [
            'campania_id'          => 'campaña',
            'tipo_persona'         => 'tipo de persona',
            'nombre'               => 'nombre',
            'apellidos'            => 'apellidos',
            'dni'                  => 'DNI',
            'ruc'                  => 'RUC',
            'departamento'         => 'departamento',
            'email'                => 'correo electrónico',
            'telefono'             => 'teléfono',
            'archivo_comprobante'  => 'archivo de comprobante',
        ];
    }
}