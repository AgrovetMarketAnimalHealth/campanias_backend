<?php

namespace App\Http\Requests\Admin\Boleta;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBoletaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $esAceptada = $this->input('estado') === 'aceptada';

        return [
            'estado' => ['required', 'in:aceptada,rechazada'],

            'ruc_veterinaria' => [
                'required',
                'string',
                'size:11',
                'regex:/^[0-9]{11}$/',
            ],

            'numero_boleta' => [
                'required',
                'string',
                'max:100',
            ],

            'monto' => [
                'required',
                'numeric',
                $esAceptada ? 'min:1000' : 'min:0.01',
            ],

            'puntos' => ['required_if:estado,aceptada', 'integer', 'min:1'],

            'observacion' => [
                !$esAceptada ? 'required' : 'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'ruc_veterinaria.required' => 'El RUC de la veterinaria es obligatorio.',
            'ruc_veterinaria.size'     => 'El RUC debe tener exactamente 11 dígitos.',
            'ruc_veterinaria.regex'    => 'El RUC solo debe contener números.',
            'numero_boleta.required'   => 'El número de comprobante es obligatorio.',
            'monto.required'           => 'El monto es obligatorio.',
            'monto.min'                => 'El monto mínimo para aceptar un comprobante es de S/ 1,000.',
            'puntos.required_if'       => 'Los puntos son obligatorios al aceptar.',
            'puntos.min'               => 'Los puntos deben ser mayor a 0.',
            'puntos.integer'           => 'Los puntos deben ser números enteros.',
            'observacion.required'     => 'La observación es obligatoria al rechazar.',
            'observacion.max'          => 'La observación no puede superar los 1,000 caracteres.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->route('boleta')->estado !== 'pendiente') {
                $validator->errors()->add('estado', 'La boleta ya fue procesada anteriormente.');
            }
        });
    }
}
