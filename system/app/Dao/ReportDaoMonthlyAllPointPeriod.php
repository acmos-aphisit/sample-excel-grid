<?php

namespace App\Dao;

use App\Dao\ReportDaoMonthly;

/**
 * 月報用Dao(対象地点全取得・期間内検査情報取得)
 */
class ReportDaoMonthlyAllPointPeriod extends ReportDaoMonthly
{
    /**
     * 帳票取得クエリ作成
     *
     * @return string 取得用SQL文字列
     */
    protected function getReportQuery(): string
    {
        $SQL = <<<SQL
                WITH point_data AS (
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
                ), inspect_date AS (
                    SELECT 
                        saisui_date,
                        saisui_time,
                        point_no,
                        point_order
                    FROM
                        (
                            SELECT DISTINCT
                                saisui_date,
                                saisui_time,
                                ti.point_no,
                                pd.point_order,
                                row_number() over (
                                    PARTITION BY pd.point_no, date_trunc('month', ti.saisui_date)
                                    ORDER BY ti.saisui_time
                                ) as sort
                            FROM
                                t_inspection_result ti
                                INNER JOIN point_data pd ON ti.point_no = pd.point_no AND ti.item_no = pd.item_no
                            WHERE
                                ti.item_no = :item_no
                                AND saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                                AND inspection_kbn_code = :inspection_kbn_code
                            ORDER BY pd.point_order
                        )
                    WHERE
                        sort = 1
                )
                SELECT
                    CASE constant_qualitative_flg
                        WHEN 1 THEN CAST(t2.constant_data as TEXT)
                        WHEN 2 THEN t2.qualitative_data
                        ELSE NULL
                    END AS inspection_data,
                    t2.constant_qualitative_flg,
                    t1.item_no,
                    t3.saisui_kbn_no,
                    t3.point_no,
                    t3.point_report_name,
                    t1.point_order
                FROM point_data t1
                LEFT JOIN (
                    select
                        ti.*
                    from
                        t_inspection_result ti
                        INNER JOIN inspect_date id
                        ON ti.saisui_date = id.saisui_date
                        AND ti.saisui_time = id.saisui_time
                        AND ti.point_no = id.point_no
                    where
                        inspection_kbn_code = :inspection_kbn_code
                ) t2 on t2.point_no = t1.point_no and t2.item_no = t1.item_no
                LEFT JOIN m_saisui_point t3 ON t3.point_no = t1.point_no
                ORDER BY t1.point_order, t1.item_order
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
        $tmpNenGetsu = explode('/', $saisuiDate);
        // 月初日を取得する
        $tmpNenGetsu[2] = '01';
        $saisuiDateStart = implode('/', $tmpNenGetsu);
        // 月末を取得する
        $saisuitmp = date("Y/m/d", strtotime("$saisuiDateStart 1 month"));
        $saisuiDateEnd = date("Y/m/d", strtotime("$saisuitmp -1 day"));

        $bindValue = [
            'report_no' => $reportNo,
            'item_no' => $itemNo,
            'saisui_date_start' => $saisuiDateStart,
            'saisui_date_end' => $saisuiDateEnd,
            'inspection_kbn_code' => $inspectionKbnCode,
        ];
        return $bindValue;
    }
}
