<?php

namespace App\Services;

use App\Services\ReportService;
use App\Dao\ReportDao;
use App\Dao\ReportDaoNo700;

/**
 * 浄水配水StartY-EndY51項目(OutPutDay)出力サービス
 *
 * @author
 */
class ReportServiceNo700 extends ReportService
{
    /**
     * コンストラクタ
     *
     * @param array|Standard Class Object $reportConfig 報告書構成マスタ情報
     */
    public function __construct($reportConfig, array $reqParam, ReportDao $dao, $user_id)
    {
        parent::__construct($reportConfig, $reqParam, $dao, $user_id);

        // 追加データ
        $this->nendo = $reqParam['nendo'];
        // 固定文言の出力を兼ねて、採水年月日を対象年度の4/1とする
        $this->saisuiDate = $this->nendo . '04/01';
    }

    /**
     * 帳票出力(日報)
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

        // 対象の検査結果を取得
        $cast = fn($obj): ReportDaoNo700 => $obj;
        $inspectionData = $cast($this->reportDao)->getInspectionResultReportData(
            $this->reportNo,
            $this->nendo,
            false
        );

        // 対象の検査結果の取得年度数を取得
        $inspectionNendo = $cast($this->reportDao)->getInspectionResultReportData(
            $this->reportNo,
            $this->nendo,
            true
        );

        $inspectionResult['inspectionData'] = [];
        $statistics = [
            'max' => [],
            'min' => [],
            'avg' => [],
            'sigma' => [],
            'avgadd3sigma' => [],
            'avgdis3sigma' => [],
            'count' => [],
        ];
        // 帳票出力データの編集
        foreach ($inspectionData as $tmpData) {
            $tmpArray = (array)$tmpData;
            // 統計データの保持
            $this->setStatics($tmpArray, $inspectionNendo, $statistics);
        }
        // 作成した検査用データを格納
        $inspectionResult['inspectionData'] = array_merge(
            $statistics['max'],
            $statistics['min'],
            $statistics['avg'],
            $statistics['sigma'],
            $statistics['avgadd3sigma'],
            $statistics['avgdis3sigma'],
            $statistics['count']
        );

        // 固定文言マスタを取得
        $reportTexts = $this->getMReportText($this->reportNo, $this->pointNo);

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
     * 測定結果(統計)整理処理
     *
     * @param array $insData 測定結果
     * @param array $nendoInspection 測定結果(年度単位測定数)
     * @param array &$statistics 出力結果
     * @return void
     */
    private function setStatics(array $insData, array $nendoInspection, array &$statistics): void
    {
        // 測定結果のデータ毎に、各処理を行う。
        // 各年度の測定数を取得する。
        $filter = array_filter($nendoInspection, function ($insResult) use ($insData) {
                return $insResult->item_no == $insData['item_no'] and $insResult->point_no == $insData['point_no'];
        });
        $value = (array)array_shift($filter);

        // 定性データと定量データで処理を分岐する。
        if (count($value) > 0) {
            if ($insData['constant_qualitative_flg'] == 1) {
                $this->setStaticsConstant($insData, $value, $statistics);
            } else {
                $this->setStaticsqualitative($insData, $value, $statistics);
            }
        } else {
            // 検査結果が無い場合は、全て空欄とする
            array_push($statistics['max'], ['']);
            array_push($statistics['min'], ['']);
            array_push($statistics['avg'], ['']);
            array_push($statistics['sigma'], ['']);
            array_push($statistics['avgadd3sigma'], ['']);
            array_push($statistics['avgdis3sigma'], ['']);
            array_push($statistics['count'], ['']);
        }
        return ;
    }

    /**
     * 測定結果(定量データ)整理処理
     *
     * @param array $insData 測定結果
     * @param array $nendoItem 測定結果(年度単位測定数:項目単位)
     * @param array &$statistics 出力結果
     * @return void
     */
    private function setStaticsConstant(array $insData, array $nendoItem, array &$statistics): void
    {
        $maxMin0flg = false;
        $max = '';
        $min = '';
        $avgTemp = '';
        $avg = '';
        $sigma = '';
        $avgadd3sigma = '';
        $avgdis3sigma = '';
        $cnt = '';
        if (isset($nendoItem['constant_count']) && $nendoItem['constant_count'] == 3) {
            // 最大最小の値を加工
            // 最大
            $this->configureFixedQuantityDataNo701(
                $insData['item_no'],
                $insData['constant_max'],
                $insData['point_no']
            );
            // 最小
            $this->configureFixedQuantityDataNo701(
                $insData['item_no'],
                $insData['constant_min'],
                $insData['point_no']
            );

            // 最大最小の値を確認
            if (bccomp(str_replace('<', '', $insData['constant_max']), '0.0') == 0 && bccomp(str_replace('<', '', $insData['constant_min']), '0.0') == 0) {
                // 最大最小が0の場合は、以下の設定
                $max = '0';
                $min = '0';
                $maxMin0flg = true;
            } else {
                $max = $insData['constant_max'];
                $min = $insData['constant_min'];
            }

            // 1年度のみ取得かつ最大最小が両方下限値未満かをチェック
            if (
                $nendoItem['constant_count'] == 1 &&
                strPos($max, $this->reportConfig['dsp_low_limit']) !== false &&
                strPos($min, $this->reportConfig['dsp_low_limit']) !== false
            ) {
                // 平均を0として出力する。
                $avg = '0';
            } else {
                // データ加工後、平均を算出する。
                // 平均(算出用に加工前の値も退避)
                $avgTemp = $insData['constant_avg'];
                $this->configureFixedQuantityDataNo701(
                    $insData['item_no'],
                    $insData['constant_avg'],
                    $insData['point_no']
                );
                $avg = $insData['constant_avg'];
            }

            // 最大最小が0以外かつ、下限値以上であれば、3σを算出する
            if (
                !$maxMin0flg &&
                (
                    strPos($max, $this->reportConfig['dsp_low_limit']) === false ||
                    strPos($min, $this->reportConfig['dsp_low_limit']) === false
                )
            ) {
                // 3σ関連を算出する。
                $sigma = bcmul($insData['constant_std'], '3.0');
                $avgadd3sigma = bcadd($avgTemp, $sigma);
                $avgdis3sigma = bcsub($avgTemp, $sigma);
                // 算出後、加工を行う。
                $this->configureFixedQuantityDataNo701(
                    $insData['item_no'],
                    $sigma,
                    $insData['point_no'],
                    true
                );

                $this->configureFixedQuantityDataNo701(
                    $insData['item_no'],
                    $avgadd3sigma,
                    $insData['point_no'],
                    true
                );

                $this->configureFixedQuantityDataNo701(
                    $insData['item_no'],
                    $avgdis3sigma,
                    $insData['point_no'],
                    true
                );
            }
            // 平均回数の算出
            $cnt = bcfloor(bcdiv($insData['constant_count'], strval($nendoItem['constant_count'])));
        }

        // データを設定する。
        array_push($statistics['max'], [$max]);
        array_push($statistics['min'], [$min]);
        array_push($statistics['avg'], [$avg]);
        array_push($statistics['sigma'], [$sigma]);
        array_push($statistics['avgadd3sigma'], [$avgadd3sigma]);
        array_push($statistics['avgdis3sigma'], [$avgdis3sigma]);
        array_push($statistics['count'], [$cnt]);
        return;
    }

