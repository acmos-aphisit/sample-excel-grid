<?php

namespace App\Services;

use App\Dao\Mng030Dao;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;


/**
 * 検査項目マスタ設定サービス
 *
 * @author
 */
class Mng030Service
{
    // 検査項目マスタDAO
    private $Mng030Dao;

    /**
     * コンストラクタ
     * 
     */
    public function __construct()
    {
        $this->Mng030Dao = new Mng030Dao();
    }

    /**
     * 検査項目マスタを取得
     * 
     */
    public function fetchInspItemData($request)
    {
        $fetchInspItemData = $this->Mng030Dao->fetchInspItemData($request);

        // 項目名の絞り込みがある場合
        if (count((array) $fetchInspItemData) > 0 && isset($request['itemName'])) {
            $item_name_check = mb_strtolower(mb_convert_kana($request['itemName'], "as"));           // 半角英数字小文字に変換
            $new_set_data = [];

            // データ絞り込み
            foreach ($fetchInspItemData as $key => $value) {
                $data_dsp_name = mb_strtolower(mb_convert_kana($value->item_dsp_name, "as"));       // 項目名称画面
                $data_rpt_name = mb_strtolower(mb_convert_kana($value->item_report_name, "as"));    // 項目名称報告書

                if (str_contains($data_dsp_name, $item_name_check) || str_contains($data_rpt_name, $item_name_check)) {
                    array_push($new_set_data, $value);
                }
            }
            return $new_set_data;
        }

        return $fetchInspItemData;
    }

    /**
     * 検査項目マスタデータを取得 (最大の値)
     * 
     */
    public function searchMaxItemNo()
    {
        $searchMaxItemNo = $this->Mng030Dao->searchMaxItemNo();

        return $searchMaxItemNo;
    }

    /**
     * 選択肢マスタを取得
     * 
     */
    public function searchSelectOptionData($request)
    {
        $searchSelectOptionData = $this->Mng030Dao->searchSelectOptionData($request);

        return $searchSelectOptionData;
    }

    /**
     * 選択肢マスタ登録処理
     * ※ 手順番号は「詳細設計書_MNG030_検査項目マスタ画面」通りに設定
     * 
     */
    public function saveSelectionOptionData($request)
    {
        DB::beginTransaction();
        try {
            // 引数取得
            $selection_data = json_decode(json_encode($request->data_to_save));   // リクエスト

            // ##### 選択肢マスタ #####
            // (7)排他処理
            $checkSelectionDataBefore = $this->Mng030Dao->checkSelectionDataBefore($request->item_no, $request->display_time);
            if (!$checkSelectionDataBefore) {
                // 排他エラー
                DB::rollback();
                return config('const.UPDATE_UPDATED_ERROR');
            } else {
                // (7)-1 削除処理
                $deleteSelectionData = $this->Mng030Dao->deleteSelectionData($request->item_no);

                // エラー発生
                if (!$deleteSelectionData) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }

            // データありの場合：新規登録、データなしの場合：取消
            if (count($selection_data) > 0) {
                // (7)-2 登録処理
                $insertSelectionData = $this->Mng030Dao->insertSelectionData($request->item_no, $selection_data);

                // エラー発生
                if (!$insertSelectionData) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }


            DB::commit();

            return config('const.INSERT_NO_ERROR');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return config('const.OTHER_ERROR');
        }
    }

    /**
     * 検査項目マスタ登録処理
     * ※ 手順番号は「詳細設計書_MNG030_検査項目マスタ画面」通りに設定
     * 
     */
    public function saveInspItemData($request)
    {
        DB::beginTransaction();
        try {
            // 引数取得
            $inspection_data = json_decode(json_encode($request->data_to_save));   // リクエスト

            // ##### 選択肢マスタ #####
            // (4)排他処理
            $checkInspectionDataBefore = $this->Mng030Dao->checkInspectionDataBefore($request->display_time);
            if (!$checkInspectionDataBefore) {
                // 排他エラー
                DB::rollback();
                return config('const.UPDATE_UPDATED_ERROR');
            } else {
                // (5)-1 削除処理
                $deleteInspectionData = $this->Mng030Dao->deleteInspectionData($inspection_data);

                // エラー発生
                if (!$deleteInspectionData) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }

            // データありの場合：新規登録、データなしの場合：取消
            if (count($inspection_data) > 0) {
                // (7)-2 登録処理
                $insertInspectionData = $this->Mng030Dao->insertInspectionData($inspection_data);

                // エラー発生
                if (!$insertInspectionData) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }


            DB::commit();

            return config('const.INSERT_NO_ERROR');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return config('const.OTHER_ERROR');
        }
    }
}
