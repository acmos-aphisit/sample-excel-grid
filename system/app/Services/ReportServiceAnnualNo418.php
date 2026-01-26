<?php

namespace App\Services;

use App\Services\ReportService;
use App\Dao\ReportDao;

/**
 * 月報出力サービス(共同検査年報)
 *
 * @author
 */
class ReportServiceAnnualNo418 extends ReportService
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
        $statistics = [];
        $kbn = '';

        // 帳票出力データの編集
        foreach ($inspectionData as $tmpData) {
            $tmpArray = (array)$tmpData;
            if (array_key_exists('inspection_kbn_code', $tmpArray)) {
                $kbn = $tmpArray['inspection_kbn_code'];
            }
            // ---------------------------------------------
            // 前々年度の検査結果を加工
            // ---------------------------------------------
            $tmpArray['inspection_data'] = $tmpArray['max_result_data_year1'];
            unset($tmpArray['max_result_data_year1']);

            // 統計データの保持
            $this->setStatisticsData($tmpArray, $statistics);
            // 定量データの加工
            if (is_null($tmpArray['inspection_data'])) {
                //[2025-07-16]ブランクデータの代替表示はテンプレート側で対応する方針
                //$tmpArray['inspection_data'] = $this->reportConfig['dsp_space'];
            } elseif ($tmpArray['constant_qualitative_flg'] === 1) {
                $this->configureFixedQuantityData(
                    $tmpArray['item_no'],
                    $tmpArray['saisui_kbn_no'],
                    $this->reportConfig['dsp_up_limit'],
                    $this->reportConfig['dsp_low_limit'],
                    $tmpArray['inspection_data'],
                    $tmpArray['point_no'],
                    $tmpArray['saisui_date1'],
                    $tmpArray['saisui_time1'],
                    $kbn,
                    $tmpArray['nendo1'],
                );

                $this->changeItemData($tmpArray['item_no'], $tmpArray['inspection_data']);
            }

            // 検査用データを配列で作成
            array_push($insData, [$tmpArray['result_count_year1']]);
            array_push($insData, [$tmpArray['inspection_data']]);

            // ---------------------------------------------
            // 前年度の検査結果を加工
            // ---------------------------------------------
            unset($tmpArray['inspection_data']);
            $tmpArray['inspection_data'] = $tmpArray['max_result_data_year2'];
            unset($tmpArray['max_result_data_year2']);

            // 統計データの保持
            $this->setStatisticsData($tmpArray, $statistics);
            // 定量データの加工
            if (is_null($tmpArray['inspection_data'])) {
                //[2025-07-16]ブランクデータの代替表示はテンプレート側で対応する方針
                //$tmpArray['inspection_data'] = $this->reportConfig['dsp_space'];
            } elseif ($tmpArray['constant_qualitative_flg'] === 1) {
                $this->configureFixedQuantityData(
                    $tmpArray['item_no'],
                    $tmpArray['saisui_kbn_no'],
                    $this->reportConfig['dsp_up_limit'],
                    $this->reportConfig['dsp_low_limit'],
                    $tmpArray['inspection_data'],
                    $tmpArray['point_no'],
                    $tmpArray['saisui_date2'],
                    $tmpArray['saisui_time2'],
                    $kbn,
                    $tmpArray['nendo2'],
                );

                $this->changeItemData($tmpArray['item_no'], $tmpArray['inspection_data']);
            }

            // 検査用データを配列で作成
            array_push($insData, [$tmpArray['result_count_year2']]);
            array_push($insData, [$tmpArray['inspection_data']]);

            // ---------------------------------------------
            // 今年度の検査結果を加工
            // ---------------------------------------------
            unset($tmpArray['inspection_data']);
            $tmpArray['inspection_data'] = $tmpArray['max_result_data_year3'];
            unset($tmpArray['max_result_data_year3']);

            // 統計データの保持
            $this->setStatisticsData($tmpArray, $statistics);
            // 定量データの加工
            if (is_null($tmpArray['inspection_data'])) {
                //[2025-07-16]ブランクデータの代替表示はテンプレート側で対応する方針
                //$tmpArray['inspection_data'] = $this->reportConfig['dsp_space'];
            } elseif ($tmpArray['constant_qualitative_flg'] === 1) {
                $this->configureFixedQuantityData(
                    $tmpArray['item_no'],
                    $tmpArray['saisui_kbn_no'],
                    $this->reportConfig['dsp_up_limit'],
                    $this->reportConfig['dsp_low_limit'],
                    $tmpArray['inspection_data'],
                    $tmpArray['point_no'],
                    $tmpArray['saisui_date3'],
                    $tmpArray['saisui_time3'],
                    $kbn,
                    $tmpArray['nendo3'],
                );

                $this->changeItemData($tmpArray['item_no'], $tmpArray['inspection_data']);
            }

            // 検査用データを配列で作成
            array_push($insData, [$tmpArray['result_count_year3']]);
            array_push($insData, [$tmpArray['inspection_data']]);
        }

        // 統計データの追加
        $calc = $this->calcStatistics($statistics);
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

    /**
     * 統計用データ設定
     *
     * @param array $statistics 統計データ配列
     * @return array 統計算出後配列
     */
    protected function calcStatistics(
        array $statistics
    ): array {
        $retArray = [
            'max' => [],
            'avg' => [],
            'min' => [],
            'count' => [],
            'sum' => []
        ];

        // 集計種類
        $calcType = ['max', 'data', 'min'];

        // 項目単位に処理を実施
        foreach ($statistics as $key => $value) {
            foreach ($calcType as $type) {
                $data = '';
                if ($type === 'data') {
                    // 各種登録値に対する統計処理
                    $dataArray = [
                        'avg' => '',
                        'count' => count($value[$type]),
                        'sum' => ''
                    ];

                    if ($value['qualitativeFlg'] !== 2) {
                        $dataArray['avg'] = $this->calcAvg($value[$type]);
                        $dataArray['sum'] = $this->calcSum($value[$type]);
                    }

                    foreach ($dataArray as $calc => $tmpValue) {
                        if ($calc !== 'count') {
                            // 合計数以外は定量データ加工を行ってからデータ登録
                            if ($tmpValue !== '') {
                                // データの加工
                                $this->configureFixedQuantityData(
                                    $key,
                                    $value['saisuiKbnNo'],
                                    $this->reportConfig['dsp_up_limit'],
                                    $this->reportConfig['dsp_low_limit'],
                                    $tmpValue,
                                    $this->pointNo
                                );
                                $this->changeItemData($key, $tmpValue);
                            }
                        }
                        array_push($retArray[$calc], [$tmpValue]);
                    }
                } else {
                    $data = $value[$type];
                    if ($data !== '') {
                        // データの加工
                        $this->configureFixedQuantityData(
                            $key,
                            $value['saisuiKbnNo'],
                            $this->reportConfig['dsp_up_limit'],
                            $this->reportConfig['dsp_low_limit'],
                            $data,
                            $this->pointNo
                        );
                        $this->changeItemData($key, $data);
                    }
                    array_push($retArray[$type], [$data]);
                }
            }
        }
        return $retArray;
    }

    /**
     * データ加工処理
     *
     * @param int $itemNo 項目番号
     * @param string $data 変更データ
     * @return void
     */
    private function changeItemData(int $itemNo, string &$data): void
    {
        // ジェオスミン及び2-メチルイソボルネオールの場合は加工後データを再加工する。
        if ($itemNo === 2400 || $itemNo === 2410) {
            // 空白表示文字列以外の場合、数値部を変更する。
            if (!is_null($data) && $data !== '' && $data !== $this->reportConfig['dsp_space']) {
                if (preg_match("/^\d+(?:.\d+)?$/", $data) === 1) {
                    $data = bcmul($data, '0.000001', 6);
                } else {
                    $length = mb_strlen($data);
                    $tmpData = bcmul(substr($data, 1, $length), '0.000001', 6);
                    $data = '<' . $tmpData;
                }
            }
        }
    }
}
