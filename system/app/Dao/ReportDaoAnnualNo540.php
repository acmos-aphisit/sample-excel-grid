<?php

namespace App\Dao;

use App\Dao\ReportDaoAnnual;

/**
 * 年報用Dao(全地点データ取得)
 */
class ReportDaoAnnualNo540 extends ReportDaoAnnual
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
                            st1.report_no
                            , st1.point_no as report_point_no
                            , st1.item_no as report_item_no
                            , st3.point_no
                            , st3.point_order
                            , st2.item_no
                            , st2.report_item_name
                            , st2.item_order 
                        from
                            m_report_config st1 
                            inner join m_report_item st2 
                                on st2.report_no = st1.report_no 
                            inner join m_report_point st3 
                                on st3.report_no = st1.report_no 
                        where
                            st1.report_no = :report_no
                    ) 
                    , annual_date as ( 
                        SELECT
                            to_char( 
                                generate_series( 
                                    :saisui_date_start ::date
                                    , :saisui_date_end ::date
                                    , '1 month'
                                ) 
                                , 'yyyy/mm'
                            ) as annual_date
                    ) 
                    , item_data As ( 
                        With inspect_date AS ( 
                            SELECT
                                annual_date
                                , point_no
                                , point_order 
                            FROM
                                ( 
                                    SELECT DISTINCT
                                        ad.annual_date
                                        , pd.point_no
                                        , pd.point_order
                                        , row_number() over ( 
                                            PARTITION BY
                                                pd.point_no 
                                                ,ad.annual_date
                                        ) as sort 
                                    FROM
                                        annual_date as ad 
                                        cross join point_data pd 
                                    WHERE
                                        ad.annual_date BETWEEN to_char(cast(:saisui_date_start as date), 'yyyy/mm') AND to_char(cast(:saisui_date_end as date), 'yyyy/mm')
                                    ORDER BY
                                        pd.point_order
                                        , ad.annual_date
                                ) 
                            WHERE
                                sort = 1

                        ) 
                        SELECT
                            id.annual_date as saisui_date
                            , id.point_no
                            , id.point_order
                            , mi.item_no
                            , mi.item_order 
                        FROM
                            m_report_item mi 
                            CROSS JOIN inspect_date id 
                        WHERE
                            mi.report_no = :report_no 
                        ORDER BY
                            id.point_order
                    --         , id.saisui_date
                            , id.annual_date
                            , mi.item_order
                    )
                    , inspaction_data AS ( 
                        SELECT
                            * 
                        FROM
                            ( 
                                SELECT
                                    ti.*
                                    , row_number() over ( 
                                        PARTITION BY
                                            ti.point_no
                                            , ti.item_no
                                            , saisui_date 
                                        ORDER BY
                                            saisui_time
                                    ) as sort 
                                FROM
                                    t_inspection_result ti 
                                    INNER JOIN point_data pd 
                                        ON ti.point_no = pd.point_no 
                                        AND ti.item_no = pd.item_no 
                                WHERE
                                    ti.inspection_kbn_code = :inspection_kbn_code
                            ) 
                        WHERE
                            sort = 1
                    ) 
                    SELECT
                        CASE constant_qualitative_flg 
                            -- WHEN 1 THEN CAST(ti.constant_data as TEXT) 
                            WHEN 1 THEN CAST(configure_fixed_quantity_data(ti.constant_data, ti.item_no, ti.point_no, cast(:saisui_date_start as varchar),:report_no,:inspection_kbn_code) as TEXT) 
                            WHEN 2 THEN ti.qualitative_data 
                            ELSE NULL 
                            END AS inspection_data
                        , ti.constant_qualitative_flg
                        , mi.item_no
                        , mi.point_order
                        , mi.item_order
                        , sp.saisui_kbn_no
                        , mi.point_no
                        , sp.point_report_name 
                    FROM
                        item_data mi 
                        LEFT JOIN inspaction_data ti 
                            ON mi.item_no = ti.item_no 
                            AND mi.point_no = ti.point_no 
                            AND mi.saisui_date = to_char(ti.saisui_date , 'yyyy/mm')
                        LEFT JOIN m_saisui_point sp 
                            ON sp.point_no = ti.point_no 
                    ORDER BY
                        mi.point_order
                        , mi.saisui_date
                        , mi.item_order

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
            // 'item_no' => $itemNo,
            'inspection_kbn_code' => $inspectionKbnCode,
            'saisui_date_start' => $nendo['date_start'],
            'saisui_date_end' => $nendo['date_end'],
        ];
        return $bindValue;
    }
}
