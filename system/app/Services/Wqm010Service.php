<?php

namespace App\Services;

use App\Dao\Wqm010Dao;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use DateTime;
use Exception;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx as XlsxReader;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx as XlsxWriter;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Chart\Chart;
use PhpOffice\PhpSpreadsheet\Chart\DataSeries;
use PhpOffice\PhpSpreadsheet\Chart\DataSeriesValues;
use PhpOffice\PhpSpreadsheet\Chart\Layout;
use PhpOffice\PhpSpreadsheet\Chart\Legend;
use PhpOffice\PhpSpreadsheet\Chart\PlotArea;
use PhpOffice\PhpSpreadsheet\Chart\Title;
use PhpOffice\PhpSpreadsheet\Chart\GridLines;

/**
 * 検査情報登録サービス
 *
 * @author
 */
class Wqm010Service
{
    // 検査情報登録DAO
    private $Wqm010Dao;

    private $templateFileName = 'trend_template.xlsx';
    private $saveFileName     = '/save_trend.xlsx';


    /**
     * コンストラクタ
     * 
     */
    public function __construct()
    {
        $this->Wqm010Dao = new Wqm010Dao();
    }

    /**
     * 検査情報の項目を取得
     * 
     */
    public function fetchInputItems($request)
    {
        $fetchInputItems = $this->Wqm010Dao->fetchInputItems($request);

        return $fetchInputItems;
    }

    /**
     * 項目の選択肢を取得
     * 
     */
    public function fetchInputItemsSelector($request)
    {
        $fetchInputItemsSelector = $this->Wqm010Dao->fetchInputItemsSelector($request);

        return $fetchInputItemsSelector;
    }

    /**
     * 検査情報の地点を取得
     * 
     */
    public function fetchInputPoints($request)
    {
        $fetchInputPoints = $this->Wqm010Dao->fetchInputPoints($request);

        return $fetchInputPoints;
    }

    /**
     * 検査基準情報を取得
     * 
     */
    public function fetchInspectCriteriaData($request, $item_filters, $point_filters)
    {
        $fetchInspectCriteriaData = $this->Wqm010Dao->fetchInspectCriteriaData($request, $item_filters, $point_filters);

        return $fetchInspectCriteriaData;
    }

    /**
     * 検査基準情報を取得
     * ※ 2025/12/08 補正情報で取得
     * 
     */
    public function fetchInspectCriteriaDataKbnCorrection($request, $item_filters, $point_filters)
    {
        $fetchInspectCriteriaDataKbnCorrection = $this->Wqm010Dao->fetchInspectCriteriaDataKbnCorrection($request, $item_filters, $point_filters);

        return $fetchInspectCriteriaDataKbnCorrection;
    }

    /**
     * 検査情報の入力データを取得
     * 
     */
    public function fetchInputData($request, $item_filters, $point_filters)
    {
        $fetchInputData = $this->Wqm010Dao->fetchInputData($request, $item_filters, $point_filters);

        return $fetchInputData;
    }

    /**
     * 入力データがある日付を取得
     * 
     */
    public function fetchInputDataExistDate($request, $item_filters, $point_filters)
    {
        $fetchInputDataExistDate = $this->Wqm010Dao->fetchInputDataExistDate($request, $item_filters, $point_filters);

        return $fetchInputDataExistDate;
    }

    /**
     * 入力データがある日付を取得（全件）
     * 
     */
    public function fetchAllInputDataExistDate($request, $item_filters, $point_filters)
    {
        $fetchAllInputDataExistDate = $this->Wqm010Dao->fetchAllInputDataExistDate($request, $item_filters, $point_filters);

        return $fetchAllInputDataExistDate;
    }

    /**
     * 検査情報の入力マスクデータを取得
     * 
     */
    public function fetchInputMask($request, $item_filters, $point_filters)
    {
        $fetchInputMask = $this->Wqm010Dao->fetchInputMask($request, $item_filters, $point_filters);

        return $fetchInputMask;
    }

    /**
     * 基準値補正マスタ取得
     * 
     */
    public function fetchCriteriaCorrection($request, $item_filters, $point_filters)
    {
        $fetchCriteriaCorrection = $this->Wqm010Dao->fetchCriteriaCorrection($request, $item_filters, $point_filters);

        return $fetchCriteriaCorrection;
    }

    /**
     * 入力データ確定情報を取得
     * 
     */
    public function getInputFixedDate($request)
    {
        $getInputFixedDate = $this->Wqm010Dao->getInputFixedDate($request);

        return $getInputFixedDate;
    }

    /**
     * 確定ボタン表示フラグを取得
     * 
     */
    public function getInputFixedFlg($request)
    {
        $getInputFixedFlg = $this->Wqm010Dao->getInputFixedFlg($request);

        return $getInputFixedFlg;
    }

