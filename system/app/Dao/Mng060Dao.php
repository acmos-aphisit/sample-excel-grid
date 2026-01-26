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
class Mng060Dao
{

    /**
     * メニュー番号より、報告書番号を取得
     */
    public function menuToReport($request)
    {
        try {
            // 初期化
            $where = "";
            $bindValue['menu_no'] = $request->selectedMenuNo;

            $SQL = <<<SQL
                select
                    report_no
                from
                    m_report_menu
                where
                    report_menu_no = :menu_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);
            if (count($result) > 0) {
                return $result[0];
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * 順序の取得
     * 
     * @return response 結果
     */
    public function getReportMenuMaxOrder()
    {
        try {
            $bindValue = array();

            $SQL = <<<SQL
                    SELECT
                        MAX(m_report_menu.report_order)
                    FROM
                        m_report_menu
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
     * 親メニューの階層取得
     * 
     * @return response 結果
     */
    public function getReportMenuHierarchy($parent_no)
    {
        try {
            $bindValue = array(
                'parent_no' => $parent_no
            );

            $SQL = <<<SQL
                    SELECT
                        m_report_menu.report_hierarchy
                    FROM
                        m_report_menu
                    WHERE
                        m_report_menu.report_menu_no = :parent_no
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
     * 入力画面情報を検索
     * 
     * @return response 結果
     */
    public function haitaReportMenuData($report_menu_no, $display_time)
    {
        try {
            $bindValue = array(
                'report_menu_no' => $report_menu_no,
                'display_time'  => date('Y-m-d H:i:s', strtotime($display_time)),

            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_report_menu
                    WHERE
                        report_menu_no = :report_menu_no
                        AND update_date <= :display_time
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
     * メニューラベルを新規登録
     *
     * 
     * @return response 処理結果
     */
    public function saveNewMenuLabel($report_parent_menu_no, $affiliation_section_no, $setCurHierarchy, $report_title, $setMaxOrder)
    {
        try {
            $bindValue = array(
                'report_parent_menu_no'          => $report_parent_menu_no,                         // 親メニュー番号
                'affiliation_section_no'        => $affiliation_section_no,                         // 所属課番号
                'report_hierarchy'               => $setCurHierarchy,                               // 階層
                'report_title'                   => $report_title,                                  // タイトル
                'report_order'                   => $setMaxOrder,                                   // 順序
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)         // 実施ユーザーID
            );

            $SQL = <<<SQL
                INSERT INTO public.m_report_menu(
                    report_parent_menu_no
                    , affiliation_section_no
                    , report_hierarchy
                    , report_title
                    , report_order
                    , label_flg
                    , insert_date
                    , insert_user
                    , update_date
                    , update_user
                )
                VALUES(
                    :report_parent_menu_no
                    , :affiliation_section_no
                    , :report_hierarchy
                    , :report_title
                    , :report_order
                    , 1
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
     * 報告書メニューを更新
     *
     * 
     * @return response 処理結果
     */
    public function saveUpdateReportMenu($report_menu_no, $report_parent_menu_no, $affiliation_section_no, $setCurHierarchy, $report_title)
    {
        try {
            $bindValue = array(
                'report_menu_no'                 => $report_menu_no,                              // メニュー番号
                'report_parent_menu_no'          => $report_parent_menu_no,                       // 親メニュー番号
                'affiliation_section_no'        => $affiliation_section_no,                       // 所属課番号
                'report_hierarchy'               => $setCurHierarchy,                             // 階層
                'report_title'                   => $report_title,                                // タイトル
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)       // 実施ユーザーID
            );

            $SQL = <<<SQL
                    UPDATE m_report_menu SET 
                      report_parent_menu_no = :report_parent_menu_no            -- 親メニュー番号
                      , affiliation_section_no = :affiliation_section_no        -- 所属課番号
                      , report_hierarchy = :report_hierarchy                    -- 階層
                      , report_title = :report_title                            -- タイトル
                      , update_date = CURRENT_TIMESTAMP
                      , update_user = :proc_user_id
                    WHERE 
                      report_menu_no = :report_menu_no
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
     * 入力画面情報を検索
     * 
     * @return response 結果
     */
    public function haitaInputMenuData($report_menu_no, $display_time)
    {
        try {
            $bindValue = array(
                'report_menu_no' => $report_menu_no,
                'display_time'  => date('Y-m-d H:i:s', strtotime($display_time)),

            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_report_menu
                    WHERE
                        report_menu_no = :report_menu_no
                        AND update_date <= :display_time
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
     * メニューの順序を取替
     *
     * 
     * @return response 処理結果
     */
    public function exchangeMenuOrder($report_menu_no, $report_order)
    {
        try {
            $bindValue = array(
                'report_menu_no'                 => $report_menu_no,                              // 入力画面番号
                'report_order'                   => $report_order,                                // 順序
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)     // 実施ユーザーID
            );

            $SQL = <<<SQL
                    UPDATE public.m_report_menu SET 
                      report_order = :report_order
                      , update_date = CURRENT_TIMESTAMP
                      , update_user = :proc_user_id
                    WHERE 
                      report_menu_no = :report_menu_no
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
     * 報告書選択メニュー削除
     *
     * 
     * @return response 処理結果
     */
    public function deleteReportMenu($report_menu_no, $input_dsp_no)
    {
        try {
            // 入力画面メニューを削除
            try {
                $DeleteBindValue = array(
                    'report_menu_no'                          => $report_menu_no,
                );

                // 登録データの削除
                $DelSQL = <<<SQL
                    DELETE FROM m_report_menu
                    WHERE
                        report_menu_no = :report_menu_no
                SQL;

                // 検査情報データ 削除
                DB::connection('suishitsu_db')->delete($DelSQL, $DeleteBindValue);
            } catch (\Throwable $e) {
                Log::error($e->getMessage());
                Log::error($e->getTraceAsString());
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }

    /**
     * 報告書構成マスタシーケンスの取得
     * 
     * @return response 結果
     */
    public function getReportMenuReferenceNextVal()
    {
        try {
            $bindValue = array();

            $SQL = <<<SQL
                    SELECT nextval('m_report_config_report_no_seq'::regclass) AS input_rpt_no_seq
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
     * 月報報告書一覧 取得処理 
     * 
     * @return response 結果
     */
    public function getMonthReportList($request)
    {
        try {
            // 初期化
            $bindValue['sisetu_no'] = $request;

            $SQL = <<<SQL
                select
                    -- config.report_name
                    config.report_no
                    -- , point.point_report_name
                    , point.point_no
                    , mr.saisui_days
                from
                    t_monthly_report_list as mr
                    left join
                        m_report_config as config
                    on
                        mr.report_no = config.report_no
                    left join
                        m_saisui_point as point
                    on
                        mr.point_no = point.point_no
                where
                    mr.sisetu_no = :sisetu_no
                order by
                    mr.report_list_order
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);
            if (count($result) > 0) {
                return $result;
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * 報告書設定 取得
     */
    public function getRptConfig($request)
    {
        try {
            // 初期化
            $where = "";
            $bindValue['report_no'] = $request->report_no;

            $SQL = <<<SQL
                select
                    config.report_no
                    , config.report_name
                    --, type.report_type_name as report_type
                    , type.report_type as report_type
                    , config.report_category
                    , config.data_sheet_type
                    --, iconf.input_dsp_name as dsp_name
                    , iconf.input_dsp_no as dsp_name
                    --, point.point_report_name as point_name
                    , point.point_no as point_name
                    --, item.report_item_name as item_name
                    , config.item_no as item_name
                    , config.mask_pattern as mask
                    , config.row_start_cell_name as row_cell
                    , config.col_start_cell_name as col_cell
                    --, kbn.inspection_kbn_name as inspection_kbn
                    , kbn.inspection_kbn_code as inspection_kbn
                    , config.dsp_up_limit as high_limit
                    , config.dsp_low_limit as low_limit
                    , config.dsp_space as space
                    , base.auto_update_flg as auto_update_flg
                from
                    m_report_config as config
                    left join
                        m_input_dsp_config as iconf
                        on
                            iconf.input_dsp_no = config.input_dsp_no
                    left join
                        m_saisui_point as point
                        on
                            point.point_no = config.point_no
                    left join
                        m_inspection_kbn as kbn
                        on
                            kbn.inspection_kbn_code = config.kensa_kbn_code
                    left join
                        m_report_type as type
                        on
                            type.report_type = config.report_type
                    left join
                        m_report_base as base
                        on
                            base.report_no = config.report_no 
                where
                    config.report_no = :report_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);
            if (count($result) > 0) {
                return $result;
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * 報告書項目 取得
     */
    public function getRptItem($request)
    {
        try {
            // 初期化
            $where = "";
            $bindValue['report_no'] = $request->report_no;

            $SQL = <<<SQL
                select
                    result.* 
                from
                    (select 1 as dummy) as base 
                    left join ( 
                        select
                            -- iitem.item_report_name
                            iitem.item_no
                            , ritem.report_item_name
                            -- 報告書項目マスタ.項目セル名
                            , ritem.unit_cell_name
                            , ritem.target_cell_name
                            , ritem.base_cell_name
                            , ritem.number_cell_name
                            , ritem.no_name 
                        from
                            m_report_item as ritem 
                            left join m_inspection_item as iitem 
                                on ritem.item_no = iitem.item_no 
                        where
                            1 = 1 
                            and ritem.report_no = :report_no 
                        order by
                            ritem.item_order asc
                    ) as result 
                        on true

            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);
            if (count($result) > 0) {
                return $result;
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * 報告書地点 取得
     */
    public function getRptPoint($request)
    {
        try {
            // 初期化
            $where = "";
            $bindValue['report_no'] = $request->report_no;

            $SQL = <<<SQL
                select
                    result.* 
                from
                    (select 1 as dummy) as base 
                    left join ( 
                        select
                            --spoint.point_report_name
                            spoint.point_no
                            , rpoint.report_point_name 
                        from
                            m_report_point as rpoint 
                            left join m_saisui_point as spoint 
                                on rpoint.point_no = spoint.point_no 
                        where
                            rpoint.report_no = :report_no
                        order by
                            rpoint.point_order asc
                    ) as result 
                        on true

            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);
            if (count($result) > 0) {
                return $result;
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * 固定文言 取得
     */
    public function getRptText($request)
    {
        try {
            // 初期化
            $where = "";
            $bindValue['report_no'] = $request->report_no;

            $SQL = <<<SQL
                select
                    result.* 
                from
                    (select 1 as dummy) as base 
                    left join ( 
                        select
                            -- point.point_report_name
                            point.point_no
                            , text.text_cell_name
                            , text.text_cell_kbn
                            , text.text_cell_code
                            , text.nendo
                            , text.start_valid_date
                            , text.end_valid_date 
                        from
                            m_report_text as text 
                            left join m_saisui_point as point 
                                on text.point_no = point.point_no 
                        where
                            text.report_no = :report_no 
                        order by
                            text.point_no asc
                            , text.text_cell_kbn asc
                    ) as result 
                        on true
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);
            if (count($result) > 0) {
                return $result;
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    public function optionReport()
    {
        try {

            $SQL = <<<SQL
                select
                    report_no as value
                    , report_name as label
                from
                    m_report_config
                order by
                    report_no asc
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }
    }

    public function optionInputMenu()
    {
        try {

            $SQL = <<<SQL
                select
                    input_dsp_no as value
                    , input_dsp_name as label
                from
                    m_input_dsp_config
                order by
                    input_dsp_no asc
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }
    }

    public function optionPoint()
    {
        try {

            $SQL = <<<SQL
                select
                    point_no as value
                    , point_dsp_name as label
                from
                    m_saisui_point
                order by
                    point_no asc
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }
    }

    public function optionInspectionKbn()
    {
        try {

            $SQL = <<<SQL
                select
                    inspection_kbn_code as value
                    , inspection_kbn_name as label
                from
                    m_inspection_kbn
                order by
                    inspection_kbn_code asc
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }
    }

    public function optionRptType()
    {
        try {

            $SQL = <<<SQL
                select
                    report_type as value
                    , report_type_name as label
                from
                    m_report_type
                order by
                    report_type asc
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }
    }

    public function optionRptItem()
    {
        try {

            $SQL = <<<SQL
                select
                    item_no as value
                    , item_report_name as label
                from
                    m_inspection_item
                order by
                    item_report_name asc
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }
    }

    /** 排他制御 */
    public function haitaCheck($table, $report_no, $time)
    {
        try {
            $where = '';
            $bindValue = array();

            if (isset($report_no)) {
                $bindValue['report_no'] = $report_no;
                $where .= " AND report_no = :report_no ";
            }

            if (isset($time)) {
                $bindValue['time'] = $time;
                $where .= " AND update_date >= :time ";
            }

            $SQL = <<<SQL
                select
                    *
                from
                    $table
                where
                    1 = 1
                    $where
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            if (count($result) > 0) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error($e);
            return false;
        }
    }

    /** 排他制御 */
    public function haitaCheckMonthly($table, $sisetu_no, $time)
    {
        try {
            $where = '';
            $bindValue = array();

            if (isset($sisetu_no)) {
                $bindValue['sisetu_no'] = $sisetu_no;
                $where .= " AND sisetu_no = :sisetu_no ";
            }

            if (isset($time)) {
                $bindValue['time'] = $time;
                $where .= " AND update_date > :time ";
            }

            $SQL = <<<SQL
                select
                    count(*)
                from
                    $table
                where
                    1 = 1
                    $where
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            if ($result != array() && $result[0]->count > 0) {
                return false;
            }
            return true;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /** 報告書構成 更新 */
    public function updateReportConfig($bindValue, $bindBaseValue)
    {
        try {

            $SQL = <<<SQL
                update m_report_config
                set
                    report_name = :report_name
                    , report_type = :report_type
                    , report_category = :report_category
                    , data_sheet_type = :data_sheet_type
                    , input_dsp_no = :dsp_name
                    , point_no = :point_name
                    , item_no = :item_name
                    , mask_pattern = :mask
                    , row_start_cell_name = :row_cell
                    , col_start_cell_name = :col_cell
                    , kensa_kbn_code = :inspection_kbn
                    , dsp_up_limit = :high_limit
                    , dsp_low_limit = :low_limit
                    , dsp_space = :space
                    , update_date = CURRENT_TIMESTAMP
                    , update_user = :user
                where
                    report_no = :report_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->update($SQL, $bindValue); // 更新対象数を取得 0～

            if ($result > 0) {
                // 報告書ベース情報マスタ_自動様式更新フラグを更新
                if (count($bindBaseValue) > 0) {
                    $newBindBaseValue = array(
                        'report_no'                 => $bindValue['report_no'],
                        'auto_update_flg'           => intval($bindBaseValue['auto_update_flg']),
                        'user'                      => $bindBaseValue['user'],
                    );

                    $baseSQL = <<<SQL
                        update m_report_base
                        set
                            auto_update_flg = :auto_update_flg
                            , update_date = CURRENT_TIMESTAMP
                            , update_user = :user
                        where
                            report_no = :report_no
                    SQL;

                    $baseResult = array();
                    $baseResult = DB::connection('suishitsu_db')->update($baseSQL, $newBindBaseValue);

                    if ($baseResult > 0) {
                        return true;
                    }

                }

                return true;
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /** 報告書項目 削除 */
    public function deleteReportItem($report_no)
    {
        try {
            $bindValue['report_no'] = $report_no;
            $SQL = <<<SQL
                delete
                from
                    m_report_item
                where
                    report_no = :report_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->delete($SQL, $bindValue); // 更新対象数を取得 0～
            return $result;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /** 報告書項目 登録 */
    public function insertReportItem($bindValueList)
    {
        try {
            $columns = [
                'report_no',
                'item_no',
                'report_item_name',
                'unit_cell_name',
                'target_cell_name',
                'base_cell_name',
                'number_cell_name',
                'no_name',
                'item_order',
                'insert_date',
                'insert_user',
                'update_date',
                'update_user'
            ];
            $bindValue = array();
            $values = ' values';
            foreach ($bindValueList as $key => $listElem) {
                $values .= '( ';
                foreach ($columns as $col) {
                    if ($col == 'insert_date' || $col == 'update_date') {
                        $values .= 'CURRENT_TIMESTAMP,';
                    } else {
                        $values .= ':' . $col . $key . ',';
                        $bindValue[$col . $key] = $listElem[$col];
                    }
                };
                $values = rtrim($values, ',');
                $values .= ' ),';
            }
            $values = rtrim($values, ',');

            $SQL = <<<SQL
                insert into m_report_item
                (
                    report_no
                    , item_no
                    , report_item_name
                    , unit_cell_name
                    , target_cell_name
                    , base_cell_name
                    , number_cell_name
                    , no_name
                    , item_order
                    , insert_date
                    , insert_user
                    , update_date
                    , update_user
                )
                $values
            SQL;
            // \Log::info($SQL);
            // \Log::info($bindValue);
            // return false;

            $result = array();
            $result = DB::connection('suishitsu_db')->insert($SQL, $bindValue); // 更新対象数を取得 0～
            return $result;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /** 報告書地点 削除 */
    public function deleteReportPoint($report_no)
    {
        try {
            $bindValue['report_no'] = $report_no;
            $SQL = <<<SQL
                delete
                from
                    m_report_point
                where
                    report_no = :report_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->delete($SQL, $bindValue);
            return $result;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /** 報告書地点 登録 */
    public function insertReportPoint($bindValueList)
    {
        try {
            $columns = [
                'report_no',
                'point_no',
                'report_point_name',
                'point_order',
                'insert_date',
                'insert_user',
                'update_date',
                'update_user'
            ];
            $bindValue = array();
            $values = ' values';
            foreach ($bindValueList as $key => $listElem) {
                $values .= '( ';
                foreach ($columns as $col) {
                    if ($col == 'insert_date' || $col == 'update_date') {
                        $values .= 'CURRENT_TIMESTAMP,';
                    } else {
                        $values .= ':' . $col . $key . ',';
                        $bindValue[$col . $key] = $listElem[$col];
                    }
                };
                $values = rtrim($values, ',');
                $values .= ' ),';
            }
            $values = rtrim($values, ',');

            $SQL = <<<SQL
                insert into m_report_point
                (
                    report_no
                    , point_no
                    , report_point_name
                    , point_order
                    , insert_date
                    , insert_user
                    , update_date
                    , update_user
                )
                $values
            SQL;
            // \Log::info($SQL);
            // \Log::info($bindValue);
            // return false;

            $result = array();
            $result = DB::connection('suishitsu_db')->insert($SQL, $bindValue); // 更新対象数を取得 0～
            return $result;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /** 固定文言 削除 */
    public function deleteReportText($report_no)
    {
        try {
            $bindValue['report_no'] = $report_no;
            $SQL = <<<SQL
                delete
                from
                    m_report_text
                where
                    report_no = :report_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->delete($SQL, $bindValue);
            return $result;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /** 固定文言 登録 */
    public function insertReportText($bindValueList)
    {
        try {
            $columns = [
                'report_no',
                'text_cell_name',
                'text_renban',
                'point_no',
                'text_cell_kbn',
                'text_cell_code',
                'nendo',
                'start_valid_date',
                'end_valid_date',
                'insert_date',
                'insert_user',
                'update_date',
                'update_user'
            ];
            $bindValue = array();
            $values = ' values';
            foreach ($bindValueList as $key => $listElem) {
                $values .= '( ';
                foreach ($columns as $col) {
                    if ($col == 'insert_date' || $col == 'update_date') {
                        $values .= 'CURRENT_TIMESTAMP,';
                    } else {
                        $values .= ':' . $col . $key . ',';
                        $bindValue[$col . $key] = $listElem[$col];
                    }
                };
                $values = rtrim($values, ',');
                $values .= ' ),';
            }
            $values = rtrim($values, ',');

            $SQL = <<<SQL
                insert into m_report_text
                (
                    report_no
                    , text_cell_name
                    , text_renban
                    , point_no
                    , text_cell_kbn
                    , text_cell_code
                    , nendo
                    , start_valid_date
                    , end_valid_date
                    , insert_date
                    , insert_user
                    , update_date
                    , update_user
                )
                $values
            SQL;
            // \Log::info($SQL);
            // \Log::info($bindValue);
            // return false;

            $result = array();
            $result = DB::connection('suishitsu_db')->insert($SQL, $bindValue); // 更新対象数を取得 0～
            return $result;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /** 固定文言 削除 */
    public function deleteMonthReportList($sisetu_no)
    {
        try {
            $bindValue['sisetu_no'] = $sisetu_no;
            $SQL = <<<SQL
                delete
                from
                    t_monthly_report_list
                where
                    sisetu_no = :sisetu_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->delete($SQL, $bindValue);
            return $result;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * 報告書設定 ファイル名 取得
     */
    public function getTemplateFileName($request)
    {
        try {
            // 初期化
            $where = "";
            $bindValue['report_no'] = $request->report_no;

            $SQL = <<<SQL
                select
                    config.report_name
                    , config.row_start_cell_name
                    , config.col_start_cell_name
                    , config.template_file
                    , m_base.base_file_name
                    , m_base.auto_update_flg
                from
                    m_report_config as config
                left join
                    m_report_type as type
                on
                    config.report_type = type.report_type
                left join
                    m_report_base as m_base
                on
                    type.report_type = m_base.report_type
                and config.report_no = m_base.report_no
                where
                    config.report_no = :report_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->selectOne($SQL, $bindValue);
            if ($result !== null) {
                return $result;
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * 報告書構成 更新
     * 
     * @return response 処理結果
     */
    public function insertReportConfig($report_title)
    {
        try {
            $bindValue = array(
                'report_name'           => $report_title,                                   // 報告書名称
                'proc_user_id'          => intval(auth('sanctum')->user()->user_id)         // 実施ユーザーID
            );

            $SQL = <<<SQL
                INSERT INTO m_report_config
                (
                    report_name 
                    , insert_date 
                    , insert_user 
                    , update_date 
                    , update_user 
                )
                VALUES
                (
                    :report_name
                    , CURRENT_TIMESTAMP
                    , :proc_user_id
                    , CURRENT_TIMESTAMP
                    , :proc_user_id
                )
                returning report_no -- 〇〇 で指定したカラムの値が返ってくる。主キーがserialなので、それで取得・確認する。
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->selectOne($SQL, $bindValue);
            if ($result !== null) {
                return $result->report_no;
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * 報告書構成マスタ 更新
     * 
     * @return response 処理結果
     */
    public function duplicateReportConfig($dup_data)
    {
        try {
            $bindValue = array(
                'report_name'           => $dup_data->report_name,                         // 報告書名称
                'report_type'           => $dup_data->report_type,                         // 報告書タイプ
                'report_category'       => $dup_data->report_category,                     // 報告書分類
                'data_sheet_type'       => $dup_data->data_sheet_type,                     // データシートタイプ
                'input_dsp_no'          => $dup_data->input_dsp_no,                        // 入力画面番号
                'point_no'              => $dup_data->point_no,                            // 地点番号
                'item_no'               => $dup_data->item_no,                             // 項目番号
                'mask_pattern'          => $dup_data->mask_pattern,                        // マスクパターン
                'row_start_cell_name'   => $dup_data->row_start_cell_name,                 // 縦開始セル名
                'col_start_cell_name'   => $dup_data->col_start_cell_name,                 // 横開始セル名
                'kensa_kbn_code'        => $dup_data->kensa_kbn_code,                      // 検査区分CD
                'template_file'         => $dup_data->template_file,                       // テンプレートファイル
                'dsp_up_limit'          => $dup_data->dsp_up_limit,                        // 上限表示
                'dsp_low_limit'         => $dup_data->dsp_low_limit,                       // 下限表示
                'dsp_space'             => $dup_data->dsp_space,                           // 空白表示
                'proc_user_id'          => intval(auth('sanctum')->user()->user_id)        // 実施ユーザーID
            );

            $SQL = <<<SQL
                INSERT INTO m_report_config( 
                    report_name                                 -- 報告書名称
                    , report_type                               -- 報告書タイプ
                    , report_category                           -- 報告書分類
                    , data_sheet_type                           -- データシートタイプ
                    , input_dsp_no                              -- 入力画面番号
                    , point_no                                  -- 地点番号
                    , item_no                                   -- 項目番号
                    , mask_pattern                              -- マスクパターン
                    , row_start_cell_name                       -- 縦開始セル名
                    , col_start_cell_name                       -- 横開始セル名
                    , kensa_kbn_code                            -- 検査区分CD
                    , template_file                             -- テンプレートファイル
                    , dsp_up_limit                              -- 上限表示
                    , dsp_low_limit                             -- 下限表示
                    , dsp_space                                 -- 空白表示
                    , insert_date                               -- 作成日時
                    , insert_user                               -- 作成ユーザ
                    , update_date                               -- 更新日時
                    , update_user                               -- 更新ユーザ
                ) 
                VALUES (
                    :report_name                                -- 報告書名称
                    , :report_type                              -- 報告書タイプ
                    , :report_category                          -- 報告書分類
                    , :data_sheet_type                          -- データシートタイプ
                    , :input_dsp_no                             -- 入力画面番号
                    , :point_no                                 -- 地点番号
                    , :item_no                                  -- 項目番号
                    , :mask_pattern                             -- マスクパターン
                    , :row_start_cell_name                      -- 縦開始セル名
                    , :col_start_cell_name                      -- 横開始セル名
                    , :kensa_kbn_code                           -- 検査区分CD
                    , :template_file                            -- テンプレートファイル
                    , :dsp_up_limit                             -- 上限表示
                    , :dsp_low_limit                            -- 下限表示
                    , :dsp_space                                -- 空白表示
                    , CURRENT_TIMESTAMP                         -- 作成日時
                    , :proc_user_id                             -- 作成ユーザ
                    , CURRENT_TIMESTAMP                         -- 更新日時
                    , :proc_user_id                             -- 更新ユーザ
                )
                returning report_no -- 〇〇 で指定したカラムの値が返ってくる。主キーがserialなので、それで取得・確認する。
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->selectOne($SQL, $bindValue);
            if ($result !== null) {
                return $result->report_no;
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * 報告書項目マスタ 更新
     * 
     * @return response 処理結果
     */
    public function duplicateReportItem($set_rpt_no, $dup_data)
    {
        try {
            $bindValue = array(
                'report_no'             => $set_rpt_no,                                     // 報告書番号
                'item_no'               => $dup_data->item_no,                              // 項目番号
                'report_item_name'      => $dup_data->report_item_name,                     // 報告書用項目名称
                'unit_cell_name'        => $dup_data->unit_cell_name,                       // 単位セル名
                'target_cell_name'      => $dup_data->target_cell_name,                     // 目標値セル名
                'base_cell_name'        => $dup_data->base_cell_name,                       // 基準値セル名
                'number_cell_name'      => $dup_data->number_cell_name,                     // 番号セル名
                'no_name'               => $dup_data->no_name,                              // 番号名
                'item_order'            => $dup_data->item_order,                           // 順序
                'proc_user_id'          => intval(auth('sanctum')->user()->user_id)         // 実施ユーザーID
            );

            $SQL = <<<SQL
                INSERT INTO m_report_item( 
                    report_no                                   -- 報告書番号
                    , item_no                                   -- 項目番号
                    , report_item_name                          -- 報告書用項目名称
                    , unit_cell_name                            -- 単位セル名
                    , target_cell_name                          -- 目標値セル名
                    , base_cell_name                            -- 基準値セル名
                    , number_cell_name                          -- 番号セル名
                    , no_name                                   -- 番号名
                    , item_order                                -- 順序
                    , insert_date                               -- 作成日時
                    , insert_user                               -- 作成ユーザ
                    , update_date                               -- 更新日時
                    , update_user                               -- 更新ユーザ
                ) 
                VALUES ( 
                    :report_no                                  -- 報告書番号
                    , :item_no                                  -- 項目番号
                    , :report_item_name                         -- 報告書用項目名称
                    , :unit_cell_name                           -- 単位セル名
                    , :target_cell_name                         -- 目標値セル名
                    , :base_cell_name                           -- 基準値セル名
                    , :number_cell_name                         -- 番号セル名
                    , :no_name                                  -- 番号名
                    , :item_order                               -- 順序
                    , CURRENT_TIMESTAMP                         -- 作成日時
                    , :proc_user_id                             -- 作成ユーザ
                    , CURRENT_TIMESTAMP                         -- 更新日時
                    , :proc_user_id                             -- 更新ユーザ
                )
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->selectOne($SQL, $bindValue);
            return $result;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * 報告書地点マスタ 更新
     * 
     * @return response 処理結果
     */
    public function duplicateReportPoint($set_rpt_no, $dup_data)
    {
        try {
            $bindValue = array(
                'report_no'             => $set_rpt_no,                                     // 報告書番号
                'point_no'              => $dup_data->point_no,                             // 地点番号
                'report_point_name'     => $dup_data->report_point_name,                    // 報告書用地点名称
                'point_order'           => $dup_data->point_order,                          // 順序
                'proc_user_id'          => intval(auth('sanctum')->user()->user_id)         // 実施ユーザーID
            );

            $SQL = <<<SQL
                INSERT INTO m_report_point( 
                    report_no                                   -- 報告書番号
                    , point_no                                  -- 地点番号
                    , report_point_name                         -- 報告書用地点名称
                    , point_order                               -- 順序
                    , insert_date                               -- 作成日時
                    , insert_user                               -- 作成ユーザ
                    , update_date                               -- 更新日時
                    , update_user                               -- 更新ユーザ
                ) 
                VALUES ( 
                    :report_no                                  -- 報告書番号
                    , :point_no                                 -- 地点番号
                    , :report_point_name                        -- 報告書用地点名称
                    , :point_order                              -- 順序
                    , CURRENT_TIMESTAMP                         -- 作成日時
                    , :proc_user_id                             -- 作成ユーザ
                    , CURRENT_TIMESTAMP                         -- 更新日時
                    , :proc_user_id                             -- 更新ユーザ
                )
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->selectOne($SQL, $bindValue);
            return $result;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * 報告書固定文言マスタ 更新
     * 
     * @return response 処理結果
     */
    public function duplicateReportText($set_rpt_no, $dup_data)
    {
        try {
            $bindValue = array(
                'report_no'             => $set_rpt_no,                                     // 報告書番号
                'text_cell_name'        => $dup_data->text_cell_name,                       // 固定文言セル名
                'text_renban'           => $dup_data->text_renban,                          // 固定文言連番
                'point_no'              => $dup_data->point_no,                             // 地点番号
                'text_cell_kbn'         => $dup_data->text_cell_kbn,                        // 固定文言区分
                'text_cell_code'        => $dup_data->text_cell_code,                       // 固定文言
                'nendo'                 => $dup_data->nendo,                                // 年度
                'start_valid_date'      => $dup_data->start_valid_date,                     // 有効期間(開始日)
                'end_valid_date'        => $dup_data->end_valid_date,                       // 有効期間(終了日)
                'proc_user_id'          => intval(auth('sanctum')->user()->user_id)         // 実施ユーザーID
            );

            $SQL = <<<SQL
                INSERT INTO m_report_text( 
                    report_no                                   -- 報告書番号
                    , text_cell_name                            -- 固定文言セル名
                    , text_renban                               -- 固定文言連番
                    , point_no                                  -- 地点番号
                    , text_cell_kbn                             -- 固定文言区分
                    , text_cell_code                            -- 固定文言
                    , nendo                                     -- 年度
                    , start_valid_date                          -- 有効期間(開始日)
                    , end_valid_date                            -- 有効期間(終了日)
                    , insert_date                               -- 作成日時
                    , insert_user                               -- 作成ユーザ
                    , update_date                               -- 更新日時
                    , update_user                               -- 更新ユーザ
                ) 
                VALUES ( 
                    :report_no                                  -- 報告書番号
                    , :text_cell_name                           -- 固定文言セル名
                    , :text_renban                              -- 固定文言連番
                    , :point_no                                 -- 地点番号
                    , :text_cell_kbn                            -- 固定文言区分
                    , :text_cell_code                           -- 固定文言
                    , :nendo                                    -- 年度
                    , :start_valid_date                         -- 有効期間(開始日)
                    , :end_valid_date                           -- 有効期間(終了日)
                    , CURRENT_TIMESTAMP                         -- 作成日時
                    , :proc_user_id                             -- 作成ユーザ
                    , CURRENT_TIMESTAMP                         -- 更新日時
                    , :proc_user_id                             -- 更新ユーザ
                )
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->selectOne($SQL, $bindValue);
            return $result;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * 報告書選択メニュー 更新
     * 
     * @return response 処理結果
     */
    public function duplicateReportMenu($set_rpt_no, $setMaxOrder, $dup_data)
    {
        try {
            $bindValue = array(
                'report_parent_menu_no'         => $dup_data->report_parent_menu_no,                // 親メニュー番号
                'affiliation_section_no'        => $dup_data->affiliation_section_no,               // 所属課番号
                'report_no'                     => $set_rpt_no,                                     // 報告書番号
                'report_hierarchy'              => $dup_data->report_hierarchy,                     // 階層
                'report_title'                  => $dup_data->report_title . " - コピー",            // タイトル
                'report_order'                  => $setMaxOrder,                                    // 順序
                'label_flg'                     => $dup_data->label_flg,                            // ラベルフラグ
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)         // 実施ユーザーID
            );

            $SQL = <<<SQL
                INSERT INTO m_report_menu( 
                    report_parent_menu_no                       -- 親メニュー番号
                    , affiliation_section_no                    -- 所属課番号
                    , report_no                                 -- 報告書番号
                    , report_hierarchy                          -- 階層
                    , report_title                              -- タイトル
                    , report_order                              -- 順序
                    , label_flg                                 -- ラベルフラグ
                    , insert_date                               -- 作成日時
                    , insert_user                               -- 作成ユーザ
                    , update_date                               -- 更新日時
                    , update_user                               -- 更新ユーザ
                ) 
                VALUES ( 
                    :report_parent_menu_no                      -- 親メニュー番号
                    , :affiliation_section_no                   -- 所属課番号
                    , :report_no                                -- 報告書番号
                    , :report_hierarchy                         -- 階層
                    , :report_title                             -- タイトル
                    , :report_order                             -- 順序
                    , :label_flg                                -- ラベルフラグ
                    , CURRENT_TIMESTAMP                         -- 作成日時
                    , :proc_user_id                             -- 作成ユーザ
                    , CURRENT_TIMESTAMP                         -- 更新日時
                    , :proc_user_id                             -- 更新ユーザ
                )
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->selectOne($SQL, $bindValue);
            return $result;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * 報告書設定 存在確認
     */
    public function checkConfig($request)
    {
        try {
            // 初期化
            $where = "";
            $bindValue['report_no'] = $request;

            $SQL = <<<SQL
                select
                    report_no
                from
                    m_report_config
                where
                    report_no = :report_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);
            if (count($result) > 0) {
                // 存在するなら使える報告書番号ということ
                return $request;
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * 月報報告書一覧 存在確認
     * 
     */
    public function checkMonthlyReportList($sisetu_no)
    {
        try {
            // 初期化
            $bindValue['sisetu_no'] = $sisetu_no;

            $SQL = <<<SQL
                select
                    *
                from
                    t_monthly_report_list
                where
                    sisetu_no = :sisetu_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            // データ存在確認
            if (count($result) > 0) {
                return $result;
            } else {
                return false;
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /** 報告書選択メニュー 順序取得 */
    public function getRptMenuOrder()
    {
        try {

            $SQL = <<<SQL
                select
                    MAX(report_order) + 10 as max_order
                from
                    m_report_menu
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->selectOne($SQL);
            if ($result !== null) {
                return $result->max_order;
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /** 報告書選択メニュー 階層 */
    public function getRptMenuParentHierarchy($request)
    {
        try {

            $bindValue['report_menu_no'] = $request->input_parent_menu_no;
            $SQL = <<<SQL
                select
                    report_hierarchy
                from
                    m_report_menu
                where
                    report_menu_no = :report_menu_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->selectOne($SQL, $bindValue);
            if ($result !== null) {
                return $result->report_hierarchy;
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /** 報告書選択メニュー 階層 */
    public function getSisetuNo($request)
    {
        try {

            $bindValue['affiliation_section_no'] = $request->affiliation_section_no;
            $SQL = <<<SQL
                select
                    sisetu_no
                from
                    m_affiliation
                where
                    affiliation_section_no = :affiliation_section_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->selectOne($SQL, $bindValue);

            if ($result !== null) {
                return $result->sisetu_no;
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * 報告書選択メニューの排他確認処理
     * 
     * @return response 結果
     */
    public function haitaReportMenu($report_menu_no, $display_time)
    {
        try {
            $bindValue = array(
                'report_menu_no' => $report_menu_no,
                'display_time'  => date('Y-m-d H:i:s', strtotime($display_time)),

            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_report_menu
                    WHERE
                        report_menu_no = :report_menu_no
                        AND update_date <= :display_time
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
     * 報告書構成マスタを取得
     * 
     * @return response 結果
     */
    public function getReportMenuData($report_menu_no)
    {
        try {
            $bindValue = array(
                'report_menu_no' => $report_menu_no,
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_report_menu
                    WHERE
                        report_menu_no = :report_menu_no
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
     * 報告書構成マスタの取得
     * 
     * @return response 結果
     */
    public function getReportConfigData($report_no)
    {
        try {
            $bindValue = array(
                'report_no' => $report_no,
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_report_config
                    WHERE
                        report_no = :report_no
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
     * 報告書項目マスタの取得
     * 
     * @return response 結果
     */
    public function getReportItemData($report_no)
    {
        try {
            $bindValue = array(
                'report_no' => $report_no,
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_report_item
                    WHERE
                        report_no = :report_no
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
     * 報告書地点マスタの取得
     * 
     * @return response 結果
     */
    public function getReporPointData($report_no)
    {
        try {
            $bindValue = array(
                'report_no' => $report_no,
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_report_point
                    WHERE
                        report_no = :report_no
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
     * 報告書固定文言マスタの取得
     * 
     * @return response 結果
     */
    public function getReporTextData($report_no)
    {
        try {
            $bindValue = array(
                'report_no' => $report_no,
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_report_text
                    WHERE
                        report_no = :report_no
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
     * 報告書選択メニューの取得
     * 
     * @return response 結果
     */
    public function getReporMenuData($report_menu_no)
    {
        try {
            $bindValue = array(
                'report_menu_no' => $report_menu_no,
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_report_menu
                    WHERE
                        report_menu_no = :report_menu_no
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
     * 報告書構成マスタの排他確認処理
     * 
     * @return response 結果
     */
    public function haitaReportConfig($report_no, $display_time)
    {
        try {
            $bindValue = array(
                'report_no' => $report_no,
                'display_time'  => date('Y-m-d H:i:s', strtotime($display_time)),

            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_report_config
                    WHERE
                        report_no = :report_no
                        AND update_date <= :display_time
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
     * 報告書項目マスタの排他確認処理
     * 
     * @return response 結果
     */
    public function haitaReportItem($report_no, $display_time)
    {
        try {
            $bindValue = array(
                'report_no' => $report_no,
                'display_time'  => date('Y-m-d H:i:s', strtotime($display_time)),

            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_report_item
                    WHERE
                        report_no = :report_no
                        AND update_date > :display_time
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
     * 報告書地点マスタの排他確認処理
     * 
     * @return response 結果
     */
    public function haitaReportPoint($report_no, $display_time)
    {
        try {
            $bindValue = array(
                'report_no' => $report_no,
                'display_time'  => date('Y-m-d H:i:s', strtotime($display_time)),

            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_report_point
                    WHERE
                        report_no = :report_no
                        AND update_date > :display_time
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
     * 報告書固定文言マスタの排他確認処理
     * 
     * @return response 結果
     */
    public function haitaReportText($report_no, $display_time)
    {
        try {
            $bindValue = array(
                'report_no' => $report_no,
                'display_time'  => date('Y-m-d H:i:s', strtotime($display_time)),

            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_report_text
                    WHERE
                        report_no = :report_no
                        AND update_date > :display_time
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
     * 報告書選択メニュー
     * 
     */
    public function insertReportMenu($request, $report_no, $max_order, $report_hierarchy, $sisetu_no)
    {
        try {

            $bindValue = array(
                'report_parent_menu_no' => $request->input_parent_menu_no,
                // 'affiliation_section_no' => $sisetu_no,
                'affiliation_section_no' => $request->affiliation_section_no,                       // 詳細設計書_共通機能 (4)-8 報告書構成マスタ登録処理によって「画面.構成情報.報告書名称」
                'report_no' => (!$request->report_month && $report_no) ? $report_no : null,         // 画面.構成情報.月報フラグにチェックが付いている場合、NULLを格納
                'report_hierarchy' => (int)$report_hierarchy + 1,
                'report_title' => $request->report_title,
                'report_order' => $max_order,
                'user'  =>  $request->user()->user_id,
            );

            $SQL = <<<SQL
                insert into m_report_menu
                (
                    report_parent_menu_no
                    , affiliation_section_no
                    , report_no
                    , report_hierarchy
                    , report_title
                    , report_order
                    , insert_date
                    , insert_user
                    , update_date
                    , update_user
                )
                values
                (
                    :report_parent_menu_no
                    , :affiliation_section_no
                    , :report_no
                    , :report_hierarchy
                    , :report_title
                    , :report_order
                    , CURRENT_TIMESTAMP
                    , :user
                    , CURRENT_TIMESTAMP
                    , :user
                )
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->insert($SQL, $bindValue);
            return $result;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * 月報報告書一覧 更新
     * 
     * @return response 処理結果
     */
    public function insertMonthlyReportList($sisetu_no, $bindData = null, $valueData = null)
    {
        try {
            $bindValue = array(
                'sisetu_no'             => $sisetu_no,                                      // 施設番号
                'proc_user_id'          => intval(auth('sanctum')->user()->user_id)         // 実施ユーザーID
            );
            $values = <<<SQL
                VALUES ( 
                    :sisetu_no                                  -- 施設番号
                    , null                                      -- 報告書番号
                    , null                                      -- 地点番号
                    , null                                      -- 採水日数
                    , 1                                         -- 順序
                    , null                                      -- 有効期間(開始日)
                    , null                                      -- 有効期間(終了日)
                    , CURRENT_TIMESTAMP                         -- 作成日時
                    , :proc_user_id                             -- 作成ユーザ
                    , CURRENT_TIMESTAMP                         -- 更新日時
                    , :proc_user_id                             -- 更新ユーザ
                )
            SQL;

            if (!is_null($bindData)) {
                $bindValue = $bindData;
                $values = $valueData;
            }

            $SQL = <<<SQL
                INSERT INTO t_monthly_report_list( 
                    sisetu_no                                   -- 施設番号
                    , report_no                                 -- 報告書番号
                    , point_no                                  -- 地点番号
                    , saisui_days                               -- 採水日数
                    , report_list_order                         -- 順序
                    , start_valid_date                          -- 有効期間(開始日)
                    , end_valid_date                            -- 有効期間(終了日)
                    , insert_date                               -- 作成日時
                    , insert_user                               -- 作成ユーザ
                    , update_date                               -- 更新日時
                    , update_user                               -- 更新ユーザ
                ) 
                $values
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->selectOne($SQL, $bindValue);
            return $result;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * 報告書番号を元にした削除処理
     */
    public function deleteDataByReportNo($table, $report_no)
    {
        try {
            $bindValue = array(
                'report_no'     =>  $report_no,
            );

            $SQL = <<<SQL
            delete
            from
                $table
            where
                report_no = :report_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->delete($SQL, $bindValue);
            return $result;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * テンプレートファイル名 登録
     */
    public function registReportFile($report_no, $template_file_name)
    {
        try {
            // 初期化
            $bindValue = array(
                'report_no'     => $report_no,
                'template_file' => $template_file_name,
                'proc_user_id'  => intval(auth('sanctum')->user()->user_id)     // 実施ユーザーID
            );

            $SQL = <<<SQL
                UPDATE m_report_config
                SET
                      template_file = :template_file
                    , update_date   = CURRENT_TIMESTAMP
                    , update_user   = :proc_user_id
                WHERE
                    report_no = :report_no
            SQL;

            DB::connection('suishitsu_db')->update($SQL, $bindValue);
            return true;

        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }
}
