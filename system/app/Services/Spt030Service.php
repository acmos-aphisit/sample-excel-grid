<?php

namespace App\Services;

use App\Dao\Spt030Dao;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * 運用メモ設定サービス
 *
 * @author
 */
class Spt030Service
{
    // 運用メモDAO
    private $Spt030Dao;

    /**
     * コンストラクタ
     * 
     */
    public function __construct()
    {
        $this->Spt030Dao = new Spt030Dao();
    }

    /**
     * 運用メモを取得
     * 
     */
    public function searchUnyouMemoData($request)
    {
        $searchUnyouMemoData = $this->Spt030Dao->searchUnyouMemoData($request);

        return $searchUnyouMemoData;
    }

    /**
     * ファイル削除
     * 
     */
    function removeFile($id, $display_time)
    {
        $remove_result = true;
        $checkUnyouMemoDataBefore = $this->Spt030Dao->checkUnyouMemoDataBefore($id, $display_time);
        if ($checkUnyouMemoDataBefore) {
            if ($checkUnyouMemoDataBefore[0]->file_path && file_exists(env('UNYOU_DELETE_PATH') . $checkUnyouMemoDataBefore[0]->file_path)) {
                $remove_result = unlink(env('UNYOU_DELETE_PATH') . $checkUnyouMemoDataBefore[0]->file_path);
                rmdir(env('UNYOU_DELETE_PATH') . "support/unyou/" . $id);
            }
        }

        return $remove_result;
    }

    /**
     * ファイル追加
     * 
     */
    function addFile($upload_file, $file_name_unyou_id)
    {
        $file_path = "";
        $file = $upload_file;
        $upload_file_name = $upload_file->getClientOriginalName();

        // ファイル名を指定
        $set_file_name = 'Unyou_' . $file_name_unyou_id . '_' . $upload_file_name;
        // $set_info_file_name = 'Oshirase_' . $file_name_info_id . '_' . $upload_file_name;

        // ファイルパスを指定
        $file_save_path = env('UNYOU_SAVE_PATH') . $file_name_unyou_id;
        $file_show_path = env('UNYOU_SHOW_PATH') . $file_name_unyou_id;

        // $file_info_save_path = env('OSHIRASE_SAVE_PATH') . $set_info_file_name;
        // $file_info_show_path = env('OSHIRASE_SHOW_PATH') . $set_info_file_name;

        // 一時的のファイルを移行
        // Storage::putFileAs($file_save_path, $file, $set_file_name);
        $file->move(public_path($file_save_path), $set_file_name);                      // 運用メモ
        // $file->move(public_path($file_info_save_path), $set_info_file_name);         // お知らせ管理

        // テーブルに追加するパスを指定
        $file_path = $file_show_path . '/' . $set_file_name;
        // $file_info_path = $file_info_show_path . '/' . $set_info_file_name;

        return $file_path;
    }

