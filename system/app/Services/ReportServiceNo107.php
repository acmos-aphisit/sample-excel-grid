<?php

namespace App\Services;

use App\Services\ReportService;
use App\Dao\ReportDao;
use App\Dao\ReportDaoNo107;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx as XlsxReader;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\NamedRange;
use PhpOffice\PhpSpreadsheet\Shared\Date as PHPDate; //Date属性を使用
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;

/**
 * 月報出力サービス
 *
 * @author
 */
class ReportServiceNo107 extends ReportService
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

        $cast = fn($obj): ReportDaoNo107 => $obj;
        $insDataCase = [];
        $insDataCalc = [];
        // -----------------------------------------------------------------
        // 各検査の1日分のデータを取得
        // -----------------------------------------------------------------
        // 毎日検査の1日分のデータ取得
        $insDataCase['every1day'] = $cast($this->reportDao)->getInspectionResultReport(
            $this->reportNo,
            $this->pointNo,
            $this->reportConfig['item_no'],
            $this->saisuiDate,
            $this->saisuiTime,
            200
        );

        // 毎月検査の1日分のデータ取得
        $insDataCase['month1day'] = $cast($this->reportDao)->getInspectionResultReportWithMonth(
            $this->reportNo,
            $this->pointNo,
            $this->reportConfig['item_no'],
            $this->saisuiDate,
            $this->saisuiTime,
            400
        );

        // 藻類検査の1日分のデータ取得
        $insDataCase['algae1day'] = $cast($this->reportDao)->getInspectionResultReport(
            $this->reportNo,
            $this->pointNo,
            $this->reportConfig['item_no'],
            $this->saisuiDate,
            $this->saisuiTime,
            5000
        );

        // 臭気検査の1日分のデータ取得
        $insDataCase['smell1day'] = $cast($this->reportDao)->getInspectionResultReport(
            $this->reportNo,
            $this->pointNo,
            $this->reportConfig['item_no'],
            $this->saisuiDate,
            $this->saisuiTime,
            5200
        );

        // -----------------------------------------------------------------
        // 各検査の過去5年間の最大、最小、平均を取得
        // -----------------------------------------------------------------
        // 毎日検査_過去5年集計
        $insDataCalc['every5YearDate'] = $cast($this->reportDao)->getInspectionResultReport5yearsCalcDay(
            $this->reportNo,
            $this->pointNo,
            $this->reportConfig['item_no'],
            $this->saisuiDate,
            $this->saisuiTime,
            200
        );

        // 毎月検査_過去5年集計
        $insDataCalc['month5YearMonth'] = $cast($this->reportDao)->getInspectionResultReport5yearsCalc(
            $this->reportNo,
            $this->pointNo,
            $this->reportConfig['item_no'],
            $this->saisuiDate,
            $this->saisuiTime,
            400
        );

        // 藻類_過去5年集計
        $insDataCalc['algae5YearAlgae'] = $cast($this->reportDao)->getInspectionResultReport5yearsFirstSaisuiCalc(
            $this->reportNo,
            $this->pointNo,
            $this->reportConfig['item_no'],
            $this->saisuiDate,
            $this->saisuiTime,
            5000
        );

        // 臭気_過去5年集計
        $insDataCalc['smell5YearAlgae'] = $cast($this->reportDao)->getInspectionResultReport5yearsFirstSaisuiCalc(
            $this->reportNo,
            $this->pointNo,
            $this->reportConfig['item_no'],
            $this->saisuiDate,
            $this->saisuiTime,
            5200
        );

        // -----------------------------------------------------------------
        // 各検査の1ヶ月の最大、最小、平均を取得
        // -----------------------------------------------------------------
        // 毎日検査_1ヶ月集計
        $insDataCalc['every1Month'] = $cast($this->reportDao)->getInspectionResultReportCalc(
            $this->reportNo,
            $this->pointNo,
            $this->reportConfig['item_no'],
            $this->saisuiDate,
            $this->saisuiTime,
            200
        );

        // 毎月検査_1ヶ月集計
        $insDataCalc['month1Month'] = $cast($this->reportDao)->getInspectionResultReportCalc(
            $this->reportNo,
            $this->pointNo,
            $this->reportConfig['item_no'],
            $this->saisuiDate,
            $this->saisuiTime,
            400
        );

        // 藻類検査_1ヶ月集計
        $insDataCalc['algae1Month'] = $cast($this->reportDao)->getInspectionResultReportCalc(
            $this->reportNo,
            $this->pointNo,
            $this->reportConfig['item_no'],
            $this->saisuiDate,
            $this->saisuiTime,
            5000
        );

        // 臭気検査_1ヶ月集計
        $insDataCalc['smell1Month'] = $cast($this->reportDao)->getSmellInspectionResultReportCalc(
            $this->reportNo,
            $this->pointNo,
            $this->reportConfig['item_no'],
            $this->saisuiDate,
            $this->saisuiTime,
            5200
        );

        // -----------------------------------------------------------------
        // 総トリハロメタンの最大、最小を取得
        // -----------------------------------------------------------------
        $sisetuNo = null;
        $processNo = null;
        $insToriharometanDataCalc = null;
        if (array_key_exists($this->reportNo, config('const.thmPointList'))) {
            $sisetuNo = config('const.thmPointList')[$this->reportNo]['sisetu'];
            $processNo = config('const.thmPointList')[$this->reportNo]['process'];
        }

        if (!is_null($sisetuNo) && !is_null($processNo)) {
            // 総トリハロメタン_1ヶ月集計
            $insToriharometanDataCalc['toriharometan1Month'] = $cast($this->reportDao)->getToriharometanMonthCalc(
                $this->reportNo,
                $this->pointNo,
                2250,
                $this->saisuiDate,
                $this->saisuiTime,
                400,
                $sisetuNo,
                $processNo
            );
        }

        // -----------------------------------------------------------------
        // 鹿島浄水場のみ、臭気検査の原水は報告書地点マスタに存在しない
        // 「鹿島着水2」を使用するため、ここで鹿島着水2の臭気情報を取得
        // -----------------------------------------------------------------
        $insSmellKashimaDataCalc = null;
        if ($this->reportNo == 141) {
            // 臭気検査_1ヶ月集計
            $insSmellKashimaDataCalc['smellKashima'] = $cast($this->reportDao)->getSmellKashimaResultReportCalc(
                $this->reportNo,
                1012,
                $this->reportConfig['item_no'],
                $this->saisuiDate,
                $this->saisuiTime,
                5200
            );
        }

        $inspectionResult['inspectionData'] = [];
        $namedDefine = [];
        $insData = [];
        $statistics = [];
        $saisuiDate = '';
        $saisuiTime = '';
        // 帳票出力データの編集
        foreach ($insDataCase as $keyName => $tmpCalc) {
            foreach ($tmpCalc as $tmpData) {
                $tmpArray = (array)$tmpData;
                if ($tmpArray['item_no'] == 1) {
                    $saisuiDate = $tmpArray['inspection_data'];
                }
                if ($tmpArray['item_no'] == 2) {
                    $saisuiTime = $tmpArray['inspection_data'];
                }
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
                        $this->inspectionKbnCode,
                    );
                    if ($keyName == 'algae') {
                        if (preg_match("/^\d+(?:.\d+)?$/", $tmpArray['inspection_data'])) {
                            $tmpArray['inspection_data'] = number_format(floatval($tmpArray['inspection_data']));
                        }
                    }
                }
                // 検査用データを配列で作成
                array_push($insData, [$tmpArray['inspection_data']]);
            }
        }

        // 帳票出力データ(集計)の編集
        $calcTarget = [
            'inspection_data_max' => 'max',
            'inspection_data_min' => 'min',
            'inspection_data_avg' => 'avg',
            'inspection_data_cnt' => 'cnt',
        ];
        foreach ($insDataCalc as $keyName => $tmpCalc) {

            $arr = array();
            $rowSaisuiDate = null;
            $maxData = 0;
            foreach ($tmpCalc as $keyTmpData => $tmpData) {
                $tmpArray = (array)$tmpData;

                if (
                    array_key_exists('saisui_date', $tmpArray)
                    && !empty($tmpArray['saisui_date'])
                    && (is_null($maxData) || $maxData < $tmpArray['inspection_data_max'])
                ) {
                    $rowSaisuiDate = $tmpArray['saisui_date'];
                    $maxData = $tmpArray['inspection_data_max'];
                }

                foreach ($calcTarget as $key => $val) {
                    // 定量データの加工
                    if (is_null($tmpArray[$key])) {
                        // データ加工は行わない
                    } else if ($val !== 'cnt') {
                        $this->configureFixedQuantityData(
                            $tmpArray['item_no'],
                            $tmpArray['saisui_kbn_no'],
                            $this->reportConfig['dsp_up_limit'],
                            $this->reportConfig['dsp_low_limit'],
                            $tmpArray[$key],
                            $tmpArray['point_no'],
                            $saisuiDate,
                            $saisuiTime,
                            $this->inspectionKbnCode,
                        );
                        if ($keyName == 'calc5YearAlgae') {
                            if (preg_match("/^\d+(?:.\d+)?$/", $tmpArray[$key])) {
                                $tmpArray[$key] = number_format(floatval($tmpArray[$key]));
                            }
                        }
                    }
                    if (!array_key_exists($val, $arr)) {
                        $arr[$val] = array();
                        if ($val !== 'max') {
                            $arr[$val][] = array($tmpArray[$key]);
                        }
                    } else {
                        if (array_key_exists('qualitative_data_max', $tmpArray) && $val === 'max' && $tmpArray['item_no'] == 9110) {
                            $arr[$val][] = array($tmpArray['qualitative_data_max']);
                        } else if (array_key_exists('qualitative_data_min', $tmpArray) && $val === 'min' && $tmpArray['item_no'] == 9110) {
                            $arr[$val][] = array($tmpArray['qualitative_data_min']);
                        } else {
                            $arr[$val][] = array($tmpArray[$key]);
                        }
                    }
                }

                if (array_key_last($tmpCalc) === $keyTmpData || $tmpCalc[($keyTmpData + 1)]->point_no !== $tmpArray['point_no']) {
                    // 検査用データを配列で作成
                    array_push($insData, [$rowSaisuiDate]);
                    $insData = array_merge($insData, $arr['max'], $arr['min'], $arr['avg'], $arr['cnt']);
                    $arr = array();
                    $rowSaisuiDate = null;
                    $maxData = null;
                }
            }
        }

        if (!is_null($insSmellKashimaDataCalc)) {
            foreach ($insSmellKashimaDataCalc as $keyName => $tmpCalc) {

                $arr = array();
                $rowSaisuiDate = null;
                $maxData = 0;
                foreach ($tmpCalc as $keyTmpData => $tmpData) {
                    $tmpArray = (array)$tmpData;

                    if (
                        array_key_exists('saisui_date', $tmpArray)
                        && !empty($tmpArray['saisui_date'])
                        && (is_null($maxData) || $maxData < $tmpArray['inspection_data_max'])
                    ) {
                        $rowSaisuiDate = $tmpArray['saisui_date'];
                        $maxData = $tmpArray['inspection_data_max'];
                    }

                    foreach ($calcTarget as $key => $val) {
                        // 定量データの加工
                        if (is_null($tmpArray[$key]) || $val === 'cnt') {
                            // データ加工は行わない
                        } else {
                            $this->configureFixedQuantityData(
                                $tmpArray['item_no'],
                                $tmpArray['saisui_kbn_no'],
                                $this->reportConfig['dsp_up_limit'],
                                $this->reportConfig['dsp_low_limit'],
                                $tmpArray[$key],
                                $tmpArray['point_no']
                            );
                            if ($keyName == 'calc5YearAlgae') {
                                if (preg_match("/^\d+(?:.\d+)?$/", $tmpArray[$key])) {
                                    $tmpArray[$key] = number_format(floatval($tmpArray[$key]));
                                }
                            }
                        }
                        if (!array_key_exists($val, $arr)) {
                            $arr[$val] = array();
                            if ($val !== 'max') {
                                $arr[$val][] = array($tmpArray[$key]);
                            }
                        } else {
                            if (array_key_exists('qualitative_data_max', $tmpArray) && $val === 'max' && $tmpArray['item_no'] == 9110) {
                                $arr[$val][] = array($tmpArray['qualitative_data_max']);
                            } else if (array_key_exists('qualitative_data_min', $tmpArray) && $val === 'min' && $tmpArray['item_no'] == 9110) {
                                $arr[$val][] = array($tmpArray['qualitative_data_min']);
                            } else {
                                $arr[$val][] = array($tmpArray[$key]);
                            }
                        }
                    }

                    if (array_key_last($tmpCalc) === $keyTmpData || $tmpCalc[($keyTmpData + 1)]->point_no !== $tmpArray['point_no']) {
                        // 検査用データを配列で作成
                        array_push($insData, [$rowSaisuiDate]);
                        $insData = array_merge($insData, $arr['max'], $arr['min'], $arr['avg'], $arr['cnt']);
                        $arr = array();
                        $rowSaisuiDate = null;
                        $maxData = null;
                    }
                }
            }
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
                            $insDataCase['every1day']
                        )
                    ),
                ];
            }
        }

        // 帳票出力データの編集(総トリハロメタン)
        $insToriharoData = [];
        if (!is_null($insToriharometanDataCalc)) {
            foreach ($insToriharometanDataCalc as $keyName => $tmpCalc) {
                foreach ($tmpCalc as $tmpData) {
                    $tmpArray = (array)$tmpData;
                    // 定量データの加工
                    if (is_null($tmpArray['constant_data'])) {
                        //[2025-07-16]ブランクデータの代替表示はテンプレート側で対応する方針
                        //$tmpArray['constant_data'] = $this->reportConfig['dsp_space'];
                    } else {
                        $saisuiDate = $tmpArray['saisui_date'];
                        $saisuiTime = $tmpArray['saisui_time'];
                        // 定量データの加工
                        $this->configureFixedQuantityData(
                            $tmpArray['item_no'],
                            $tmpArray['saisui_kbn_no'],
                            $this->reportConfig['dsp_up_limit'],
                            $this->reportConfig['dsp_low_limit'],
                            $tmpArray['constant_data'],
                            $tmpArray['point_no'],
                            $saisuiDate,
                            $saisuiTime,
                            $this->inspectionKbnCode,
                        );
                    }
                    // 検査用データを配列で作成
                    array_push($insToriharoData, [$tmpArray['point_report_name'], $tmpArray['constant_data']]);
                }
            }
        }

        // Excel出力処理
        $this->outputReportNo107($inspectionResult, $arrReportText, $insToriharoData);

        return $result;
    }

    /**
     * 帳票Excel出力処理
     *
     * @param int $reportNo 報告書番号
     * @param array $inspectionResult 検査結果
     * @param array $namedDefine 追加名前付き定義
     * @return void
     */
    protected function outputReportNo107(array $inspectionResult, $arrReportText = null, $insToriharoData = null): void
    {
        syslog(LOG_INFO, "templateFile:" . $this->reportConfig['template_file']);
        // 出力帳票名を取得(一旦固定値で作成)
        $excelPath = config('const.OutputTempPath', '/var/www/suishitsu/resources/excel/outputFormat/');
        $filePath = $excelPath . $this->reportConfig['template_file'];
        syslog(LOG_INFO, "excelPath:" . $excelPath);
        // Excelテンプレートを開く
        $reader = new XlsxReader();
        $reader->setReadDataOnly(false);
        $spreadsheet = $reader->load($filePath);
        if ($spreadsheet->sheetNameExists('データシート') === false) {
            return;
        }

        // 検査結果を添付
        $tmpSpread = $spreadsheet->copy();
        $sheet = $tmpSpread->getSheetByName('データシート');

        // 「開始位置」からセル番地を抽出（例：$B$5 → B5）
        $named = $tmpSpread->getNamedRange('開始位置');
        $rawRef = substr($named->getRange(), strpos($named->getRange(), '!') + 1); // "$B$5"
        $cellRef = str_replace('$', '', $rawRef); // → "B5"

        $itemList = $this->reportDao->getReportItem($this->reportNo);
        $pointList = $this->reportDao->getReportPoint($this->reportNo);
        $stringifiedData = [];
        $rowIndex = 0;
        $colIndex = 0;

        // 検査数分ループ
        for ($i = 0; $i < 100; $i++) {
            // 地点数分ループ(縦)
            foreach ($pointList as $rowPointIndex => $rowPoint) {
                $stringifiedData[$rowIndex] = [];
                $colIndex = 0;

                // 項目数分ループ(横)
                foreach ($itemList as $colItemIndex => $colItem) {
                    // データインデックスを行×列数＋列インデックスで算出
                    $dataIndex = $rowIndex * count($itemList) + $colItemIndex;
                    $data = $inspectionResult['inspectionData'][$dataIndex] ?? [];

                    if (is_array($data)) {
                        // データを文字列化し、末尾ゼロも保持
                        $stringifiedRow = array_map(function ($value) {
                            // 3桁区切りのカンマを追加
                            if (is_numeric($value)) {
                                $integerPart = explode('.', (string)$value)[0] ?? '';
                                $integerLength = strlen($integerPart);
                                if ($integerLength > 3) {
                                    $value = number_format((float)$value);
                                }
                            }
                            if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                                $decimalPart = explode('.', (string)$value)[1] ?? '';
                                $decimalLength = strlen($decimalPart);
                                return number_format((float)$value, $decimalLength, '.', '');
                            }
                            return (string)$value;
                        }, $data);

                        $stringifiedData[$rowIndex][$colIndex] = implode(',', $stringifiedRow);
                    } else {
                        $stringifiedData[$rowIndex][$colIndex] = '';
                    }

                    $colIndex++;
                }

                $rowIndex++;
            }
        }

        $reversedData = [];

        foreach ($stringifiedData as $pointNo => $values) {
            $values = array_values($values); // キーを 0,1,2,... にリセット

            foreach ($values as $index => $value) {
                $reversedData[$index][$pointNo] = $value;
            }
        }

        // データを指定したセルから貼り付け
        $this->fromArrayNoAutoAdjustmentfromArray($sheet, $reversedData, null, $cellRef);

        // 総トリハロメタン貼り付け
        if ($insToriharoData) {
            // 「開始位置」からセル番地を抽出（例：$B$5 → B5）
            $named = $tmpSpread->getNamedRange('総トリハロメタン_開始位置');
            $rawRef = substr($named->getRange(), strpos($named->getRange(), '!') + 1); // "$B$5"
            $cellRef = str_replace('$', '', $rawRef); // → "B5"

            if (count($insToriharoData) === 1) {
                $outPutData = array(
                    array($insToriharoData[0][0]),
                    array($insToriharoData[0][1]),
                );
            } else {
                $outPutData = array(
                    array($insToriharoData[0][0], $insToriharoData[1][0]), // 配水池名をまとめる
                    array($insToriharoData[0][1], $insToriharoData[1][1]), // 数値をまとめる
                );
            }

            $this->fromArrayNoAutoAdjustmentfromArray($sheet, $outPutData, null, $cellRef);
        }

        // セル番地を分解（列と行）
        list($startCol, $startRow) = Coordinate::coordinateFromString($cellRef);
        $colIndex = Coordinate::columnIndexFromString($startCol);
        $rowIndex = (int)$startRow;

        // 報告書シートを取得
        $reportSheet = $tmpSpread->getSheetByName('報告書シート');
        $maxColumn = $reportSheet->getHighestColumn();
        $maxRow = $reportSheet->getHighestRow();

        // データ取得
        $reportData = $reportSheet->rangeToArray("A1:$maxColumn$maxRow", null, true, false);

        // 小数点付き数値を文字列に変換
        foreach ($reportData as &$row) {
            foreach ($row as &$value) {
                if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                    // 小数を文字列化
                    $value = (string)$value;
                }
            }
        }

        // 参照解除
        unset($row, $value);

        // 一括貼り付け
        $this->fromArrayNoAutoAdjustmentfromArray($reportSheet, $reportData, null, 'A1');

        //★固定文言出力処理
        //Cell::setValueBinder(new AdvancedValueBinder());
        if (!is_null($arrReportText)) {
            foreach ($arrReportText as $key => $value) {
                syslog(LOG_INFO, "固定文言 key:{$key}");
                $named = $tmpSpread->getNamedRange($key);
                if ($named != null) {
                    syslog(LOG_INFO, "固定文言 value:{$value}");
                    syslog(LOG_INFO, "固定文言 range:{$named->getRange()}");
                    if ($this->checkOutputReportDate($value)) {
                        //$value = Date::createFromFormat('Y/m/d', $value);
                        $value = PHPDate::PHPToExcel($value);
                        syslog(LOG_INFO, "固定文言 日付 :{$value}");
                    }
                    $reportSheet->setCellValue($named->getRange(), $value);

                    syslog(LOG_INFO, "設定後 getValue :{$reportSheet->getCell($named->getRange())->getValue()}");
                    syslog(LOG_INFO, "設定後 getFormattedValue :{$reportSheet->getCell($named->getRange())->getFormattedValue()}");
                    syslog(LOG_INFO, "設定後 getCalculatedValue :{$reportSheet->getCell($named->getRange())->getCalculatedValue()}");
                }
            }
        }
        // 不要となるデータシートを削除
        //$sheetIndex = $tmpSpread->getIndex($sheet);
        //$tmpSpread->removeSheetByIndex($sheetIndex);
        // ファイル保存：アクモス
        $writer = new Xlsx($tmpSpread);

        // システムのテンポラリディレクトリを取得
        $tempDir = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $this->userId;
        // 保存ファイル名
        $fileName = $this->getFileName();

        if(!file_exists($tempDir)){
            if(!mkdir($tempDir,0777,true)){
                throw new \Exception('帳票作成失敗');
            }
        }

        // フルパスを生成
        $filePath = $tempDir . DIRECTORY_SEPARATOR . $fileName;

        //ファイル保存
        $writer->save($filePath);
    }
}
