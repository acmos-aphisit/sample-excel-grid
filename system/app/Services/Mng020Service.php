<?php

namespace App\Services;

use App\Dao\Mng020Dao;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;


/**
 * 採水地点設定サービス
 *
 * @author
 */
class Mng020Service
{
    // 検査情報登録DAO
    private $Mng020Dao;

    /**
     * コンストラクタ
     * 
     */
    public function __construct()
    {
        $this->Mng020Dao = new Mng020Dao();
    }

    /**
     * 採水地点マスタを取得
     * 
     */
    public function searchSaisuiPoint($request)
    {
        $searchSaisuiPoint = $this->Mng020Dao->searchSaisuiPoint($request);

        // 地点名の絞り込みがある場合
        if (count((array) $searchSaisuiPoint) > 0 && isset($request['pointName'])) {
            $item_name_check = mb_strtolower(mb_convert_kana($request['pointName'], "as"));          // 半角英数字小文字に変換
            $new_set_data = [];

            // データ絞り込み
            foreach ($searchSaisuiPoint as $key => $value) {
                $data_dsp_name = mb_strtolower(mb_convert_kana($value->point_dsp_name, "as"));       // 地点名称画面
                $data_rpt_name = mb_strtolower(mb_convert_kana($value->point_report_name, "as"));    // 地点名称報告書

                if (str_contains($data_dsp_name, $item_name_check) || str_contains($data_rpt_name, $item_name_check)) {
                    array_push($new_set_data, $value);
                }
            }
            return $new_set_data;
        }

        return $searchSaisuiPoint;
    }

    /**
     * 採水地点マスタデータを取得 (最大の値)
     * 
     */
    public function searchMaxSaisuiPoint()
    {
        $searchMaxSaisuiPoint = $this->Mng020Dao->searchMaxSaisuiPoint();

        return $searchMaxSaisuiPoint;
    }

    /**
     * 採水地点設定登録処理
     * ※ 手順番号は「詳細設計書_MNG020_採水地点設定画面」通りに設定
     * 
     */
    public function saveSaisuiPointData($request)
    {
        DB::beginTransaction();
        try {
            // 引数取得
            $saisui_point_data = json_decode(json_encode($request->data_to_save));   // リクエスト

            // ##### 採水地点マスタ #####
            // (4)排他処理
            $checkSaisuiPointDataBefore = $this->Mng020Dao->checkSaisuiPointDataBefore($saisui_point_data, $request->display_time);
            if (!$checkSaisuiPointDataBefore) {
                // 排他エラー
                DB::rollback();
                return config('const.UPDATE_UPDATED_ERROR');
            } else {
                // (5)-1 削除処理
                $deleteSaisuiPointData = $this->Mng020Dao->deleteSaisuiPointData($saisui_point_data);

                // エラー発生
                if (!$deleteSaisuiPointData) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }

            // (5)-2 登録処理
            $insertSaisuiPointData = $this->Mng020Dao->insertSaisuiPointData($saisui_point_data);

            // エラー発生
            if (!$insertSaisuiPointData) {
                DB::rollback();
                return config('const.OTHER_ERROR');
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
