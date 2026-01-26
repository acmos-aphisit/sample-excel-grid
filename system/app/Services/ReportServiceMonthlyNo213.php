<?php

namespace App\Services;

use App\Services\ReportService;
use App\Dao\ReportDao;

/**
 * 月報出力サービス
 *
 * @author
 */
class ReportServiceMonthlyNo213 extends ReportService
{
    /**
     * コンストラクタ
     *
     * @param array|Standard Class Object $reportConfig 報告書構成マスタ情報
     */
    public function __construct($reportConfig, array $reqParam, ReportDao $dao, $user_id)
    {
        parent::__construct($reportConfig, $reqParam, $dao, $user_id);
    }

    /**
     * 帳票出力(月報)
     *
     * return string 実行結果(正常時は空文字)
     */
    public function outputExcelReport()
    {
        $result = '';
        $inspectionResult = [];

        // パラメータチェック
        if (!$this->checkParameter()) {
            // エラーメッセージを返却(IDのみを返却するか、メッセージで返却するか確認が必要か)
            return '出力帳票を選択して下さい。';
        }

        // 月間の検査結果を取得
        $inspectionData = $this->reportDao->getInspectionResultReport(
            $this->reportNo,
            $this->pointNo,
            $this->reportConfig['item_no'],
            $this->saisuiDate,
            $this->saisuiTime,
            $this->inspectionKbnCode
        );

        $inspectionResult['inspectionData'] = [];
        $insData = [];
        $statistics = [];
        // 帳票出力データの編集
        foreach ($inspectionData as $tmpData) {
            $tmpArray = (array)$tmpData;
            // 統計データの保持
            $this->setStatisticsData($tmpArray, $statistics);
            // 定量データの加工
            if (is_null($tmpArray['inspection_data'])) {
                //[2025-07-16]ブランクデータの代替表示はテンプレート側で対応する方針
                //$tmpArray['inspection_data'] = $this->reportConfig['dsp_space'];
            } elseif (
                $tmpArray['constant_qualitative_flg'] === 1 ||
                $tmpArray['item_no'] == 1150
            ) {
                // 定量データ若しくは備考の場合に定量データ加工を実施
                $this->configureFixedQuantityData(
                    $tmpArray['item_no'],
                    $tmpArray['saisui_kbn_no'],
                    $this->reportConfig['dsp_up_limit'],
                    $this->reportConfig['dsp_low_limit'],
                    $tmpArray['inspection_data'],
                    $tmpArray['point_no']
                );
            }
            // 検査用データを配列で作成
            array_push($insData, [$tmpArray['inspection_data']]);
        }
        // 統計データの追加
        $calc = $this->calcStatistics(
            $statistics
        );
        // 作成した検査用データを格納
        $inspectionResult['inspectionData'] = array_merge(
            $insData,
            $calc['max'],
            $calc['min'],
            $calc['avg'],
            $calc['count'],
            $calc['sum']
        );

        // 固定文言マスタを取得
        $reportTexts = $this->getMReportText($this->reportNo);

        $arrReportText = [];
        if (!is_null($reportTexts)) {
            foreach ($reportTexts as $report) {
                $reportText = (array)$report;
                $arrReportText += [
                    $reportText['text_cell_name'] =>
                    (
                        $this->getReportText(
                            $this->reportConfig['report_type'],
                            $reportText['text_cell_kbn'],
                            $reportText['text_cell_name'],
                            $inspectionData
                        )
                    ),
                ];
            }
        }

        // Excel出力処理
        $this->outputReport($inspectionResult, $arrReportText);

        return $result;
    }
}
