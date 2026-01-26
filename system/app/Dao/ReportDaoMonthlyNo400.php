<?php

namespace App\Dao;

use App\Dao\ReportDao;

/**
 * 月報用Dao
 */
class ReportDaoMonthlyNo400 extends ReportDao
{
    /**
     * 帳票取得クエリ作成
     *
     * @return string 取得用SQL文字列
     */
    protected function getReportQuery(): string
    {
        $SQL = <<<SQL
                WITH inspection_month AS(
                    SELECT 
                        CASE 
                            WHEN saisui_date < '2021/04/01' AND item_no = 2486 THEN 2480
                            WHEN saisui_date > '2021/03/31' AND item_no = 2480 THEN 2486
                            ELSE item_no END item_no
                        , point_no
                        , constant_qualitative_flg
                        , constant_data
                        , qualitative_data
                        , inspection_kbn_code
                    FROM t_inspection_result
                    WHERE point_no = :point_no
                    AND saisui_date = :saisui_date
                    AND saisui_time = :saisui_time
                    AND inspection_kbn_code = :inspection_kbn_code
                )
                SELECT
                    CASE constant_qualitative_flg
                        WHEN 1 THEN CAST(ti.constant_data as TEXT)
                        WHEN 2 THEN ti.qualitative_data
                        ELSE NULL END AS inspection_data,
                    ti.constant_qualitative_flg,
                    mi.item_no,
                    sp.saisui_kbn_no,
                    sp.point_no,
                    sp.point_report_name,
                    ti.inspection_kbn_code
                FROM
                    m_report_item mi
                LEFT JOIN
                    inspection_month ti ON mi.item_no = ti.item_no
                LEFT JOIN
                    m_saisui_point sp ON sp.point_no = ti.point_no
                WHERE
                    mi.report_no = :report_no
                ORDER BY mi.item_order
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
            'point_no' => $pointNo,
            'saisui_date' => $saisuiDate,
            'saisui_time' => $saisuiTime,
            'inspection_kbn_code' => $inspectionKbnCode,
        ];
        return $bindValue;
    }

    /**
     * 月報帳票出力情報取得
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
