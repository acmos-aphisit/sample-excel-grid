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
 * 報告書設定DAO
 *
 */
class Mng060TempDao
{
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
                    UPDATE public.m_report_menu SET 
                      report_parent_menu_no = :report_parent_menu_no
                      , affiliation_section_no = :affiliation_section_no
                      , report_hierarchy = :report_hierarchy
                      , report_title = :report_title
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
}
