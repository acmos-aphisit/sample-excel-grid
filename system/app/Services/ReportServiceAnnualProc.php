<?php

namespace App\Services;

use App\Services\ReportService;
use App\Dao\ReportDao;

/**
 * 年報（処理過程）出力サービス
 *
 * @author
 */
class ReportServiceAnnualProc extends ReportService
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
        $index = 0;
        // 帳票出力データの編集
        foreach ($inspectionData as $tmpData) {
            $index++;
            $tmpArray = (array)$tmpData;

            // 定量データ加工の対象データが含まれる列名を定義
            $dataColumns = array(
                'result_data_month04',
                'result_data_month05',
                'result_data_month06',
                'result_data_month07',
                'result_data_month08',
                'result_data_month09',
                'result_data_month10',
                'result_data_month11',
                'result_data_month12',
                'result_data_month01',
                'result_data_month02',
                'result_data_month03',
                'result_data_year'
            );
            // 定量データ加工を施す
            foreach ($dataColumns as $dataColName) {
                if (!is_null($tmpArray[$dataColName])) {
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

            $filtered = array_intersect_key($tmpArray, array_flip($dataColumns));

            // データを配列に詰める
            array_push($insData, $filtered);
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
