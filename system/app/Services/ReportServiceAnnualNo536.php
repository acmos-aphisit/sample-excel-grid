<?php

namespace App\Services;

use App\Services\ReportService;
use App\Dao\ReportDao;
use App\Dao\ReportDaoAnnualNo536;
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
class ReportServiceAnnualNo536 extends ReportService
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
        $cast = fn($obj): ReportDaoAnnualNo536 => $obj;
        $inspectionData = $cast($this->reportDao)->getInspectionResultReport(
            $this->reportNo,
            $this->pointNo,
            $this->reportConfig['item_no'],
            $this->saisuiDate,
            $this->saisuiTime,
            $this->inspectionKbnCode
        );

        $insDataCase['dioxion'] = $cast($this->reportDao)->getInspectionResultDioxin(
            $this->reportNo,
            $this->saisuiDate
        );

        $insDataCase['micro'] = $cast($this->reportDao)->getInspectionResultMicro(
            $this->reportNo,
            $this->saisuiDate
        );

        $inspectionResult['inspectionData'] = [];
        $insData = [];
        $insDataNamed = [
            'dioxion' => [],
            'micro' => []
        ];
        $statistics = [];
        $namedDefine = [
            'dioxion' => [],
            'micro' => []
        ];
        $index = 0;
        // 帳票出力データの編集
        foreach ($inspectionData as $tmpData) {
            $tmpArray = (array)$tmpData;
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
                    $tmpArray['point_no']
                );
            }
            // 検査用データを配列で作成
            array_push($insData, [$tmpArray['inspection_data']]);
        }

        foreach ($insDataCase as $keyName => $tmpCase) {
            foreach ($tmpCase as $tmpData) {
                $tmpArray = (array)$tmpData;
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
                        $tmpArray['point_no']
                    );
                }
                // array_push($insDataNamed[$keyName], [$tmpArray['inspection_data']]);
                // $sort = !is_null($tmpArray['sort']) ? $tmpArray['sort'] : '0';
                // $namedRange = $keyName . '_' . $tmpArray['item_no'] . '_' . $tmpArray['point_no'] . '_' . $sort;
                // array_push($namedDefine[$keyName], $namedRange);]
                
                // 検査用データを配列で作成
                array_push($insData, [$tmpArray['inspection_data']]);
            }
        }

        // 統計データの追加
        $calc = $this->calcStatistics($statistics);
        // 作成した検査用データを格納
        // $inspectionResult['inspectionData'] = array_merge(
        //     $insData,
        //     $calc['max'],
        //     $calc['min'],
        //     $calc['avg'],
        //     $calc['count'],
        //     $calc['sum']
        // );

        $inspectionResult['inspectionData'] = array_merge(
            $insData
        );

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
        $this->outputReportNo536($inspectionResult, $insDataNamed, $arrReportText, $namedDefine);

        return $result;
    }

    /**
     * 帳票Excel出力処理
     *
     * @param int $reportNo 報告書番号
     * @param array $inspectionResult 検査結果
     * @return void
     */
    protected function outputReportNo536(
        array $inspectionResult,
        array $inspectionNamed,
        $arrReportText = null,
        $namedDefine = null
    ): void {
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

        // // データを文字列化し、末尾ゼロも保持
        // $stringifiedData = array_map(function ($row) {
        //     return array_map(function ($value) {
        //         if (is_numeric($value) && strpos((string)$value, '.') !== false) {
        //             $decimalPart = explode('.', (string)$value)[1] ?? '';
        //             $decimalLength = strlen($decimalPart);
        //             return number_format((float)$value, $decimalLength, '.', '');
        //         }
        //         return (string)$value;
        //     }, $row);
        // }, $inspectionResult['inspectionData']);

        // // データを指定したセルから貼り付け
        // $sheet->fromArray($stringifiedData, null, $cellRef);

        $itemList = $this->reportDao->getReportItem($this->reportNo);
        $pointList = $this->reportDao->getReportPoint($this->reportNo);
        $stringifiedData = [];
        $rowPointIndex = 0;
        $length = count($inspectionResult['inspectionData']);
        $i = 0;

        // 地点数分ループ(縦)
        do {
        // for ($i = 0; $i < 100; $i++) {
        // foreach ($pointList as $rowPointIndex => $rowPoint) {
            $stringifiedData[$rowPointIndex] = [];

            // 項目数分ループ(横)
            foreach ($itemList as $colItemIndex => $colItem) {
                // データインデックスを行×列数＋列インデックスで算出
                $dataIndex = $rowPointIndex * count($itemList) + $colItemIndex;
                $data = $inspectionResult['inspectionData'][$dataIndex] ?? [];

                if (is_array($data)) {
                    $stringifiedRow = array_map(function ($value) {
                        if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                            $decimalPart = explode('.', (string)$value)[1] ?? '';
                            $decimalLength = strlen($decimalPart);
                            return number_format((float)$value, $decimalLength, '.', '');
                        }
                        return (string)$value;
                    }, $data);

                    $stringifiedData[$rowPointIndex][$colItemIndex] = implode(',', $stringifiedRow);
                } else {
                    $stringifiedData[$rowPointIndex][$colItemIndex] = '';
                }
            }

            $rowPointIndex++;
            $i++;

        } while ($i < $length);

        $reversedData = [];

        foreach ($stringifiedData as $pointNo => $values) {
            $values = array_values($values);

            foreach ($values as $index => $value) {
                $reversedData[$index][$pointNo] = $value;
            }
        }

        // データを指定したセルから貼り付け
        $this->fromArrayNoAutoAdjustmentfromArray($sheet,$reversedData, null, $cellRef);

        // セル番地を分解（列と行）
        list($startCol, $startRow) = Coordinate::coordinateFromString($cellRef);
        $colIndex = Coordinate::columnIndexFromString($startCol);
        $rowIndex = (int)$startRow;

        // 書式を各セルに適用（小数点桁数に応じて）
        // foreach ($stringifiedData as $rowData) {
        //     $col = $colIndex;
        //     foreach ($rowData as $value) {
        //         if (is_numeric($value) && strpos($value, '.') !== false) {
        //             $decimalLength = strlen(explode('.', $value)[1] ?? '');
        //             $formatCode = '0.' . str_repeat('0', $decimalLength);
        //             $coordinate = Coordinate::stringFromColumnIndex($col) . $rowIndex;
        //             $sheet->getStyle($coordinate)->getNumberFormat()->setFormatCode($formatCode);
        //         }
        //         $col++;
        //     }
        //     $rowIndex++;
        // }

        // $dataSheet2Named = [
        //     'dioxion' => 'ダイオキシン出力位置',
        //     'micro' => 'ミクロキスチン出力位置'
        // ];
        // $sheet2 = $tmpSpread->getSheetByName('データシート2');
        // foreach ($dataSheet2Named as $key => $namedKey) {
        //     $named = $tmpSpread->getNamedRange($namedKey);
        //     $rawRef = substr($named->getRange(), strpos($named->getRange(), '!') + 1); // "$B$5"
        //     $cellRef = str_replace('$', '', $rawRef); // → "B5"

        //     // データを文字列化し、末尾ゼロも保持
        //     $stringifiedData = array_map(function ($row) {
        //         return array_map(function ($value) {
        //             if (is_numeric($value) && strpos((string)$value, '.') !== false) {
        //                 $decimalPart = explode('.', (string)$value)[1] ?? '';
        //                 $decimalLength = strlen($decimalPart);
        //                 return number_format((float)$value, $decimalLength, '.', '');
        //             }
        //             return (string)$value;
        //         }, $row);
        //     }, $inspectionNamed[$key]);

        //     // データを指定したセルから貼り付け
        //     $sheet2->fromArray($stringifiedData, null, $cellRef);

        //     // セル番地を分解（列と行）
        //     list($startCol, $startRow) = Coordinate::coordinateFromString($cellRef);
        //     $colIndex = Coordinate::columnIndexFromString($startCol);
        //     $rowIndex = (int)$startRow;

        //     // 書式を各セルに適用（小数点桁数に応じて）
        //     foreach ($stringifiedData as $rowData) {
        //         $col = $colIndex;
        //         foreach ($rowData as $value) {
        //             if (is_numeric($value) && strpos($value, '.') !== false) {
        //                 $decimalLength = strlen(explode('.', $value)[1] ?? '');
        //                 $formatCode = '0.' . str_repeat('0', $decimalLength);
        //                 $coordinate = Coordinate::stringFromColumnIndex($col) . $rowIndex;
        //                 $sheet2->getStyle($coordinate)->getNumberFormat()->setFormatCode($formatCode);
        //             }
        //             $col++;
        //         }
        //         $rowIndex++;
        //     }

        //     // 名前付き定義追加
        //     $count = 1;
        //     // 行参照の列部分を取得
        //     $colName = substr($rawRef, 0, 2);
        //     foreach ($namedDefine[$key] as $name) {
        //         $cell = $colName . '$' . strval($count);
        //         $namedRange = new NamedRange($name, $sheet2, $cell);
        //         $tmpSpread->addNamedRange($namedRange);
        //         $count++;
        //     }
        // }


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
        $this->fromArrayNoAutoAdjustmentfromArray($reportSheet,$reportData, null, 'A1');

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