    /**
     * 運用メモ登録処理
     * ※ 手順番号は「詳細設計書_SPT030_運用メモ画面」通りに設定
     * 
     */
    public function saveUnyouMemoData($request)
    {
        DB::beginTransaction();
        try {
            // 引数取得・ファイル情報を取得
            $data = json_decode($request->data);
            $file_name_unyou_id = "";
            $file_name_info_id = "";

            // 運用メモのシーケンスを取得
            if ($data->data_mode == "登録") {
                // 運用メモ
                $getUnyouMemoNextVal = $this->Spt030Dao->getUnyouMemoNextVal();
                if ($getUnyouMemoNextVal[0]->log_cnt == 0) {
                    $file_name_unyou_id = strval($getUnyouMemoNextVal[0]->unyou_id_seq);
                } else {
                    $file_name_unyou_id = strval($getUnyouMemoNextVal[0]->unyou_id_seq + 1);
                }

                // お知らせ管理
                $getInfoNextVal = $this->Spt030Dao->getInfoNextVal();
                $file_name_info_id = strval($getInfoNextVal[0]->info_id_seq);
            } else if ($data->data_mode == "編集") {
                // 運用メモ
                $file_name_unyou_id = $data->unyou_id;

                // お知らせ管理
            }

            if ($data->data_mode == "登録") {
                // 添付ファイルに値が入っていた場合
                $add_file_path = "";
                if (!empty($request->upload_file) && !empty($request->upload_file_name)) {
                    $add_file_path = $this->addFile($request->upload_file, $file_name_unyou_id);
                }

                // (6)-1 運用メモ登録
                $insertUnyouMemoData = $this->Spt030Dao->insertUnyouMemoData($add_file_path, $data);

                // エラー発生
                if (!$insertUnyouMemoData) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }

                // (6)-2 お知らせ管理登録　※ お知らせに掲載する(アラート画面.お知らせ掲載フラグ = 1)場合
                if ($data->info_regist_flg) {
                    // お知らせ管理に登録
                    $insertInfoDataFromUnyouMemo = $this->Spt030Dao->insertInfoDataFromUnyouMemo($file_name_unyou_id, $data);

                    // エラー発生
                    if (!$insertInfoDataFromUnyouMemo) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    }
                }
            } else if ($data->data_mode == "編集") {
                // (5) 排他処理
                $checkUnyouMemoDataBefore = $this->Spt030Dao->checkUnyouMemoDataBefore($data->unyou_id, $data->display_time);
                if ($checkUnyouMemoDataBefore) {
                    // 添付ファイルが存在している場合
                    // ※ ファイル選択（あり）・ファイル削除ボタン押下（した）
                    if (!empty($request->upload_file) && !empty($request->upload_file_name) || ($data->info_clear_file_flg)) {
                        $remove_file = $this->removeFile($data->unyou_id, $data->display_time);
                        if (!$remove_file) {
                            DB::rollback();
                            return config('const.OTHER_ERROR');
                        }
                    }

                    // 添付ファイルに値が入っていた場合
                    $edit_file_path = "";
                    if (!empty($request->upload_file) && !empty($request->upload_file_name)) {
                        $edit_file_path = $this->addFile($request->upload_file, $file_name_unyou_id);
                    }

                    // (5)-1 運用メモ更新
                    $updateUnyouMemoData = $this->Spt030Dao->updateUnyouMemoData($edit_file_path, $data);

                    // エラー発生
                    if (!$updateUnyouMemoData) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    }

                    // お知らせ管理に該当運用ID無しかつ、お知らせに掲載する(アラート画面.お知らせ掲載フラグ = 1)場合
                    if ($data->info_regist_flg) {
                        // お知らせ管理に登録
                        $insertInfoDataFromUnyouMemo = $this->Spt030Dao->insertInfoDataFromUnyouMemo($data->unyou_id, $data);

                        // エラー発生
                        if (!$insertInfoDataFromUnyouMemo) {
                            DB::rollback();
                            return config('const.OTHER_ERROR');
                        }
                    }
                } else {
                    // 排他エラー
                    DB::rollback();
                    return config('const.UPDATE_UPDATED_ERROR');
                }
            } else if ($data->data_mode == "削除") {
                // (4) 排他処理
                $checkUnyouMemoDataBefore = $this->Spt030Dao->checkUnyouMemoDataBefore($data->unyou_id, $data->display_time);
                if ($checkUnyouMemoDataBefore[0]) {
                    // (4)-1で削除したデータに、添付ファイルが存在している場合
                    $remove_file = $this->removeFile($data->unyou_id, $data->display_time);
                    if (!$remove_file) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    }

                    // (4)-1 運用メモ削除
                    $deleteUnyouMemoData = $this->Spt030Dao->deleteUnyouMemoData($data->unyou_id);

                    // エラー発生
                    if (!$deleteUnyouMemoData) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    }
                } else {
                    // 排他エラー
                    DB::rollback();
                    return config('const.UPDATE_UPDATED_ERROR');
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
