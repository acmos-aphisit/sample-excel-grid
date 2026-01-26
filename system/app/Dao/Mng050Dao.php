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
 * 入力画面設定DAO
 *
 */
class Mng050Dao
{
    /**
     * 入力画面情報の表示内容取得
     * 
     * @return response 結果
     */
    public function getSelectedMenu($input_dsp_no)
    {
        try {
            $bindValue = array(
                'input_dsp_no' => $input_dsp_no
            );

            $SQL = <<<SQL
                    SELECT
                        m_input_dsp_config.input_dsp_no
                        , m_input_dsp_config.input_dsp_name
                        , m_input_dsp_config.inspection_kbn_code
                        , m_inspection_kbn.inspection_kbn_name
                        , m_input_dsp_config.point_num
                        , m_input_dsp_config.item_num
                        , m_input_dsp_config.conf_btn_flg
                        , m_input_dsp_config.sheet_title
                    FROM
                        m_input_dsp_config
                        LEFT JOIN m_inspection_kbn
                            ON m_input_dsp_config.inspection_kbn_code = m_inspection_kbn.inspection_kbn_code
                    WHERE
                        m_input_dsp_config.input_dsp_no = :input_dsp_no
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
     * 検査区分をリストで取得
     * 
     * @return response 結果
     */
    public function getInspectionLists()
    {
        try {
            $bindValue = array();

            $SQL = <<<SQL
                    SELECT
                        m_inspection_kbn.inspection_kbn_code
                        , m_inspection_kbn.inspection_kbn_name
                    FROM
                        m_inspection_kbn
                    ORDER BY
                        m_inspection_kbn.inspection_kbn_code ASC
                        
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
     * 順序の取得
     * 
     * @return response 結果
     */
    public function getInputMenuMaxOrder()
    {
        try {
            $bindValue = array();

            $SQL = <<<SQL
                    SELECT
                        MAX(m_input_menu.input_order)
                    FROM
                        m_input_menu
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
    public function getInputMenuHierarchy($parent_no)
    {
        try {
            $bindValue = array(
                'parent_no' => $parent_no
            );

            $SQL = <<<SQL
                    SELECT
                        m_input_menu.input_hierarchy
                    FROM
                        m_input_menu
                    WHERE
                        m_input_menu.input_menu_no = :parent_no
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
     * 参照画面情報の取得
     * 
     * @return response 結果
     */
    public function getInputMenuReference($input_dsp_no)
    {
        try {
            $bindValue = array(
                'input_dsp_no' => $input_dsp_no
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_input_dsp_config
                    WHERE
                        input_dsp_no = :input_dsp_no
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
     * 入力画面構成マスタシーケンスの取得
     * 
     * @return response 結果
     */
    public function getInputMenuReferenceNextVal()
    {
        try {
            $bindValue = array();

            $SQL = <<<SQL
                    SELECT nextval('m_input_dsp_config_input_dsp_no_seq'::regclass) AS input_dsp_no_seq
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
    public function getInputMenuData($input_menu_no)
    {
        try {
            $bindValue = array(
                'input_menu_no' => $input_menu_no,
            );

            $SQL = <<<SQL
                    SELECT
                        m_input_menu.*
                        , m_input_dsp_config.input_dsp_name AS input_dsp_name
                        , m_input_dsp_config.inspection_kbn_code AS inspection_kbn_code
                        , m_input_dsp_config.point_num AS point_num
                        , m_input_dsp_config.item_num AS item_num
                        , m_input_dsp_config.conf_btn_flg AS conf_btn_flg
                        , m_input_dsp_config.sheet_title AS sheet_title
                        , m_inspection_kbn.inspection_kbn_name AS inspection_kbn_name
                    FROM
                        m_input_menu
                    LEFT JOIN
                        m_input_dsp_config AS m_input_dsp_config
                        ON m_input_menu.input_dsp_no = m_input_dsp_config.input_dsp_no
                    LEFT JOIN
                        m_inspection_kbn AS m_inspection_kbn
                        ON m_input_dsp_config.inspection_kbn_code = m_inspection_kbn.inspection_kbn_code
                    WHERE
                        input_menu_no = :input_menu_no
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
    public function haitaInputMenuData($input_menu_no, $display_time)
    {
        try {
            $bindValue = array(
                'input_menu_no' => $input_menu_no,
                'display_time'  => date('Y-m-d H:i:s', strtotime($display_time)),

            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_input_menu
                    WHERE
                        input_menu_no = :input_menu_no
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
     * 入力画面構成情報を検索
     * 
     * @return response 結果
     */
    public function haitaInputMenuDspData($input_dsp_no, $display_time)
    {
        try {
            $bindValue = array(
                'input_dsp_no' => $input_dsp_no,
                'display_time'  => date('Y-m-d H:i:s', strtotime($display_time)),
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_input_dsp_config
                    WHERE
                        input_dsp_no = :input_dsp_no
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
     * 入力画面構成地点マスタを検索
     * 
     * @return response 結果
     */
    public function haitaInputDspPointData($input_dsp_no, $display_time)
    {
        try {
            $bindValue = array(
                'input_dsp_no' => $input_dsp_no,
            );

            $SQL = <<<SQL
                    SELECT
                        MAX(update_date) AS lastes_update_date
                    FROM
                        m_input_dsp_point
                    WHERE
                        input_dsp_no = :input_dsp_no
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
     * 入力画面構成項目マスタを検索
     * 
     * @return response 結果
     */
    public function haitaInputDspItemData($input_dsp_no, $display_time)
    {
        try {
            $bindValue = array(
                'input_dsp_no' => $input_dsp_no,
            );

            $SQL = <<<SQL
                    SELECT
                        MAX(update_date) AS lastes_update_date
                    FROM
                        m_input_dsp_item
                    WHERE
                        input_dsp_no = :input_dsp_no
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
     * 入力マスクNマスタを検索
     * 
     * @return response 結果
     */
    public function haitaInputDspMaskData($input_dsp_no, $display_time)
    {
        try {
            $bindValue = array(
                'input_dsp_no' => $input_dsp_no,
            );

            $SQL = <<<SQL
                    SELECT
                        MAX(update_date) AS lastes_update_date
                    FROM
                        m_input_n_mask
                    WHERE
                        input_dsp_no = :input_dsp_no
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
    public function saveNewMenuLabel($input_parent_menu_no, $affiliation_section_no, $setCurHierarchy, $input_title, $setMaxOrder)
    {
        try {
            $bindValue = array(
                'input_parent_menu_no'          => $input_parent_menu_no,                       // 親メニュー番号
                'affiliation_section_no'        => $affiliation_section_no,                     // 所属課番号
                'input_hierarchy'               => $setCurHierarchy,                            // 階層
                'input_title'                   => $input_title,                                // タイトル
                'input_order'                   => $setMaxOrder,                                // 順序
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)     // 実施ユーザーID
            );

            $SQL = <<<SQL
                INSERT INTO public.m_input_menu(
                    input_parent_menu_no
                    , affiliation_section_no
                    , input_hierarchy
                    , input_title
                    , input_order
                    , label_flg
                    , insert_date
                    , insert_user
                    , update_date
                    , update_user
                )
                VALUES(
                    :input_parent_menu_no
                    , :affiliation_section_no
                    , :input_hierarchy
                    , :input_title
                    , :input_order
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
     * 入力画面メニューを更新
     *
     * 
     * @return response 処理結果
     */
    public function saveUpdateInputMenu($input_menu_no, $input_parent_menu_no, $affiliation_section_no, $input_ref_menu, $setCurHierarchy, $input_title)
    {
        try {
            $bindValue = array(
                'input_menu_no'                 => $input_menu_no,                              // 入力画面番号
                'input_parent_menu_no'          => $input_parent_menu_no,                       // 親メニュー番号
                'affiliation_section_no'        => $affiliation_section_no,                     // 所属課番号
                'input_dsp_no'                  => $input_ref_menu,                                // 入力画面番号
                'input_hierarchy'               => $setCurHierarchy,                            // 階層
                'input_title'                   => $input_title,                                // タイトル
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)     // 実施ユーザーID
            );

            $SQL = <<<SQL
                    UPDATE public.m_input_menu SET 
                      input_parent_menu_no = :input_parent_menu_no
                      , affiliation_section_no = :affiliation_section_no
                      , input_dsp_no = :input_dsp_no
                      , input_hierarchy = :input_hierarchy
                      , input_title = :input_title
                      , update_date = CURRENT_TIMESTAMP
                      , update_user = :proc_user_id
                    WHERE 
                      input_menu_no = :input_menu_no
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
    public function exchangeMenuOrder($input_menu_no, $input_order)
    {
        try {
            $bindValue = array(
                'input_menu_no'                 => $input_menu_no,                              // 入力画面番号
                'input_order'                   => $input_order,                                // 順序
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)     // 実施ユーザーID
            );

            $SQL = <<<SQL
                    UPDATE public.m_input_menu SET 
                      input_order = :input_order
                      , update_date = CURRENT_TIMESTAMP
                      , update_user = :proc_user_id
                    WHERE 
                      input_menu_no = :input_menu_no
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
     * 入力画面メニュー新規登録
     *
     * 
     * @return response 処理結果
     */
    public function saveNewInputMenu($input_parent_menu_no, $affiliation_section_no, $setRefInputMenu, $setCurHierarchy, $input_title, $setMaxOrder)
    {
        try {
            $bindValue = array(
                'input_parent_menu_no'          => $input_parent_menu_no,                       // 親メニュー番号
                'affiliation_section_no'        => $affiliation_section_no,                     // 所属課番号
                'input_dsp_no'                  => $setRefInputMenu,                            // 入力画面番号
                'input_hierarchy'               => $setCurHierarchy,                            // 階層
                'input_title'                   => $input_title,                                // タイトル
                'input_order'                   => $setMaxOrder,                                // 順序
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)     // 実施ユーザーID
            );

            $SQL = <<<SQL
                INSERT INTO public.m_input_menu(
                    input_parent_menu_no
                    , affiliation_section_no
                    , input_dsp_no
                    , input_hierarchy
                    , input_title
                    , input_order
                    , label_flg
                    , insert_date
                    , insert_user
                    , update_date
                    , update_user
                )
                VALUES(
                    :input_parent_menu_no
                    , :affiliation_section_no
                    , :input_dsp_no
                    , :input_hierarchy
                    , :input_title
                    , :input_order
                    , 0
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
     * 入力画面構成マスタ登録
     *
     * 
     * @return response 処理結果
     */
    public function saveNewDspConfig($setRefInputMenu, $input_dsp_name)
    {
        try {
            $bindValue = array(
                'input_dsp_no'                  => $setRefInputMenu,                            // 入力画面番号
                'input_dsp_name'                => $input_dsp_name,                             // タイトル
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)     // 実施ユーザーID
            );

            $SQL = <<<SQL
                INSERT INTO public.m_input_dsp_config(
                    input_dsp_no
                    , input_dsp_name
                    , insert_date
                    , insert_user
                    , update_date
                    , update_user
                )
                VALUES(
                    :input_dsp_no
                    , :input_dsp_name
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
     * 入力画面構成マスタ複製
     *
     * 
     * @return response 処理結果
     */
    public function duplicateDspConfig($inputDspNo, $dupData)
    {
        try {
            $bindValue = array(
                'input_dsp_no'                  => $inputDspNo,                                                                             // 入力画面番号
                'input_dsp_name'                => "XXXXX" . "（" . $dupData->inspection_kbn_name . "）",                                   // 入力画面名称
                'inspection_kbn_code'           => $dupData->inspection_kbn_code,                                                           // 検査区分CD
                'point_num'                     => $dupData->point_num,                                                                     // 地点数
                'item_num'                      => $dupData->item_num,                                                                      // 項目数
                'conf_btn_flg'                  => $dupData->conf_btn_flg,                                                                  // 確定ボタンフラグ
                'sheet_title'                  => $dupData->sheet_title,                                                                    // 取込シート名
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)                                                 // 実施ユーザーID
            );

            $SQL = <<<SQL
                INSERT INTO public.m_input_dsp_config(
                    input_dsp_no
                    , input_dsp_name
                    , inspection_kbn_code
                    , point_num
                    , item_num
                    , conf_btn_flg
                    , sheet_title
                    , insert_date
                    , insert_user
                    , update_date
                    , update_user
                )
                VALUES(
                    :input_dsp_no
                    , :input_dsp_name
                    , :inspection_kbn_code
                    , :point_num
                    , :item_num
                    , :conf_btn_flg
                    , :sheet_title
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
     * 入力画面構成地点マスタ複製
     *
     * 
     * @return response 処理結果
     */
    public function duplicateDspPoint($inputDspNo, $dupDspNo)
    {
        try {
            $bindValue = array(
                'input_dsp_no' => $dupDspNo
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_input_dsp_point
                    WHERE
                        input_dsp_no = :input_dsp_no
            SQL;

            $resultForDup = array();
            $resultForDup = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            if (count($resultForDup) > 0) {
                // 地点複製
                foreach ($resultForDup as $value) {
                    // １行ずつ追加
                    try {
                        $bindValue = array(
                            'input_dsp_no'                  => $inputDspNo,                                 // 入力画面番号
                            'point_no'                      => $value->point_no,                            // 地点番号
                            'dsp_order'                     => $value->dsp_order,                           // 表示順序
                            'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)     // 実施ユーザーID
                        );

                        $SQL = <<<SQL
                    INSERT INTO public.m_input_dsp_point(
                        input_dsp_no
                        , point_no
                        , dsp_order
                        , insert_date
                        , insert_user
                        , update_date
                        , update_user
                    )
                    VALUES(
                        :input_dsp_no
                        , :point_no
                        , :dsp_order
                        , CURRENT_TIMESTAMP
                        , :proc_user_id
                        , CURRENT_TIMESTAMP
                        , :proc_user_id
                    )
                SQL;

                        DB::connection('suishitsu_db')->insert($SQL, $bindValue);
                    } catch (\Throwable $e) {
                        Log::error($e->getMessage());
                        Log::error($e->getTraceAsString());
                        return false;
                    }
                }
            }

            return true;
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }

    /**
     * 入力画面構成項目マスタ複製
     *
     * 
     * @return response 処理結果
     */
    public function duplicateDspItem($inputDspNo, $dupDspNo)
    {
        try {
            $bindValue = array(
                'input_dsp_no' => $dupDspNo
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_input_dsp_item
                    WHERE
                        input_dsp_no = :input_dsp_no
            SQL;

            $resultForDup = array();
            $resultForDup = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            // 項目複製
            if (count($resultForDup) > 0) {
                foreach ($resultForDup as $value) {
                    // １行ずつ追加
                    try {
                        $bindValue = array(
                            'input_dsp_no'                  => $inputDspNo,                                 // 入力画面番号
                            'item_no'                       => $value->item_no,                             // 項目番号
                            'dsp_order'                     => $value->dsp_order,                           // 表示順序
                            'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)     // 実施ユーザーID
                        );

                        $SQL = <<<SQL
                    INSERT INTO public.m_input_dsp_item(
                        input_dsp_no
                        , item_no
                        , dsp_order
                        , insert_date
                        , insert_user
                        , update_date
                        , update_user
                    )
                    VALUES(
                        :input_dsp_no
                        , :item_no
                        , :dsp_order
                        , CURRENT_TIMESTAMP
                        , :proc_user_id
                        , CURRENT_TIMESTAMP
                        , :proc_user_id
                    )
                SQL;

                        DB::connection('suishitsu_db')->insert($SQL, $bindValue);
                    } catch (\Throwable $e) {
                        Log::error($e->getMessage());
                        Log::error($e->getTraceAsString());
                        return false;
                    }
                }
            }

            return true;
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }

    /**
     * 入力マスクNマスタ複製
     *
     * 
     * @return response 処理結果
     */
    public function duplicateInputMask($inputDspNo, $dupDspNo)
    {
        try {
            $bindValue = array(
                'input_dsp_no' => $dupDspNo
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_input_n_mask
                    WHERE
                        input_dsp_no = :input_dsp_no
            SQL;

            $resultForDup = array();
            $resultForDup = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            // 入力マスクNマスタ複製
            if (count($resultForDup) > 0) {
                foreach ($resultForDup as $value) {
                    // １行ずつ追加
                    try {
                        $bindValue = array(
                            'input_dsp_no'                  => $inputDspNo,                                 // 入力画面番号
                            'point_no'                      => $value->point_no,                            // 地点番号
                            'item_no'                       => $value->item_no,                             // 項目番号
                            'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)     // 実施ユーザーID
                        );

                        $SQL = <<<SQL
                    INSERT INTO public.m_input_n_mask(
                        input_dsp_no
                        , point_no
                        , item_no
                        , insert_date
                        , insert_user
                        , update_date
                        , update_user
                    )
                    VALUES(
                        :input_dsp_no
                        , :point_no
                        , :item_no
                        , CURRENT_TIMESTAMP
                        , :proc_user_id
                        , CURRENT_TIMESTAMP
                        , :proc_user_id
                    )
                SQL;

                        DB::connection('suishitsu_db')->insert($SQL, $bindValue);
                    } catch (\Throwable $e) {
                        Log::error($e->getMessage());
                        Log::error($e->getTraceAsString());
                        return false;
                    }
                }
            }

            return true;
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }

    /**
     * 入力画面メニュー複製
     *
     * 
     * @return response 処理結果
     */
    public function duplicateInputMenu($inputDspNo, $dupData, $setMaxOrder)
    {
        try {
            $bindValue = array(
                'input_parent_menu_no'          => $dupData->input_parent_menu_no,                  // 親メニュー番号
                'affiliation_section_no'        => $dupData->affiliation_section_no,                // 所属課番号
                'input_dsp_no'                  => $inputDspNo,                                     // 入力画面番号
                'input_hierarchy'               => $dupData->input_hierarchy,                       // 階層
                'input_title'                   => $dupData->input_title . " - コピー",              // タイトル
                'input_order'                   => $setMaxOrder,                                    // 順序
                'label_flg'                     => $dupData->label_flg,                             // ラベルフラグ
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)         // 実施ユーザーID
            );

            $SQL = <<<SQL
                INSERT INTO public.m_input_menu(
                    input_parent_menu_no
                    , affiliation_section_no
                    , input_dsp_no
                    , input_hierarchy
                    , input_title
                    , input_order
                    , label_flg
                    , insert_date
                    , insert_user
                    , update_date
                    , update_user
                )
                VALUES(
                    :input_parent_menu_no
                    , :affiliation_section_no
                    , :input_dsp_no
                    , :input_hierarchy
                    , :input_title
                    , :input_order
                    , :label_flg
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
     * 入力画面構成マスタ登録
     *
     * 
     * @return response 処理結果
     */
    public function deleteInputMenu($input_menu_no, $input_dsp_no)
    {
        try {
            // 入力画面メニューを削除
            try {
                $DeleteBindValue = array(
                    'input_menu_no'                          => $input_menu_no,
                );

                // 登録データの削除
                $DelSQL = <<<SQL
                    DELETE FROM m_input_menu
                    WHERE
                        input_menu_no = :input_menu_no
                SQL;

                // 検査情報データ 削除
                DB::connection('suishitsu_db')->delete($DelSQL, $DeleteBindValue);
            } catch (\Throwable $e) {
                Log::error($e->getMessage());
                Log::error($e->getTraceAsString());
                return false;
            }

            //  画面構成系を削除
            // if ($input_dsp_no) {
            //     // 入力画面構成マスタを削除
            //     try {
            //         $DeleteBindValue = array(
            //             'input_dsp_no'                          => $input_dsp_no,
            //         );

            //         // 登録データの削除
            //         $DelSQL = <<<SQL
            //         DELETE FROM m_input_dsp_config
            //         WHERE
            //             input_dsp_no = :input_dsp_no
            //     SQL;

            //         // 検査情報データ 削除
            //         DB::connection('suishitsu_db')->delete($DelSQL, $DeleteBindValue);
            //     } catch (\Throwable $e) {
            //         Log::error($e->getMessage());
            //         Log::error($e->getTraceAsString());
            //         return false;
            //     }

            //     // 入力画面構成地点マスタを削除
            //     try {
            //         $DeleteBindValue = array(
            //             'input_dsp_no'                          => $input_dsp_no,
            //         );

            //         // 登録データの削除
            //         $DelSQL = <<<SQL
            //         DELETE FROM m_input_dsp_point
            //         WHERE
            //             input_dsp_no = :input_dsp_no
            //     SQL;

            //         // 検査情報データを削除
            //         DB::connection('suishitsu_db')->delete($DelSQL, $DeleteBindValue);
            //     } catch (\Throwable $e) {
            //         Log::error($e->getMessage());
            //         Log::error($e->getTraceAsString());
            //         return false;
            //     }

            //     // 入力画面構成項目マスタを削除
            //     try {
            //         $DeleteBindValue = array(
            //             'input_dsp_no'                          => $input_dsp_no,
            //         );

            //         // 登録データの削除
            //         $DelSQL = <<<SQL
            //         DELETE FROM m_input_dsp_item
            //         WHERE
            //             input_dsp_no = :input_dsp_no
            //     SQL;

            //         // 検査情報データ 削除
            //         DB::connection('suishitsu_db')->delete($DelSQL, $DeleteBindValue);
            //     } catch (\Throwable $e) {
            //         Log::error($e->getMessage());
            //         Log::error($e->getTraceAsString());
            //         return false;
            //     }

            //     // 入力マスクNマスタを削除
            //     try {
            //         $DeleteBindValue = array(
            //             'input_dsp_no'                          => $input_dsp_no,
            //         );

            //         // 登録データの削除
            //         $DelSQL = <<<SQL
            //         DELETE FROM m_input_n_mask
            //         WHERE
            //             input_dsp_no = :input_dsp_no
            //     SQL;

            //         // 検査情報データ 削除
            //         DB::connection('suishitsu_db')->delete($DelSQL, $DeleteBindValue);
            //     } catch (\Throwable $e) {
            //         Log::error($e->getMessage());
            //         Log::error($e->getTraceAsString());
            //         return false;
            //     }
            // }


            return true;
        } catch (\Throwable $e) {
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
        try {
            $bindValue = array(
                'input_dsp_no' => $request->input_dsp_no
            );

            $SQL = <<<SQL
                    SELECT
                        m_input_dsp_point.point_no
                        , m_input_dsp_point.dsp_order as point_order
                        , m_saisui_point.point_dsp_name as point_name
                        , m_saisui_point.saisui_kbn_no as point_kbn
                        , m_saisui_point.process_no
                    FROM
                        m_input_dsp_point
                        INNER JOIN m_saisui_point
                            ON m_input_dsp_point.point_no = m_saisui_point.point_no
                    WHERE
                        m_input_dsp_point.input_dsp_no = :input_dsp_no
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
     * 検査情報の項目を取得
     * 
     * @return response 結果
     */
    public function fetchInputItems($request)
    {
        // DB::beginTransaction();
        try {
            $bindValue = array(
                'input_dsp_no' => $request->input_dsp_no
            );

            $SQL = <<<SQL
                    SELECT
                        m_input_dsp_item.item_no
                        , m_input_dsp_item.dsp_order as item_order
                        , m_inspection_item.item_dsp_name as item_name
                        , m_inspection_item.item_report_name as item_report_name
                        , m_inspection_item.constant_qualitative_flg
                        , m_inspection_item.input_type as input_type
                        , null as select_list
                    FROM
                        m_input_dsp_item
                        INNER JOIN m_inspection_item
                            ON m_input_dsp_item.item_no = m_inspection_item.item_no
                    WHERE
                        m_input_dsp_item.input_dsp_no = :input_dsp_no
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
     * 検査情報の項目を取得_初期化項目[1,2]
     * 
     * @return response 結果
     */
    public function fetchInputInitItems($request)
    {
        try {
            $bindValue = array();

            $SQL = <<<SQL
                    SELECT
                        m_inspection_item.item_no
                        , m_inspection_item.item_no as item_order
                        , m_inspection_item.item_dsp_name as item_name
                        , m_inspection_item.item_report_name as item_report_name
                        , m_inspection_item.constant_qualitative_flg
                        , m_inspection_item.input_type as input_type
                        , null as select_list
                    FROM
                        m_inspection_item
                    WHERE
                        m_inspection_item.item_no IN (1,2)
                    ORDER BY item_no ASC
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
     * 検査情報の入力マスクデータを取得
     * 
     * @return response 結果
     */
    public function fetchInputMask($request, $item_filters, $point_filters)
    {
        try {
            $bindValue = array(
                'input_dsp_no' => $request->input_dsp_no
            );

            $SQL = <<<SQL
                    SELECT
                        m_input_n_mask.point_no
                        , m_input_n_mask.item_no
                    FROM
                        m_input_n_mask
                    WHERE
                        m_input_n_mask.input_dsp_no = :input_dsp_no
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
     * 採水地点マスタデータを取得
     * 
     * @return response 結果
     */
    public function fetchSelectionPoint()
    {
        try {
            $bindValue = array();

            $SQL = <<<SQL
                    SELECT
                        point_no AS value
                        , point_dsp_name AS label
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
     * 検索項目マスタを取得
     * 
     * @return response 結果
     */
    public function searchInspItem($request)
    {
        try {
            Log::info($request);

            // 検索条件作成
            $where = "1 = 1";
            $sort = "";
            $bindValue = array();

            // 検査項目番号
            if (!is_null($request['inspItemNo'])) {
                $where .= " AND m_inspection_item.item_no = :item_no";
                $bindValue['item_no'] = $request['inspItemNo'];
            }

            // 項目名称画面
            if (!is_null($request['inspItemDspName'])) {
                $where .= " AND m_inspection_item.item_dsp_name like ('%' || :item_dsp_name || '%') ";
                $bindValue['item_dsp_name'] = $request['inspItemDspName'];
            }

            // 項目大分類番号
            if (!is_null($request['inspItemDaiCateName'])) {
                $where .= " AND m_inspection_item.item_dai_category_no = :item_dai_category_no";
                $bindValue['item_dai_category_no'] = $request['inspItemDaiCateName'];
            }

            // 項目中分類番号
            if (!is_null($request['inspItemTyuCateName'])) {
                $where .= " AND m_inspection_item.item_tyu_category_no = :item_tyu_category_no";
                $bindValue['item_tyu_category_no'] = $request['inspItemTyuCateName'];
            }

            // ソート条件：デフォルトは整理番号の昇順
            $sort = 'm_inspection_item.item_no asc';

            if (!is_null($request['sortColumn'])) {
                $column = $request["sortColumn"];

                $sort_order = 'ASC';
                if (in_array($request["sortOrder"], ['ASC', 'DESC'])) {
                    $sort_order = $request["sortOrder"];
                }

                switch ($column) {
                    // 項目番号
                    case 'item_no':
                        $sort = 'm_inspection_item.item_no';
                        break;
                    // 項目名称画面
                    case 'item_dsp_name':
                        $sort = 'm_inspection_item.item_dsp_name';
                        break;
                    // 項目名称報告書
                    case 'item_report_name':
                        $sort = 'm_inspection_item.item_report_name';
                        break;
                    // 単位
                    case 'item_unit':
                        $sort = 'm_inspection_item.item_unit';
                        break;
                    // 定量定性識別フラグ
                    case 'constant_qualitative_flg':
                        $sort = 'm_inspection_item.constant_qualitative_flg';
                        break;
                    // 入力タイプ
                    case 'input_type':
                        $sort = 'm_inspection_item.input_type';
                        break;
                    // 項目大分類名称
                    case 'item_dai_category_name':
                        $sort = 'm_inspection_dai_category.item_dai_category_name';
                        break;
                    // 項目中分類名称
                    case 'item_tyu_category_name':
                        $sort = 'm_inspection_tyu_category.item_tyu_category_name';
                        break;
                    default:
                        break;
                }

                $sort = $sort . ' ' .  $sort_order;
            }

            $SQL = <<<SQL
                    SELECT
                        m_inspection_item.item_no
                        , m_inspection_item.item_dsp_name
                        , m_inspection_item.item_report_name
                        , m_inspection_item.item_unit
                        , m_inspection_item.constant_qualitative_flg
                        , m_inspection_item.input_type
                        , m_inspection_item.item_dai_category_no
                        , m_inspection_dai_category.item_dai_category_name
                        , m_inspection_item.item_tyu_category_no
                        , m_inspection_tyu_category.item_tyu_category_name
                    FROM
                        m_inspection_item
                    LEFT JOIN
                        m_inspection_dai_category AS m_inspection_dai_category
                        ON m_inspection_item.item_dai_category_no = m_inspection_dai_category.item_dai_category_no
                    LEFT JOIN
                        m_inspection_tyu_category AS m_inspection_tyu_category
                        ON m_inspection_item.item_tyu_category_no = m_inspection_tyu_category.item_tyu_category_no
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
    public function checkInputMenuDataBefore($dsp_config_data)
    {
        try {
            $bindValue = array(
                'input_dsp_no' => $dsp_config_data->input_dsp_no,
            );

            $SQL = <<<SQL
                    SELECT
                        to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') AS update_date
                    FROM
                        m_input_menu
                    WHERE
                        input_dsp_no = :input_dsp_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

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
     * 入力画面メニューを削除
     *
     * 
     * @return response 処理結果
     */
    public function deleteInputMenuData($dsp_config_data)
    {
        try {
            $DeleteBindValue = array(
                'input_dsp_no' => $dsp_config_data->input_dsp_no,
            );

            // 登録データの削除
            $DelSQL = <<<SQL
              DELETE FROM m_input_menu
              WHERE
                  input_dsp_no = :input_dsp_no
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
     * 存在するデータを確認
     * 
     * @return response 結果
     */
    public function checkDspConfigDataBefore($dsp_config_data)
    {
        try {
            $bindValue = array(
                'input_dsp_no' => $dsp_config_data->input_dsp_no,
            );

            $SQL = <<<SQL
                    SELECT
                        to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') AS update_date
                    FROM
                        m_input_dsp_config
                    WHERE
                        input_dsp_no = :input_dsp_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

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
     * 入力画面構成マスタ更新処理
     *
     * 
     * @return response 処理結果
     */
    public function updateDspConfigData($dsp_config_data)
    {
        try {
            // 検査区分CDに存在を確認
            $inspectionKbnBindValue = [
                'inspection_kbn_code' => $dsp_config_data->inspection_kbn_code,
            ];

            $inspectionKbnSql = <<<SQL
                                    SELECT
                                        inspection_kbn_code
                                    FROM
                                        m_inspection_kbn
                                    WHERE
                                        inspection_kbn_code = :inspection_kbn_code
            SQL;

            $inspection_kbn_code = DB::selectOne($inspectionKbnSql, $inspectionKbnBindValue);

            if (!$inspection_kbn_code) {
                return config('const.UPDATE_UPDATED_MASTER_ERROR');
            }

            $bindValue = array(
                'input_dsp_no'                      => $dsp_config_data->input_dsp_no,              // 入力画面番号
                'input_dsp_name'                    => $dsp_config_data->input_dsp_name,            // 入力画面名称
                'inspection_kbn_code'               => $dsp_config_data->inspection_kbn_code,       // 検査区分CD
                'point_num'                         => $dsp_config_data->point_num,                 // 地点数
                'item_num'                          => $dsp_config_data->item_num,                  // 項目数
                'conf_btn_flg'                      => $dsp_config_data->conf_btn_flg,              // 確定ボタンフラグ
                'sheet_title'                       => $dsp_config_data->sheet_title,               // 取込シート名
                'proc_user_id'                      => intval(auth('sanctum')->user()->user_id)     // 実施ユーザーID
            );

            $SQL = <<<SQL
                    UPDATE m_input_dsp_config SET 
                    input_dsp_name = :input_dsp_name
                    , inspection_kbn_code = :inspection_kbn_code
                    , point_num = :point_num
                    , item_num = :item_num
                    , conf_btn_flg = :conf_btn_flg
                    , sheet_title = :sheet_title
                    , update_date = CURRENT_TIMESTAMP
                    , update_user = :proc_user_id
                    WHERE 
                      input_dsp_no = :input_dsp_no
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
     * 入力画面構成マスタを削除
     *
     * 
     * @return response 処理結果
     */
    public function deleteDspConfigData($dsp_config_data)
    {
        try {
            $DeleteBindValue = array(
                'input_dsp_no' => $dsp_config_data->input_dsp_no,
            );

            // 登録データの削除
            $DelSQL = <<<SQL
              DELETE FROM m_input_dsp_config
              WHERE
                  input_dsp_no = :input_dsp_no
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
     * 存在するデータを確認
     * 
     * @return response 結果
     */
    public function checkDspPointDataBefore($dsp_config_data)
    {
        try {
            $bindValue = array(
                'input_dsp_no' => $dsp_config_data->input_dsp_no,
            );

            $SQL = <<<SQL
                    SELECT
                        to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') AS update_date
                    FROM
                        m_input_dsp_point
                    WHERE
                        input_dsp_no = :input_dsp_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

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
     * 入力画面構成地点マスタを削除
     *
     * 
     * @return response 処理結果
     */
    public function deleteDspPointData($dsp_config_data)
    {
        try {
            $DeleteBindValue = array(
                'input_dsp_no' => $dsp_config_data->input_dsp_no,
            );

            // 登録データの削除
            $DelSQL = <<<SQL
              DELETE FROM m_input_dsp_point
              WHERE
                  input_dsp_no = :input_dsp_no
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
     * 入力画面構成地点マスタを新規登録
     *
     * 
     * @return response 処理結果
     */
    public function insertDspPointData($dsp_point_data)
    {
        try {
            // 地点番号に存在を確認
            $pointBindValue = [
                'point_no' => $dsp_point_data->point_no,
            ];

            $pointSql = <<<SQL
                                    SELECT
                                        point_no
                                    FROM
                                        m_saisui_point
                                    WHERE
                                        point_no = :point_no
            SQL;

            $point_no = DB::selectOne($pointSql, $pointBindValue);

            if (!$point_no) {
                return config('const.UPDATE_UPDATED_MASTER_ERROR');
            }

            $bindValue = array(
                'input_dsp_no'                      => $dsp_point_data->input_dsp_no,                       // 入力画面番号
                'point_no'                          => $dsp_point_data->point_no,                           // 地点番号
                'dsp_order'                         => $dsp_point_data->dsp_order,                          // 表示順序
                'proc_user_id'                      => intval(auth('sanctum')->user()->user_id)             // 実施ユーザーID
            );

            $SQL = <<<SQL
                INSERT INTO m_input_dsp_point (
                    input_dsp_no
                    , point_no
                    , dsp_order
                    , insert_date
                    , insert_user
                    , update_date
                    , update_user)
                VALUES(
                    :input_dsp_no
                    , :point_no
                    , :dsp_order
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
     * 存在するデータを確認
     * 
     * @return response 結果
     */
    public function checkDspItemDataBefore($dsp_config_data)
    {
        try {
            $bindValue = array(
                'input_dsp_no' => $dsp_config_data->input_dsp_no,
            );

            $SQL = <<<SQL
                    SELECT
                        to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') AS update_date
                    FROM
                        m_input_dsp_item
                    WHERE
                        input_dsp_no = :input_dsp_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

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
     * 入力画面構成項目マスタを削除
     *
     * 
     * @return response 処理結果
     */
    public function deleteDspItemData($dsp_config_data)
    {
        try {
            $DeleteBindValue = array(
                'input_dsp_no' => $dsp_config_data->input_dsp_no,
            );

            // 登録データの削除
            $DelSQL = <<<SQL
              DELETE FROM m_input_dsp_item
              WHERE
                  input_dsp_no = :input_dsp_no
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
     * 入力画面構項目マスタを新規登録
     *
     * 
     * @return response 処理結果
     */
    public function insertDspItemData($dsp_item_data)
    {
        try {
            // 項目番号に存在を確認
            $itemBindValue = [
                'item_no' => $dsp_item_data->item_no,
            ];

            $itemSql = <<<SQL
                                    SELECT
                                        item_no
                                    FROM
                                        m_inspection_item
                                    WHERE
                                        item_no = :item_no
            SQL;

            $item_no = DB::selectOne($itemSql, $itemBindValue);

            if (!$item_no) {
                return config('const.UPDATE_UPDATED_MASTER_ERROR');
            }
            $bindValue = array(
                'input_dsp_no'                      => $dsp_item_data->input_dsp_no,                       // 入力画面番号
                'item_no'                           => $dsp_item_data->item_no,                            // 項目番号
                'dsp_order'                         => $dsp_item_data->dsp_order,                          // 表示順序
                'proc_user_id'                      => intval(auth('sanctum')->user()->user_id)             // 実施ユーザーID
            );

            $SQL = <<<SQL
                INSERT INTO m_input_dsp_item (
                    input_dsp_no
                    , item_no
                    , dsp_order
                    , insert_date
                    , insert_user
                    , update_date
                    , update_user)
                VALUES(
                    :input_dsp_no
                    , :item_no
                    , :dsp_order
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
     * 存在するデータを確認
     * 
     * @return response 結果
     */
    public function checkDspMaskDataBefore($dsp_config_data)
    {
        try {
            $bindValue = array(
                'input_dsp_no' => $dsp_config_data->input_dsp_no,
            );

            $SQL = <<<SQL
                    SELECT
                        to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') AS update_date
                    FROM
                        m_input_n_mask
                    WHERE
                        input_dsp_no = :input_dsp_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

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
     * 入力マスクNマスタを削除
     *
     * 
     * @return response 処理結果
     */
    public function deleteDspMaskData($dsp_config_data)
    {
        try {
            $DeleteBindValue = array(
                'input_dsp_no' => $dsp_config_data->input_dsp_no,
            );

            // 登録データの削除
            $DelSQL = <<<SQL
              DELETE FROM m_input_n_mask
              WHERE
                  input_dsp_no = :input_dsp_no
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
     * 入力画面構項目マスタを新規登録
     *
     * 
     * @return response 処理結果
     */
    public function insertDspMaskData($dsp_point_data)
    {
        try {
            $bindValue = array(
                'input_dsp_no'                      => $dsp_point_data->input_dsp_no,                       // 入力画面番号
                'point_no'                          => $dsp_point_data->point_no,                           // 地点番号
                'item_no'                           => $dsp_point_data->item_no,                            // 項目番号
                'proc_user_id'                      => intval(auth('sanctum')->user()->user_id)             // 実施ユーザーID
            );

            $SQL = <<<SQL
                INSERT INTO m_input_n_mask (
                    input_dsp_no
                    , point_no
                    , item_no
                    , insert_date
                    , insert_user
                    , update_date
                    , update_user)
                VALUES(
                    :input_dsp_no
                    , :point_no
                    , :item_no
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
}
