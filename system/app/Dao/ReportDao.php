<?php

namespace App\Dao;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * 帳票用共通Dao
 *
 */
abstract class ReportDao
{
    /**
     * 帳票出力情報取得
     *
     * @param int $reportNo 報告書番号
     * @param int $pointNo 地点番号
     * @param string $saisuiDate 採水年月日
     * @param string $saisuiTime 採水時刻
     * @param int $inspectionKbnCode 検査区分CD
     * @return array|false 検査結果|取得失敗(false)
     */
    abstract public function getInspectionResultReport(
        int $reportNo,
        int $pointNo,
        int $itemNo,
        string $saisuiDate,
        string $saisuiTime,
        int $inspectionKbnCode,
    );

    /**
     * 検索実行処理
     *
     * @param string $SQL 検索実行SQL
     * @param array $bindValue バインドパラメータ
     * @return array|false 実行結果|取得失敗(false)
     */
    public function executeSelectData(string $SQL, array $bindValue = [])
    {
        try {
            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            Log::info($e->getTraceAsString());
        }

        return false;
    }

    /**
     * 報告書構成マスタ:報告書分類取得
     *
     * @param int $reportNo 報告書番号
     * @return array|false 報告書分類|取得失敗(false)
     */
    public static function getReportCategory(int $reportNo)
    {
        try {
            $bindValue = [
                'report_No' => $reportNo
            ];

            $SQL = <<<SQL
                    SELECT
                        report_no,
                        report_name,
                        report_type,
                        report_category,
                        data_sheet_type,
                        input_dsp_no,
                        point_no,
                        item_no,
                        mask_pattern,
                        row_start_cell_name,
                        col_start_cell_name,
                        kensa_kbn_code,
                        template_file,
                        dsp_up_limit,
                        dsp_low_limit,
                        dsp_space,
                        0 AS monthly_list_order
                    FROM
                        m_report_config
                    WHERE
                        report_No = :report_No
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

    /**
     * 検査結果取得(固定文言取得)
     *
     * @param int $reportNo 報告書番号
     * @param int $pointNo 地点番号
     * @param string $saisuiDate 採水年月日
     * @param int $inspectionKbnCode 検査区分CD
     * @return array|false 検査結果|取得失敗(false)
     */
    public function getInspectionResultReportText(
        int $reportNo,
        int $pointNo,
        string $saisuiDate,
        ?string $inspectionKbnCode = null,
        ?string $excludeKbnFlg = null,
    ) {
        $bindValue = [
            'point_no' => $pointNo,
            'saisui_date' => $saisuiDate,
        ];

        $where = '';

        if (!is_null($inspectionKbnCode)) {
            $bindValue['inspection_kbn_code'] = $inspectionKbnCode;
            $kbnSign = is_null($excludeKbnFlg) ? '=' : '<>';
            $where .= ' AND ti.inspection_kbn_code ' . $kbnSign . ' :inspection_kbn_code ';
        }

        $SQL = <<<SQL
                WITH inspection AS(
                    SELECT ti.*,
                        sp.saisui_kbn_no,
                        sp.point_report_name
                    FROM t_inspection_result ti
                    LEFT JOIN
                        m_saisui_point sp ON sp.point_no = ti.point_no
                    WHERE ti.point_no = :point_no
                    AND saisui_date = :saisui_date
                    $where
                )
                SELECT
                    CAST(ti.constant_data as TEXT) AS constant_data,
                    ti.qualitative_data,
                    ti.constant_qualitative_flg,
                    ti.item_no,
                    ti.saisui_kbn_no,
                    ti.point_report_name
                FROM
                    inspection ti 
                ORDER BY ti.item_no
                SQL;

        return $this->executeSelectData($SQL, $bindValue);
    }

    /**
     * 報告書固定文言マスタ:報告書固定文言取得
     *
     * @param int $reportNo 報告書番号
     * @param int $pointNo  地点番号
     * @param string $textCellKbn  固定文言区分
     * @return array|false 報告書固定文言マスタ|取得失敗(false)
     */
    public function getReportText(int $reportNo, string $textCellKbn = null)
    {
        $where = "";
        $bindValue['report_no'] = $reportNo;

        if (isset($textCellKbn)) {
            $bindValue['text_cell_kbn'] = $textCellKbn;
            $where .= " AND text_cell_kbn = :text_cell_kbn ";
        }

        $SQL = <<<SQL
                SELECT
                    text_cell_name,
                    text_cell_kbn,
                    text_cell_code
                FROM
                    m_report_text
                WHERE
                    report_No = :report_no
                    $where
                SQL;

        return $this->executeSelectData($SQL, $bindValue);
    }

    /**
     * 補正基準値取得
     *
     * @return array|false 補正基準値|取得失敗(false)
     */
    public function getCriteriaCorrection(int $reportNo, string $saisuiDate)
    {
        $nendo = substr(date("Y/m/d", strtotime("$saisuiDate -3 month")), 0, 4);
        $bindValue = [
            'report_no' => $reportNo,
            'hou_kijyun_no' => $nendo,
        ];

        $SQL = <<<SQL
                SELECT
                    report_no,
                    point_no,
                    item_no,
                    inspection_kbn_code,
                    saisui_kbn_no,
                    hou_kijyun_no,
                    report_low_limit,
                    valid_digits,
                    input_min_digits,
                    output_min_digits
                FROM
                    t_criteria_correction
                WHERE
                    input_dsp_no IS NULL
                AND (report_no = :report_no OR report_no IS NULL)
                AND (hou_kijyun_no = :hou_kijyun_no OR hou_kijyun_no IS NULL)
                SQL;

        return $this->executeSelectData($SQL, $bindValue);
    }

    /**
     * 補正基準算出用定量データ取得
     *
     * @param int $pointNo 地点番号
     * @param string $saisuiDate 採水年月日開始日
     * @param string $saisuiTime 採水年月日終了日
     * @param int $inspectionKbnCode 検査区分CD
     * @param int $itemNo 補正基準取得対象項目番号()
     * @return array|false 検査結果|取得失敗(false)
     */
    public function getInspectionResultCriteria(
        int $pointNo,
        string $saisuiDate,
        string $saisuiTime,
        int $inspectionKbnCode,
        int $itemNo
    ) {
        $bindValue = [
            'point_no' => $pointNo,
            'saisui_date' => $saisuiDate,
            'saisui_time' => $saisuiTime,
            'inspection_kbn_code' => $inspectionKbnCode,
        ];

        // 項目番号により、取得する項目を調整
        $itemCondition = '';
        if ($itemNo === 2250) {
            $itemCondition = '2210, 2230, 2270, 2280';
        } elseif ($itemNo === 6010) {
            $itemCondition = '2212, 2232, 2272, 2282';
        }

        $SQL = <<<SQL
                SELECT
                    CAST(constant_data as TEXT) AS inspection_data
                    , item_no
                FROM
                    public.t_inspection_result 
                WHERE
                    point_no = :point_no
                    AND saisui_date = :saisui_date
                    AND saisui_time = :saisui_time
                    AND inspection_kbn_code = :inspection_kbn_code
                    AND item_no IN ($itemCondition)
                SQL;

        return $this->executeSelectData($SQL, $bindValue);
    }

    /**
     * 入出力基準値取得
     *
     * @param int $pointNo 地点番号
     * @param int $itemNo 項目番号
     * @param int $houKijyunNo 法基準番号(採水年月日の年)
     * @return array|false 入出力基準値取得結果|取得失敗(false)
     */
    public function getInoutInspectionCriteria(int $pointNo, int $itemNo, int $houKijyunNo, ?int $saisuiKbnNo = null)
    {
        $bindValue = [
            'point_no' => $pointNo,
            'item_no' => $itemNo,
            'hou_kijyun_no' => $houKijyunNo,
        ];
        $where = ' AND ic.saisui_kbn_no = sp.saisui_kbn_no';

        if (is_numeric($saisuiKbnNo)) {
            $bindValue['saisui_kbn_no'] = $saisuiKbnNo;
            $where = ' AND ic.saisui_kbn_no = :saisui_kbn_no';
        }

        $SQL = <<<SQL
                SELECT
                    CAST(ic.regulation_low_limit as TEXT) AS regulation_low_limit,
                    CAST(ic.regulation_up_limit as TEXT) AS regulation_up_limit,
                    CAST(ic.input_low_limit as TEXT) AS input_low_limit,
                    CAST(ic.input_up_limit as TEXT) AS input_up_limit,
                    CAST(ic.report_low_limit as TEXT) AS report_low_limit,
                    CAST(ic.report_up_limit as TEXT) AS report_up_limit,
                    ic.valid_digits,
                    ic.input_min_digits,
                    ic.output_min_digits
                FROM
                    m_inspection_criteria ic
                LEFT JOIN
                    m_saisui_point sp on sp.point_no = :point_no
                WHERE
                    ic.item_no = :item_no
                    AND ic.hou_kijyun_no = :hou_kijyun_no
                    $where
                SQL;

        return $this->executeSelectData($SQL, $bindValue);
    }

    /**
     * 検査結果採水年月日取得(指定範囲)
     *
     * @param int $pointNo 地点番号
     * @param int $itemNo 項目番号
     * @param string $saisuiStart 採水年月日開始日
     * @param string $saisuiEnd 採水年月日終了日
     * @param int $inspectionKbnCode 検査区分CD
     * @return array|false 入出力基準値取得結果|取得失敗(false)
     */
    public function getRangeInspectionResultSaisuiDate(
        int $pointNo,
        int $itemNo,
        string $saisuiStart,
        string $saisuiEnd,
        int $inspectionKbnCode
    ) {
        $bindValue = [
            'point_no' => $pointNo,
            'item_no' => $itemNo,
            'saisui_date_start' => $saisuiStart,
            'saisui_date_end' => $saisuiEnd,
            'inspection_kbn_code' => $inspectionKbnCode,
        ];

        $SQL = <<<SQL
                SELECT
                    saisui_date
                FROM
                    t_inspection_result
                WHERE
                    point_no = :point_no
                    AND item_no = :item_no
                    AND saisui_date BETWEEN :saisui_date_start AND :saisui_date_end
                    AND inspection_kbn_code = :inspection_kbn_code
                ORDER BY saisui_date ASC
                SQL;

        return $this->executeSelectData($SQL, $bindValue);
    }

    /**
     * 検査目標値取得処理
     *
     * @param int $reportNo 報告書番号
     * @param int $pointNo 地点番号
     * @param string $saisuiDate 採水年月日
     * @return array|false 検査結果|取得失敗(false)
     */
    public function getInspectionTarget(
        int $reportNo,
        int $pointNo,
        string $saisuiDate
    ) {
        $nendo = substr(date("Y/m/d", strtotime("$saisuiDate -3 month")), 0, 4);
        $bindValue = [
            'report_no' => $reportNo,
            'point_no' => $pointNo,
            'hou_kijyun_no' => $nendo,
        ];
        $SQL = <<<SQL
                SELECT 
                    mi.item_no,
                    mic.regulation_up_limit,
                    valid_digits,
                    input_min_digits
                FROM
                    m_report_item mi
                    LEFT JOIN (
                        SELECT
                            ic.*
                        FROM
                            m_inspection_criteria ic
                        INNER JOIN m_saisui_point sp on sp.point_no = :point_no
                        AND ic.saisui_kbn_no = sp.saisui_kbn_no
                        WHERE
                            ic.hou_kijyun_no = :hou_kijyun_no
                    ) mic 
                    ON mi.item_no = mic.item_no
                WHERE
                    mi.report_no = :report_no
                ORDER BY
                    item_order
                SQL;
        return $this->executeSelectData($SQL, $bindValue);
    }

    /**
     * 報告書項目 取得
     *
     * @param int $reportNo 報告書番号
     * @return array|false 検査結果|取得失敗(false)
     */
    public function getReportItem(int $reportNo)
    {
        $bindValue = [
            'report_no' => $reportNo,
        ];
        $SQL = <<<SQL
                SELECT 
                    item_no,
                    report_item_name,
                    unit_cell_name,
                    target_cell_name,
                    base_cell_name,
                    number_cell_name,
                    no_name,
                    item_order
                FROM
                    m_report_item
                WHERE
                    report_no = :report_no
                ORDER BY
                    item_order
                SQL;
        return $this->executeSelectData($SQL, $bindValue);
    }

    /**
     * 報告書地点 取得
     *
     * @param int $reportNo 報告書番号
     * @return array|false 検査結果|取得失敗(false)
     */
    public function getReportPoint(int $reportNo)
    {
        $bindValue = [
            'report_no' => $reportNo,
        ];
        $SQL = <<<SQL
                SELECT 
                    point_no,
                    report_point_name,
                    point_order
                FROM
                    m_report_point
                WHERE
                    report_no = :report_no
                ORDER BY
                    point_order
                SQL;
        return $this->executeSelectData($SQL, $bindValue);
    }
}
