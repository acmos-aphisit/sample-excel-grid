<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class Mng020Request extends FormRequest
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

        // 処理判定
        $index = 0;
        foreach ($this->data_to_save as $row) {
            $rules['data_to_save.' . $index . '.pointNo'] = ['required', 'max:9', 'regex:/^([0-9]\d*)$/'];
            $rules['data_to_save.' . $index . '.pointDspName'] = ['required', 'max:51'];
            $rules['data_to_save.' . $index . '.pointReportName'] = ['required', 'max:51'];
            $rules['data_to_save.' . $index . '.saisuiKbnNo'] = ['required'];
            $rules['data_to_save.' . $index . '.sisetuNo'] = ['required'];
            $rules['data_to_save.' . $index . '.processNo'] = ['required'];

            $index++;
        }

        return $rules;
    }

    public function messages()
    {
        // メッセージ初期化
        $messages = [];

        // 処理判定
        $index = 0;
        foreach ($this->data_to_save as $row) {
            // 地点番号
            $messages['data_to_save.' . $index . '.pointNo.required'] = ['WQ-0006W', '地点番号'];
            $messages['data_to_save.' . $index . '.pointNo.max'] = ['WQ-0011W', '地点番号', '9'];
            $messages['data_to_save.' . $index . '.pointNo.regex'] = ['WQ-0004W', '地点番号'];

            // 地点名称画面
            $messages['data_to_save.' . $index . '.pointDspName.required'] = ['WQ-0006W', '地点名称画面'];
            $messages['data_to_save.' . $index . '.pointDspName.max'] = ['WQ-0011W', '地点名称画面', '9'];

            // 地点名称報告書
            $messages['data_to_save.' . $index . '.pointReportName.required'] = ['WQ-0006W', '地点名称報告書'];
            $messages['data_to_save.' . $index . '.pointReportName.max'] = ['WQ-0011W', '地点名称報告書', '9'];

            // 採水区分名称
            $messages['data_to_save.' . $index . '.saisuiKbnNo.required'] = ['WQ-0006W', '採水区分名称'];

            // 浄水場
            $messages['data_to_save.' . $index . '.sisetuNo.required'] = ['WQ-0006W', '浄水場'];

            // 処理過程
            $messages['data_to_save.' . $index . '.processNo.required'] = ['WQ-0006W', '処理過程'];

            $index++;
        }

        return $messages;
    }
}
