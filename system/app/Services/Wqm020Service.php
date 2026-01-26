<?php

namespace App\Services;

use App\Dao\Wqm020Dao;
use Illuminate\Support\Facades\Log;
use DateTime;

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
 * 報告書出力サービス
 *
 * @author
 */
class Wqm020Service
{
    // 報告書出力DAO
    private $Wqm020Dao;

    private $templateFileName = 'trend_template.xlsx';
    private $saveFileName     = '/save_trend.xlsx';

    /**
     * コンストラクタ
     * 
     */
    public function __construct()
    {
        $this->Wqm020Dao = new Wqm020Dao();
    }

    /**
     * 検査区分コード
     */
    public function getKbn(){
        return $this->Wqm020Dao->getKbn();
    }

    /**
     * 検査区分コード
     */
    public function getSisetu($request = null){
        return $this->Wqm020Dao->getSisetu($request);
    }

    /**
     * 検査区分コード
     */
    public function getProcess($request = null){
        return $this->Wqm020Dao->getProcess($request);
    }

    /**
     * 検査区分コード
     */
    public function getCat(){
        return $this->Wqm020Dao->getCat();
    }

    /**
     * 検査区分コード
     */
    public function getPoint($request = null){
        return $this->Wqm020Dao->getPoint($request);
    }

    /**
     * 検査区分コード
     */
    public function getItem($request = null){
        return $this->Wqm020Dao->getItem($request);
    }
    
    /**
     * 出力数確認
     * 5万件以上はエラー
     */
    public function getCountSearchList($request,$limitFlg = true)
    {
        return $this->Wqm020Dao->getCountSearchList($request, $limitFlg);
    }

    /**
     * 出力一覧 取得
     * 
     */
    public function getList($request,$limitFlg = true)
    {
        return $this->Wqm020Dao->getList($request, $limitFlg);
    }
    

    /**
     * 出力一覧 取得
     * 
     */
    public function getCalcState($request)
    {
        return $this->Wqm020Dao->getCalcState($request);
    }


    /**
     * Excel取込画面 テンプレート出力処理
     */
    public function exportSearchData($dataList)
    {

        try{
            $spreadsheet = new Spreadsheet();
            $mainSheet = $spreadsheet->getActiveSheet(0);
            $mainSheet->setTitle('入力');

            // 入力データ
            $excel_data = array();

            // startCol列目～endCol列目まで記載
            $startCol = Coordinate::stringFromColumnIndex(2);
            $endCol = Coordinate::stringFromColumnIndex(count($dataList)+1);

            array_push($excel_data,
                array(
                    0 => '採水年月日',
                    1 => '採水時刻',
                    2 => '採水地点',
                    3 => '検査項目',
                    4 => '検査区分',
                    5 => '定量データ',
                    6 => '定性データ',
                )
            );

            // 採水地点行
            foreach($dataList as $key => $row){
                array_push($excel_data,
                    array(
                        0 => $row->date,
                        1 => $row->time,
                        2 => $row->point,
                        3 => $row->item,
                        4 => $row->kbn,
                        5 => $row->c_data,
                        6 => $row->q_data,
                    )
                );
            }

            // データ設定
            $mainSheet->fromArray(
                $excel_data,
                NULL,
                'A1'
            );

            // 項目列 列幅の自動設定
            for ($col = 0; $col <= 7; $col++) {
                $colLetter = Coordinate::stringFromColumnIndex($col);
                $mainSheet->getColumnDimension($colLetter)->setAutoSize(true);
            }

            // 1行目 格子
            $range = "A1:G1";;

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
            $highestRow = $mainSheet->getHighestRow();
            $mainSheet->getStyle("A1:G{$highestRow}")->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_TEXT);

            // B2(入力項目の最初)にカーソルを合わせる
            $mainSheet->setSelectedCell('B2');

            // ファイル書込み
            $newFile = new XlsxWriter($spreadsheet);

            // ファイル一時保存
            $tempDir = sys_get_temp_dir();
            $savePath = $tempDir . $this->saveFileName;
            $newFile->save($savePath);

            return $savePath;

        } catch (\Exception $e) {
            \Log::error($e);

        }
        return false;
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
        $trendData = $this->Wqm020Dao->getTrendData($request);

