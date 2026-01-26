<?php

namespace App\Services;

use App\Dao\Mng040Dao;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;


/**
 * 検査基準マスタ設定サービス
 *
 * @author
 */
class Mng040Service
{
    // 検査基準マスタDAO
    private $Mng040Dao;

    /**
     * コンストラクタ
     * 
     */
    public function __construct()
    {
        $this->Mng040Dao = new Mng040Dao();
    }

    /**
     * 基準値一覧検索条件に使用するセレクトボックスの値を取得
     * 
     */
    public function fetchInspCriteriaHoukijyunList()
    {
        $fetchInspCriteriaHoukijyunList = $this->Mng040Dao->fetchInspCriteriaHoukijyunList();

        return $fetchInspCriteriaHoukijyunList;
    }

    /**
     * 検査基準マスタを取得
     * 
     */
    public function searchInspCriteriaData($request)
    {

        // データ取得
        $searchInspCriteriaData = $this->Mng040Dao->searchInspCriteriaData($request);

        // 項目名の絞り込みがある場合
        if (count((array) $searchInspCriteriaData) > 0 && isset($request['itemName'])) {
            $item_name_check = mb_strtolower(mb_convert_kana($request['itemName'], "as"));          // 半角英数字小文字に変換
            $new_set_data = [];

            // データ絞り込み
            foreach ($searchInspCriteriaData as $key => $value) {
                $data_item_name = mb_strtolower(mb_convert_kana($value->item_dsp_name, "as"));
                if (str_contains($data_item_name, $item_name_check)) {
                    array_push($new_set_data, $value);
                }
            }
            return $new_set_data;
        }

        return $searchInspCriteriaData;
    }

    /**
     * 最新の適用年度と追加する適用年度を以下条件で取得し、画面に設定する。
     * 
     */
    public function getLatestYear()
    {
        $getLatestYear = $this->Mng040Dao->getLatestYear();

        return $getLatestYear;
    }

    /**
     * 選択肢マスタを取得
     * 
     */
    public function searchSelectOptionData($request)
    {
        $searchSelectOptionData = $this->Mng040Dao->searchSelectOptionData($request);

        return $searchSelectOptionData;
    }

    /**
     * 選択肢マスタ登録処理
     * ※ 手順番号は「詳細設計書_MNG040_検査基準マスタ画面」通りに設定
     * 
     */
    public function saveSelectionOptionData($request)
    {
        DB::beginTransaction();
        try {
            // 引数取得
            $selection_data = json_decode(json_encode($request->data_to_save));   // リクエスト

            // ##### 選択肢マスタ #####
            // (7)排他処理
            $checkSelectionDataBefore = $this->Mng040Dao->checkSelectionDataBefore($request->item_no, $request->display_time);
            if (!$checkSelectionDataBefore) {
                // 排他エラー
                DB::rollback();
                return config('const.UPDATE_UPDATED_ERROR');
            } else {
                // (7)-1 削除処理
                $deleteSelectionData = $this->Mng040Dao->deleteSelectionData($request->item_no);

                // エラー発生
                if (!$deleteSelectionData) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }

            // データありの場合：新規登録、データなしの場合：取消
            if (count($selection_data) > 0) {
                // (7)-2 登録処理
                $insertSelectionData = $this->Mng040Dao->insertSelectionData($request->item_no, $selection_data);

                // エラー発生
                if (!$insertSelectionData) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }


            DB::commit();

            return config('const.INSERT_NO_ERROR');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return config('const.OTHER_ERROR');
        }
    }

