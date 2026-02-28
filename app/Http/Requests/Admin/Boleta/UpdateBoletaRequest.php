<?php
namespace App\Http\Requests\Admin\Boleta;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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

            'numero_boleta' => array_filter([
                'required',
                'string',
                'max:100',
                // Solo valida único entre aceptadas si se está aceptando
                $esAceptada
                    ? Rule::unique('boletas', 'numero_boleta')
                        ->ignore($this->route('boleta')->id)
                        ->where(fn ($query) => $query->where('estado', 'aceptada'))
                    : null,
            ]),

            // Aceptada: mínimo 1000 | Rechazada: solo que sea positivo
            'monto' => [
                'required',
                'numeric',
                $esAceptada ? 'min:1000' : 'min:0.01',
            ],

            // Puntos: el admin los ingresa manualmente al aceptar
            'puntos' => ['required_if:estado,aceptada', 'integer', 'min:1'],

            // Observacion: obligatoria al rechazar para explicar el motivo
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
            'numero_boleta.required' => 'El número de comprobante es obligatorio.',
            'numero_boleta.unique'   => 'Este número de comprobante ya fue aceptado anteriormente. Debe ser rechazado.',
            'monto.required'         => 'El monto es obligatorio.',
            'monto.min'              => 'El monto mínimo para aceptar un comprobante es de S/ 1,000.',
            'puntos.required_if'     => 'Los puntos son obligatorios al aceptar.',
            'puntos.min'             => 'Los puntos deben ser mayor a 0.',
            'puntos.integer'         => 'Los puntos deben ser números enteros.',
            'observacion.required'   => 'La observación es obligatoria al rechazar.',
            'observacion.max'        => 'La observación no puede superar los 1,000 caracteres.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // No se puede procesar una boleta que ya fue aceptada o rechazada
            if ($this->route('boleta')->estado !== 'pendiente') {
                $validator->errors()->add('estado', 'La boleta ya fue procesada anteriormente.');
            }
        });
    }
}