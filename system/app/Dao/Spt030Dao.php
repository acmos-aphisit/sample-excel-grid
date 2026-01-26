<?php

namespace App\Dao;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * 運用メモDAO
 *
 */
class Spt030Dao
{
    /**
     * 運用メモを取得
     * 
     * @return response 結果
     */
    public function searchUnyouMemoData($request)
    {
        try {
            // 検索条件作成
            $where = "1 = 1";
            $sort = "";
            $bindValue = array();

            // タイトル
            if (!is_null($request['unyouTitle'])) {
                $where .= " AND unyou_title LIKE '%' || :unyou_title || '%' ";
                $bindValue['unyou_title'] = $request['unyouTitle'];
            }

            // 作成日_開始日
            if (!is_null($request['unyouDateStt'])) {
                $where .= " AND TO_DATE(TO_CHAR(unyou_date, 'YYYY/MM/DD'),'YYYY/MM/DD') >= :unyou_from_date ";
                $bindValue['unyou_from_date'] = $request['unyouDateStt'];
            }

            // 作成日_終了日
            if (!is_null($request['unyouDateEnd'])) {
                $where .= " AND TO_DATE(TO_CHAR(unyou_date, 'YYYY/MM/DD'),'YYYY/MM/DD') <= :unyou_to_date ";
                $bindValue['unyou_to_date'] = $request['unyouDateEnd'];
            }

            // メモ
            if (!is_null($request['unyouMemo'])) {
                $where .= " AND unyou_memo LIKE '%' || :unyou_memo || '%' ";
                $bindValue['unyou_memo'] = $request['unyouMemo'];
            }

            // 備考
            if (!is_null($request['unyouBikou'])) {
                $where .= " AND unyou_bikou LIKE '%' || :unyou_bikou || '%' ";
                $bindValue['unyou_bikou'] = $request['unyouBikou'];
            }

            // 表示フラグ
            if (!is_null($request['unyouDspFlg'])) {
                $where .= " AND dsp_flg = :dsp_flg ";
                $bindValue['dsp_flg'] = $request['unyouDspFlg'];
            }

            // ソート条件：デフォルトは整理番号の昇順
            $sort = 'unyou_id ASC';

            if (!is_null($request['sortColumn'])) {
                $column = $request["sortColumn"];

                $sort_order = 'ASC';
                if (in_array($request["sortOrder"], ['ASC', 'DESC'])) {
                    $sort_order = $request["sortOrder"];
                }

                switch ($column) {
                    // 運用ID
                    case 'unyou_id':
                        $sort = 'unyou_id';
                        break;
                    // タイトル
                    case 'unyou_title':
                        $sort = 'unyou_title';
                        break;
                    // 作成日
                    case 'unyou_date':
                        $sort = 'unyou_date';
                        break;
                    // メモ
                    case 'unyou_memo':
                        $sort = 'unyou_memo';
                        break;
                    // 備考
                    case 'unyou_bikou':
                        $sort = 'unyou_bikou';
                        break;
                    // 添付ファイル
                    case 'file_path':
                        $sort = 'file_path';
                        break;
                    // 表示フラグ
                    case 'dsp_flg':
                        $sort = 'dsp_flg';
                        break;
                    default:
                        break;
                }

                $sort = $sort . ' ' .  $sort_order;
            }

            $SQL = <<<SQL
                    SELECT
                        unyou_id                                    -- 運用ID
                        , unyou_title                               -- タイトル
                        , unyou_date                                -- 作成日
                        , unyou_memo                                -- メモ
                        , unyou_bikou                               -- 備考
                        , file_path                                 -- 添付ファイル
                        , dsp_flg                                   -- 表示フラグ
                        , insert_date                               -- 作成日時
                        , insert_user                               -- 作成ユーザ
                        , update_date                               -- 更新日時
                        , update_user                               -- 更新ユーザ

                    FROM
                        t_unyou
                    WHERE
                        $where
                    ORDER BY
                        $sort
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            // DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return false;
        }
    }

