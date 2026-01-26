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
 * ユーザマスタDAO
 *
 */
class Mng010Dao
{
    /**
     * ユーザマスタを取得
     * 
     * @return response 結果
     */
    public function fetchUserData($request)
    {
        try {
            // 検索条件作成
            $sort = "";
            $bindValue = array();

            // ソート条件：デフォルトは整理番号の昇順
            $sort = 'user_no ASC';

            if (!is_null($request['sortColumn'])) {
                $column = $request["sortColumn"];

                $sort_order = 'ASC';
                if (in_array($request["sortOrder"], ['ASC', 'DESC'])) {
                    $sort_order = $request["sortOrder"];
                }

                switch ($column) {
                    // ユーザID
                    case 'user_id':
                        $sort = 'user_id';
                        break;
                    // 氏名
                    case 'user_name':
                        $sort = 'user_name';
                        break;
                    // ふりがな
                    case 'user_furigana':
                        $sort = 'user_furigana';
                        break;
                    // 所属部
                    case 'affiliation_dept':
                        $sort = 'affiliation_dept';
                        break;
                    // 所属課番号
                    case 'affiliation_section_no':
                        $sort = 'affiliation_section_no';
                        break;
                    // 権限
                    case 'security_level':
                        $sort = 'security_level';
                        break;
                    // 確定フラグ
                    case 'fix_flg':
                        $sort = 'fix_flg';
                        break;
                    // 登録年月日
                    case 'regist_date':
                        $sort = 'regist_date';
                        break;
                    // 終了年月日
                    case 'end_date':
                        $sort = 'end_date';
                        break;
                    default:
                        break;
                }

                $sort = $sort . ' ' .  $sort_order;
            }

            $SQL = <<<SQL
                    SELECT
                        user_no                                     -- ユーザNo
                        , user_id                                   -- ユーザID
                        , user_name                                 -- 氏名
                        , user_furigana                             -- ふりがな
                        , affiliation_dept                          -- 所属部
                        , affiliation_section_no                    -- 所属課番号
                        , security_level                            -- 権限
                        , fix_flg                                   -- 確定フラグ
                        , regist_date                               -- 登録年月日
                        , end_date                                  -- 終了年月日
                        , insert_date                               -- 作成日時
                        , insert_user                               -- 作成ユーザ
                        , update_date                               -- 更新日時
                        , update_user                               -- 更新ユーザ
                    FROM
                        m_user 
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
                'user_id'                       => $user_master_data->userId,                                               // ユーザID
                'user_password'                 => Hash::make($user_master_data->userPassword),                             // パスワード
                'user_name'                     => $user_master_data->userName,                                             // 氏名
                'user_furigana'                 => $user_master_data->userFurigana,                                         // ふりがな
                'affiliation_dept'              => $user_master_data->affiliationDept,                                      // 所属部
                'affiliation_section_no'        => strval(sprintf("%02d", $user_master_data->affiliationSectionNo)),        // 所属課番号
                'security_level'                => $user_master_data->securityLevel,                                        // 権限
                'fix_flg'                       => $user_master_data->fixFlg,                                               // 確定フラグ
                'regist_date'                   => $user_master_data->registDate,                                           // 登録年月日
                'end_date'                      => $user_master_data->endDate,                                              // 終了年月日
                'proc_user_id'                  => intval(auth('sanctum')->user()->user_id)                                 // 実施ユーザーID
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
                        , fix_flg                                   -- 確定フラグ
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
                        , :fix_flg                                  -- 確定フラグ
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
                'user_no'                           => $table_list->userNo,                                                      // ユーザNo
                'user_id'                           => $table_list->userId,                                                      // ユーザID
                'user_name'                         => $table_list->userName,                                                    // 氏名
                'user_furigana'                     => $table_list->userFurigana,                                                // ふりがな
                'affiliation_dept'                  => $table_list->affiliationDept,                                             // 所属部
                'affiliation_section_no'            => strval(sprintf("%02d", $table_list->affiliationSectionNo)),               // 所属課番号
                'security_level'                    => $table_list->securityLevel,                                               // 権限
                'fix_flg'                           => $table_list->fixFlg,                                                      // 確定フラグ
                'regist_date'                       => $table_list->registDate,                                                  // 登録年月日
                'end_date'                          => $table_list->endDate,                                                     // 終了年月日
                'proc_user_id'                      => intval(auth('sanctum')->user()->user_id)                                  // 更新ユーザ
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
                        , fix_flg = :fix_flg                                        -- 確定フラグ
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
