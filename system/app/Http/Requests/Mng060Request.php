<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class Mng060Request extends FormRequest
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

        // 報告書メニューのルール
        if ($this->process_name) {
            switch ($this->process_name) {
                case 'menu_add':
                case 'menu_edit':
                    // 入力画面メニュー名称が未入力の場合、エラー
                    $rules =  [
                        // メニュー名称
                        'report_title'                   => ['required', 'max:50'],

                        // 親ラベル
                        'report_parent_menu_no'          => ['required'],
                    ];
                    break;
                case 'rpt_add':
                case 'rpt_edit':
                    // 入力画面名称が未入力の場合、エラー
                    $rules =  [
                        // メニュー名称
                        'report_title'                   => ['required', 'max:50'],

                        // 親ラベル ※ 報告書の場合、ステート項目名は「input_parent_menu_no」になる。
                        'input_parent_menu_no'          => ['required'],
                    ];
                    break;

                default:
                    # code...
                    break;
            }
        }

        // 検査項目のルール
        if ($this->item && count($this->item) > 0) {
            foreach ($this->item as $row) {
                $rules['item.' . $index . '.2.value'] = ['nullable', 'regex:/^(?![0-9０-９.．])[\p{L}\p{N}_＿.．\x{3040}-\x{309F}\x{30A0}-\x{30FF}]+$/u'];            // 単位
                $rules['item.' . $index . '.3.value'] = ['nullable', 'regex:/^(?![0-9０-９.．])[\p{L}\p{N}_＿.．\x{3040}-\x{309F}\x{30A0}-\x{30FF}]+$/u'];            // 目標値
                $rules['item.' . $index . '.4.value'] = ['nullable', 'regex:/^(?![0-9０-９.．])[\p{L}\p{N}_＿.．\x{3040}-\x{309F}\x{30A0}-\x{30FF}]+$/u'];            // 基準値
                $rules['item.' . $index . '.5.value'] = ['nullable', 'regex:/^(?![0-9０-９.．])[\p{L}\p{N}_＿.．\x{3040}-\x{309F}\x{30A0}-\x{30FF}]+$/u'];            // 番号

                $index++;
            }
        }

        return $rules;
    }

    public function messages()
    {
        // メッセージ初期化
        $messages = [];

        // 処理判定
        $index = 0;

        // 報告書メニューのメッセージ
        if ($this->process_name) {
            switch ($this->process_name) {
                case 'menu_add':
                case 'menu_edit':
                    // 入力画面ラベル名称が未入力の場合、エラー
                    $messages =  [
                        // メニューラベル名称
                        'report_title.required'              => ['WQ-0006W', 'メニュー名称'],
                        'report_title.max'                   => ['WQ-0011W', 'メニュー名称', '50'],

                        // 親ラベル
                        'report_parent_menu_no.required'     => ['WQ-0006W', '親ラベル'],
                    ];
                    break;

                case 'rpt_add':
                case 'rpt_edit':
                    // 入力画面名称が未入力の場合、エラー
                    $messages =  [
                        // 入力画面名称
                        'report_title.required'              => ['WQ-0006W', '報告書名称'],
                        'report_title.max'                   => ['WQ-0011W', '報告書名称', '50'],

                        // 親ラベル ※ 報告書の場合、ステート項目名は「input_parent_menu_no」になる。
                        'input_parent_menu_no.required'     => ['WQ-0006W', '親ラベル'],
                    ];
                    break;

                default:
                    # code...
                    break;
            }
        }

        // 検査項目のメッセージ
        if ($this->item && count($this->item) > 0) {
            foreach ($this->item as $row) {
                $messages['item.' . $index . '.2.value.regex'] = ['WQ-0024W', $this->item[$index][1]['value'] . 'の単位'];           // 単位
                $messages['item.' . $index . '.3.value.regex'] = ['WQ-0024W', $this->item[$index][1]['value'] . 'の目標値'];         // 目標値
                $messages['item.' . $index . '.4.value.regex'] = ['WQ-0024W', $this->item[$index][1]['value'] . 'の基準値'];         // 基準値
                $messages['item.' . $index . '.5.value.regex'] = ['WQ-0024W', $this->item[$index][1]['value'] . 'の番号'];           // 番号

                $index++;
            }
        }

        return $messages;
    }
}
