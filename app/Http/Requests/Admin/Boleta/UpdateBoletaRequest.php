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
        return [
            'estado'        => ['required', 'in:aceptada,rechazada'],
            'numero_boleta' => [
                'required',
                'string',
                'max:100',
                // Unique ignorando la boleta actual y solo entre las ACEPTADAS
                Rule::unique('boletas', 'numero_boleta')
                    ->ignore($this->route('boleta')->id)
                    ->where(fn ($query) => $query->where('estado', 'aceptada')),
            ],
            'monto'      => ['required', 'numeric', 'min:0.01'],
            'puntos'     => ['required_if:estado,aceptada', 'integer', 'min:1'],
            'observacion' => [
                $this->input('estado') === 'rechazada' ? 'required' : 'nullable',
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
            'monto.min'              => 'El monto debe ser mayor a 0.',
            'puntos.required_if'     => 'Los puntos son obligatorios al aceptar.',
            'puntos.integer'         => 'Los puntos deben ser números enteros.',
            'observacion.required'   => 'La observación es obligatoria al rechazar.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->route('boleta')->estado !== 'pendiente') {
                $validator->errors()->add('estado', 'La boleta ya fue procesada.');
            }
        });
    }
}