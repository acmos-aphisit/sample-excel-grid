<?php

namespace App\Dao;

use App\Dao\ReportDaoAnnual;

/**
 * 年報用Dao(全地点及び20000以外の検査区分結果取得)
 */
class ReportDaoAnnualNo610 extends ReportDaoAnnual
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
                        st2.item_order,
                        row_number() over (PARTITION BY st3.point_no, st2.item_no ORDER BY st3.point_order) as sort
                    from
                        m_report_config st1
                        inner join m_report_item st2 on st2.report_no = st1.report_no
                        inner join m_report_point st3 on st3.report_no = st1.report_no
                    where
                        st1.report_no = :report_no
                ), item_data As (
                    With inspect_date AS (
                        SELECT DISTINCT
                            ti.*,
                            row_number() over (PARTITION BY ti.point_no ORDER BY ti.saisui_date, ti.saisui_time) as sort
                        FROM
                            t_inspection_result ti
                        WHERE
                            ti.item_no = :item_no
                            AND ti.point_no in (select point_no from m_report_point where report_no = :report_no)
                            AND saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                            AND inspection_kbn_code = :inspection_kbn_code
                        ORDER BY ti.point_no, ti.item_no, sort 
                    )
                    SELECT
                        id.saisui_date,
                        id.saisui_time,
                        id.point_no,
                        id.sort,
                        mi.item_no,
                        mi.item_order
                    FROM
                        m_report_item mi
                    CROSS JOIN
                        inspect_date id
                    WHERE
                        mi.report_no = :report_no
                    ORDER BY
                        id.saisui_date,
                        id.sort,
                        mi.item_order
                ), inspaction_data AS (
                    SELECT
                        *
                    FROM (
                        SELECT
                            ti.*,
                            row_number() over (PARTITION BY ti.point_no, ti.item_no, saisui_date ORDER BY saisui_time) as sort
                        FROM t_inspection_result ti
                        INNER JOIN point_data pd ON ti.point_no = pd.point_no AND ti.item_no = pd.item_no
                        WHERE ti.inspection_kbn_code <> 20000
                        AND ti.saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                    )
                    WHERE sort = 1
                )
                SELECT
                    CASE constant_qualitative_flg
                        WHEN 1 THEN CAST(ti.constant_data as TEXT)
                        WHEN 2 THEN ti.qualitative_data
                        ELSE NULL END AS inspection_data,
                    ti.constant_qualitative_flg,
                    pd.item_no,
                    sp.saisui_kbn_no,
                    pd.point_no,
                    sp.point_report_name,
                    pd.point_order,
                    mi.saisui_date,
                    pd.item_order
                FROM
                    point_data pd
                LEFT JOIN
                    item_data mi ON pd.point_no = mi.point_no
                    AND pd.sort = mi.sort
                    AND pd.item_no = mi.item_no
                    AND pd.item_order = mi.item_order
                LEFT JOIN
                    inspaction_data ti ON mi.item_no = ti.item_no
                    AND mi.point_no = ti.point_no
                    AND mi.saisui_date = ti.saisui_date
                LEFT JOIN
                    m_saisui_point sp ON sp.point_no = ti.point_no
                ORDER BY
                    pd.point_order,
                    mi.saisui_date,
                    pd.item_order
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
        $nendo = $this->getNendoStartEnd($saisuiDate);

        $bindValue = [
            'report_no' => $reportNo,
            'item_no' => $itemNo,
            'inspection_kbn_code' => $inspectionKbnCode,
            'saisui_date_start' => $nendo['date_start'],
            'saisui_date_end' => $nendo['date_end'],
        ];
        return $bindValue;
    }
}
