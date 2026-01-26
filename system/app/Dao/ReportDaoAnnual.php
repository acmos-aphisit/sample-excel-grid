<?php

namespace App\Dao;

use App\Dao\ReportDao;

/**
 * 年報用Dao
 */
class ReportDaoAnnual extends ReportDao
{
    /**
     * 帳票取得クエリ作成
     *
     * @return string 取得用SQL文字列
     */
    protected function getReportQuery(): string
    {
        $SQL = <<<SQL
                With item_data As (
                    With inspect_date AS (
                        SELECT 
                            saisui_date,
                            saisui_time
                        FROM
                            (
                                SELECT DISTINCT
                                    saisui_date,
                                    saisui_time,
                                    row_number() over (PARTITION BY date_trunc('month', saisui_date) ORDER BY saisui_time) as sort
                                FROM
                                    t_inspection_result
                                WHERE
                                    point_no = :point_no
                                    AND item_no = :item_no
                                    AND saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                                    AND inspection_kbn_code = :inspection_kbn_code
                            )
                        WHERE
                            sort = 1
                    ), annual_date AS (
                        SELECT generate_series(:saisui_date_start::date, :saisui_date_end::date, '1 month') as annual_date
                    )
                    SELECT
                        id.saisui_date,
                        ad.annual_date,
                        id.saisui_time,
                        mi.item_no,
                        mi.item_order
                    FROM
                        m_report_item mi
                    CROSS JOIN
                        annual_date ad
                    LEFT JOIN
                        inspect_date id ON date_trunc('month', ad.annual_date) = date_trunc('month', id.saisui_date)
                    WHERE
                        mi.report_no = :report_no
                    ORDER BY
                        id.saisui_date,
                        mi.item_order
                ), inspaction_data AS (
                    SELECT *
                    FROM t_inspection_result
                    WHERE point_no = :point_no
                    AND inspection_kbn_code = :inspection_kbn_code
                )
                SELECT
                    CASE constant_qualitative_flg
                        WHEN 1 THEN CAST(configure_fixed_quantity_data(ti.constant_data, ti.item_no, ti.point_no, cast(:saisui_date_start as varchar),:report_no,:inspection_kbn_code) as TEXT) 
                        WHEN 2 THEN ti.qualitative_data
                        ELSE NULL END AS inspection_data,
                    ti.constant_qualitative_flg,
                    mi.item_no,
                    mi.item_order,
                    sp.saisui_kbn_no,
                    sp.point_no,
                    sp.point_report_name,
                    rp.point_order,
                    ti.inspection_kbn_code
                FROM
                    item_data mi
                LEFT JOIN
                    inspaction_data ti ON mi.item_no = ti.item_no
                    AND mi.saisui_date = ti.saisui_date
                    AND mi.saisui_time = ti.saisui_time
                LEFT JOIN
                    m_saisui_point sp ON sp.point_no = ti.point_no
                LEFT JOIN
                    m_report_point rp ON rp.report_no = :report_no
                AND rp.point_no = sp.point_no
                ORDER BY
                    mi.annual_date,
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
            'point_no' => $pointNo,
            'item_no' => $itemNo,
            'inspection_kbn_code' => $inspectionKbnCode,
            'saisui_date_start' => $nendo['date_start'],
            'saisui_date_end' => $nendo['date_end'],
        ];
        return $bindValue;
    }

    /**
     * 年報帳票出力情報取得
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

    /**
     * 年度開始終了日時取得
     *
     * @param string $date 年度取得元年月
     * @return array 年度開始日時/終了日時配列
     */
    protected function getNendoStartEnd(string $date): array
    {
        // 年度の開始年を取得(採水年月-3か月の年をスタートとする)
        $tmpNenGetsu = explode('/', date("Y/m/d", strtotime("$date -3 month")));
        $startYear = intval($tmpNenGetsu[0]);
        $endYear = intval($tmpNenGetsu[0]) + 1;

        // 年度の開始日と終了日を算出する。
        return [
            'date_start' => "{$startYear}/04/01",
            'date_end' => "{$endYear}/03/31"
        ];
    }
}