    /**
     * 検査情報を登録
     * 
     */
    public function saveInputData($request)
    {
        DB::beginTransaction();
        try {
            $data_to_save = json_decode(json_encode($request->data_to_save));

            foreach ($data_to_save as $value) {
                foreach ($value->data_by_item as $item) {
                    foreach ($item->data as $data) {
                        if ($data->handle_data) {
                            // DB格納値に入力が有り、入力値が未入力になった場合
                            if (($data->handle_edit_data && (!isset($data->data))) || $data->all_delete_flg) {
                                // 排他チェック_対象データ存在しない
                                $checkInputDataBefore = $this->Wqm010Dao->checkInputDataBefore($data->point_no, $item->item_no, $value->input_select_date, $data->inspection_kbn_code);
                                if (count((array) $checkInputDataBefore) == 0) {
                                    // 排他エラー
                                    DB::rollback();
                                    return config('const.DELETE_NO_DATA_ERROR');
                                }

                                // DBに登録されている処理中セルのレコードを削除
                                $deleteInputData = $this->Wqm010Dao->deleteInputData($data->point_no, $item->item_no, $value->input_select_date, $data->inspection_kbn_code);

                                // エラー発生
                                if (!$deleteInputData) {
                                    DB::rollback();
                                    return config('const.OTHER_ERROR');
                                }
                            } else {
                                // 採水時刻変更有無を確認
                                if ($data->saisui_time_changed_flg) {
                                    // DB確認データあり
                                    if (isset($data->data)) {
                                        // DB格納値 = 入力値_時刻変更
                                        if (!$data->handle_edit_data) {
                                            // 排他チェック_対象データ存在しない
                                            $checkInputDataBefore = $this->Wqm010Dao->checkInputDataBefore($data->point_no, $item->item_no, $value->input_select_date, $data->inspection_kbn_code);
                                            if (count((array) $checkInputDataBefore) > 0) {
                                                if ($checkInputDataBefore[0]->update_date > $request->display_time) {
                                                    // 排他エラー
                                                    DB::rollback();
                                                    return config('const.UPDATE_UPDATED_ERROR');
                                                }
                                            } else {
                                                // 排他エラー
                                                DB::rollback();
                                                return config('const.UPDATE_NO_DATA_ERROR');
                                            }

                                            $updateInputData = $this->Wqm010Dao->updateInputData($data->point_no, $item->item_no, $value->input_select_date, $data->saisui_time, $data->inspection_kbn_code, $data->constant_qualitative_flg, null);

                                            // エラー発生
                                            if (!$updateInputData) {
                                                DB::rollback();
                                                return config('const.OTHER_ERROR');
                                            }
                                        } else if ($data->handle_edit_data) {
                                            // 排他チェック_対象データ存在しない
                                            $checkInputDataBefore = $this->Wqm010Dao->checkInputDataBefore($data->point_no, $item->item_no, $value->input_select_date, $data->inspection_kbn_code);
                                            if (count((array) $checkInputDataBefore) > 0) {
                                                if ($checkInputDataBefore[0]->update_date > $request->display_time) {
                                                    // 排他エラー
                                                    DB::rollback();
                                                    return config('const.UPDATE_UPDATED_ERROR');
                                                }
                                            } else {
                                                // 排他エラー
                                                DB::rollback();
                                                return config('const.UPDATE_NO_DATA_ERROR');
                                            }

                                            // DB格納値 != 入力値_時刻変更
                                            $updateInputData = $this->Wqm010Dao->updateInputData($data->point_no, $item->item_no, $value->input_select_date, $data->saisui_time, $data->inspection_kbn_code, $data->constant_qualitative_flg, $data->data);

                                            // エラー発生
                                            if (!$updateInputData) {
                                                DB::rollback();
                                                return config('const.OTHER_ERROR');
                                            }
                                        }
                                    }
                                } else {
                                    // DB格納値 != 入力値_時刻変更ではない
                                    if ($data->handle_edit_data) {
                                        // 排他チェック_対象データ存在しない
                                        $checkInputDataBefore = $this->Wqm010Dao->checkInputDataBefore($data->point_no, $item->item_no, $value->input_select_date, $data->inspection_kbn_code);
                                        if (count((array) $checkInputDataBefore) > 0) {
                                            if ($checkInputDataBefore[0]->update_date > $request->display_time) {
                                                // 排他エラー
                                                DB::rollback();
                                                return config('const.UPDATE_UPDATED_ERROR');
                                            }
                                        } else {
                                            // 排他エラー
                                            DB::rollback();
                                            return config('const.UPDATE_NO_DATA_ERROR');
                                        }

                                        $updateInputData = $this->Wqm010Dao->updateInputData($data->point_no, $item->item_no, $value->input_select_date, null, $data->inspection_kbn_code, $data->constant_qualitative_flg, $data->data);

                                        // エラー発生
                                        if (!$updateInputData) {
                                            DB::rollback();
                                            return config('const.OTHER_ERROR');
                                        }
                                    }
                                }
                            }
                        } else {
                            // DB確認データなし
                            if (isset($data->data)) {
                                // 入力データあり
                                // 採水年月日の項目
                                $constant_data = ($data->constant_qualitative_flg == 1 && isset($data->data)) ? $data->data : null;
                                $qualitative_data = ($data->constant_qualitative_flg == 2  && isset($data->data)) ? $data->data : null;

                                // 排他チェック_登録済み
                                $checkInputDataBefore = $this->Wqm010Dao->checkInputDataBefore($data->point_no, $item->item_no, $value->input_select_date, $data->inspection_kbn_code);
                                if (count((array) $checkInputDataBefore) > 0) {
                                    // 排他エラー
                                    DB::rollback();
                                    return config('const.INSERT_NEW_ERROR');
                                }

                                // 新規登録処理
                                $saveNewInputData = $this->Wqm010Dao->saveNewInputData($data->point_no, $item->item_no, $value->input_select_date, $data->saisui_time, $data->inspection_kbn_code, $data->constant_qualitative_flg, $constant_data, $qualitative_data);

                                // エラー発生
                                if (!$saveNewInputData) {
                                    DB::rollback();
                                    return config('const.OTHER_ERROR');
                                }
                            }
                        }
                    }
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
     * 入力データ確定管理（登録・削除）
     * 
     */
    public function manageInputFixedDate($request)
    {
        if ($request->procress == "save") {
            // (7)-1 排他制御 入力データ確定日
            $checkInputFixedDateBefore = $this->Wqm010Dao->fetchInputFixedDate($request);
            if (count((array) $checkInputFixedDateBefore) > 0) {
                // 排他エラー
                DB::rollback();
                return config('const.INSERT_NEW_ERROR');
            }

            // 新規登録処理
            $saveNewInputFixedDate = $this->Wqm010Dao->saveNewInputFixedDate($request);

            // エラー発生
            if (!$saveNewInputFixedDate) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }

            return config('const.INSERT_NO_ERROR');
        } else if ($request->procress == "delete") {
            // (8)-1 排他制御 入力データ確定日
            $checkInputFixedDateBefore = $this->Wqm010Dao->checkInputFixedDateBefore($request);
            if (count((array) $checkInputFixedDateBefore) > 0) {
                // 排他エラー
                DB::rollback();
                return config('const.DELETE_NO_DATA_ERROR');
            }

            // 削除処理
            $deleteInputFixedDate = $this->Wqm010Dao->deleteInputFixedDate($request);

            // エラー発生
            if (!$deleteInputFixedDate) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }

            return config('const.DELETE_NO_ERROR');
        }
    }

    /**
     * トレンド画面 検索処理
     */
    public function getTrendData($request)
    {
        // 戻り値
        $result = false;
        $resultIndex = 0;
        $date = '';

        // 検索結果
        $trendData = array();
        $trendData = $this->Wqm010Dao->getTrendData($request);

        if ($trendData !== false && count((array) $trendData) !== 0) {
            $date = $trendData[$resultIndex]->date;
            $result[$resultIndex]['XAxisName'] = $date;
            foreach ($trendData as $row) {
                if ($row->date !== $date) {
                    $date = $row->date;
                    $resultIndex++;
                    $result[$resultIndex]['XAxisName'] = $date;
                }
                $result[$resultIndex][$row->point_name] = (float)$row->value;
            }
        }

        return $result;
    }

    public function exportTrend($request)
    {
        // テンプレートファイルのパス
        $templatePath = config('const.TrendTempPath', '/var/www/suishitsu/resources/trendTemplate/') . $this->templateFileName;

        try {
            // データ取得 start
            $trendData = array();
            $trendData = $this->Wqm010Dao->getTrendData($request);
            if ($trendData === false || count((array) $trendData) === 0) {
                return false;
            }

            $result = array();
            $resultIndex = 0;
            foreach ($trendData as $key => $row) {
                $value = (float)$row->value;
                $result[$key] = array(
                    0 => $row->date,
                    1 => (string)$value,
                );
            }

            array_unshift(
                $result,
                array(
                    0 => null,
                    1 => $request->point_name[0],
                ),
            );

            array_unshift(
                $result,
                array(
                    0 => null,
                    1 => $request->item_name,
                ),
            );
            // データ取得 end

            // 存在チェック
            if (!file_exists($templatePath)) {
                throw new \Exception("テンプレートファイルが存在しません。");
            }

            // テンプレート読み込み
            $reader = new XlsxReader();
            $reader->setIncludeCharts(true);
            $spreadsheet = $reader->load($templatePath);
            $sheet = $spreadsheet->getActiveSheet();


            // データ設定
            $sheet->fromArray(
                $result,
                NULL,
                'A1'
            );

            $chartSheet = $spreadsheet->getSheet(1);

            // データ範囲定義
            $dataSeriesLabels = [
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_STRING,
                    'データ!$B$2',
                    null,
                    1
                ), // 凡例
            ];
            $xAxisTickValues = [
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_STRING,
                    'データ!$A$3:$A$' . (string)count($result),
                    null,
                    5
                ), // X軸ラベル（A列）
            ];
            $dataSeriesValues = [
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_NUMBER,
                    'データ!$B$3:$B$' . (string)count($result),
                    null,
                    5
                ),
            ];

            // データ系列作成
            $series = new DataSeries(
                DataSeries::TYPE_LINECHART,
                DataSeries::GROUPING_STANDARD,
                range(0, count($dataSeriesValues) - 1),
                $dataSeriesLabels,
                $xAxisTickValues,
                $dataSeriesValues
            );

            // プロットエリア
            $plotArea = new PlotArea(null, [$series]);

            // 凡例：右上（重ねるように）
            $legend = new Legend(Legend::POSITION_TOPRIGHT, null, true);

            // Y軸ラベルをB2の値から取得
            $yAxisText = $sheet->getCell('B1')->getValue();
            $yAxisLabel = new Title($yAxisText);

            // チャート作成（タイトルなし）
            $chart = new Chart(
                'line chart',
                new Title(''),  // グラフタイトル 何故かnullが効かないので、new Title('')で空文字設定
                $legend,  // 凡例
                $plotArea,  // 本体
                true,
                0,
                null,        // 横軸ラベルはなし
                $yAxisLabel, // 縦軸ラベル
                null,   // xAxis
                null,   // yAxis
                new GridLines(),  // majorGridlines
                null,   // minorGridlines
            );

            // グラフ配置
            $chart->setTopLeftPosition('A1');
            $chart->setBottomRightPosition('Q40');

            // チャートをグラフシートに追加
            $chartSheet->addChart($chart);

            $spreadsheet->setActiveSheetIndexByName('グラフ');

            // ファイル書込み
            $newFile = new XlsxWriter($spreadsheet);
            $newFile->setIncludeCharts(true);

            // ファイル一時保存
            $tempDir = sys_get_temp_dir();
            $savePath = $tempDir . $this->saveFileName;
            $newFile->save($savePath);

            return $savePath;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }


