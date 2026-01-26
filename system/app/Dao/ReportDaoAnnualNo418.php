<?php

namespace App\Dao;

use App\Dao\ReportDao;

/**
 * 年報用Dao
 */
class ReportDaoAnnualNo418 extends ReportDao
{
    /**
     * 帳票取得クエリ作成
     *
     * @return string 取得用SQL文字列
     */
    protected function getReportQuery(): string
    {
        $SQL = <<<SQL
                WITH t_source AS (
                    SELECT
                          result.point_no
                        , result.item_no
                        , result.saisui_date
                        , result.saisui_time
                        , result.inspection_kbn_code
                        , saisui_point.saisui_kbn_no
                        , result.constant_qualitative_flg
                        , CASE result.constant_qualitative_flg
                            WHEN 1 THEN 
                                CAST(configure_fixed_quantity_data(
                                      result.constant_data
                                    , result.item_no
                                    , result.point_no
                                    , CAST(
                                        (EXTRACT(YEAR FROM result.saisui_date)
                                         - CASE WHEN EXTRACT(MONTH FROM result.saisui_date) < 4 THEN 1 ELSE 0 END
                                        ) || '/04/01' AS character varying
                                    )
                                    , :report_no
                                    , :inspection_kbn_code
                                ) AS character varying)
                            WHEN 2 THEN result.qualitative_data
                            ELSE NULL
                        END AS result_data
                        , (
                            EXTRACT(YEAR FROM result.saisui_date)
                            - CASE WHEN EXTRACT(MONTH FROM result.saisui_date) < 4 THEN 1 ELSE 0 END
                        ) AS nendo
                        , selection.selection_no
                    FROM
                        t_inspection_result AS result
                    LEFT JOIN
                        m_saisui_point AS saisui_point
                     ON result.point_no = saisui_point.point_no
                    LEFT JOIN
                        m_selection AS selection
                     ON result.item_no = selection.item_no
                    AND result.qualitative_data = selection.selection_name
                    WHERE
                        result.saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                    AND result.inspection_kbn_code = :inspection_kbn_code
                    AND result.point_no = :point_no
                    AND result.item_no IN (SELECT item_no FROM m_report_item WHERE report_no = :report_no)
                ),
                year_data AS (
                    SELECT
                          item_no
                        , constant_qualitative_flg
                        , nendo
                        , inspection_kbn_code
                        , saisui_kbn_no
                        , point_no
                        , (
                            SELECT ts2.saisui_date
                            FROM t_source ts2
                            WHERE ts2.item_no = t_source.item_no
                              AND ts2.nendo = t_source.nendo
                              AND (
                                    (t_source.constant_qualitative_flg = 1 AND ts2.result_data =
                                        (SELECT MAX(result_data)
                                         FROM t_source ts3
                                         WHERE ts3.item_no = t_source.item_no
                                           AND ts3.nendo = t_source.nendo
                                        )
                                    )
                                 OR (t_source.constant_qualitative_flg = 2 AND ts2.selection_no =
                                        (SELECT MAX(selection_no)
                                         FROM t_source ts3
                                         WHERE ts3.item_no = t_source.item_no
                                           AND ts3.nendo = t_source.nendo
                                           AND ts3.selection_no IS NOT NULL
                                        )
                                    )
                              )
                            ORDER BY ts2.saisui_date DESC, ts2.saisui_time DESC
                            LIMIT 1
                        ) AS saisui_date
                        , (
                            SELECT ts2.saisui_time
                            FROM t_source ts2
                            WHERE ts2.item_no = t_source.item_no
                              AND ts2.nendo = t_source.nendo
                              AND (
                                    (t_source.constant_qualitative_flg = 1 AND ts2.result_data =
                                        (SELECT MAX(result_data)
                                         FROM t_source ts3
                                         WHERE ts3.item_no = t_source.item_no
                                           AND ts3.nendo = t_source.nendo
                                        )
                                    )
                                 OR (t_source.constant_qualitative_flg = 2 AND ts2.selection_no =
                                        (SELECT MAX(selection_no)
                                         FROM t_source ts3
                                         WHERE ts3.item_no = t_source.item_no
                                           AND ts3.nendo = t_source.nendo
                                           AND ts3.selection_no IS NOT NULL
                                        )
                                    )
                              )
                            ORDER BY ts2.saisui_date DESC, ts2.saisui_time DESC
                            LIMIT 1
                        ) AS saisui_time
                        , CASE constant_qualitative_flg
                            WHEN 1 THEN MAX(result_data)
                            WHEN 2 THEN (
                                SELECT result_data
                                FROM t_source ts2
                                WHERE ts2.item_no = t_source.item_no
                                  AND ts2.nendo = t_source.nendo
                                  AND ts2.selection_no IS NOT NULL
                                ORDER BY ts2.selection_no DESC
                                LIMIT 1
                            )
                            ELSE NULL
                        END AS max_result_data
                        , COUNT(result_data) AS result_count
                    FROM t_source
                    GROUP BY
                          item_no
                        , constant_qualitative_flg
                        , nendo
                        , inspection_kbn_code
                        , saisui_kbn_no
                        , point_no
                )
                SELECT
                      report_item.item_no
                    , report_item.report_item_name
                    , year_data1.inspection_kbn_code
                    , year_data1.saisui_kbn_no
                    , year_data1.point_no
                    , COALESCE(year_data1.constant_qualitative_flg, year_data2.constant_qualitative_flg, year_data3.constant_qualitative_flg) AS constant_qualitative_flg
                    , year_data1.nendo AS nendo1
                    , year_data1.saisui_date AS saisui_date1
                    , year_data1.saisui_time AS saisui_time1
                    , year_data1.result_count AS result_count_year1
                    , year_data1.max_result_data AS max_result_data_year1
                    , year_data2.nendo AS nendo2
                    , year_data2.saisui_date AS saisui_date2
                    , year_data2.saisui_time AS saisui_time2
                    , year_data2.result_count AS result_count_year2
                    , year_data2.max_result_data AS max_result_data_year2
                    , year_data3.nendo AS nendo3
                    , year_data3.saisui_date AS saisui_date3
                    , year_data3.saisui_time AS saisui_time3
                    , year_data3.result_count AS result_count_year3
                    , year_data3.max_result_data AS max_result_data_year3
                FROM
                    m_report_item AS report_item
                LEFT JOIN
                    year_data AS year_data1
                 ON year_data1.item_no = report_item.item_no
                AND year_data1.nendo = :nendo1
                LEFT JOIN
                    year_data AS year_data2
                 ON year_data2.item_no = report_item.item_no
                AND year_data2.nendo = :nendo2
                LEFT JOIN
                    year_data AS year_data3
                 ON year_data3.item_no = report_item.item_no
                AND year_data3.nendo = :nendo3
                WHERE
                    report_item.report_no = :report_no
                ORDER BY
                    report_item.item_order
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
        string $saisuiDate,
        int $inspectionKbnCode,
    ): array {
        $nendo = $this->getNendoStartEnd($saisuiDate);

        $bindValue = [
            'report_no' => $reportNo,
            'point_no' => $pointNo,
            'inspection_kbn_code' => $inspectionKbnCode,
            'saisui_date_start' => $nendo['date_start'],
            'saisui_date_end' => $nendo['date_end'],
            'nendo1' => $nendo['nendo1'],
            'nendo2' => $nendo['nendo2'],
            'nendo3' => $nendo['nendo3'],
        ];
        return $bindValue;
    }

    /**
     * 年報帳票出力情報取得
     *
     * @param int $reportNo 報告書番号
     * @param int $pointNo 地点番号
     * @param string $saisuiDate 採水年月日
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
            $saisuiDate,
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
        $saisuiStartYear = intval($tmpNenGetsu[0]) - 2;
        $saisuiEndYear = intval($tmpNenGetsu[0]) + 1;

        // 各年度のYYYY部分を設定
        $nendoStartYear1 = intval($tmpNenGetsu[0]) - 2;
        $nendoStartYear2 = intval($tmpNenGetsu[0]) - 1;
        $nendoStartYear3 = intval($tmpNenGetsu[0]);

        // 年度の開始日と終了日を算出する。
        return [
            'date_start' => "{$saisuiStartYear}/04/01",
            'date_end' => "{$saisuiEndYear}/03/31",
            'nendo1' => $nendoStartYear1,
            'nendo2' => $nendoStartYear2,
            'nendo3' => $nendoStartYear3,
        ];
    }
}
