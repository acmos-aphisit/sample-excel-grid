<?php

namespace App\Dao;

use Illuminate\Support\Facades\DB;
use App\Dao\ReportDao;

/**
 * 月報用Dao
 */
class ReportDaoNo107 extends ReportDao
{
    /**
     * 帳票取得クエリ作成
     *
     * @return string 取得用SQL文字列
     */
    protected function getReportQuery(): string
    {
        $SQL = <<<SQL
                SELECT
                    CASE constant_qualitative_flg
                        WHEN 1 THEN CAST(t2.constant_data as TEXT)
                        WHEN 2 THEN t2.qualitative_data
                        ELSE NULL
                    END AS inspection_data,
                    t2.constant_qualitative_flg,
                    t1.item_no,
                    t3.saisui_kbn_no,
                    t3.point_no,
                    t3.point_report_name,
                    t1.point_order
                FROM (
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
                ) t1
                LEFT JOIN (
                    select
                        *
                    from
                        t_inspection_result
                    where
                        saisui_date = :saisui_date
                        and inspection_kbn_code = :inspection_kbn_code
                ) t2 on t2.point_no = t1.point_no and t2.item_no = t1.item_no
                LEFT JOIN m_saisui_point t3 ON t3.point_no = t1.point_no
                ORDER BY t1.point_order, t1.item_order
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

    /**
     * 帳票取得クエリ作成
     *
     * @return string 取得用SQL文字列
     */
    protected function getReportQueryWithMonth(): string
    {
        $SQL = <<<SQL
                SELECT
                    CASE constant_qualitative_flg
                        WHEN 1 THEN CAST(t2.constant_data as TEXT)
                        WHEN 2 THEN t2.qualitative_data
                        ELSE NULL
                    END AS inspection_data,
                    t2.constant_qualitative_flg,
                    t1.item_no,
                    t3.saisui_kbn_no,
                    t3.point_no,
                    t3.point_report_name,
                    t1.point_order
                FROM (
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
                ) t1
                LEFT JOIN (
                    select
                        *
                    from (
                        select
                            *,
                            row_number() over (PARTITION BY point_no, item_no ORDER BY saisui_date, saisui_time) as sort
                        from
                            t_inspection_result
                        where
                            saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                            and inspection_kbn_code = :inspection_kbn_code
                    )
                    where sort = 1
                ) t2 on t2.point_no = t1.point_no and t2.item_no = t1.item_no
                LEFT JOIN m_saisui_point t3 ON t3.point_no = t1.point_no
                ORDER BY t1.point_order, t1.item_order
                SQL;
        return $SQL;
    }

    /**
     * 帳票取得SQLパラメータ作成
     *
     * @return array 取得用SQLパラメータ配列
     */
    protected function getBindParameterWithMonth(
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
            'saisui_date_start' => $saisuiDateStart,
            'saisui_date_end' => $saisuiDateEnd,
            'inspection_kbn_code' => $inspectionKbnCode,
        ];
        return $bindValue;
    }

