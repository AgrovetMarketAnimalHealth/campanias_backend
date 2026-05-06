<?php

namespace App\Http\Requests\Admin\Campanias;
use Illuminate\Foundation\Http\FormRequest;
class StoreCampaniasRequest extends FormRequest{
    public function authorize(): bool{
        return true;
    }
    public function rules(): array{
        return [

        ];
    }
    public function messages(){
        return [

        ];
    }
}