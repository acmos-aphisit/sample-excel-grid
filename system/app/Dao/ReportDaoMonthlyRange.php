<?php

namespace App\Dao;

use App\Dao\ReportDaoMonthly;

/**
 * 月報用Dao(対象月末日まで取得)
 */
class ReportDaoMonthlyRange extends ReportDaoMonthly
{
    /**
     * 帳票取得クエリ作成
     *
     * @return string 取得用SQL文字列
     */
    protected function getReportQuery(): string
    {
        $SQL = <<<SQL
                WITH item_data AS (
                    WITH inspect_date AS (
                        SELECT 
                            saisui_date,
                            saisui_time
                        FROM (
                            SELECT DISTINCT
                                saisui_date,
                                saisui_time,
                                row_number() OVER (PARTITION BY saisui_date ORDER BY saisui_time) AS sort
                            FROM
                                t_inspection_result
                            WHERE
                                point_no = :point_no
                                AND item_no = :item_no
                                AND saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                                AND inspection_kbn_code = :inspection_kbn_code
                        )
                        WHERE sort = 1
                    ),
                    month_date AS (
                        SELECT
                            CASE 
                                WHEN n.day_num <= EXTRACT(
                                    day FROM date_trunc('month', :saisui_date_start::date) + interval '1 month - 1 day'
                                )
                                THEN to_date(
                                    EXTRACT(year FROM :saisui_date_start::date)::text || '-' ||
                                    EXTRACT(month FROM :saisui_date_start::date)::text || '-' ||
                                    n.day_num::text,
                                    'YYYY/MM/DD'
                                )
                                ELSE NULL
                            END AS month_date
                        FROM (SELECT generate_series(1, 31) AS day_num) AS n
                    )
                    SELECT
                        id.saisui_date,
                        id.saisui_time,
                        md.month_date,
                        mi.item_no,
                        mi.item_order
                    FROM
                        m_report_item mi
                    CROSS JOIN
                        month_date md
                    LEFT JOIN
                        inspect_date id ON md.month_date = id.saisui_date
                    WHERE
                        mi.report_no = :report_no
                    ORDER BY
                        md.month_date,
                        mi.item_order
                ),
                inspection_month AS (
                    SELECT *
                    FROM t_inspection_result
                    WHERE point_no = :point_no
                    AND inspection_kbn_code = :inspection_kbn_code
                ),
                item_data_with_rn AS (
                    SELECT
                        *,
                        ROW_NUMBER() OVER (
                            PARTITION BY item_no, month_date
                            ORDER BY item_order
                        ) AS rn
                    FROM item_data
                )
                SELECT
                    CASE 
                        WHEN mi.item_no = 1 THEN TO_CHAR(mi.month_date, 'YYYY/MM/DD')
                        WHEN constant_qualitative_flg = 1 THEN CAST(
                            configure_fixed_quantity_data(
                                ti.constant_data,
                                ti.item_no,
                                ti.point_no,
                                CAST(:saisui_date_start AS varchar),
                                :report_no,
                                :inspection_kbn_code
                            ) AS TEXT
                        )
                        WHEN constant_qualitative_flg = 2 THEN ti.qualitative_data
                        ELSE NULL
                    END AS inspection_data,
                    ti.constant_qualitative_flg,
                    mi.item_no,
                    CASE 
                        WHEN mi.rn = 1 THEN mi.item_no::text
                        ELSE mi.item_no::text || '_' || mi.rn
                    END AS item_no_renban,
                    sp.saisui_kbn_no,
                    sp.point_no,
                    sp.point_report_name
                FROM
                    item_data_with_rn mi
                LEFT JOIN
                    inspection_month ti ON mi.item_no = ti.item_no
                                        AND mi.saisui_date = ti.saisui_date
                                        AND mi.saisui_time = ti.saisui_time
                LEFT JOIN
                    m_saisui_point sp ON sp.point_no = ti.point_no
                ORDER BY
                    mi.month_date,
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
            'point_no' => $pointNo,
            'item_no' => $itemNo,
            'saisui_date_start' => $saisuiDateStart,
            'saisui_date_end' => $saisuiDateEnd,
            'inspection_kbn_code' => $inspectionKbnCode,
        ];
        return $bindValue;
    }
}