    /**
     * Excel取込画面 テンプレート出力処理
     */
    public function exportImportTemplate($fetchInputItems, $fetchInputPoints, $inputDataList, $selectItemList)
    {

        try {
            $spreadsheet = new Spreadsheet();
            $mainSheet = $spreadsheet->getActiveSheet(0);
            $mainSheet->setTitle('入力');
            $optionsSheet = $spreadsheet->createSheet();
            $optionsSheet->setTitle('選択肢');

            // 入力データ
            $excel_data = array();

            // startCol列目～endCol列目まで記載
            $startCol = Coordinate::stringFromColumnIndex(2);
            $endCol = Coordinate::stringFromColumnIndex(count($fetchInputPoints) + 1);

            // 採水地点行
            $pointList = [];
            $pointList[] = null;
            foreach ($fetchInputPoints as $key => $row) {
                $pointList[] = $row->point_name;
            }
            array_push($excel_data, $pointList);

            // 項目列
            $selectRowIndex = 1;
            foreach ($fetchInputItems as $rowKey => $row) {
                $rowData = array();
                $rowData[] = $row->item_name;
                foreach ($fetchInputPoints as $columnKey => $column) {
                    if (isset($inputDataList[$column->point_no]) && isset($inputDataList[$column->point_no][$row->item_no])) {
                        $rowData[] = $inputDataList[$column->point_no][$row->item_no];
                    } else {
                        $rowData[] = null;
                    }
                    // セレクトボックス設定
                    if (isset($selectItemList[$row->item_no])) {
                        $validation = $this->createBaseValidation();
                        $opColNo = Coordinate::stringFromColumnIndex(count($selectItemList[$row->item_no]));
                        $validation->setFormula1('=選択肢!$A$' . (string)$selectRowIndex . ':$' . $opColNo . '$' . (string)$selectRowIndex);
                        $colNo = Coordinate::stringFromColumnIndex((int)$columnKey + 2);
                        $rowNo = (int)$rowKey + 2;
                        $cell = (string)$colNo . (string)$rowNo;
                        $mainSheet->getCell($cell)->setDataValidation($validation);
                    }
                }
                if (isset($selectItemList[$row->item_no])) {
                    $optionsSheet->fromArray(
                        $selectItemList[$row->item_no],
                        NULL,
                        'A' . (string)$selectRowIndex
                    );
                    $selectRowIndex++;
                }
                $excel_data[] = $rowData;
            }

            // データ設定
            $mainSheet->fromArray(
                $excel_data,
                NULL,
                'A1'
            );

            // 項目列 列幅の自動設定
            for ($col = 1; $col <= count($fetchInputPoints) + 1; $col++) {
                $colLetter = Coordinate::stringFromColumnIndex($col);
                $mainSheet->getColumnDimension($colLetter)->setAutoSize(true);
            }

            // 項目列 罫線 格子
            $highestRow = $mainSheet->getHighestRow();
            $range = "A1:A{$highestRow}";
            $styleArray = [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FF000000'],
                    ],
                ],
            ];
            $mainSheet->getStyle($range)->applyFromArray($styleArray);

