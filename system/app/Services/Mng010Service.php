<?php

namespace App\Services;

use App\Dao\Mng010Dao;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;


/**
 * ユーザマスタ設定サービス
 *
 * @author
 */
class Mng010Service
{
    // ユーザマスタDAO
    private $Mng010Dao;

    /**
     * コンストラクタ
     * 
     */
    public function __construct()
    {
        $this->Mng010Dao = new Mng010Dao();
    }

    /**
     * ユーザマスタを取得
     * 
     */
    public function fetchUserData($request)
    {
        $fetchUserData = $this->Mng010Dao->fetchUserData($request);

        return $fetchUserData;
    }


    /**
     * ユーザマスタ登録処理
     * ※ 手順番号は「詳細設計書_MNG010_ユーザマスタ画面」通りに設定
     * 
     */
    public function saveUserMasterData($request)
    {
        DB::beginTransaction();
        try {
            // 引数取得
            $user_master_data = json_decode(json_encode($request->data_to_save));   // リクエスト

            // ##### ユーザマスタ #####
            // (4)排他処理
            $checkUserMasterDataBefore = $this->Mng010Dao->checkUserMasterDataBefore($user_master_data, $request->display_time);
            if (!$checkUserMasterDataBefore) {
                // 排他エラー
                DB::rollback();
                return config('const.UPDATE_UPDATED_ERROR');
            } else {
            }

            // 全てのデータを取得
            $fetchAllUserData = $this->Mng010Dao->fetchAllUserData();
            foreach ($fetchAllUserData as $key => $value) {
                $delete_flg = 0;
                foreach ($user_master_data as $table_list) {
                    if ($table_list->userId == $value->user_id) {
                        $delete_flg += 1;
                    }
                }

                if ($delete_flg == 0) {
                    // (5)-[3] 削除処理 ※ 画面.ユーザ定義一覧表に存在せず、ユーザ定義テーブルには存在する、ユーザNoのレコードを削除する。
                    $deleteUserMasterData = $this->Mng010Dao->deleteUserMasterData($value->user_no);

                    // エラー発生
                    if (!$deleteUserMasterData) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    }
                }
            }

            // データ登録・更新
            foreach ($user_master_data as $table_list) {
                if ($table_list->processFlg == "NEW") {
                    // (4) 登録処理
                    $insertUserMasterData = $this->Mng010Dao->insertUserMasterData($table_list);

                    // エラー発生
                    if (!$insertUserMasterData) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    }
                } else if ($table_list->processFlg == "EDIT") {
                    // (5) 更新処理
                    $updateUserMasterData = $this->Mng010Dao->updateUserMasterData($table_list);

                    // エラー発生
                    if (!$updateUserMasterData) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    }
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
