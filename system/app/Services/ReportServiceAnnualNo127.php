<?php

namespace App\Services;

use App\Services\ReportService;
use App\Dao\ReportDao;

/**
 * 月報出力サービス
 *
 * @author
 */
class ReportServiceAnnualNo127 extends ReportService
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
     * 帳票出力(年報)
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

        // 年間検査結果を取得(4月始まり～3月終わり)
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
        $excludedData = [];
        $index = 0;
        // 帳票出力データの編集
        foreach ($inspectionData as $tmpData) {
            $index++;
            $tmpArray = (array)$tmpData;

            // 定量データ加工の対象データが含まれる列名を定義
            $dataColumns = array(
                'result_data_month04_1',
                'result_data_month04_2',
                'result_data_month05_1',
                'result_data_month05_2',
                'result_data_month06_1',
                'result_data_month06_2',
                'result_data_month07_1',
                'result_data_month07_2',
                'result_data_month08_1',
                'result_data_month08_2',
                'result_data_month09_1',
                'result_data_month09_2',
                'result_data_month10_1',
                'result_data_month10_2',
                'result_data_month11_1',
                'result_data_month11_2',
                'result_data_month12_1',
                'result_data_month12_2',
                'result_data_month01_1',
                'result_data_month01_2',
                'result_data_month02_1',
                'result_data_month02_2',
                'result_data_month03_1',
                'result_data_month03_2'
            );
            // 定量データ加工を施す
            foreach ($dataColumns as $dataColName) {
                if (is_null($tmpArray[$dataColName]) && $tmpArray['item_no'] == 1) {
                    $excludedData[] = $dataColName;
                }
                if (!array_key_exists($dataColName, $excludedData) && !is_null($tmpArray[$dataColName])) {
                    if ($tmpArray['item_no'] == 1) {
                        // 採水年月日の場合は、変換を実施
                        $tmpData = strval($tmpArray[$dataColName]);
                        $tmpDate = substr($tmpData, 0, 4) . '/' . substr($tmpData, 4, 2) . '/' . substr($tmpData, 6, 2);
                        $tmpArray[$dataColName] = date('n月j日', strtotime($tmpDate));
                    } else {
                        $this->configureFixedQuantityData(
                            $tmpArray['item_no'],
                            $tmpArray['saisui_kbn_no'],
                            $this->reportConfig['dsp_up_limit'],
                            $this->reportConfig['dsp_low_limit'],
                            $tmpArray[$dataColName],
                            $tmpArray['point_no']
                        );
                    }
                }
            }
            foreach ($excludedData as $excludedKey) {
                unset($tmpArray[$excludedKey]);
            }
            // データを配列に詰める
            array_push($insData, $tmpArray);
        }

        $inspectionResult['inspectionData'] = $insData;

        // 固定文言マスタを取得
        $reportTexts = $this->getMReportText($this->reportNo);

        $arrReportText = [];
        if (!is_null($reportTexts)) {
            foreach ($reportTexts as $report) {
                $reportText = (array)$report;
                $arrReportText += [
                    $reportText['text_cell_name'] => (
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
