<?php

namespace App\Dao;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * お知らせ管理DAO
 *
 */
class SPT010Dao
{
    /**
     * お知らせを取得
     * 
     * @return response 結果
     */
    public function searchOshiraseData($request)
    {
        try {
            // 検索条件作成
            $where = "1 = 1";
            $sort = "";
            $bindValue = array();

            // タイトル
            if (!is_null($request['infoText'])) {
                $where .= " AND info_text LIKE '%' || :info_text || '%' ";
                $bindValue['info_text'] = $request['infoText'];
            }

            // 掲載日
            if (!is_null($request['infoDate'])) {
                $where .= " AND TO_DATE(TO_CHAR(info_date, 'YYYY/MM/DD'),'YYYY/MM/DD') = :info_date ";
                $bindValue['info_date'] = $request['infoDate'];
            }

            // 表示フラグ
            if (!is_null($request['infoDspFlg'])) {
                $where .= " AND dsp_flg = :dsp_flg ";
                $bindValue['dsp_flg'] = $request['infoDspFlg'];
            }

            // ソート条件：デフォルトは整理番号の昇順
            $sort = 'info_id ASC';

            if (!is_null($request['sortColumn'])) {
                $column = $request["sortColumn"];

                $sort_order = 'ASC';
                if (in_array($request["sortOrder"], ['ASC', 'DESC'])) {
                    $sort_order = $request["sortOrder"];
                }

                switch ($column) {
                    // お知らせID
                    case 'info_id':
                        $sort = 'info_id';
                        break;
                    // お知らせ内容
                    case 'info_text':
                        $sort = 'info_text';
                        break;
                    // 掲載日
                    case 'info_date':
                        $sort = 'info_date';
                        break;
                    // リンク
                    case 'info_link':
                        $sort = 'info_link';
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
                       info_id                                                   -- お知らせID
                        , TO_CHAR(info_date, 'YYYY/MM/DD') AS info_date          -- 掲載日
                        , info_text                                              -- お知らせ内容
                        , info_link                                              -- リンク
                        , file_path                                              -- 添付ファイル
                        , unyou_id                                               -- 運用ID
                        , dsp_flg                                                -- 表示フラグ
                        , insert_date                                            -- 作成日時
                        , insert_user                                            -- 作成ユーザ
                        , update_date                                            -- 更新日時
                        , update_user                                            -- 更新ユーザ
                    FROM
                        t_info
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
    public function checkInfoDataBefore($info_id, $display_time)
    {
        try {
            $bindValue = array(
                'info_id' => $info_id,
                'display_time' => $display_time,
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        t_info      
                    WHERE
                        info_id = :info_id
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
     * お知らせ管理シーケンスの取得
     * 
     * @return response 結果
     */
    public function getInfoNextVal()
    {
        try {
            $bindValue = array();

            $SQL = <<<SQL
                    SELECT 
                        last_value AS info_id_seq
                        , log_cnt
                    FROM t_info_info_id_seq
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
     * お知らせを新規登録
     *
     * 
     * @return response 処理結果
     */
    public function insertInfoData($file_path, $data)
    {
        try {
            $insert_column = "";
            $insert_value = "";
            $bindValue = array(
                'info_text'                     => $data->info_text,                                // お知らせ内容
                'info_date'                     => $data->info_date,                                // 掲載日
                'info_link'                     => $data->info_link,                                // リンク
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
                    INSERT INTO t_info( 
                        info_text                                   -- お知らせ内容
                        , info_date                                 -- 掲載日
                        , info_link                                 -- リンク
                        , dsp_flg                                   -- 表示フラグ
                        , insert_date                               -- 作成日時
                        , insert_user                               -- 作成ユーザ
                        , update_date                               -- 更新日時
                        , update_user                               -- 更新ユーザ
                        $insert_column                              -- 添付ファイル
                    ) 
                    VALUES ( 
                        :info_text                                  -- お知らせ内容
                        , :info_date                                -- 掲載日
                        , :info_link                                -- リンク
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
     * お知らせを更新処理
     *
     * 
     * @return response 処理結果
     */
    public function updateInfoData($file_path, $data)
    {
        try {
            $update_set = "";
            $bindValue = array(
                'info_id'                       => $data->info_id,                                  // お知らせID
                'info_text'                     => $data->info_text,                                // お知らせ内容
                'info_date'                     => $data->info_date,                                // 掲載日
                'info_link'                     => $data->info_link,                                // リンク
                'dsp_flg'                       => $data->dsp_flg,                                  // 表示フラグ
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)         // 実施ユーザーID
            );

            // 添付ファイルがある場合
            if ($file_path || $data->info_clear_file_flg) {
                $bindValue['file_path'] = $file_path;                                               // 添付ファイル
                $update_set = ", file_path = :file_path";
            }

            $SQL = <<<SQL
                    UPDATE t_info
                    SET
                        info_text = :info_text                      -- お知らせ内容
                        , info_date = :info_date                    -- 掲載日
                        , info_link = :info_link                    -- リンク
                        , dsp_flg = :dsp_flg                        -- 表示フラグ
                        , update_date = CURRENT_TIMESTAMP           -- 更新日時
                        , update_user = :proc_user_id               -- 更新ユーザ
                        $update_set                                 -- 添付ファイル
                    WHERE
                        info_id = :info_id                          -- お知らせID
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
     * お知らせ削除処理
     *
     * 
     * @return response 処理結果
     */
    public function deleteInfoData($info_id)
    {
        try {
            // お知らせIDを設定
            $DeleteBindValue = array(
                'info_id' => $info_id,
            );

            // データの削除
            $DelSQL = <<<SQL
                    DELETE
                    FROM 
                        t_info
                    WHERE
                        info_id = :info_id
            SQL;

            // お知らせ 削除
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
}