        if($trendData !== false && count($trendData) !== 0){
            $date = $trendData[$resultIndex]->date;
            $result[$resultIndex]['XAxisName'] = $date;
            foreach($trendData as $row){
                if($row->date !== $date){
                    $date = $row->date;
                    $resultIndex++;
                    $result[$resultIndex]['XAxisName'] = $date;
                }
                $result[$resultIndex][$row->point_name] = (double)$row->value;
            }
        }

        return $result;
    }

    public function exportTrend($request)
    {
        // テンプレートファイルのパス
        $templatePath = config('const.TrendTempPath', '/var/www/suishitsu/resources/trendTemplate/'). $this->templateFileName;

        try{
            // データ取得 start
            $trendData = array();
            $trendData = $this->Wqm020Dao->getTrendData($request);
            if($trendData === false || count($trendData) === 0){
              return false;
            }

            // データ設定
            $excelPointList[0] = null;
            $dateValueDefault[0] = null; 
            foreach($request->point_no as $pKey => $point){
                // point_noとpoint_nameは同じ順で入っているはず
                $excelPointList[$point] = $request->point_name[$pKey];
                $dateValueDefault[$point] = null;
            };

            $result = array();
            $resultIndex = 0;
            $dateValue = $dateValueDefault;
            $dateValue[0] = $trendData[0]->date;
            $resultIndex = 0;

            foreach($trendData as $key => $row){
                // \Log::info((array)$row);
              $value = (double)$row->value;
              if($dateValue[0] !== $row->date){
                $result[$resultIndex] = $dateValue;
                $resultIndex++;
                $dateValue = $dateValueDefault;
                $dateValue[0] = $row->date;
              }
              $dateValue[(int)$row->point_no] = (string)$value;
            }
            $result[$resultIndex] = $dateValue;

            // 採水地点設定　採水地点ごとに設定
            $excelPointList[0] = null;
            foreach($request->point_no as $pKey => $point){
                // point_noとpoint_nameは同じ順で入っているはず
                $excelPointList[$point] = $request->point_name[$pKey];
            };
            array_unshift($result, $excelPointList);
            
            // 項目設定　これは一つでいい
            array_unshift($result, 
              array(
                0 => null,
                (int)$request->point_no[0] => $request->item_name,
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
            $columnIndex = 2;
            $dataSeriesLabels = array();
            $dataSeriesValues = array();
            foreach($request->point_no as $point){
                $columnStr = Coordinate::stringFromColumnIndex($columnIndex);
                // 凡例
                array_push($dataSeriesLabels, new DataSeriesValues(
                        DataSeriesValues::DATASERIES_TYPE_STRING, 
                        'データ!$'.$columnStr.'$2', 
                        null, 
                        1
                    ));
                
                // グラフデータ
                array_push($dataSeriesValues, new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_NUMBER, 
                    'データ!$'.$columnStr.'$3:$'.$columnStr.'$'.(string)count($result), 
                    null, 
                    5
                    ),);

                $columnIndex++;
            };
            
            $xAxisTickValues = [
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_STRING, 
                    'データ!$A$3:$A$'.(string)count($result), 
                    null, 
                    5
                  ), // X軸ラベル（A列）
            ];

            // データ系列作成
            $series = new DataSeries(
                DataSeries::TYPE_LINECHART,
                DataSeries::GROUPING_STANDARD,
                range(0, count($dataSeriesValues) - 1),
                $dataSeriesLabels,
                $xAxisTickValues,
                $dataSeriesValues,
            );

            // プロットエリア
            $plotArea = new PlotArea(null, [$series]);

            // 凡例：右上（重ねるように）
            $legend = new Legend(Legend::POSITION_TOPRIGHT, null, true);

            // Y軸ラベルをB1の値から取得
            $yAxisText = $sheet->getCell('B1')->getValue();
            $yAxisLabel = new Title($yAxisText);

            // チャート作成（タイトルなし）
            $chart = new Chart(
                'line chart',
                new Title(''),  // グラフタイトル 何故かnullが効かないので、new Title('')で空文字設定
                $legend,  // 凡例
                $plotArea,  // 本体
                true,
                DataSeries::EMPTY_AS_SPAN, // nullでも途切れないように
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
            \Log::error($e);
        }
        return false;
    }
}