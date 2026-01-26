<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class Mng040Request extends FormRequest
{
    /**
     * ユーザーがこのリクエストを行う権限があるかどうかを判断
     *
     * @return bool
     */
    public function authorize()
    {
        // ユーザーがこのデータを送信する権限があるかどうかをチェックするロジックを追加（trueを返す）
        return true;
    }

    /**
     * リクエストに適用されるバリデーションルールを取得
     *
     * @return array
     */
    public function rules()
    {
        // 規則初期化
        $rules = [];

        // 選択肢のバリデーション
        $index = 0;
        foreach ($this->data_to_save as $row) {
            $rules['data_to_save.' . $index . '.itemNo'] = ['required'];
            $rules['data_to_save.' . $index . '.itemDspName'] = ['required'];
            $rules['data_to_save.' . $index . '.saisuiKbnNo'] = ['required'];
            $rules['data_to_save.' . $index . '.regulationLowLimit'] = ['nullable', 'numeric', 'regex:/^-?\d{1,10}\.\d{1,99}$/', 'decimal:8'];
            $rules['data_to_save.' . $index . '.regulationUpLimit'] = ['nullable', 'numeric', 'regex:/^-?\d{1,10}\.\d{1,99}$/', 'decimal:8'];
            $rules['data_to_save.' . $index . '.inputLowLimit'] = ['nullable', 'numeric', 'regex:/^-?\d{1,10}\.\d{1,99}$/', 'decimal:8'];
            $rules['data_to_save.' . $index . '.inputUpLimit'] = ['nullable', 'numeric', 'regex:/^-?\d{1,10}\.\d{1,99}$/', 'decimal:8'];
            $rules['data_to_save.' . $index . '.reportLowLimit'] = ['nullable', 'numeric', 'regex:/^-?\d{1,10}\.\d{1,99}$/', 'decimal:8'];
            $rules['data_to_save.' . $index . '.reportUpLimit'] = ['nullable', 'numeric', 'regex:/^-?\d{1,10}\.\d{1,99}$/', 'decimal:8'];
            $rules['data_to_save.' . $index . '.validDigits'] = ['required'];
            $rules['data_to_save.' . $index . '.inputMinDigits'] = ['required'];
            $rules['data_to_save.' . $index . '.outputMinDigits'] = ['required'];
            $rules['data_to_save.' . $index . '.inspCriteriaComment'] = ['nullable', 'max:128'];

            $index++;
        }

        return $rules;
    }

    public function messages()
    {
        // メッセージ初期化
        $messages = [];

        // 選択肢のバリデーション
        $index = 0;
        foreach ($this->data_to_save as $row) {
            // 項目番号
            $messages['data_to_save.' . $index . '.itemNo.required'] = ['WQ-0006W', '項目番号'];

            // 項目名称画面
            $messages['data_to_save.' . $index . '.itemDspName.required'] = ['WQ-0006W', '項目名称画面'];

            // 採水区分
            $messages['data_to_save.' . $index . '.saisuiKbnNo.required'] = ['WQ-0006W', '採水区分'];

            // 規制下限値
            $messages['data_to_save.' . $index . '.regulationLowLimit.numeric'] = ['WQ-0004W', '規制下限値'];
            $messages['data_to_save.' . $index . '.regulationLowLimit.regex'] = ['WQ-0012W', '規制下限値の整数部', '10桁'];
            $messages['data_to_save.' . $index . '.regulationLowLimit.decimal'] = ['WQ-0012W', '規制下限値の小数部', '8桁'];

            // 規制上限値(目標値)
            $messages['data_to_save.' . $index . '.regulationUpLimit.numeric'] = ['WQ-0004W', '規制上限値(目標値)'];
            $messages['data_to_save.' . $index . '.regulationUpLimit.regex'] = ['WQ-0012W', '規制上限値(目標値)の整数部', '10桁'];
            $messages['data_to_save.' . $index . '.regulationUpLimit.decimal'] = ['WQ-0012W', '規制上限値(目標値)の小数部', '8桁'];

            // 入力下限値(定量下限値)
            $messages['data_to_save.' . $index . '.inputLowLimit.numeric'] = ['WQ-0004W', '入力下限値(定量下限値)'];
            $messages['data_to_save.' . $index . '.inputLowLimit.regex'] = ['WQ-0012W', '入力下限値(定量下限値)の整数部', '10桁'];
            $messages['data_to_save.' . $index . '.inputLowLimit.decimal'] = ['WQ-0012W', '入力下限値(定量下限値)の小数部', '8桁'];

            // 入力上限値
            $messages['data_to_save.' . $index . '.inputUpLimit.numeric'] = ['WQ-0004W', '入力上限値'];
            $messages['data_to_save.' . $index . '.inputUpLimit.regex'] = ['WQ-0012W', '入力上限値の整数部', '10桁'];
            $messages['data_to_save.' . $index . '.inputUpLimit.decimal'] = ['WQ-0012W', '入力上限値の小数部', '8桁'];

            // 帳票下限値
            $messages['data_to_save.' . $index . '.reportLowLimit.numeric'] = ['WQ-0004W', '帳票下限値'];
            $messages['data_to_save.' . $index . '.reportLowLimit.regex'] = ['WQ-0012W', '帳票下限値の整数部', '10桁'];
            $messages['data_to_save.' . $index . '.reportLowLimit.decimal'] = ['WQ-0012W', '帳票下限値の小数部', '8桁'];

            // 帳票上限値
            $messages['data_to_save.' . $index . '.reportUpLimit.numeric'] = ['WQ-0004W', '帳票上限値'];
            $messages['data_to_save.' . $index . '.reportUpLimit.regex'] = ['WQ-0012W', '帳票上限値の整数部', '10桁'];
            $messages['data_to_save.' . $index . '.reportUpLimit.decimal'] = ['WQ-0012W', '帳票上限値の小数部', '8桁'];

            // 有効桁数
            $messages['data_to_save.' . $index . '.itemNo.validDigits'] = ['WQ-0006W', '有効桁数'];

            // 入力最小桁
            $messages['data_to_save.' . $index . '.itemNo.inputMinDigits'] = ['WQ-0006W', '入力最小桁'];

            // 出力最小桁
            $messages['data_to_save.' . $index . '.itemNo.outputMinDigits'] = ['WQ-0006W', '出力最小桁'];

            // 項目番号
            $messages['data_to_save.' . $index . '.itemNo.inspCriteriaComment'] = ['WQ-0011W', 'コメント'];

            $index++;
        }

        return $messages;
    }
}
