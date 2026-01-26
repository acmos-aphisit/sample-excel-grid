<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class Mng060TempRequest extends FormRequest
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
        switch ($this->process_name) {
            case 'menu_add':
            case 'menu_edit':
                // 報告書メニュー名称が未入力の場合、エラー
                $rules =  [
                    // メニュー名称
                    'report_title'                   => ['required', 'max:50'],

                    // 親ラベル
                    'report_parent_menu_no'          => ['required'],
                ];
                break;
            case 'dsp_add':
            case 'dsp_edit':
                // 報告書名称が未入力の場合、エラー
                $rules =  [
                    // メニュー名称
                    'report_title'                   => ['required', 'max:50'],

                    // 親ラベル
                    'report_parent_menu_no'          => ['required'],
                ];
                break;

            default:
                # code...
                break;
        }

        return $rules;
    }

    public function messages()
    {
        // メッセージ初期化
        $messages = [];

        // 処理判定
        switch ($this->process_name) {
            case 'menu_add':
            case 'menu_edit':
                // 報告書ラベル名称が未入力の場合、エラー
                $messages =  [
                    // メニューラベル名称
                    'report_title.required'              => ['WQ-0006W', 'メニュー名称'],
                    'report_title.max'                   => ['WQ-0011W', 'メニュー名称', '50'],

                    // 親ラベル
                    'report_parent_menu_no.required'     => ['WQ-0006W', '親ラベル'],
                ];
                break;

            case 'dsp_add':
            case 'dsp_edit':
                // 報告書名称が未入力の場合、エラー
                $messages =  [
                    // 報告書名称
                    'report_title.required'              => ['WQ-0006W', '画面名称'],
                    'report_title.max'                   => ['WQ-0011W', '画面名称', '50'],

                    // 親ラベル
                    'report_parent_menu_no.required'     => ['WQ-0006W', '親ラベル'],
                ];
                break;

            default:
                # code...
                break;
        }



        return $messages;
    }
}
