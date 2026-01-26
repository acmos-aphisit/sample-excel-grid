<?php

namespace App\Dao;

use App\Dao\ReportDao;

/**
 * 年報用Dao
 */
class ReportDaoAnnualNo127 extends ReportDao
{
    /**
     * 帳票取得クエリ作成
     *
     * @return string 取得用SQL文字列
     */
    protected function getReportQuery(): string
    {
        $SQL = <<<SQL
                    with t_source_data as (
                        select
                            point_no,
                            case
                                when item_no in (select item_no from m_inspection_item where item_tyu_category_no = 81 and item_no != 8105 EXCEPT select item_no from m_report_item where report_no = :report_no) then 8160
                                when item_no in (select item_no from m_inspection_item where item_tyu_category_no = 82 EXCEPT select item_no from m_report_item where report_no = :report_no) then 8510
                                when item_no in (select item_no from m_inspection_item where item_tyu_category_no = 83 EXCEPT select item_no from m_report_item where report_no = :report_no) then 8890
                                else item_no
                            end as item_no,
                            saisui_date,
                            case constant_qualitative_flg
                                when 1 then constant_data
                                when 2 then
                                case
                                    when item_no = 1 then (date_part('year', to_date(qualitative_data,'YYYY/MM/DD')) * 10000) + (date_part('month', to_date(qualitative_data,'YYYY/MM/DD')) * 100) + date_part('day', to_date(qualitative_data,'YYYY/MM/DD'))
                                    else null
                                end
                                else null
                            end as result_data,
                            row_number() over (partition by point_no, item_no, saisui_date) as data_priority
                        from
                            t_inspection_result
                        where
                            saisui_date between :saisui_date_start AND :saisui_date_end
                            and (
                                (point_no = :point_no and item_no not in (2400,2410) and inspection_kbn_code = :inspection_kbn_code)
                                or
                                (case when :point_no = 169  and item_no in (2400,2410) and point_no = 1012      and inspection_kbn_code = 5200 then True else False end = True)
                                or
                                (case when :point_no != 169 and item_no in (2400,2410) and point_no = :point_no and inspection_kbn_code = 5200 then True else False end = True)
                            )
                    ), t_source_month as (
                        select
                            * 
                        from
                            ( 
                                select
                                    saisui_date
                                    , row_number() over ( 
                                        PARTITION BY
                                            date_trunc('month', saisui_date) 
                                        ORDER BY
                                            saisui_date
                                    ) as saisui_date_order
                                from
                                    t_inspection_result 
                                where
                                    saisui_date between :saisui_date_start AND :saisui_date_end 
                                    and point_no = :point_no 
                                    and item_no = 1 
                                    and inspection_kbn_code = :inspection_kbn_code
                            ) 
                        where
                            saisui_date_order in (1, 2) 
                        order by
                            saisui_date
                            , saisui_date_order
                    ),
                    t_source as (
                        select
                            t_source_data.*,
                            t_source_month.saisui_date_order
                        from
                            t_source_data
                        inner join t_source_month on t_source_data.saisui_date = t_source_month.saisui_date
                        where
                            data_priority = 1
                    )
                    select
                        report_no,
                        point_no,
                        item_no,
                        saisui_kbn_no,
                        point_order,
                        item_order,
                        report_name,
                        report_point_name,
                        report_item_name,
                        result_data_month04_1,
                        result_data_month04_2,
                        result_data_month05_1,
                        result_data_month05_2,
                        result_data_month06_1,
                        result_data_month06_2,
                        result_data_month07_1,
                        result_data_month07_2,
                        result_data_month08_1,
                        result_data_month08_2,
                        result_data_month09_1,
                        result_data_month09_2,
                        result_data_month10_1,
                        result_data_month10_2,
                        result_data_month11_1,
                        result_data_month11_2,
                        result_data_month12_1,
                        result_data_month12_2,
                        result_data_month01_1,
                        result_data_month01_2,
                        result_data_month02_1,
                        result_data_month02_2,
                        result_data_month03_1,
                        result_data_month03_2
                    from (
                        select
                            m_master.report_no,
                            m_master.point_no,
                            m_master.item_no,
                            m_master.saisui_kbn_no,
                            m_master.point_order,
                            m_master.item_order,
                            m_master.report_name,
                            m_master.report_point_name,
                            m_master.report_item_name,
                            t_result.result_data_month04_1,
                            t_result.result_data_month04_2,
                            t_result.result_data_month05_1,
                            t_result.result_data_month05_2,
                            t_result.result_data_month06_1,
                            t_result.result_data_month06_2,
                            t_result.result_data_month07_1,
                            t_result.result_data_month07_2,
                            t_result.result_data_month08_1,
                            t_result.result_data_month08_2,
                            t_result.result_data_month09_1,
                            t_result.result_data_month09_2,
                            t_result.result_data_month10_1,
                            t_result.result_data_month10_2,
                            t_result.result_data_month11_1,
                            t_result.result_data_month11_2,
                            t_result.result_data_month12_1,
                            t_result.result_data_month12_2,
                            t_result.result_data_month01_1,
                            t_result.result_data_month01_2,
                            t_result.result_data_month02_1,
                            t_result.result_data_month02_2,
                            t_result.result_data_month03_1,
                            t_result.result_data_month03_2,
                            row_number() over (partition by m_master.report_no, m_master.point_no, m_master.item_no order by t_result.item_no nulls last, m_master.point_order, m_master.item_order) as priority
                        from (
                            select
                                m_report_config.report_no,
                                m_report_config.report_name,
                                m_report_point.point_no,
                                m_report_point.report_point_name,
                                m_report_point.point_order,
                                m_report_item.item_no,
                                m_report_item.report_item_name,
                                m_report_item.item_order,
                                m_saisui_point.saisui_kbn_no
                            from
                                m_report_config
                            inner join m_report_point on m_report_point.report_no = m_report_config.report_no
                            inner join m_report_item on m_report_item.report_no = m_report_config.report_no
                            inner join m_saisui_point on m_saisui_point.point_no = m_report_point.point_no
                            where
                                m_report_config.report_no = :report_no
                                and m_report_point.point_no = :point_no
                        ) as m_master
                        left outer join (
                            select
                                case point_no when 1012 then :point_no
                                else point_no
                                end as point_no,
                                item_no,
                                sum(case when extract(month from saisui_date) = 4 and saisui_date_order = 1 then result_data else null end) as result_data_month04_1,
                                sum(case when extract(month from saisui_date) = 4 and saisui_date_order = 2 then result_data else null end) as result_data_month04_2,
                                sum(case when extract(month from saisui_date) = 5 and saisui_date_order = 1 then result_data else null end) as result_data_month05_1,
                                sum(case when extract(month from saisui_date) = 5 and saisui_date_order = 2 then result_data else null end) as result_data_month05_2,
                                sum(case when extract(month from saisui_date) = 6 and saisui_date_order = 1 then result_data else null end) as result_data_month06_1,
                                sum(case when extract(month from saisui_date) = 6 and saisui_date_order = 2 then result_data else null end) as result_data_month06_2,
                                sum(case when extract(month from saisui_date) = 7 and saisui_date_order = 1 then result_data else null end) as result_data_month07_1,
                                sum(case when extract(month from saisui_date) = 7 and saisui_date_order = 2 then result_data else null end) as result_data_month07_2,
                                sum(case when extract(month from saisui_date) = 8 and saisui_date_order = 1 then result_data else null end) as result_data_month08_1,
                                sum(case when extract(month from saisui_date) = 8 and saisui_date_order = 2 then result_data else null end) as result_data_month08_2,
                                sum(case when extract(month from saisui_date) = 9 and saisui_date_order = 1 then result_data else null end) as result_data_month09_1,
                                sum(case when extract(month from saisui_date) = 9 and saisui_date_order = 2 then result_data else null end) as result_data_month09_2,
                                sum(case when extract(month from saisui_date) = 10 and saisui_date_order = 1 then result_data else null end) as result_data_month10_1,
                                sum(case when extract(month from saisui_date) = 10 and saisui_date_order = 2 then result_data else null end) as result_data_month10_2,
                                sum(case when extract(month from saisui_date) = 11 and saisui_date_order = 1 then result_data else null end) as result_data_month11_1,
                                sum(case when extract(month from saisui_date) = 11 and saisui_date_order = 2 then result_data else null end) as result_data_month11_2,
                                sum(case when extract(month from saisui_date) = 12 and saisui_date_order = 1 then result_data else null end) as result_data_month12_1,
                                sum(case when extract(month from saisui_date) = 12 and saisui_date_order = 2 then result_data else null end) as result_data_month12_2,
                                sum(case when extract(month from saisui_date) = 1 and saisui_date_order = 1 then result_data else null end) as result_data_month01_1,
                                sum(case when extract(month from saisui_date) = 1 and saisui_date_order = 2 then result_data else null end) as result_data_month01_2,
                                sum(case when extract(month from saisui_date) = 2 and saisui_date_order = 1 then result_data else null end) as result_data_month02_1,
                                sum(case when extract(month from saisui_date) = 2 and saisui_date_order = 2 then result_data else null end) as result_data_month02_2,
                                sum(case when extract(month from saisui_date) = 3 and saisui_date_order = 1 then result_data else null end) as result_data_month03_1,
                                sum(case when extract(month from saisui_date) = 3 and saisui_date_order = 2 then result_data else null end) as result_data_month03_2
                            from t_source
                            group by point_no, item_no
                        ) as t_result on t_result.point_no = m_master.point_no and t_result.item_no = m_master.item_no
                    )
                    where priority = 1
                    order by point_order, item_order
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
