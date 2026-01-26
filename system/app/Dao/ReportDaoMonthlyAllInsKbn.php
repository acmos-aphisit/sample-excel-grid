<?php

namespace App\Dao;

use App\Dao\ReportDaoMonthly;

/**
 * 月報用Dao(対象地点全検査区分取得)
 */
class ReportDaoMonthlyAllInsKbn extends ReportDaoMonthly
{
    /**
     * 帳票取得クエリ作成
     *
     * @return string 取得用SQL文字列
     */
    protected function getReportQuery(): string
    {
        $SQL = <<<SQL
                SELECT 
                    inspection_data,
                    constant_qualitative_flg,
                    item_no,
                    saisui_kbn_no,
                    point_no,
                    point_report_name,
                    point_order,
                    item_order
                FROM (
                    SELECT
                        DISTINCT
                        CASE constant_qualitative_flg
                            WHEN 1 THEN CAST(configure_fixed_quantity_data(t2.constant_data, t2.item_no, t2.point_no, cast(:saisui_date as varchar),:report_no,:inspection_kbn_code) as TEXT)
                            WHEN 2 THEN t2.qualitative_data
                            ELSE NULL
                        END AS inspection_data,
                        t2.constant_qualitative_flg,
                        t1.item_no,
                        t3.saisui_kbn_no,
                        t3.point_no,
                        t3.point_report_name,
                        t1.point_order,
                        t1.item_order,
                        row_number() over (
                            PARTITION BY t3.point_no, t1.item_no
                            ORDER BY t3.point_no, t1.item_no, t2.saisui_date, t2.saisui_time
                        ) as sort
                    FROM (
                        select
                            st1.report_no,
                            st1.point_no as report_point_no,
                            st1.item_no as report_item_no,
                            st3.point_no,
                            st3.point_order,
                            st2.item_no,
                            st2.report_item_name,
                            st2.item_order
                        from
                            m_report_config st1
                            inner join m_report_item st2 on st2.report_no = st1.report_no
                            inner join m_report_point st3 on st3.report_no = st1.report_no
                        where
                            st1.report_no = :report_no
                    ) t1
                    LEFT JOIN (
                        select
                            *
                        from
                            t_inspection_result
                        where
                            saisui_date = :saisui_date
                            -- and inspection_kbn_code <> :inspection_kbn_code
                            and inspection_kbn_code = :inspection_kbn_code
                    ) t2 on t2.point_no = t1.point_no and t2.item_no = t1.item_no
                    LEFT JOIN m_saisui_point t3 ON t3.point_no = t1.point_no
                )
                WHERE sort = 1
                ORDER BY
                    point_order,
                    item_order
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
        $bindValue = [
            'report_no' => $reportNo,
            'saisui_date' => $saisuiDate,
            // 'inspection_kbn_code' => 20000,
            'inspection_kbn_code' => $inspectionKbnCode,
        ];
        return $bindValue;
    }
}
