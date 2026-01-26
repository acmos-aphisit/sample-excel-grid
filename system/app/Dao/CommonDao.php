<?php

namespace App\Dao;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Hash;
use stdClass;

/**
 * 汎用Dao
 *
 */
class CommonDao
{
    /**
     *
     */
    public function migrateCsvToDb($request)
    {
        try {
            //トランザクション開始
            DB::connection('suishitsu_db')->beginTransaction();

            if ($request->table_name == 'all_table') {
                $table_list = array(
                    'm_sisetu',                         // 施設マスタ
                    'm_affiliation',                    // 所属課マスタ
                    'm_user',                           // ユーザ定義
                    'm_input_dsp_config',               // 入力画面構成マスタ
                    'm_input_dsp_point',                // 入力画面構成地点マスタ
                    'm_input_dsp_item',                 // 入力画面構成項目マスタ
                    'm_input_menu',                     // 入力画面メニュー
                    'm_input_n_mask',                   // 入力マスクNマスタ
                    'm_report_config',                  // 報告書構成マスタ
                    'm_report_point',                   // 報告書地点マスタ
                    'm_report_item',                    // 報告書項目マスタ
                    'm_report_menu',                    // 報告書選択メニュー
                    'm_saisui_point',                   // 採水地点マスタ
                    'm_saisui_kbn',                     // 採水区分マスタ
                    'm_process',                        // 処理過程マスタ
                    'm_inspection_item',                // 検査項目マスタ
                    'm_inspection_kbn',                 // 検査区分マスタ
                    'm_inspection_dai_category',        // 検査項目大分類マスタ
                    'm_inspection_tyu_category',        // 検査項目中分類マスタ
                    'm_selection',                      // 選択肢マスタ
                    'm_inspection_criteria',            // 検査基準マスタ
                    't_inspection_result',              // 検査結果
                    'm_report_text',                    // 報告書固定文言マスタ
                    't_monthly_report_list',            // 月報報告書一覧
                    't_input_fixed_date',               // 入力データ確定日
                    'm_statistics'                      // 統計値マスタ
                );

                foreach ($table_list as $table_name) {
                    // テーブル名を指定
                    $main_table_name = $table_name;

                    // 一時的のテーブル名を設定
                    $temp_table_name = 'tmp_' . $main_table_name . '_' . time();

                    // SQLステートメントを指定
                    $statement_array = $this->setStatementText($main_table_name, $temp_table_name);
                    if (empty((array)$statement_array)) {
                        return false;
                    }

                    if ($main_table_name != 'm_inspection_criteria') {
                        // CSVファイルパスを指定
                        $file_path = $statement_array->file_path;

                        // 一時的のテーブルを生成
                        DB::statement($statement_array->statement_temp);

                        // 一時的のテーブルにCSVファイルのデータを移行
                        DB::statement(
                            "COPY $temp_table_name FROM '{$file_path}' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')"
                        );
                    }

                    // 全件削除
                    DB::statement(
                        "DELETE
                            FROM $main_table_name
                        "
                    );

                    // 全件新規追加
                    DB::statement($statement_array->statement_main);
                }
            } else {
                // テーブル名を指定
                $main_table_name = $request->table_name;

                // 一時的のテーブル名を設定
                $temp_table_name = 'tmp_' . $main_table_name . '_' . time();

                // SQLステートメントを指定
                $statement_array = $this->setStatementText($main_table_name, $temp_table_name);
                if (empty((array)$statement_array)) {
                    return false;
                }

                if ($main_table_name != 'm_inspection_criteria') {
                    // CSVファイルパスを指定
                    $file_path = $statement_array->file_path;

                    // 一時的のテーブルを生成
                    DB::statement($statement_array->statement_temp);

                    // 一時的のテーブルにCSVファイルのデータを移行
                    DB::statement(
                        "COPY $temp_table_name FROM '{$file_path}' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')"
                    );
                }

                // 全件削除
                DB::statement(
                    "DELETE
                        FROM $main_table_name
                    "
                );

                // 全件新規追加
                DB::statement($statement_array->statement_main);
            }

            // トランザクションコミット
            DB::connection('suishitsu_db')->commit();

            return true;
        } catch (QueryException $e) {
            DB::connection('suishitsu_db')->rollback();
            Log::error($e);

            return false;
        }
    }

