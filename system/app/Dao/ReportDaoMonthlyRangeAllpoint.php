<?php

namespace App\Dao;

use App\Dao\ReportDaoMonthly;

/**
 * 月報用Dao(対象月末日まで取得)
 */
class ReportDaoMonthlyRangeAllpoint extends ReportDaoMonthly
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
                ), item_data As (
                    WITH inspect_date AS (
                        SELECT 
                            saisui_date,
                            saisui_time,
                            point_no,
                            point_order
                        FROM
                            (
                                SELECT DISTINCT
                                    ti.saisui_date,
                                    ti.saisui_time,
                                    ti.point_no,
                                    pd.point_order,
                                    row_number() over (PARTITION BY ti.saisui_date, ti.point_no ORDER BY ti.saisui_time) as sort
                                FROM
                                    t_inspection_result ti
                                    INNER JOIN point_data pd ON ti.point_no = pd.point_no AND ti.item_no = pd.item_no
                                WHERE
                                    ti.item_no = :item_no
                                    AND ti.saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                                    AND ti.inspection_kbn_code = :inspection_kbn_code
                                ORDER BY pd.point_order
                            )
                        WHERE
                            sort = 1
                    ), month_date AS (
                        select
                            CASE 
                                WHEN n.day_num <= extract( 
                                    day 
                                    from
                                        date_trunc('month', :saisui_date_start::date) + interval '1 month - 1 day'
                                )
                                    then to_date(extract(year from :saisui_date_start::date)::text  || '-' || extract(month from :saisui_date_start::date)::text  || '-' || n.day_num::text,'YYYY/MM/DD')
                                ELSE null
                                END AS month_date
                        from
                            (select generate_series(1, 31) as day_num) as n
                    )
                    SELECT
                        id.saisui_date,
                        id.saisui_time,
                        mi.point_no,
                        mi.point_order,
                        md.month_date,
                        mi.item_no,
                        mi.item_order
                    FROM
                        (
                            SELECT
                            mi.*,
                            mp.point_no,
                            mp.point_order
                            FROM
                            m_report_item mi
                            INNER JOIN m_report_point mp ON mi.report_no = mp.report_no
                            WHERE mi.report_no = :report_no
                            ORDER BY mp.point_order,mi.item_order
                        ) mi
                    CROSS JOIN
                        month_date md
                    LEFT JOIN
                        inspect_date id ON md.month_date = id.saisui_date AND mi.point_order = id.point_order
                    WHERE
                        mi.report_no = :report_no
                    ORDER BY
                        md.month_date,
                        mi.item_order,
                        id.point_order

                ), inspection_month AS(
                    SELECT ti.*, pd.point_order
                    FROM t_inspection_result ti
                    INNER JOIN point_data pd ON ti.point_no = pd.point_no AND ti.item_no = pd.item_no
                    WHERE ti.saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                    AND inspection_kbn_code = :inspection_kbn_code
                )
                SELECT
                    CASE 
                        WHEN mi.item_no = 1 THEN TO_CHAR(mi.month_date, 'YYYY/MM/DD')
                        WHEN constant_qualitative_flg = 1 THEN CAST(configure_fixed_quantity_data(ti.constant_data, ti.item_no, ti.point_no, cast(:saisui_date_start as varchar),:report_no,:inspection_kbn_code) as TEXT)
                        WHEN constant_qualitative_flg = 2 THEN ti.qualitative_data
                        ELSE NULL END AS inspection_data,
                    ti.constant_qualitative_flg,
                    mi.item_no,
                    sp.saisui_kbn_no,
                    mi.point_no,
                    sp.point_report_name,
                    mi.month_date,
                    mi.item_order,
                    mi.point_no,
                    mi.point_order
                FROM
                    item_data mi
                LEFT JOIN
                    inspection_month ti ON mi.item_no = ti.item_no
                    AND mi.point_order = ti.point_order
                    AND mi.saisui_date = ti.saisui_date
                    AND mi.saisui_time = ti.saisui_time
                LEFT JOIN
                    m_saisui_point sp ON sp.point_no = ti.point_no
                ORDER BY
                    mi.month_date,
                    mi.point_order,
                    mi.item_order
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
