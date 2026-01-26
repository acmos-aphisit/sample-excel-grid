<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class Wqm020Request extends FormRequest
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
        $rules =  [
            'date_from'               => ['required','date'],
            'date_to'               => ['required','date'],
        ];

        return $rules;
    }

    public function messages()
    {
        // メッセージ初期化
        $messages = [];

        $messages =  [
            'date_from.required'        => ['WQ-0006W', '検査期間From'],
            'date_from.date'            => ['WQ-0007W', '検査期間From'],
            'date_to.required'          => ['WQ-0006W', '検査期間To'],
            'date_to.date'              => ['WQ-0007W', '検査期間To'],
        ];

        return $messages;
    }
}
