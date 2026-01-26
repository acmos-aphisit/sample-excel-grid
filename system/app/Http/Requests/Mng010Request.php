<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Log;

class Mng010Request extends FormRequest
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
            if ($row["processFlg"] == "NEW") {
                $rules['data_to_save.' . $index . '.userId'] = ['required', 'regex:/^([0-9]\d*)$/'];
                $rules['data_to_save.' . $index . '.userPassword'] = ['required', Password::min(8)];
                $rules['data_to_save.' . $index . '.userName'] = ['required', 'max:51'];

                // ふりがなの入力がある場合
                if ($row["userFurigana"]) {
                    $rules['data_to_save.' . $index . '.userFurigana'] = ['max:51'];
                }

                $rules['data_to_save.' . $index . '.affiliationSectionNo'] = ['required'];
                $rules['data_to_save.' . $index . '.securityLevel'] = ['required'];
                $rules['data_to_save.' . $index . '.registDate'] = ['required'];
                $rules['data_to_save.' . $index . '.endDate'] = ['required'];
            } else if ($row["processFlg"] == "EDIT") {
                $rules['data_to_save.' . $index . '.userId'] = ['required', 'regex:/^([0-9]\d*)$/'];

                // パスワードが入力されているかつ、入力された値
                if ($row["userPassword"]) {
                    $rules['data_to_save.' . $index . '.userPassword'] = [Password::min(8)];
                }

                $rules['data_to_save.' . $index . '.userName'] = ['required', 'max:51'];

                // ふりがなの入力がある場合
                if ($row["userFurigana"]) {
                    $rules['data_to_save.' . $index . '.userFurigana'] = ['max:51'];
                }

                $rules['data_to_save.' . $index . '.affiliationSectionNo'] = ['required'];
                $rules['data_to_save.' . $index . '.securityLevel'] = ['required'];
                $rules['data_to_save.' . $index . '.registDate'] = ['required'];
                $rules['data_to_save.' . $index . '.endDate'] = ['required'];
            }


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
            if ($row["processFlg"] == "NEW") {
                // ユーザID
                $messages['data_to_save.' . $index . '.userId.required'] = ['WQ-0006W', 'ユーザID'];
                $messages['data_to_save.' . $index . '.userId.regex'] = ['WQ-0004W', 'ユーザID'];

                // パスワード
                $messages['data_to_save.' . $index . '.userPassword.required'] = ['WQ-0006W', 'パスワード'];
                $messages['data_to_save.' . $index . '.userPassword.min'] = 'WQ-0014W|パスワード|8桁';


                // 氏名
                $messages['data_to_save.' . $index . '.userName.required'] = ['WQ-0006W', '氏名'];
                $messages['data_to_save.' . $index . '.userName.max'] = ['WQ-0012W', '氏名', '50'];

                // ふりがなの入力がある場合
                if ($row["userFurigana"]) {
                    $messages['data_to_save.' . $index . '.userFurigana.max'] = ['WQ-0012W', 'ふりがな', '50'];
                }

                // 所属課
                $messages['data_to_save.' . $index . '.affiliationSectionNo.required'] = ['WQ-0006W', '所属課'];

                // 権限
                $messages['data_to_save.' . $index . '.securityLevel.required'] = ['WQ-0006W', '権限'];

                // 登録年月日
                $messages['data_to_save.' . $index . '.registDate.required'] = ['WQ-0006W', '登録年月日'];

                // 終了年月日
                $messages['data_to_save.' . $index . '.endDate.required'] = ['WQ-0006W', '終了年月日'];
            } else if ($row["processFlg"] == "EDIT") {
                // ユーザID
                $messages['data_to_save.' . $index . '.userId.required'] = ['WQ-0006W', 'ユーザID'];
                $messages['data_to_save.' . $index . '.userId.regex'] = ['WQ-0004W', 'ユーザID'];

                // パスワードが入力されているかつ、入力された値
                if ($row["userPassword"]) {
                    $messages['data_to_save.' . $index . '.userPassword.min'] = 'WQ-0014W|パスワード|8桁';
                }

                // 氏名
                $messages['data_to_save.' . $index . '.userName.required'] = ['WQ-0006W', '氏名'];
                $messages['data_to_save.' . $index . '.userName.max'] = ['WQ-0012W', '氏名', '50'];

                // ふりがなの入力がある場合
                if ($row["userFurigana"]) {
                    $messages['data_to_save.' . $index . '.userFurigana.max'] = ['WQ-0012W', 'ふりがな', '50'];
                }

                // 所属課
                $messages['data_to_save.' . $index . '.affiliationSectionNo.required'] = ['WQ-0006W', '所属課'];

                // 権限
                $messages['data_to_save.' . $index . '.securityLevel.required'] = ['WQ-0006W', '権限'];

                // 登録年月日
                $messages['data_to_save.' . $index . '.registDate.required'] = ['WQ-0006W', '登録年月日'];

                // 終了年月日
                $messages['data_to_save.' . $index . '.endDate.required'] = ['WQ-0006W', '終了年月日'];
            }
            $index++;
        }

        return $messages;
    }
}
