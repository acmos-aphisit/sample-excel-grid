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
 * 検査基準マスタDAO
 *
 */
class Mng040Dao
{
    /**
     * 基準値一覧検索条件に使用するセレクトボックスの値を取得
     * 
     * @return response 結果
     */
    public function fetchInspCriteriaHoukijyunList()
    {
        try {
            $SQL = <<<SQL
                    SELECT DISTINCT
                        hou_kijyun_no
                    FROM
                        m_inspection_criteria
                    ORDER BY
                        hou_kijyun_no DESC
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            // DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return false;
        }
    }

    /**
     * 最新の適用年度と追加する適用年度を以下条件で取得し、画面に設定する。
     * 
     * @return response 結果
     */
    public function getLatestYear()
    {
        try {
            $SQL = <<<SQL
                    SELECT DISTINCT
                        MAX(hou_kijyun_no) as latest_year
                    FROM
                        m_inspection_criteria
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            // DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return false;
        }
    }

    /**
     * 検査基準マスタを取得
     * 
     * @return response 結果
     */
    public function searchInspCriteriaData($request)
    {
        try {
            // 検索条件作成
            $where = "1 = 1";
            $sort = "";
            $bindValue = array();

            // 施設番号
            if (!is_null($request['applyYear'])) {
                $where .= " AND m_inspection_criteria.hou_kijyun_no = :hou_kijyun_no";
                $bindValue['hou_kijyun_no'] = $request['applyYear'];
            }

            // 項目名 ※ サービスで絞り込み（Mng040Service(52)）
            // if (!is_null($request['itemName'])) {
            //     $where .= " AND m_inspection_criteria.item_dsp_name = :item_dsp_name";
            //     $bindValue['item_dsp_name'] = $request['itemName'];
            // }

            // 採水区分マスタ
            if (!is_null($request['saisuiKbnNo'])) {
                $where .= " AND m_inspection_criteria.saisui_kbn_no = :saisui_kbn_no";
                $bindValue['saisui_kbn_no'] = $request['saisuiKbnNo'];
            }

            // ソート条件：デフォルトは整理番号の昇順
            $sort = 'item_no ASC, saisui_kbn_no ASC';

            if (!is_null($request['sortColumn'])) {
                $column = $request["sortColumn"];

                $sort_order = 'ASC';
                if (in_array($request["sortOrder"], ['ASC', 'DESC'])) {
                    $sort_order = $request["sortOrder"];
                }

                switch ($column) {
                    // 項目番号
                    case 'item_no':
                        $sort = 'm_inspection_criteria.item_no';
                        break;
                    // 項目名称画面
                    case 'item_dsp_name':
                        $sort = 'm_inspection_item.item_dsp_name';
                        break;
                    // 採水区分番号
                    case 'saisui_kbn_no':
                        $sort = 'm_inspection_criteria.saisui_kbn_no';
                        break;
                    // 規制下限値
                    case 'regulation_low_limit':
                        $sort = 'm_inspection_criteria.regulation_low_limit';
                        break;
                    // 規制上限値
                    case 'regulation_up_limit':
                        $sort = 'm_inspection_criteria.regulation_up_limit';
                        break;
                    // 入力下限値
                    case 'input_low_limit':
                        $sort = 'm_inspection_criteria.input_low_limit';
                        break;
                    // 入力上限値
                    case 'input_up_limit':
                        $sort = 'm_inspection_criteria.input_up_limit';
                        break;
                    // 帳票下限値
                    case 'report_low_limit':
                        $sort = 'm_inspection_criteria.report_low_limit';
                        break;
                    // 帳票上限値
                    case 'report_up_limit':
                        $sort = 'm_inspection_criteria.report_up_limit';
                        break;
                    // 有効桁数
                    case 'valid_digits':
                        $sort = 'm_inspection_criteria.valid_digits';
                        break;
                    // 入力最小桁
                    case 'input_min_digits':
                        $sort = 'm_inspection_criteria.input_min_digits';
                        break;
                    // 出力最小桁
                    case 'output_min_digits':
                        $sort = 'm_inspection_criteria.output_min_digits';
                        break;
                    // コメント
                    case 'insp_criteria_comment':
                        $sort = 'm_inspection_criteria.insp_criteria_comment';
                        break;
                    default:
                        break;
                }

                $sort = $sort . ' ' .  $sort_order;
            }

            $SQL = <<<SQL
                    SELECT
                        m_inspection_criteria.item_no                                     -- 項目番号
                        , m_inspection_item.item_dsp_name                                 -- 項目名称画面
                        , m_inspection_criteria.saisui_kbn_no                             -- 採水区分番号
                        , m_inspection_criteria.regulation_low_limit                      -- 規制下限値
                        , m_inspection_criteria.regulation_up_limit                       -- 規制上限値
                        , m_inspection_criteria.input_low_limit                           -- 入力下限値
                        , m_inspection_criteria.input_up_limit                            -- 入力上限値
                        , m_inspection_criteria.report_low_limit                          -- 帳票下限値
                        , m_inspection_criteria.report_up_limit                           -- 帳票上限値
                        , m_inspection_criteria.valid_digits                              -- 有効桁数
                        , m_inspection_criteria.input_min_digits                          -- 入力最小桁
                        , m_inspection_criteria.output_min_digits                         -- 出力最小桁
                        , m_inspection_criteria.insp_criteria_comment                     -- コメント

                    FROM
                        m_inspection_criteria 
                        INNER JOIN m_inspection_item
                            ON m_inspection_criteria.item_no = m_inspection_item.item_no
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
     * ユーザマスタを取得
     * 
     * @return response 結果
     */
    public function fetchAllUserData()
    {
        try {
            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_user 
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            // DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return false;
        }
    }

    /**
     * 検査基準マスタデータを取得 (最大の値)
     * 
     * @return response 結果
     */
    public function searchMaxItemNo()
    {
        try {
            // 検索条件作成
            $bindValue = array();

            $SQL = <<<SQL
                    SELECT
                        MAX(m_inspection_item.item_no) AS max_item_no
                    FROM
                        m_inspection_item
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
     * 選択肢マスタを取得
     * 
     * @return response 結果
     */
    public function searchSelectOptionData($request)
    {
        try {
            // 検索条件作成
            $sort = "";
            $bindValue = array(
                'item_no' => $request['itemNo'],
            );

            // ソート条件：デフォルトは整理番号の昇順
            $sort = 'm_selection.selection_no ASC';

            if (!is_null($request['sortColumn'])) {
                $column = $request["sortColumn"];

                $sort_order = 'ASC';
                if (in_array($request["sortOrder"], ['ASC', 'DESC'])) {
                    $sort_order = $request["sortOrder"];
                }

                switch ($column) {
                    // 選択肢番号
                    case 'selection_no':
                        $sort = 'm_selection.selection_no';
                        break;
                    // 選択肢
                    case 'selection_name':
                        $sort = 'm_selection.selection_name';
                        break;
                    // 順序
                    case 'sort_value':
                        $sort = 'm_selection.sort_value';
                        break;
                    default:
                        break;
                }

                $sort = $sort . ' ' .  $sort_order;
            }

            $SQL = <<<SQL
                    SELECT
                        m_inspection_item.item_dsp_name                         -- 項目名称画面
                        , m_selection.selection_no                              -- 選択肢番号
                        , m_selection.selection_name                            -- 選択肢
                        , m_selection.sort_value                                -- ソート値
                    FROM
                        m_selection 
                        INNER JOIN m_inspection_item
                            ON m_selection.item_no = m_inspection_item.item_no
                    WHERE
                        m_selection.item_no = :item_no
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
    public function checkSelectionDataBefore($item_no, $display_time)
    {
        try {
            $bindValue = array(
                'item_no' => $item_no,
                'display_time' => $display_time,
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_selection
                    WHERE
                        item_no = :item_no
                        AND update_date > cast(:display_time as timestamp)
                SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            // 件数が返ってきた場合、処理を中断する
            if ($result && $result[0]) {
                return false;
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
     * 選択肢マスタ削除処理
     *
     * 
     * @return response 処理結果
     */
    public function deleteSelectionData($item_no)
    {
        try {
            $DeleteBindValue = array(
                'item_no' => $item_no,
            );

            // 登録データの削除
            $DelSQL = <<<SQL
              DELETE FROM m_selection
              WHERE
                  item_no = :item_no
            SQL;

            // 検査情報データ 削除
            DB::connection('suishitsu_db')->delete($DelSQL, $DeleteBindValue);

            // 処理正常終了
            return true;
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }

    /**
     * 選択肢マスタを新規登録
     *
     * 
     * @return response 処理結果
     */
    public function insertSelectionData($item_no, $selection_data)
    {
        try {
            foreach ($selection_data as $value) {
                $bindValue = array(
                    'item_no'                       => $item_no,                                    // 項目番号
                    'selection_no'                  => $value->selectionNo,                         // 選択肢番号
                    'selection_name'                => $value->selectionName,                       // 選択肢
                    'sort_value'                    => $value->sortValue,                           // ソート値
                    'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)     // 実施ユーザーID
                );

                $SQL = <<<SQL
                    INSERT INTO m_selection( 
                        item_no                                     -- 項目番号
                        , selection_no                              -- 選択肢番号
                        , selection_name                            -- 選択肢
                        , sort_value                                -- ソート値
                        , insert_date                               -- 作成日時
                        , insert_user                               -- 作成ユーザ
                        , update_date                               -- 更新日時
                        , update_user                               -- 更新ユーザ
                    ) 
                    VALUES ( 
                        :item_no                                    -- 項目番号
                        , :selection_no                             -- 選択肢番号
                        , :selection_name                           -- 選択肢
                        , :sort_value                               -- ソート値
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

    /**
     * 存在するデータを確認
     * 
     * @return response 結果
     */
    public function checkAddNextYearBefore($hou_kijyun_no)
    {
        try {
            $bindValue = array(
                'hou_kijyun_no' => $hou_kijyun_no,
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_inspection_criteria
                    WHERE
                        hou_kijyun_no = :hou_kijyun_no
                SQL;
            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            // 件数が返ってきた場合、処理を中断する
            if ($result && $result[0]) {
                return false;
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
     * 検査基準.法基準番号(年) = 画面.適用年度追加画面.最新の適用年度 で取得できるデータを登録する。
     * 
     * @return response 結果
     */
    public function getLatestYearData($hou_kijyun_no)
    {
        try {
            $bindValue = array(
                'hou_kijyun_no' => $hou_kijyun_no,
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_inspection_criteria
                    WHERE
                        hou_kijyun_no = :hou_kijyun_no
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
     * 存在するデータを確認
     * 
     * @return response 結果
     */
    public function checkInspectionCriteriaDataBefore($display_time, $hou_kijyun_no)
    {
        try {
            $bindValue = array(
                'hou_kijyun_no' => $hou_kijyun_no,
                'display_time'  => $display_time,
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_inspection_criteria
                    WHERE
                        hou_kijyun_no = :hou_kijyun_no
                        AND update_date > cast(:display_time as timestamp)
                SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            // 件数が返ってきた場合、処理を中断する
            if ($result && $result[0]) {
                return false;
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
     * 基準値補正マスタ 取得
     * 
     * @return response 結果
     */
    public function getCriteriaCorrectionData($hou_kijyun_no)
    {
        try {
            $bindValue = array(
                'hou_kijyun_no' => $hou_kijyun_no,
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        t_criteria_correction
                    WHERE
                        hou_kijyun_no = :hou_kijyun_no
                    ORDER BY
                        criteria_correction_id
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
     * 検査基準マスタ削除処理
     *
     * 
     * @return response 処理結果
     */
    public function deleteInspectionCriteriaData($inspection_data, $apply_year)
    {
        try {
            foreach ($inspection_data as $value) {
                $DeleteBindValue = array(
                    'item_no'              => $value->itemNo,                // 項目番号
                    'hou_kijyun_no'        => $apply_year,                   // 法基準番号(年)
                    'saisui_kbn_no'        => $value->saisuiKbnNo,           // 採水区分番号
                );

                // 登録データの削除
                $DelSQL = <<<SQL
                    DELETE FROM 
                        m_inspection_criteria
                    WHERE
                        item_no = :item_no
                        AND hou_kijyun_no = :hou_kijyun_no
                        AND saisui_kbn_no = :saisui_kbn_no
                SQL;

                // 検査情報データ 削除
                DB::connection('suishitsu_db')->delete($DelSQL, $DeleteBindValue);
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
     * 統計値マスタ削除処理 (全削除)
     *
     * 
     * @return response 処理結果
     */
    public function deleteStatisticsData()
    {
        try {
            $DeleteBindValue = array();

            // 登録データの削除
            $DelSQL = <<<SQL
              DELETE FROM 
                m_statistics
            SQL;

            // 検査情報データ 削除
            DB::connection('suishitsu_db')->delete($DelSQL, $DeleteBindValue);

            // 処理正常終了
            return true;
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }

    /**
     * 検査基準マスタを新規登録
     *
     * 
     * @return response 処理結果
     */
    public function insertInspectionData($inspection_data, $apply_year)
    {
        try {
            foreach ($inspection_data as $value) {
                $bindValue = array(
                    'item_no'              => $value->itemNo,                // 項目番号
                    'hou_kijyun_no'        => $apply_year,                   // 法基準番号(年)
                    'saisui_kbn_no'        => $value->saisuiKbnNo,           // 採水区分番号
                    'regulation_low_limit' => $value->regulationLowLimit,    // 規制下限値
                    'regulation_up_limit'  => $value->regulationUpLimit,     // 規制上限値
                    'input_low_limit'      => $value->inputLowLimit,         // 入力下限値
                    'input_up_limit'       => $value->inputUpLimit,          // 入力上限値
                    'report_low_limit'     => $value->reportLowLimit,        // 帳票下限値
                    'report_up_limit'      => $value->reportUpLimit,         // 帳票上限値
                    'valid_digits'         => $value->validDigits,           // 有効桁数
                    'input_min_digits'     => $value->inputMinDigits,        // 入力最小桁
                    'output_min_digits'    => $value->outputMinDigits,       // 出力最小桁
                    'insp_criteria_comment' => $value->inspCriteriaComment,   // コメント
                    'proc_user_id'          => intval(auth('sanctum')->user()->user_id), // 更新ユーザ
                );

                $SQL = <<<SQL
                    INSERT INTO m_inspection_criteria( 
                        item_no                                     -- 項目番号
                        , hou_kijyun_no                             -- 法基準番号(年)
                        , saisui_kbn_no                             -- 採水区分番号
                        , regulation_low_limit                      -- 規制下限値
                        , regulation_up_limit                       -- 規制上限値
                        , input_low_limit                           -- 入力下限値
                        , input_up_limit                            -- 入力上限値
                        , report_low_limit                          -- 帳票下限値
                        , report_up_limit                           -- 帳票上限値
                        , valid_digits                              -- 有効桁数
                        , input_min_digits                          -- 入力最小桁
                        , output_min_digits                         -- 出力最小桁
                        , insp_criteria_comment                     -- コメント
                        , insert_date                               -- 作成日時
                        , insert_user                               -- 作成ユーザ
                        , update_date                               -- 更新日時
                        , update_user                               -- 更新ユーザ
                    ) 
                    VALUES ( 
                        :item_no                                    -- 項目番号
                        , :hou_kijyun_no                            -- 法基準番号(年)
                        , :saisui_kbn_no                            -- 採水区分番号
                        , :regulation_low_limit                     -- 規制下限値
                        , :regulation_up_limit                      -- 規制上限値
                        , :input_low_limit                          -- 入力下限値
                        , :input_up_limit                           -- 入力上限値
                        , :report_low_limit                         -- 帳票下限値
                        , :report_up_limit                          -- 帳票上限値
                        , :valid_digits                             -- 有効桁数
                        , :input_min_digits                         -- 入力最小桁
                        , :output_min_digits                        -- 出力最小桁
                        , :insp_criteria_comment                    -- コメント
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

    /**
     * 存在するデータを確認
     * 
     * @return response 結果
     */
    public function checkUserMasterDataBefore($saisui_point_data, $display_time)
    {
        try {
            $bindValue = array(
                'display_time' => $display_time,
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_user      
                    WHERE
                        update_date > cast(:display_time as timestamp)
                SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            // 件数が返ってきた場合、処理を中断する
            if ($result && $result[0]) {
                return false;
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
     * 存在するデータを確認
     * 
     * @return response 結果
     */
    public function getStatisticsMasterData($latest_year)
    {
        try {
            $bindValue = array(
                'latest_year' => $latest_year,
            );

            $SQL = <<<SQL
                    SELECT 
                        t_inspection_result.point_no,
                        t_inspection_result.item_no,
                        t_inspection_result.inspection_kbn_code,
                        COUNT(t_inspection_result.constant_data) AS statistics_count,
                        STDDEV_SAMP(t_inspection_result.constant_data) AS std_dev,
                        AVG(t_inspection_result.constant_data) AS avg,
                        AVG(t_inspection_result.constant_data) + STDDEV(t_inspection_result.constant_data) * 3 AS c_upper,
                        AVG(t_inspection_result.constant_data) - STDDEV(t_inspection_result.constant_data) * 3 AS c_lower
                    FROM t_inspection_result
                    WHERE 
                        t_inspection_result.saisui_date BETWEEN 
                            to_date((:latest_year - 3) || '0401', 'YYYYMMDD')
                            AND 
                            to_date(:latest_year || '0331', 'YYYYMMDD')
                        AND t_inspection_result.constant_qualitative_flg = 1
                        AND t_inspection_result.inspection_kbn_code <= 1400
                        AND t_inspection_result.item_no IN (
                            SELECT m_inspection_item.item_no 
                            FROM m_inspection_item 
                            WHERE m_inspection_item.input_type = 1
                        )
                        AND t_inspection_result.inspection_kbn_code IN (
                            SELECT m_inspection_kbn.inspection_kbn_code 
                            FROM m_inspection_kbn 
                            WHERE m_inspection_kbn.inspection_kbn_code <= 400
                        )
                    GROUP BY 
                        t_inspection_result.point_no,
                        t_inspection_result.item_no,
                        t_inspection_result.inspection_kbn_code
                    HAVING 
                        STDDEV_SAMP(t_inspection_result.constant_data) IS NOT NULL
                    ORDER BY 
                        t_inspection_result.point_no ASC,
                        t_inspection_result.item_no ASC,
                        t_inspection_result.inspection_kbn_code ASC;
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
     * ユーザマスタ削除処理
     *
     * 
     * @return response 処理結果
     */
    public function deleteUserMasterData($user_no)
    {
        try {
            // 検索条件作成
            $DeleteBindValue = array(
                'user_no' => $user_no,
            );

            // 登録データの削除
            $DelSQL = <<<SQL
                    DELETE
                    FROM 
                        m_user
                    WHERE
                        user_no = :user_no
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
     * ユーザマスタを新規登録
     *
     * 
     * @return response 処理結果
     */
    public function insertUserMasterData($user_master_data)
    {
        try {
            $bindValue = array(
                'user_id'                       => $user_master_data->userId,                      // ユーザID
                'user_password'                 => Hash::make($user_master_data->userPassword),    // パスワード
                'user_name'                     => $user_master_data->userName,                    // 氏名
                'user_furigana'                 => $user_master_data->userFurigana,                // ふりがな
                'affiliation_dept'              => $user_master_data->affiliationDept,             // 所属部
                'affiliation_section_no'        => $user_master_data->affiliationSectionNo,        // 所属課番号
                'security_level'                => $user_master_data->securityLevel,               // 権限
                'regist_date'                   => $user_master_data->registDate,                  // 登録年月日
                'end_date'                      => $user_master_data->endDate,                     // 終了年月日
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)        // 実施ユーザーID
            );

            $SQL = <<<SQL
                    INSERT INTO m_user( 
                        user_id                                     -- ユーザID
                        , user_password                             -- パスワード
                        , user_name                                 -- 氏名
                        , user_furigana                             -- ふりがな
                        , affiliation_dept                          -- 所属部
                        , affiliation_section_no                    -- 所属課番号
                        , security_level                            -- 権限
                        , regist_date                               -- 登録年月日
                        , end_date                                  -- 終了年月日
                        , insert_date                               -- 作成日時
                        , insert_user                               -- 作成ユーザ
                        , update_date                               -- 更新日時
                        , update_user                               -- 更新ユーザ
                    ) 
                    VALUES ( 
                        :user_id                                    -- ユーザID
                        , :user_password                            -- パスワード
                        , :user_name                                -- 氏名
                        , :user_furigana                            -- ふりがな
                        , :affiliation_dept                         -- 所属部
                        , :affiliation_section_no                   -- 所属課番号
                        , :security_level                           -- 権限
                        , :regist_date                              -- 登録年月日
                        , :end_date                                 -- 終了年月日
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

    /**
     * ユーザマスタ更新処理
     *
     * 
     * @return response 処理結果
     */
    public function updateUserMasterData($table_list)
    {
        try {
            $update_set = "";
            $bindValue = array(
                'user_no'                           => $table_list->userNo,                             // ユーザNo
                'user_id'                           => $table_list->userId,                             // ユーザID
                'user_name'                         => $table_list->userName,                           // ふりがな
                'user_furigana'                     => $table_list->userFurigana,                       // 所属部
                'affiliation_dept'                  => $table_list->affiliationDept,                    // 所属課番号
                'affiliation_section_no'            => $table_list->affiliationSectionNo,               // 権限
                'security_level'                    => $table_list->securityLevel,                      // 登録年月日
                'regist_date'                       => $table_list->registDate,                         // 終了年月日
                'end_date'                          => $table_list->endDate,                            // 更新日時
                'proc_user_id'                      => intval(auth('sanctum')->user()->user_id)         // 更新ユーザ
            );

            if ($table_list->userPassword) {
                $update_set = ", user_password = :user_password";
                $bindValue['user_password'] = Hash::make($table_list->userPassword);                    // パスワード
            }

            $SQL = <<<SQL
                    UPDATE m_user 
                    SET
                        user_id = :user_id                                          -- ユーザID
                        $update_set
                        , user_name = :user_name                                    -- 氏名
                        , user_furigana = :user_furigana                            -- ふりがな
                        , affiliation_dept = :affiliation_dept                      -- 所属部
                        , affiliation_section_no = :affiliation_section_no          -- 所属課番号
                        , security_level = :security_level                          -- 権限
                        , regist_date = :regist_date                                -- 登録年月日
                        , end_date = :end_date                                      -- 終了年月日
                        , update_date = CURRENT_TIMESTAMP                           -- 更新日時
                        , update_user = :proc_user_id                               -- 更新ユーザ
                    WHERE 
                      user_no = :user_no                                            -- ユーザNo
            SQL;


            DB::connection('suishitsu_db')->update($SQL, $bindValue);
            return true;
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }

    /**
     * 検査基準マスタを新規登録
     *
     * 
     * @return response 処理結果
     */
    public function addNextYearInspCriteria($latest_year_data, $next_year)
    {
        try {
            foreach ($latest_year_data as $value) {
                $bindValue = array(
                    'item_no'                       => $value->item_no,                                 // 項目番号
                    'hou_kijyun_no'                 => $next_year,                                      // 法基準番号(年)
                    'saisui_kbn_no'                 => $value->saisui_kbn_no,                           // 採水区分番号
                    'regulation_low_limit'          => $value->regulation_low_limit,                    // 規制下限値
                    'regulation_up_limit'           => $value->regulation_up_limit,                     // 規制上限値
                    'input_low_limit'               => $value->input_low_limit,                         // 入力下限値
                    'input_up_limit'                => $value->input_up_limit,                          // 入力上限値
                    'report_low_limit'              => $value->report_low_limit,                        // 帳票下限値
                    'report_up_limit'               => $value->report_up_limit,                         // 帳票上限値
                    'valid_digits'                  => $value->valid_digits,                            // 有効桁数
                    'input_min_digits'              => $value->input_min_digits,                        // 入力最小桁
                    'output_min_digits'             => $value->output_min_digits,                       // 出力最小桁
                    'insp_criteria_comment'         => $value->insp_criteria_comment,                   // コメント
                    'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)         // 実施ユーザーID
                );

                $SQL = <<<SQL
                    INSERT INTO m_inspection_criteria( 
                        item_no                                     -- 項目番号
                        , hou_kijyun_no                             -- 法基準番号(年)
                        , saisui_kbn_no                             -- 採水区分番号
                        , regulation_low_limit                      -- 規制下限値
                        , regulation_up_limit                       -- 規制上限値
                        , input_low_limit                           -- 入力下限値
                        , input_up_limit                            -- 入力上限値
                        , report_low_limit                          -- 帳票下限値
                        , report_up_limit                           -- 帳票上限値
                        , valid_digits                              -- 有効桁数
                        , input_min_digits                          -- 入力最小桁
                        , output_min_digits                         -- 出力最小桁
                        , insp_criteria_comment                     -- コメント
                        , insert_date                               -- 作成日時
                        , insert_user                               -- 作成ユーザ
                        , update_date                               -- 更新日時
                        , update_user                               -- 更新ユーザ
                    ) 
                    VALUES ( 
                        :item_no                                    -- 項目番号
                        , :hou_kijyun_no                            -- 法基準番号(年)
                        , :saisui_kbn_no                            -- 採水区分番号
                        , :regulation_low_limit                     -- 規制下限値
                        , :regulation_up_limit                      -- 規制上限値
                        , :input_low_limit                          -- 入力下限値
                        , :input_up_limit                           -- 入力上限値
                        , :report_low_limit                         -- 帳票下限値
                        , :report_up_limit                          -- 帳票上限値
                        , :valid_digits                             -- 有効桁数
                        , :input_min_digits                         -- 入力最小桁
                        , :output_min_digits                        -- 出力最小桁
                        , :insp_criteria_comment                    -- コメント
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

    /**
     * 統計値マスタ登録処理
     *
     * 
     * @return response 処理結果
     */
    public function addNextYearStatistics($value, $conv_std_dev, $conv_avg, $conv_c_upper, $conv_c_lower, $hou_kijyun_no)
    {
        try {
            $bindValue = array(
                'point_no'                      => $value->point_no,                                    // 地点番号
                'item_no'                       => $value->item_no,                                     // 項目番号
                'inspection_kbn_code'           => $value->inspection_kbn_code,                         // 検査区分CD
                'statistics_start_date'         => strval(intval($hou_kijyun_no) - 3) . "/04/01",       // 開始日
                'statistics_end_date'           => strval(intval($hou_kijyun_no)) . "/03/31",           // 終了日
                'statistics_count'              => $value->statistics_count,                            // 個数
                'standard_deviation'            => $conv_std_dev,                                       // 標準偏差
                'statistics_average'            => $conv_avg,                                           // 平均
                'c_sigma'                       => 3,                                                   // C_Sigma
                'c_upper'                       => $conv_c_upper,                                       // C_Upper
                'c_lower'                       => $conv_c_lower,                                       // C_Lower
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)             // 実施ユーザーID
            );

            $SQL = <<<SQL
                    INSERT INTO m_statistics( 
                        point_no                                    -- 地点番号
                        , item_no                                   -- 項目番号
                        , inspection_kbn_code                       -- 検査区分CD
                        , statistics_start_date                     -- 開始日
                        , statistics_end_date                       -- 終了日
                        , statistics_count                          -- 個数
                        , standard_deviation                        -- 標準偏差
                        , statistics_average                        -- 平均
                        , c_sigma                                   -- C_Sigma
                        , c_upper                                   -- C_Upper
                        , c_lower                                   -- C_Lower
                        , insert_date                               -- 作成日時
                        , insert_user                               -- 作成ユーザ
                        , update_date                               -- 更新日時
                        , update_user                               -- 更新ユーザ
                    ) 
                    VALUES ( 
                        :point_no                                   -- 地点番号
                        , :item_no                                  -- 項目番号
                        , :inspection_kbn_code                      -- 検査区分CD
                        , :statistics_start_date                    -- 開始日
                        , :statistics_end_date                      -- 終了日
                        , :statistics_count                         -- 個数
                        , :standard_deviation                       -- 標準偏差
                        , :statistics_average                       -- 平均
                        , :c_sigma                                  -- C_Sigma
                        , :c_upper                                  -- C_Upper
                        , :c_lower                                  -- C_Lower
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

    /**
     * 基準値補正マスタを新規登録
     *
     * 
     * @return response 処理結果
     */
    public function addNextYearCriteriaCorrection($latest_year_data, $next_year)
    {
        try {
            foreach ($latest_year_data as $value) {
                $bindValue = array(
                    'input_dsp_no'        => $value->input_dsp_no,                            // 入力画面番号
                    'report_no'           => $value->report_no,                               // 報告書番号
                    'item_no'             => $value->item_no,                                 // 項目番号
                    'point_no'            => $value->point_no,                                // 地点番号
                    'inspection_kbn_code' => $value->inspection_kbn_code,                     // 検査区分CD
                    'saisui_kbn_no'       => $value->saisui_kbn_no,                           // 採水区分番号
                    'hou_kijyun_no'       => $next_year,                                      // 法基準番号(年)
                    'report_low_limit'    => $value->report_low_limit,                        // 帳票下限値
                    'valid_digits'        => $value->valid_digits,                            // 有効桁数
                    'input_min_digits'    => $value->input_min_digits,                        // 入力最小桁
                    'output_min_digits'   => $value->output_min_digits,                       // 出力最小桁
                    'proc_user_id'        => intval(auth('sanctum')->user()->user_id)         // 実施ユーザーID
                );

                $SQL = <<<SQL
                    INSERT INTO t_criteria_correction( 
                          input_dsp_no                              -- 入力画面番号
                        , report_no                                 -- 報告書番号
                        , item_no                                   -- 項目番号
                        , point_no                                  -- 地点番号
                        , inspection_kbn_code                       -- 検査区分CD
                        , saisui_kbn_no                             -- 採水区分番号
                        , hou_kijyun_no                             -- 法基準番号(年)
                        , report_low_limit                          -- 帳票下限値
                        , valid_digits                              -- 有効桁数
                        , input_min_digits                          -- 入力最小桁
                        , output_min_digits                         -- 出力最小桁
                        , insert_date                               -- 作成日時
                        , insert_user                               -- 作成ユーザ
                        , update_date                               -- 更新日時
                        , update_user                               -- 更新ユーザ
                    ) 
                    VALUES ( 
                          :input_dsp_no                             -- 入力画面番号
                        , :report_no                                -- 報告書番号
                        , :item_no                                  -- 項目番号
                        , :point_no                                 -- 地点番号
                        , :inspection_kbn_code                      -- 検査区分CD
                        , :saisui_kbn_no                            -- 採水区分番号
                        , :hou_kijyun_no                            -- 法基準番号(年)
                        , :report_low_limit                         -- 帳票下限値
                        , :valid_digits                             -- 有効桁数
                        , :input_min_digits                         -- 入力最小桁
                        , :output_min_digits                        -- 出力最小桁
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

    /**
     * 検査基準値の取得
     *
     * @param int $pointNo 地点番号
     * @param int $itemNo 項目番号
     * @param int $houKijyunNo 法基準番号(採水年月日の年)
     * @return array|false 検査基準値取得結果|取得失敗(false)
     */
    public function getInspCriteriaReferenceValue($itemNo, $pointNo, $houKijyunNo)
    {
        try {
            $bindValue = [
                'point_no' => $pointNo,
                'item_no' => $itemNo,
                'hou_kijyun_no' => $houKijyunNo,
            ];

            $SQL = <<<SQL
                    SELECT
                    CAST(ic.regulation_low_limit as TEXT) AS regulation_low_limit,
                    CAST(ic.regulation_up_limit as TEXT) AS regulation_up_limit,
                    CAST(ic.input_low_limit as TEXT) AS input_low_limit,
                    CAST(ic.input_up_limit as TEXT) AS input_up_limit,
                    CAST(ic.report_low_limit as TEXT) AS report_low_limit,
                    CAST(ic.report_up_limit as TEXT) AS report_up_limit,
                    ic.valid_digits,
                    ic.input_min_digits,
                    ic.output_min_digits,
                    ic.saisui_kbn_no
                FROM
                    m_inspection_criteria ic
                LEFT JOIN
                    m_saisui_point sp on sp.point_no = :point_no
                WHERE
                    ic.item_no = :item_no
                    AND ic.hou_kijyun_no = :hou_kijyun_no
                    AND ic.saisui_kbn_no = sp.saisui_kbn_no
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
}
