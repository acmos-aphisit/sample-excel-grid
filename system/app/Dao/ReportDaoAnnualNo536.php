<?php

namespace App\Dao;

use App\Dao\ReportDaoAnnual;

/**
 * 年報用Dao(全地点データ取得)
 */
class ReportDaoAnnualNo536 extends ReportDaoAnnual
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
                                    row_number() over (PARTITION BY pd.point_no ORDER BY ti.saisui_date) as sort
                                FROM
                                    point_data pd 
                                    LEFT JOIN 
                                    t_inspection_result ti 
                                        ON ti.point_no = pd.point_no 
                                        AND ti.item_no = :item_no
                                        AND ti.saisui_date BETWEEN :saisui_date_start AND :saisui_date_end 
                                        AND ti.inspection_kbn_code = :inspection_kbn_code 
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
                    SELECT ti.*
                    FROM t_inspection_result ti
                    INNER JOIN point_data pd ON ti.point_no = pd.point_no AND ti.item_no = pd.item_no
                    WHERE ti.inspection_kbn_code = :inspection_kbn_code
                )
                SELECT
                    CASE constant_qualitative_flg
                        WHEN 1 THEN CAST(ti.constant_data as TEXT)
                        WHEN 2 THEN ti.qualitative_data
                        ELSE NULL END AS inspection_data,
                    ti.constant_qualitative_flg,
                    mi.item_no,
                    mi.point_order,
                    mi.item_order,
                    sp.saisui_kbn_no,
                    sp.point_no,
                    sp.point_report_name
                FROM
                    item_data mi
                LEFT JOIN
                    inspaction_data ti ON mi.item_no = ti.item_no
                    AND mi.point_no = ti.point_no
                    AND mi.saisui_date = ti.saisui_date
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

    /**
     * 帳票取得クエリ作成
     *
     * @return string 取得用SQL文字列
     */
    private function getReportQueryDioxin(int $reportNo): string
    {
        // 地点番号を指定
        $getPoint = '';
        if ($reportNo == '536') {
            $getPoint = '190, 50, 201, 70, 23, 83, 28';
            $pointRecords = <<<SQL
                (190, 1)
                , (50, 2)
                , (201,3)
                , (70, 4)
                , (23, 5)
                , (83, 6)
                , (28, 7)
            SQL;
        } elseif ($reportNo == '537') {
            $getPoint = '17, 244, 12, 74';
            $pointRecords = <<<SQL
                (17, 1)
                , (244,2)
                , (12, 3)
                , (74, 4)
            SQL;
        } elseif ($reportNo == '538') {
            $getPoint = '16, 30, 9, 63, 98';
            $pointRecords = <<<SQL
                (16, 1)
                , (30, 2)
                , (9,  3)
                , (63, 4)
                , (98, 5)
            SQL;
        } elseif ($reportNo == '539') {
            $getPoint = '14, 36, 15, 95';
            $pointRecords = <<<SQL
                (14, 1)
                , (36, 2)
                , (15,3)
                , (95, 4)
            SQL;
        } else {
            // 年報（要検討項目）（県西広域）と同じ値とする。
            $getPoint = '190, 50, 201, 70, 23, 83, 28';
            $pointRecords = <<<SQL
                (190, 1)
                , (50, 2)
                , (201,3)
                , (70, 4)
                , (23, 5)
                , (83, 6)
                , (28, 7)
            SQL;
        }

        $SQL = <<<SQL
                WITH seasonData as (
                    WITH itemData as (
                        SELECT
                        item_no,
                        point_no,
                        sort
                        FROM
                            m_report_item
                        CROSS JOIN
                        (
                            select
                                *
                            FROM
                                ( 
                                    values 
                                    $pointRecords
                                ) as t(point_no, sort)
                        )
                        WHERE
                            report_no = :report_no
                    )
                    SELECT
                    *, 1 as season
                    FROM
                    itemData
                    UNION
                    SELECT
                    *, 2 as season
                    FROM
                    itemData
                    order by
                        sort,season
                )
                SELECT 
                    CASE constant_qualitative_flg
                                WHEN 1 THEN CAST(ti.constant_data as TEXT)
                                WHEN 2 THEN ti.qualitative_data
                                ELSE NULL END AS inspection_data,
                    ti.constant_qualitative_flg,
                    sd.item_no,
                    sd.point_no,
                    sd.season,
                    sp.saisui_kbn_no,
                    sp.point_report_name
                FROM
                    seasonData sd
                LEFT JOIN
                    (
                        SELECT
                            ti.*,
                            row_number() over (PARTITION BY ti.point_no, ti.item_no ORDER BY ti.saisui_date) as sort
                        FROM
                            t_inspection_result ti
                        WHERE
                            ti.point_no IN ($getPoint)
                            AND saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                            AND inspection_kbn_code = :inspection_kbn_code
                    ) ti ON sd.item_no = ti.item_no AND sd.point_no = ti.point_no AND sd.season = ti.sort
                    LEFT JOIN
                            m_saisui_point sp ON sp.point_no = ti.point_no
                    LEFT JOIN m_report_point rp
                        ON rp.report_no = :report_no
                       AND sd.point_no = rp.point_no
                    LEFT JOIN m_report_item ri
                        ON ri.report_no = :report_no
                       AND sd.item_no = ri.item_no
                ORDER BY
                    sd.sort,
                    sd.season,
                    ri.item_order

                SQL;
        return $SQL;
    }

    /**
     * 帳票取得SQLパラメータ作成
     *
     * @return array 取得用SQLパラメータ配列
     */
    private function getBindParameterDioxin(
        string $saisuiDate,
        int $reportNo
    ): array {
        $nendo = $this->getNendoStartEnd($saisuiDate);

        $bindValue = [
            'report_no' => $reportNo,
            'inspection_kbn_code' => 13100,
            'saisui_date_start' => $nendo['date_start'],
            'saisui_date_end' => $nendo['date_end'],
        ];
        return $bindValue;
    }

    public function getInspectionResultDioxin(
        int $reportNo,
        string $saisuiDate
    ) {
        $SQL = $this->getReportQueryDioxin($reportNo);
        $bindValue = $this->getBindParameterDioxin($saisuiDate, $reportNo);

        return $this->executeSelectData($SQL, $bindValue);
    }

    /**
     * 帳票取得クエリ作成
     *
     * @return string 取得用SQL文字列
     */
    private function getReportQueryMicro(int $reportNo): string
    {
        // 地点番号を指定
        $getPoint = '';
        if ($reportNo == '536') {
            $getPoint = '50, 10, 70, 23, 83, 28';
            $multiPoint = '50, 70';
        } elseif ($reportNo == '537') {
            $getPoint = '17, 244, 12, 74';
            $multiPoint = '9999';
        } elseif ($reportNo == '538') {
            $getPoint = '16, 30, 9, 63, 98';
            $multiPoint = '30, 98';
        } elseif ($reportNo == '539') {
            $getPoint = '14, 36, 15, 95';
            $multiPoint = '36, 95';
        } else {
            // 年報（要検討項目）（県南広域）と同じ値とする。
            $getPoint = '16, 30, 9, 63, 98';
        }
        // 取得項目を指定
        $getItem = '1,2,1030,5000,5010,4250';

        $SQL = <<<SQL
                WITH config AS (
                    SELECT :multi_flg::boolean AS use_dummy
                ),
                itemData AS (
                    SELECT
                        item_no,
                        point_no
                    FROM (
                        SELECT item_no
                        FROM m_report_item
                        WHERE report_no = :report_no
                    ) AS items
                    CROSS JOIN (
                        SELECT point_no
                        FROM m_saisui_point
                        WHERE point_no IN ($getPoint)
                    ) AS points
                ),
                dateDataRaw AS (
                    SELECT
                        ti.point_no,
                        ti.saisui_date,
                        ti.saisui_time,
                        row_number() OVER (PARTITION BY ti.point_no ORDER BY ti.saisui_date) AS sort
                    FROM
                        t_inspection_result ti
                    WHERE
                        ti.item_no = :item_no
                        AND ti.point_no IN ($getPoint)
                        AND saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                        AND inspection_kbn_code = :inspection_kbn_code
                ),
                dummyFrame AS (
                    SELECT point_no, generate_series(1, 3) AS sort
                    FROM (SELECT unnest(ARRAY[$multiPoint]) AS point_no) AS p
                ),
                dateDataPadded AS (
                    SELECT
                        df.point_no,
                        df.sort,
                        dr.saisui_date::timestamp AS saisui_date,
                        dr.saisui_time::text AS saisui_time
                    FROM dummyFrame df
                    LEFT JOIN dateDataRaw dr
                        ON df.point_no = dr.point_no AND df.sort = dr.sort
                ),
                dateDataNormal AS (
                    SELECT
                        point_no,
                        sort,
                        saisui_date::timestamp AS saisui_date,
                        saisui_time::text AS saisui_time
                    FROM dateDataRaw
                    WHERE point_no NOT IN ($multiPoint)
                ),
                dateData AS (
                    SELECT point_no, sort, saisui_date, saisui_time FROM dateDataNormal
                    UNION ALL
                    SELECT point_no, sort, saisui_date, saisui_time FROM dateDataPadded
                    WHERE EXISTS (SELECT 1 FROM config WHERE use_dummy)
                )
                SELECT
                    CASE ti.constant_qualitative_flg
                        WHEN 1 THEN CAST(ti.constant_data AS TEXT)
                        WHEN 2 THEN ti.qualitative_data
                        ELSE NULL
                    END AS inspection_data,
                    ti.constant_qualitative_flg,
                    id.item_no,
                    id.point_no,
                    dd.sort,
                    sp.saisui_kbn_no,
                    sp.point_report_name
                FROM
                    itemData id
                LEFT JOIN dateData dd
                    ON id.point_no = dd.point_no
                LEFT JOIN t_inspection_result ti
                    ON id.item_no = ti.item_no
                    AND id.point_no = ti.point_no
                    AND ti.saisui_date = dd.saisui_date
                    AND ti.saisui_time = dd.saisui_time::text
                    AND ti.inspection_kbn_code = :inspection_kbn_code
                LEFT JOIN m_saisui_point sp
                    ON id.point_no = sp.point_no
                LEFT JOIN m_report_point rp
                    ON rp.report_no = :report_no
                    AND id.point_no = rp.point_no
                LEFT JOIN m_report_item ri
                    ON ri.report_no = :report_no
                    AND id.item_no = ri.item_no
                WHERE
                    (id.point_no in ($multiPoint)) or ( id.point_no not in ($multiPoint) and dd.sort = 1)
                ORDER BY
                    rp.point_order,
                    dd.sort,
                    ri.item_order,
                    dd.saisui_date
                SQL;
        return $SQL;
    }

    /**
     * 帳票取得SQLパラメータ作成
     *
     * @return array 取得用SQLパラメータ配列
     */
    private function getBindParameterMicro(
        string $saisuiDate,
        int $reportNo
    ): array {
        $nendo = $this->getNendoStartEnd($saisuiDate);
        $multiFlg = true;

        if ($reportNo == '537') {
            $multiFlg = false;
        }

        $bindValue = [
            'item_no' => 4250,
            'report_no' => $reportNo,
            'inspection_kbn_code' => 13200,
            'saisui_date_start' => $nendo['date_start'],
            'saisui_date_end' => $nendo['date_end'],
            'multi_flg' => $multiFlg,
        ];
        return $bindValue;
    }

    public function getInspectionResultMicro(
        int $reportNo,
        string $saisuiDate
    ) {
        $SQL = $this->getReportQueryMicro($reportNo);
        $bindValue = $this->getBindParameterMicro($saisuiDate, $reportNo);

        return $this->executeSelectData($SQL, $bindValue);
    }
}