    /**
     * 検査基準マスタ登録処理
     * ※ 手順番号は「詳細設計書_MNG040_検査基準マスタ画面」通りに設定
     * 
     */
    public function saveInspCriteriaData($request)
    {
        DB::beginTransaction();
        try {
            // 引数取得
            $criteria_data = json_decode(json_encode($request->data_to_save));   // リクエスト

            // ##### 選択肢マスタ #####
            // (4)排他処理
            $checkInspectionCriteriaDataBefore = $this->Mng040Dao->checkInspectionCriteriaDataBefore($request->display_time, $request->apply_year);
            if (!$checkInspectionCriteriaDataBefore) {
                // 排他エラー
                DB::rollback();
                return config('const.UPDATE_UPDATED_ERROR');
            } else {
                // (5)-1 削除処理
                $deleteInspectionCriteriaData = $this->Mng040Dao->deleteInspectionCriteriaData($criteria_data, $request->apply_year);

                // エラー発生
                if (!$deleteInspectionCriteriaData) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }

            // データありの場合：新規登録、データなしの場合：取消
            if (count($criteria_data) > 0) {
                // (7)-2 登録処理
                $insertInspectionData = $this->Mng040Dao->insertInspectionData($criteria_data, $request->apply_year);

                // エラー発生
                if (!$insertInspectionData) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }

            DB::commit();

            return config('const.INSERT_NO_ERROR');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return config('const.OTHER_ERROR');
        }
    }

