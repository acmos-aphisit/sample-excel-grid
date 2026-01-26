<?php

namespace App\Services;

use App\Services\ReportService;
use App\Dao\ReportDao;

/**
 * 週報出力サービス
 *
 * @author
 */
class ReportServiceWeeklyNo320 extends ReportService
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
     * 帳票出力(週報)
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
        // 帳票出力データの編集
        foreach ($inspectionData as $tmpData) {
            $tmpArray = (array)$tmpData;
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
                    $tmpArray['point_no']
                );
                // データの加工を実施
                $this->processData($tmpArray['item_no'], $tmpArray['inspection_data']);
            }
            // 検査用データを配列で作成
            array_push($insData, [$tmpArray['inspection_data']]);
        }
        // 作成した検査用データを格納
        $inspectionResult['inspectionData'] = array_merge(
            $insData
        );
        // 固定文言マスタを取得
        $reportTexts = $this->getMReportText($this->reportNo, $this->pointNo);
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
                            $inspectionResultReportText
                        )
                    ) ,
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
        // 「工水Ⅰ期PAC注入率」「工水Ⅱ期PAC注入率」が数値の場合は、以下の補正を行う。
        if ($itemNo === 1470 || $itemNo === 1472) {
            if (preg_match("/^\d+(?:.\d+)?$/", $data) === 1) {
                $data = bcmul($data, '10');
                // 小数点以下の切り捨て
                if (substr($data, 0, 1) === '-') {
                    // 負数は切り上げ
                    $data = bcceil($data);
                } else {
                    // 整数は切り下げ
                    $data = bcfloor($data);
                }
            }
        }
    }
}
