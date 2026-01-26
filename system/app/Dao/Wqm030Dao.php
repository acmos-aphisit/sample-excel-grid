<?php

namespace App\Dao;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Facades\Hash;

use stdClass;

/**
 * 報告書出力DAO
 *
 */
class Wqm030Dao
{
    /**
     * 報告書構成 地点有無チェック
     * 
     * @return response 結果
     */
    public function getReportConfigPoint($report_no)
    {
        try {
            // 初期化
            $where = "";
            $bindValue = array();

            // 条件
            $where .= " config.report_no = :report_no ";
            $bindValue['report_no'] = $report_no;

            $SQL = <<<SQL
                    SELECT
                        CASE
                            WHEN config.point_no IS NULL THEN '0'
                            ELSE '1'
                        END AS point_flg
                    FROM
                        m_report_config AS config
                    WHERE
                        $where
SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result[0]->point_flg;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }
    }

    /**
     * 出力一覧取得(報告書構成マスタの地点番号なしパターン)
     * 
     * @return response 結果
     */
    public function getDspOutputListNonPoint($report_no, $start_date, $end_date, $unify_flg, $sort_column, $sort_order)
    {
        try {
            // 初期化
            $sortSql = "";
            $where = "";
            $bindValue = array();
            $unify_area = "";
            $unify_join = "";

            // ソート条件：デフォルトは地点順序と採水年月日の昇順
            $sortSql = "point.point_order ASC, report_result.saisui_date ASC";
            if (!is_null($sort_column)) {
                $column = $sort_column;

                $sortOrderSql = "ASC";
                if (in_array($sort_order, ["ASC", "DESC"])) {
                    $sortOrderSql = $sort_order;
                }

                switch ($column) {
                    // 採水年月日
                    case 'saisui_date':
                        $sortSql = 'report_result.saisui_date';
                        break;
                    default:
                        break;
                }

                $sortSql = $sortSql . ' ' .  $sortOrderSql . ' ,point.point_order ASC';
            }

            // 条件
            $where .= " report_result.saisui_date BETWEEN :start_date AND :end_date ";
            $bindValue['start_date'] = $start_date;
            $bindValue['end_date'] = $end_date;
            $bindValue['report_no'] = $report_no;

            // 月報 日付取得パターン(非統一)以外の場合
            if ($unify_flg == true) {
                $unify_area = "
                    WITH earliest_date AS (
                        SELECT
                            report_result.point_no,
                            MIN(saisui_date) AS min_date
                        FROM
                            t_inspection_result AS report_result
                            INNER JOIN m_report_config AS config
                                ON report_result.item_no = 1
                                AND report_result.inspection_kbn_code = config.kensa_kbn_code
                                AND config.report_no = :report_no
                        WHERE
                            saisui_date BETWEEN :start_date AND :end_date
                        GROUP BY
                            report_result.point_no
                    )
                ";

                $unify_join = "
                    INNER JOIN earliest_date
                        ON report_result.point_no = earliest_date.point_no
                        AND report_result.saisui_date = earliest_date.min_date
                ";
            }

            $SQL = <<<SQL
                    $unify_area
                    SELECT
                          to_char(report_result.saisui_date, 'YYYY/MM/DD') AS saisui_date
                        , report_result.saisui_time
                        , config.report_name
                        , saisui_point.point_report_name
                        , inspection_item.item_report_name
                        , inspection_kbn.inspection_kbn_name
                        , config.kensa_kbn_code
                        , config.report_no
                        , type.report_type_name
                        , config.dsp_space
                        , config.dsp_low_limit
                        , config.dsp_up_limit 
                        , saisui_point.point_no
                    FROM
                        t_inspection_result AS report_result
                        $unify_join
                        INNER JOIN m_report_config AS config 
                            ON report_result.item_no = 1
                            AND report_result.inspection_kbn_code = config.kensa_kbn_code 
                            AND config.report_no = :report_no
                        INNER JOIN m_report_point AS point 
                            ON point.point_no = report_result.point_no 
                            AND point.report_no = :report_no
                        LEFT JOIN m_saisui_point AS saisui_point 
                            ON saisui_point.point_no = point.point_no 
                        LEFT JOIN m_inspection_kbn AS inspection_kbn 
                            ON config.kensa_kbn_code = inspection_kbn.inspection_kbn_code 
                        LEFT JOIN m_inspection_item AS inspection_item 
                            ON config.item_no = inspection_item.item_no 
                        LEFT JOIN m_report_type AS type
                            ON config.report_type = type.report_type
                    WHERE
                        $where
                    ORDER BY
                        $sortSql
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
     * 出力一覧取得(報告書構成マスタの地点番号ありパターン)
     * 
     * @return response 結果
     */
    public function getDspOutputListPoint($report_no, $start_date, $end_date, $report_category, $sort_column, $sort_order)
    {
        try {
            // 初期化
            $sortSql = "";
            $where = "";
            $bindValue = array();
            $unify_area = "";
            $unify_join = "";

            // ソート条件：デフォルトは採水年月日の昇順
            $sortSql = "report_result.saisui_date ASC";
            if (!is_null($sort_column)) {
                $column = $sort_column;

                $sortOrderSql = "ASC";
                if (in_array($sort_order, ["ASC", "DESC"])) {
                    $sortOrderSql = $sort_order;
                }

                switch ($column) {
                    // 採水年月日
                    case 'saisui_date':
                        $sortSql = 'report_result.saisui_date';
                        break;
                    default:
                        break;
                }

                $sortSql = $sortSql . ' ' .  $sortOrderSql;
            }

            // 条件
            $where .= " report_result.saisui_date BETWEEN :start_date AND :end_date ";
            $bindValue['start_date'] = $start_date;
            $bindValue['end_date'] = $end_date;
            $bindValue['report_no'] = $report_no;

            // 日報以外の場合
            if ($report_category <> config("const.report_category.day_report")) {
                $unify_area = "
                    WITH earliest_date AS (
                        SELECT
                            report_result.point_no,
                            MIN(saisui_date) AS min_date
                        FROM
                            t_inspection_result AS report_result
                            INNER JOIN m_report_config AS config
                                ON report_result.item_no = 1
                                AND report_result.inspection_kbn_code = config.kensa_kbn_code
                                AND config.report_no = :report_no
                        WHERE
                            saisui_date BETWEEN :start_date AND :end_date
                        GROUP BY
                            report_result.point_no
                    )
                ";

                $unify_join = "
                    INNER JOIN earliest_date
                        ON report_result.point_no = earliest_date.point_no
                        AND report_result.saisui_date = earliest_date.min_date
                ";
            }

            $SQL = <<<SQL
                    $unify_area
                    SELECT
                          to_char(report_result.saisui_date, 'YYYY/MM/DD') AS saisui_date
                        , report_result.saisui_time
                        , config.report_name
                        , saisui_point.point_report_name
                        , inspection_item.item_report_name
                        , inspection_kbn.inspection_kbn_name
                        , config.kensa_kbn_code
                        , config.report_no
                        , type.report_type_name
                        , config.dsp_space
                        , config.dsp_low_limit
                        , config.dsp_up_limit 
                        , saisui_point.point_no
                    FROM
                        t_inspection_result AS report_result 
                        $unify_join
                        INNER JOIN m_report_config AS config 
                            ON report_result.item_no = 1
                            AND report_result.inspection_kbn_code = config.kensa_kbn_code 
                            AND report_result.point_no = config.point_no 
                            AND config.report_no = :report_no
                        LEFT JOIN m_saisui_point AS saisui_point 
                            ON report_result.point_no = saisui_point.point_no 
                        LEFT JOIN m_inspection_kbn AS inspection_kbn 
                            ON config.kensa_kbn_code = inspection_kbn.inspection_kbn_code 
                        LEFT JOIN m_inspection_item AS inspection_item 
                            ON config.item_no = inspection_item.item_no 
                        LEFT JOIN m_report_type AS type 
                            ON config.report_type = type.report_type 
                    WHERE
                        $where
                    ORDER BY
                        $sortSql
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
     * 出力一覧(週報) 取得
     * 
     * @return response 結果
     */
    public function getDspWeekOutputList($report_no, $mondays, $sort_column, $sort_order)
    {
        try {
            // 初期化
            $sortSql = "";
            $where = "";
            $whereMondayDate = "";
            $bindValue = array();

            // ソート条件：デフォルトは採水年月日の昇順
            $sortSql = "report_result.saisui_date ASC";
            if (!is_null($sort_column)) {
                $column = $sort_column;

                $sortOrderSql = "ASC";
                if (in_array($sort_order, ["ASC", "DESC"])) {
                    $sortOrderSql = $sort_order;
                }

                switch ($column) {
                    // 採水年月日
                    case 'saisui_date':
                        $sortSql = 'report_result.saisui_date';
                        break;
                    default:
                        break;
                }

                $sortSql = $sortSql . ' ' .  $sortOrderSql;
            }

            // 条件
            $where .= " config.report_no = :report_no ";
            $bindValue['report_no'] = $report_no;

            // 1ヶ月分の月曜日の日付を条件に追加
            foreach ($mondays as $key => $mondayDate) {
                if ($key === 0) {
                    $whereMondayDate = "'" . $mondayDate . "'";
                } else {
                    $whereMondayDate .= " , '" . $mondayDate . "'";
                }
            }

            $where .= " AND report_result.saisui_date IN (" . $whereMondayDate . ")";

            $SQL = <<<SQL
                    SELECT
                          to_char(report_result.saisui_date, 'YYYY/MM/DD') AS saisui_date
                        , report_result.saisui_time
                        , config.report_name
                        , saisui_point.point_report_name
                        , inspection_item.item_report_name
                        , '第' || floor((extract(day from saisui_date) - 1) / 7) + 1 || '週' AS inspection_kbn_name
                        , config.kensa_kbn_code
                        , config.report_no
                        , type.report_type_name
                        , config.dsp_space
                        , config.dsp_low_limit
                        , config.dsp_up_limit 
                        , saisui_point.point_no
                    FROM
                        m_report_config AS config 
                        LEFT JOIN t_inspection_result AS report_result 
                            ON config.point_no = report_result.point_no 
                            AND report_result.item_no = 1 
                            AND config.kensa_kbn_code = report_result.inspection_kbn_code 
                        LEFT JOIN m_saisui_point AS saisui_point 
                            ON config.point_no = saisui_point.point_no 
                        LEFT JOIN m_inspection_item AS inspection_item 
                            ON config.item_no = inspection_item.item_no 
                        LEFT JOIN m_report_type AS type 
                            ON config.report_type = type.report_type 
                    WHERE
                        $where
                    ORDER BY
                        $sortSql
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
     * 出力一覧(月報報告書) 取得
     * 
     * @return response 結果
     */
    public function getDspMonthlyOutputList($affiliation_section_no, $start_date, $end_date, $sort_column, $sort_order)
    {
        try {
            // 初期化
            $sortSql = "";
            $where = "";
            $bindValue = array();

            // ソート条件：デフォルトは報告書順序の昇順
            $sortSql = 'report.report_list_order ASC';
            if (!is_null($sort_column)) {
                $column = $sort_column;

                $sortOrderSql = 'ASC';
                if (in_array($sort_order, ['ASC', 'DESC'])) {
                    $sortOrderSql = $sort_order;
                }

                switch ($column) {
                    // 採水年月日
                    case 'saisui_date':
                        $sortSql = 'saisui_date';
                        break;
                    default:
                        break;
                }

                $sortSql = $sortSql . ' ' .  $sortOrderSql;
            }

            // 条件
            $where .= " AND report.sisetu_no = (SELECT sisetu_no FROM m_affiliation WHERE affiliation_section_no = :affiliation_section_no) ";
            $bindValue['start_date'] = $start_date;
            $bindValue['end_date'] = $end_date;
            $bindValue['affiliation_section_no'] = $affiliation_section_no;

            $SQL = <<<SQL
                    SELECT
                          CASE 
                            WHEN result.saisui_date IS NULL 
                                THEN '未登録' 
                            ELSE '登録済み' 
                            END AS report_status
                        , to_char(result.saisui_date, 'YYYY/MM/DD') AS saisui_date
                        , result.saisui_time
                        , r_conf.report_name
                        , s_point.point_report_name
                        , inspection_item.item_report_name
                        , k_kbn.inspection_kbn_name
                        , r_conf.kensa_kbn_code
                        , r_conf.report_no
                        , r_type.report_type_name
                        , r_conf.dsp_space
                        , r_conf.dsp_low_limit
                        , r_conf.dsp_up_limit
                        , s_point.point_no
                    FROM
                        t_monthly_report_list AS report 
                        LEFT JOIN m_report_config AS r_conf 
                            ON report.report_no = r_conf.report_no
                        LEFT JOIN m_saisui_point AS s_point
                            ON report.point_no = s_point.point_no
                        LEFT JOIN m_inspection_kbn AS k_kbn 
                            ON r_conf.kensa_kbn_code = k_kbn.inspection_kbn_code 
                        LEFT JOIN ( 
                            SELECT
                                  DENSE_RANK() OVER (PARTITION BY result.point_no, result.item_no ORDER BY result.saisui_date) AS saisui_days
                                , result.saisui_date
                                , result.saisui_time
                                , result.item_no
                                , result.inspection_kbn_code
                                , result.point_no 
                            FROM
                                t_inspection_result AS result 
                            WHERE
                                result.saisui_date BETWEEN :start_date AND :end_date
                        ) result 
                            ON s_point.point_no = result.point_no 
                            AND r_conf.item_no = result.item_no 
                            AND report.saisui_days = result.saisui_days 
                            AND r_conf.kensa_kbn_code = result.inspection_kbn_code 
                        LEFT JOIN m_inspection_item AS inspection_item 
                            ON inspection_item.item_no = r_conf.item_no 
                        LEFT JOIN m_report_type AS r_type
                            ON r_type.report_type = r_conf.report_type
                    WHERE
                        (report.start_valid_date is null or (report.start_valid_date <= :start_date))
                        $where
                    ORDER BY
                        $sortSql
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
     * 
     */
    public function getDspLabelContentsOutputList($menu_no, $start_date, $end_date, $sort_column, $sort_order)
        {
        try {
            // 初期化
            $sortSql = "";
            $where = "";
            $bindValue = array();

            // ソート条件：デフォルトは報告書順序の昇順
            $sortSql = 'r_conf.report_no ASC';
            if (!is_null($sort_column)) {
                $column = $sort_column;

                $sortOrderSql = 'ASC';
                if (in_array($sort_order, ['ASC', 'DESC'])) {
                    $sortOrderSql = $sort_order;
                }

                switch ($column) {
                    // 採水年月日
                    case 'saisui_date':
                        $sortSql = 'saisui_date';
                        break;
                    default:
                        break;
                }

                $sortSql = $sortSql . ' ' .  $sortOrderSql;
            }

            // 条件
            $bindValue['start_date'] = $start_date;
            $bindValue['end_date'] = $end_date;
            $bindValue['menu_no'] = $menu_no;

            $SQL = <<<SQL
                WITH RECURSIVE children AS ( 
                    SELECT
                        t.report_menu_no
                        , t.report_parent_menu_no
                        , t.report_no
                        , t.label_flg 
                    FROM
                        m_report_menu t 
                    WHERE
                        t.report_parent_menu_no = ( 
                            select
                                rm.report_parent_menu_no 
                            from
                                m_report_menu as rm 
                            where
                                rm.report_menu_no = :menu_no
                        ) 
                        and (t.report_no is not null or t.label_flg = 1) 
                    UNION ALL 
                    SELECT
                        c.report_menu_no
                        , c.report_parent_menu_no
                        , c.report_no
                        , c.label_flg 
                    FROM
                        m_report_menu c 
                        INNER JOIN children ch 
                            ON c.report_parent_menu_no = ch.report_menu_no
                ) 
                , report_list as ( 
                    select
                        rc.* 
                    from
                        m_report_config as rc 
                    where
                        exists ( 
                            SELECT
                                1 
                            FROM
                                children 
                            where
                                children.report_no is not null 
                                and children.report_no = rc.report_no 
                            order by
                                report_menu_no asc
                        )
                ) 
                , earliest_date AS ( 
                    SELECT
                        config.report_no
                        , report_result.point_no
                        , MIN(saisui_date) AS min_date 
                    FROM
                        t_inspection_result AS report_result 
                        INNER JOIN report_list AS config 
                            ON report_result.item_no = 1 
                            AND report_result.inspection_kbn_code = config.kensa_kbn_code 
                        inner join m_report_point as r_point 
                            on r_point.report_no = config.report_no 
                            and report_result.point_no = r_point.point_no 
                    WHERE
                        saisui_date BETWEEN :start_date AND :end_date 
                    GROUP BY
                        config.report_no
                        , report_result.point_no
                ) 
                SELECT
                    -- CASE 
                    --     WHEN result.saisui_date IS NULL 
                    --         THEN '未登録' 
                    --     ELSE '登録済み' 
                    --     END AS report_status
                    -- , 
                    to_char(result.saisui_date, 'YYYY/MM/DD') AS saisui_date
                    , result.saisui_time
                    , r_conf.report_name
                    , s_point.point_report_name
                    , inspection_item.item_report_name
                    , k_kbn.inspection_kbn_name
                    , r_conf.kensa_kbn_code
                    , r_conf.report_no
                    , r_type.report_type_name
                    , r_conf.dsp_space
                    , r_conf.dsp_low_limit
                    , r_conf.dsp_up_limit
                    , s_point.point_no 
                FROM
                    report_list as r_conf 
                    LEFT JOIN m_report_point as r_point 
                        ON r_conf.report_no = r_point.report_no 
                    LEFT JOIN m_saisui_point AS s_point 
                        ON r_point.point_no = s_point.point_no 
                    LEFT JOIN m_inspection_kbn AS k_kbn 
                        ON r_conf.kensa_kbn_code = k_kbn.inspection_kbn_code 
                    LEFT JOIN
                        earliest_date
                        ON r_conf.report_no = earliest_date.report_no
                        AND earliest_date.point_no = s_point.point_no
                    INNER JOIN ( 
                        SELECT
                            DENSE_RANK() OVER ( 
                                PARTITION BY
                                    result.saisui_date 
                                ORDER BY
                                    result.saisui_time
                            ) AS saisui_days
                            , result.saisui_date
                            , result.saisui_time
                            , result.item_no
                            , result.inspection_kbn_code
                            , result.point_no 
                        FROM
                            t_inspection_result AS result 
                        WHERE
                            result.saisui_date BETWEEN :start_date AND :end_date
                    ) result 
                        ON s_point.point_no = result.point_no 
                        AND result.item_no = r_conf.item_no 
                        AND r_conf.kensa_kbn_code = result.inspection_kbn_code 
                        AND earliest_date.min_date = result.saisui_date
                        AND earliest_date.point_no = result.point_no
                    LEFT JOIN m_inspection_item AS inspection_item 
                        ON inspection_item.item_no = r_conf.item_no 
                    LEFT JOIN m_report_type AS r_type 
                        ON r_type.report_type = r_conf.report_type 
                ORDER BY
                    $sortSql
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
     * 農薬類検査結果書 出力一覧 取得
     * 
     * @return response 結果
     */
    public function getDspOutputListNouyaku($report_no, $start_date, $end_date, $affiliation_section_no, $sort_column, $sort_order)
    {
        try {
            // 初期化
            $sortSql = "";
            $where = "";
            $sisetu_join = "";
            $bindValue = array();

            // ソート条件：デフォルトは報告書地点マスタ順序の昇順
            $sortSql = "point.point_order ASC";
            if (!is_null($sort_column)) {
                $column = $sort_column;

                $sortOrderSql = "ASC";
                if (in_array($sort_order, ["ASC", "DESC"])) {
                    $sortOrderSql = $sort_order;
                }

                switch ($column) {
                    // 採水年月日
                    case 'saisui_date':
                        $sortSql = 'saisui_date';
                        break;
                    default:
                        break;
                }

                $sortSql = $sortSql . ' ' .  $sortOrderSql;
            }


            // 条件
            $where .= " report_result.saisui_date BETWEEN :start_date AND :end_date ";
            $bindValue['start_date'] = $start_date;
            $bindValue['end_date'] = $end_date;
            $bindValue['report_no'] = $report_no;

            // 浄水場単位の場合
            if ($affiliation_section_no) {
                $sisetu_join = "
                    LEFT JOIN m_affiliation AS affiliation
                        ON affiliation.affiliation_section_no = :affiliation_section_no
                    INNER JOIN m_saisui_point AS saisui_point 
                        ON saisui_point.point_no = point.point_no 
                        AND saisui_point.sisetu_no = affiliation.sisetu_no
                ";
                $bindValue['affiliation_section_no'] = $affiliation_section_no;
            } else {
                $sisetu_join = "
                    LEFT JOIN m_saisui_point AS saisui_point 
                        ON saisui_point.point_no = point.point_no 
                ";
            }

            $SQL = <<<SQL
                    SELECT
                          to_char(report_result.saisui_date, 'YYYY/MM/DD') AS saisui_date
                        , report_result.saisui_time
                        , config.report_name
                        , saisui_point.point_report_name
                        , inspection_item.item_report_name
                        , inspection_kbn.inspection_kbn_name
                        , config.kensa_kbn_code
                        , config.report_no
                        , type.report_type_name
                        , config.dsp_space
                        , config.dsp_low_limit
                        , config.dsp_up_limit 
                        , saisui_point.point_no
                    FROM
                        t_inspection_result AS report_result 
                        INNER JOIN m_report_config AS config 
                            ON report_result.item_no = 1
                            AND report_result.inspection_kbn_code = config.kensa_kbn_code 
                            AND config.report_no = :report_no
                        INNER JOIN m_report_point AS point 
                            ON point.point_no = report_result.point_no 
                            AND point.report_no = :report_no
                        $sisetu_join
                        LEFT JOIN m_inspection_kbn AS inspection_kbn 
                            ON config.kensa_kbn_code = inspection_kbn.inspection_kbn_code 
                        LEFT JOIN m_inspection_item AS inspection_item 
                            ON config.item_no = inspection_item.item_no 
                        LEFT JOIN m_report_type AS type
                            ON config.report_type = type.report_type
                    WHERE
                        $where
                    ORDER BY
                        $sortSql
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
     * 親ラベルを取得
     */
    public function getParentMenuNo($menu_no)
    {
        try {
            $bindValue = array(
                'meneu_no' => $menu_no
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
}
