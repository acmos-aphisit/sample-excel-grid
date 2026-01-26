<?php

namespace App\Dao;

use App\Dao\ReportDao;

/**
 * 週報用Dao
 */
class ReportDaoWeekly extends ReportDao
{
    /**
     * 帳票取得クエリ作成
     *
     * @return string 取得用SQL文字列
     */
    protected function getReportQuery(): string
    {
        $SQL = <<<SQL
                    With point_data AS 
                    ( 
                        select
                            st1.report_no
                            , st1.point_no as report_point_no
                            , st1.item_no as report_item_no
                            , st3.point_no
                            , st3.point_order
                            , st2.item_no
                            , st2.report_item_name
                            , st2.item_order 
                        from
                            m_report_config st1 
                            inner join m_report_item st2 
                                on st2.report_no = st1.report_no 
                            inner join m_report_point st3 
                                on st3.report_no = st1.report_no 
                        where
                            st1.report_no = :report_no
                    ) 
                    , item_data As 
                    (         
                        select
                            week.week_date::date as saisui_date
                            , pd.item_no
                            , pd.item_order
                            , pd.point_no
                            , pd.point_order
                        from
                            ( 
                                SELECT
                                    to_char( 
                                        generate_series( 
                                            :saisui_date_start ::date
                                            , :saisui_date_end ::date
                                            , interval '1 day'
                                        ) 
                                        , 'YYYY/MM/DD'
                                    ) AS week_date
                            ) as week
                        cross join
                            point_data as pd
                        order by
                            saisui_date asc
                            , point_order asc
                            , item_order asc
                    ) 
                    , inspaction_data AS 
                    ( 
                        SELECT
                            ti.*
                            , pd.item_order 
                        FROM
                            t_inspection_result ti 
                            INNER JOIN point_data pd 
                                ON ti.point_no = pd.point_no 
                                AND ti.item_no = pd.item_no 
                        WHERE
                            ti.saisui_date BETWEEN :saisui_date_start AND :saisui_date_end 
                            AND date_trunc('month', ti.saisui_date) = date_trunc('month', CAST(:saisui_date_start as DATE)) 
                            AND ti.inspection_kbn_code = :inspection_kbn_code
                    ) 
                    SELECT
                        CASE constant_qualitative_flg 
                            WHEN 1 THEN CAST(ti.constant_data as TEXT) 
                            WHEN 2 THEN ti.qualitative_data 
                            ELSE NULL 
                            END AS inspection_data
                        , ti.constant_qualitative_flg
                        , mi.item_no
                        , ti.saisui_date
                        , mi.point_no
                        , sp.saisui_kbn_no
                    FROM
                        item_data mi 
                        LEFT JOIN inspaction_data ti 
                            ON mi.item_no = ti.item_no 
                            AND mi.item_order = ti.item_order 
                            AND mi.point_no = ti.point_no 
                            AND mi.saisui_date = ti.saisui_date 
                        LEFT JOIN m_saisui_point sp 
                            ON sp.point_no = ti.point_no 
                    ORDER BY
                        mi.saisui_date
                        , mi.point_order
                        , mi.item_order

                SQL;
        return $SQL;
    }

    /**
     * 帳票取得SQLパラメータ作成
     *
     * @return array 取得用SQLパラメータ配列
     */
    protected function getBindParameter(
        int $reportNo,
        int $pointNo,
        int $itemNo,
        string $saisuiDate,
        string $saisuiTime,
        int $inspectionKbnCode,
    ): array {
        // 採水年月日の終了日付を取得
        $saisuiDateEnd = date("Y/m/d", strtotime("$saisuiDate +6 day"));

        $bindValue = [
            'report_no' => $reportNo,
            // 'item_no' => 1,
            'inspection_kbn_code' => $inspectionKbnCode,
            'saisui_date_start' => $saisuiDate,
            'saisui_date_end' => $saisuiDateEnd,
        ];
        return $bindValue;
    }

    /**
     * 週報帳票出力情報取得
     *
     * @param int $reportNo 報告書番号
     * @param int $pointNo 地点番号
     * @param string $saisuiDate 採水年月日
     * @param string $saisuiTime 採水時刻
     * @param int $inspectionKbnCode 検査区分CD
     * @return array|false 検査結果|取得失敗(false)
     */
    public function getInspectionResultReport(
        int $reportNo,
        int $pointNo,
        int $itemNo,
        string $saisuiDate,
        string $saisuiTime,
        int $inspectionKbnCode,
    ) {
        $SQL = $this->getReportQuery();
        $bindValue = $this->getBindParameter(
            $reportNo,
            $pointNo,
            $itemNo,
            $saisuiDate,
            $saisuiTime,
            $inspectionKbnCode
        );

        return $this->executeSelectData($SQL, $bindValue);
    }
}
