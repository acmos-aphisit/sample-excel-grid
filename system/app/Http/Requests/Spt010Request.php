<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class Spt010Request extends FormRequest
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
        $data = (array) json_decode($this->data);

        // 掲載日が未入力の場合、エラー
        $rules['info_date'] = ['required'];

        // お知らせ内容に256文字以上入力されている場合、エラー
        $rules['info_text'] = ['max:5000'];

        // リンクに5001文字以上入力されている場合、エラー
        if ($data["info_link"]) {
            $rules['info_link'] = ['max:255'];
        }

        // 添付ファイルに256文字以上入力されている場合、エラー
        if ($this->upload_file_name) {
            $rules['upload_file_name'] = ['max:255'];
        }

        // 添付ファイル
        if (is_file($this->upload_file)) {
            $rules['upload_file'] = [
                'mimes:jpg,jpeg,png,pdf,doc,docx,xlsx',       // 添付ファイルの拡張子が指定しているもの以外だった場合、エラー
                'max:102400',                                 // 添付ファイルのサイズが100MB以上だった場合、エラー
            ];
        }

        // 表示フラグが未選択の場合エラー
        $rules['dsp_flg'] = ['required'];

        return $rules;
    }

    public function messages()
    {
        // メッセージ初期化
        $messages = [];

        // 処理判定
        $data = (array) json_decode($this->data);

        // 掲載日が未入力の場合、エラー
        $messages['info_date.required'] = 'WQ-0006W|掲載日';

        // お知らせ内容に256文字以上入力されている場合、エラー
        $messages['info_text.max'] = 'WQ-0012W|お知らせ内容|5000';

        // リンクが256桁以上入力されている場合エラー
        if ($data["info_link"]) {
            $messages['info_link.max'] = 'WQ-0012W|リンク|255';
        }

        // 添付ファイルに256文字以上入力されている場合、エラー
        if ($this->upload_file_name) {
            $messages['upload_file_name.max'] = 'WQ-0012W|添付ファイル|255';
        }

        // 添付ファイル
        if (is_file($this->upload_file)) {
            // 添付ファイルの拡張子が指定しているもの以外だった場合、エラー
            $messages['upload_file.mimes'] = 'WQ-0016W|.pdf, .docx, .xlsx, .jpg, .png';

            // 添付ファイルのサイズが100MB以上だった場合、エラー
            $messages['upload_file.max'] = 'WQ-0015W|添付ファイル|100MB';
        }

        // 表示フラグが未選択の場合エラー
        $messages['dsp_flg.required'] = 'WQ-0006W|表示フラグ';

        return $messages;
    }
}
