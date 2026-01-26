<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class Wqm010Request extends FormRequest
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
            'import_file'               => ['file'],
        ];

        return $rules;
    }

    public function messages()
    {
        // メッセージ初期化
        $messages = [];

        $messages =  [
            'import_file.file'              => ['WQ-0006W', 'ファイル'],
        ];

        return $messages;
    }
}