            // 1行目 格子
            $range = "{$startCol}1:{$endCol}1";

            $styleArray = [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FF000000'],
                    ],
                ],
            ];
            $mainSheet->getStyle($range)->applyFromArray($styleArray);

            // 書式設定を文字列に
            $mainSheet->getStyle("A1:{$endCol}{$highestRow}")->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_TEXT);

            // B2(入力項目の最初)にカーソルを合わせる
            $mainSheet->setSelectedCell('B2');

            // 選択肢シートを非表示
            $optionsSheet->setSheetState(Worksheet::SHEETSTATE_HIDDEN);

            // ファイル書込み
            $newFile = new XlsxWriter($spreadsheet);

            // ファイル一時保存
            $tempDir = sys_get_temp_dir();
            $savePath = $tempDir . $this->saveFileName;
            $newFile->save($savePath);

            return $savePath;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }


    /**
     * Excel取込画面 テンプレート出力処理
     */
    public function exportNouyaku($noudoItems, $fetchInputPoints, $noudoDataList, $selectItemList, $sihyoutiItems, $sihyoutiDataList)
    {
        try {
            $spreadsheet = new Spreadsheet();
            $noudoSheet = $spreadsheet->getActiveSheet(0);
            $noudoSheet->setTitle('濃度');
            $sihyoutiSheet = $spreadsheet->createSheet();
            $sihyoutiSheet->setTitle('指標値');

            $optionsSheet = $spreadsheet->createSheet();
            $optionsSheet->setTitle('選択肢');

            // 入力データ
            $noudoExcelData = array();
            $sihyoutiExcelData = array();

            // startCol列目～endCol列目まで記載
            $startCol = Coordinate::stringFromColumnIndex(2);
            $endCol = Coordinate::stringFromColumnIndex(count($fetchInputPoints) + 1);

            // 採水地点行
            $pointList = [];
            $pointList[] = null;
            foreach ($fetchInputPoints as $key => $row) {
                $pointList[] = $row->point_name;
            }
            array_push($noudoExcelData, $pointList);
            array_push($sihyoutiExcelData, $pointList);

            // 項目列
            $selectRowIndex = 1;
            foreach ($noudoItems as $rowKey => $row) {
                $rowData = array();
                $rowData[] = $row->item_name;
                foreach ($fetchInputPoints as $columnKey => $column) {
                    if (isset($noudoDataList[$column->point_no]) && isset($noudoDataList[$column->point_no][$row->item_no])) {
                        $rowData[] = $noudoDataList[$column->point_no][$row->item_no];
                    } else {
                        $rowData[] = null;
                    }
                    // セレクトボックス設定
                    if (isset($selectItemList[$row->item_no])) {
                        $validation = $this->createBaseValidation();
                        $opColNo = Coordinate::stringFromColumnIndex(count($selectItemList[$row->item_no]));
                        $validation->setFormula1('=選択肢!$A$' . (string)$selectRowIndex . ':$' . $opColNo . '$' . (string)$selectRowIndex);
                        $colNo = Coordinate::stringFromColumnIndex((int)$columnKey + 2);
                        $rowNo = (int)$rowKey + 2;
                        $cell = (string)$colNo . (string)$rowNo;
                        $noudoSheet->getCell($cell)->setDataValidation($validation);
                    }
                }
                if (isset($selectItemList[$row->item_no])) {
                    $optionsSheet->fromArray(
                        $selectItemList[$row->item_no],
                        NULL,
                        'A' . (string)$selectRowIndex
                    );
                    $selectRowIndex++;
                }
                $noudoExcelData[] = $rowData;
            }

            $selectRowIndex = 1;
            foreach ($sihyoutiItems as $rowKey => $row) {
                $rowData = array();
                $rowData[] = $row->item_name;
                foreach ($fetchInputPoints as $columnKey => $column) {
                    if (isset($sihyoutiDataList[$column->point_no]) && isset($sihyoutiDataList[$column->point_no][$row->item_no])) {
                        $rowData[] = $sihyoutiDataList[$column->point_no][$row->item_no];
                    }
                }
                $sihyoutiExcelData[] = $rowData;
            }

            // データ設定
            $noudoSheet->fromArray(
                $noudoExcelData,
                NULL,
                'A1'
            );
            // データ設定
            $sihyoutiSheet->fromArray(
                $sihyoutiExcelData,
                NULL,
                'A1'
            );

            // 項目列 列幅の自動設定
            for ($col = 1; $col <= count($fetchInputPoints) + 1; $col++) {
                $colLetter = Coordinate::stringFromColumnIndex($col);
                $noudoSheet->getColumnDimension($colLetter)->setAutoSize(true);
                $sihyoutiSheet->getColumnDimension($colLetter)->setAutoSize(true);
            }

            // 項目列 罫線 格子
            $highestRow = $noudoSheet->getHighestRow();
            $range = "A1:A{$highestRow}";
            $styleArray = [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FF000000'],
                    ],
                ],
            ];
            $noudoSheet->getStyle($range)->applyFromArray($styleArray);
            $sihyoutiSheet->getStyle($range)->applyFromArray($styleArray);

            // 1行目 格子
            $range = "{$startCol}1:{$endCol}1";

            $styleArray = [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FF000000'],
                    ],
                ],
            ];
            $noudoSheet->getStyle($range)->applyFromArray($styleArray);
            $sihyoutiSheet->getStyle($range)->applyFromArray($styleArray);

            // 書式設定を文字列に
            $noudoSheet->getStyle("A1:{$endCol}{$highestRow}")->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_TEXT);
            $sihyoutiSheet->getStyle("A1:{$endCol}{$highestRow}")->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_TEXT);

            // B2(入力項目の最初)にカーソルを合わせる
            $noudoSheet->setSelectedCell('B2');
            $sihyoutiSheet->setSelectedCell('B2');

            // 選択肢シートを非表示
            $optionsSheet->setSheetState(Worksheet::SHEETSTATE_HIDDEN);

            // ファイル書込み
            $newFile = new XlsxWriter($spreadsheet);

            // ファイル一時保存
            $tempDir = sys_get_temp_dir();
            $savePath = $tempDir . $this->saveFileName;
            $newFile->save($savePath);

            return $savePath;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /**
     * テンプレートファイル セレクトボックス生成時設定
     */
    private function createBaseValidation(): DataValidation
    {
        $validation = new DataValidation();
        $validation->setType(DataValidation::TYPE_LIST);
        $validation->setErrorStyle(DataValidation::STYLE_STOP);
        $validation->setAllowBlank(false);
        $validation->setShowDropDown(true);
        $validation->setShowInputMessage(true);
        $validation->setShowErrorMessage(true);
        $validation->setErrorTitle('入力エラー');
        $validation->setError('リストから選択してください。');
        return $validation;
    }

    /**
     * Excelファイル読込
     */
    public function fileImport($request, $itemList, $pointList, $maskList, $config)
    {
        $errorLog = array();
        $result = array();
        try {
            $reader = new XlsxReader();
            $spreadsheet = $reader->load($request->import_file);
            $sheet = null;
            $addtionalSheet = null; // 追加読み込みシート 農薬でのみ使用

            // 取得先シート名選定
            $sheetTitle = "";
            if($config !== false && $config !== array() && property_exists($config,'sheet_title')){
                // 入力画面構成より、シート名を取得
                $sheetTitle = $config->sheet_title;
            }
            
            // シート名一覧
            $sheetTitleList = $spreadsheet->getSheetNames();
            if (array_search($sheetTitle,$sheetTitleList) !== false){
                $sheet = $spreadsheet->getSheetByName($sheetTitle);
            } else if (array_search('入力',$sheetTitleList) !== false){
                $sheet = $spreadsheet->getSheetByName('入力');
            } else if (array_search('濃度',$sheetTitleList) !== false && array_search('指標値',$sheetTitleList) !== false){
                $sheet = $spreadsheet->getSheetByName('濃度');
                $addtionalSheet = $spreadsheet->getSheetByName('指標値');
            }
            $lastRow = $sheet->getHighestRow();
            $lastRow = count($itemList) + 1;
            $lastColumnLetter = $sheet->getHighestColumn();
            $lastColIndex = Coordinate::columnIndexFromString($lastColumnLetter);
            $lastColumnLetter = Coordinate::stringFromColumnIndex(count($pointList) + 1);

            // 作成日時を取得
            $create_date = '';
            $created = $spreadsheet->getProperties()->getCreated();
            if (is_int($created)) {
                $dt = (new \DateTime('Asia/Tokyo'))->setTimestamp($created);
                // \Log::info('ファイル作成日時：'.$dt->format('Y-m-d h:m:s'));
                $create_date = $dt->format('Y-m-d H:i:s');
            } else {
                Log::info('作成日時は設定されていません');
            }

            $range = $sheet->rangeToArray("A1:" . $lastColumnLetter . $lastRow, null, true, true, false);
            $this->loadExcelData($result, $errorLog, $range, $itemList, $pointList, $maskList);

            // 追加シートがあればそちらも読込処理を実施
            if ($addtionalSheet !== null) {
                $addtionalArray = $addtionalSheet->rangeToArray("A1:" . $lastColumnLetter . $lastRow, null, true, true, false);
                $this->loadExcelData($result, $errorLog, $addtionalArray, $itemList, $pointList, $maskList);
            }

            if (count($errorLog) > 0) {
                return $errorLog;
            }
            return array(
                'import_data'   =>  $result,
                'create_date'   =>  $create_date,
            );
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
        }
        return count($errorLog) > 0 ? $errorLog : false;
    }

    /** 取込処理用にExcelの内容を振り分け エラーチェックも実施 */
    private function loadExcelData(&$result, &$errorLog, $range, $itemList, $pointList, $maskList)
    {
        foreach ($range as $rowKey => $rowData) {
            $rowIndex = $rowKey + 1;
            if ($rowKey == 0) {
                continue;
            } else {
                $itemName = $rowData[0];
                if ($itemName == '') {
                    continue;
                }
                $itemNo = $itemList[$itemName]['item_no'];
                $cFlg = $itemList[$itemName]['flg'];
                $itemType = $itemList[$itemName]['type'];
                $rowValue[$itemNo] = array(
                    'value' => '',
                    'flg'   => $cFlg,
                    'name'  => $itemName,
                );
            }
            foreach ($rowData as $colKey => $colData) {
                if ($colKey == 0) {
                    continue;
                }
                $colIndexStr = Coordinate::stringFromColumnIndex($colKey + 1);

                $colData = $colData == '' ? null : $colData;
                $pointNo = $pointList[$range[0][$colKey]];
                // マスク項目は読み込みを飛ばす
                if (isset($maskList[$pointNo][$itemNo])) {
                    continue;
                }
                // 定性データの場合
                if (isset($colData) && $rowValue[$itemNo]['flg'] == 2) {
                    // character varying(512)から外れていないか
                    if (is_string($colData) && mb_strlen($colData) > 512) {
                        $errorLog[$colIndexStr . $rowIndex] = [['WQ-0019E', '[' . $colIndexStr . $rowIndex . ']' . $range[0][$colKey] . 'の' . $range[$rowKey][0]]];
                        continue;
                    }

                    $datePattern = '/^\d{4}\/(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])$/';
                    if ($itemType == 3) {
                        try {
                            // yyyy/mm/ddでなくても、日付型に変換できれば登録可
                            $colTime = new DateTime($colData);
                            $colData = $colTime->format('Y/m/d');
                        } catch(\Exception $e) {
                            // 時刻のフォーマットがhh:mm:ss、またはhh:mm以外でないか
                            $errorLog[$colIndexStr . $rowIndex . 'dateValue'] = [['WQ-0023E', '[' . $colIndexStr . $rowIndex . ']' . $range[0][$colKey] . 'の' . $range[$rowKey][0]]];
                            Log::info($e);
                        }
                    } else if ($itemType == 4) {
                        try {
                            if (preg_match('/^\d{3,4}$/', $colData)) {
                                // 例：950 → 0950
                                $colData = str_pad($colData, 4, '0', STR_PAD_LEFT);
                            }
                            // hh:mmかhh:mm:ssでなくても、日付型に変換できれば登録可
                            $colTime = new DateTime($colData);
                            $colData = $colTime->format('H:i:s');
                        } catch(\Exception $e) {
                            // 時刻のフォーマットがhh:mm:ss、またはhh:mm以外でないか
                            $errorLog[$colIndexStr . $rowIndex] = [['WQ-0022E', '[' . $colIndexStr . $rowIndex . ']' . $range[0][$colKey] . 'の' . $range[$rowKey][0]]];
                            Log::info($e);
                        }
                    }
                } else if (isset($colData) && $cFlg == 1) {
                    // 定量データの場合 
                    $valueExplode = explode('.', (string)$colData);
                    $decValue = isset($valueExplode[1]) ? $valueExplode[1] : '0';
                    // 数値以外であった場合は異常
                    // それ以外の型異常に関してはjis丸めで対処
                    if (!is_numeric($colData)) {
                        $errorLog[$colIndexStr . $rowIndex] = [['WQ-0021E', '[' . $colIndexStr . $rowIndex . ']' . $range[0][$colKey] . 'の' . $range[$rowKey][0], '数値']];
                    } 
                }
                $rowValue[$itemNo]['value'] = $colData;
                $result[$pointNo][$itemNo] = $rowValue[$itemNo];
            }
        }
    }

    /**
     * 検査情報を登録
     * 
     */
    public function saveFileInputData($request, $inputData, $maskList)
    {
        DB::beginTransaction();
        try {

            $resultDateList = array();

            // 画面Noから検査区分CDを取得
            $kbnCd = $this->Wqm010Dao->getKbnCd($request);

            // 採水地点ごとにループ
            foreach ($inputData as $point_no => $item_data) {
                if(!array_key_exists(1,$item_data) || !isset($item_data[1]['value']) || !array_key_exists(2,$item_data) || !isset($item_data[2]['value'])) {
                    Log::info($point_no.'：登録なし');
                    continue;
                }
                $result = false;

                // 登録済みデータ (地点番号,採水年月日,採水時刻,検査区分CD)
                $getRegisteredDataList = array();
                $getRegisteredDataList = $this->Wqm010Dao->getRegisteredData($point_no, $item_data[1]['value'], $item_data[2]['value'], $kbnCd);
                $registeredDataList = [];
                foreach ($getRegisteredDataList as $registeredData) {
                    $registeredDataList[$registeredData->item_no] = array(
                        'flg'       => $registeredData->flg,
                        'c_data'    => $registeredData->c_data,
                        'q_data'    => $registeredData->q_data,
                    );
                }

                $criteriaDataList = array();
                // 基準値データ取得
                $getCriteriaDataList = array();
                $getCriteriaDataList = $this->Wqm010Dao->getCriteriaData($request->selected_menu_no, $item_data[1]['value'], $point_no);
                foreach ($getCriteriaDataList as $criteriaData) {
                    // 基準値設定
                    $criteriaDataList[$criteriaData->item_no] = array(
                        'input_low_limit'   =>  $criteriaData->input_low_limit,
                        'input_up_limit'    =>  $criteriaData->input_up_limit,
                        'valid_digits'      =>  $criteriaData->valid_digits,
                        'input_min_digits'  =>  $criteriaData->input_min_digits,
                        'output_min_disits' =>  $criteriaData->output_min_digits,
                    );
                }
                // 補正値データ取得
                $getCriteriaCorrection = array();
                $getCriteriaCorrection = $this->Wqm010Dao->getCriteriaCorrection($request->selected_menu_no, $item_data[1]['value'], $point_no);
                foreach ($getCriteriaCorrection as $correctionData) {
                    if(!array_key_exists($correctionData->item_no,$criteriaDataList)){
                        continue;
                    } else if ( 
                        array_key_exists($correctionData->item_no,$criteriaDataList) 
                        && ($correctionData->item_no == 1424 && $item_data[1424]['value'] < 0.1)
                    ){
                        // 1424:上水後塩素注入率のみ
                        // 値が0.1以下であれば基準値を変更 0.1以上なら変更無し
                        continue;
                    }
                    if($correctionData->item_no == 2490) {
                        // 2490:濁度
                        // 下限値が0.1倍
                        $criteriaDataList[$correctionData->item_no]['input_low_limit'] = 
                            $criteriaDataList[$correctionData->item_no]['input_low_limit'] * 0.1;
                        $criteriaDataList[$correctionData->item_no]['valid_digits'] = $correctionData->valid_digits;
                        $criteriaDataList[$correctionData->item_no]['input_min_digits'] = $correctionData->input_min_digits;
                        $criteriaDataList[$correctionData->item_no]['output_min_disits'] = $correctionData->output_min_digits;
                    } else {
                        // 基準値設定
                        $criteriaDataList[$correctionData->item_no]['valid_digits'] = $correctionData->valid_digits;
                        $criteriaDataList[$correctionData->item_no]['input_min_digits'] = $correctionData->input_min_digits;
                        $criteriaDataList[$correctionData->item_no]['output_min_disits'] = $correctionData->output_min_digits;
                    }
                }

                // 項目ごとにループ
                foreach ($item_data as $item_no => $fileItem) {

                    // マスク状態
                    if (isset($maskList[$point_no][$item_no])) {
                        continue;
                    }

                    // 項目番号1157
                    if ($item_no === 1157) {
                        continue;
                    }

                    // 総トリハロメタンの場合、他4項目の値を合算して登録を行う。
                    if ($item_no === 2250 && array_key_exists(2250,$criteriaDataList)) {
                        $THM_keys = [2210,2230,2270,2280];
                        $THM_Items = [];
                        $minDigit = $criteriaDataList[$item_no]['input_min_digits'];
                        foreach ($THM_keys as $key) {
                            $THM_Items[$key] =  $item_data[$key]['value'];
                            if(!isset($THM_Items[$key])){
                                // 値のない項目が一つでもあれば計算しない。
                                continue;
                            }
                            $this->configureFixedQuantityData(
                                $criteriaDataList[$key]['input_low_limit'],
                                $criteriaDataList[$key]['valid_digits'],
                                $criteriaDataList[$key]['input_min_digits'],
                                $THM_Items[$key]
                            );
                            if($THM_Items[$key] !== 0){
                                // 小数点第〇位の〇の値が一番小さいものに合わせる。
                                $itemDigits = mb_strlen(explode('.',(string)$THM_Items[$key])[1]);
                                $minDigit = $minDigit * -1 < $itemDigits ? $minDigit : ($itemDigits * -1);
                            }
                        };

                        $THM = array_sum($THM_Items);
                        $this->configureFixedQuantityData(
                            $criteriaDataList[$item_no]['input_low_limit'],
                            $criteriaDataList[$item_no]['valid_digits'],
                            $minDigit,
                            $THM
                        );
                        $fileItem['value'] = $THM;
                    } else if ($fileItem['flg'] == 1 && isset($fileItem['value']) && array_key_exists($item_no,$criteriaDataList)) {
                        // JIS丸め処理
                        $this->configureFixedQuantityData(
                            $criteriaDataList[$item_no]['input_low_limit'],
                            $criteriaDataList[$item_no]['valid_digits'],
                            $criteriaDataList[$item_no]['input_min_digits'],
                            $fileItem['value']
                        );
                    }

                    // 登録済みの値あり
                    if (isset($registeredDataList[$item_no])) {
                        $registeredDataValue = null;
                        $registeredDataValue = $registeredDataList[$item_no]['flg'] === 2 ? $registeredDataList[$item_no]['q_data'] : $registeredDataList[$item_no]['c_data'];

                        // 入力内容一致 && 採水時刻に変更無し
                        if ($fileItem['value'] == $registeredDataValue && $item_data[2]['value'] == $registeredDataList[2]['q_data']) {
                            continue;
                        }

                        // ファイルデータ無し && 登録済みデータあり
                        if (!isset($fileItem['value']) && isset($registeredDataValue)) {
                            // DBに登録されている処理中セルのレコードを削除
                            Log::info('deleteInputData');
                            $deleteInputData = $this->Wqm010Dao->deleteInputData($point_no, $item_no, $item_data[1]['value'], $kbnCd);

                            // エラー発生
                            if (!$deleteInputData) {
                                DB::rollback();
                                return false;
                            }
                            $result = true;
                        }

                        // ファイルデータあり && 登録済みデータあり
                        if (isset($fileItem['value']) && isset($registeredDataValue)) {
                            $updateInputData = $this->Wqm010Dao->updateInputData($point_no, $item_no, $item_data[1]['value'], $item_data[2]['value'], $kbnCd, $registeredDataList[$item_no]['flg'], $fileItem['value']);

                            // エラー発生
                            if (!$updateInputData) {
                                DB::rollback();
                                return false;
                            }
                            $result = true;
                        }
                    } else {
                        // ファイルデータが未入力 && 登録済みデータも未入力
                        if (!isset($fileItem['value'])) {
                            continue;
                        } else {
                            // ファイルデータあり && 登録済みデータ無し

                            // 定量データと定性データ振り分け
                            $constant_data = ($fileItem['flg'] == 1) ? $fileItem['value'] : null;
                            $qualitative_data = ($fileItem['flg'] == 2) ? $fileItem['value'] : null;

                            // 新規登録
                            $saveNewInputData = $this->Wqm010Dao->saveNewInputData($point_no, $item_no, $item_data[1]['value'], $item_data[2]['value'], $kbnCd, $fileItem['flg'], $constant_data, $qualitative_data);
                            // \Log::info($fileItem['name'].'：'.' '.$fileItem['value']);
                            // \Log::info($saveNewInputData ? '登録成功' : '登録失敗');

                            // エラー発生
                            if (!$saveNewInputData) {
                                DB::rollback();
                                return false;
                            }
                            $result = true;
                        }
                    }
                }
                // 処理が実行されたなら
                if ($result) {
                    $resultDateList[] = $item_data[1]['value'];
                }
            }

            DB::commit();

            // Log::info(DB::getQueryLog());
            // \Log::info($inputData);
            // return $inputData;
            return (array)$resultDateList;
        } catch (\Throwable $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
            Log::info('エラー発生');

            return false;
        }
    }

    /**
     * ファイル取込時排他チェック
     */
    public function fileImportHaitaCheck($menu, $date)
    {
        return $this->Wqm010Dao->fileImportHaitaCheck($menu, $date);
    }


    /**
     * 定量データ加工処理
     *
     * @param string $lowerLimit
     * @param string $validDigits
     * @param string $inputMinDigits
     * @param string &$data 定量データ
     * @return void
     */
    protected function configureFixedQuantityData(
        ?string $lowerLimit,
        ?string $validDigits,
        ?string $inputMinDigits,
        string &$data,
    ): void {

        // 定量データが0の場合、補正を行う。
        if ($data === '0.00000000') {
            $data = '0.000000001';
        }

        // 帳票下限値がNULLの場合、下限値を補正する。
        if (is_null($lowerLimit) || $lowerLimit === '') {
            $lowerLimit = '-100';
        }

        // 定量データのJIS丸めを行う。
        $tempData = '';
        // 定量データと帳票下限値を比較する。
        if (bccomp($data, $lowerLimit) === -1 && (is_null($inputMinDigits) || is_null($validDigits))) {
            $data = 0;
        } else if (is_null($inputMinDigits) || is_null($validDigits)) {
            // 有効桁か入力最小桁がないとjis丸めできないので、そのまま
            $data = $data;
        } else if (bccomp($data, $lowerLimit) === -1) {
            // 帳票下限値未満であれば、0
            $data = 0;
        } else {
            $this->jisRound($data, $validDigits, $inputMinDigits, $tempData);
            $data = $tempData;
        }

        return;
    }
    
    /**
     * JIS丸め処理
     *
     * @param string $inData 丸め対象値
     * @param int $validDigit 有効桁数
     * @param int $minDigit 最小入力桁数
     * @param string &$sOutData 丸め処理結果
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

        // SQLでもjis丸めされるので、調整
        $sInData = number_format($sInData, 8, '.', '');

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
            $left  = substr($text, 0, $dotIndex);
            $pos = $left === '0' ? strpos($sInData, $matchStr[0]) - 1 : strpos($sInData, $matchStr[0]);
            $digitA = $pos + $validDigit;
        } else {
            $digitA = $validDigit;
        }

        // 桁数B (整数部長さ－最小入力桁)
        $digitB = $integerLen - $minDigit;

        // 出力桁数 & モード (1:切捨て, 2:切上)
        if ($digitA <= $digitB) {
            $inputDigits = $digitA;
            $mode         = 1;
        } else {
            $inputDigits = $digitB;
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
        $incStr = str_repeat('0', max(0, $inputDigits - 1)) . '1';
        if (strlen($roundStr) < $inputDigits) {
            $pad       = str_repeat('0', $inputDigits - strlen($roundStr));
            $incStr   .= $pad;
            $roundStr .= $pad;
        }

        // 基準桁の次の文字を取得して四捨五入判定
        $nextChar = $inputDigits < strlen($roundStr) ? $roundStr[$inputDigits] : '';
        if (in_array($nextChar, ['0', '1', '2', '3', '4'], true)) {
            $rndMode = 1;
        } elseif (in_array($nextChar, ['6', '7', '8', '9'], true)) {
            $rndMode = 2;
        } elseif ($nextChar === '5') {
            $rest = substr($roundStr, $inputDigits + 1);
            if ($rest === '' || bccomp($rest, '0', 0) === 0) {
                // 偶数丸め判定
                $prev = $roundStr[$inputDigits - 1];
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
                $roundStr = substr($roundStr, 0, $inputDigits);
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
                $roundStr = substr($roundStr, 0, $inputDigits);
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
                if (strpos($roundStr, '.') === false && $inputDigits > $integerLen) {
                    $roundStr .= '.' . str_repeat('0', $inputDigits - $integerLen);
                }
                break;
        }

        // 最終フォーマット
        $decPlaces = $inputDigits - $integerLen;
        if ($decPlaces > 0) {
            $roundStr = number_format($roundStr, $decPlaces, '.', '');
        } else {
            $roundStr = number_format($roundStr, 0, '.', '');
        }

        // 符号再付与
        $sOutData = ((int)$sign < 0 && $roundStr != 0)
            ? '-' . $roundStr
            : $roundStr;
    }

    public function getInputDspConfig($menu_no) {
        return $this->Wqm010Dao->getInputDspConfig($menu_no);
    }

    /**
     * 画面番号からメニュー番号を取得
     */
    public function getMenuNo($dsp_no) {
        return $this->Wqm010Dao->getMenuNo($dsp_no);
    }

    /**
     * 画面番号から
     */
    public function getConnect($dsp_no) {
        return $this->Wqm010Dao->getConnect($dsp_no);
    }
}
