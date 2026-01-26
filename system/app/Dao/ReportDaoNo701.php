<?php

namespace App\Dao;

use App\Dao\ReportDao;

/**
 * 共同検査StartY-EndY51項目(OutPutDay)Dao
 */
class ReportDaoNo701 extends ReportDao
{
    /**
     * 帳票取得クエリ作成
     *
     * @return string 取得用SQL文字列
     */
    protected function getReportQuery(): string
    {
        $SQL = <<<SQL
                With point_data AS (
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
                ), inspection_data AS(
                    SELECT 
                        ti.point_no,
                        pd.point_order,
                        ti.item_no,
                        pd.item_order,
                        ti.constant_qualitative_flg,
                        sp.saisui_kbn_no, 
                        COUNT(ti.constant_data) as constant_count,
                        COUNT(ti.qualitative_data) as qualitative_count,
                        MAX(ti.constant_data) as constant_max,
                        MIN(ti.constant_data) as constant_min,
                        AVG(ti.constant_data) as constant_avg,
                        STDDEV_SAMP(ti.constant_data) as constant_std
                    FROM (
                            SELECT *
                            FROM t_inspection_result
                            WHERE saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                            AND inspection_kbn_code IN (12000, 12010)
                        ) ti
                        INNER JOIN point_data pd ON ti.point_no = pd.point_no AND ti.item_no = pd.item_no
                        LEFT JOIN m_saisui_point sp ON sp.point_no = ti.point_no
                    Group BY
                        ti.item_no,
                        ti.point_no,
                        pd.point_order,
                        pd.item_order,
                        ti.constant_qualitative_flg,
                        sp.saisui_kbn_no
                )
                SELECT
                    mi.point_no,
                    mi.item_no,
                    ti.constant_qualitative_flg,
                    ti.saisui_kbn_no,
                    CAST(ti.constant_count as TEXT) as constant_count,
                    CAST(ti.qualitative_count as TEXT) as qualitative_count,
                    CAST(ti.constant_max as TEXT) as constant_max,
                    CAST(ti.constant_min as TEXT) as constant_min,
                    CAST(ti.constant_avg as TEXT) as constant_avg,
                    CAST(ti.constant_std as TEXT) as constant_std
                FROM
                    point_data mi
                LEFT JOIN
                    inspection_data ti ON mi.item_no = ti.item_no
                    AND mi.point_order = ti.point_order
                    AND mi.item_order = ti.item_order 
                WHERE
                    mi.report_no = :report_no
                ORDER BY
                    mi.point_order,
                    mi.item_order
                SQL;
        return $SQL;
    }

    /**
     * 年度取得クエリ作成
     *
     * @return string 取得用SQL文字列
     */
    protected function getNendoQuery(): string
    {
        $SQL = <<<SQL
                SELECT
                    ti.item_no,
                    ti.point_no,
                    COUNT(distinct ti.c1) as constant_count,
                    COUNT(distinct ti.c2) as qualitative_count
                FROM (
                        SELECT *
                        , case when constant_data is null then null
                            else  date_trunc('year', saisui_date + CAST('-3 Month' as Interval)) end c1
                        , case when qualitative_data is null then null
                            else  date_trunc('year', saisui_date + CAST('-3 Month' as Interval)) end c2
                        FROM t_inspection_result
                        WHERE saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                        AND inspection_kbn_code IN (12000, 12010)
                    ) ti
                    INNER JOIN (
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
                    ) pd ON ti.point_no = pd.point_no AND ti.item_no = pd.item_no
                    Group BY ti.item_no, ti.point_no, pd.point_order, pd.item_order
                    ORDER BY pd.point_order, pd.item_order
                SQL;
        return $SQL;
    }

    /**
     * 帳票取得SQLパラメータ作成
     *
     * @return array 取得用SQLパラメータ配列
     */
    protected function getBindParameterNendo(
        int $reportNo,
        string $nendo
    ): array {
        $tmpDateStart = date('Y/m/d', strtotime($nendo . '/04/01'));
        $saisuiDateStart = date('Y/m/d', strtotime("$tmpDateStart -2 year"));
        $tmpDateEnd = date('Y/m/d', strtotime("$tmpDateStart 1 year"));
        $saisuiDateEnd = date('Y/m/d', strtotime("$tmpDateEnd -1 day"));
        $bindValue = [
            'report_no' => $reportNo,
            'saisui_date_start' => $saisuiDateStart,
            'saisui_date_end' => $saisuiDateEnd,
        ];
        return $bindValue;
    }

    /**
     * 帳票出力情報取得
     *
     * @param int $reportNo 報告書番号
     * @param string $nendo 対象年度
     * @return array|false 検査結果|取得失敗(false)
     */
    public function getInspectionResultReportData(
        int $reportNo,
        string $nendo,
        bool $isNendo = false
    ) {
        $SQL = '';
        if (!$isNendo) {
            $SQL = $this->getReportQuery();
        } else {
            $SQL = $this->getNendoQuery();
        }
        $bindValue = $this->getBindParameterNendo(
            $reportNo,
            $nendo
        );

        return $this->executeSelectData($SQL, $bindValue);
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
        return false;
    }
}
