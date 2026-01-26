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
 * 検査情報登録DAO
 *
 */
class Wqm010Dao
{
    /**
     * 検査情報の項目を取得
     * 
     * @return response 結果
     */
    public function fetchInputItems($request)
    {
        // DB::beginTransaction();
        try {
            $bindValue = array(
                'selected_menu_no' => $request->selected_menu_no
            );

            $SQL = <<<SQL
                    SELECT
                        m_input_menu.input_dsp_no
                        , m_input_dsp_item.item_no
                        , m_input_dsp_item.dsp_order as item_order
                        , m_inspection_item.item_dsp_name as item_name
                        , m_inspection_item.item_report_name as item_report_name
                        , m_inspection_item.constant_qualitative_flg
                        , m_inspection_item.input_type as input_type
                        , null as select_list
                    FROM
                        m_input_menu
                        INNER JOIN m_input_dsp_item
                            ON m_input_menu.input_dsp_no = m_input_dsp_item.input_dsp_no
                        INNER JOIN m_inspection_item
                            ON m_input_dsp_item.item_no = m_inspection_item.item_no
                    WHERE
                        m_input_menu.input_menu_no = :selected_menu_no
                    ORDER BY item_order ASC
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
     * 項目の選択肢を取得
     * 
     * @return response 結果
     */
    public function fetchInputItemsSelector($request)
    {
        try {
            $bindValue = array();

            $SQL = <<<SQL
                    SELECT
                        item_no
                        , selection_no
                        , selection_name
                    FROM
                        m_selection
                    ORDER BY
                        item_no
                        , sort_value
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
     * 検査情報の地点を取得
     * 
     * @return response 結果
     */
    public function fetchInputPoints($request)
    {
        // DB::beginTransaction();
        try {
            $bindValue = array(
                'selected_menu_no' => $request->selected_menu_no
            );

            $SQL = <<<SQL
                    SELECT
                        m_input_menu.input_dsp_no
                        , m_input_dsp_point.point_no
                        , m_input_dsp_point.dsp_order as point_order
                        , m_saisui_point.point_dsp_name as point_name
                        , m_saisui_point.saisui_kbn_no as point_kbn
                        , m_saisui_point.process_no
                    FROM
                        m_input_menu
                        INNER JOIN m_input_dsp_point
                            ON m_input_menu.input_dsp_no = m_input_dsp_point.input_dsp_no
                        INNER JOIN m_saisui_point
                            ON m_input_dsp_point.point_no = m_saisui_point.point_no
                    WHERE
                        m_input_menu.input_menu_no = :selected_menu_no
                    ORDER BY point_order ASC
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
     * 検査基準情報を取得
     * 
     * @return response 結果
     */
    public function fetchInspectCriteriaData($request, $item_filters, $point_filters)
    {
        // DB::beginTransaction();
        try {
            $hou_kijyun_year = \DateTime::createFromFormat('Y-m', $request->current_month)->modify('last day of this month')->format('Y');
            $hou_kijyun_month = \DateTime::createFromFormat('Y-m', $request->current_month)->modify('last day of this month')->format('n');

            // 202601 修正 ※ 2025/04/01 ~ 2026/03/31までの法基準年度は[2025]になる。
            if (intval($hou_kijyun_month) < 4) {
                $hou_kijyun_year = $hou_kijyun_year - 1;
            }

            $inspection_kbn_code = DB::table('m_input_menu')
                ->join('m_input_dsp_config', 'm_input_menu.input_dsp_no', '=', 'm_input_dsp_config.input_dsp_no')
                ->where('m_input_menu.input_menu_no', $request->selected_menu_no)
                ->select('m_input_dsp_config.inspection_kbn_code')
                ->first();

            $sub_m_statistics = DB::table('m_statistics')
                ->leftJoin('m_saisui_point', 'm_saisui_point.point_no', '=', 'm_statistics.point_no')
                ->where('m_statistics.inspection_kbn_code', $inspection_kbn_code->inspection_kbn_code)
                ->whereIn('m_statistics.item_no', $item_filters)
                ->whereIn('m_statistics.point_no', $point_filters)
                ->select('m_statistics.*', 'm_saisui_point.saisui_kbn_no');

            $sub_m_saisui_point = DB::table('m_saisui_point')
                ->whereIn('m_saisui_point.point_no', $point_filters)
                ->select('m_saisui_point.*');

            $result = DB::table('m_inspection_criteria')
                ->leftJoin('m_saisui_kbn', 'm_inspection_criteria.saisui_kbn_no', '=', 'm_saisui_kbn.saisui_kbn_no')
                ->leftJoin('m_inspection_item', 'm_inspection_criteria.item_no', '=', 'm_inspection_item.item_no')    // 検査項目
                ->leftJoinSub($sub_m_saisui_point, 'sub_m_saisui_point', function (JoinClause $join) {
                    $join->on('m_inspection_criteria.saisui_kbn_no', '=', 'sub_m_saisui_point.saisui_kbn_no');
                })
                ->leftJoinSub($sub_m_statistics, 'sub_m_statistics', function (JoinClause $join) {
                    $join->on('m_inspection_criteria.item_no', '=', 'sub_m_statistics.item_no');
                    $join->on('sub_m_saisui_point.point_no', '=', 'sub_m_statistics.point_no');
                })
                ->where('m_inspection_criteria.hou_kijyun_no', '=', $hou_kijyun_year)
                ->whereIn('m_inspection_criteria.item_no', $item_filters)
                ->select(
                    'm_saisui_kbn.saisui_kbn_name as criteria_saisui_kbn_name',
                    'm_inspection_criteria.regulation_up_limit',
                    'm_inspection_criteria.input_low_limit',
                    'm_inspection_criteria.report_low_limit',
                    'm_inspection_criteria.regulation_low_limit',
                    'm_inspection_criteria.input_up_limit',
                    'm_inspection_criteria.valid_digits',
                    'm_inspection_criteria.input_min_digits',
                    'm_inspection_criteria.output_min_digits',
                    'm_inspection_criteria.item_no',
                    'm_inspection_item.input_type',
                    'm_inspection_item.item_unit',
                    'm_inspection_item.item_dai_category_no',
                    'm_inspection_item.item_tyu_category_no',
                    'sub_m_saisui_point.point_no',
                    'sub_m_saisui_point.saisui_kbn_no',
                    'sub_m_saisui_point.process_no',
                    'sub_m_statistics.c_upper',
                    'sub_m_statistics.c_lower',
                    DB::raw($inspection_kbn_code->inspection_kbn_code . ' AS inspection_kbn_code'),
                )
                ->get();

            return $result;
        } catch (\Exception $e) {
            // DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return false;
        }

        // try {
        //     // 年度を取得
        //     $hou_kijyun_year = \DateTime::createFromFormat('Y-m', $request->current_month)
        //         ->modify('last day of this month')
        //         ->format('Y');

        //     $inspectionKbnBindValue = [
        //         'selected_menu_no' => $request->selected_menu_no,
        //     ];

        //     // 検査区分情報を取得
        //     $inspectionKbnSql = <<<SQL
        //                             SELECT 
        //                                 m_input_dsp_config.inspection_kbn_code
        //                             FROM 
        //                                 m_input_menu
        //                             INNER JOIN m_input_dsp_config 
        //                                 ON m_input_menu.input_dsp_no = m_input_dsp_config.input_dsp_no
        //                             WHERE 
        //                                 m_input_menu.input_menu_no = :selected_menu_no
        //     SQL;

        //     $inspection_kbn_code = DB::selectOne($inspectionKbnSql, $inspectionKbnBindValue);

        //     if (!$inspection_kbn_code) {
        //         return [];
        //     }

        //     $inspection_kbn = $inspection_kbn_code->inspection_kbn_code;

        //     // 入力データ取得バイディング
        //     $item_placeholders = [];
        //     $point_placeholders = [];
        //     $bindValues = [
        //         'hou_kijyun_no' => $hou_kijyun_year,
        //         'inspection_kbn' => $inspection_kbn,
        //     ];

        //     // IN句_項目
        //     foreach ($item_filters as $i => $v) {
        //         $key = "item_$i";
        //         $item_placeholders[] = ":$key";
        //         $bindValues[$key] = $v;
        //     }

        //     // IN句_地点
        //     foreach ($point_filters as $i => $v) {
        //         $key = "point_$i";
        //         $point_placeholders[] = ":$key";
        //         $bindValues[$key] = $v;
        //     }

        //     // IN句_配列作成
        //     $item_in_clause = implode(',', $item_placeholders);
        //     $point_in_clause = implode(',', $point_placeholders);

        //     /**
        //      * msk : m_saisui_kbn
        //      * mic : m_inspection_criteria
        //      * mii : m_inspection_item
        //      * mst : m_statistics
        //      * msp : m_saisui_point
        //      * 
        //      */
        //     $SQL = <<<SQL
        //             SELECT
        //                 msk.saisui_kbn_name AS criteria_saisui_kbn_name,
        //                 mic.regulation_up_limit,
        //                 mic.input_low_limit,
        //                 mic.report_low_limit,
        //                 mic.regulation_low_limit,
        //                 mic.input_up_limit,
        //                 mic.valid_digits,
        //                 mic.input_min_digits,
        //                 mic.output_min_digits,
        //                 mic.item_no,
        //                 mii.input_type,
        //                 mii.item_unit,
        //                 mii.item_dai_category_no,
        //                 mii.item_tyu_category_no,
        //                 msp.point_no,
        //                 msp.saisui_kbn_no,
        //                 msp.process_no,
        //                 mst.c_upper,
        //                 mst.c_lower,
        //                 :inspection_kbn AS inspection_kbn_code
        //             FROM
        //                 m_inspection_criteria mic
        //             LEFT JOIN
        //                 m_saisui_kbn msk ON mic.saisui_kbn_no = msk.saisui_kbn_no
        //             LEFT JOIN
        //                 m_inspection_item mii ON mic.item_no = mii.item_no
        //             LEFT JOIN
        //                 m_statistics mst ON mic.item_no = mst.item_no AND mst.inspection_kbn_code = :inspection_kbn
        //             LEFT JOIN
        //                 m_saisui_point msp ON mic.saisui_kbn_no = msp.saisui_kbn_no
        //             WHERE
        //                 mic.hou_kijyun_no = :hou_kijyun_no
        //                 AND mic.item_no IN ({{item_placeholders}})
        //                 AND mst.item_no IN ({{item_placeholders}})
        //                 AND mst.point_no IN ({{point_placeholders}})
        //                 AND msp.point_no IN ({{point_placeholders}})
        //     SQL;

        //     // バイディングに置き換え
        //     $SQL = str_replace('{{item_placeholders}}', $item_in_clause, $SQL);
        //     $SQL = str_replace('{{point_placeholders}}', $point_in_clause, $SQL);

        //     // 実施
        //     $result = DB::select($SQL, $bindValues);

        //     return $result;
        // } catch (\Exception $e) {
        //     // DB::rollback();
        //     Log::error($e->getMessage());
        //     Log::error($e->getTraceAsString());

        //     return false;
        // }
    }

    /**
     * 検査基準情報を取得
     * 
     * @return response 結果
     */
    public function fetchInspectCriteriaDataKbnCorrection($request, $item_filters, $point_filters)
    {
        // DB::beginTransaction();
        try {
            $hou_kijyun_year = \DateTime::createFromFormat('Y-m', $request->current_month)->modify('last day of this month')->format('Y');
            $hou_kijyun_month = \DateTime::createFromFormat('Y-m', $request->current_month)->modify('last day of this month')->format('n');

            // 202601 修正 ※ 2025/04/01 ~ 2026/03/31までの法基準年度は[2025]になる。
            if (intval($hou_kijyun_month) < 4) {
                $hou_kijyun_year = $hou_kijyun_year - 1;
            }

            $inspection_kbn_code = DB::table('m_input_menu')
                ->join('m_input_dsp_config', 'm_input_menu.input_dsp_no', '=', 'm_input_dsp_config.input_dsp_no')
                ->where('m_input_menu.input_menu_no', $request->selected_menu_no)
                ->select('m_input_dsp_config.inspection_kbn_code', 'm_input_menu.input_dsp_no')
                ->first();

            $sub_m_statistics = DB::table('m_statistics')
                ->leftJoin('m_saisui_point', 'm_saisui_point.point_no', '=', 'm_statistics.point_no')
                ->where('m_statistics.inspection_kbn_code', $inspection_kbn_code->inspection_kbn_code)
                ->whereIn('m_statistics.item_no', $item_filters)
                ->whereIn('m_statistics.point_no', $point_filters)
                ->select('m_statistics.*', 'm_saisui_point.saisui_kbn_no');

            $sub_m_saisui_point = DB::table('t_saisui_kbn_correction')
                ->where('t_saisui_kbn_correction.input_dsp_no', '=', $inspection_kbn_code->input_dsp_no)
                ->whereIn('t_saisui_kbn_correction.point_no', $point_filters)
                ->select('t_saisui_kbn_correction.*');

            $result = DB::table('m_inspection_criteria')
                ->leftJoin('m_saisui_kbn', 'm_inspection_criteria.saisui_kbn_no', '=', 'm_saisui_kbn.saisui_kbn_no')
                ->leftJoin('m_inspection_item', 'm_inspection_criteria.item_no', '=', 'm_inspection_item.item_no')    // 検査項目
                ->leftJoinSub($sub_m_statistics, 'sub_m_statistics', function (JoinClause $join) {
                    $join->on('m_inspection_criteria.item_no', '=', 'sub_m_statistics.item_no');
                })
                ->leftJoinSub($sub_m_saisui_point, 'sub_m_saisui_point', function (JoinClause $join) {
                    $join->on('m_inspection_criteria.saisui_kbn_no', '=', 'sub_m_saisui_point.saisui_kbn_no');
                })
                ->where('m_inspection_criteria.hou_kijyun_no', '=', $hou_kijyun_year)
                ->whereIn('m_inspection_criteria.item_no', $item_filters)
                ->select(
                    'm_saisui_kbn.saisui_kbn_name as criteria_saisui_kbn_name',
                    'm_inspection_criteria.regulation_up_limit',
                    'm_inspection_criteria.input_low_limit',
                    'm_inspection_criteria.report_low_limit',
                    'm_inspection_criteria.regulation_low_limit',
                    'm_inspection_criteria.input_up_limit',
                    'm_inspection_criteria.valid_digits',
                    'm_inspection_criteria.input_min_digits',
                    'm_inspection_criteria.output_min_digits',
                    'm_inspection_criteria.item_no',
                    'm_inspection_item.input_type',
                    'm_inspection_item.item_unit',
                    'm_inspection_item.item_dai_category_no',
                    'm_inspection_item.item_tyu_category_no',
                    'sub_m_saisui_point.point_no',
                    'sub_m_saisui_point.saisui_kbn_no',
                    DB::raw('NULL as process_no'),
                    'sub_m_statistics.c_upper',
                    'sub_m_statistics.c_lower',
                    DB::raw($inspection_kbn_code->input_dsp_no . ' AS input_dsp_no'),
                    DB::raw($inspection_kbn_code->inspection_kbn_code . ' AS inspection_kbn_code'),
                )
                ->get();

            return $result;
        } catch (\Exception $e) {
            // DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return false;
        }
    }

    /**
     * 検査情報の入力データを取得
     * 
     * @return response 結果
     */
    public function fetchInputData($request, $item_filters, $point_filters)
    {
        // DB::beginTransaction();
        try {
            $hou_kijyun_year = \DateTime::createFromFormat('Y-m', $request->current_month)->modify('last day of this month')->format('Y');
            $hou_kijyun_month = \DateTime::createFromFormat('Y-m', $request->current_month)->modify('last day of this month')->format('n');

            // 202601 修正 ※ 2025/04/01 ~ 2026/03/31までの法基準年度は[2025]になる。
            if (intval($hou_kijyun_month) < 4) {
                $hou_kijyun_year = $hou_kijyun_year - 1;
            }

            $item_filters_sql = implode(',', array_map('intval', $item_filters));
            $point_filters_sql = implode(',', array_map('intval', $point_filters));

            $bindValue = array(
                'selected_menu_no'  =>  $request->selected_menu_no,
                'selected_date'     =>  $request->selected_date,
                'hou_kijyun_year'   =>  $hou_kijyun_year,
            );

            $SQL = <<<SQL
                SELECT
                    t_inspection_result.constant_qualitative_flg,
                    t_inspection_result.constant_data,
                    t_inspection_result.qualitative_data,
                    sub_m_saisui_point.saisui_kbn_no,
                    sub_m_saisui_point.saisui_kbn_name,
                    sub_m_saisui_point.process_no,
                    sub_m_inspection_criteria.saisui_kbn_name AS criteria_saisui_kbn_name,
                    sub_m_inspection_criteria.regulation_up_limit,
                    sub_m_inspection_criteria.input_low_limit,
                    sub_m_inspection_criteria.report_low_limit,
                    m_statistics.c_upper,
                    m_statistics.c_lower,
                    t_inspection_result.saisui_date,
                    t_inspection_result.saisui_time,
                    t_inspection_result.point_no,
                    t_inspection_result.item_no,
                    t_inspection_result.inspection_kbn_code,
                    m_inspection_item.input_type,
                    m_inspection_item.item_unit,
                    m_inspection_item.item_dai_category_no,
                    m_inspection_item.item_tyu_category_no,
                    sub_m_inspection_criteria.regulation_low_limit,
                    sub_m_inspection_criteria.input_up_limit,
                    sub_m_inspection_criteria.valid_digits,
                    sub_m_inspection_criteria.input_min_digits,
                    sub_m_inspection_criteria.output_min_digits
                FROM t_inspection_result
                LEFT JOIN m_inspection_item
                    ON t_inspection_result.item_no = m_inspection_item.item_no
                LEFT JOIN (
                    -- sub_m_saisui_point のサブクエリ
                    SELECT
                        m_saisui_point.point_no,
                        m_saisui_point.saisui_kbn_no,
                        m_saisui_point.process_no,
                        m_saisui_kbn.saisui_kbn_name
                    FROM m_saisui_point
                    INNER JOIN m_saisui_kbn
                        ON m_saisui_point.saisui_kbn_no = m_saisui_kbn.saisui_kbn_no
                ) AS sub_m_saisui_point
                    ON t_inspection_result.point_no = sub_m_saisui_point.point_no
                LEFT JOIN (
                    -- sub_m_inspection_criteria のサブクエリ
                    SELECT
                        m_inspection_criteria.*,
                        m_saisui_kbn.saisui_kbn_name,
                        m_saisui_kbn.saisui_kbn_no AS saisui_kbn_no_criteria
                    FROM m_inspection_criteria
                    INNER JOIN m_saisui_kbn
                        ON m_inspection_criteria.saisui_kbn_no = m_saisui_kbn.saisui_kbn_no
                    WHERE
                        m_inspection_criteria.hou_kijyun_no = :hou_kijyun_year
                ) AS sub_m_inspection_criteria
                    ON t_inspection_result.item_no = sub_m_inspection_criteria.item_no
                AND sub_m_inspection_criteria.saisui_kbn_no_criteria = sub_m_saisui_point.saisui_kbn_no
                LEFT JOIN m_statistics
                    ON t_inspection_result.point_no = m_statistics.point_no
                    AND t_inspection_result.item_no = m_statistics.item_no
                    AND t_inspection_result.inspection_kbn_code = m_statistics.inspection_kbn_code
                WHERE
                    t_inspection_result.inspection_kbn_code = ( 
                        select
                            case 
                                when exists ( 
                                    -- 紐づけマスタに設定した検査区分の画面で、既に登録されているか否か
                                    select
                                        1 
                                    from
                                        t_inspection_result as ir2 
                                    where
                                        -- 項目・地点・採水日・採水時刻が同一で検査区分が異なるレコードがあるか
                                        t_inspection_result.item_no = ir2.item_no 
                                        and t_inspection_result.point_no = ir2.point_no 
                                        and t_inspection_result.saisui_date = ir2.saisui_date 
                                        and t_inspection_result.saisui_time = ir2.saisui_time 
                                        and ir2.inspection_kbn_code = ( 
                                            select
                                                mc.inspection_kbn_code 
                                            from
                                                m_connect as mc 
                                            where
                                                exists ( 
                                                    select
                                                        1 
                                                    from
                                                        m_input_menu as im 
                                                    where
                                                        mc.input_dsp_no = im.input_dsp_no 
                                                        and im.input_menu_no = :selected_menu_no
                                                ) 
                                                and mc.item_no = t_inspection_result.item_no 
                                                and mc.point_no = t_inspection_result.point_no
                                        )
                                ) 
                                    then ( 
                                    -- 紐づけマスタの検査区分
                                    select
                                        mc.inspection_kbn_code 
                                    from
                                        m_connect as mc 
                                    where
                                        exists ( 
                                            select
                                                1 
                                            from
                                                m_input_menu as im 
                                            where
                                                mc.input_dsp_no = im.input_dsp_no 
                                                and im.input_menu_no = :selected_menu_no
                                        ) 
                                        and mc.item_no = t_inspection_result.item_no 
                                        and mc.point_no = t_inspection_result.point_no
                                ) 
                                else ( 
                                    -- 入力画面構成マスタの検査区分
                                    select
                                        idc.inspection_kbn_code 
                                    from
                                        m_input_dsp_config as idc 
                                    where
                                        exists ( 
                                            select
                                                1 
                                            from
                                                m_input_menu as im 
                                            where
                                                idc.input_dsp_no = im.input_dsp_no 
                                                and im.input_menu_no = :selected_menu_no
                                        )
                                ) 
                                end as inspection_kbn_code
                    ) 
                    AND t_inspection_result.saisui_date = :selected_date
                    AND t_inspection_result.item_no IN ($item_filters_sql)
                AND t_inspection_result.point_no IN ($point_filters_sql)
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
     * 入力データがある日付を取得
     * 
     * @return response 結果
     */
    public function fetchInputDataExistDate($request, $item_filters, $point_filters)
    {
        // DB::beginTransaction();
        // try {
        //     $range_start_date = $request->current_month . '-01';    // 開始日

        //     $date = \DateTime::createFromFormat('Y-m', $request->current_month)->modify('last day of this month');
        //     $range_end_date = $date->format('Y-m-d');      // 終了日

        //     $inspection_kbn_code = DB::table('m_input_menu')
        //         ->join('m_input_dsp_config', 'm_input_menu.input_dsp_no', '=', 'm_input_dsp_config.input_dsp_no')
        //         ->where('m_input_menu.input_menu_no', $request->selected_menu_no)
        //         ->select('m_input_dsp_config.inspection_kbn_code')
        //         ->first();

        //     $result = DB::table('t_inspection_result')
        //         ->where('inspection_kbn_code', $inspection_kbn_code->inspection_kbn_code)
        //         ->where('saisui_date', '>=', $range_start_date)
        //         ->where('saisui_date', '<=', $range_end_date)
        //         ->whereIn('item_no', $item_filters)
        //         ->whereIn('point_no', $point_filters)
        //         ->groupBy('saisui_date')
        //         ->select('saisui_date')
        //         ->get();

        //     return $result;
        // } catch (\Exception $e) {
        //     // DB::rollback();
        //     Log::error($e->getMessage());
        //     Log::error($e->getTraceAsString());

        //     return false;
        // }


        try {
            $range_start_date = $request->current_month . '-01';    // 開始日
            $date = \DateTime::createFromFormat('Y-m', $request->current_month)->modify('last day of this month');
            $range_end_date = $date->format('Y-m-d');      // 終了日

            // 検査区分コードを取得
            $inspectionKbnBindValue = [
                'selected_menu_no' => $request->selected_menu_no,
            ];

            $inspectionKbnSql = <<<SQL
                                    SELECT
                                        m_input_dsp_config.inspection_kbn_code
                                    FROM
                                        m_input_menu
                                    INNER JOIN
                                        m_input_dsp_config ON m_input_menu.input_dsp_no = m_input_dsp_config.input_dsp_no
                                    WHERE
                                        m_input_menu.input_menu_no = :selected_menu_no
            SQL;

            $inspection_kbn_code = DB::selectOne($inspectionKbnSql, $inspectionKbnBindValue);

            if (!$inspection_kbn_code) {
                return [];
            }

            $item_placeholders = [];
            $point_placeholders = [];
            $bindValues = [
                'inspection_kbn_code' => $inspection_kbn_code->inspection_kbn_code,
                'range_start_date'    => $range_start_date,
                'range_end_date'      => $range_end_date,
            ];

            // IN句_項目配列
            foreach ($item_filters as $i => $v) {
                $key = "item_$i";
                $item_placeholders[] = ":$key";
                $bindValues[$key] = $v;
            }

            // IN句_地点配列
            foreach ($point_filters as $i => $v) {
                $key = "point_$i";
                $point_placeholders[] = ":$key";
                $bindValues[$key] = $v;
            }

            // 入力データがある日付
            $resultSql = <<<SQL
                            SELECT
                                saisui_date
                            FROM
                                t_inspection_result
                            WHERE
                                inspection_kbn_code = :inspection_kbn_code
                                AND saisui_date >= :range_start_date
                                AND saisui_date <= :range_end_date
                                AND item_no IN ({{item_placeholders}})
                                AND point_no IN ({{point_placeholders}})
                            GROUP BY
                                saisui_date
                            ORDER BY
                                saisui_date ASC
            SQL;

            // バイディングに置き換え
            $resultSql = str_replace('{{item_placeholders}}', implode(',', $item_placeholders), $resultSql);
            $resultSql = str_replace('{{point_placeholders}}', implode(',', $point_placeholders), $resultSql);

            // 実施
            $result = DB::select($resultSql, $bindValues);

            return $result;
        } catch (\Exception $e) {
            // DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return false;
        }
    }

    /**
     * 入力データがある日付を取得（全件）
     * 
     * @return response 結果
     */
    public function fetchAllInputDataExistDate($request, $item_filters, $point_filters)
    {
        // DB::beginTransaction();
        // try {
        //     $inspection_kbn_code = DB::table('m_input_menu')
        //         ->join('m_input_dsp_config', 'm_input_menu.input_dsp_no', '=', 'm_input_dsp_config.input_dsp_no')
        //         ->where('m_input_menu.input_menu_no', $request->selected_menu_no)
        //         ->select('m_input_dsp_config.inspection_kbn_code')
        //         ->first();

        //     $result = DB::table('t_inspection_result')
        //         ->where('inspection_kbn_code', $inspection_kbn_code->inspection_kbn_code)
        //         ->whereIn('item_no', $item_filters)
        //         ->whereIn('point_no', $point_filters)
        //         ->groupBy('saisui_date')
        //         ->select('saisui_date')
        //         ->get();

        //     return $result;
        // } catch (\Exception $e) {
        //     // DB::rollback();
        //     Log::error($e->getMessage());
        //     Log::error($e->getTraceAsString());

        //     return false;
        // }


        try {
            // 検査区分コードを取得
            $inspectionKbnBindValue = [
                'selected_menu_no' => $request->selected_menu_no,
            ];

            $inspectionKbnSql = <<<SQL
                                    SELECT
                                        m_input_dsp_config.inspection_kbn_code
                                    FROM
                                        m_input_menu
                                    INNER JOIN
                                        m_input_dsp_config ON m_input_menu.input_dsp_no = m_input_dsp_config.input_dsp_no
                                    WHERE
                                        m_input_menu.input_menu_no = :selected_menu_no
            SQL;

            $inspection_kbn_code = DB::selectOne($inspectionKbnSql, $inspectionKbnBindValue);

            if (!$inspection_kbn_code) {
                return [];
            }


            $item_placeholders = [];
            $point_placeholders = [];
            $bindValues = [
                'inspection_kbn_code' => $inspection_kbn_code->inspection_kbn_code,
            ];

            // IN句_項目配列
            foreach ($item_filters as $i => $v) {
                $key = "item_$i";
                $item_placeholders[] = ":$key";
                $bindValues[$key] = $v;
            }

            // IN句_地点配列
            foreach ($point_filters as $i => $v) {
                $key = "point_$i";
                $point_placeholders[] = ":$key";
                $bindValues[$key] = $v;
            }

            // 入力データがある日付を取得
            $resultSql = <<<SQL
                            SELECT
                                saisui_date
                            FROM
                                t_inspection_result
                            WHERE
                                inspection_kbn_code = :inspection_kbn_code
                                AND item_no IN ({{item_placeholders}})
                                AND point_no IN ({{point_placeholders}})
                            GROUP BY
                                saisui_date
                            ORDER BY
                                saisui_date ASC
            SQL;

            // バイディングに置き換え
            $resultSql = str_replace('{{item_placeholders}}', implode(',', $item_placeholders), $resultSql);
            $resultSql = str_replace('{{point_placeholders}}', implode(',', $point_placeholders), $resultSql);

            // 実施
            $result = DB::select($resultSql, $bindValues);

            return $result;
        } catch (\Exception $e) {
            // 
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return false;
        }
    }

    /**
     * 基準値補正マスタ取得
     * 
     * @return response 結果
     */
    public function fetchCriteriaCorrection($request, $item_filters, $point_filters)
    {
        try {
            $menuInfoBindValue = array(
                'selected_menu_no'  => $request->selected_menu_no,
            );

            $menuInfoSql = <<<SQL
                        SELECT
                            input_dsp_no
                        FROM
                            m_input_menu
                        WHERE
                            input_menu_no = :selected_menu_no
            SQL;

            $menuInfo = DB::selectOne($menuInfoSql, $menuInfoBindValue);

            if (!$menuInfo) {
                return [];
            }

            // IN句プレースホルダ生成
            $item_placeholders = [];
            $point_placeholders = [];

            $criCorBindValue = [];

            foreach ($item_filters as $i => $v) {
                $key = "item_$i";
                $item_placeholders[] = ":$key";
                $criCorBindValue[$key] = $v;
            }

            // foreach ($point_filters as $i => $v) {
            //     $key = "point_$i";
            //     $point_placeholders[] = ":$key";
            //     $criCorBindValue[$key] = $v;
            // }

            // SQLを構築（すべて named parameters）
            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        t_criteria_correction
                    WHERE
                        item_no IN ({{item_placeholders}})
                        -- AND point_no IN ({{point_placeholders}})
            SQL;

            // バイディングに置き換え
            $SQL = str_replace('{{item_placeholders}}', implode(',', $item_placeholders), $SQL);
            $SQL = str_replace('{{point_placeholders}}', implode(',', $point_placeholders), $SQL);

            // 実行
            $result = DB::select($SQL, $criCorBindValue);

            return $result;
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }



    /**
     * 検査情報の入力マスクデータを取得
     * 
     * @return response 結果
     */
    public function fetchInputMask($request, $item_filters, $point_filters)
    {
        // DB::beginTransaction();
        try {
            // 画面メニュー情報を取得
            $menuBindValue = [
                'selected_menu_no' => $request->selected_menu_no,
            ];

            $menuSql = <<<SQL
                        SELECT
                            input_dsp_no
                        FROM
                            m_input_menu
                        WHERE
                            input_menu_no = :selected_menu_no
            SQL;

            $m_input_menu = DB::selectOne($menuSql, $menuBindValue);

            if (!$m_input_menu) {
                return [];
            }

            $input_dsp_no = $m_input_menu->input_dsp_no;

            // バイディング設定
            $maskBindValue = [
                'input_dsp_no' => $input_dsp_no,
            ];

            $maskSql = <<<SQL
                        SELECT
                            input_dsp_no,
                            point_no,
                            item_no
                        FROM
                            m_input_n_mask
                        WHERE
                            input_dsp_no = :input_dsp_no
            SQL;

            // 実施
            $result = DB::select($maskSql, $maskBindValue);

            return $result;
        } catch (\Exception $e) {
            // DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return false;
        }
    }

    /**
     * 入力データ確定情報を取得
     * 
     * @return response 結果
     */
    public function getInputFixedDate($request)
    {
        try {
            $bindValue = array(
                'selected_menu_no'  => $request->selected_menu_no,
                'selected_date'     => $request->selected_date,
            );

            $SQL = <<<SQL
                    SELECT
                        t_input_fixed_date.input_dsp_no
                        , t_input_fixed_date.saisui_date
                        , t_input_fixed_date.input_fixed_date
                    FROM
                        m_input_menu
                        INNER JOIN t_input_fixed_date
                            ON m_input_menu.input_dsp_no = t_input_fixed_date.input_dsp_no
                    WHERE
                        m_input_menu.input_menu_no = :selected_menu_no
                        AND t_input_fixed_date.saisui_date = :selected_date
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
     * 確定ボタン表示フラグを取得
     * 
     * @return response 結果
     */
    public function getInputFixedFlg($request)
    {
        try {
            $bindValue = array(
                'selected_menu_no'  => $request->selected_menu_no,
            );

            $SQL = <<<SQL
                    SELECT
                        m_input_dsp_config.conf_btn_flg
                    FROM
                        m_input_menu
                        INNER JOIN m_input_dsp_config
                            ON m_input_menu.input_dsp_no = m_input_dsp_config.input_dsp_no
                    WHERE
                        m_input_menu.input_menu_no = :selected_menu_no
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
     * 入力データ確定日を取得
     * 
     * @return response 結果
     */
    public function fetchInputFixedDate($request)
    {
        try {
            $bindValue = array(
                'input_dsp_no'      => $request->input_dsp_no,
                'saisui_date'       => $request->saisui_date
            );

            $SQL = <<<SQL
                    SELECT
                        input_dsp_no
                        , saisui_date
                        , input_fixed_date
                    FROM
                        t_input_fixed_date
                    WHERE
                        input_dsp_no = :input_dsp_no
                        AND saisui_date = :saisui_date
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
     * 入力データ確定日を確認
     * 
     * @return response 結果
     */
    public function checkInputFixedDateBefore($request)
    {
        try {
            $bindValue = array(
                'input_dsp_no'      => $request->input_dsp_no,
                'saisui_date'       => $request->saisui_date,
                'display_time'      => $request->display_time,
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        t_input_fixed_date      
                    WHERE
                        input_dsp_no = :input_dsp_no
                        AND saisui_date = :saisui_date
                        AND update_date >= cast(:display_time as timestamp)
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
    public function checkInputDataBefore($point_no, $item_no, $saisui_date, $inspection_kbn_code)
    {
        // DB::beginTransaction();
        try {
            $bindValue = array(
                'point_no' => $point_no,
                'item_no' => $item_no,
                'saisui_date' => $saisui_date,
                'inspection_kbn_code' => $inspection_kbn_code
            );

            $SQL = <<<SQL
                    SELECT
                        point_no                            -- 地点番号
                        , item_no                           -- 項目番号
                        , saisui_date                       -- 採水年月日
                        , saisui_time                       -- 採水時刻
                        , inspection_kbn_code               -- 検索区分CD
                        , CASE WHEN constant_qualitative_flg = 1 THEN constant_data::text
                                ELSE qualitative_data
                          END AS input_data
                        , to_char(update_date, 'YYYY-MM-DD HH24:MI:SS.MS') AS update_date
                        
                    FROM
                        t_inspection_result
                    WHERE
                        point_no = :point_no
                        AND item_no = :item_no
                        AND saisui_date = :saisui_date
                        AND inspection_kbn_code = :inspection_kbn_code
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            Log::info((array) $result);
            if ($result && $result[0]) {
                return $result;
            } else {
                return array();
            }
        } catch (\Exception $e) {
            // DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return false;
        }
    }

    /**
     * 検査情報を新規登録
     *
     * 
     * @return response 処理結果
     */
    public function saveNewInputData($point_no, $item_no, $saisui_date, $saisui_time, $inspection_kbn_code, $constant_qualitative_flg, $constant_data, $qualitative_data)
    {
        try {
            Log::info($constant_data);
            $bindValue = array(
                'point_no'                          => $point_no,                                   // 地点番号
                'item_no'                           => $item_no,                                    // 項目番号
                'saisui_date'                       => $saisui_date,                                // 採水年月日
                'saisui_time'                       => $saisui_time,                                // 採水時間
                'inspection_kbn_code'               => $inspection_kbn_code,                        // 検査区分CD
                'constant_qualitative_flg'          => $constant_qualitative_flg,                   // 定量定性識別フラグ
                'constant_data'                     => $constant_data,                              // 定量データ
                'qualitative_data'                  => $qualitative_data,                           // 定性データ
                'proc_user_id'                      => intval(auth('sanctum')->user()->user_id)     // 実施ユーザーID
            );

            $SQL = <<<SQL
                INSERT INTO t_inspection_result (
                    point_no
                    , item_no
                    , saisui_date
                    , saisui_time
                    , inspection_kbn_code
                    , constant_qualitative_flg
                    , constant_data
                    , qualitative_data
                    , insert_date
                    , insert_user
                    , update_date
                    , update_user)
                VALUES(
                    :point_no
                    , :item_no
                    , :saisui_date
                    , :saisui_time
                    , :inspection_kbn_code
                    , :constant_qualitative_flg
                    , :constant_data
                    , :qualitative_data
                    , CURRENT_TIMESTAMP
                    , :proc_user_id
                    , CURRENT_TIMESTAMP
                    , :proc_user_id
                )
            SQL;

            DB::connection('suishitsu_db')->insert($SQL, $bindValue);
            return true;
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }

    /**
     * 検査情報を更新
     *
     * 
     * @return response 処理結果
     */
    public function updateInputData($point_no, $item_no, $saisui_date, $saisui_time, $inspection_kbn_code, $constant_qualitative_flg, $input_data)
    {
        try {
            $bindValue = array(
                'point_no'                          => $point_no,                                   // 地点番号
                'item_no'                           => $item_no,                                    // 項目番号
                'saisui_date'                       => $saisui_date,                                // 採水年月日
                'inspection_kbn_code'               => $inspection_kbn_code,                        // 検査区分CD
                'proc_user_id'                      => intval(auth('sanctum')->user()->user_id)     // 実施ユーザーID
            );

            $set_saisui_time = '';
            $set_input_date = '';

            // 採水時刻あり
            if ($saisui_time) {
                $bindValue['saisui_time'] = $saisui_time;
                $set_saisui_time = <<<SQL
                                        , saisui_time = :saisui_time
                SQL;
            }

            // データあり
            if (isset($input_data)) {
                $bindValue['input_data'] = $input_data;

                // 定量定性識別フラグを判定
                if ($constant_qualitative_flg == 1) {
                    $set_input_date = <<<SQL
                                        , constant_data = :input_data
                    SQL;
                } else {
                    $set_input_date = <<<SQL
                                        , qualitative_data = :input_data
                    SQL;
                }
            }

            $SQL = <<<SQL
                    UPDATE t_inspection_result SET 
                      update_date = CURRENT_TIMESTAMP
                      , update_user = :proc_user_id
                      $set_saisui_time
                      $set_input_date
                    WHERE 
                      saisui_date = :saisui_date
                      AND point_no = :point_no
                      AND item_no = :item_no
                      AND inspection_kbn_code = :inspection_kbn_code
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
     * 検査情報を削除
     *
     * 
     * @return response 処理結果
     */
    public function deleteInputData($point_no, $item_no, $saisui_date, $inspection_kbn_code)
    {
        try {
            $DeleteBindValue = array(
                'point_no'                          => $point_no,                           // 地点番号
                'item_no'                           => $item_no,                            // 項目番号
                'saisui_date'                       => $saisui_date,                        // 採水年月日
                'inspection_kbn_code'               => $inspection_kbn_code,                // 検査区分CD
            );

            // 登録データの削除
            $DelSQL = <<<SQL
              DELETE FROM t_inspection_result
              WHERE
                  point_no = :point_no
                  AND item_no = :item_no
                  AND saisui_date = :saisui_date
                  AND inspection_kbn_code = :inspection_kbn_code
            SQL;

            // 検査情報データ 削除
            DB::connection('suishitsu_db')->delete($DelSQL, $DeleteBindValue);
            return true;
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }

    /**
     * 入力データ確定日を新規登録
     *
     * 
     * @return response 処理結果
     */
    public function saveNewInputFixedDate($request)
    {
        try {
            $bindValue = array(
                'input_dsp_no'      => $request->input_dsp_no,                      // 入力画面番号
                'saisui_date'       => $request->saisui_date,                       // 採水年月日
                'proc_user_id'      => intval(auth('sanctum')->user()->user_id)     // 実施ユーザーID
            );

            $SQL = <<<SQL
                INSERT INTO t_input_fixed_date (
                    input_dsp_no
                    , saisui_date
                    , input_fixed_date
                    , insert_date
                    , insert_user
                    , update_date
                    , update_user)
                VALUES(
                    :input_dsp_no
                    , :saisui_date
                    , CURRENT_TIMESTAMP
                    , CURRENT_TIMESTAMP
                    , :proc_user_id
                    , CURRENT_TIMESTAMP
                    , :proc_user_id
                )
            SQL;

            DB::connection('suishitsu_db')->insert($SQL, $bindValue);
            return true;
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }

    /**
     * 入力データ確定日を削除
     *
     * 
     * @return response 処理結果
     */
    public function deleteInputFixedDate($request)
    {
        try {
            $DeleteBindValue = array(
                'input_dsp_no'      => $request->input_dsp_no,          // 入力画面番号
                'saisui_date'       => $request->saisui_date,           // 採水年月日
            );

            // 登録データの削除
            $DelSQL = <<<SQL
              DELETE FROM t_input_fixed_date
              WHERE
                  input_dsp_no = :input_dsp_no
                  AND saisui_date = :saisui_date
            SQL;

            // 入力データ確定日 削除
            DB::connection('suishitsu_db')->delete($DelSQL, $DeleteBindValue);
            return true;
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }



    /**
     * トレンド画面 検索処理
     * 
     * @return result 結果
     */
    public function getTrendData($request)
    {

        // 初期化
        $where = "";
        $bindValue = array();

        if (isset($request->date_to)) {
            // 10年前~カレンダーの日付
            $bindValue['date_from'] = \DateTime::createFromFormat('Y/m/d', $request->date_to)->modify('-10 years')->format('Y/m/d');;
            $bindValue['date_to'] = $request->date_to;
        }

        if (isset($bindValue['date_to']) && isset($bindValue['date_from'])) {
            $where .= " AND saisui_date BETWEEN :date_from AND :date_to ";
        } else {
            return false;
        }

        if (isset($request->item_no)) {
            $bindValue['item_no'] = $request->item_no;
            $where .= " AND i_result.item_no = :item_no ";
        }

        if (isset($request->point_no)) {
            $where .= " AND i_result.point_no IN ( ";
            $points = '';
            foreach ($request->point_no as $index => $value) {
                $bindValue['point' . (string)$index] = $value;
                $points .= ':point' . (string)$index . ',';
            }
            $points = substr($points, 0, -1);
            $where .= $points . " ) ";
        }

        try {
            // 直近の100件までを取得(最大でも10年前まで)
            $SQL = <<<SQL
                SELECT
                    *
                FROM
                    (
                        SELECT
                            TO_CHAR(saisui_date, 'YYYY/MM/DD') AS date
                            , constant_data AS value
                            , point.point_dsp_name AS point_name
                        FROM
                            t_inspection_result AS i_result
                            LEFT JOIN
                                m_saisui_point AS point
                            ON
                                i_result.point_no = point.point_no
                        WHERE
                            1 = 1
                            $where
                        ORDER BY
                            saisui_date desc
                            , i_result.item_no
                            , i_result.point_no
                        LIMIT 100
                    )
                ORDER BY
                    date asc
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);
            if (count($result) == 0) {
                return false;
            }

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }
    }

    /**
     * 検査区分取得
     */
    public function getKbnCd($request)
    {
        // 初期化
        $bindValue = array();

        if (isset($request->selected_menu_no)) {
            $bindValue['menu_no'] = $request->selected_menu_no;
        } else {
            return false;
        }
        try {
            $SQL = <<<SQL
                select
                    i_config.inspection_kbn_code
                from
                    m_input_dsp_config as i_config
                    left join
                        m_input_menu as menu
                        on
                            i_config.input_dsp_no = menu.input_dsp_no
                where
                    menu.input_menu_no = :menu_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);
            if (count($result) == 0) {
                return false;
            }

            return $result[0]->inspection_kbn_code;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }
    }

    /**
     * 登録済みデータ取得
     */
    public function getRegisteredData($point_no, $date, $time, $kbn_cd)
    {
        // 初期化
        $bindValue = array(
            'point_no'  =>  $point_no,
            'date'      =>  $date,
            // 'time'      =>  $time,
            'kbn_cd'    =>  $kbn_cd
        );
        try {
            $SQL = <<<SQL
                select
                    item_no
                    , constant_qualitative_flg as flg
                    , constant_data as c_data
                    , qualitative_data as q_data
                from
                    t_inspection_result as ir
                where
                    point_no = :point_no
                    and
                        saisui_date = cast(:date as timestamp)
                    -- and
                    --     saisui_time = :time
                    and
                        inspection_kbn_code = :kbn_cd
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return array();
        }
    }

    /**
     * テンプレートファイル出力後に項目が更新されていないか
     */
    public function fileImportHaitaCheck($menu, $date)
    {

        // 初期化
        $bindValue = array(
            'menu'      =>  $menu,
            'date'      =>  $date,
        );
        try {
            // テンプレートファイル作成時より後に更新した項目が有るか
            $SQL = <<<SQL
                select
                    exists ( 
                        select
                            1 
                        from
                            m_input_menu as menu 
                            left join m_input_dsp_item as dsp_item 
                                on menu.input_dsp_no = dsp_item.input_dsp_no 
                            left join m_inspection_item as item 
                                on item.item_no = dsp_item.item_no 
                        where
                            menu.input_menu_no = :menu 
                            and item.update_date > cast(:date as timestamp)
                    ) as update_check
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);
            // 何も取れなければ異常
            if (count($result) == 0) {
                return true;
            }

            return $result[0]->update_check;
        } catch (\Exception $e) {
            Log::error($e);

            return true;
        }
    }

    /**
     * 補正値データ取得
     */
    public function getCriteriaCorrection($selected_menu_no, $saisui_date, $point_no)
    {
        if(isset($saisui_date)){
            // 4月始まりの年度を取得
            $nendo = date("Y", strtotime("$saisui_date -3 month"));
        }

        // 初期化
        $bindValue = array(
            'nendo'         =>  $nendo,
            'menu_no'  =>  $selected_menu_no,
            'point_no'      =>  $point_no,
        );
        try {
            $SQL = <<<SQL
                select
                    cc.item_no
                    , cc.valid_digits
                    , cc.input_min_digits
                    , cc.output_min_digits
                from
                    t_criteria_correction as cc
                where
                    cc.report_no is null
                and
                    (cc.inspection_kbn_code is null or cc.inspection_kbn_code in (select inspection_kbn_code from m_input_dsp_config as idc inner join m_input_menu as im on idc.input_dsp_no = im.input_dsp_no where im.input_menu_no = :menu_no))
                and
                    (cc.input_dsp_no is null or exists(select 1 from m_input_menu as im where im.input_menu_no = :menu_no and im.input_dsp_no = cc.input_dsp_no))
                and 
                    (cc.saisui_kbn_no is null or exists(select 1 from m_saisui_point as sp where sp.point_no = :point_no and cc.saisui_kbn_no = sp.saisui_kbn_no))
                and
                    (cc.point_no is null or cc.point_no = :point_no)
                and
                    (cc.hou_kijyun_no is null or cc.hou_kijyun_no = :nendo)
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }
    }

    /**
     * 基準値データ取得
     */
    public function getCriteriaData($selected_menu_no, $saisui_date, $point_no)
    {
        if(isset($saisui_date)){
            // 4月始まりの年度を取得
            $nendo = date("Y", strtotime("$saisui_date -3 month"));
        }

        // 初期化
        $bindValue = array(
            'nendo'         =>  $nendo,
            'menu_no'  =>  $selected_menu_no,
            'point_no'      =>  $point_no,
        );
        try {
            $SQL = <<<SQL
                select
                    ic.item_no
                    , ic.hou_kijyun_no
                    , ic.saisui_kbn_no
                    , ic.regulation_low_limit
                    , ic.regulation_up_limit
                    , ic.input_low_limit
                    , ic.input_up_limit
                    , ic.report_low_limit
                    , ic.report_up_limit
                    , ic.valid_digits
                    , ic.input_min_digits
                    , ic.output_min_digits 
                from
                    m_inspection_criteria as ic 
                    left join m_input_dsp_item as idi 
                        on ic.item_no = idi.item_no 
                where
                    ic.hou_kijyun_no = :nendo 
                    and exists ( 
                        select
                            1 
                        from
                            m_input_menu as im 
                        where
                            im.input_menu_no = :menu_no 
                            and im.input_dsp_no = idi.input_dsp_no
                    ) 
                    and ic.saisui_kbn_no = ( 
                        select
                            case 
                                when skc.saisui_kbn_no is not null 
                                    then skc.saisui_kbn_no 
                                else sp.saisui_kbn_no 
                                end as saisui_kbn_no 
                        from
                            m_saisui_point as sp 
                            left join t_saisui_kbn_correction as skc 
                                on sp.point_no = skc.point_no 
                                and exists ( 
                                    select
                                        1 
                                    from
                                        m_input_menu as im 
                                    where
                                        im.input_menu_no = :menu_no 
                                        and im.input_dsp_no = skc.input_dsp_no
                                )
                        where
                            sp.point_no = :point_no 
                    ) 
                order by
                    idi.dsp_order asc

            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }
    }

    /**
     * 基準値データ取得
     */
    public function getInputDspConfig($selected_menu_no)
    {

        // 初期化
        $bindValue = array(
            'menu_no'  =>  $selected_menu_no,
        );
        try {
            $SQL = <<<SQL
                select
                    *
                from
                    m_input_dsp_config as idc
                where
                    exists ( 
                        select
                            1 
                        from
                            m_input_menu as im 
                        where
                            im.input_menu_no = :menu_no 
                            and im.input_dsp_no = idc.input_dsp_no
                    ) 

            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->selectOne($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }
    }

    /**
     * 画面番号からメニュー番号を取得
     * 複数取得でも問題なし
     */
    public function getMenuNo($dsp_no)
    {
        try {
            $bindValue = array(
                'dsp_no' => $dsp_no
            );

            $SQL = <<<SQL
                select
                    input_menu_no
                from
                    m_input_menu
                where
                    input_dsp_no = :dsp_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return false;
        }
    }

    public function getConnect($dsp_no)
    {
        try {
            $bindValue = array(
                'dsp_no' => $dsp_no
            );

            $SQL = <<<SQL
                select
                    point_no
                    , item_no
                    , inspection_kbn_code
                    , cell_color
                from
                    m_connect
                where
                    input_dsp_no = :dsp_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return false;
        }
    }

}
