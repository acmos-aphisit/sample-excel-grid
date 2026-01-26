<?php

namespace App\Services;

use App\Dao\Spt010Dao;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * お知らせ管理サービス
 *
 * @author
 */
class Spt010Service
{
  // お知らせ管理DAO
  private $Spt010Dao;


  /**
   * コンストラクタ
   * 
   */
  public function __construct()
  {
    $this->Spt010Dao = new Spt010Dao();
  }

  /**
   * お知らせを取得
   * 
   */
  public function searchOshiraseData($request)
  {
    $searchOshiraseData = $this->Spt010Dao->searchOshiraseData($request);

    return $searchOshiraseData;
  }

  /**
   * ファイル削除
   * 
   */
  function removeFile($id, $display_time)
  {
    $remove_result = true;
    $checkInfoDataBefore = $this->Spt010Dao->checkInfoDataBefore($id, $display_time);
    if ($checkInfoDataBefore) {
      if ($checkInfoDataBefore[0]->file_path && file_exists(env('OSHIRASE_DELETE_PATH') . $checkInfoDataBefore[0]->file_path)) {
        $remove_result = unlink(env('OSHIRASE_DELETE_PATH') . $checkInfoDataBefore[0]->file_path);
        rmdir(env('OSHIRASE_DELETE_PATH') . "support/oshirase/" . $id);
      }
    }

    return $remove_result;
  }

  /**
   * ファイル追加
   * 
   */
  function addFile($upload_file, $file_name_info_id)
  {
    $file_path = "";
    $file = $upload_file;
    $upload_file_name = $upload_file->getClientOriginalName();

    // ファイル名を指定
    $set_file_name = 'Oshirase_' . $file_name_info_id . '_' . $upload_file_name;

    // ファイルパスを指定
    $file_save_path = env('OSHIRASE_SAVE_PATH') . $file_name_info_id;
    $file_show_path = env('OSHIRASE_SHOW_PATH') . $file_name_info_id;

    // ファイルを保存
    $file->move(base_path($file_save_path), $set_file_name);                      // お知らせ管理

    // テーブルに追加するパスを指定
    $file_path = $file_show_path . '/' . $set_file_name;

    return $file_path;
  }


  /**
   * お知らせ登録処理
   * ※ 手順番号は「詳細設計書_SPT010_お知らせ管理画面」通りに設定
   * 
   */
  public function saveOshiraseData($request)
  {
    DB::beginTransaction();
    try {
      // 引数取得・ファイル情報を取得
      $data = json_decode($request->data);
      $file_name_info_id = "";

      // お知らせのシーケンスを取得
      if ($data->data_mode == "登録") {
        // お知らせ管理
        $getInfoNextVal = $this->Spt010Dao->getInfoNextVal();
        if ($getInfoNextVal[0]->log_cnt == 0) {
          $file_name_info_id = strval($getInfoNextVal[0]->info_id_seq);
        } else {
          $file_name_info_id = strval($getInfoNextVal[0]->info_id_seq + 1);
        }
      } else if ($data->data_mode == "編集") {
        // お知らせ管理
        $file_name_info_id = $data->info_id;
      }

      if ($data->data_mode == "登録") {
        // 添付ファイルに値が入っていた場合
        $add_file_path = "";
        if (!empty($request->upload_file) && !empty($request->upload_file_name)) {
          $add_file_path = $this->addFile($request->upload_file, $file_name_info_id);
        }

        // (3)-1 お知らせ登録
        $insertInfoData = $this->Spt010Dao->insertInfoData($add_file_path, $data);

        // エラー発生
        if (!$insertInfoData) {
          DB::rollback();
          return config('const.OTHER_ERROR');
        }
      } else if ($data->data_mode == "編集") {
        // (6) 排他処理
        $checkInfoDataBefore = $this->Spt010Dao->checkInfoDataBefore($data->info_id, $data->display_time);
        if ($checkInfoDataBefore) {
          // 添付ファイルが存在している場合
          // ※ ファイル選択（あり）・ファイル削除ボタン押下（した）
          if (!empty($request->upload_file) && !empty($request->upload_file_name) || ($data->info_clear_file_flg)) {
            $remove_file = $this->removeFile($data->info_id, $data->display_time);
            if (!$remove_file) {
              DB::rollback();
              return config('const.OTHER_ERROR');
            }
          }

          // 添付ファイルに値が入っていた場合
          $edit_file_path = "";
          if (!empty($request->upload_file) && !empty($request->upload_file_name)) {
            $edit_file_path = $this->addFile($request->upload_file, $file_name_info_id);
          }

          // (6)-1 お知らせ更新
          $updateInfoData = $this->Spt010Dao->updateInfoData($edit_file_path, $data);

          // エラー発生
          if (!$updateInfoData) {
            DB::rollback();
            return config('const.OTHER_ERROR');
          }
        } else {
          // 排他エラー
          DB::rollback();
          return config('const.UPDATE_UPDATED_ERROR');
        }
      } else if ($data->data_mode == "削除") {
        // (5) 排他処理
        $checkInfoDataBefore = $this->Spt010Dao->checkInfoDataBefore($data->info_id, $data->display_time);
        if ($checkInfoDataBefore) {
          // (5)-1で削除したデータに、添付ファイルが存在している場合
          $remove_file = $this->removeFile($data->info_id, $data->display_time);
          if (!$remove_file) {
            DB::rollback();
            return config('const.OTHER_ERROR');
          }

          // (5)-1 お知らせ削除
          $deleteInfoData = $this->Spt010Dao->deleteInfoData($data->info_id);

          // エラー発生
          if (!$deleteInfoData) {
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