    /**
     * 存在するデータを確認
     * 
     * @return response 結果
     */
    public function checkUnyouMemoDataBefore($unyou_id, $display_time)
    {
        try {
            $bindValue = array(
                'unyou_id' => $unyou_id,
                'display_time' => $display_time,
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        t_unyou      
                    WHERE
                        unyou_id = :unyou_id
                        AND update_date < cast(:display_time as timestamp)
                SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            // 処理正常終了
            return $result;
        } catch (\Exception $e) {
            // DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return false;
        }
    }

    /**
     * 運用メモシーケンスの取得
     * 
     * @return response 結果
     */
    public function getUnyouMemoNextVal()
    {
        try {
            $bindValue = array();

            $SQL = <<<SQL
                    SELECT 
                        last_value AS unyou_id_seq
                        , log_cnt
                    FROM t_unyou_unyou_id_seq
                    
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            // DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return false;
        }
    }

    /**
     * お知らせ管理シーケンスの取得
     * 
     * @return response 結果
     */
    public function getInfoNextVal()
    {
        try {
            $bindValue = array();

            $SQL = <<<SQL
                    SELECT last_value AS info_id_seq FROM t_info_info_id_seq
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            // DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return false;
        }
    }

    /**
     * 運用メモ削除処理
     *
     * 
     * @return response 処理結果
     */
    public function deleteUnyouMemoData($unyou_id)
    {
        try {
            // 検索条件作成
            $DeleteBindValue = array(
                'unyou_id' => $unyou_id,
            );

            // 登録データの削除
            $DelSQL = <<<SQL
                    DELETE
                    FROM 
                        t_unyou
                    WHERE
                        unyou_id = :unyou_id
            SQL;

            // 検査情報データ 削除
            DB::connection('suishitsu_db')->delete($DelSQL, $DeleteBindValue);

            // エラー発生の場合、処理中断する
            if (!$DelSQL) {
                return false;
            }

            // 処理正常終了
            return true;
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }

    /**
     * 運用メモを新規登録
     *
     * 
     * @return response 処理結果
     */
    public function insertUnyouMemoData($file_path, $data)
    {
        try {
            $insert_column = "";
            $insert_value = "";
            $bindValue = array(
                'unyou_title'                   => $data->unyou_title,                              // タイトル
                'unyou_date'                    => $data->unyou_date,                               // 作成日
                'unyou_memo'                    => $data->unyou_memo,                               // メモ
                'unyou_bikou'                   => $data->unyou_bikou,                              // 備考
                'dsp_flg'                       => $data->dsp_flg,                                  // 表示フラグ
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)         // 実施ユーザーID
            );

            // 添付ファイルがある場合
            if ($file_path) {
                $bindValue['file_path'] = $file_path;                                               // 添付ファイル
                $insert_column = ", file_path";
                $insert_value = ", :file_path";
            }

            $SQL = <<<SQL
                    INSERT INTO t_unyou( 
                        unyou_title                                 -- タイトル
                        , unyou_date                                -- 作成日
                        , unyou_memo                                -- メモ
                        , unyou_bikou                               -- 備考
                        , dsp_flg                                   -- 表示フラグ
                        , insert_date                               -- 作成日時
                        , insert_user                               -- 作成ユーザ
                        , update_date                               -- 更新日時
                        , update_user                               -- 更新ユーザ
                        $insert_column                              -- 添付ファイル
                    ) 
                    VALUES ( 
                        :unyou_title                                -- タイトル
                        , :unyou_date                               -- 作成日
                        , :unyou_memo                               -- メモ
                        , :unyou_bikou                              -- 備考
                        , :dsp_flg                                  -- 表示フラグ
                        , CURRENT_TIMESTAMP                         -- 作成日時
                        , :proc_user_id                             -- 作成ユーザ
                        , CURRENT_TIMESTAMP                         -- 更新日時
                        , :proc_user_id                             -- 更新ユーザ
                        $insert_value                               -- 添付ファイル
                    )
                SQL;

            DB::connection('suishitsu_db')->insert($SQL, $bindValue);

            // エラー発生の場合、処理中断する
            if (!$SQL) {
                return false;
            }

            // 処理正常終了
            return true;
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }

    /**
     * 運用メモを更新処理
     *
     * 
     * @return response 処理結果
     */
    public function updateUnyouMemoData($file_path, $data)
    {
        try {
            $update_set = "";
            $bindValue = array(
                'unyou_id'                      => $data->unyou_id,                                 // タイトル
                'unyou_title'                   => $data->unyou_title,                              // タイトル
                'unyou_date'                    => $data->unyou_date,                               // 作成日
                'unyou_memo'                    => $data->unyou_memo,                               // メモ
                'unyou_bikou'                   => $data->unyou_bikou,                              // 備考
                'dsp_flg'                       => $data->dsp_flg,                                  // 表示フラグ
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)         // 実施ユーザーID
            );

            // 添付ファイルがある場合
            if ($file_path || $data->info_clear_file_flg) {
                $bindValue['file_path'] = $file_path;                                               // 添付ファイル
                $update_set = ", file_path = :file_path";
            }

            $SQL = <<<SQL
                    UPDATE t_unyou
                    SET
                        unyou_title = :unyou_title                  -- タイトル
                        , unyou_date = :unyou_date                  -- 作成日
                        , unyou_memo = :unyou_memo                  -- メモ
                        , unyou_bikou = :unyou_bikou                -- 備考
                        , dsp_flg = :dsp_flg                        -- 表示フラグ
                        , update_date = CURRENT_TIMESTAMP           -- 更新日時
                        , update_user = :proc_user_id               -- 更新ユーザ
                        $update_set                                 -- 添付ファイル
                    WHERE
                        unyou_id = :unyou_id                        -- 運用ID
                SQL;

            DB::connection('suishitsu_db')->insert($SQL, $bindValue);

            // エラー発生の場合、処理中断する
            if (!$SQL) {
                return false;
            }

            // 処理正常終了
            return true;
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }

    /**
     * お知らせ管理を新規登録
     *
     * 
     * @return response 処理結果
     */
    public function insertInfoDataFromUnyouMemo($unyou_id, $data)
    {
        try {
            $bindValue = array(
                'info_date'                     => $data->unyou_date,                                               // 作成日
                'info_text'                     => "運用メモが追加されました。(" . $data->unyou_title . ")",            // お知らせ内容
                'info_link'                     => "/SPT030?unyouId=" . $unyou_id,                                  // リンク
                'unyou_id'                      => $unyou_id,                                                       // 運用ID
                'dsp_flg'                       => "1",                                                             // 表示フラグ
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)                         // 実施ユーザーID
            );

            $SQL = <<<SQL
                    INSERT INTO t_info( 
                        info_date                                   -- 掲載日
                        , info_text                                 -- お知らせ内容
                        , info_link                                 -- リンク
                        , unyou_id                                  -- 運用ID
                        , dsp_flg                                   -- 表示フラグ
                        , insert_date                               -- 作成日時
                        , insert_user                               -- 作成ユーザ
                        , update_date                               -- 更新日時
                        , update_user                               -- 更新ユーザ
                    ) 
                    VALUES ( 
                        :info_date                                -- 掲載日
                        , :info_text                                -- お知らせ内容
                        , :info_link                                -- リンク
                        , :unyou_id                                 -- 運用ID
                        , :dsp_flg                                  -- 表示フラグ
                        , CURRENT_TIMESTAMP                         -- 作成日時
                        , :proc_user_id                             -- 作成ユーザ
                        , CURRENT_TIMESTAMP                         -- 更新日時
                        , :proc_user_id                             -- 更新ユーザ
                    )
                SQL;

            DB::connection('suishitsu_db')->insert($SQL, $bindValue);

            // エラー発生の場合、処理中断する
            if (!$SQL) {
                return false;
            }

            // 処理正常終了
            return true;
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }
}
