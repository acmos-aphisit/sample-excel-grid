<?php

namespace App\Services;

use App\Services\ReportService;
use App\Dao\ReportDao;

/**
 * 農薬類検査結果書出力サービス
 *
 * @author
 */
class ReportServiceMonthlyNo64 extends ReportService
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
     * 帳票出力(農薬類検査結果書)
     *
     * @return string 実行結果(正常時は空文字)
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
        $indicator = [];
        // 帳票出力データの編集
        foreach ($inspectionData as $tmpData) {
            $tmpArray = (array)$tmpData;
            // 統計データの保持
            $this->setStatisticsData($tmpArray, $statistics);
            // 定量データの加工
            if (is_null($tmpArray['inspection_data'])) {
                // データ無しの場合は指標値は空とする。
                array_push($indicator, ['']);
            } elseif ($tmpArray['constant_qualitative_flg'] === 1) {
                // 加工前のデータを一時保持
                $befData = $tmpArray['inspection_data'];
                $this->configureFixedQuantityData(
                    $tmpArray['item_no'],
                    $tmpArray['saisui_kbn_no'],
                    $this->reportConfig['dsp_up_limit'],
                    $this->reportConfig['dsp_low_limit'],
                    $tmpArray['inspection_data'],
                    $tmpArray['point_no']
                );
                // 指標値の算出を実施(検収値はデータ加工前のものを使用)
                $indicateData = '';
                $this->calcIndicator($tmpArray['item_no'], $tmpArray['point_no'], $befData, $indicateData);
                array_push($indicator, [$indicateData]);
            } else {
                // 定性データの場合は指標値は空とする。
                array_push($indicator, ['']);
            }
            // 検査用データを配列で作成
            array_push($insData, [$tmpArray['inspection_data']]);
        }
        // 統計データの追加
        $calc = $this->calcStatistics(
            $statistics
        );
        // 作成した検査用データを格納(格納順は検査データ->指標値->各種統計算出結果)
        $inspectionResult['inspectionData'] = array_merge(
            $insData,
            $indicator,
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

    /**
     * 指標値算出処理
     *
     * @param int $itemNo 項目番号
     * @param int $pointNo 地点番号
     * @param string $inspectionData 検出値
     * @param string &$indicateData 指標値
     * @return void
     */
    private function calcIndicator(
        int $itemNo,
        int $pointNo,
        string $inspectionData,
        string &$indicateData
    ): void {
        // 検出値が空白表示と同一の場合は、空白表示を設定して終了
        if ($inspectionData == $this->reportConfig['dsp_space']) {
            $indicateData = $this->reportConfig['dsp_space'];
            return;
        }

        // 検査基準取得
        $refValue = $this->getInoutReferenceValue($itemNo, $pointNo);

        // 検査基準が取得できなかった場合は指標値を空文字にして終了
        if (count($refValue) === 0) {
            $indicateData = '';
            return;
        }
        $upLimit = $refValue['regulation_up_limit'];

        // 検査値若しくは.規制上限値が数値以外は指標値を空文字にして終了
        if (
            preg_match("/^\d+(?:.\d+)?$/", $inspectionData) !== 1 ||
            preg_match("/^\d+(?:.\d+)?$/", $upLimit) !== 1
        ) {
            $indicateData = '';
            return;
        }

        // 検査値 / 規制上限値の商を取得
        $div = bcdiv($inspectionData, $upLimit);
        $jisDiv = '';

        // 指標値の算出結果が数値以外の場合は、<0.01として設定し、処理を終了する。
        if (is_null($div) || preg_match("/^\d+(?:.\d+)?$/", $div) !== 1) {
            $indicateData = '<0.01';
            return;
        }

        // 商が0の場合は、0.000000001として扱って丸めを行う。
        if (bccomp($div, '0.0') == 0) {
            $div = '0.000000001';
        }

        // 商の値をJIS丸めする。
        $this->jisRound($div, 3, -2, $jisDiv);

        if (bccomp($jisDiv, '0.01') == -1) {
            $indicateData = '<0.01';
        } else {
            $indicateData = $jisDiv;
        }
        return;
    }
}