    /**
     * 帳票取得SQLパラメータ作成
     *
     * @return array 取得用SQLパラメータ配列
     */
    protected function getSmellKashimaBindParameterWithMonth(
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
            'saisui_date_start' => $saisuiDateStart,
            'saisui_date_end' => $saisuiDateEnd,
            'inspection_kbn_code' => $inspectionKbnCode,
            'point_no1' => $pointNo,
            'point_no2' => $pointNo,
        ];
        return $bindValue;
    }

    /**
     * 帳票取得SQLパラメータ作成
     *
     * @return array 取得用SQLパラメータ配列
     */
    protected function getBindToriharometanMonth(
        int $reportNo,
        int $pointNo,
        int $itemNo,
        string $saisuiDate,
        string $saisuiTime,
        int $inspectionKbnCode,
        int $sisetuNo,
        int $processNo,
    ): array {
        $tmpNenGetsu = explode('/', $saisuiDate);
        // 月初日を取得する
        $tmpNenGetsu[2] = '01';
        $saisuiDateStart = implode('/', $tmpNenGetsu);
        // 月末を取得する
        $saisuitmp = date("Y/m/d", strtotime("$saisuiDateStart 1 month"));
        $saisuiDateEnd = date("Y/m/d", strtotime("$saisuitmp -1 day"));
        $bindValue = [
            'saisui_date_start' => $saisuiDateStart,
            'saisui_date_end' => $saisuiDateEnd,
            'item_no' => $itemNo,
            'inspection_kbn_code' => $inspectionKbnCode,
            'sisetu_no' => $sisetuNo,
            'process_no' => $processNo,
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
    public function getInspectionResultReportWithMonth(
        int $reportNo,
        int $pointNo,
        int $itemNo,
        string $saisuiDate,
        string $saisuiTime,
        int $inspectionKbnCode,
    ) {
        $SQL = $this->getReportQueryWithMonth();
        $bindValue = $this->getBindParameterWithMonth(
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
     * 帳票取得クエリ作成(毎日検査_1か月集計)
     *
     * @return string 取得用SQL文字列
     */
    protected function getReportQueryMonthCalc(): string
    {
        $SQL = <<<SQL
                WITH base_data AS (
                    SELECT
                        t2.saisui_date,
                        t2.constant_data,
                        t1.item_no,
                        t3.saisui_kbn_no,
                        t3.point_no,
                        t1.point_order,
                        t1.item_order,
                        ROW_NUMBER() OVER (
                            PARTITION BY t1.item_no, t3.point_no, t1.point_order, t1.item_order
                            ORDER BY t2.constant_data DESC
                        ) AS rn
                    FROM (
                        SELECT
                            st1.report_no,
                            st1.point_no AS report_point_no,
                            st1.item_no AS report_item_no,
                            st3.point_no,
                            st3.point_order,
                            st2.item_no,
                            st2.report_item_name,
                            st2.item_order
                        FROM
                            m_report_config st1
                            INNER JOIN m_report_item st2 ON st2.report_no = st1.report_no
                            INNER JOIN m_report_point st3 ON st3.report_no = st1.report_no
                        WHERE
                            st1.report_no = :report_no
                    ) t1
                    LEFT JOIN (
                        SELECT *
                        FROM t_inspection_result
                        WHERE
                            saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                            AND inspection_kbn_code = :inspection_kbn_code
                            AND constant_qualitative_flg = 1
                    ) t2 ON t2.point_no = t1.point_no AND t2.item_no = t1.item_no
                    LEFT JOIN m_saisui_point t3 ON t3.point_no = t1.point_no
                ),
                aggregated AS (
                    SELECT
                        item_no,
                        saisui_kbn_no,
                        point_no,
                        point_order,
                        item_order,
                        CASE WHEN item_no = 1040 THEN SUM(constant_data) ELSE MAX(constant_data) END AS inspection_data_max,
                        MIN(constant_data) AS inspection_data_min,
                        AVG(constant_data) AS inspection_data_avg,
                        COUNT(constant_data) AS inspection_data_cnt
                    FROM base_data
                    GROUP BY item_no, saisui_kbn_no, point_no, point_order, item_order
                ),
                max_date AS (
                    SELECT
                        item_no,
                        saisui_kbn_no,
                        point_no,
                        point_order,
                        item_order,
                        saisui_date
                    FROM base_data
                    WHERE rn = 1
                )
                SELECT
                    to_char(m.saisui_date, 'YYYY/MM/DD') AS saisui_date,
                    a.inspection_data_max,
                    a.inspection_data_min,
                    a.inspection_data_avg,
                    a.inspection_data_cnt,
                    a.item_no,
                    a.saisui_kbn_no,
                    a.point_no,
                    a.point_order
                FROM aggregated a
                LEFT JOIN max_date m
                    ON a.item_no = m.item_no
                    AND a.point_no = m.point_no
                    AND a.point_order = m.point_order
                    AND a.item_order = m.item_order
                ORDER BY a.point_order, a.item_order
                SQL;
        return $SQL;
    }

    /**
     * 帳票取得クエリ作成(毎日検査_1か月集計)
     *
     * @return string 取得用SQL文字列
     */
    protected function getSmellReportQueryMonthCalc(): string
    {
        $SQL = <<<SQL
                WITH base_data AS (
                    SELECT
                        t2.saisui_date,
                        t2.constant_data,
                        t1.item_no,
                        t3.saisui_kbn_no,
                        t3.point_no,
                        t1.point_order,
                        t1.item_order
                    FROM (
                        SELECT
                            st1.report_no,
                            st1.point_no AS report_point_no,
                            st1.item_no AS report_item_no,
                            st3.point_no,
                            st3.point_order,
                            st2.item_no,
                            st2.report_item_name,
                            st2.item_order
                        FROM
                            m_report_config st1
                            INNER JOIN m_report_item st2 ON st2.report_no = st1.report_no
                            INNER JOIN m_report_point st3 ON st3.report_no = st1.report_no
                        WHERE
                            st1.report_no = :report_no
                    ) t1
                    LEFT JOIN (
                        SELECT *
                        FROM t_inspection_result
                        WHERE
                            saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                            AND inspection_kbn_code = :inspection_kbn_code
                            AND constant_qualitative_flg = 1
                    ) t2 ON t2.point_no = t1.point_no AND t2.item_no = t1.item_no
                    LEFT JOIN m_saisui_point t3 ON t3.point_no = t1.point_no
                ),
                target_saisui_date AS (
                    SELECT DISTINCT ON (point_no)
                        point_no,
                        saisui_date
                    FROM base_data
                    WHERE item_no IN (2400, 2410)
                    AND constant_data IS NOT NULL
                    ORDER BY point_no, constant_data DESC
                ),
                filtered_data AS (
                    SELECT b.*
                    FROM base_data b
                    LEFT JOIN target_saisui_date t
                    ON b.point_no = t.point_no
                    WHERE b.item_no IN (2400, 2410)
                    AND DATE(b.saisui_date) = DATE(t.saisui_date)
                ),
                max_date AS (
                    SELECT
                        item_no,
                        saisui_kbn_no,
                        point_no,
                        point_order,
                        item_order,
                        saisui_date,
                        constant_data
                    FROM filtered_data
                ),
                aggregated AS (
                    SELECT
                        b.item_no,
                        b.saisui_kbn_no,
                        b.point_no,
                        b.point_order,
                        b.item_order,
                        CASE 
                            WHEN b.item_no IN (2400, 2410) THEN NULL
                            WHEN b.item_no = 1040 THEN SUM(b.constant_data)
                            ELSE MAX(b.constant_data)
                        END AS inspection_data_max,
                        MIN(b.constant_data) AS inspection_data_min,
                        AVG(b.constant_data) AS inspection_data_avg,
                        COUNT(b.constant_data) AS inspection_data_cnt,
                        MAX(b.saisui_date) AS saisui_date
                    FROM base_data b
                    GROUP BY b.item_no, b.saisui_kbn_no, b.point_no, b.point_order, b.item_order
                ),
                final_output AS (
                    SELECT
                        a.item_no,
                        a.saisui_kbn_no,
                        a.point_no,
                        a.point_order,
                        a.item_order,
                        CASE 
                            WHEN a.item_no IN (2400, 2410) THEN m.constant_data
                            ELSE a.inspection_data_max
                        END AS inspection_data_max,
                        CASE 
                            WHEN a.item_no IN (2400, 2410) THEN NULL
                            ELSE a.inspection_data_min
                        END AS inspection_data_min,
                        CASE 
                            WHEN a.item_no IN (2400, 2410) THEN NULL
                            ELSE a.inspection_data_avg
                        END AS inspection_data_avg,
                        CASE 
                            WHEN a.item_no IN (2400, 2410) THEN NULL
                            ELSE a.inspection_data_cnt
                        END AS inspection_data_cnt,
                        CASE 
                            WHEN a.item_no IN (2400, 2410) THEN m.saisui_date
                            ELSE a.saisui_date
                        END AS saisui_date
                    FROM aggregated a
                    LEFT JOIN max_date m
                        ON a.item_no = m.item_no
                        AND a.point_no = m.point_no
                        AND a.point_order = m.point_order
                        AND a.item_order = m.item_order
                )
                SELECT
                    to_char(saisui_date, 'YYYY/MM/DD') AS saisui_date,
                    inspection_data_max,
                    inspection_data_min,
                    inspection_data_avg,
                    inspection_data_cnt,
                    item_no,
                    saisui_kbn_no,
                    point_no,
                    point_order
                FROM final_output
                ORDER BY point_order, item_order
                SQL;
        return $SQL;
    }

    /**
     * 帳票取得クエリ作成(毎日検査_1か月集計)
     *
     * @return string 取得用SQL文字列
     */
    protected function getSmellKashimaReportQueryMonthCalc(): string
    {
        $SQL = <<<SQL
                WITH base_data AS (
                    SELECT
                        t2.saisui_date,
                        t2.constant_data,
                        t1.item_no,
                        t3.saisui_kbn_no,
                        t3.point_no,
                        t1.point_order,
                        t1.item_order
                    FROM (
                        SELECT
                            st1.report_no,
                            st1.point_no AS report_point_no,
                            st1.item_no AS report_item_no,
                            CAST(:point_no1 AS integer) AS point_no,
                            1 AS point_order,
                            st2.item_no,
                            st2.report_item_name,
                            st2.item_order
                        FROM
                            m_report_config st1
                            INNER JOIN m_report_item st2 ON st2.report_no = st1.report_no
                        WHERE
                            st1.report_no = :report_no
                    ) t1
                    LEFT JOIN (
                        SELECT *
                        FROM t_inspection_result
                        WHERE
                            saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                            AND inspection_kbn_code = :inspection_kbn_code
                            AND constant_qualitative_flg = 1
                            AND point_no = :point_no2
                    ) t2 ON t2.point_no = t1.point_no AND t2.item_no = t1.item_no
                    LEFT JOIN m_saisui_point t3 ON t3.point_no = t1.point_no
                ),
                target_saisui_date AS (
                    SELECT DISTINCT ON (point_no)
                        point_no,
                        saisui_date
                    FROM base_data
                    WHERE item_no IN (2400, 2410)
                    AND constant_data IS NOT NULL
                    ORDER BY point_no, constant_data DESC
                ),
                filtered_data AS (
                    SELECT b.*
                    FROM base_data b
                    LEFT JOIN target_saisui_date t
                    ON b.point_no = t.point_no
                    WHERE b.item_no IN (2400, 2410)
                    AND DATE(b.saisui_date) = DATE(t.saisui_date)
                ),
                max_date AS (
                    SELECT
                        item_no,
                        saisui_kbn_no,
                        point_no,
                        point_order,
                        item_order,
                        saisui_date,
                        constant_data
                    FROM filtered_data
                ),
                aggregated AS (
                    SELECT
                        b.item_no,
                        b.saisui_kbn_no,
                        b.point_no,
                        b.point_order,
                        b.item_order,
                        CASE 
                            WHEN b.item_no IN (2400, 2410) THEN NULL
                            WHEN b.item_no = 1040 THEN SUM(b.constant_data)
                            ELSE MAX(b.constant_data)
                        END AS inspection_data_max,
                        MIN(b.constant_data) AS inspection_data_min,
                        AVG(b.constant_data) AS inspection_data_avg,
                        COUNT(b.constant_data) AS inspection_data_cnt,
                        MAX(b.saisui_date) AS saisui_date
                    FROM base_data b
                    GROUP BY b.item_no, b.saisui_kbn_no, b.point_no, b.point_order, b.item_order
                ),
                final_output AS (
                    SELECT
                        a.item_no,
                        a.saisui_kbn_no,
                        a.point_no,
                        a.point_order,
                        a.item_order,
                        CASE 
                            WHEN a.item_no IN (2400, 2410) THEN m.constant_data
                            ELSE a.inspection_data_max
                        END AS inspection_data_max,
                        CASE 
                            WHEN a.item_no IN (2400, 2410) THEN NULL
                            ELSE a.inspection_data_min
                        END AS inspection_data_min,
                        CASE 
                            WHEN a.item_no IN (2400, 2410) THEN NULL
                            ELSE a.inspection_data_avg
                        END AS inspection_data_avg,
                        CASE 
                            WHEN a.item_no IN (2400, 2410) THEN NULL
                            ELSE a.inspection_data_cnt
                        END AS inspection_data_cnt,
                        CASE 
                            WHEN a.item_no IN (2400, 2410) THEN m.saisui_date
                            ELSE a.saisui_date
                        END AS saisui_date
                    FROM aggregated a
                    LEFT JOIN max_date m
                        ON a.item_no = m.item_no
                        AND a.point_no = m.point_no
                        AND a.point_order = m.point_order
                        AND a.item_order = m.item_order
                )
                SELECT
                    to_char(saisui_date, 'YYYY/MM/DD') AS saisui_date,
                    inspection_data_max,
                    inspection_data_min,
                    inspection_data_avg,
                    inspection_data_cnt,
                    item_no,
                    saisui_kbn_no,
                    point_no,
                    point_order
                FROM final_output
                ORDER BY point_order, item_order
                SQL;
        return $SQL;
    }

    /**
     * 帳票取得クエリ作成(総トリハロメタン_1か月集計)
     *
     * @return string 取得用SQL文字列
     */
    protected function getReportQueryToriharometanMonthCalc(): string
    {
        $SQL = <<<SQL
                SELECT
                      t_result.saisui_date
                    , t_result.point_no
                    , t_result.constant_data
                    , saisui_point.point_report_name
                    , t_result.item_no
                    , saisui_point.saisui_kbn_no
                    , t_result.saisui_time
                FROM
                    t_inspection_result AS t_result
                INNER JOIN (
                    m_process AS process
                        INNER JOIN ( 
                            m_sisetu AS sisetu
                                INNER JOIN 
                                    m_saisui_point AS saisui_point
                                    ON sisetu.sisetu_no = saisui_point.sisetu_no
                        ) 
                    ON process.process_no = saisui_point.process_no
                ) 
                        ON t_result.point_no = saisui_point.point_no
                WHERE
                    t_result.saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                AND t_result.item_no = :item_no
                AND t_result.inspection_kbn_code = :inspection_kbn_code
                AND sisetu.sisetu_no = :sisetu_no
                AND process.process_no = :process_no
                ORDER BY
                    t_result.constant_data DESC
                SQL;
        return $SQL;
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
    public function getInspectionResultReportCalc(
        int $reportNo,
        int $pointNo,
        int $itemNo,
        string $saisuiDate,
        string $saisuiTime,
        int $inspectionKbnCode,
    ) {
        $SQL = $this->getReportQueryMonthCalc();
        $bindValue = $this->getBindParameterWithMonth(
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
     * 月報帳票出力情報取得
     *
     * @param int $reportNo 報告書番号
     * @param int $pointNo 地点番号
     * @param string $saisuiDate 採水年月日
     * @param string $saisuiTime 採水時刻
     * @param int $inspectionKbnCode 検査区分CD
     * @return array|false 検査結果|取得失敗(false)
     */
    public function getSmellInspectionResultReportCalc(
        int $reportNo,
        int $pointNo,
        int $itemNo,
        string $saisuiDate,
        string $saisuiTime,
        int $inspectionKbnCode,
    ) {
        $SQL = $this->getSmellReportQueryMonthCalc();
        $bindValue = $this->getBindParameterWithMonth(
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
     * 月報帳票出力情報取得
     *
     * @param int $reportNo 報告書番号
     * @param int $pointNo 地点番号
     * @param string $saisuiDate 採水年月日
     * @param string $saisuiTime 採水時刻
     * @param int $inspectionKbnCode 検査区分CD
     * @return array|false 検査結果|取得失敗(false)
     */
    public function getSmellKashimaResultReportCalc(
        int $reportNo,
        int $pointNo,
        int $itemNo,
        string $saisuiDate,
        string $saisuiTime,
        int $inspectionKbnCode,
    ) {
        $SQL = $this->getSmellKashimaReportQueryMonthCalc();
        $bindValue = $this->getSmellKashimaBindParameterWithMonth(
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
     * 月報帳票出力情報取得
     *
     * @param int $reportNo 報告書番号
     * @param int $pointNo 地点番号
     * @param string $saisuiDate 採水年月日
     * @param string $saisuiTime 採水時刻
     * @param int $inspectionKbnCode 検査区分CD
     * @return array|false 検査結果|取得失敗(false)
     */
    public function getToriharometanMonthCalc(
        int $reportNo,
        int $pointNo,
        int $itemNo,
        string $saisuiDate,
        string $saisuiTime,
        int $inspectionKbnCode,
        int $sisetuNo,
        int $processNo,
    ) {
        $SQL = $this->getReportQueryToriharometanMonthCalc();
        $bindValue = $this->getBindToriharometanMonth(
            $reportNo,
            $pointNo,
            $itemNo,
            $saisuiDate,
            $saisuiTime,
            $inspectionKbnCode,
            $sisetuNo,
            $processNo
        );

        return $this->executeSelectData($SQL, $bindValue);
    }

    /**
     * 帳票取得クエリ作成(毎日検査_1か月集計)
     *
     * @return string 取得用SQL文字列
     */
    protected function getReportQueryPast5yearsCalc(): string
    {
        $SQL = <<<SQL
                WITH base_data AS (
                    SELECT
                        t2.saisui_date,
                        t2.constant_data,
                        t1.item_no,
                        t3.saisui_kbn_no,
                        t3.point_no,
                        t1.point_order,
                        t1.item_order,
                        ROW_NUMBER() OVER (
                            PARTITION BY t1.item_no, t3.point_no, t1.point_order, t1.item_order
                            ORDER BY t2.constant_data DESC
                        ) AS rn
                    FROM (
                        SELECT
                            st1.report_no,
                            st1.point_no AS report_point_no,
                            st1.item_no AS report_item_no,
                            st3.point_no,
                            st3.point_order,
                            st2.item_no,
                            st2.report_item_name,
                            st2.item_order
                        FROM
                            m_report_config st1
                            INNER JOIN m_report_item st2 ON st2.report_no = st1.report_no
                            INNER JOIN m_report_point st3 ON st3.report_no = st1.report_no
                        WHERE
                            st1.report_no = :report_no
                    ) t1
                    LEFT JOIN (
                        SELECT *
                        FROM t_inspection_result
                        WHERE
                            saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                            AND point_no IN (SELECT point_no FROM m_report_point WHERE report_no = :report_no)
                            AND EXTRACT('month' FROM saisui_date) = EXTRACT('month' FROM CAST(:saisui_date_start AS DATE))
                            AND inspection_kbn_code = :inspection_kbn_code
                            AND constant_qualitative_flg = 1
                    ) t2 ON t2.point_no = t1.point_no AND t2.item_no = t1.item_no
                    LEFT JOIN m_saisui_point t3 ON t3.point_no = t1.point_no
                ),
                aggregated AS (
                    SELECT
                        item_no,
                        saisui_kbn_no,
                        point_no,
                        point_order,
                        item_order,
                        MIN(constant_data) AS inspection_data_min,
                        AVG(constant_data) AS inspection_data_avg,
                        COUNT(constant_data) AS inspection_data_cnt
                    FROM base_data
                    GROUP BY item_no, saisui_kbn_no, point_no, point_order, item_order
                ),
                max_date AS (
                    SELECT
                        item_no,
                        saisui_kbn_no,
                        point_no,
                        point_order,
                        item_order,
                        saisui_date,
                        constant_data AS inspection_data_max
                    FROM base_data
                    WHERE rn = 1
                )
                SELECT
                    to_char(m.saisui_date, 'YYYY/MM/DD') AS saisui_date,
                    m.inspection_data_max,
                    a.inspection_data_min,
                    a.inspection_data_avg,
                    NULL AS qualitative_data_max,
                    NULL AS qualitative_data_min,
                    a.inspection_data_cnt,
                    a.item_no,
                    a.saisui_kbn_no,
                    a.point_no,
                    a.point_order
                FROM aggregated a
                LEFT JOIN max_date m
                    ON a.item_no = m.item_no
                    AND a.point_no = m.point_no
                    AND a.point_order = m.point_order
                    AND a.item_order = m.item_order
                ORDER BY a.point_order, a.item_order;
                SQL;
        return $SQL;
    }

    /**
     * 帳票取得クエリ作成(毎日検査_1か月集計)
     *
     * @return string 取得用SQL文字列
     */
    protected function getReportQueryPast5yearsCalcDay(): string
    {
        $SQL = <<<SQL
                WITH base_data_1040 AS (
                    SELECT
                        t2.saisui_date,
                        t2.constant_data,
                        t1.item_no,
                        t3.saisui_kbn_no,
                        t3.point_no,
                        t1.point_order,
                        t1.item_order
                    FROM (
                        SELECT
                            st1.report_no,
                            st1.point_no AS report_point_no,
                            st1.item_no AS report_item_no,
                            st3.point_no,
                            st3.point_order,
                            st2.item_no,
                            st2.report_item_name,
                            st2.item_order
                        FROM
                            m_report_config st1
                            INNER JOIN m_report_item st2 ON st2.report_no = st1.report_no
                            INNER JOIN m_report_point st3 ON st3.report_no = st1.report_no
                        WHERE
                            st1.report_no = :report_no
                    ) t1
                    LEFT JOIN (
                        SELECT *
                        FROM t_inspection_result
                        WHERE
                            saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                            AND point_no IN (SELECT point_no FROM m_report_point WHERE report_no = :report_no)
                            AND EXTRACT('month' FROM saisui_date) = EXTRACT('month' FROM CAST(:saisui_date_start AS DATE))
                            AND inspection_kbn_code = :inspection_kbn_code
                            AND constant_qualitative_flg = 1
                    ) t2 ON t2.point_no = t1.point_no AND t2.item_no = t1.item_no
                    LEFT JOIN m_saisui_point t3 ON t3.point_no = t1.point_no
                    WHERE t1.item_no = 1040
                ),
                sum_by_year_1040 AS (
                    SELECT
                        EXTRACT(YEAR FROM saisui_date) AS saisui_year,
                        item_no,
                        saisui_kbn_no,
                        point_no,
                        point_order,
                        item_order,
                        SUM(constant_data) AS yearly_total
                    FROM base_data_1040
                    GROUP BY EXTRACT(YEAR FROM saisui_date), item_no, saisui_kbn_no, point_no, point_order, item_order
                ),
                aggregated_1040 AS (
                    SELECT
                        TO_CHAR(TO_DATE(MAX(saisui_year)::text || '/' || EXTRACT(MONTH FROM CAST(:saisui_date_start AS DATE))::text || '/01', 'YYYY/MM/DD'), 'YYYY/MM/DD') AS saisui_date,
                        MAX(yearly_total) AS inspection_data_max,
                        MIN(yearly_total) AS inspection_data_min,
                        AVG(yearly_total) AS inspection_data_avg,
                        COUNT(*) AS inspection_data_cnt,
                        item_no,
                        saisui_kbn_no,
                        point_no,
                        point_order,
                        item_order
                    FROM sum_by_year_1040
                    GROUP BY item_no, saisui_kbn_no, point_no, point_order, item_order
                ),
                base_data_1060 AS (
                    SELECT
                        t2.saisui_date,
                        t2.constant_data,
                        t1.item_no,
                        t3.saisui_kbn_no,
                        t3.point_no,
                        t1.point_order,
                        t1.item_order
                    FROM (
                        SELECT
                            st1.report_no,
                            st1.point_no AS report_point_no,
                            st1.item_no AS report_item_no,
                            st3.point_no,
                            st3.point_order,
                            st2.item_no,
                            st2.report_item_name,
                            st2.item_order
                        FROM
                            m_report_config st1
                            INNER JOIN m_report_item st2 ON st2.report_no = st1.report_no
                            INNER JOIN m_report_point st3 ON st3.report_no = st1.report_no
                        WHERE
                            st1.report_no = :report_no
                    ) t1
                    LEFT JOIN (
                        SELECT *
                        FROM t_inspection_result
                        WHERE
                            saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                            AND point_no IN (SELECT point_no FROM m_report_point WHERE report_no = :report_no)
                            AND EXTRACT('month' FROM saisui_date) = EXTRACT('month' FROM CAST(:saisui_date_start AS DATE))
                            AND inspection_kbn_code = :inspection_kbn_code
                            AND constant_qualitative_flg = 1
                    ) t2 ON t2.point_no = t1.point_no AND t2.item_no = t1.item_no
                    LEFT JOIN m_saisui_point t3 ON t3.point_no = t1.point_no
                    WHERE t1.item_no = 1060
                ),
                sum_by_year_1060 AS (
                    SELECT
                        EXTRACT(YEAR FROM saisui_date) AS saisui_year,
                        item_no,
                        saisui_kbn_no,
                        point_no,
                        point_order,
                        item_order,
                        trunc(AVG(constant_data), 6) AS yearly_total
                    FROM base_data_1060
                    GROUP BY EXTRACT(YEAR FROM saisui_date), item_no, saisui_kbn_no, point_no, point_order, item_order
                ),
                aggregated_1060 AS (
                    SELECT
                        TO_CHAR(TO_DATE(MAX(saisui_year)::text || '/' || EXTRACT(MONTH FROM CAST(:saisui_date_start AS DATE))::text || '/01', 'YYYY/MM/DD'), 'YYYY/MM/DD') AS saisui_date,
                        MAX(yearly_total) AS inspection_data_max,
                        MIN(yearly_total) AS inspection_data_min,
                        AVG(yearly_total) AS inspection_data_avg,
                        COUNT(*) AS inspection_data_cnt,
                        item_no,
                        saisui_kbn_no,
                        point_no,
                        point_order,
                        item_order
                    FROM sum_by_year_1060
                    GROUP BY item_no, saisui_kbn_no, point_no, point_order, item_order
                ),
                base_data_other AS (
                    SELECT
                        t2.saisui_date,
                        t2.constant_data,
                        t1.item_no,
                        t3.saisui_kbn_no,
                        t3.point_no,
                        t1.point_order,
                        t1.item_order
                    FROM (
                        SELECT
                            st1.report_no,
                            st1.point_no AS report_point_no,
                            st1.item_no AS report_item_no,
                            st3.point_no,
                            st3.point_order,
                            st2.item_no,
                            st2.report_item_name,
                            st2.item_order
                        FROM
                            m_report_config st1
                            INNER JOIN m_report_item st2 ON st2.report_no = st1.report_no
                            INNER JOIN m_report_point st3 ON st3.report_no = st1.report_no
                        WHERE
                            st1.report_no = :report_no
                    ) t1
                    LEFT JOIN (
                        SELECT *
                        FROM t_inspection_result
                        WHERE
                            saisui_date = ANY(:saisui_date_list)
                            AND point_no IN (SELECT point_no FROM m_report_point WHERE report_no = :report_no)
                            AND inspection_kbn_code = :inspection_kbn_code
                            AND constant_qualitative_flg = 1
                    ) t2 ON t2.point_no = t1.point_no AND t2.item_no = t1.item_no
                    LEFT JOIN m_saisui_point t3 ON t3.point_no = t1.point_no
                    WHERE t1.item_no NOT IN (1040, 1060)
                ),
                aggregated_other AS (
                    SELECT
                        TO_CHAR(MAX(saisui_date), 'YYYY/MM/DD') AS saisui_date,
                        MAX(constant_data) AS inspection_data_max,
                        MIN(constant_data) AS inspection_data_min,
                        AVG(constant_data) AS inspection_data_avg,
                        COUNT(constant_data) AS inspection_data_cnt,
                        item_no,
                        saisui_kbn_no,
                        point_no,
                        point_order,
                        item_order
                    FROM base_data_other
                    GROUP BY item_no, saisui_kbn_no, point_no, point_order, item_order
                ),
                final_aggregated AS (
                    SELECT * FROM aggregated_1040
                    UNION ALL
                    SELECT * FROM aggregated_1060
                    UNION ALL
                    SELECT * FROM aggregated_other
                )
                SELECT
                    saisui_date,
                    inspection_data_max,
                    inspection_data_min,
                    inspection_data_avg,
                    NULL AS qualitative_data_max,
                    NULL AS qualitative_data_min,
                    inspection_data_cnt,
                    item_no,
                    saisui_kbn_no,
                    point_no,
                    point_order
                FROM final_aggregated
                ORDER BY point_order, item_order
                SQL;
        return $SQL;
    }

    /**
     * 帳票取得クエリ作成(過去5年集計_初回採水日)
     *
     * @return string 取得用SQL文字列
     */
    protected function getReportQueryPast5yearsFirstSaisuiCalc(): string
    {
        $SQL = <<<SQL
                WITH base_data AS (
                    SELECT
                        t2.saisui_date,
                        t2.constant_data,
                        t2.qualitative_data,
                        t1.item_no,
                        t3.saisui_kbn_no,
                        t3.point_no,
                        t1.point_order,
                        t1.item_order,
                        ROW_NUMBER() OVER (
                            PARTITION BY t1.item_no, t3.point_no, t1.point_order, t1.item_order
                            ORDER BY t2.constant_data DESC
                        ) AS rn
                    FROM (
                        SELECT
                            st1.report_no,
                            st1.point_no AS report_point_no,
                            st1.item_no AS report_item_no,
                            st3.point_no,
                            st3.point_order,
                            st2.item_no,
                            st2.report_item_name,
                            st2.item_order
                        FROM
                            m_report_config st1
                            INNER JOIN m_report_item st2 ON st2.report_no = st1.report_no
                            INNER JOIN m_report_point st3 ON st3.report_no = st1.report_no
                        WHERE
                            st1.report_no = :report_no
                    ) t1
                    LEFT JOIN (
                        SELECT *
                        FROM (
                            SELECT
                                *,
                                ROW_NUMBER() OVER (
                                    PARTITION BY date_trunc('month', saisui_date), point_no, item_no
                                    ORDER BY saisui_date, saisui_time
                                ) AS sort
                            FROM t_inspection_result
                            WHERE
                                saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                                AND point_no IN (SELECT point_no FROM m_report_point WHERE report_no = :report_no)
                                AND EXTRACT('month' FROM saisui_date) = EXTRACT('month' FROM CAST(:saisui_date_start AS DATE))
                                AND inspection_kbn_code = :inspection_kbn_code
                        ) sub
                        WHERE sort = 1
                    ) t2 ON t2.point_no = t1.point_no AND t2.item_no = t1.item_no
                    LEFT JOIN m_saisui_point t3 ON t3.point_no = t1.point_no
                ),
                aggregated AS (
                    SELECT
                        item_no,
                        saisui_kbn_no,
                        point_no,
                        point_order,
                        item_order,
                        MIN(constant_data) AS inspection_data_min,
                        AVG(constant_data) AS inspection_data_avg,
                        MAX(qualitative_data) AS qualitative_data_max,
                        MIN(qualitative_data) AS qualitative_data_min,
                        COUNT(constant_data) AS inspection_data_cnt
                    FROM base_data
                    GROUP BY item_no, saisui_kbn_no, point_no, point_order, item_order
                ),
                max_date AS (
                    SELECT
                        item_no,
                        saisui_kbn_no,
                        point_no,
                        point_order,
                        item_order,
                        saisui_date,
                        constant_data AS inspection_data_max
                    FROM base_data
                    WHERE rn = 1
                )
                SELECT
                    to_char(m.saisui_date, 'YYYY/MM/DD') AS saisui_date,
                    m.inspection_data_max,
                    a.inspection_data_min,
                    a.inspection_data_avg,
                    a.qualitative_data_max,
                    a.qualitative_data_min,
                    a.inspection_data_cnt,
                    a.item_no,
                    a.saisui_kbn_no,
                    a.point_no,
                    a.point_order,
                    m.saisui_date
                FROM aggregated a
                LEFT JOIN max_date m
                    ON a.item_no = m.item_no
                    AND a.point_no = m.point_no
                    AND a.point_order = m.point_order
                    AND a.item_order = m.item_order
                ORDER BY a.point_order, a.item_order;
                SQL;
        return $SQL;
    }

    /**
     * 帳票取得SQLパラメータ作成
     *
     * @return array 取得用SQLパラメータ配列
     */
    protected function getBindParameterPast5years(
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
        // 対象期間となるよう修正
        $pastDateStart = date("Y/m/d", strtotime("$saisuiDateStart -5 year"));
        // 月末を取得する
        $saisuitmp = date("Y/m/d", strtotime("$saisuiDateStart 1 month"));
        $pasttmp = date("Y/m/d", strtotime("$saisuitmp -1 year"));
        $pastDateEnd = date("Y/m/d", strtotime("$pasttmp -1 day"));
        $bindValue = [
            'report_no' => $reportNo,
            'saisui_date_start' => $pastDateStart,
            'saisui_date_end' => $pastDateEnd,
            'inspection_kbn_code' => $inspectionKbnCode,
        ];
        return $bindValue;
    }

    /**
     * 帳票取得SQLパラメータ作成
     *
     * @return array 取得用SQLパラメータ配列
     */
    protected function getBindParameterPast5yearsDay(
        int $reportNo,
        int $pointNo,
        int $itemNo,
        string $saisuiDate,
        string $saisuiTime,
        int $inspectionKbnCode,
    ): array {
        $index = 0;
        $saisuiDataList5Years = array();

        $oldDate = $saisuiDate;

        do {
            $oldDate = date('Y/m/d', strtotime('-1 year', strtotime($oldDate)));
            $tmpNenGetsu = explode('/', $oldDate);
            // 月初日を取得する
            $tmpNenGetsu[2] = '01';
            $saisuiDateStart = implode('/', $tmpNenGetsu);

            // 月末を取得する
            $saisuitmp = date("Y/m/d", strtotime("$saisuiDateStart 1 month"));
            $saisuiDateEnd = date("Y/m/d", strtotime("$saisuitmp -1 day"));

            $saisuiDataList = $this->getSaisuiDate($pointNo, $saisuiDateStart, $saisuiDateEnd, 400);
            array_push($saisuiDataList5Years, $saisuiDataList[0]->saisui_date);
            $index++;
        } while ($index <= 4);

        $tmpNenGetsu = explode('/', $saisuiDate);
        // 月初日を取得する
        $tmpNenGetsu[2] = '01';
        $saisuiDateStart = implode('/', $tmpNenGetsu);
        // 対象期間となるよう修正
        $pastDateStart = date("Y/m/d", strtotime("$saisuiDateStart -5 year"));
        // 月末を取得する
        $saisuitmp = date("Y/m/d", strtotime("$saisuiDateStart 1 month"));
        $pasttmp = date("Y/m/d", strtotime("$saisuitmp -1 year"));
        $pastDateEnd = date("Y/m/d", strtotime("$pasttmp -1 day"));

        $bindValue = [
            'report_no' => $reportNo,
            'saisui_date_list' => '{' . implode(',', $saisuiDataList5Years) . '}',
            'saisui_date_start' => $pastDateStart,
            'saisui_date_end' => $pastDateEnd,
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
    public function getInspectionResultReport5yearsCalc(
        int $reportNo,
        int $pointNo,
        int $itemNo,
        string $saisuiDate,
        string $saisuiTime,
        int $inspectionKbnCode,
    ) {
        $SQL = $this->getReportQueryPast5yearsCalc();
        $bindValue = $this->getBindParameterPast5years(
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
     * 月報帳票出力情報取得
     *
     * @param int $reportNo 報告書番号
     * @param int $pointNo 地点番号
     * @param string $saisuiDate 採水年月日
     * @param string $saisuiTime 採水時刻
     * @param int $inspectionKbnCode 検査区分CD
     * @return array|false 検査結果|取得失敗(false)
     */
    public function getInspectionResultReport5yearsCalcDay(
        int $reportNo,
        int $pointNo,
        int $itemNo,
        string $saisuiDate,
        string $saisuiTime,
        int $inspectionKbnCode,
    ) {
        $SQL = $this->getReportQueryPast5yearsCalcDay();
        $bindValue = $this->getBindParameterPast5yearsDay(
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
     * 月報帳票出力情報取得
     *
     * @param int $reportNo 報告書番号
     * @param int $pointNo 地点番号
     * @param string $saisuiDate 採水年月日
     * @param string $saisuiTime 採水時刻
     * @param int $inspectionKbnCode 検査区分CD
     * @return array|false 検査結果|取得失敗(false)
     */
    public function getInspectionResultReport5yearsFirstSaisuiCalc(
        int $reportNo,
        int $pointNo,
        int $itemNo,
        string $saisuiDate,
        string $saisuiTime,
        int $inspectionKbnCode,
    ) {
        $SQL = $this->getReportQueryPast5yearsFirstSaisuiCalc();
        $bindValue = $this->getBindParameterPast5years(
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
     * 採水年月日 取得
     *
     * @param int $pointNo 地点番号
     * @param int $itemNo 項目番号
     * @param string $saisuiDateStart 採水年月日(開始)
     * @param string $saisuiDateEnd 採水年月日(終了)
     * @param int $inspectionKbnCode 検査区分CD
     * @return array|false 採水年月日|取得失敗(false)
     */
    public static function getSaisuiDate($pointNo, $saisuiDateStart, $saisuiDateEnd, $inspectionKbnCode)
    {
        try {
            $bindValue = [
                'point_no' => $pointNo,
                'saisuiDateStart' => $saisuiDateStart,
                'saisuiDateEnd' => $saisuiDateEnd,
                'inspectionKbnCode' => $inspectionKbnCode,
            ];

            $SQL = <<<SQL
                    SELECT
                        to_char(saisui_date, 'YYYY/MM/DD') AS saisui_date
                    FROM
                        t_inspection_result
                    WHERE
                        point_no = :point_no
                    AND item_no = 1
                    AND saisui_date BETWEEN :saisuiDateStart AND :saisuiDateEnd
                    AND inspection_kbn_code = :inspectionKbnCode
SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            Log::info($e->getTraceAsString());
        }
        return false;
    }
}
