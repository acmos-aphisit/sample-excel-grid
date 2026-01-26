<?php

namespace App\Dao;

use App\Dao\ReportDao;

/**
 * 日報用Dao
 */
class ReportDaoDaily extends ReportDao
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
                ), inspection_daily AS(
                    SELECT ti.*,
                        sp.saisui_kbn_no,
                        sp.point_report_name
                    FROM t_inspection_result ti
                    INNER JOIN point_data pd ON ti.point_no = pd.point_no AND ti.item_no = pd.item_no
                    INNER JOIN
                        m_saisui_point sp ON sp.point_no = ti.point_no
                    WHERE (
                        ti.saisui_date = :saisui_date
                        OR ti.saisui_date = CAST(:saisui_date as DATE) + CAST('-1 days' as INTERVAL)
                    )
                    AND CASE WHEN ti.item_no = 1040
                                THEN saisui_date = CAST(:saisui_date as DATE) + CAST('-1 days' as INTERVAL)
                            WHEN ti.item_no = 1060 AND sp.point_report_name <> '利根川取水口'
                                AND sp.sisetu_no IN (5, 11, 12)
                                THEN saisui_date = CAST(:saisui_date as DATE) + CAST('-1 days' as INTERVAL)
                            ELSE saisui_date = :saisui_date END
                    AND CASE WHEN ti.item_no = 8997 AND sp.sisetu_no = 5 THEN inspection_kbn_code = 5100
                            ELSE inspection_kbn_code = :inspection_kbn_code END
                )
                SELECT
                    CASE constant_qualitative_flg
                        WHEN 1 THEN CAST(ti.constant_data as TEXT)
                        WHEN 2 THEN ti.qualitative_data
                        ELSE NULL END AS inspection_data,
                    ti.constant_qualitative_flg,
                    mi.item_no,
                    ti.saisui_kbn_no,
                    ti.point_no,
                    ti.point_report_name
                FROM
                    point_data mi
                LEFT JOIN
                    inspection_daily ti ON mi.item_no = ti.item_no AND mi.point_no = ti.point_no
                WHERE
                    mi.report_no = :report_no
                ORDER BY 
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
        $bindValue = [
            'report_no' => $reportNo,
            'saisui_date' => $saisuiDate,
            'inspection_kbn_code' => $inspectionKbnCode,
        ];
        return $bindValue;
    }

    /**
     * 日報帳票出力情報取得
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
