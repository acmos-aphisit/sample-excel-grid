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
 * 検査項目マスタDAO
 *
 */
class Mng030Dao
{
    /**
     * 検査項目マスタを取得
     * 
     * @return response 結果
     */
    public function fetchInspItemData($request)
    {
        try {
            // 検索条件作成
            $sort = "";
            $bindValue = array();

            // ソート条件：デフォルトは整理番号の昇順
            $sort = 'item_dsp_name ASC';

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
                    // 項目大分類番号
                    case 'item_dai_category_name':
                        $sort = 'm_inspection_dai_category.item_dai_category_name';
                        break;
                    // 項目中分類番号
                    case 'item_tyu_category_name':
                        $sort = 'm_inspection_tyu_category.item_tyu_category_name';
                        break;
                    // コメント
                    case 'inspection_item_comment':
                        $sort = 'm_inspection_item.inspection_item_comment';
                        break;
                    default:
                        break;
                }

                $sort = $sort . ' ' .  $sort_order;
            }

            $SQL = <<<SQL
                    SELECT
                        m_inspection_item.item_no                                     -- 項目番号
                        , m_inspection_item.item_dsp_name                             -- 項目名称画面
                        , m_inspection_item.item_report_name                          -- 項目名称報告書
                        , m_inspection_item.item_unit                                 -- 単位
                        , m_inspection_item.constant_qualitative_flg                  -- 定量定性識別フラグ
                        , CASE WHEN m_inspection_item.constant_qualitative_flg = 1 THEN '定量'
                                ELSE '定性'
                          END AS constant_qualitative_name
                        
                        , m_inspection_item.input_type                                -- 入力タイプ
                        , CASE WHEN m_inspection_item.input_type = 1 THEN 'テキストボックス'
                                WHEN m_inspection_item.input_type = 2 THEN 'セレクトボックス'
                                WHEN m_inspection_item.input_type = 3 THEN '日付'
                                WHEN m_inspection_item.input_type = 4 THEN '時刻'
                                ELSE 'テキストエリア'
                          END AS input_type_name
                        , m_inspection_item.item_dai_category_no                      -- 項目大分類番号
                        , m_inspection_item.item_tyu_category_no                      -- 項目中分類番号
                        , m_inspection_dai_category.item_dai_category_name            -- 項目大分類名称
                        , m_inspection_tyu_category.item_tyu_category_name            -- 項目大中類名称
                        , m_inspection_item.inspection_item_comment                   -- コメント
                    FROM
                        m_inspection_item 
                        LEFT JOIN m_inspection_dai_category
                            ON m_inspection_item.item_dai_category_no = m_inspection_dai_category.item_dai_category_no
                        LEFT JOIN m_inspection_tyu_category
                            ON m_inspection_item.item_tyu_category_no = m_inspection_tyu_category.item_tyu_category_no
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
     * 検査項目マスタデータを取得 (最大の値)
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
    public function checkInspectionDataBefore($display_time)
    {
        try {
            $bindValue = array(
                'display_time' => $display_time,
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_inspection_item
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
     * 検査項目マスタ削除処理
     *
     * 
     * @return response 処理結果
     */
    public function deleteInspectionData($inspection_data)
    {
        try {
            foreach ($inspection_data as $value) {
                // 検索条件作成
                $DeleteBindValue = array(
                    'item_no' => $value->itemNo
                );

                // 登録データの削除
                $DelSQL = <<<SQL
                    DELETE
                    FROM 
                        m_inspection_item
                    WHERE
                        item_no = :item_no
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
     * 検査項目マスタを新規登録
     *
     * 
     * @return response 処理結果
     */
    public function insertInspectionData($inspection_data)
    {
        try {
            foreach ($inspection_data as $value) {
                $bindValue = array(
                    'item_no'                       => $value->itemNo,                              // 項目番号
                    'item_dsp_name'                 => $value->itemDspName,                         // 項目名称画面
                    'item_report_name'              => $value->itemReportName,                      // 項目名称報告書
                    'item_unit'                     => $value->itemUnit,                            // 単位
                    'constant_qualitative_flg'      => $value->constantQualitativeFlg,              // 定量定性識別フラグ
                    'input_type'                    => $value->inputType,                           // 入力タイプ
                    'item_dai_category_no'          => $value->itemDaiCategoryNo,                   // 項目大分類番号
                    'item_tyu_category_no'          => $value->itemTyuCategoryNo,                   // 項目中分類番号
                    'inspection_item_comment'       => $value->inspectionItemComment,               // コメント
                    'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)     // 実施ユーザーID
                );

                $SQL = <<<SQL
                    INSERT INTO m_inspection_item( 
                        item_no                                     -- 項目番号
                        , item_dsp_name                             -- 項目名称画面
                        , item_report_name                          -- 項目名称報告書
                        , item_unit                                 -- 単位
                        , constant_qualitative_flg                  -- 定量定性識別フラグ
                        , input_type                                -- 入力タイプ
                        , item_dai_category_no                      -- 項目大分類番号
                        , item_tyu_category_no                      -- 項目中分類番号
                        , inspection_item_comment                   -- コメント
                        , insert_date                               -- 作成日時
                        , insert_user                               -- 作成ユーザ
                        , update_date                               -- 更新日時
                        , update_user                               -- 更新ユーザ
                    ) 
                    VALUES ( 
                        :item_no                                    -- 項目番号
                        , :item_dsp_name                            -- 項目名称画面
                        , :item_report_name                         -- 項目名称報告書
                        , :item_unit                                -- 単位
                        , :constant_qualitative_flg                 -- 定量定性識別フラグ
                        , :input_type                               -- 入力タイプ
                        , :item_dai_category_no                     -- 項目大分類番号
                        , :item_tyu_category_no                     -- 項目中分類番号
                        , :inspection_item_comment                  -- コメント
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
}
