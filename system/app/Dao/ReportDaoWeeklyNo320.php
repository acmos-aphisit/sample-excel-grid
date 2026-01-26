<?php

namespace App\Dao;

use App\Dao\ReportDao;

/**
 * 週報用Dao
 */
class ReportDaoWeeklyNo320 extends ReportDao
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
                        select
                            week_date.saisui_date
                            , cast(:point_no as integer) as point_no
                            , mi.item_no
                            , mi.item_order 
                        from
                            m_report_item as mi 
                            cross join ( 
                                SELECT
                                    generate_series( 
                                            :saisui_date_start ::date
                                            , :saisui_date_end ::date
                                            , interval '1 day'
                                        )  AS saisui_date
                            ) as week_date 
                        WHERE
                            mi.report_no = :report_no 
                        ORDER BY
                            week_date.saisui_date
                            , mi.item_order
                    ) 
                    , inspaction_data AS ( 
                        SELECT
                            ti.* 
                        FROM
                            t_inspection_result ti 
                        WHERE
                            ti.saisui_date BETWEEN :saisui_date_start AND :saisui_date_end 
                            AND ti.point_no = :point_no 
                            AND date_trunc('month', ti.saisui_date) = date_trunc('month', CAST(:saisui_date_start as DATE)) 
                            AND ti.inspection_kbn_code = :inspection_kbn_code
                    ) 
                    SELECT
                        CASE 
                            WHEN id.item_no = 1 
                                THEN TO_CHAR(ti.saisui_date, 'YYYY/MM/DD') 
                            WHEN constant_qualitative_flg = 1 
                                THEN CAST(ti.constant_data as TEXT) 
                            WHEN constant_qualitative_flg = 2 
                                THEN ti.qualitative_data 
                            ELSE NULL 
                            END AS inspection_data
                        , ti.constant_qualitative_flg
                        , id.item_no
                        , ti.saisui_date
                        , id.point_no
                        , sp.saisui_kbn_no
                        , sp.point_report_name 
                    FROM
                        item_data id 
                        LEFT JOIN inspaction_data ti 
                            ON id.item_no = ti.item_no 
                            AND id.saisui_date = ti.saisui_date 
                        LEFT JOIN m_saisui_point sp 
                            ON sp.point_no = id.point_no 
                    ORDER BY
                        id.saisui_date
                        , id.item_order
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
        // 採水年月日の終了日付を取得
        $saisuiDateEnd = date("Y/m/d", strtotime("$saisuiDate +6 day"));

        $bindValue = [
            'report_no' => $reportNo,
            'point_no' => $pointNo,
            'inspection_kbn_code' => $inspectionKbnCode,
            'saisui_date_start' => $saisuiDate,
            'saisui_date_end' => $saisuiDateEnd,
        ];
        return $bindValue;
    }

    /**
     * 週報帳票出力情報取得
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
