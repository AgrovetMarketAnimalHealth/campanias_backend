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
    $boleta = $this->route('boleta');
    $esAceptada = $this->input('estado') === 'aceptada';

    // Mínimo dinámico según la campaña; al rechazar siempre basta con > 0
    $montoMinimo = $esAceptada ? $boleta->montoMinimoParaAceptar() : 0.01;

    return [
        'estado' => ['required', 'in:aceptada,rechazada'],

        'numero_boleta' => array_filter([
            'required',
            'string',
            'max:100',
            $esAceptada
                ? Rule::unique('boletas', 'numero_boleta')
                    ->ignore($boleta->id)
                    ->where(fn ($query) => $query->whereIn('estado', ['pendiente', 'aceptada']))
                : null,
        ]),

        'monto' => [
            'required',
            'numeric',
            "min:{$montoMinimo}",
        ],

        'puntos' => ['required_if:estado,aceptada', 'integer', 'min:1'],

        'observacion' => [
            !$esAceptada ? 'required' : 'nullable',
            'string',
        ],
    ];
}
    public function messages(): array
    {
        return [
            'numero_boleta.required' => 'El número de comprobante es obligatorio.',
            'numero_boleta.unique'   => 'Este número de comprobante ya existe en el sistema.',
            'monto.required'         => 'El monto es obligatorio.',
            'monto.min'              => 'El monto mínimo para aceptar un comprobante es de S/ 1,000.',
            'puntos.required_if'     => 'Los puntos son obligatorios al aceptar.',
            'puntos.min'             => 'Los puntos deben ser mayor a 0.',
            'puntos.integer'         => 'Los puntos deben ser números enteros.',
            'observacion.required'   => 'La observación es obligatoria al rechazar.',
             'monto.min' => 'El monto no cumple con el mínimo requerido para esta campaña.',
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