    private function setStatementText($table_name, $temp_table_name)
    {
        $statement_text = new stdClass();
        // $statement_text->file_path = storage_path() . '\app\public\db_csv_data\\' . $table_name . '.csv';
        $statement_text->file_path = 'C:\\tmp\\' . $table_name . '.csv';
        $ikou_user = 999999;

        // リプレース前の文字列とリプレース後の文字列を設定
        $str_before_replace = 'ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ０１２３４５６７８９（）';
        $str_after_replace = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789()';

        switch ($table_name) {
            case 'm_user':
                // ユーザ定義_【m_user】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            user_id integer
                            , user_name character varying(50)
                            , kana character varying(50)
                            , affiliation_dept character varying(50)
                            , affiliation_section character varying(50)
                            , security_level integer
                            , regist_date timestamp(6) without time zone
                            , end_date timestamp(6) without time zone
                            , login_status integer
                            , user_password character varying(50)
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (user_id,
                        user_password,
                        user_name,
                        user_furigana,
                        affiliation_dept,
                        affiliation_section_no,
                        security_level,
                        regist_date,
                        end_date,
                        fix_flg,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        A.user_id as user_id,
                        A.user_password as user_password,
                        A.user_name as user_name,
                        A.kana as user_furigana,
                        A.affiliation_dept as affiliation_dept,
                        B.affiliation_section_no as affiliation_section_no,
                        CASE A.security_level
                            WHEN '0' THEN '1'
                            WHEN '1' THEN '0'
                            ELSE A.security_level
                        END as security_level,
                        A.regist_date as regist_date,
                        A.end_date as end_date,
                        0 as fix_flg,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name} A
                    LEFT JOIN m_affiliation B
                        ON A.affiliation_section = B.affiliation_section
                ";
                break;
            case 'm_affiliation':
                // 所属課マスタ_【m_affiliation】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            affiliation_section_no character varying(50)
                            , affiliation_section character varying(50)
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (affiliation_section_no,
                        affiliation_section,
                        sisetu_no,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        A.affiliation_section_no as affiliation_section_no,
                        A.affiliation_section as affiliation_section,
                        B.sisetu_no,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name} A
                    LEFT JOIN m_sisetu B
                     ON A.affiliation_section = B.sisetu_name
                ";

                break;
            case 'm_input_menu':
                // 入力画面メニュー_【m_input_menu】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            url character varying(50)
                            , title character varying(50)
                            , oya character varying(50)
                            , kubun character varying(50)
                            , input_menu_group character varying(50)
                            , input_menu_order integer
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (input_menu_no,
                        input_parent_menu_no,
                        affiliation_section_no,
                        input_dsp_no,
                        input_hierarchy,
                        input_title,
                        input_order,
                        label_flg,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT DISTINCT
                        A.input_menu_no,
                        CASE
                            WHEN A.url = '検査結果入力' THEN 1
                            WHEN A.title = '汚泥検査' THEN 1
                            WHEN A.title = '最終処分場' THEN 1
                            WHEN A.title = '最終処分場検査' THEN 1
                            ELSE D1.input_menu_no
                        END as input_parent_menu_no,
                        F.affiliation_section_no as affiliation_section_no,
                        B.input_dsp_no as input_dsp_no,
                        CASE
                            WHEN A.url = A.oya THEN 1
                            WHEN D4.url IS NOT NULL THEN 5
                            WHEN D3.url IS NOT NULL THEN 4
                            WHEN D2.url IS NOT NULL THEN 3
                            WHEN D1.url IS NOT NULL THEN 2
                        END as input_hierarchy,
                        A.title as input_title,
                        A.input_menu_order as input_order,
                        CASE
                            WHEN E.url IS NOT NULL THEN 1
                            ELSE 0
                        END as label_flg,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM (
                            SELECT
                                *
                                , ROW_NUMBER() OVER (ORDER BY input_menu_order) as input_menu_no
                            FROM
                                {$temp_table_name}
                        ) A
                    LEFT JOIN m_input_dsp_config B
                        ON REPLACE(A.title, '.txt', '') = B.input_dsp_name
                    LEFT JOIN
                        (
                            SELECT
                                *
                                , ROW_NUMBER() OVER (ORDER BY input_menu_order) as input_menu_no
                            FROM
                                {$temp_table_name}
                        ) D1
                        ON A.oya = D1.url
                    LEFT JOIN {$temp_table_name} D2
                        ON D1.oya = D2.url
                    LEFT JOIN {$temp_table_name} D3
                        ON D2.oya = D3.url
                    LEFT JOIN {$temp_table_name} D4
                        ON D3.oya = D4.url
                    LEFT JOIN {$temp_table_name} E
                        ON A.url = E.oya
                    LEFT JOIN m_affiliation F
                        ON A.url LIKE '%' || F.affiliation_section || '%'
                ";

                break;
            case 'm_input_dsp_config':
                // 入力画面構成マスタ_【m_input_dsp_config】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            input_dsp_no integer
                            , input_dsp_name character varying(50)
                            , inspection_kbn_code integer
                            , inspection_kbn_name character varying(50)
                            , point_num integer
                            , item_num integer
                            , bunseki_torikomi character varying(50)
                            , bunseki character varying(50)
                            , comment character varying(50)
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (input_dsp_no,
                        input_dsp_name,
                        inspection_kbn_code,
                        point_num,
                        item_num,
                        conf_btn_flg,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.input_dsp_no as input_dsp_no,
                        {$temp_table_name}.input_dsp_name as input_dsp_name,
                        {$temp_table_name}.inspection_kbn_code as inspection_kbn_code,
                        {$temp_table_name}.point_num as point_num,
                        {$temp_table_name}.item_num as item_num,
                        CASE
                            WHEN {$temp_table_name}.input_dsp_name = '共同検査（浄水）（土浦市）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '共同検査（浄水）（美浦村）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '共同検査（浄水）（つくば市Ⅰ）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '共同検査（浄水）（つくば市Ⅱ）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '共同検査（浄水）（阿見_河内町）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '共同検査（浄水）（稲敷市）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '共同検査（浄水）（守谷市）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '共同検査（臨時）（浄水全項目）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '共同検査（臨時）（省略不可能項目）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '共同検査（臨時）（任意項目）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '共同検査（臨時）（原水）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '霞ヶ浦浄水場（浄水GLP検査）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '利根川浄水場（浄水GLP検査）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '阿見浄水場（浄水GLP検査）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '鹿島浄水場（浄水GLP検査）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '鰐川浄水場（浄水GLP検査）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '関城浄水場（浄水GLP検査）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '新治浄水場（浄水GLP検査）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '水海道浄水場（浄水GLP検査）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '水戸浄水場（浄水GLP検査）' THEN 1
                            WHEN {$temp_table_name}.input_dsp_name = '涸沼川浄水場（浄水GLP検査）' THEN 1
                            ELSE 0
                        END as conf_btn_flg,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}
                ";

                break;
            case 'm_input_dsp_point':
                // 入力画面構成地点マスタ_【m_input_dsp_point】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            input_dsp_no integer
                            , input_dsp_name character varying(50)
                            , point_no integer
                            , point_name character varying(50)
                            , dsp_order integer
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (input_dsp_no,
                        point_no,
                        dsp_order,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.input_dsp_no as input_dsp_no,
                        {$temp_table_name}.point_no as point_no,
                        {$temp_table_name}.dsp_order as dsp_order,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}
                ";

                break;
            case 'm_input_dsp_item':
                // 入力画面構成項目マスタ_【m_input_dsp_item】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            input_dsp_no integer
                            , input_dsp_name character varying(50)
                            , item_no integer
                            , item_name character varying(50)
                            , dsp_order integer
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (input_dsp_no,
                        item_no,
                        dsp_order,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.input_dsp_no as input_dsp_no,
                        {$temp_table_name}.item_no as item_no,
                        {$temp_table_name}.dsp_order as dsp_order,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}
                ";

                break;
            case 'm_input_n_mask':
                // 入力マスクNマスタ_【m_input_n_mask】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            input_dsp_no integer
                            , input_dsp_name character varying(50)
                            , col_number_point integer
                            , row_number_item integer
                            , not_input integer
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (input_dsp_no,
                        point_no,
                        item_no,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        A.input_dsp_no as input_dsp_no,
                        B.point_no as point_no,
                        C.item_no as item_no,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name} A
                    LEFT JOIN
                        m_input_dsp_point B
                     ON B.input_dsp_no = A.input_dsp_no
                    AND B.dsp_order = A.col_number_point + 1
                    LEFT JOIN
                        m_input_dsp_item C
                     ON C.input_dsp_no = A.input_dsp_no
                    AND C.dsp_order = A.row_number_item + 1
                ";

                break;
            case 'm_report_menu':
                // 報告書選択メニュー_【m_report_menu】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            url character varying(50)
                            , title character varying(50)
                            , oya character varying(50)
                            , kubun character varying(50)
                            , report_menu_group character varying(50)
                            , report_menu_order integer
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (report_menu_no,
                        report_parent_menu_no,
                        affiliation_section_no,
                        report_no,
                        report_hierarchy,
                        report_title,
                        report_order,
                        label_flg,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT DISTINCT
                        A.input_menu_no,
                        CASE
                            WHEN A.url = '報告書選択' THEN 1
                            ELSE D1.input_menu_no
                        END as input_parent_menu_no,
                        F.affiliation_section_no as affiliation_section_no,
                        CASE
                            WHEN A.title = '農薬類検査結果書（霞ヶ浦浄水場）' THEN 64
                            WHEN A.title = '農薬類検査結果書（利根川浄水場）' THEN 64
                            WHEN A.title = '農薬類検査結果書（阿見浄水場）' THEN 64
                            WHEN A.title = '農薬類検査結果書（鹿島浄水場）' THEN 64
                            WHEN A.title = '農薬類検査結果書（鰐川浄水場）' THEN 64
                            WHEN A.title = '農薬類検査結果書（関城浄水場）' THEN 64
                            WHEN A.title = '農薬類検査結果書（新治浄水場）' THEN 64
                            WHEN A.title = '農薬類検査結果書（水海道浄水場）' THEN 64
                            WHEN A.title = '農薬類検査結果書（水戸浄水場）' THEN 64
                            WHEN A.title = '農薬類検査結果書（涸沼川浄水場）' THEN 64
                            ELSE B.report_no
                        END as report_no,
                        CASE
                            WHEN A.url = A.oya THEN 1
                            WHEN D4.url IS NOT NULL THEN 5
                            WHEN D3.url IS NOT NULL THEN 4
                            WHEN D2.url IS NOT NULL THEN 3
                            WHEN D1.url IS NOT NULL THEN 2
                        END as report_hierarchy,
                        A.title as report_title,
                        A.report_menu_order as report_order,
                        CASE
                            WHEN E.url IS NOT NULL THEN 1
                            ELSE 0
                        END as label_flg,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM (
                            SELECT
                                *
                                , ROW_NUMBER() OVER (ORDER BY report_menu_order) as input_menu_no
                            FROM
                                {$temp_table_name}
                        ) A
                    LEFT JOIN m_report_config B
                        ON REPLACE(A.title, '.xlsx', '') = B.report_name
                    LEFT JOIN
                        (
                            SELECT
                                *
                                , ROW_NUMBER() OVER (ORDER BY report_menu_order) as input_menu_no
                            FROM
                                {$temp_table_name}
                        ) D1
                        ON A.oya = D1.url
                    LEFT JOIN {$temp_table_name} D2
                        ON D1.oya = D2.url
                    LEFT JOIN {$temp_table_name} D3
                        ON D2.oya = D3.url
                    LEFT JOIN {$temp_table_name} D4
                        ON D3.oya = D4.url
                    LEFT JOIN {$temp_table_name} E
                        ON A.url = E.oya
                    LEFT JOIN m_affiliation F
                        ON A.url LIKE '%' || F.affiliation_section || '%'
                ";

                break;
            case 'm_report_config':
                // 報告書構成マスタ_【m_report_config】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            report_no integer
                            , report_name character varying(50)
                            , report_type character varying(50)
                            , report_category character varying(50)
                            , point_no integer
                            , point_name character varying(50)
                            , item_no integer
                            , item_name character varying(50)
                            , kensa_kbn_code integer
                            , kensa_kbn_name character varying(50)
                            , dsp_up_limit character varying(50)
                            , dsp_low_limit character varying(50)
                            , dsp_space character varying(50)
                            , output_time_point integer
                            , output_time_item integer
                            , report_config_select boolean
                            , saisui_date timestamp(6) without time zone
                            , saisui_time character varying(50)
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (report_no,
                        report_name,
                        report_type,
                        report_category,
                        data_sheet_type,
                        input_dsp_no,
                        point_no,
                        item_no,
                        mask_pattern,
                        row_start_cell_name,
                        col_start_cell_name,
                        kensa_kbn_code,
                        template_file,
                        dsp_up_limit,
                        dsp_low_limit,
                        dsp_space,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.report_no as report_no,
                        {$temp_table_name}.report_name as report_name,
                        CASE
                            WHEN {$temp_table_name}.report_type = 'BSN'  THEN 1
                            WHEN {$temp_table_name}.report_type = 'FGG'  THEN 2
                            WHEN {$temp_table_name}.report_type = 'FS'   THEN 3
                            WHEN {$temp_table_name}.report_type = 'BCK'  THEN 4
                            WHEN {$temp_table_name}.report_type = 'BCKY' THEN 5
                            WHEN {$temp_table_name}.report_type = 'Z2' AND {$temp_table_name}.report_name NOT LIKE '処理過程検査結果%' THEN 6
                            WHEN {$temp_table_name}.report_type = 'KDKK' THEN 7
                            WHEN {$temp_table_name}.report_type = 'KDKM' THEN 8
                            WHEN {$temp_table_name}.report_type = 'KDKN' THEN 9
                            WHEN {$temp_table_name}.report_type = 'KDG'  THEN 10
                            WHEN {$temp_table_name}.report_type = 'KDJ'  THEN 11
                            WHEN {$temp_table_name}.report_type = 'KDRJ' THEN 11
                            WHEN {$temp_table_name}.report_type = 'KDRN' THEN 11
                            WHEN {$temp_table_name}.report_type = 'KDR1' THEN 11
                            WHEN {$temp_table_name}.report_type = 'KDFGJ' THEN 13
                            WHEN {$temp_table_name}.report_type = 'BCL' AND {$temp_table_name}.report_name <> '浄水場用（小山・板戸井）' THEN 14
                            WHEN {$temp_table_name}.report_type = 'Z3' THEN 15
                            WHEN {$temp_table_name}.report_name LIKE '処理過程検査結果%' THEN 16
                            WHEN {$temp_table_name}.report_type = 'BCD' THEN 17
                            WHEN {$temp_table_name}.report_type = 'BCDY' THEN 18
                            WHEN {$temp_table_name}.report_type = 'KCL' THEN 19
                            WHEN {$temp_table_name}.report_name = '浄水場用（小山・板戸井）' THEN 19
                            WHEN {$temp_table_name}.report_type = 'KJHP' THEN 20
                            WHEN {$temp_table_name}.report_type = 'SKG' THEN 22
                            WHEN {$temp_table_name}.report_type = 'KSS' THEN 23
                            WHEN {$temp_table_name}.report_name = '日報（阿見浄水場）' THEN 24
                            WHEN {$temp_table_name}.report_name = '日報（霞ヶ浦浄水場）' THEN 25
                            WHEN {$temp_table_name}.report_name = '日報（関城浄水場）' THEN 26
                            WHEN {$temp_table_name}.report_name = '日報（鹿島浄水場）' THEN 27
                            WHEN {$temp_table_name}.report_name = '日報（新治浄水場）' THEN 28
                            WHEN {$temp_table_name}.report_name = '日報（水海道浄水場）' THEN 29
                            WHEN {$temp_table_name}.report_name = '日報（水戸浄水場）' THEN 30
                            WHEN {$temp_table_name}.report_name = '日報（那珂川浄水場）' THEN 31
                            WHEN {$temp_table_name}.report_name = '日報（利根川浄水場）' THEN 32
                            WHEN {$temp_table_name}.report_name = '日報（鰐川浄水場）' THEN 33
                            WHEN {$temp_table_name}.report_name = '日報（涸沼川浄水場）' THEN 34
                            WHEN {$temp_table_name}.report_type = 'KW' THEN 35
                            WHEN {$temp_table_name}.report_type = 'KWY' THEN 36
                            WHEN {$temp_table_name}.report_type = 'FL' THEN 37
                            WHEN {$temp_table_name}.report_type = 'FJ' THEN 38
                            WHEN {$temp_table_name}.report_type = 'FG' THEN 39
                            WHEN {$temp_table_name}.report_type = 'BNG' THEN 40
                            WHEN {$temp_table_name}.report_type = 'E1' THEN 41
                            WHEN {$temp_table_name}.report_type = 'BNK' THEN 42
                            WHEN {$temp_table_name}.report_type = 'FK' THEN 43
                            WHEN {$temp_table_name}.report_type = 'TS' THEN 44
                            WHEN {$temp_table_name}.report_type = 'FN' THEN 45
                            WHEN {$temp_table_name}.report_type = 'BY' THEN 46
                            WHEN {$temp_table_name}.report_type = 'BCM' THEN 47
                            WHEN {$temp_table_name}.report_type = 'BCMY' THEN 48
                            WHEN {$temp_table_name}.report_type = 'BCY' THEN 49
                            WHEN {$temp_table_name}.report_type = 'BCYY' THEN 50
                            WHEN {$temp_table_name}.report_type = 'KNO' THEN 51
                            WHEN {$temp_table_name}.report_type = 'CKG' THEN 52
                            WHEN {$temp_table_name}.report_type = 'KG' THEN 53
                            WHEN {$temp_table_name}.report_type = 'KGY' THEN 54
                        END as report_type,
                        CASE
                            WHEN {$temp_table_name}.report_category = '日報' THEN 0
                            WHEN {$temp_table_name}.report_category = '週報' THEN 1
                            WHEN {$temp_table_name}.report_category = '月報' THEN 2
                            WHEN {$temp_table_name}.report_category = '年報' THEN 3
                        END as report_category,
                        NULL as data_sheet_type,
                        999 as input_dsp_no,
                        CASE
                            WHEN {$temp_table_name}.point_name IS NULL THEN NULL
                            ELSE {$temp_table_name}.point_no
                        END as point_no,
                        {$temp_table_name}.item_no as item_no,
                        0 as mask_pattern,
                        null as row_start_cell_name,
                        null as col_start_cell_name,
                        {$temp_table_name}.kensa_kbn_code as kensa_kbn_code,
                        'tmp_' || {$temp_table_name}.report_no || '.xlsx' as template_file,
                        {$temp_table_name}.dsp_up_limit as dsp_up_limit,
                        {$temp_table_name}.dsp_low_limit as dsp_low_limit,
                        {$temp_table_name}.dsp_space as dsp_space,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}
                ";

                break;
            case 'm_report_point':
                // 報告書地点設定済の一時的のテーブルを生成
                $temp_table = "
                    CREATE TEMPORARY TABLE tmp_report_point_zumi (
                            report_no integer
                            , report_name character varying(50)
                            , point_no integer
                            , point_name character varying(50)
                            , point_cell_cd character varying(50)
                            , point_order integer
                    );
                ";
                DB::statement($temp_table);

                // 一時的の報告書地点設定済にCSVファイルのデータを移行
                $file_path = 'C:\\tmp\\tmp_report_point_zumi.csv';
                DB::statement(
                    "COPY tmp_report_point_zumi FROM '{$file_path}' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')"
                );

                // 報告書地点マスタ_【m_report_point】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            report_no integer
                            , report_name character varying(50)
                            , point_no integer
                            , point_name character varying(50)
                            , point_cell_cd character varying(50)
                            , point_order integer
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (report_no,
                        point_no,
                        report_point_name,
                        point_order,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.report_no as report_no,
                        {$temp_table_name}.point_no as point_no,
                        {$temp_table_name}.point_name,
                        {$temp_table_name}.point_order,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}

                    UNION ALL

                    SELECT
                        report_no as report_no,
                        point_no as point_no,
                        point_name,
                        point_order,
                        now() as insert_date,
                        999999 as insert_user,
                        now() as update_date,
                        999999 as update_user
                    FROM tmp_report_point_zumi
                    WHERE
                        report_no <> 301
                ";

                break;
            case 'm_report_item':
                // 報告書項目マスタ_【m_report_item】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            report_no integer
                            , report_name character varying(50)
                            , item_no integer
                            , item_name character varying(50)
                            , item_cell_cd character varying(50)
                            , report_item_order integer
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (report_no,
                        item_no,
                        report_item_name,
                        unit_cell_name,
                        target_cell_name,
                        base_cell_name,
                        number_cell_name,
                        no_name,
                        item_order,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.report_no as report_no,
                        {$temp_table_name}.item_no as item_no,
                        {$temp_table_name}.item_name as report_item_name,
                        null as unit_cell_name,
                        null as target_cell_name,
                        null as base_cell_name,
                        null as number_cell_name,
                        null as no_name,
                        {$temp_table_name}.report_item_order as item_order,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}
                ";

                break;
            case 'm_report_text':
                // タイトル追加文字地点の一時的のテーブルを生成
                $temp_table = "
                    CREATE TEMPORARY TABLE tmp_title_titen (
                            report_no integer
                            , report_name character varying(50)
                            , point_no integer
                            , point_name character varying(50)
                            , HF1 character varying(200)
                            , HF2 character varying(200)
                            , HF3 character varying(200)
                            , HF4 character varying(200)
                            , HF5 character varying(200)
                            , HF6 character varying(200)
                    );
                ";
                DB::statement($temp_table);

                // 一時的のタイトル追加文字地点にCSVファイルのデータを移行
                $file_path = 'C:\\tmp\\tmp_title_titen.csv';
                DB::statement(
                    "COPY tmp_title_titen FROM '{$file_path}' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')"
                );

                // 報告書固定文言マスタ_【m_report_text】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            report_no integer
                            , report_name character varying(50)
                            , text_cell_name character varying(50)
                            , text_cell_code character varying(50)
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (report_no,
                        text_cell_name,
                        text_renban,
                        point_no,
                        text_cell_kbn,
                        text_cell_code,
                        nendo,
                        start_valid_date,
                        end_valid_date,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    (    
                    SELECT
                        A.report_no as report_no,
                        REPLACE(
                            REPLACE(
                                REPLACE(
                                    REPLACE(
                                        REPLACE(
                                            REPLACE(
                                            A.text_cell_name,
                                            '[', ''),
                                        ']', ''),
                                    '+', '_'),
                                '(', '_'),
                            ')', ''),
                        ' ', '_')
                        || '_' || ROW_NUMBER() OVER (PARTITION BY A.report_no ORDER BY A.report_no, B.point_no, A.text_cell_name) AS text_cell_name,
                        1 as text_renban,
                        B.point_no as point_no,
                        A.text_cell_name as text_cell_kbn,
                        CASE
                            WHEN A.text_cell_name = '[HF1]' THEN C.HF1
                            WHEN A.text_cell_name = '[HF2]' THEN C.HF2
                            WHEN A.text_cell_name = '[HF3]' THEN C.HF3
                            WHEN A.text_cell_name = '[HF4]' THEN C.HF4
                            WHEN A.text_cell_name = '[HF5]' THEN C.HF5
                            WHEN A.text_cell_name = '[HF6]' THEN C.HF6
                        END as text_cell_code,
                        null,
                        null,
                        null,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name} A
                    LEFT JOIN m_report_point B
                        ON A.report_no = B.report_no
                    LEFT JOIN tmp_title_titen C
                        ON B.report_no = C.report_no
                       AND B.point_no = C.point_no
                    WHERE
                        A.text_cell_name LIKE '%HF%'

                    UNION

                    SELECT
                        A.report_no as report_no
                        , REPLACE ( 
                            REPLACE ( 
                                REPLACE ( 
                                    REPLACE ( 
                                        REPLACE (REPLACE (A.text_cell_name, '[', ''), ']', '')
                                        , '+'
                                        , '_'
                                    ) 
                                    , '('
                                    , '_'
                                ) 
                                , ')'
                                , ''
                            ) 
                            , ' '
                            , '_'
                        ) AS text_cell_name
                        , 1 as text_renban
                        , null
                        , A.text_cell_name as text_cell_kbn
                        , null as text_cell_code
                        , CAST(null AS integer) AS nendo
                        , CAST(null AS timestamp) AS start_valid_date
                        , CAST(null AS timestamp) AS end_valid_date
                        , now() as insert_date
                        , $ikou_user as insert_user
                        , now() as update_date
                        , $ikou_user as update_user 
                    FROM
                        {$temp_table_name} A 
                    WHERE
                        A.text_cell_name NOT LIKE '%HF%'
                    )
                ";

                break;
            case 't_monthly_report_list':
                // 月報報告書一覧_【t_monthly_report_list】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            jyousui_no integer
                            , jyousui_name character varying(50)
                            , report_no integer
                            , report_name character varying(50)
                            , saisui_no integer
                            , saisui_name character varying(50)
                            , saisui_days integer
                            , report_title character varying(50)
                            , monthly_report_list_order integer
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (sisetu_no,
                        report_no,
                        point_no,
                        saisui_days,
                        report_list_order,
                        start_valid_date,
                        end_valid_date,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        A.jyousui_no as sisetu_no,
                        B.report_no as report_no,
                        C.point_no as point_no,
                        A.saisui_days as saisui_days,
                        A.monthly_report_list_order as report_list_order,
                        CASE
                            WHEN A.jyousui_name = '霞ヶ浦浄水場' THEN TO_TIMESTAMP('1989/01/01 0:00:00', 'YYYY-MM-DD HH24:MI:SS')
                            WHEN A.jyousui_name = '霞ヶ浦浄水場OZ' THEN TO_TIMESTAMP('2024/11/01 0:00:00', 'YYYY-MM-DD HH24:MI:SS')
                            ELSE NULL
                        END as start_valid_date,
                        CASE
                            WHEN A.jyousui_name = '霞ヶ浦浄水場' THEN TO_TIMESTAMP('2024/10/31 0:00:00', 'YYYY-MM-DD HH24:MI:SS')
                            ELSE NULL
                        END as end_valid_date,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name} A
                    LEFT JOIN m_report_config B
                        ON A.report_name = B.report_name
                    LEFT JOIN m_saisui_point C
                        ON translate(A.saisui_name, '$str_before_replace', '$str_after_replace') = translate(C.point_report_name, '$str_before_replace', '$str_after_replace')

                ";

                break;
            case 'm_saisui_point':
                // 採水地点マスタ_【m_saisui_point】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            jyousui_no integer
                            , point_no integer
                            , point_dsp_name character varying(50)
                            , point_report_name character varying(50)
                            , kana character varying(50)
                            , saisui_kbn_no integer
                            , saisui_kbn_name character varying(50)
                            , point_dai_category_no integer
                            , point_dai_category_name character varying(50)
                            , point_tyu_category_no integer
                            , point_tyu_category_name character varying(50)
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (point_no,
                        point_dsp_name,
                        point_report_name,
                        saisui_kbn_no,
                        sisetu_no,
                        process_no,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.point_no as point_no,
                        {$temp_table_name}.point_dsp_name as point_dsp_name,
                        {$temp_table_name}.point_report_name as point_report_name,
                        {$temp_table_name}.saisui_kbn_no as saisui_kbn_no,
                        {$temp_table_name}.point_dai_category_no as sisetu_no,
                        {$temp_table_name}.point_tyu_category_no as process_no,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}
                ";

                break;
            case 'm_saisui_kbn':
                // 採水区分マスタ_【m_saisui_kbn】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            saisui_kbn_no integer
                            , saisui_kbn_name character varying(50)
                            , saisui_kbn_furigana character varying(50)
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (saisui_kbn_no,
                        saisui_kbn_name,
                        saisui_kbn_furigana,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.saisui_kbn_no as saisui_kbn_no,
                        {$temp_table_name}.saisui_kbn_name as saisui_kbn_name,
                        {$temp_table_name}.saisui_kbn_furigana as saisui_kbn_furigana,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}
                ";

                break;
            case 'm_sisetu':
                // 月報報告書の一時的のテーブルを生成
                $temp_table = "
                    CREATE TEMPORARY TABLE tmp_monthly_report_list (
                            jyousui_no integer
                            , jyousui_name character varying(50)
                            , report_no integer
                            , report_name character varying(50)
                            , saisui_no integer
                            , saisui_name character varying(50)
                            , saisui_days integer
                            , report_title character varying(50)
                            , monthly_report_list_order integer
                    );
                ";
                DB::statement($temp_table);

                // 一時的の月報報告書にCSVファイルのデータを移行
                $file_path = 'C:\\tmp\\t_monthly_report_list.csv';
                DB::statement(
                    "COPY tmp_monthly_report_list FROM '{$file_path}' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')"
                );

                // 施設マスタ_【m_sisetu】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            point_dai_category_no integer
                            , point_dai_category_name character varying(50)
                            , point_dai_category_furigana character varying(50)
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (sisetu_no,
                        sisetu_type,
                        sisetu_name,
                        sisetu_furigana,
                        sisetu_order,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.point_dai_category_no as sisetu_no,
                        CASE
                            WHEN {$temp_table_name}.point_dai_category_name LIKE '%浄水場%' THEN 0
                            ELSE 1
                        END AS sisetu_type,
                        {$temp_table_name}.point_dai_category_name as sisetu_name,
                        {$temp_table_name}.point_dai_category_furigana as sisetu_furigana,
                        CASE
                            WHEN {$temp_table_name}.point_dai_category_name = '水質管理センター' THEN 1
                            WHEN {$temp_table_name}.point_dai_category_name = '利根川浄水場' THEN 9
                            WHEN {$temp_table_name}.point_dai_category_name = '新治浄水場' THEN 10
                            WHEN {$temp_table_name}.point_dai_category_name = '水海道浄水場' THEN 11
                            WHEN {$temp_table_name}.point_dai_category_name = '涸沼川浄水場' THEN 12
                            WHEN {$temp_table_name}.point_dai_category_name = '鹿島浄水場' THEN 13
                            WHEN {$temp_table_name}.point_dai_category_name = '鰐川浄水場' THEN 14
                            WHEN {$temp_table_name}.point_dai_category_name = '霞ヶ浦浄水場' THEN 15
                            WHEN {$temp_table_name}.point_dai_category_name = '関城浄水場' THEN 16
                            WHEN {$temp_table_name}.point_dai_category_name = '阿見浄水場' THEN 2
                            WHEN {$temp_table_name}.point_dai_category_name = '水戸浄水場' THEN 3
                            WHEN {$temp_table_name}.point_dai_category_name = '那珂川浄水場' THEN 4
                            WHEN {$temp_table_name}.point_dai_category_name = '霞ヶ浦水源' THEN 5
                            WHEN {$temp_table_name}.point_dai_category_name = '共同水質検査' THEN 6
                            WHEN {$temp_table_name}.point_dai_category_name = 'その他' THEN 7
                            WHEN {$temp_table_name}.point_dai_category_name = '実証実験プラント' THEN 8
                        END as sisetu_order,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}

                    UNION ALL

                    SELECT DISTINCT ON (jyousui_no)
                        jyousui_no as sisetu_no,
                        1 AS sisetu_type,
                        jyousui_name as sisetu_name,
                        null as sisetu_furigana,
                        CASE
                            WHEN jyousui_name = '各浄水場' THEN 17
                            WHEN jyousui_name = '霞ヶ浦浄水場OZ' THEN 18
                        END as sisetu_order,
                        now() as insert_date,
                        999999 as insert_user,
                        now() as update_date,
                        999999 as update_user
                    FROM tmp_monthly_report_list
                    WHERE
                        jyousui_no = 20 OR jyousui_no = 80
                ";

                break;
            case 'm_process':
                // 処理過程マスタ_【m_process】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            point_tyu_category_no integer
                            , point_tyu_category_name character varying(50)
                            , point_tyu_category_furigana character varying(50)
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (process_no,
                        process_name,
                        process_furigana,
                        process_order,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.point_tyu_category_no as process_no,
                        {$temp_table_name}.point_tyu_category_name as process_name,
                        {$temp_table_name}.point_tyu_category_furigana as process_furigana,
                        CASE
                            WHEN {$temp_table_name}.point_tyu_category_name = '浄水場' THEN 1
                            WHEN {$temp_table_name}.point_tyu_category_name = '原水' THEN 2
                            WHEN {$temp_table_name}.point_tyu_category_name = '工水原水' THEN 3
                            WHEN {$temp_table_name}.point_tyu_category_name = '工水配水' THEN 4
                            WHEN {$temp_table_name}.point_tyu_category_name = '配水池' THEN 5
                            WHEN {$temp_table_name}.point_tyu_category_name = '観測井' THEN 6
                            WHEN {$temp_table_name}.point_tyu_category_name = '汚泥' THEN 7
                            WHEN {$temp_table_name}.point_tyu_category_name = '浸透浸出放流水' THEN 8
                            WHEN {$temp_table_name}.point_tyu_category_name = '浄水検査対象' THEN 9
                            WHEN {$temp_table_name}.point_tyu_category_name = '霞ヶ浦水源' THEN 10
                            WHEN {$temp_table_name}.point_tyu_category_name = '共同水質検査' THEN 11
                            WHEN {$temp_table_name}.point_tyu_category_name = 'その他' THEN 12
                            WHEN {$temp_table_name}.point_tyu_category_name = '生物処理水' THEN 13
                            WHEN {$temp_table_name}.point_tyu_category_name = '美浦村' THEN 14
                            WHEN {$temp_table_name}.point_tyu_category_name = 'つくば市' THEN 15
                            WHEN {$temp_table_name}.point_tyu_category_name = '阿見町' THEN 16
                            WHEN {$temp_table_name}.point_tyu_category_name = '河内町' THEN 17
                            WHEN {$temp_table_name}.point_tyu_category_name = '稲敷市' THEN 18
                            WHEN {$temp_table_name}.point_tyu_category_name = '守谷市' THEN 19
                            WHEN {$temp_table_name}.point_tyu_category_name = '土浦市' THEN 20
                            WHEN {$temp_table_name}.point_tyu_category_name = '利根町水道課' THEN 21
                            WHEN {$temp_table_name}.point_tyu_category_name = '茨城県南水道企業団' THEN 22
                            WHEN {$temp_table_name}.point_tyu_category_name = '混和水' THEN 23
                            WHEN {$temp_table_name}.point_tyu_category_name = '検査対象浄水池' THEN 24
                            WHEN {$temp_table_name}.point_tyu_category_name = '検査対象配水池' THEN 25
                            WHEN {$temp_table_name}.point_tyu_category_name = '沈殿水' THEN 26
                            WHEN {$temp_table_name}.point_tyu_category_name = 'オゾン処理水' THEN 27
                            WHEN {$temp_table_name}.point_tyu_category_name = 'BAC処理水' THEN 28
                            WHEN {$temp_table_name}.point_tyu_category_name = '砂ろ過水' THEN 29
                            WHEN {$temp_table_name}.point_tyu_category_name = '粒活処理水' THEN 30
                            WHEN {$temp_table_name}.point_tyu_category_name = '浄水' THEN 31
                        END as process_order,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}
                ";

                break;
            case 'm_inspection_item':
                // 検査項目マスタ_【m_inspection_item】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            item_no integer
                            , item_dsp_name character varying(50)
                            , item_report_name character varying(50)
                            , kana character varying(50)
                            , item_unit character varying(50)
                            , data_kbn integer
                            , data_kbn_name character varying(50)
                            , select_flg integer
                            , select_flg_name character varying(50)
                            , item_dai_category_no integer
                            , item_dai_category_name character varying(50)
                            , item_tyu_category_no integer
                            , item_tyu_category_name character varying(50)
                            , inspection_item_comment character varying(50)
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (item_no,
                        item_dsp_name,
                        item_report_name,
                        item_unit,
                        constant_qualitative_flg,
                        input_type,
                        item_dai_category_no,
                        item_tyu_category_no,
                        inspection_item_comment,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.item_no as item_no,
                        {$temp_table_name}.item_dsp_name as item_dsp_name,
                        {$temp_table_name}.item_report_name as item_report_name,
                        {$temp_table_name}.item_unit as item_unit,
                        {$temp_table_name}.data_kbn as constant_qualitative_flg,
                        CASE
                            WHEN {$temp_table_name}.item_no = 1 THEN 3
                            WHEN {$temp_table_name}.item_no = 2 THEN 4
                            WHEN {$temp_table_name}.item_no = 1120 THEN 3
                            WHEN {$temp_table_name}.item_no = 1153 THEN 3
                            WHEN {$temp_table_name}.item_no = 1203 THEN 3
                            WHEN {$temp_table_name}.item_no = 1206 THEN 3
                            WHEN {$temp_table_name}.item_no = 1207 THEN 3
                            WHEN {$temp_table_name}.item_no = 1209 THEN 3
                            WHEN {$temp_table_name}.item_no = 1150 THEN 5
                            WHEN {$temp_table_name}.item_no = 1156 THEN 5
                            WHEN {$temp_table_name}.select_flg = 2 THEN 2
                            ELSE 1
                        END as input_type,
                        {$temp_table_name}.item_dai_category_no as item_dai_category_no,
                        {$temp_table_name}.item_tyu_category_no as item_tyu_category_no,
                        {$temp_table_name}.inspection_item_comment as inspection_item_comment,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}
                ";

                break;
            case 'm_inspection_kbn':
                // 検査区分マスタ_【m_inspection_kbn】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            inspection_kbn_code integer
                            , inspection_kbn_name character varying(50)
                            , inspection_kbn_level integer
                            , comment character varying(50)
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (inspection_kbn_code,
                        inspection_kbn_name,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.inspection_kbn_code as inspection_kbn_code,
                        {$temp_table_name}.inspection_kbn_name as inspection_kbn_name,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}
                ";

                break;
            case 'm_inspection_dai_category':
                // 検査項目大分類マスタ_【m_inspection_dai_category】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            item_dai_category_no integer
                            , item_dai_category_name character varying(50)
                            , kana character varying(50)
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (item_dai_category_no,
                        item_dai_category_name,
                        item_dai_order,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.item_dai_category_no as item_dai_category_no,
                        {$temp_table_name}.item_dai_category_name as item_dai_category_name,
                        CASE
                            WHEN {$temp_table_name}.item_dai_category_name = '薬品注入率' THEN 1
                            WHEN {$temp_table_name}.item_dai_category_name = '採水状況' THEN 2
                            WHEN {$temp_table_name}.item_dai_category_name = '基準項目' THEN 3
                            WHEN {$temp_table_name}.item_dai_category_name = '管理項目' THEN 4
                            WHEN {$temp_table_name}.item_dai_category_name = '要検討項目' THEN 5
                            WHEN {$temp_table_name}.item_dai_category_name = '原水項目' THEN 6
                            WHEN {$temp_table_name}.item_dai_category_name = '他の項目' THEN 7
                            WHEN {$temp_table_name}.item_dai_category_name = '農薬' THEN 8
                            WHEN {$temp_table_name}.item_dai_category_name = '植物プランクトン' THEN 9
                            WHEN {$temp_table_name}.item_dai_category_name = '動物プランクトン' THEN 10
                            WHEN {$temp_table_name}.item_dai_category_name = '汚泥' THEN 11
                            WHEN {$temp_table_name}.item_dai_category_name = '微小動物' THEN 12
                        END as item_dai_order,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}
                ";

                break;
            case 'm_inspection_tyu_category':
                // 検査項目中分類マスタ_【m_inspection_tyu_category】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            item_tyu_category_no integer
                            , item_tyu_category_name character varying(50)
                            , kana character varying(50)
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (item_tyu_category_no,
                        item_tyu_category_name,
                        item_tyu_order,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.item_tyu_category_no as item_tyu_category_no,
                        {$temp_table_name}.item_tyu_category_name as item_tyu_category_name,
                        CASE
                            WHEN {$temp_table_name}.item_tyu_category_name = '薬品注入率' THEN 1
                            WHEN {$temp_table_name}.item_tyu_category_name = '採水状況' THEN 2
                            WHEN {$temp_table_name}.item_tyu_category_name = '基準項目' THEN 3
                            WHEN {$temp_table_name}.item_tyu_category_name = '管理項目' THEN 4
                            WHEN {$temp_table_name}.item_tyu_category_name = '要検討項目' THEN 5
                            WHEN {$temp_table_name}.item_tyu_category_name = '原水項目' THEN 6
                            WHEN {$temp_table_name}.item_tyu_category_name = '他の項目' THEN 7
                            WHEN {$temp_table_name}.item_tyu_category_name = '農薬' THEN 8
                            WHEN {$temp_table_name}.item_tyu_category_name = '植物プランクトン' THEN 9
                            WHEN {$temp_table_name}.item_tyu_category_name = '動物プランクトン' THEN 10
                            WHEN {$temp_table_name}.item_tyu_category_name = '汚泥' THEN 11
                            WHEN {$temp_table_name}.item_tyu_category_name = '微小動物' THEN 12
                            WHEN {$temp_table_name}.item_tyu_category_name = '藍藻類' THEN 13
                            WHEN {$temp_table_name}.item_tyu_category_name = '珪藻類' THEN 14
                            WHEN {$temp_table_name}.item_tyu_category_name = '緑藻類' THEN 15
                        END as item_tyu_order,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}
                ";

                break;
            case 'm_selection':
                // 選択肢マスタ_【m_selection】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            item_no integer
                            , item_name character varying(50)
                            , selection_no integer
                            , selection_name character varying(128)
                            , selection_kbn_no integer
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (item_no,
                        selection_no,
                        selection_name,
                        sort_value,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.item_no as item_no,
                        {$temp_table_name}.selection_no as selection_no,
                        {$temp_table_name}.selection_name as selection_name,
                        LPAD(CAST({$temp_table_name}.selection_no AS TEXT), 2, '0') as sort_value,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}
                ";

                break;
            case 'm_inspection_criteria':
                $select_sql = "";
                for ($i = 2000; $i <= 2025; $i++) {
                    $temp_table_nendo = 'tmp_inspection_' . $i;

                    // 各年度の検査基準マスタの一時的のテーブルを生成
                    $temp_table = "
                        CREATE TEMPORARY TABLE $temp_table_nendo (
                                item_no integer
                                , hou_kijyun_no integer
                                , genjyo_flg integer
                                , regulation_low_limit numeric(18, 8)
                                , regulation_up_limit numeric(18, 8)
                                , register_date timestamp(6) without time zone
                                , basic_dsp_digits integer
                                , input_low_limit numeric(18, 8)
                                , input_up_limit numeric(18, 8)
                                , report_low_limit numeric(18, 8)
                                , report_up_limit numeric(18, 8)
                                , valid_digits integer
                                , input_min_digits integer
                                , output_min_digits integer
                                , comment character varying(128)
                                , end_date timestamp(6) without time zone
                        );
                    ";
                    DB::statement($temp_table);

                    // 一時的の各年度の検査基準マスタにCSVファイルのデータを移行
                    $file_path = 'C:\\tmp\\' . $temp_table_nendo . '.csv';
                    DB::statement(
                        "COPY $temp_table_nendo FROM '{$file_path}' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')"
                    );

                    if ($i == 2000) {
                        $select_sql .= "
                            SELECT
                                {$temp_table_nendo}.item_no as item_no,
                                {$temp_table_nendo}.hou_kijyun_no as hou_kijyun_no,
                                {$temp_table_nendo}.genjyo_flg as saisui_kbn_no,
                                {$temp_table_nendo}.regulation_low_limit as regulation_low_limit,
                                {$temp_table_nendo}.regulation_up_limit as regulation_up_limit,
                                {$temp_table_nendo}.input_low_limit as input_low_limit,
                                {$temp_table_nendo}.input_up_limit as input_up_limit,
                                {$temp_table_nendo}.report_low_limit as report_low_limit,
                                {$temp_table_nendo}.report_up_limit as report_up_limit,
                                {$temp_table_nendo}.valid_digits as valid_digits,
                                {$temp_table_nendo}.input_min_digits as input_min_digits,
                                {$temp_table_nendo}.output_min_digits as output_min_digits,
                                {$temp_table_nendo}.comment as insp_criteria_comment,
                                now() as insert_date,
                                999999 as insert_user,
                                now() as update_date,
                                999999 as update_user
                            FROM {$temp_table_nendo}
                        ";
                    } else {
                        $select_sql .= "
                            UNION ALL

                            SELECT
                                {$temp_table_nendo}.item_no as item_no,
                                {$temp_table_nendo}.hou_kijyun_no as hou_kijyun_no,
                                {$temp_table_nendo}.genjyo_flg as saisui_kbn_no,
                                {$temp_table_nendo}.regulation_low_limit as regulation_low_limit,
                                {$temp_table_nendo}.regulation_up_limit as regulation_up_limit,
                                {$temp_table_nendo}.input_low_limit as input_low_limit,
                                {$temp_table_nendo}.input_up_limit as input_up_limit,
                                {$temp_table_nendo}.report_low_limit as report_low_limit,
                                {$temp_table_nendo}.report_up_limit as report_up_limit,
                                {$temp_table_nendo}.valid_digits as valid_digits,
                                {$temp_table_nendo}.input_min_digits as input_min_digits,
                                {$temp_table_nendo}.output_min_digits as output_min_digits,
                                {$temp_table_nendo}.comment as insp_criteria_comment,
                                now() as insert_date,
                                999999 as insert_user,
                                now() as update_date,
                                999999 as update_user
                            FROM {$temp_table_nendo}
                        ";
                    }
                }

                // // 検査基準マスタ_【m_inspection_criteria】
                // $statement_text->statement_temp = "
                //     CREATE TEMPORARY TABLE $temp_table_name (
                //             item_no integer
                //             , hou_kijyun_no integer
                //             , genjyo_flg integer
                //             , regulation_low_limit numeric(18, 8)
                //             , regulation_up_limit numeric(18, 8)
                //             , register_date timestamp(6) without time zone
                //             , basic_dsp_digits integer
                //             , input_low_limit numeric(18, 8)
                //             , input_up_limit numeric(18, 8)
                //             , report_low_limit numeric(18, 8)
                //             , report_up_limit numeric(18, 8)
                //             , valid_digits integer
                //             , input_min_digits integer
                //             , output_min_digits integer
                //             , comment character varying(50)
                //             , end_date timestamp(6) without time zone
                //     );
                // ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (item_no,
                        hou_kijyun_no,
                        saisui_kbn_no,
                        regulation_low_limit,
                        regulation_up_limit,
                        input_low_limit,
                        input_up_limit,
                        report_low_limit,
                        report_up_limit,
                        valid_digits,
                        input_min_digits,
                        output_min_digits,
                        insp_criteria_comment,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                        {$select_sql}
                ";

                break;
            case 't_inspection_result':
                // 検査結果_【t_inspection_result】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            point_no integer
                            , item_no integer
                            , saisui_date timestamp(6) without time zone
                            , saisui_time character varying(50)
                            , saisui_bunrui_no integer
                            , saisui_day character varying(50)
                            , saisui_kbn_code integer
                            , inspection_kbn_code integer
                            , saisui_person integer
                            , constant_qualitative_flg integer
                            , constant_data numeric(18, 8)
                            , qualitative_data character varying(512)
                            , exam_person integer
                            , confirm_person integer
                            , comment character varying(128)
                            , D character varying(50)
                            , W character varying(50)
                            , M character varying(50)
                            , R character varying(50)
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (point_no,
                        item_no,
                        saisui_date,
                        saisui_time,
                        inspection_kbn_code,
                        constant_qualitative_flg,
                        constant_data,
                        qualitative_data,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.point_no as point_no,
                        {$temp_table_name}.item_no as item_no,
                        {$temp_table_name}.saisui_date as saisui_date,
                        {$temp_table_name}.saisui_time as saisui_time,
                        {$temp_table_name}.inspection_kbn_code as inspection_kbn_code,
                        {$temp_table_name}.constant_qualitative_flg as constant_qualitative_flg,
                        {$temp_table_name}.constant_data as constant_data,
                        {$temp_table_name}.qualitative_data as qualitative_data,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}
                ";

                break;
            case 't_input_fixed_date':
                // 入力データ確定日_【t_input_fixed_date】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            input_dsp_no integer
                            , saisui_date timestamp(6) without time zone
                            , input_fixed_date timestamp(6) without time zone
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (input_dsp_no,
                        saisui_date,
                        input_fixed_date,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.input_dsp_no as input_dsp_no,
                        {$temp_table_name}.saisui_date as saisui_date,
                        {$temp_table_name}.input_fixed_date as input_fixed_date,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}
                ";

                break;
            case 't_unyou':
                // 運用メモ_【t_unyou】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            unyou_id integer
                            , unyou_title character varying(50)
                            , unyou_date date
                            , unyou_memo text
                            , unyou_bikou text
                            , file_path character varying(255)
                            , info_keisai_flg character varying(50)
                            , delete_flg character varying(50)
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (unyou_id,
                        unyou_title,
                        unyou_date,
                        unyou_memo,
                        unyou_bikou,
                        file_path,
                        info_keisai_flg,
                        delete_flg,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.unyou_id as unyou_id,
                        {$temp_table_name}.unyou_title as unyou_title,
                        {$temp_table_name}.unyou_date as unyou_date,
                        {$temp_table_name}.unyou_memo as unyou_memo,
                        {$temp_table_name}.unyou_bikou as unyou_bikou,
                        {$temp_table_name}.file_path as file_path,
                        {$temp_table_name}.info_keisai_flg as info_keisai_flg,
                        {$temp_table_name}.delete_flg as delete_flg,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}
                ";

                break;
            case 't_info':
                // お知らせ管理_【t_info】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            info_id integer
                            , info_date timestamp(6) without time zone
                            , info_title text
                            , info_text text
                            , info_link character varying(255)
                            , file_path character varying(255)
                            , delete_flg character varying(255)
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (info_id,
                        info_date,
                        info_text,
                        info_link,
                        file_path,
                        unyou_id,
                        delete_flg,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.info_id as info_id,
                        {$temp_table_name}.info_date as info_date,
                        {$temp_table_name}.info_text as info_text,
                        {$temp_table_name}.info_link as info_link,
                        {$temp_table_name}.file_path as file_path,
                        NULL as unyou_id,
                        {$temp_table_name}.delete_flg as delete_flg,
                        now() as insert_date,
                        $ikou_user as insert_user,
                        now() as update_date,
                        $ikou_user as update_user
                    FROM {$temp_table_name}
                ";

                break;

            case 'm_statistics':
                // 統計値マスタ_【m_statistics】
                $statement_text->statement_temp = "
                    CREATE TEMPORARY TABLE $temp_table_name (
                            point_no integer
                            , item_no integer
                            , saisui_kbn_code integer
                            , inspection_kbn_code integer
                            , start_date timestamp(6) without time zone
                            , end_date timestamp(6) without time zone
                            , statistics_count integer
                            , standard_deviation numeric(18, 8)
                            , statistics_average numeric(18, 8)
                            , c_sigma double precision
                            , c_upper numeric(18, 8)
                            , c_lower numeric(18, 8)
                    );
                ";
                $statement_text->statement_main = "
                    INSERT INTO $table_name
                        (point_no,
                        item_no,
                        inspection_kbn_code,
                        statistics_start_date,
                        statistics_end_date,
                        statistics_count,
                        standard_deviation,
                        statistics_average,
                        c_sigma,
                        c_upper,
                        c_lower,
                        insert_date,
                        insert_user,
                        update_date,
                        update_user)
                    SELECT
                        {$temp_table_name}.point_no as point_no,
                        {$temp_table_name}.item_no as item_no,
                        {$temp_table_name}.inspection_kbn_code as inspection_kbn_code,
                        {$temp_table_name}.start_date as statistics_start_date,
                        {$temp_table_name}.end_date as statistics_end_date,
                        {$temp_table_name}.statistics_count as statistics_count,
                        {$temp_table_name}.standard_deviation as standard_deviation,
                        {$temp_table_name}.statistics_average as statistics_average,
                        {$temp_table_name}.c_sigma as c_sigma,
                        {$temp_table_name}.c_upper as c_upper,
                        {$temp_table_name}.c_lower as c_lower,
                        now() as insert_date,
                        999999 as insert_user,
                        now() as update_date,
                        999999 as update_user
                    FROM {$temp_table_name}
                ";

                break;

            default:
                # code...

        }

        return $statement_text;
    }

    /**
     * ユーザパスワードを暗号化に変換
     * 
     * @param Request $request
     * @return response 結果
     */
    public function migrateHashingPassword()
    {
        DB::beginTransaction();
        try {
            $users = DB::table('m_user')->get();

            foreach ($users as $user) {
                DB::table('m_user')
                    ->where('user_id', '=', $user->user_id)
                    ->update([
                        'user_password'                => Hash::make($user->user_password)
                    ]);
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);

            return false;
        }
    }

    /**
     * 検査情報登録画面のメニューを取得
     * 
     * @return response 結果
     */
    public function getInputMenu()
    {
        try {
            // 初期化
            $security_level = auth('sanctum')->user()->security_level;
            $affiliation_section_no = auth('sanctum')->user()->affiliation_section_no;
            $where = "";
            $bindValue = array();
            $orderBy = "m_input_menu.input_order";


            // 検索条件設定
            if ($security_level == 0) {
                if (strval(sprintf("%02d", $affiliation_section_no)) !== '01' && strval(sprintf("%02d", $affiliation_section_no)) !== '13') {
                    // 水質管理センター以外の場合
                    $where .= " AND m_input_menu.affiliation_section_no = :affiliation_section_no ";
                    $where .= " AND m_input_menu.input_parent_menu_no > 1 ";
                    $bindValue['affiliation_section_no'] = $affiliation_section_no;
                    $orderBy = "m_input_menu.input_hierarchy, m_input_menu.input_order";
                }
            }

            $SQL = <<<SQL
                    SELECT
                        m_input_menu.*
                        , m_input_dsp_config.inspection_kbn_code
                        , m_inspection_kbn.inspection_kbn_name
                    FROM
                        m_input_menu
                        LEFT JOIN m_input_dsp_config
                            ON m_input_menu.input_dsp_no = m_input_dsp_config.input_dsp_no
                        LEFT JOIN m_inspection_kbn
                            ON m_input_dsp_config.inspection_kbn_code = m_inspection_kbn.inspection_kbn_code
                    WHERE
                        1 = 1
                        $where
                    ORDER BY
                        $orderBy
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);

            return false;
        }
    }

    /**
     * 報告書画面系のメニューを取得
     * 
     * @return response 結果
     */
    public function getReportMenu($affiliation_section_no, $security_level)
    {
        DB::beginTransaction();

        // 初期化
        $security_level = auth('sanctum')->user()->security_level;
        $affiliation_section_no = auth('sanctum')->user()->affiliation_section_no;
        $where = "";
        $bindValue = array();
        $orderBy = "report_menu.report_order";

        // 検索条件設定
        // if ($security_level == 1) {
        //     if ($affiliation_section_no == '01') {
        //         // 水質管理センターの場合
        //         $where .= " AND report_menu.affiliation_section_no = :affiliation_section_no ";
        //         $where .= " AND report_menu.report_hierarchy = 1 ";
        //         $bindValue['affiliation_section_no'] = $affiliation_section_no;
        //     } else {
        //         // 水質管理センター以外の場合
        //         $where .= " AND report_menu.affiliation_section_no = :affiliation_section_no ";
        //         $bindValue['affiliation_section_no'] = $affiliation_section_no;
        //     }
        // }

        // 検索条件設定
        if ($security_level == 0) {
            if (strval(sprintf("%02d", $affiliation_section_no)) !== '01' && strval(sprintf("%02d", $affiliation_section_no)) !== '13') {
                // 水質管理センター以外の場合
                $where .= " AND (report_menu.affiliation_section_no = :affiliation_section_no OR report_menu.affiliation_section_no IS NULL) ";
                $where .= " AND report_menu.report_parent_menu_no > 0 ";
                $bindValue['affiliation_section_no'] = $affiliation_section_no;
                $orderBy = "report_menu.report_hierarchy, report_menu.report_order";
            }
        }

        try {
            $SQL = <<<SQL
                SELECT
                      report_menu.*
                    , config.report_category
                    , config.report_type
                FROM
                    m_report_menu AS report_menu
                LEFT JOIN
                    m_report_config AS config
                 ON report_menu.report_no = config.report_no
                WHERE
                    1 = 1
                    $where
                ORDER BY
                    $orderBy
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);

            return false;
        }
    }

    /**
     * 検査情報の入力マスクデータを取得
     * 
     * @return response 結果
     */
    public function getSelectedDspInfo($input_menu_no)
    {
        DB::beginTransaction();
        try {
            $bindValue = array(
                'input_menu_no' => $input_menu_no
            );

            $SQL = <<<SQL
                    SELECT
                        m_input_menu.input_dsp_no
                        , m_input_dsp_config.inspection_kbn_code
                    FROM
                        m_input_menu
                        INNER JOIN m_input_dsp_config
                            ON m_input_menu.input_dsp_no = m_input_dsp_config.input_dsp_no
                    WHERE
                        m_input_menu.input_menu_no = :input_menu_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);

            return false;
        }
    }

