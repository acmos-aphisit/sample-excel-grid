<?php

namespace App\Dao;

use App\Dao\ReportDaoAnnual;

/**
 * 年報（処理過程）専用（地点集約）
 */
class ReportDaoAnnualProcAggregation extends ReportDaoAnnual
{
    /**
     * 帳票取得クエリ作成
     *
     * @return string 取得用SQL文字列
     */
    protected function getReportQuery(): string
    {
        $SQL = <<<SQL
                with t_source as (
                    select
                      point_no,
                      item_no,
                      saisui_date,
                      case constant_qualitative_flg
                        when 1 then 
                          configure_fixed_quantity_data(constant_data, item_no, point_no, cast(:saisui_date_start as varchar),:report_no,:inspection_kbn_code)
                        when 2 then
                          case
                            when item_no in (2470,2460) and qualitative_data is null then 0
                            when item_no in (2470,2460) and qualitative_data = '異常なし' then 1
                            when item_no in (2470,2460) then 2
                            else null
                          end
                        else null
                      end as result_data
                    from
                      t_inspection_result
                    where
                      saisui_date between cast(:saisui_date_start as timestamp) AND :saisui_date_end -- :saisui_date_startだけでも明示的にtimestampに変換しておかないとエラーになる
                      and inspection_kbn_code = (case when item_no in (2400, 2410) then 5200 else :inspection_kbn_code end)
                      and point_no in (select point_no from m_report_point where report_no = :report_no)
                      and item_no in (select item_no from m_report_item where report_no = :report_no)
                )
                select
                  report_no,
                  point_no,
                  item_no,
                  saisui_kbn_no,
                  point_order,
                  item_order,
                  aggregation_order,
                  report_name,
                  report_point_name,
                  report_item_name,
                  aggregation,
                  result_data_month04,
                  result_data_month05,
                  result_data_month06,
                  result_data_month07,
                  result_data_month08,
                  result_data_month09,
                  result_data_month10,
                  result_data_month11,
                  result_data_month12,
                  result_data_month01,
                  result_data_month02,
                  result_data_month03,
                  result_data_year
                from (
                  select
                    m_master.report_no,
                    m_master.point_no,
                    m_master.item_no,
                    m_master.saisui_kbn_no,
                    m_master.point_order,
                    m_master.item_order,
                    m_master.aggregation_order,
                    m_master.report_name,
                    m_master.report_point_name,
                    m_master.report_item_name,
                    m_master.aggregation,
                    t_result.result_data_month04,
                    t_result.result_data_month05,
                    t_result.result_data_month06,
                    t_result.result_data_month07,
                    t_result.result_data_month08,
                    t_result.result_data_month09,
                    t_result.result_data_month10,
                    t_result.result_data_month11,
                    t_result.result_data_month12,
                    t_result.result_data_month01,
                    t_result.result_data_month02,
                    t_result.result_data_month03,
                    t_result.result_data_year,
                    row_number() over (partition by m_master.report_no, m_master.item_no, m_master.aggregation order by t_result.item_no nulls last, m_master.point_order, m_master.item_order) as priority
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
                      m_saisui_point.saisui_kbn_no,
                      m_agg.aggregation,
                      m_agg.aggregation_order
                    from
                      m_report_config
                      inner join m_report_point on m_report_point.report_no = m_report_config.report_no
                      inner join m_report_item on m_report_item.report_no = m_report_config.report_no
                      inner join m_saisui_point on m_saisui_point.point_no = m_report_point.point_no
                      cross join (
                        select '最大' as aggregation, 1 as aggregation_order
                        union all
                        select '最小' as aggregation, 2 as aggregation_order
                        union all
                        select '平均' as aggregation, 3 as aggregation_order
                      ) as m_agg
                    where
                      m_report_config.report_no = :report_no
                  ) as m_master
                  left outer join (
                  select
                    point_no,
                    item_no,
                    '最大' as aggregation,
                    max(case when extract(month from saisui_date) = 4 then result_data else null end) as result_data_month04,
                    max(case when extract(month from saisui_date) = 5 then result_data else null end) as result_data_month05,
                    max(case when extract(month from saisui_date) = 6 then result_data else null end) as result_data_month06,
                    max(case when extract(month from saisui_date) = 7 then result_data else null end) as result_data_month07,
                    max(case when extract(month from saisui_date) = 8 then result_data else null end) as result_data_month08,
                    max(case when extract(month from saisui_date) = 9 then result_data else null end) as result_data_month09,
                    max(case when extract(month from saisui_date) = 10 then result_data else null end) as result_data_month10,
                    max(case when extract(month from saisui_date) = 11 then result_data else null end) as result_data_month11,
                    max(case when extract(month from saisui_date) = 12 then result_data else null end) as result_data_month12,
                    max(case when extract(month from saisui_date) = 1 then result_data else null end) as result_data_month01,
                    max(case when extract(month from saisui_date) = 2 then result_data else null end) as result_data_month02,
                    max(case when extract(month from saisui_date) = 3 then result_data else null end) as result_data_month03,
                    max(result_data) as result_data_year
                  from t_source
                  group by point_no, item_no
                  union all
                  select
                    point_no,
                    item_no,
                    '最小' as aggregation,
                    min(case when extract(month from saisui_date) = 4 then result_data else null end) as result_data_month04,
                    min(case when extract(month from saisui_date) = 5 then result_data else null end) as result_data_month05,
                    min(case when extract(month from saisui_date) = 6 then result_data else null end) as result_data_month06,
                    min(case when extract(month from saisui_date) = 7 then result_data else null end) as result_data_month07,
                    min(case when extract(month from saisui_date) = 8 then result_data else null end) as result_data_month08,
                    min(case when extract(month from saisui_date) = 9 then result_data else null end) as result_data_month09,
                    min(case when extract(month from saisui_date) = 10 then result_data else null end) as result_data_month10,
                    min(case when extract(month from saisui_date) = 11 then result_data else null end) as result_data_month11,
                    min(case when extract(month from saisui_date) = 12 then result_data else null end) as result_data_month12,
                    min(case when extract(month from saisui_date) = 1 then result_data else null end) as result_data_month01,
                    min(case when extract(month from saisui_date) = 2 then result_data else null end) as result_data_month02,
                    min(case when extract(month from saisui_date) = 3 then result_data else null end) as result_data_month03,
                    min(result_data) as result_data_year
                  from t_source
                  group by point_no, item_no
                  union all
                  select
                    point_no,
                    item_no,
                    '平均' as aggregation,
                    avg(case when extract(month from saisui_date) = 4 then result_data else null end) as result_data_month04,
                    avg(case when extract(month from saisui_date) = 5 then result_data else null end) as result_data_month05,
                    avg(case when extract(month from saisui_date) = 6 then result_data else null end) as result_data_month06,
                    avg(case when extract(month from saisui_date) = 7 then result_data else null end) as result_data_month07,
                    avg(case when extract(month from saisui_date) = 8 then result_data else null end) as result_data_month08,
                    avg(case when extract(month from saisui_date) = 9 then result_data else null end) as result_data_month09,
                    avg(case when extract(month from saisui_date) = 10 then result_data else null end) as result_data_month10,
                    avg(case when extract(month from saisui_date) = 11 then result_data else null end) as result_data_month11,
                    avg(case when extract(month from saisui_date) = 12 then result_data else null end) as result_data_month12,
                    avg(case when extract(month from saisui_date) = 1 then result_data else null end) as result_data_month01,
                    avg(case when extract(month from saisui_date) = 2 then result_data else null end) as result_data_month02,
                    avg(case when extract(month from saisui_date) = 3 then result_data else null end) as result_data_month03,
                    avg(result_data) as result_data_year
                  from t_source
                  group by point_no, item_no
                  ) as t_result on t_result.point_no = m_master.point_no and t_result.item_no = m_master.item_no and t_result.aggregation = m_master.aggregation
                )
                where priority = 1
                order by item_order, aggregation_order
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
            'inspection_kbn_code' => $inspectionKbnCode,
            'saisui_date_start' => $nendo['date_start'],
            'saisui_date_end' => $nendo['date_end'],
        ];
        return $bindValue;
    }
}
