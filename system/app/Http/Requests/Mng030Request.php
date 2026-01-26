<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class Mng030Request extends FormRequest
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
        if ($this->validateMode == "selection" && count($this->data_to_save) > 0) {
            $index = 0;
            foreach ($this->data_to_save as $row) {
                $rules['data_to_save.' . $index . '.selectionNo'] = ['required', 'regex:/^([0-9]\d*)$/'];
                $rules['data_to_save.' . $index . '.selectionName'] = ['required', 'max:51'];
                $rules['data_to_save.' . $index . '.sortValue'] = ['required', 'max:51'];

                $index++;
            }
        } else if ($this->validateMode == "inspection" && count($this->data_to_save) > 1) {
            $index = 0;
            foreach ($this->data_to_save as $row) {
                // 項目名称画面が51桁以上の場合エラー
                if ($row['itemDspName']) {
                    $rules['data_to_save.' . $index . '.itemDspName'] = ['max:51'];
                }

                // 項目名称報告書が51桁以上の場合エラー
                if ($row['itemReportName']) {
                    $rules['data_to_save.' . $index . '.itemReportName'] = ['max:51'];
                }

                // 単位が10桁以上の場合エラー
                if ($row['itemUnit']) {
                    $rules['data_to_save.' . $index . '.itemUnit'] = ['max:10'];
                }

                // コメント51桁以上の場合エラー
                if ($row['inspectionItemComment']) {
                    $rules['data_to_save.' . $index . '.inspectionItemComment'] = ['max:51'];
                }

                $index++;
            }
        }

        return $rules;
    }

    public function messages()
    {
        // メッセージ初期化
        $messages = [];

        // 選択肢のバリデーション
        if ($this->validateMode == "selection" && count($this->data_to_save) > 0) {
            $index = 0;
            foreach ($this->data_to_save as $row) {
                // 選択肢番号
                $messages['data_to_save.' . $index . '.selectionNo.required'] = ['WQ-0006W', '選択肢番号'];
                $messages['data_to_save.' . $index . '.selectionNo.regex'] = ['WQ-0004W', '選択肢番号'];

                // 選択肢
                $messages['data_to_save.' . $index . '.selectionName.required'] = ['WQ-0006W', '選択肢'];
                $messages['data_to_save.' . $index . '.selectionName.max'] = ['WQ-0011W', '選択肢', '50'];

                // 順序
                $messages['data_to_save.' . $index . '.sortValue.required'] = ['WQ-0006W', '順序'];
                $messages['data_to_save.' . $index . '.sortValue.max'] = ['WQ-0011W', '順序', '50'];

                $index++;
            }
        } else if ($this->validateMode == "inspection" && count($this->data_to_save) > 1) {
            $index = 0;
            foreach ($this->data_to_save as $row) {
                // 項目名称画面
                if ($row['itemDspName']) {
                    $messages['data_to_save.' . $index . '.itemDspName.max'] = ['WQ-0011W', '項目名称画面', '50'];
                }

                // 項目名称報告書
                if ($row['itemReportName']) {
                    $messages['data_to_save.' . $index . '.itemReportName.max'] = ['WQ-0011W', '項目名称報告書', '50'];
                }

                // 単位
                if ($row['itemUnit']) {
                    $messages['data_to_save.' . $index . '.itemUnit.max'] = ['WQ-0011W', '単位', '10'];
                }

                // コメント
                if ($row['inspectionItemComment']) {
                    $messages['data_to_save.' . $index . '.inspectionItemComment.max'] = ['WQ-0011W', 'コメント', '50'];
                }

                $index++;
            }
        }

        return $messages;
    }
}