    /**
     * 測定結果(定性データ)整理処理
     *
     * @param array $insData 測定結果
     * @param array $nendoItem 測定結果(年度単位測定数:項目単位)
     * @param array &$statistics 出力結果
     * @return void
     */
    private function setStaticsqualitative(array $insData, array $nendoItem, array &$statistics): void
    {
        $max = '';
        $min = '';
        $avg = '';
        $sigma = '';
        $avgadd3sigma = '';
        $avgdis3sigma = '';
        $cnt = '';
        if (isset($nendoItem['qualitative_count']) && $nendoItem['qualitative_count'] == 3) {
            // 平均回数の算出
            $cnt = bcfloor(bcdiv($insData['qualitative_count'], strval($nendoItem['qualitative_count'])));
        }

        // データを設定する。
        array_push($statistics['max'], [$max]);
        array_push($statistics['min'], [$min]);
        array_push($statistics['avg'], [$avg]);
        array_push($statistics['sigma'], [$sigma]);
        array_push($statistics['avgadd3sigma'], [$avgadd3sigma]);
        array_push($statistics['avgdis3sigma'], [$avgdis3sigma]);
        array_push($statistics['count'], [$cnt]);

        return;
    }


    /**
     * 定量データ加工処理(No.701用)
     *
     * @param int $itemNo 項目番号
     * @param string &$data 定量データ
     * @param bool $isSigma 3σ関連の算出
     * @return void
     */
    private function configureFixedQuantityDataNo701(
        int $itemNo,
        string &$data,
        int $pointNo,
        bool $isSigma = false
    ): void {
        // 採水年月日を現在日付として扱う。
        $tmpDate = $this->saisuiDate;
        $this->saisuiDate = date('Y/m/d');
        // 検査基準取得
        $refValue = $this->getInoutReferenceValue($itemNo, $pointNo);
        // 採水年月日を戻す
        $this->saisuiDate = $tmpDate;

        if (count($refValue) === 0) {
            return;
        }
        $lowerLimit = $refValue['report_low_limit'];
        $validDigits = $refValue['valid_digits'];
        $outputMinDigits = $refValue['output_min_digits'];

        // 定量データが0の場合、補正を行う。
        if (bccomp($data, '0.00000000') == 0) {
            $data = '0.000000001';
        }

        // 帳票下限値がNULLの場合、下限値を補正する。
        if (is_null($lowerLimit) || $lowerLimit == '') {
            $lowerLimit = '-100';
        }

        // 定量データのJIS丸めを行う。
        $tempData = '';
        // 定量データと帳票下限値を比較する。
        if (!$isSigma && bccomp($data, $lowerLimit) == -1) {
            // 帳票下限値未満であれば、帳票下限値を出力データとし、先頭に<を付与する
            $this->jisRound($lowerLimit, $validDigits, $outputMinDigits, $tempData);
            $data = '<' . $tempData;
        } else {
            $this->jisRound($data, $validDigits, $outputMinDigits, $tempData);
            $data = $tempData;
        }

        return;
    }

    /**
     * 報告書固定文言マスタ取得
     *
     * @param int $reportNo 報告書番号
     * @param int $pointNo 地点番号
     * @return string||null 固定文言マスタ
     */
    protected function getMReportText(string $reportNo)
    {
        $reportTexts = null;
        $reportTextData = $this->reportDao->getReportText($reportNo);
        if ($reportTextData !== false) {
            if (count($reportTextData) > 0) {
                $reportTexts = ((array)$reportTextData);
            }
        }
        return $reportTexts;
    }

    /**
     * パラメータチェック処理
     *
     * @return bool 正常(true)/異常(false)
     */
    protected function checkParameter(): bool
    {
        // パラメータチェック(数値は0以下は未選択として扱う)
        if (
            $this->reportNo <= 0
        ) {
            return false;
        }

        return true;
    }
}
