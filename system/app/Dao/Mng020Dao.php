<?php

namespace App\Dao;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Facades\Hash;

use stdClass;
use DateTime;

/**
 * 採水地点設定DAO
 *
 */
class Mng020Dao
{
    /**
     * 採水地点マスタを取得
     * 
     * @return response 結果
     */
    public function searchSaisuiPoint($request)
    {
        try {
            // 検索条件作成
            $where = "1 = 1";
            $sort = "";
            $bindValue = array();

            // 施設番号
            if (!is_null($request['sisetuNo'])) {
                $where .= " AND m_saisui_point.sisetu_no = :sisetu_no";
                $bindValue['sisetu_no'] = $request['sisetuNo'];
            }

            // 処理過程番号
            if (!is_null($request['processNo'])) {
                $where .= " AND m_saisui_point.process_no = :process_no";
                $bindValue['process_no'] = $request['processNo'];
            }

            // 地点名 ※ サービスで絞り込み（Mng050Service(00)）
            // if (!is_null($request['pointName'])) {
            //     $where .= " AND (m_saisui_point.point_dsp_name LIKE '%' || :point_name || '%' OR m_saisui_point.point_report_name LIKE '%' || :point_name || '%')";
            //     $bindValue['point_name'] = $request['pointName'];
            // }

            // 採水区分マスタ
            if (!is_null($request['saisuiKbnNo'])) {
                $where .= " AND m_saisui_point.saisui_kbn_no = :saisui_kbn_no";
                $bindValue['saisui_kbn_no'] = $request['saisuiKbnNo'];
            }

            // ソート条件：デフォルトは整理番号の昇順
            $sort = 'm_saisui_point.point_no asc';

            if (!is_null($request['sortColumn'])) {
                $column = $request["sortColumn"];

                $sort_order = 'ASC';
                if (in_array($request["sortOrder"], ['ASC', 'DESC'])) {
                    $sort_order = $request["sortOrder"];
                }

                switch ($column) {
                    // 地点番号
                    case 'point_no':
                        $sort = 'm_saisui_point.point_no';
                        break;
                    // 地点名称画面
                    case 'point_dsp_name':
                        $sort = 'm_saisui_point.point_dsp_name';
                        break;
                    // 地点名称報告書
                    case 'point_report_name':
                        $sort = 'm_saisui_point.point_report_name';
                        break;
                    // 採水区分名称
                    case 'saisui_kbn_name':
                        $sort = 'm_saisui_kbn.saisui_kbn_name';
                        break;
                    // 施設名称
                    case 'sisetu_name':
                        $sort = 'm_sisetu.sisetu_name';
                        break;
                    // 処理過程名称
                    case 'process_name':
                        $sort = 'm_process.process_name';
                        break;
                    default:
                        break;
                }

                $sort = $sort . ' ' .  $sort_order;
            }

            $SQL = <<<SQL
                    SELECT
                        m_saisui_point.point_no
                        , m_saisui_point.point_dsp_name
                        , m_saisui_point.point_report_name
                        , m_saisui_point.saisui_kbn_no
                        , m_saisui_kbn.saisui_kbn_name
                        , m_saisui_point.sisetu_no
                        , m_sisetu.sisetu_name
                        , m_saisui_point.process_no
                        , m_process.process_name
                    FROM
                        m_saisui_point
                    LEFT JOIN
                        m_saisui_kbn AS m_saisui_kbn
                        ON m_saisui_point.saisui_kbn_no = m_saisui_kbn.saisui_kbn_no
                    LEFT JOIN
                        m_sisetu AS m_sisetu
                        ON m_saisui_point.sisetu_no = m_sisetu.sisetu_no
                        LEFT JOIN
                        m_process AS m_process
                        ON m_saisui_point.process_no = m_process.process_no
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
     * 採水地点マスタデータを取得 (最大の値)
     * 
     * @return response 結果
     */
    public function searchMaxSaisuiPoint()
    {
        try {
            // 検索条件作成
            $bindValue = array();

            $SQL = <<<SQL
                    SELECT
                        MAX(m_saisui_point.point_no) AS max_point_no
                    FROM
                        m_saisui_point
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
    public function checkSaisuiPointDataBefore($saisui_point_data, $display_time)
    {
        try {
            foreach ($saisui_point_data as $value) {
                $bindValue = array(
                    'point_no' => $value->pointNo,
                    'display_time' => $display_time,
                );

                $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_saisui_point
                    WHERE
                        point_no = :point_no
                        AND update_date > cast(:display_time as timestamp)
                SQL;

                $result = array();
                $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

                // 件数が返ってきた場合、処理を中断する
                if ($result && $result[0]) {
                    return false;
                }
            }

            // 処理正常終了
            return true;
        } catch (\Exception $e) {
            // DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return false;
        }
    }

    /**
     * 採水地点設定削除処理
     *
     * 
     * @return response 処理結果
     */
    public function deleteSaisuiPointData($saisui_point_data)
    {
        try {
            foreach ($saisui_point_data as $value) {
                // 検索条件作成
                $DeleteBindValue = array(
                    'point_no' => $value->pointNo
                );

                // 登録データの削除
                $DelSQL = <<<SQL
                    DELETE
                    FROM 
                        m_saisui_point
                    WHERE
                        point_no = :point_no
            SQL;

                // 検査情報データ 削除
                DB::connection('suishitsu_db')->delete($DelSQL, $DeleteBindValue);

                // エラー発生の場合、処理中断する
                if (!$DelSQL) {
                    return false;
                }
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
     * 採水地点設定マスタを新規登録
     *
     * 
     * @return response 処理結果
     */
    public function insertSaisuiPointData($saisui_point_data)
    {
        try {
            foreach ($saisui_point_data as $value) {
                $bindValue = array(
                    'point_no'                      => $value->pointNo,                             // 地点番号
                    'point_dsp_name'                => $value->pointDspName,                        // 地点名称画面
                    'point_report_name'             => $value->pointReportName,                     // 地点名称報告書
                    'saisui_kbn_no'                 => $value->saisuiKbnNo,                         // 採水区分番号
                    'sisetu_no'                     => $value->sisetuNo,                            // 施設番号
                    'process_no'                    => $value->processNo,                           // 処理過程番号
                    'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)     // 実施ユーザーID
                );

                $SQL = <<<SQL
                    INSERT INTO m_saisui_point( 
                        point_no                                    -- 地点番号
                        , point_dsp_name                            -- 地点名称画面
                        , point_report_name                         -- 地点名称報告書
                        , saisui_kbn_no                             -- 採水区分番号
                        , sisetu_no                                 -- 施設番号
                        , process_no                                -- 処理過程番号
                        , insert_date                               -- 作成日時
                        , insert_user                               -- 作成ユーザ
                        , update_date                               -- 更新日時
                        , update_user                               -- 更新ユーザ
                    ) 
                    VALUES ( 
                        :point_no                                   -- 地点番号
                        , :point_dsp_name                           -- 地点名称画面
                        , :point_report_name                        -- 地点名称報告書
                        , :saisui_kbn_no                            -- 採水区分番号
                        , :sisetu_no                                -- 施設番号
                        , :process_no                               -- 処理過程番号
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