    /**
     * 適用年度追加処理
     * ※ 手順番号は「詳細設計書_MNG040_検査基準マスタ画面」通りに設定
     * 
     */
    public function addNextYearInspCriteria($request)
    {
        DB::beginTransaction();
        try {
            // 引数取得
            $inspection_data = json_decode(json_encode($request->data_to_save));   // リクエスト

            // ##### 選択肢マスタ #####
            // (6) 排他処理
            $checkAddNextYearBefore = $this->Mng040Dao->checkAddNextYearBefore($request->addNextYear);
            if (!$checkAddNextYearBefore) {
                // 排他エラー
                DB::rollback();
                return config('const.UPDATE_UPDATED_ERROR');
            }

            // (10)-1 検査基準登録処理
            $getLatestYearData = $this->Mng040Dao->getLatestYearData($request->latestYear);
            if (!$getLatestYearData) {
                // 排他エラー
                DB::rollback();
                return config('const.UPDATE_UPDATED_ERROR');
            } else {
                // (7)-2 登録処理
                $addNextYearInspCriteria = $this->Mng040Dao->addNextYearInspCriteria($getLatestYearData, $request->addNextYear);

                // エラー発生
                if (!$addNextYearInspCriteria) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }

            // (10)-2 統計値マスタに登録する値取得
            $getStatisticsMasterData = $this->Mng040Dao->getStatisticsMasterData($request->latestYear);

            // エラー発生
            if (!$getStatisticsMasterData) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            } else {
                // (10) 削除処理
                $deleteStatisticsData = $this->Mng040Dao->deleteStatisticsData();

                // エラー発生
                if (!$deleteStatisticsData) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }

                // (10)-2で取得した値を基に1件ずつ[統計値マスタ]に以下データを登録する。
                foreach ($getStatisticsMasterData as $value) {
                    // (10)-3 取得した結果のデータの加工処理
                    $conv_std_dev = $this->configureFixedQuantityData($value->item_no, $value->point_no, $request->latestYear, $value->std_dev);
                    $conv_avg = $this->configureFixedQuantityData($value->item_no, $value->point_no, $request->latestYear, $value->avg);
                    $conv_c_upper = $this->configureFixedQuantityData($value->item_no, $value->point_no, $request->latestYear, $value->c_upper);
                    $conv_c_lower = $this->configureFixedQuantityData($value->item_no, $value->point_no, $request->latestYear, $value->c_lower);

                    $addNextYearStatistics = $this->Mng040Dao->addNextYearStatistics($value, $conv_std_dev, $conv_avg, $conv_c_upper, $conv_c_lower, $request->latestYear);

                    // エラー発生
                    if (!$addNextYearStatistics) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    }
                }
            }

            // 基準値補正マスタ登録処理
            $latestYearHoseiData = $this->Mng040Dao->getCriteriaCorrectionData($request->latestYear);
            if (!$latestYearHoseiData) {
                // エラー
                DB::rollback();
                return config('const.UPDATE_UPDATED_ERROR');
            } else {
                // 登録処理
                $addNextYearHoseiData = $this->Mng040Dao->addNextYearCriteriaCorrection($latestYearHoseiData, $request->addNextYear);

                // エラー発生
                if (!$addNextYearHoseiData) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }

            DB::commit();

            return config('const.INSERT_NO_ERROR');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return config('const.OTHER_ERROR');
        }
    }

    /**
     * 定量データ加工処理
     * ※ ReportServiceから参考
     *
     * @param int $itemNo       項目番号
     * @param int $pointNo      地点番号
     * @param int $houKijyun    法基準番号
     * @param string $data      定量データ
     * @return void
     */
    protected function configureFixedQuantityData(
        $itemNo,
        $pointNo,
        $houKijyun,
        $data,
    ) {
        // 検査基準取得
        $refValue = $this->Mng040Dao->getInspCriteriaReferenceValue($itemNo, $pointNo, $houKijyun);
        if (count($refValue) === 0) {
            return;
        }

        $RegLowLimit = $refValue[0]->regulation_low_limit;          // 基準値下限
        $RegUpLimit = $refValue[0]->regulation_up_limit;            // 基準値上限

        $InputLowLimit = $refValue[0]->input_low_limit;             // 入力下限値
        $InputUpLimit = $refValue[0]->input_up_limit;               // 入力上限値

        $lowerLimit = $refValue[0]->report_low_limit;               // 報告書下限値
        $upperLimit = $refValue[0]->report_up_limit;                // 報告書上限値

        $validDigits = $refValue[0]->valid_digits;                  // 有効桁数
        $inputMinDigits = $refValue[0]->input_min_digits;           // 入力最小桁
        $outputMinDigits = $refValue[0]->output_min_digits;         // 出力最小桁
        $saisuiKbnNo = $refValue[0]->saisui_kbn_no;                 // 採水区分No


        // 定量データが0の場合、補正を行う。
        if ($data === '0.00000000') {
            $data = '0.000000001';
        }

        // 帳票下限値がNULLの場合、下限値を補正する。
        // if (is_null($lowerLimit) || $lowerLimit == '') {
        //     $lowerLimit = '-100';
        // }
        $lowerLimit = is_numeric($lowerLimit) ? (float)$lowerLimit : -100;

        // 定量データのJIS丸めを行う。
        $tempData = '';
        $this->jisRound($data, intval($validDigits), intval($outputMinDigits), $tempData);
        $data = $tempData;

        return $data;
    }

    /**
     * JIS丸め処理
     *
     * @param string $inData      丸め対象値
     * @param int    $validDigit　有効桁数
     * @param int 　　$minDigit　　最小入力桁数
     * @param string $sOutData　　丸め処理結果
     * @return void
     */
    protected function jisRound(string $sInData, int $validDigit, int $minDigit, string &$sOutData): void
    {
        $sOutData = '';

        // 前提チェック
        if (!is_numeric($sInData) || $validDigit < 0 || $minDigit > 0) {
            return;
        }

        // 符号を分離
        $sign = 1;
        if (substr($sInData, 0, 1) === '-') {
            $sign    = -1;
            $sInData = substr($sInData, 1);
        }

        // 小数点位置を取得
        $text = $sInData;
        $dotIndex  = strpos($text, '.');
        $integerLen = $dotIndex !== false ? $dotIndex : strlen($text);

        // 有効桁数が0 → 小数以下を全部残したまま符号だけ反映
        if ($validDigit === 0) {
            if ($dotIndex !== false) {
                $scale    = strlen($text) - $dotIndex - 1;
                $value    = bcmul($text, (string)$sign, $scale);
                $sOutData = number_format($value, $scale, '.', '');
            } else {
                $value    = bcmul($text, (string)$sign, 0);
                $sOutData = $value;
            }
            return;
        }

        // 桁数A (最初の非0文字までの桁 + 有効桁数)
        if ($dotIndex > 0 && preg_match('/[1-9][0-9]+/', $sInData, $matchStr)) {
            $pos = strpos($sInData, $matchStr[0]);
            $digitA = $pos + $validDigit;
        } else {
            $digitA = $validDigit;
        }

        // 桁数B (整数部長さ－最小入力桁)
        $digitB = $integerLen - $minDigit;

        // 出力桁数 & モード (1:切捨て, 2:切上)
        if ($digitA <= $digitB) {
            $outputDigits = $digitA;
            $mode         = 1;
        } else {
            $outputDigits = $digitB;
            $mode         = 2;
        }

        // 小数点を外した対象文字列を作成
        if ($dotIndex !== false) {
            $left  = substr($text, 0, $dotIndex);
            $right = substr($text, $dotIndex + 1);
            $roundStr = $left . $right;
        } else {
            $roundStr = $text;
        }

        // 切上補正用文字列 ("000...1")
        $incStr = str_repeat('0', max(0, $outputDigits - 1)) . '1';
        if (strlen($roundStr) < $outputDigits) {
            $pad       = str_repeat('0', $outputDigits - strlen($roundStr));
            $incStr   .= $pad;
            $roundStr .= $pad;
        }

        // 基準桁の次の文字を取得して四捨五入判定
        $nextChar = $outputDigits < strlen($roundStr) ? $roundStr[$outputDigits] : '';
        if (in_array($nextChar, ['0', '1', '2', '3', '4'], true)) {
            $rndMode = 1;
        } elseif (in_array($nextChar, ['6', '7', '8', '9'], true)) {
            $rndMode = 2;
        } elseif ($nextChar === '5') {
            $rest = substr($roundStr, $outputDigits + 1);
            if ($rest === '' || bccomp($rest, '0', 0) === 0) {
                // 偶数丸め判定
                $prev = $roundStr[$outputDigits - 1];
                //奇数は切り上げ
                $rndMode = (intval(bcmod($prev, 2)) === 1 ?  2 : 1);
            } else {
                $rndMode = 2;
            }
        } else {
            $rndMode = 1;
        }

        // 切り捨て or 切り上げの実行
        switch ($rndMode) {
            case 1:  // 切り捨て
                $roundStr = substr($roundStr, 0, $outputDigits);
                $diff     = $integerLen - strlen($roundStr);
                if ($diff >= 0) {
                    $head = substr($roundStr, 0, $integerLen) . str_repeat('0', $diff);
                    $tail = '';
                } else {
                    $head = substr($roundStr, 0, $integerLen) . '.';
                    $tail = substr($roundStr, $integerLen);
                }
                $roundStr = $head . $tail;
                break;

            case 2:  // 切り上げ(四捨五入)
                $roundStr = substr($roundStr, 0, $outputDigits);
                $diff     = $integerLen - strlen($roundStr);

                if ($diff >= 0) {
                    // 整数部のみ切り上げ
                    $tAdd   = substr(bcadd($incStr, '0', 0), 0, $integerLen)
                        . str_repeat('0', $diff);
                    $hVal   = substr(bcadd($roundStr, '0', 0), 0, $integerLen)
                        . str_repeat('0', $diff);
                    $roundStr = bcadd($hVal, $tAdd, 0);
                } else {
                    // 小数部への繰り上げ含む
                    $tAdd   = substr($incStr, 0, $integerLen)
                        . '.'
                        . substr($incStr, $integerLen);
                    $hVal   = substr($roundStr, 0, $integerLen)
                        . '.'
                        . substr($roundStr, $integerLen);
                    $scale  = strlen($roundStr) - $integerLen;
                    $roundStr = bcadd($hVal, $tAdd, $scale);
                }
                // 必要なら小数点以下を0埋め
                if (strpos($roundStr, '.') === false && $outputDigits > $integerLen) {
                    $roundStr .= '.' . str_repeat('0', $outputDigits - $integerLen);
                }
                break;
        }

        // 最終フォーマット
        $decPlaces = $outputDigits - $integerLen;
        if ($decPlaces > 0) {
            $roundStr = number_format($roundStr, $decPlaces, '.', '');
        } else {
            $roundStr = number_format($roundStr, 0, '.', '');
        }

        // 切捨てモードなら末尾の0/. をトリム
        if ($mode === 1 && strpos($roundStr, '.') !== false) {
            $roundStr = rtrim(rtrim($roundStr, '0'), '.');
        }

        // 符号再付与
        $sOutData = ((int)$sign < 0 && $roundStr != 0)
            ? '-' . $roundStr
            : $roundStr;
    }
}
