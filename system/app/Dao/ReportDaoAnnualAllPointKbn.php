<?php

namespace App\Dao;

use App\Dao\ReportDaoAnnual;

/**
 * 年報用Dao(全地点及び20000以外の検査区分結果取得)
 */
class ReportDaoAnnualAllPointKbn extends ReportDaoAnnual
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
                    With inspect_date AS (
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
                                        PARTITION BY
                                            pd.point_no 
                                        ORDER BY
                                            date_trunc('month', ti.saisui_date)
                                            , ti.saisui_date
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
                        id.saisui_date,
                        id.saisui_time,
                        id.point_no,
                        id.point_order,
                        mi.item_no,
                        mi.item_order
                    FROM
                        m_report_item mi
                    CROSS JOIN
                        inspect_date id
                    WHERE
                        mi.report_no = :report_no
                    ORDER BY
                        id.point_order,
                        id.saisui_date,
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
                        WHERE 
                        -- ti.inspection_kbn_code <> 20000
                        ti.inspection_kbn_code = :inspection_kbn_code
                        AND ti.saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                    )
                    WHERE sort = 1
                )
                SELECT
                    DISTINCT
                    CASE constant_qualitative_flg
                        WHEN 1 THEN CAST(ti.constant_data as TEXT)
                        WHEN 2 THEN ti.qualitative_data
                        ELSE NULL END AS inspection_data,
                    ti.constant_qualitative_flg,
                    mi.item_no,
                    sp.saisui_kbn_no,
                    sp.point_no,
                    sp.point_report_name,
                    mi.point_order,
                    mi.saisui_date,
                    mi.item_order
                FROM
                    item_data mi
                LEFT JOIN
                    inspaction_data ti ON mi.item_no = ti.item_no
                    AND mi.point_no = ti.point_no
                    AND mi.saisui_date = ti.saisui_date
                    -- AND mi.saisui_time = ti.saisui_time
                LEFT JOIN
                    m_saisui_point sp ON sp.point_no = ti.point_no
                ORDER BY
                    mi.point_order,
                    mi.saisui_date,
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
