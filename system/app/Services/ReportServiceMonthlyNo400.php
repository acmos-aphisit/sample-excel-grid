<?php

namespace App\Services;

use App\Services\ReportService;
use App\Dao\ReportDao;

/**
 * 月報出力サービス
 *
 * @author
 */
class ReportServiceMonthlyNo400 extends ReportService
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
        $saisuiDate = '';
        $saisuiTime = '';
        $kbn = '';

        // 帳票出力データの編集
        foreach ($inspectionData as $tmpData) {
            $tmpArray = (array)$tmpData;
            if ($tmpArray['item_no'] == 1) {
                $saisuiDate = $tmpArray['inspection_data'];
            }
            if ($tmpArray['item_no'] == 2) {
                $saisuiTime = $tmpArray['inspection_data'];
            }
            if (array_key_exists('inspection_kbn_code', $tmpArray)) {
                $kbn = $tmpArray['inspection_kbn_code'];
            }
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
                    $saisuiDate,
                    $saisuiTime,
                    $kbn,
                );
            }
            // データの加工
            $this->processData($tmpArray['item_no'], $tmpArray['inspection_data']);
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
     * データ加工処理
     *
     * @param int $itemNo 項目番号
     * @param ?string &$data  変換データ
     * @return void
     */
    private function processData(int $itemNo, ?string &$data): void
    {
        if (is_null($data)) {
            // データが存在しない場合は以降の加工を行わない。
            return;
        }
        if ($itemNo === 1142 || $itemNo === 1144) {
            // 判定結果に改行を追加
            if ($data !== $this->reportConfig['dsp_space']) {
                // 各々の分割する言葉で分割し、改行を追加する
                if (strPos($data, '不適合') !== false) {
                    $tmpData = explode('不適合', $data);
                    $data = $tmpData[0] . "不適合\r\n" . $tmpData[1];
                } elseif (strPos($data, 'ついては') !== false) {
                    $tmpData = explode('ついては', $data);
                    $data = $tmpData[0] . "ついては\r\n" . $tmpData[1];
                }
            }
        } else {
            // 単位変換を実施
            $this->getUnitChange($itemNo, $this->reportConfig['dsp_low_limit'], $data);
        }
    }
}
