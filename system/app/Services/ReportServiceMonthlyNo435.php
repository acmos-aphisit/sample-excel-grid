<?php

namespace App\Services;

use App\Services\ReportService;
use App\Dao\ReportDao;

/**
 * 月報出力サービス
 *
 * @author
 */
class ReportServiceMonthlyNo435 extends ReportService
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

        $inspectionResult['inspectionData'] = [];
        $insData = [];
        $statistics = [];
        $statisticsTarget = [];
        // 月間の検査目標値を取得
        $targetData = $this->reportDao->getInspectionTarget(
            $this->reportNo,
            $this->pointNo,
            $this->saisuiDate
        );

        // 帳票出力データの編集
        foreach ($targetData as $tmpTarget) {
            $tmpStr = '';
            $tmpArray = (array)$tmpTarget;
            $statisticsTarget[$tmpArray['item_no']] = [
                'val' => $tmpArray['regulation_up_limit'],
                'limit' => $tmpArray['input_min_digits'],
            ];
            if (preg_match("/^\d+(?:.\d+)?$/", $tmpArray['regulation_up_limit']) === 1) {
                $this->jisRound(
                    $tmpArray['regulation_up_limit'],
                    $tmpArray['valid_digits'],
                    $tmpArray['input_min_digits'],
                    $tmpStr
                );
            } else {
                $tmpStr = $this->reportConfig['dsp_space'];
            }

            if ($tmpArray['item_no'] === 7173) {
                $tmpStr .= '(二硫化炭素として)';
            } 
            // elseif ($tmpArray['item_no'] === 7150) {
            //     $tmpStr .= '(メチルイソチオシアネートとして)';
            // }
            // 検査用データを配列で作成
            array_push($insData, [$tmpStr]);
        }
        // 月間の検査結果を取得
        $inspectionData = $this->reportDao->getInspectionResultReport(
            $this->reportNo,
            $this->pointNo,
            '1',
            $this->saisuiDate,
            $this->saisuiTime,
            $this->inspectionKbnCode
        );

        // 帳票出力データの編集
        foreach ($inspectionData as $tmpData) {
            $tmpArray = (array)$tmpData;
            // 統計データの保持
            $this->setStatisticsData($tmpArray, $statistics);
            // 定量データの加工
            if (is_null($tmpArray['inspection_data'])) {
                //[2025-07-16]ブランクデータの代替表示はテンプレート側で対応する方針
                //$tmpArray['inspection_data'] = $this->reportConfig['dsp_space'];
            } elseif ($tmpArray['constant_qualitative_flg'] === 1 && $tmpArray['item_no'] !== 3140) {
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
        $divData = $this->getDivInspectionTarget($statistics, $statisticsTarget);
        // 統計データの追加
        $calc = $this->calcStatistics(
            $statistics
        );
        // 作成した検査用データを格納
        $inspectionResult['inspectionData'] = array_merge(
            $insData,
            $divData,
            $calc['max'],
            $calc['min'],
            $calc['avg'],
            $calc['count'],
            $calc['sum']
        );

        // 固定文言マスタを取得
        $reportTexts = $this->getMReportText($this->reportNo);
        //検査結果を取得
        $inspectionResultReportText = $this->reportDao->getInspectionResultReportText(
            $tmpArray['item_no'],
            $this->pointNo,
            $this->saisuiDate
        );
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

    /**
     * 目標/基準算出処理
     *
     * @param array $data 検査結果
     * @param array $target 検査基準
     * @return array 検出値/目標値配列
     */
    private function getDivInspectionTarget(array $data, array $target): array
    {
        $retArray = [];
        foreach ($data as $key => $valArray) {
            $tmpData = '';
            if (count($valArray['data']) > 0) {
                if (is_null($target[$key]['val'])) {
                    $tmpData = '';
                } else {
                    $tmpData = $this->getIndexValue($valArray['data'][0], $target[$key]['val']);
                    if (preg_match("/^\d+(?:.\d+)?$/", $tmpData) !== 1 || bccomp($tmpData, '0.01') === -1) {
                        $tmpData = '0';
                    } else {
                        $this->jisRound($tmpData, 2, $target[$key]['limit'], $tmpData);
                    }
                }
            }
            // 検査用データを配列で作成
            array_push($retArray, [$tmpData]);
        }

        return $retArray;
    }

    /**
     * 検出指標値取得処理
     *
     * @param string $data 検査結果
     * @param string $target 検査基準
     * @return string 検出指標値(数値以外は空文字)
     */
    private function getIndexValue(string $data, string $target): string
    {
        $retData = '';
        if (preg_match("/^\d+(?:.\d+)?$/", $data) !== 1 || preg_match("/^\d+(?:.\d+)?$/", $target) !== 1) {
            return $retData;
        }

        $calc = bcdiv($data, $target);
        if (bccomp($calc, '0.0') === 0) {
            $calc = '0.000000001';
        }

        $this->jisRound($calc, 3, -2, $retData);
        return $retData;
    }
}