    /**
     * 地点情報を取得
     * 
     * @return response 結果
     */
    public function getPointInfo($point_no)
    {
        DB::beginTransaction();
        try {
            $bindValue = array(
                'point_no' => $point_no
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_saisui_point
                    WHERE
                        point_no = :point_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);

            return false;
        }
    }

    /**
     * 所属課マスタを取得
     * 
     * @return response 結果
     */
    public function getAffiliationData()
    {
        DB::beginTransaction();
        try {
            $bindValue = array();

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_affiliation
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);

            return false;
        }
    }

    /**
     * 親ラベルをリストで取得（入力画面）
     * 
     * @return response 結果
     */
    public function getParentMenuData()
    {
        DB::beginTransaction();
        try {
            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_input_menu
                    WHERE
                        m_input_menu.label_flg = 1
                    ORDER BY
                        m_input_menu.input_order ASC
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);

            return false;
        }
    }

    /**
     * 親ラベルをリストで取得（帳票出力）
     * 
     * @return response 結果
     */
    public function getParentMenuReportData($flg = 1)
    {
        DB::beginTransaction();
        try {
            $bindValue['flg'] = $flg;
            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_report_menu
                    WHERE
                        m_report_menu.label_flg = :flg
                    ORDER BY
                        m_report_menu.report_order ASC
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);

            return false;
        }
    }

    /**
     * 参照報告書をリストで取得
     * 
     * @return response 結果
     */
    public function getRefRptMenuListData()
    {
        DB::beginTransaction();
        try {
            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_report_config
                    ORDER BY
                        m_report_config.report_no ASC
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);

            return false;
        }
    }

    /**
     * 参照画面をリストで取得
     * 
     * @return response 結果
     */
    public function getRefMenuData()
    {
        DB::beginTransaction();
        try {
            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_input_dsp_config
                    ORDER BY
                        m_input_dsp_config.input_dsp_no ASC
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);

            return false;
        }
    }

    /**
     * 検査項目大分類マスタ
     * 
     * @return response 結果
     */
    public function fetchItemDaiCategoryData()
    {
        DB::beginTransaction();
        try {
            $SQL = <<<SQL
                    SELECT
                        item_dai_category_no
                        , item_dai_category_name
                    FROM
                        m_inspection_dai_category
                    ORDER BY
                        item_dai_order ASC
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);

            return false;
        }
    }

    /**
     * 検査項目中分類マスタ
     * 
     * @return response 結果
     */
    public function fetchItemTyuCategoryData()
    {
        DB::beginTransaction();
        try {
            $SQL = <<<SQL
                    SELECT
                        item_tyu_category_no
                        , item_tyu_category_name
                    FROM
                        m_inspection_tyu_category
                    ORDER BY
                        item_tyu_order ASC
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);

            return false;
        }
    }

    /**
     * 施設マスタ
     * 
     * @return response 結果
     */
    public function fetchSisetuData()
    {
        DB::beginTransaction();
        try {
            $SQL = <<<SQL
                    SELECT
                        sisetu_no
                        , sisetu_name
                    FROM
                        m_sisetu
                    ORDER BY
                        sisetu_order ASC
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);

            return false;
        }
    }

    /**
     * 処理過程マスタ
     * 
     * @return response 結果
     */
    public function fetchProcessData()
    {
        DB::beginTransaction();
        try {
            $SQL = <<<SQL
                    SELECT
                        process_no
                        , process_name
                    FROM
                        m_process
                    ORDER BY
                        process_order ASC
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);

            return false;
        }
    }

    /**
     * 採水区分マスタ
     * 
     * @return response 結果
     */
    public function fetchSaisuiKbnData()
    {
        DB::beginTransaction();
        try {
            $SQL = <<<SQL
                    SELECT
                        saisui_kbn_no
                        , saisui_kbn_name
                    FROM
                        m_saisui_kbn
                    ORDER BY
                        saisui_kbn_no ASC
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);

            return false;
        }
    }

    public function getCurrentTime()
    {
        try {
            $SQL = <<<SQL
                SELECT
                    TO_CHAR(CURRENT_TIMESTAMP, 'YYYY/MM/DD HH24:MI:SS.MS') AS display_time
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result[0];
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }
    }

    /**
     * 動画マニュアル情報を取得
     * 
     * @return response 結果
     */
    public function fetchManualVideoList()
    {
        DB::beginTransaction();
        try {
            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        m_movie
                    ORDER BY
                        movie_id ASC
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);

            return false;
        }
    }

    /**
     * 報告書特殊項目情報 取得
     * @param int $reportNo 報告書番号
     * @return array|false 報告書特殊項目情報|取得失敗(false)
     */
    public static function getReportTokusyuItem($reportNo)
    {
        try {
            $bindValue = [
                'report_no'    => $reportNo,
            ];

            $SQL = <<<SQL
                    SELECT
                          tokusyu_item_no
                        , report_no
                        , item_type
                        , row_col_type
                        , report_item_name
                        , item_order
                    FROM
                        m_report_item_tokusyu
                    WHERE
                        report_no = :report_no
                    ORDER BY
                        item_order
SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            Log::info($e->getTraceAsString());
        }
        return false;
    }

    /**
     * 報告書タイプマスタ 取得
     *
     * @param int $reportNo 報告書番号
     * @return array|false 報告書タイプ情報|取得失敗(false)
     */
    public static function getReportType($report_type = null)
    {
        try {
            // 初期化
            $where = "";
            $bindValue = array();

            if (isset($report_type)) {
                $where = " AND report_type = :report_type";
                $bindValue = [
                    'report_type' => $report_type
                ];
            }

            $SQL = <<<SQL
                    SELECT
                          m_type.report_type
                        , m_type.report_type_name
                        , m_base.report_no
                        , m_base.base_file_name
                        , m_base.auto_update_flg
                        , m_base.init_row_count
                        , m_base.init_col_count
                    FROM
                        m_report_type AS m_type
                    LEFT JOIN
                        m_report_base AS m_base
                     ON m_type.report_type = m_base.report_type
                    WHERE
                        1 = 1
                        $where
SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            Log::info($e->getTraceAsString());
        }
        return false;
    }

    /**
     * 報告書構成情報 取得(テンプレート自動更新用)
     *
     * @param int $reportNo 報告書番号
     * @return array|false 報告書構成情報|取得失敗(false)
     */
    public static function getUpdateTmpReportConfig($reportNo)
    {
        try {
            $bindValue = [
                'report_No' => $reportNo
            ];

            $SQL = <<<SQL
                    SELECT
                          m_config.report_type
                        , m_config.report_name
                        , m_config.data_sheet_type
                        , m_config.row_start_cell_name
                        , m_config.col_start_cell_name
                        , m_config.dsp_up_limit
                        , m_config.dsp_low_limit
                        , m_config.template_file
                        , m_base.base_file_name
                        , m_base.init_row_count
                        , m_base.init_col_count
                    FROM
                        m_report_config AS m_config
                    LEFT JOIN
                        m_report_type AS m_type
                     ON m_config.report_type = m_type.report_type
                    LEFT JOIN
                        m_report_base AS m_base
                     ON m_type.report_type = m_base.report_type
                    AND m_config.report_no = m_base.report_no
                    WHERE
                        m_config.report_no = :report_No
SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            Log::info($e->getTraceAsString());
        }
        return false;
    }

    /**
     * 報告書地点情報 取得(テンプレート自動更新用)
     *
     * @param int $reportNo 報告書番号
     * @return array|false 報告書地点情報|取得失敗(false)
     */
    public static function getUpdateTmpReportPoint($reportNo)
    {
        try {
            $bindValue = [
                'report_No' => $reportNo
            ];

            $SQL = <<<SQL
                    SELECT
                          m_point.report_point_name AS cell_name
                        , saisui_point.point_no
                        , saisui_point.saisui_kbn_no
                        , saisui_point.process_no
                        , sisetu.sisetu_name
                        , 1 AS item_type
                    FROM
                        m_report_point AS m_point
                    LEFT JOIN
                        m_saisui_point AS saisui_point
                     ON m_point.point_no = saisui_point.point_no
                    LEFT JOIN
                        m_sisetu AS sisetu
                     ON saisui_point.sisetu_no = sisetu.sisetu_no
                    WHERE
                        m_point.report_no = :report_No
                    ORDER BY
                        m_point.point_order
SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            Log::info($e->getTraceAsString());
        }
        return false;
    }

    /**
     * 報告書項目情報 取得(テンプレート自動更新用)
     *
     * @param int $reportNo 報告書番号
     * @return array|false 報告書項目情報|取得失敗(false)
     */
    public static function getUpdateTmpReportItem($reportNo)
    {
        try {
            $bindValue = [
                'report_No' => $reportNo
            ];

            $SQL = <<<SQL
                    WITH kijyun_data AS (
                        SELECT
                              report_item.item_no
                            , kijyun.regulation_low_limit
                            , kijyun.regulation_up_limit
                            , kijyun.input_low_limit
                            , kijyun.input_up_limit
                            , kijyun.report_low_limit
                            , kijyun.report_up_limit
                            , kijyun.valid_digits
                            , kijyun.input_min_digits
                            , kijyun.output_min_digits
                            , ROW_NUMBER() OVER(PARTITION BY report_item.item_no ORDER BY m_point.point_no) AS row_no
                        FROM
                            m_report_item AS report_item
                        INNER JOIN
                            m_report_point AS m_point
                         ON report_item.report_no = m_point.report_no
                        INNER JOIN
                            m_saisui_point AS saisui_point
                         ON m_point.point_no = saisui_point.point_no
                        INNER JOIN (
                            SELECT DISTINCT ON (item_no, saisui_kbn_no)
                                *
                            FROM
                                m_inspection_criteria
                            ORDER BY
                                  item_no
                                , saisui_kbn_no
                                , hou_kijyun_no DESC
                        ) AS kijyun
                         ON report_item.item_no = kijyun.item_no
                        AND saisui_point.saisui_kbn_no = kijyun.saisui_kbn_no
                        WHERE
                            report_item.report_no = :report_No
                    )
                    SELECT
                          m_item.item_no
                        , m_item.report_item_name AS cell_name
                        , m_item.unit_cell_name
                        , m_item.target_cell_name
                        , m_item.base_cell_name
                        , m_item.number_cell_name
                        , m_item.no_name
                        , kensa_item.item_report_name
                        , kensa_item.item_unit
                        , kensa_item.item_tyu_category_no
                        , kijyun_data.regulation_low_limit
                        , kijyun_data.regulation_up_limit
                        , kijyun_data.input_low_limit
                        , kijyun_data.input_up_limit
                        , kijyun_data.report_low_limit
                        , kijyun_data.report_up_limit
                        , kijyun_data.valid_digits
                        , kijyun_data.input_min_digits
                        , kijyun_data.output_min_digits
                        , 1 AS item_type
                    FROM
                        m_report_item AS m_item
                    LEFT JOIN
                        m_inspection_item AS kensa_item
                     ON m_item.item_no = kensa_item.item_no
                    LEFT JOIN
                        kijyun_data
                     ON kensa_item.item_no = kijyun_data.item_no
                    AND kijyun_data.row_no = 1
                    WHERE
                        m_item.report_no = :report_No
                    ORDER BY
                        m_item.item_order
SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            Log::info($e->getTraceAsString());
        }
        return false;
    }

    /**
     * 報告書固定文言情報 取得(テンプレート自動更新用)
     *
     * @param int $reportNo 報告書番号
     * @return array|false 報告書固定文言情報|取得失敗(false)
     */
    public static function getUpdateTmpReportText($reportNo)
    {
        try {
            $bindValue = [
                'report_No' => $reportNo
            ];

            $SQL = <<<SQL
                    SELECT
                          m_text.text_cell_name
                        , m_text.point_no
                    FROM
                        m_report_text AS m_text
                    WHERE
                        m_text.report_no = :report_No
                    ORDER BY
                          m_text.text_cell_name
                        , m_text.text_renban
SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            Log::info($e->getTraceAsString());
        }
        return false;
    }

    /**
     * 報告書特殊項目情報 取得(テンプレート自動更新用)
     *
     * @param int $reportNo 報告書番号
     * @param int $row_col_type 縦横タイプ
     * @return array|false 報告書特殊項目情報|取得失敗(false)
     */
    public static function getUpdateTmpReportTokusyuItem($reportNo, $row_col_type)
    {
        try {
            $bindValue = [
                'report_no'    => $reportNo,
                'row_col_type' => $row_col_type,
            ];

            $SQL = <<<SQL
                    SELECT
                          report_no
                        , item_type
                        , row_col_type
                        , report_item_name AS cell_name
                        , item_order
                    FROM
                        m_report_item_tokusyu
                    WHERE
                        report_no = :report_no
                    AND row_col_type = :row_col_type
                    ORDER BY
                        item_order
SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            Log::info($e->getTraceAsString());
        }
        return false;
    }

    /**
     * 画面表示時の時刻を取得
     *
     */
    public static function getCurrentDisplayTime()
    {
        try {
            $bindValue = [];

            $SQL = <<<SQL
                    SELECT
                        NOW() AS server_time
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->selectOne($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            Log::info($e->getTraceAsString());
        }
        return false;
    }

    /**
     * 検査情報の入力マスクデータを取得
     * 
     * @return response 結果
     */
    public function getSelectedDspNo($input_menu_no)
    {
        DB::beginTransaction();
        try {
            $bindValue = array(
                'input_menu_no' => $input_menu_no
            );

            $SQL = <<<SQL
                    SELECT
                        m_input_menu.input_dsp_no
                    FROM
                        m_input_menu
                    WHERE
                        m_input_menu.input_menu_no = :input_menu_no
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->selectOne($SQL, $bindValue);
            if($result == array()){
                return false;
            }

            return $result->input_dsp_no;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);

            return false;
        }
    }
}
