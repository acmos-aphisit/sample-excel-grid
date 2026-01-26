<?php

namespace App\Services;

use App\Dao\CommonDao;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx as XlsxReader;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\NamedRange;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Borders;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Carbon\Carbon;

/**
 * 汎用サービス
 *
 * @author
 */
class CommonService
{
    //汎用 DAO
    private $commonDao;

    /**
     * コンストラクタ
     * 
     */
    public function __construct()
    {
        $this->commonDao = new CommonDao();
    }

    /**
     * 
     */
    public function migrateCsvToDb($request)
    {
        $migrateCsvToDb = $this->commonDao->migrateCsvToDb($request);

        // ユーザパスワードを暗号化に変換
        if ($migrateCsvToDb && ($request->table_name == 'm_user' || $request->table_name == 'all_table')) {
            $migrateHashingPassword = $this->commonDao->migrateHashingPassword();

            return $migrateHashingPassword;
        }

        return $migrateCsvToDb;
    }

    /**
     * 検査情報登録画面のメニューを取得
     * 
     */
    public function getInputMenu()
    {
        $getInputMenu = $this->commonDao->getInputMenu();

        return $getInputMenu;
    }

    /**
     * 検査情報登録画面のメニューを取得
     * 
     */
    public function getReportMenu($affiliation_section_no, $security_level)
    {
        $getReportMenu = $this->commonDao->getReportMenu($affiliation_section_no, $security_level);

        return $getReportMenu;
    }

    /**
     * 検査情報登録画面のメニューを取得
     * 
     */
    public function getSelectedDspInfo($input_menu_no)
    {
        $getSelectedDspInfo = $this->commonDao->getSelectedDspInfo($input_menu_no);

        return $getSelectedDspInfo;
    }

    /**
     * 地点情報を取得
     * 
     */
    public function getPointInfo($point_no)
    {
        $getPointInfo = $this->commonDao->getPointInfo($point_no);

        return $getPointInfo;
    }

    /**
     * 所属課マスタを取得
     * 
     */
    public function getAffiliationData()
    {
        $getAffiliationData = $this->commonDao->getAffiliationData();

        return $getAffiliationData;
    }

    /**
     * 親ラベルをリストで取得（入力画面）
     * 
     */
    public function getParentMenuData()
    {
        $getParentMenuData = $this->commonDao->getParentMenuData();

        return $getParentMenuData;
    }

    /**
     * 親ラベルをリストで取得（帳票出力）
     * 
     */
    public function getParentMenuReportData()
    {
        $getParentMenuReportData = $this->commonDao->getParentMenuReportData();

        return $getParentMenuReportData;
    }

    /**
     * 参照画面をリストで取得
     * 
     */
    public function getRefMenuData()
    {
        $getRefMenuData = $this->commonDao->getRefMenuData();

        return $getRefMenuData;
    }

    /**
     * 参照報告書をリストで取得
     * 
     */
    public function getRefRptMenuData()
    {
        $getParentMenuReportData = $this->commonDao->getParentMenuReportData(0);

        return $getParentMenuReportData;
    }

    /**
     * 参照報告書をリストで取得
     * 
     */
    public function getRefRptMenuListData()
    {
        $getRefRptMenuListData = $this->commonDao->getRefRptMenuListData();

        return $getRefRptMenuListData;
    }

    /**
     * 和暦を取得
     */
    public function warekiConv($date, $en_flg = false, $format = null, $excludeZero = true)
    {
        // 日付が空ならnullを返却
        if (empty($date)) {
            return null;
        }

        // $dateが日付なら処理を実施
        if (preg_match('/^[1-9]{1}[0-9]{3}(\/|-)[0-9]{1,2}(\/|-)[0-9]{1,2}$/', $date)) {
            list($year, $month, $day) = preg_split('(/|-)', $date);

            if ($excludeZero) {
                // 月・日を0埋めしない
                $month = ltrim($month, '0');
                $day = ltrim($day, '0');
                $zeroMonth = str_pad($month, 2, 0, STR_PAD_LEFT);
                $zeroDay = str_pad($day, 2, 0, STR_PAD_LEFT);
                $date = str_replace(array('/', '-'), '', $year . $zeroMonth . $zeroDay);
            } else {
                // 月・日を0埋め
                $month = str_pad($month, 2, 0, STR_PAD_LEFT);
                $day = str_pad($day, 2, 0, STR_PAD_LEFT);
                $date = str_replace(array('/', '-'), '', $year . $month . $day);
            }

            $warekiList = config('const.WarekiList');

            $gengo     = '';
            $gengo_en  = '';
            $wayear    = null;

            foreach ($warekiList as $row) {
                if ($date >= $row['date']) {
                    $gengo = $row['gengo'];
                    $gengo_en = $row['gengo_en'];
                    $wayear = $year - $row['year'];
                    break;
                }
            }

            if ($en_flg == true) {
                if ($format === 'YYYYMM') {
                    $wadate = $gengo_en . $wayear . '/' . $month;
                } elseif ($format === 'YYYY') {
                    $wadate = $gengo_en . $wayear;
                } else {
                    $wadate = $gengo_en . $wayear . '/' . $month . '/' . $day;
                }
            } else {
                switch ($wayear) {
                    case 1:
                        if ($format === 'YYYYMM') {
                            $wadate = $gengo . '元年' . $month . '月';
                        } elseif ($format === 'YYYY') {
                            $wadate = $gengo . '元年';
                        } else {
                            $wadate = $gengo . '元年' . $month . '月' . $day . '日';
                        }

                        break;
                    default:
                        if ($format === 'YYYYMM') {
                            $wadate = $gengo . $wayear . '年' . $month . '月';
                        } elseif ($format === 'YYYY') {
                            $wadate = $gengo . $wayear . '年';
                        } else {
                            $wadate = $gengo . $wayear . '年' . $month . '月' . $day . '日';
                        }
                }
            }
            return $wadate;
        } else {
            return false;
        }
    }

    /**
     * 検査項目大分類マスタ
     * 
     */
    public function fetchItemDaiCategoryData()
    {
        $fetchItemDaiCategoryData = $this->commonDao->fetchItemDaiCategoryData();

        return $fetchItemDaiCategoryData;
    }

    /**
     * 検査項目中分類マスタ
     * 
     */
    public function fetchItemTyuCategoryData()
    {
        $fetchItemTyuCategoryData = $this->commonDao->fetchItemTyuCategoryData();

        return $fetchItemTyuCategoryData;
    }

    /**
     * 施設マスタ
     * 
     */
    public function fetchSisetuData()
    {
        $fetchSisetuData = $this->commonDao->fetchSisetuData();

        return $fetchSisetuData;
    }

    /**
     * 処理過程マスタ
     * 
     */
    public function fetchProcessData()
    {
        $fetchProcessData = $this->commonDao->fetchProcessData();

        return $fetchProcessData;
    }

    /**
     * 採水区分マスタ
     * 
     */
    public function fetchSaisuiKbnData()
    {
        $fetchSaisuiKbnData = $this->commonDao->fetchSaisuiKbnData();

        return $fetchSaisuiKbnData;
    }

    public function getCurrentTime()
    {
        $time = $this->commonDao->getCurrentTime();
        return $time;
    }

    /**
     * 動画マニュアル情報を取得
     * 
     */
    public function fetchManualVideoList()
    {
        $fetchManualVideoList = $this->commonDao->fetchManualVideoList();

        return $fetchManualVideoList;
    }
    
    /**
     * 報告書特殊項目情報 取得
     * 
     */
    public function getReportTokusyuItem($reportNo)
    {
        return $this->commonDao->getReportTokusyuItem($reportNo);
    }

    /**
     * 報告書タイプマスタ 取得
     * 
     */
    public function getReportType($report_type = null)
    {
        return $this->commonDao->getReportType($report_type);
    }

    /**
     * テンプレート自動更新
     * 
     */
    public function updateTemplateFile($targetFileList)
    {
        try {
            // パラメータで渡された報告書番号分、テンプレートファイルの更新を行う
            foreach ($targetFileList as $reportNo) {

                // 報告書構成情報 取得
                $reportConfig = $this->commonDao->getUpdateTmpReportConfig($reportNo);
                if ($reportConfig === false) {
                    throw new \Exception("報告書番号：" . $reportNo . "の報告書構成情報の取得に失敗しました。");
                }

                // 報告書地点情報 取得
                $reportPoint = $this->commonDao->getUpdateTmpReportPoint($reportNo);
                if ($reportPoint === false) {
                    throw new \Exception("報告書番号：" . $reportNo . "の報告書地点情報の取得に失敗しました。");
                }

                // 報告書項目情報 取得
                $reportItem = $this->commonDao->getUpdateTmpReportItem($reportNo);
                if ($reportItem === false) {
                    throw new \Exception("報告書番号：" . $reportNo . "の報告書項目情報の取得に失敗しました。");
                }

                // 報告書固定文言情報 取得
                $reportText = $this->commonDao->getUpdateTmpReportText($reportNo);
                if ($reportText === false) {
                    throw new \Exception("報告書番号：" . $reportNo . "の報告書固定文言情報の取得に失敗しました。");
                }

                // 報告書特殊項目情報(縦) 取得
                $reportTokusyuItemRow = $this->commonDao->getUpdateTmpReportTokusyuItem($reportNo, config('const.row_type'));
                if ($reportTokusyuItemRow === false) {
                    throw new \Exception("報告書番号：" . $reportNo . "の報告書特殊項目情報(縦)の取得に失敗しました。");
                }

                // 報告書特殊項目情報(横) 取得
                $reportTokusyuItemCol = $this->commonDao->getUpdateTmpReportTokusyuItem($reportNo, config('const.col_type'));
                if ($reportTokusyuItemCol === false) {
                    throw new \Exception("報告書番号：" . $reportNo . "の報告書特殊項目情報(横)の取得に失敗しました。");
                }

                // ベースファイルパスを取得
                $baseFilePath = config('const.BaseFilePath', '/var/www/suishitsu/resources/excel/baseFormat/');
                $filePath = $baseFilePath . $reportConfig[0]->base_file_name;

                // Excelベースファイルを開く
                $reader = new XlsxReader();
                $reader->setReadDataOnly(false);
                $spreadsheet = $reader->load($filePath);
                if ($spreadsheet->sheetNameExists('データシート') === false) {
                    throw new \Exception("ベースファイル：" . $reportConfig[0]->base_file_name . "にデータシートが存在しません。");
                }
                if ($spreadsheet->sheetNameExists('報告書シート') === false) {
                    throw new \Exception("ベースファイル：" . $reportConfig[0]->base_file_name . "に報告書シートが存在しません。");
                }

                // ------------------------------------------
                // テンプレートファイル 更新
                // ------------------------------------------
                $result = $this->autoUpdateTemplateFile(
                      $reportNo
                    , $reportConfig[0]
                    , $reportPoint
                    , $reportItem
                    , $reportTokusyuItemRow
                    , $reportTokusyuItemCol
                    , $spreadsheet
                );
                if ($result === false) {
                    throw new \Exception("報告書番号：" . $reportNo . "のテンプレートファイル更新に失敗しました。");
                }

                // ------------------------------------------
                // 独自処理 実施
                // ------------------------------------------
                foreach (config('const.dokujiShiyouReportType') as $dokujiReportType) {
                    // 独自仕様が存在するデータシートタイプの場合、対象の独自処理を実施
                    if ($dokujiReportType == $reportConfig[0]->report_type) {
                        $result = $this->dokujiReportEdit(
                              $reportNo
                            , $reportConfig[0]
                            , $reportPoint
                            , $reportItem
                            , $reportTokusyuItemRow
                            , $reportTokusyuItemCol
                            , $spreadsheet
                        );
                        if ($result === false) {
                            throw new \Exception("報告書番号：" . $reportNo . "の独自処理に失敗しました。");
                        }
                    }
                }

                // 保存処理
                $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
                $writer->save(config('const.OutputTempPath', '/var/www/suishitsu/resources/excel/outputFormat/') . $reportConfig[0]->template_file);

                // メモリ解放処理
                $spreadsheet->disconnectWorksheets();
                unset($spreadsheet);
            }

            return true;
        } catch (\Exception $e) {
            \Log::error($e->getMessage());
            \Log::error($e->getTraceAsString());

            // メモリ解放（存在する場合のみ）
            if (isset($spreadsheet)) {
                $spreadsheet->disconnectWorksheets();
                unset($spreadsheet);
            }

            return false;
        }
    }

    /**
     * テンプレートファイル 更新
     * 
     */
    public function autoUpdateTemplateFile(
          $reportNo
        , $reportConfig
        , $reportPoint
        , $reportItem
        , $reportTokusyuItemRow
        , $reportTokusyuItemCol
        , &$spreadsheet
    )
    {
        try {
            $startDataSheetRow = "";                                            // 貼り付け開始位置(縦)
            $startDataSheetCol = "";                                            // 貼り付け開始位置(横)
            $rowDataList = array();                                             // 貼り付けデータリスト(縦)
            $colDataList = array();                                             // 貼り付けデータリスト(横)
            $rowDataTokusyuList = array();                                      // 貼り付けデータリスト(特殊)(縦)
            $colDataTokusyuList = array();                                      // 貼り付けデータリスト(特殊)(横)
            $startRepotSheetRow = $reportConfig->row_start_cell_name;           // 貼り付け開始位置(縦)
            $startRepotSheetCol = $reportConfig->col_start_cell_name;           // 貼り付け開始位置(横)
            $strNoneValue = "-";                                                // 空白時の表示内容

            // ------------------------------------------
            // データシートタイプごとに下記が違うため、
            // 最初に定義する
            //   ・縦横のスタート地点
            //   ・縦方向に出力するデータ
            //   ・横方向に出力するデータ
            // ------------------------------------------

            // データシートタイプ：標準
            if ($reportConfig->data_sheet_type == 1) {
                // 縦方向と横方向のスタート地点を設定
                $startDataSheetRow = "A2";
                $startDataSheetCol = "B1";

                // 縦方向と横方向に出力するデータを格納
                $rowDataList = $reportItem;
                $colDataList = $reportPoint;
                $rowDataTokusyuList = $reportTokusyuItemRow;
                $colDataTokusyuList = $reportTokusyuItemCol;

            // データシートタイプ：単拠点
            } else if ($reportConfig->data_sheet_type == 2) {
                // 縦方向のスタート地点を設定
                $startDataSheetRow = "A2";

                // 縦方向に出力するデータを格納
                $rowDataList = $reportItem;
                $rowDataTokusyuList = $reportTokusyuItemRow;

                // 「単拠点」の場合、横方向の出力が無いため、ダミーデータを作成
                $colDataList = [
                    (object)[
                        'cell_name' => 'ダミー',
                        'item_type' => 1,
                        'unit_cell_name' => NULL,
                        'target_cell_name' => NULL,
                        'base_cell_name' => NULL,
                        'number_cell_name' => NULL,
                        'item_unit' => NULL,
                        'regulation_up_limit' => NULL,
                        'report_low_limit' => NULL,
                        'no_name' => NULL,
                        'item_no' => NULL,
                    ]
                ];

            // データシートタイプ：年報
            } else if ($reportConfig->data_sheet_type == 3) {
                // 縦方向と横方向のスタート地点を設定
                $startDataSheetRow = "A2";
                $startDataSheetCol = "B1";

                if ($reportConfig->report_type == 3 || $reportConfig->report_type == 44) {
                    // ----------------------------------------------------------------------
                    // 報告書タイプが3と44の場合のみ、項目中分類ごとにソートを行う
                    // ----------------------------------------------------------------------
                    $targetCategories = [81, 82, 83];
                    $matchedItems = [];
                    $matchedIndexes = [];

                    // 対象カテゴリの要素とそのインデックスを抽出
                    foreach ($reportItem as $index => $item) {
                        if (in_array($item->item_tyu_category_no, $targetCategories, true)) {
                            $matchedItems[] = $item;
                            $matchedIndexes[] = $index;
                        }
                    }

                    // 該当要素をitem_tyu_category_noの昇順でソート
                    usort($matchedItems, function ($a, $b) {
                        return $a->item_tyu_category_no <=> $b->item_tyu_category_no;
                    });

                    // 元の配列に戻す（該当インデックスに上書き）
                    foreach ($matchedIndexes as $i => $originalIndex) {
                        $reportItem[$originalIndex] = $matchedItems[$i];
                    }
                }

                // 縦方向と横方向に出力するデータを格納
                $rowDataList = $reportItem;
                $rowDataTokusyuList = $reportTokusyuItemRow;
                $colDataTokusyuList = $reportTokusyuItemCol;

            // データシートタイプ：日付
            } else if ($reportConfig->data_sheet_type == 4) {
                // 縦方向と横方向のスタート地点を設定
                $startDataSheetRow = "A2";
                $startDataSheetCol = "B1";

                // 縦方向と横方向に出力するデータを格納
                $colDataList = $reportItem;
                $rowDataTokusyuList = $reportTokusyuItemRow;
                $colDataTokusyuList = $reportTokusyuItemCol;

                $inputNamedRange = $spreadsheet->getNamedRange('入力セル_開始位置');
                $inputRange = $inputNamedRange->getRange(); // 例: '報告書シート!B6'

                // シート名とセルアドレスを分離
                list(, $cellAddress) = explode('!', $inputRange); // 'B6'
                preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $inputMatches);

                $inputStartColumn = $inputMatches[1];   // 'B'
                $inputStartRow = (int)$inputMatches[2]; // 6
                $inputStartRow = $inputStartRow + 31;   // 31日分ずらす

                // 縦開始位置を設定（項目タイプが2(統計)用）
                $startRepotSheetRow = $inputStartColumn . $inputStartRow;

                // 空白時の表示内容を設定
                $strNoneValue = '';

            // データシートタイプ：独自-横
            } else if ($reportConfig->data_sheet_type == 5) {
                // 縦方向と横方向のスタート地点を設定
                $startDataSheetRow = "A2";
                $startDataSheetCol = "B1";

                // 縦方向と横方向に出力するデータを格納
                $rowDataList = $reportItem;
                $rowDataTokusyuList = $reportTokusyuItemRow;
                $colDataTokusyuList = $reportTokusyuItemCol;

            // データシートタイプ：独自-縦
            } else if ($reportConfig->data_sheet_type == 6) {
                // 縦方向と横方向のスタート地点を設定
                $startDataSheetRow = "A2";
                $startDataSheetCol = "C1";

                // 縦方向と横方向に出力するデータを格納
                $colDataList = $reportPoint;
                $rowDataTokusyuList = $reportTokusyuItemRow;
                $colDataTokusyuList = $reportTokusyuItemCol;

                // 縦開始位置を設定（項目タイプが2(統計)用）
                $startRepotSheetRow = 'B38';

                // 空白時の表示内容を設定
                $strNoneValue = '';

            // データシートタイプ：独自-日付
            } else if ($reportConfig->data_sheet_type == 8) {
                // 縦方向と横方向のスタート地点を設定
                $startDataSheetRow = "A2";
                $startDataSheetCol = "B1";

                // 縦方向と横方向に出力するデータを格納
                $colDataList = $reportItem;
                $colSubDataList = $reportPoint;
                $rowDataTokusyuList = $reportTokusyuItemRow;
                $colDataTokusyuList = $reportTokusyuItemCol;

                // 縦開始位置を設定（項目タイプが2(統計)用）
                $startRepotSheetRow = 'B39';

                // 空白時の表示内容を設定
                $strNoneValue = '';
            }

            // ------------------------------------------
            // 縦方向の出力データを格納
            // ------------------------------------------
            // 縦方向の出力データあり
            $outputRowDataSheet = array();
            $outputRowDataReport = array();
            $loopRowData = array();
            if ($rowDataList !== array()) {
                // 縦方向の出力データ 格納
                foreach ($rowDataList as $rowData) {
                    // データシートに貼り付ける名称を格納
                    $outputRowDataSheet[] = [$rowData->cell_name];

                    if ($reportConfig->report_type == 9) {
                        // データシートタイプが5(独自-横)の場合は下記の項目は自動更新対象外ため、除外する
                        //   ・採水年月日
                        //   ・採水場所
                        //   ・農薬類（検出指標値）
                        if (!($rowData->item_no == 1 || $rowData->item_no == 1164 || $rowData->item_no == 3140)) {
                            // 報告書シートに貼り付ける名称を格納
                            $outputRowDataReport[] = [$rowData->cell_name];
                        }

                    } else if ($reportConfig->report_type == 54) {
                        // 報告書タイプが54の場合は下記の項目は自動更新対象外ため、除外する
                        //   「採水年月日」、「採水時刻」、「当日天候」、「採水者」、「採水場所」、
                        //   「残留塩素」、「気温」、「水温」、「検査機関」、「検査責任者」、「備考」
                        if (!($rowData->item_no == 1 || $rowData->item_no == 2 || $rowData->item_no == 1164 || $rowData->item_no == 1070
                           || $rowData->item_no == 1030 || $rowData->item_no == 5000 || $rowData->item_no == 5010 || $rowData->item_no == 3150
                           || $rowData->item_no == 1080 || $rowData->item_no == 1090 || $rowData->item_no == 1150)) {
                            // 報告書シートに貼り付ける名称を格納
                            $outputRowDataReport[] = [$rowData->cell_name];

                        }

                    } else if ($reportConfig->report_type == 17 || $reportConfig->report_type == 18) {
                        // 報告書タイプが17 or 18の場合は下記の項目は自動更新対象外ため、除外する
                        //   「採水年月日」、「採水時刻」、「当日天候」、「気温」、「水温」、
                        //   「残留塩素」、「所属」、「採水者」
                        if (!($rowData->item_no == 1 || $rowData->item_no == 2 || $rowData->item_no == 1030 || $rowData->item_no == 5000
                           || $rowData->item_no == 5010 || $rowData->item_no == 3150 || $rowData->item_no == 1130 || $rowData->item_no == 1070)) {
                            // 報告書シートに貼り付ける名称を格納
                            $outputRowDataReport[] = [$rowData->cell_name];

                        }

                    } else if ($reportConfig->report_type == 5) {
                        // 報告書タイプが5の場合は下記の項目は自動更新対象外ため、除外する
                        //   「採水年月日」、「採水時刻」、「当日天候」、「気温」、「水温」
                        if (!($rowData->item_no == 1 || $rowData->item_no == 2 || $rowData->item_no == 1030 || $rowData->item_no == 5000
                           || $rowData->item_no == 5010)) {
                            // 報告書シートに貼り付ける名称を格納
                            $outputRowDataReport[] = [$rowData->cell_name];

                        }

                    } else if ($reportConfig->report_type == 40) {
                        // 報告書タイプが40の場合は下記の項目は自動更新対象外ため、除外する
                        //   「採水年月日」、「採水時刻」、「当日天候」、「気温」、「水温」
                        if (!($rowData->item_no == 1 || $rowData->item_no == 2 || $rowData->item_no == 1030 || $rowData->item_no == 5000
                           || $rowData->item_no == 5010)) {
                            // 報告書シートに貼り付ける名称を格納
                            $outputRowDataReport[] = [$rowData->cell_name];

                        }

                    } else if ($reportConfig->report_type == 42) {
                        // 報告書タイプが42の場合は下記の項目は自動更新対象外ため、除外する
                        //   「採水年月日」、「採水時刻」、「当日天候」、「気温」、「水温」
                        if (!($rowData->item_no == 1 || $rowData->item_no == 2 || $rowData->item_no == 1030 || $rowData->item_no == 5000
                           || $rowData->item_no == 5010)) {
                            // 報告書シートに貼り付ける名称を格納
                            $outputRowDataReport[] = [$rowData->cell_name];

                        }

                    } else if ($reportConfig->report_type == 43) {
                        // 報告書タイプが42の場合は下記の項目は自動更新対象外ため、除外する
                        //   「採水年月日」、「採水時刻」、「当日天候」、「気温」、「水温」
                        if (!($rowData->item_no == 1 || $rowData->item_no == 2 || $rowData->item_no == 1030 || $rowData->item_no == 5000
                           || $rowData->item_no == 5010)) {
                            // 報告書シートに貼り付ける名称を格納
                            $outputRowDataReport[] = [$rowData->cell_name];

                        }

                    } else if ($reportConfig->report_type == 13) {
                        // 報告書タイプが13の場合は下記の項目は自動更新対象外ため、除外する
                        //   「採水年月日」、「採水時刻」、「当日天候」、「気温」、「水温」、「残留塩素」
                        if (!($rowData->item_no == 1 || $rowData->item_no == 2 || $rowData->item_no == 1030 || $rowData->item_no == 5000
                           || $rowData->item_no == 5010 || $rowData->item_no == 3150)) {
                            // 報告書シートに貼り付ける名称を格納
                            $outputRowDataReport[] = [$rowData->cell_name];
                        }

                    } else if ($reportConfig->report_type == 38) {
                        // 報告書タイプが38の場合は下記の項目は自動更新対象外ため、除外する
                        //   「採水年月日」、「採水時刻」、「当日天候」、「気温」、「水温」、「残留塩素」
                        if (!($rowData->item_no == 1 || $rowData->item_no == 2 || $rowData->item_no == 1030 || $rowData->item_no == 5000
                           || $rowData->item_no == 5010 || $rowData->item_no == 3150)) {
                            // 報告書シートに貼り付ける名称を格納
                            $outputRowDataReport[] = [$rowData->cell_name];
                        }

                    } else if ($reportConfig->report_type == 39) {
                        // 報告書タイプが39の場合は下記の項目は自動更新対象外ため、除外する
                        //   「採水年月日」、「採水時刻」、「当日天候」
                        if (!($rowData->item_no == 1 || $rowData->item_no == 2 || $rowData->item_no == 1030)) {
                            // 報告書シートに貼り付ける名称を格納
                            $outputRowDataReport[] = [$rowData->cell_name];
                        }

                    } else if ($reportConfig->report_type == 45) {
                        // 報告書タイプが45の場合は下記の項目は自動更新対象外ため、除外する
                        //   「採水年月日」、「採水時刻」
                        if (!($rowData->item_no == 1 || $rowData->item_no == 2)) {
                            // 報告書シートに貼り付ける名称を格納
                            $outputRowDataReport[] = [$rowData->cell_name];
                        }

                    } else if ($reportConfig->report_type == 47) {
                        // 報告書タイプが47の場合は下記の項目は自動更新対象外ため、除外する
                        //   「採水年月日」、「採水時刻」、「当日天候」、「気温」、「水温」、「所属」、「採水者」
                        if (!($rowData->item_no == 1 || $rowData->item_no == 2 || $rowData->item_no == 1030 || $rowData->item_no == 5000
                           || $rowData->item_no == 5010 || $rowData->item_no == 1130 || $rowData->item_no == 1070)) {
                            // 報告書シートに貼り付ける名称を格納
                            $outputRowDataReport[] = [$rowData->cell_name];
                        }

                    } else if ($reportConfig->report_type == 50) {
                        // 報告書タイプが50の場合は下記の項目は自動更新対象外ため、除外する
                        //   「採水年月日」、「採水時刻」、「当日天候」、「気温」、「水温」
                        if (!($rowData->item_no == 1 || $rowData->item_no == 2 || $rowData->item_no == 1030 || $rowData->item_no == 5000
                           || $rowData->item_no == 5010)) {
                            // 報告書シートに貼り付ける名称を格納
                            $outputRowDataReport[] = [$rowData->cell_name];
                        }

                    } else if ($reportConfig->report_type == 53) {
                        // 報告書タイプが53の場合は下記の項目は自動更新対象外ため、除外する
                        //   「採水年月日」、「採水時刻」、「採水者」
                        if (!($rowData->item_no == 1 || $rowData->item_no == 2 || $rowData->item_no == 1070)) {
                            // 報告書シートに貼り付ける名称を格納
                            $outputRowDataReport[] = [$rowData->cell_name];
                        }
                        
                    } else if ($reportConfig->report_type == 3) {
                        // 報告書タイプが3の場合は下記の項目は自動更新対象外ため、除外する
                        //   「採水年月日」
                        if (!($rowData->item_no == 1)) {
                            // 報告書シートに貼り付ける名称を格納
                            $outputRowDataReport[] = [$rowData->cell_name];
                        }

                    } else {
                        // 報告書シートに貼り付ける名称を格納
                        $outputRowDataReport[] = [$rowData->cell_name];
                    }

                    // 報告書シートの数式の作成に使用するデータを格納
                    array_push($loopRowData, [
                        'cell_name' => $rowData->cell_name,
                        'item_type' => $rowData->item_type,
                        'unit_cell_name' => $rowData->unit_cell_name,
                        'target_cell_name' => $rowData->target_cell_name,
                        'base_cell_name' => $rowData->base_cell_name,
                        'number_cell_name' => $rowData->number_cell_name,
                        'item_unit' => $rowData->item_unit,
                        'regulation_up_limit' => $rowData->regulation_up_limit,
                        'report_low_limit' => $rowData->report_low_limit,
                        'no_name' => $rowData->no_name,
                        'item_no' => $rowData->item_no
                    ]);
                }
            }

            // 縦方向の出力データ(特殊)あり
            if ($rowDataTokusyuList !== array()) {
                // 縦方向の出力データ(特殊) 格納
                foreach ($rowDataTokusyuList as $rowTokusyuData) {
                    // データシートに貼り付ける名称を格納
                    $outputRowDataSheet[] = [$rowTokusyuData->cell_name];

                    // データシートタイプが4(日付)と6(独自-縦)と8(独自-日付)の場合、項目タイプが「単体」は格納しない
                    if (($reportConfig->data_sheet_type != 4 && $reportConfig->data_sheet_type != 6 && $reportConfig->data_sheet_type != 8) ||
                        (($reportConfig->data_sheet_type == 4 || $reportConfig->data_sheet_type == 6 || $reportConfig->data_sheet_type == 8) && $rowTokusyuData->item_type == 2)) {
                        // 報告書シートに貼り付ける名称を格納
                        $outputRowDataReport[] = [$rowTokusyuData->cell_name];
                    }

                    // 報告書シートの数式の作成に使用するデータを格納
                    array_push($loopRowData, [
                        'cell_name' => $rowTokusyuData->cell_name,
                        'item_type' => $rowTokusyuData->item_type,
                        'unit_cell_name' => NULL,
                        'target_cell_name' => NULL,
                        'base_cell_name' => NULL,
                        'number_cell_name' => NULL,
                        'item_unit' => NULL,
                        'regulation_up_limit' => NULL,
                        'report_low_limit' => NULL,
                        'no_name' => NULL,
                        'item_no' => NULL
                    ]);
                }
            }

            // ------------------------------------------
            // 横方向の出力データを格納
            // ------------------------------------------
            // 横方向の出力データあり
            $outputColDataSheet = array();
            $outputColDataReport = array();
            $outputSubColDataReport = array();
            $loopColData = array();
            if ($colDataList !== array()) {
                // データシートタイプ：独自-日付以外の場合
                if ($reportConfig->data_sheet_type != 8) {
                    // データシートタイプ：独自-縦の場合、採水年月日を格納(横方向に項目と地点が入り混じっているため)
                    if ($reportConfig->data_sheet_type == 6) {
                        array_push($loopColData, [
                            'cell_name' => '採水年月日',
                            'item_type' => 1,
                            'unit_cell_name' => NULL,
                            'target_cell_name' => NULL,
                            'base_cell_name' => NULL,
                            'number_cell_name' => NULL,
                            'item_unit' => NULL,
                            'regulation_up_limit' => NULL,
                            'report_low_limit' => NULL,
                            'no_name' => NULL,
                            'item_no' => 1
                        ]);
                    }

                    // 横方向の出力データ 格納
                    foreach ($colDataList as $colData) {
                        // データシートに貼り付ける名称を格納
                        array_push($outputColDataSheet, $colData->cell_name);

                        // データシートタイプが4(日付)以外は単位や目標値などの情報は格納しない
                        if ($reportConfig->data_sheet_type != 4) {
                            // 報告書シートに貼り付ける名称を格納
                            array_push($outputColDataReport, $colData->cell_name);

                            // 報告書シートの数式の作成に使用するデータを格納
                            array_push($loopColData, [
                                'cell_name' => $colData->cell_name,
                                'item_type' => $colData->item_type,
                                'unit_cell_name' => NULL,
                                'target_cell_name' => NULL,
                                'base_cell_name' => NULL,
                                'number_cell_name' => NULL,
                                'item_unit' => NULL,
                                'regulation_up_limit' => NULL,
                                'report_low_limit' => NULL,
                                'no_name' => NULL,
                                'item_no' => NULL
                            ]);
                        } else {
                            // 項目が採水年月日の場合は格納しない
                            if ($colData->item_no != 1) {
                                // 報告書シートに貼り付ける名称を格納
                                array_push($outputColDataReport, $colData->cell_name);
                            }

                            // 報告書シートの数式の作成に使用するデータを格納
                            array_push($loopColData, [
                                'cell_name' => $colData->cell_name,
                                'item_type' => $colData->item_type,
                                'unit_cell_name' => $colData->unit_cell_name,
                                'target_cell_name' => $colData->target_cell_name,
                                'base_cell_name' => $colData->base_cell_name,
                                'number_cell_name' => $colData->number_cell_name,
                                'item_unit' => $colData->item_unit,
                                'regulation_up_limit' => $colData->regulation_up_limit,
                                'report_low_limit' => $colData->report_low_limit,
                                'no_name' => $colData->no_name,
                                'item_no' => $colData->item_no
                            ]);
                        }
                    }
                } else {
                    // ------------------------------------------
                    // 地点ごとに同じ項目を出力するパターン
                    // ------------------------------------------
                    foreach ($colSubDataList as $cellSubIndex => $colSubData) {
                        // 横方向の出力データ 格納
                        foreach ($colDataList as $cellIndex => $colData) {
                            // 採水年月日は最初の地点だけ格納
                            if (($cellSubIndex == 0 && $colData->item_no == 1) || ($colData->item_no != 1)) {
                                // データシートに貼り付ける名称を格納
                                array_push($outputColDataSheet, $colData->cell_name);

                                // 報告書シートの数式の作成に使用するデータを格納
                                array_push($loopColData, [
                                    'cell_name' => $colData->cell_name,
                                    'item_type' => $colData->item_type,
                                    'unit_cell_name' => $colData->unit_cell_name . '_' . $cellSubIndex + 1,
                                    'target_cell_name' => $colData->target_cell_name,
                                    'base_cell_name' => $colData->base_cell_name,
                                    'number_cell_name' => $colData->number_cell_name,
                                    'item_unit' => $colData->item_unit,
                                    'regulation_up_limit' => $colData->regulation_up_limit,
                                    'report_low_limit' => $colData->report_low_limit,
                                    'no_name' => $colData->no_name,
                                    'item_no' => $colData->item_no
                                ]);
                            }

                            // 項目が採水年月日の場合は格納しない
                            if ($colData->item_no != 1) {
                                // 報告書シートに貼り付ける名称を格納
                                array_push($outputColDataReport, $colData->cell_name);

                                // ------------------------------------------
                                // 地点情報を格納
                                // 地点の出力箇所は項目数分ずれるため、
                                // 採水年月日以外を除いた先頭項目に地点名称
                                // それ以外の場合は空文字を設定
                                // ------------------------------------------
                                if ($cellIndex == 1) {
                                    array_push($outputSubColDataReport, $colSubData->cell_name);
                                } else {
                                    array_push($outputSubColDataReport, '');
                                }
                            }
                        }
                    }
                }
            }

            // 横方向の出力データ(特殊)あり
            if ($colDataTokusyuList !== array()) {
                // 横方向の出力データ 格納
                foreach ($colDataTokusyuList as $colTokusyuData) {
                    // データシートに貼り付ける名称を格納
                    array_push($outputColDataSheet, $colTokusyuData->cell_name);

                    // 報告書シートに貼り付ける名称を格納
                    array_push($outputColDataReport, $colTokusyuData->cell_name);

                    // 報告書シートの数式の作成に使用するデータを格納
                    array_push($loopColData, [
                        'cell_name' => $colTokusyuData->cell_name,
                        'item_type' => $colTokusyuData->item_type,
                        'unit_cell_name' => NULL,
                        'target_cell_name' => NULL,
                        'base_cell_name' => NULL,
                        'number_cell_name' => NULL,
                        'item_unit' => NULL,
                        'regulation_up_limit' => NULL,
                        'report_low_limit' => NULL,
                        'no_name' => NULL,
                        'item_no' => NULL
                    ]);
                }
            }

            // ------------------------------------------
            // データシートに値を貼り付け
            // ------------------------------------------
            $sheet = $spreadsheet->getSheetByName('データシート');
            if ($outputRowDataSheet !== array()) {
                // 縦方向のデータを貼り付け
                $sheet->fromArray($outputRowDataSheet, null, $startDataSheetRow);
            }

            if ($outputColDataSheet !== array() && empty($startDataSheetCol) == false) {
                // 横方向のデータを貼り付け
                $sheet->fromArray([$outputColDataSheet], null, $startDataSheetCol);
            }

            // ------------------------------------------
            // 報告書シート関連処理 start
            // ------------------------------------------
            $sheet = $spreadsheet->getSheetByName('報告書シート');

            // ------------------------------------------
            // 縦件数によって行の追加 or 削除
            //   ※初期縦件数と同じ場合は追加 or 削除は行わない
            // ------------------------------------------
            if ($reportConfig->report_type == 9) {
                $rowDataList = array_values(array_filter($rowDataList, function ($item) {
                    return !in_array($item->item_no, [1, 1164, 3140]);
                }));
            } else if ($reportConfig->report_type == 54) {
                $rowDataList = array_values(array_filter($rowDataList, function ($item) {
                    return !in_array($item->item_no, [1, 2, 1164, 1070, 1030, 5000, 5010, 3150, 1080, 1090, 1150]);
                }));
            } else if ($reportConfig->report_type == 17 || $reportConfig->report_type == 18) {
                $rowDataList = array_values(array_filter($rowDataList, function ($item) {
                    return !in_array($item->item_no, [1, 2, 1030, 5000, 5010, 3150, 1130, 1070]);
                }));
            } else if ($reportConfig->report_type == 5) {
                $rowDataList = array_values(array_filter($rowDataList, function ($item) {
                    return !in_array($item->item_no, [1, 2, 1030, 5000, 5010]);
                }));
            } else if ($reportConfig->report_type == 40) {
                $rowDataList = array_values(array_filter($rowDataList, function ($item) {
                    return !in_array($item->item_no, [1, 2, 1030, 5000, 5010]);
                }));
            } else if ($reportConfig->report_type == 42) {
                $rowDataList = array_values(array_filter($rowDataList, function ($item) {
                    return !in_array($item->item_no, [1, 2, 1030, 5000, 5010]);
                }));
            } else if ($reportConfig->report_type == 43) {
                $rowDataList = array_values(array_filter($rowDataList, function ($item) {
                    return !in_array($item->item_no, [1, 2, 1030, 5000, 5010]);
                }));
            } else if ($reportConfig->report_type == 13) {
                $rowDataList = array_values(array_filter($rowDataList, function ($item) {
                    return !in_array($item->item_no, [1, 2, 1030, 5000, 5010, 3150]);
                }));
            } else if ($reportConfig->report_type == 38) {
                $rowDataList = array_values(array_filter($rowDataList, function ($item) {
                    return !in_array($item->item_no, [1, 2, 1030, 5000, 5010, 3150]);
                }));
            } else if ($reportConfig->report_type == 39) {
                $rowDataList = array_values(array_filter($rowDataList, function ($item) {
                    return !in_array($item->item_no, [1, 2, 1030]);
                }));
            } else if ($reportConfig->report_type == 45) {
                $rowDataList = array_values(array_filter($rowDataList, function ($item) {
                    return !in_array($item->item_no, [1, 2]);
                }));
            } else if ($reportConfig->report_type == 47) {
                $rowDataList = array_values(array_filter($rowDataList, function ($item) {
                    return !in_array($item->item_no, [1, 2, 1030, 5000, 5010, 1130, 1070]);
                }));
            } else if ($reportConfig->report_type == 50) {
                $rowDataList = array_values(array_filter($rowDataList, function ($item) {
                    return !in_array($item->item_no, [1, 2, 1030, 5000, 5010]);
                }));
            } else if ($reportConfig->report_type == 53) {
                $rowDataList = array_values(array_filter($rowDataList, function ($item) {
                    return !in_array($item->item_no, [1, 2, 1070]);
                }));
            } else if ($reportConfig->report_type == 3) {
                $rowDataList = array_values(array_filter($rowDataList, function ($item) {
                    return !in_array($item->item_no, [1]);
                }));
            }

            $afterRowCount = 0;
            if ($reportConfig->init_row_count != count($rowDataList)) {
                // 何件増加減したか算出
                $afterRowCount = count($rowDataList) - $reportConfig->init_row_count;

                // 件数が増加した場合、テンプレートファイルの縦件数を増やす
                if (0 < $afterRowCount) {
                    // 増加件数 取得
                    $addRowCount = $afterRowCount;

                    // 開始位置の行を取得
                    preg_match('/^([A-Z]+)(\d+)$/', $startRepotSheetRow, $matches);
                    $copyCol = $matches[1];
                    $copyRow = (int)$matches[2];
                    $copyColIndex = Coordinate::columnIndexFromString($copyCol);

                    // 挿入位置に行を追加（空行をaddRowCount分挿入）
                    $sheet->insertNewRowBefore($copyRow + 2, $addRowCount);

                    // コピー元の結合セル範囲を取得
                    $mergedCells = $sheet->getMergeCells();

                    for ($i = 0; $i < $addRowCount; $i++) {
                        $sourceRow = $copyRow;
                        $targetRow = $copyRow + 1 + $i;

                        // 列ごとに処理
                        for ($col = 0; $col < $copyColIndex; $col++) {
                            $colLetter = Coordinate::stringFromColumnIndex($col + 1);

                            $sourceAddress = $colLetter . $sourceRow;
                            $targetAddress = $colLetter . $targetRow;

                            // スタイルを配列で取得して適用
                            $styleArray = $sheet->getStyle($sourceAddress)->getBorders()->exportArray();
                            $sheet->getStyle($targetAddress)->applyFromArray($styleArray);
                        }

                        // 結合セルのコピー処理（対象行に含まれるすべての結合範囲を複製）
                        foreach ($mergedCells as $mergedRange) {
                            [$start, $end] = explode(':', $mergedRange);
                            preg_match('/^([A-Z]+)(\d+)$/', $start, $startMatch);
                            preg_match('/^([A-Z]+)(\d+)$/', $end, $endMatch);

                            $startCol = $startMatch[1];
                            $startRow = (int)$startMatch[2];
                            $endCol = $endMatch[1];
                            $endRow = (int)$endMatch[2];

                            // コピー元行に含まれる結合範囲を対象とする
                            if ($startRow <= $targetRow && $endRow >= $targetRow) {
                                // 結合範囲の行数差分を計算
                                $rowOffset = $targetRow - $copyRow;
                                $newStartRow = $startRow + $rowOffset;
                                $newEndRow = $endRow + $rowOffset;

                                $newStart = $startCol . $newStartRow;
                                $newEnd = $endCol . $newEndRow;
                                $sheet->mergeCells("$newStart:$newEnd");
                            }
                        }
                    }
                } else {
                    // 件数が減少した場合、テンプレートファイルの縦件数を減らす
                    $deleteRowCount = abs($afterRowCount);

                    // 開始位置の行を取得
                    preg_match('/^([A-Z]+)(\d+)$/', $startRepotSheetRow, $matches);
                    $deleteStartRow = (int)$matches[2];

                    // 行を削除（deleteRowCount分）
                    $sheet->removeRow($deleteStartRow, $deleteRowCount);
                }
            }

            // ------------------------------------------
            // 横件数によって行の追加 or 削除
            //   ※初期横件数と同じ場合は追加 or 削除は行わない
            // ------------------------------------------
            if ($reportConfig->data_sheet_type == 4) {
                $colDataList = array_values(array_filter($colDataList, function ($item) {
                    return $item->item_no !== 1;
                }));
                $colDataCount = count($colDataList);

            } else if ($reportConfig->data_sheet_type == 8) {
                $colDataList = array_values(array_filter($colDataList, function ($item) {
                    return $item->item_no !== 1;
                }));

                // 項目数(採水年月日を除く) × 地点数
                $colDataCount = count($colDataList) * count($colSubDataList);

            } else if ($reportConfig->data_sheet_type == 2) {
                // 単拠点の場合は0固定
                $colDataCount = 0;

            } else {
                $colDataCount = count($colDataList);
            }

            $afterColCount = 0;
            if (!(is_null($reportConfig->init_col_count)) && $reportConfig->init_col_count != $colDataCount) {
                // 何件増加減したか算出
                $afterColCount = $colDataCount - $reportConfig->init_col_count;

                // 件数が増加した場合、テンプレートファイルの横件数を増やす
                if (0 < $afterColCount) {
                    // 増加件数 取得
                    $addColCount = $afterColCount;

                    // 開始位置の列を取得（例: $startRepotSheetCol = "B5" → "B"）
                    preg_match('/^([A-Z]+)(\d+)$/', $startRepotSheetCol, $matches);
                    $copyCol = $matches[1];
                    $copyRow = (int)$matches[2];
                    $copyColIndex = Coordinate::columnIndexFromString($copyCol);

                    // 最終行のインデックス取得
                    $highestRow = $sheet->getHighestRow();

                    // 挿入位置に列を追加（空列を addColCount 分挿入）
                    // ※最終列の1つ前に挿入
                    $addColLetter = Coordinate::stringFromColumnIndex($copyColIndex + $reportConfig->init_col_count - 1);
                    $sheet->insertNewColumnBefore($addColLetter, $addColCount);

                    // コピー処理：1行ずつ複製
                    for ($i = 0; $i < $addColCount; $i++) {
                        // コピー元の範囲
                        $sourceAddress = $copyCol . $copyRow . ':' . $copyCol . $highestRow;

                        // コピー先の列インデックスを計算
                        $targetColIndex = Coordinate::columnIndexFromString($addColLetter) + $i;
                        $targetColLetter = Coordinate::stringFromColumnIndex($targetColIndex);
                        $targetAddress = $targetColLetter . $copyRow . ':' . $targetColLetter . $highestRow;

                        // スタイルを配列として取得して適用
                        $styleArray = $sheet->getStyle($sourceAddress)->getBorders()->exportArray();
                        $sheet->getStyle($targetAddress)->applyFromArray($styleArray);
                    }

                } else {
                    // 件数が減少した場合、テンプレートファイルの横件数を減らす
                    $deleteColCount = abs($afterColCount);

                    // 開始位置の行を取得
                    preg_match('/^([A-Z]+)(\d+)$/', $startRepotSheetCol, $matches);
                    $deleteStartCol = $matches[1];

                    // 行を削除（deleteColCount分）
                    $sheet->removeColumn($deleteStartCol, $deleteColCount);
                }
            }

            // ------------------------------------------
            // 各セル名称の開始位置を変更
            // ------------------------------------------
            // 横に変更があった場合のみ
            if ($afterColCount != 0) {
                $namedRanges = $spreadsheet->getNamedRanges();

                foreach ($namedRanges as $namedRange) {
                    if ($namedRange->getName() == '基準値_開始位置' || $namedRange->getName() == '番号_開始位置'
                     || $namedRange->getName() == '目標値_開始位置' || $namedRange->getName() == '単位_開始位置') {

                        // シート名とセル範囲を分離
                        $ref = $namedRange->getRange();
                        [$sheetName, $cellRange] = explode('!', $ref);
                        preg_match('/\$(\w+)\$(\d+)/', $cellRange, $matches);
                        $startColumn = $matches[1]; // 'B'
                        $startRow = (int)$matches[2]; // 6

                        // 横開始セル名を分離
                        preg_match('/^([A-Z]+)(\d+)$/', $startRepotSheetCol, $matches);
                        $startRepotCol = $matches[1];

                        // セルの列を数値に変換
                        $startColIndex = Coordinate::columnIndexFromString($startColumn); // (例)「C」 → 「3」に変換
                        $startRepotColIndex = Coordinate::columnIndexFromString($startRepotCol); // (例)「C」 → 「3」に変換

                        // 横開始セル名より後のセル名称のみ更新
                        if ($startRepotColIndex < $startColIndex) {
                            // 追加した列数分ずらす
                            if (0 < $afterColCount) {
                                $currentCol = $startColIndex + abs($afterColCount);
                            } else {
                                $currentCol = $startColIndex - abs($afterColCount);
                            }
                            $newColString = Coordinate::stringFromColumnIndex($currentCol); // (例)「4」 → 「D」に変換
                            $currentCell = $sheetName . '!$' . $newColString . '$' . $startRow;

                            // 名前付き範囲を再定義
                            $spreadsheet->removeNamedRange($namedRange->getName());
                            $spreadsheet->addNamedRange(new NamedRange($namedRange->getName(), $sheet, $currentCell));
                        }
                    }
                }
            }

            // ------------------------------------------
            // 以下の処理を実施
            //   〇各セル名称を定義
            //   〇下記のセルに値を貼り付け
            //     ・単位セル
            //     ・目標値セル
            //     ・基準値セル
            //     ・番号セル
            //   〇入力セルに数式を設定
            // ------------------------------------------
            $inputNamedRange = $spreadsheet->getNamedRange('入力セル_開始位置');
            $inputRange = $inputNamedRange->getRange(); // 例: '報告書シート!B6'

            // シート名とセルアドレスを分離
            list(, $cellAddress) = explode('!', $inputRange); // 'B6'
            preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $inputMatches);

            $inputStartColumn = $inputMatches[1]; // 'B'
            $inputStartRow = (int)$inputMatches[2]; // 6

            $tokusyuNamedRange = $spreadsheet->getNamedRange('特殊入力セル_開始位置');
            if ($tokusyuNamedRange !== null) {
                $tokusyuRange = $tokusyuNamedRange->getRange(); // 例: '報告書シート!B6'

                // シート名とセルアドレスを分離
                list(, $cellAddress) = explode('!', $tokusyuRange); // 'B6'
                preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $tokusyuMatches);

                $tokusyuStartColumn = $tokusyuMatches[1]; // 'B'
            }

            $startNamedRange = $spreadsheet->getNamedRange('開始位置');
            if ($startNamedRange !== null) {
                $startRange = $startNamedRange->getRange(); // 例: '報告書シート!B6'

                // シート名とセルアドレスを分離
                list(, $cellAddress) = explode('!', $startRange); // 'B6'
                preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $startMatches);

                $datasheetStartColumn = $startMatches[1]; // 'B'
            }

            $loopCellData = array();
            if ($reportConfig->data_sheet_type == 4 || $reportConfig->data_sheet_type == 6) {
                $loopCellData = $loopColData;

            } else if ($reportConfig->report_type == 9) {
                // データシートタイプが5(独自-横)の場合、「農薬類（検出指標値）」を除外
                $loopCellData = array_values(array_filter($loopRowData, function ($item) {
                    return !in_array($item['item_no'], [1, 1164, 3140]);
                }));

            } else if ($reportConfig->data_sheet_type == 8) {
                // データシートタイプが8(独自-日付)の場合、「採水年月日」を除外
                $loopCellData = array_values(array_filter($loopColData, function ($item) {
                    return $item['item_no'] !== 1;
                }));

            } else if ($reportConfig->report_type == 54) {
                // 報告書タイプが54の場合
                $loopCellData = array_values(array_filter($loopRowData, function ($item) {
                    return !in_array($item['item_no'], [1, 2, 1164, 1070, 1030, 5000, 5010, 3150, 1080, 1090, 1150]);
                }));

            } else if ($reportConfig->report_type == 17 || $reportConfig->report_type == 18) {
                // 報告書タイプが17 or 18の場合
                $loopCellData = array_values(array_filter($loopRowData, function ($item) {
                    return !in_array($item['item_no'], [1, 2, 1030, 5000, 5010, 3150, 1130, 1070]);
                }));

            } else if ($reportConfig->report_type == 5) {
                // 報告書タイプが5の場合
                $loopCellData = array_values(array_filter($loopRowData, function ($item) {
                    return !in_array($item['item_no'], [1, 2, 1030, 5000, 5010]);
                }));

            } else if ($reportConfig->report_type == 40) {
                // 報告書タイプが40の場合
                $loopCellData = array_values(array_filter($loopRowData, function ($item) {
                    return !in_array($item['item_no'], [1, 2, 1030, 5000, 5010]);
                }));

            } else if ($reportConfig->report_type == 42) {
                // 報告書タイプが42の場合
                $loopCellData = array_values(array_filter($loopRowData, function ($item) {
                    return !in_array($item['item_no'], [1, 2, 1030, 5000, 5010]);
                }));

            } else if ($reportConfig->report_type == 43) {
                // 報告書タイプが43の場合
                $loopCellData = array_values(array_filter($loopRowData, function ($item) {
                    return !in_array($item['item_no'], [1, 2, 1030, 5000, 5010]);
                }));

            } else if ($reportConfig->report_type == 13) {
                // 報告書タイプが13の場合
                $loopCellData = array_values(array_filter($loopRowData, function ($item) {
                    return !in_array($item['item_no'], [1, 2, 1030, 5000, 5010, 3150]);
                }));

            } else if ($reportConfig->report_type == 38) {
                // 報告書タイプが38の場合
                $loopCellData = array_values(array_filter($loopRowData, function ($item) {
                    return !in_array($item['item_no'], [1, 2, 1030, 5000, 5010, 3150]);
                }));

            } else if ($reportConfig->report_type == 39) {
                // 報告書タイプが39の場合
                $loopCellData = array_values(array_filter($loopRowData, function ($item) {
                    return !in_array($item['item_no'], [1, 2, 1030]);
                }));

            } else if ($reportConfig->report_type == 45) {
                // 報告書タイプが45の場合
                $loopCellData = array_values(array_filter($loopRowData, function ($item) {
                    return !in_array($item['item_no'], [1, 2]);
                }));

            } else if ($reportConfig->report_type == 47) {
                // 報告書タイプが47の場合
                $loopCellData = array_values(array_filter($loopRowData, function ($item) {
                    return !in_array($item['item_no'], [1, 2, 1030, 5000, 5010, 1130, 1070]);
                }));

            } else if ($reportConfig->report_type == 50) {
                // 報告書タイプが50の場合
                $loopCellData = array_values(array_filter($loopRowData, function ($item) {
                    return !in_array($item['item_no'], [1, 2, 1030, 5000, 5010]);
                }));

            } else if ($reportConfig->report_type == 53) {
                // 報告書タイプが53の場合
                $loopCellData = array_values(array_filter($loopRowData, function ($item) {
                    return !in_array($item['item_no'], [1, 2, 1070]);
                }));

            } else if ($reportConfig->report_type == 3) {
                // 報告書タイプが53の場合
                $loopCellData = array_values(array_filter($loopRowData, function ($item) {
                    return !in_array($item['item_no'], [1]);
                }));

            } else {
                $loopCellData = $loopRowData;
            }

            foreach ($loopCellData as $cellIndex => $cellData) {
                // ------------------------------------------
                // 各セル名称を定義
                // ------------------------------------------
                // 単位セル
                if (!is_null($cellData['unit_cell_name'])) {
                    $namedRange = $spreadsheet->getNamedRange('単位_開始位置');
                    $range = $namedRange->getRange(); // 例: '報告書シート!B6'

                    // シート名とセルアドレスを分離
                    list(, $cellAddress) = explode('!', $range); // 'B6'
                    preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $matches);

                    $startColumn = $matches[1]; // 'B'
                    $startRow = (int)$matches[2]; // 6

                    // データシートタイプによって縦 または 横にずらす
                    if ($reportConfig->data_sheet_type == 4 || $reportConfig->data_sheet_type == 6) {
                        $currentCol = Coordinate::columnIndexFromString($startColumn);  // (例)「C」 → 「3」に変換
                        $strCol = $currentCol + $cellIndex - 1;                         // インデックスをずらす(採水年月日は含まないので-1)
                        $newColString = Coordinate::stringFromColumnIndex($strCol);     // (例)「4」 → 「D」に変換
                        $currentCell = '$' . $newColString . '$' . $startRow;

                    } else if ($reportConfig->data_sheet_type == 8) {
                        $currentCol = Coordinate::columnIndexFromString($startColumn);  // (例)「C」 → 「3」に変換
                        $strCol = $currentCol + $cellIndex;                             // インデックスをずらす
                        $newColString = Coordinate::stringFromColumnIndex($strCol);     // (例)「4」 → 「D」に変換
                        $currentCell = '$' . $newColString . '$' . $startRow;

                    } else {
                        $currentRow = $startRow + $cellIndex;
                        $currentCell = '$' . $startColumn . '$' . $currentRow;
                    }

                    $spreadsheet->addDefinedName(
                        new NamedRange(
                            $cellData['unit_cell_name'],
                            $sheet,
                            $currentCell
                        )
                    );
                }

                // 目標値セル
                if (!is_null($cellData['target_cell_name'])) {
                    $namedRange = $spreadsheet->getNamedRange('目標値_開始位置');
                    $range = $namedRange->getRange(); // 例: '報告書シート!B6'

                    // シート名とセルアドレスを分離
                    list(, $cellAddress) = explode('!', $range); // 'B6'
                    preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $matches);

                    $startColumn = $matches[1]; // 'B'
                    $startRow = (int)$matches[2]; // 6

                    // データシートタイプによって縦 または 横にずらす
                    if ($reportConfig->data_sheet_type == 4 || $reportConfig->data_sheet_type == 6 || $reportConfig->data_sheet_type == 8) {
                        $currentCol = Coordinate::columnIndexFromString($startColumn);  // (例)「C」 → 「3」に変換
                        $strCol = $currentCol + $cellIndex - 1;                         // インデックスをずらす(採水年月日は含まないので-1)
                        $newColString = Coordinate::stringFromColumnIndex($strCol);     // (例)「4」 → 「D」に変換
                        $currentCell = '$' . $newColString . '$' . $startRow;
                    } else {
                        $currentRow = $startRow + $cellIndex;
                        $currentCell = '$' . $startColumn . '$' . $currentRow;
                    }

                    $spreadsheet->addDefinedName(
                        new NamedRange(
                            $cellData['target_cell_name'],
                            $sheet,
                            $currentCell
                        )
                    );
                }

                // 基準値セル
                if (!is_null($cellData['base_cell_name'])) {
                    $namedRange = $spreadsheet->getNamedRange('基準値_開始位置');
                    $range = $namedRange->getRange(); // 例: '報告書シート!B6'

                    // シート名とセルアドレスを分離
                    list(, $cellAddress) = explode('!', $range); // 'B6'
                    preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $matches);

                    $startColumn = $matches[1]; // 'B'
                    $startRow = (int)$matches[2]; // 6

                    // データシートタイプによって縦 または 横にずらす
                    if ($reportConfig->data_sheet_type == 4 || $reportConfig->data_sheet_type == 6 || $reportConfig->data_sheet_type == 8) {
                        $currentCol = Coordinate::columnIndexFromString($startColumn);  // (例)「C」 → 「3」に変換
                        $strCol = $currentCol + $cellIndex - 1;                         // インデックスをずらす(採水年月日は含まないので-1)
                        $newColString = Coordinate::stringFromColumnIndex($strCol);     // (例)「4」 → 「D」に変換
                        $currentCell = '$' . $newColString . '$' . $startRow;
                    } else {
                        $currentRow = $startRow + $cellIndex;
                        $currentCell = '$' . $startColumn . '$' . $currentRow;
                    }

                    $spreadsheet->addDefinedName(
                        new NamedRange(
                            $cellData['base_cell_name'],
                            $sheet,
                            $currentCell
                        )
                    );
                }

                // 番号セル
                if (!is_null($cellData['number_cell_name'])) {
                    $namedRange = $spreadsheet->getNamedRange('番号_開始位置');
                    $range = $namedRange->getRange(); // 例: '報告書シート!B6'

                    // シート名とセルアドレスを分離
                    list(, $cellAddress) = explode('!', $range); // 'B6'
                    preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $matches);

                    $startColumn = $matches[1]; // 'B'
                    $startRow = (int)$matches[2]; // 6

                    // データシートタイプによって縦 または 横にずらす
                    if ($reportConfig->data_sheet_type == 4 || $reportConfig->data_sheet_type == 6 || $reportConfig->data_sheet_type == 8) {
                        $currentCol = Coordinate::columnIndexFromString($startColumn);  // (例)「C」 → 「3」に変換
                        $strCol = $currentCol + $cellIndex - 1;                         // インデックスをずらす(採水年月日は含まないので-1)
                        $newColString = Coordinate::stringFromColumnIndex($strCol);     // (例)「4」 → 「D」に変換
                        $currentCell = '$' . $newColString . '$' . $startRow;
                    } else {
                        $currentRow = $startRow + $cellIndex;
                        $currentCell = '$' . $startColumn . '$' . $currentRow;
                    }

                    $spreadsheet->addDefinedName(
                        new NamedRange(
                            $cellData['number_cell_name'],
                            $sheet,
                            $currentCell
                        )
                    );
                }

                // ------------------------------------------
                // 下記のセルに値を貼り付け
                //   ・単位セル
                //   ・目標値セル
                //   ・基準値セル
                //   ・番号セル
                // ------------------------------------------
                // 単位セルに単位を貼り付け
                if (!is_null($cellData['unit_cell_name'])) {
                    // 単位セル名から格納位置を取得
                    $namedRange = $spreadsheet->getNamedRange($cellData['unit_cell_name']);
                    $cell = $namedRange->getRange();

                    // 単位の加工が必要な報告書タイプの場合、加工を行う
                    $unit_name = $cellData['item_unit'];
                    if (($reportConfig->report_type == 2 || $reportConfig->report_type == 6 || $reportConfig->report_type == 13 || $reportConfig->report_type == 15
                      || $reportConfig->report_type == 17 || $reportConfig->report_type == 18 || $reportConfig->report_type == 38 || $reportConfig->report_type == 39
                      || $reportConfig->report_type == 42 || $reportConfig->report_type == 43 || $reportConfig->report_type == 47 || $reportConfig->report_type == 53) &&
                        (is_null($unit_name) == false)) {
                        $unit_name = '（' . $unit_name . '）';
                    }

                    // 指定されたセルに単位を貼り付け
                    $sheet->setCellValue($cell, $unit_name);
                }

                // 目標値セルに目標値を貼り付け
                if (!is_null($cellData['target_cell_name'])) {
                    // 目標値セル名から格納位置を取得
                    $namedRange = $spreadsheet->getNamedRange($cellData['target_cell_name']);
                    $cell = $namedRange->getRange();

                    // 指定されたセルに目標値を貼り付け
                    $sheet->setCellValue($cell, $cellData['regulation_up_limit']);
                }

                // 基準値セルに基準値を貼り付け（報告書タイプ54は独自処理で基準値を設定する）
                if (!is_null($cellData['base_cell_name']) && $reportConfig->report_type != 54) {
                    // 基準値セル名から格納位置を取得
                    $namedRange = $spreadsheet->getNamedRange($cellData['base_cell_name']);
                    $cell = $namedRange->getRange();
                    
                    $trimeData = rtrim(rtrim($cellData['report_low_limit'], '0'), '.');

                    // 指定されたセルに基準値を貼り付け
                    $sheet->setCellValue($cell, $reportConfig->dsp_low_limit . (string)$trimeData);
                }

                // 番号セルに番号を貼り付け
                if (!is_null($cellData['number_cell_name'])) {
                    // 番号セル名から格納位置を取得
                    $namedRange = $spreadsheet->getNamedRange($cellData['number_cell_name']);
                    $cell = $namedRange->getRange();

                    // 指定されたセルに番号を貼り付け
                    $sheet->setCellValue($cell, $cellData['no_name']);
                }
            }

            // ------------------------------------------
            // 入力セルに数式を設定
            // ------------------------------------------
            $hoseiTargetCellRow = 0;
            foreach ($loopRowData as $cellIndex => $rowData) {
                if ($reportConfig->data_sheet_type == 5 && $rowData['item_no'] == 3140) {
                    // データシートタイプが5(独自-横) かつ 農薬類（検出指標値）の場合、
                    // 農薬類（検出指標値）はヘッダー部に出力するため、ここで数式を設定してcontinueを行う
                    $reportNouyakuNamedRange = $spreadsheet->getNamedRange('報告書シート_農薬類_検出指標値');
                    $reportNouyakuRange = $reportNouyakuNamedRange->getRange(); // 例: '報告書シート!B6'

                    // 数式を設定するセルを取得
                    list(, $cellAddress) = explode('!', $reportNouyakuRange); // 'B6'
                    preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $reportNouyakuMatches);
                    $reportNouyakuCell = $reportNouyakuMatches[1] . $reportNouyakuMatches[2];

                    $dataSheetNouyakuNamedRange = $spreadsheet->getNamedRange('データシート_農薬類_検出指標値');
                    $dataSheetNouyakuange = $dataSheetNouyakuNamedRange->getRange(); // 例: '報告書シート!B6'

                    // 参照するセルを取得
                    list(, $cellAddress) = explode('!', $dataSheetNouyakuange); // 'B6'
                    preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $dataSheetNouyakuMatches);
                    $dataSheetNouyakuCell = $dataSheetNouyakuMatches[1] . $dataSheetNouyakuMatches[2];

                    $dataCell = "データシート!{$dataSheetNouyakuCell}";
                    $formula = "=IF(ISBLANK({$dataCell}),\"$strNoneValue\",{$dataCell})";

                    // 数式を格納
                    $sheet->setCellValue($reportNouyakuCell, $formula);
                    $hoseiTargetCellRow += 1;
                    continue;

                } else if (($reportConfig->data_sheet_type == 5 && ($rowData['item_no'] == 1 || $rowData['item_no'] == 1164))) {
                    // データシートタイプが5(独自-横)の場合、下記の項目は数式が不要のため、除外する
                    //   ・採水年月日
                    //   ・採水場所
                    $hoseiTargetCellRow += 1;
                    continue;

                } else if (($reportConfig->report_type == 54 &&
                           ($rowData['item_no'] == 1 || $rowData['item_no'] == 2 || $rowData['item_no'] == 1164 || $rowData['item_no'] == 1070
                         || $rowData['item_no'] == 1030 || $rowData['item_no'] == 5000 || $rowData['item_no'] == 5010 || $rowData['item_no'] == 3150
                         || $rowData['item_no'] == 1080 || $rowData['item_no'] == 1090 || $rowData['item_no'] == 1150))) {
                    // 報告書タイプが54の場合、下記の項目は数式が不要のため、除外する
                    //   「採水年月日」、「採水時刻」、「当日天候」、「採水者」、「採水場所」、「残留塩素」、
                    //   「気温」、「水温」、「検査機関」、「検査責任者」、「備考」
                    $hoseiTargetCellRow += 1;
                    continue;

                } else if (($reportConfig->report_type == 53 &&
                           ($rowData['item_no'] == 1 || $rowData['item_no'] == 2 || $rowData['item_no'] == 1070))) {
                    // 報告書タイプが53の場合、下記の項目は数式が不要のため、除外する
                    //   「採水年月日」、「採水時刻」、「採水者」
                    $hoseiTargetCellRow += 1;
                    continue;
                }

                $inputColIndex = 0;
                $mergeIndex = 0;
                $tokusyuColIndex = 0;
                $datasheetColIndex = 0;
                foreach ($loopColData as $colIndex => $colData) {
                    if ($reportConfig->data_sheet_type == 4 || $reportConfig->data_sheet_type == 6 || $reportConfig->data_sheet_type == 8) {
                        $itemType = $rowData['item_type'];

                    } else if ($reportConfig->data_sheet_type == 5) {
                        $itemType = $colData['item_type'];

                        // 最初と最後の入力セル以外、1セル間を空けて出力するため、ここで列インデックスをインクリメント
                        if ($datasheetColIndex != 0 && $datasheetColIndex != count($loopColData) - 1) {
                            $inputColIndex++;
                        }

                    } else if ($reportConfig->data_sheet_type == 1) {
                        $itemType = $colData['item_type'];

                        // 先頭列以外 かつ 消毒副生成物（目標・要検討）検査結果書の場合、セルが結合されているため次の横位置を+1する
                        if ($colIndex != 0 && $reportConfig->report_type == 17) {
                            $mergeIndex++;
                        }

                    } else {
                        $itemType = $colData['item_type'];
                    }

                    // 項目タイプから単体(入力セル)または統計(特殊入力セル)か判定する
                    if ($itemType == 1) {
                        // 格納先セルを算出
                        $currentColumnIndex = Coordinate::columnIndexFromString($inputStartColumn) + $inputColIndex + $mergeIndex;
                        $currentColumnLetter = Coordinate::stringFromColumnIndex($currentColumnIndex);
                        $currentRow = $inputStartRow + $cellIndex - $hoseiTargetCellRow;
                        $targetCell = $currentColumnLetter . $currentRow;

                        // データシートの参照セルを動的に生成（例: B2, C2, ...）
                        $dataColumnLetter = Coordinate::stringFromColumnIndex(Coordinate::columnIndexFromString($datasheetStartColumn) + $datasheetColIndex);
                        $dataRow = $cellIndex + 2;
                        $dataCell = "データシート!{$dataColumnLetter}{$dataRow}";

                        // 項目ごとの数式を設定する
                        if ($rowData['item_no'] == 1 || $colData['item_no'] == 1) {
                            if ($reportConfig->data_sheet_type == 4 || $reportConfig->data_sheet_type == 6 || $reportConfig->data_sheet_type == 8) {
                                // 採水年月日の場合
                                $formula = "=IF(ISBLANK({$dataCell}),\"$strNoneValue\",TEXT({$dataCell},\"d日\"))";
                            } else {
                                // 採水年月日の場合
                                $formula = "=IF(ISBLANK({$dataCell}),\"$strNoneValue\",TEXT({$dataCell},\"m月d日\"))";
                            }

                        } else if($rowData['item_no'] == 2) {
                            // 採水時刻の場合
                            $formula = "=IF(ISBLANK({$dataCell}),\"$strNoneValue\",TEXT({$dataCell},\"h:mm\"))";

                        } else {
                            // 上記以外の項目
                            $formula = "=IF(ISBLANK({$dataCell}),\"$strNoneValue\",{$dataCell})";
                        }

                        $inputColIndex++;

                    } else {
                        // 採水年月日と採水時刻以外は数式を設定する
                        if (($rowData['item_no'] != 1 && $rowData['item_no'] != 2 && $colData['item_no'] != 1 && $colData['item_no'] != 2)
                        && (($reportConfig->report_type == 39 || $reportConfig->report_type == 43) ? $rowData['item_no'] != 1030 : true)) {
                            if ($reportConfig->data_sheet_type == 4 || $reportConfig->data_sheet_type == 6 || $reportConfig->data_sheet_type == 8) {
                                // 格納先セルを算出
                                $currentColumnIndex = Coordinate::columnIndexFromString($tokusyuStartColumn) + $tokusyuColIndex;
                                $currentColumnLetter = Coordinate::stringFromColumnIndex($currentColumnIndex);
                                $currentRow = $inputStartRow + $cellIndex - $hoseiTargetCellRow;
                                $targetCell = $currentColumnLetter . $currentRow;

                                // データシートの参照セルを動的に生成（例: B2, C2, ...）
                                $dataColumnLetter = Coordinate::stringFromColumnIndex(Coordinate::columnIndexFromString($datasheetStartColumn) + $datasheetColIndex);
                                $dataRow = $cellIndex + 2;

                                // 測定数は0の場合も空文字にする書式を設定
                                if ($rowData['cell_name'] == '測定数') {
                                    $dataCell = "データシート!{$dataColumnLetter}{$dataRow}";
                                    $formula = "=IF(OR(ISBLANK({$dataCell}),{$dataCell}=0),\"$strNoneValue\",{$dataCell})";
                                } else if (($rowData['cell_name'] == '雨量合計' && $colData['item_no'] == 1040)) {
                                    $dataCell = "データシート!{$dataColumnLetter}{$dataRow}";
                                    $formula = "=IF(ISBLANK({$dataCell}),\"$strNoneValue\",{$dataCell})";
                                } else if ($rowData['cell_name'] == '雨量合計') {
                                    // 雨量合計欄は雨量の列以外、数式を設定しない
                                    $formula = "";
                                } else {
                                    $dataCell = "データシート!{$dataColumnLetter}{$dataRow}";
                                    $formula = "=IF(ISBLANK({$dataCell}),\"$strNoneValue\",{$dataCell})";
                                }

                            } else {
                                // 格納先セルを算出
                                $currentColumnIndex = Coordinate::columnIndexFromString($tokusyuStartColumn) + $tokusyuColIndex;
                                $currentColumnLetter = Coordinate::stringFromColumnIndex($currentColumnIndex);
                                $currentRow = $inputStartRow + $cellIndex - $hoseiTargetCellRow;
                                $targetCell = $currentColumnLetter . $currentRow;

                                // データシートの参照セルを動的に生成（例: B2, C2, ...）
                                $dataColumnLetter = Coordinate::stringFromColumnIndex(Coordinate::columnIndexFromString($datasheetStartColumn) + $datasheetColIndex);
                                $dataRow = $cellIndex + 2;
                                $dataCell = "データシート!{$dataColumnLetter}{$dataRow}";
                                $formula = "=IF(ISBLANK({$dataCell}),\"$strNoneValue\",{$dataCell})";
                            }

                            $tokusyuColIndex++;

                        } else if ($reportNo == 414 && $rowData['item_no'] == 2) {
                            // ------------------------------------------
                            // 報告書番号414の採水時刻のみ、
                            // 検査回数が存在するため、数式を格納する
                            // ------------------------------------------
                            // 格納先セルを算出
                            $currentColumnIndex = Coordinate::columnIndexFromString($tokusyuStartColumn) + $tokusyuColIndex;
                            $currentColumnLetter = Coordinate::stringFromColumnIndex($currentColumnIndex);
                            $currentRow = $inputStartRow + $cellIndex - $hoseiTargetCellRow;
                            $targetCell = $currentColumnLetter . $currentRow;

                            // データシートの参照セルを動的に生成（例: B2, C2, ...）
                            $dataColumnLetter = Coordinate::stringFromColumnIndex(Coordinate::columnIndexFromString($datasheetStartColumn) + $datasheetColIndex);
                            $dataRow = $cellIndex + 2;
                            $dataCell = "データシート!{$dataColumnLetter}{$dataRow}";
                            $formula = "=IF(ISBLANK({$dataCell}),\"$strNoneValue\",{$dataCell})";

                            $tokusyuColIndex++;

                        } else if ($reportConfig->report_type == 38 && $rowData['item_no'] == 2) {
                            // ------------------------------------------
                            // 報告書タイプ38の採水時刻は数式を格納する
                            // ------------------------------------------
                            // 格納先セルを算出
                            $currentColumnIndex = Coordinate::columnIndexFromString($tokusyuStartColumn) + $tokusyuColIndex;
                            $currentColumnLetter = Coordinate::stringFromColumnIndex($currentColumnIndex);
                            $currentRow = $inputStartRow + $cellIndex - $hoseiTargetCellRow;
                            $targetCell = $currentColumnLetter . $currentRow;

                            // データシートの参照セルを動的に生成（例: B2, C2, ...）
                            $dataColumnLetter = Coordinate::stringFromColumnIndex(Coordinate::columnIndexFromString($datasheetStartColumn) + $datasheetColIndex);
                            $dataRow = $cellIndex + 2;
                            $dataCell = "データシート!{$dataColumnLetter}{$dataRow}";
                            $formula = "=IF(ISBLANK({$dataCell}),\"$strNoneValue\",{$dataCell})";

                            $tokusyuColIndex++;
                        }
                    }

                    $sheet->setCellValue($targetCell, $formula);
                    $datasheetColIndex++;
                }
            }

            // ------------------------------------------
            // 縦方向と横方向にデータを貼り付け
            // ------------------------------------------
            if ($outputRowDataReport !== array() && is_null($startRepotSheetRow) == false) {
                // 縦方向のデータを貼り付け
                $sheet->fromArray($outputRowDataReport, null, $startRepotSheetRow);
            }

            if ($outputColDataReport !== array() && is_null($startRepotSheetCol) == false) {
                if ($reportConfig->report_type == 17) {
                    // 消毒副生成物（目標・要検討）検査結果書の場合はセルが結合されているため、列位置を調整しながら格納する
                    // 開始位置の行を取得
                    preg_match('/^([A-Z]+)(\d+)$/', $startRepotSheetCol, $matches);
                    $startCol = $matches[1];
                    $startRow = (int)$matches[2];

                    foreach ($outputColDataReport as $colIndex => $colValue) {
                        // 地点セルを算出
                        $currentColumnIndex = Coordinate::columnIndexFromString($startCol) + ($colIndex * 2);
                        $currentColumnLetter = Coordinate::stringFromColumnIndex($currentColumnIndex);
                        $pointCell = $currentColumnLetter . $startRow;

                        // 地点データを貼り付け
                        $sheet->setCellValue($pointCell, $colValue);
                    }

                } else {
                    // 横方向のデータを貼り付け
                    $sheet->fromArray([$outputColDataReport], null, $startRepotSheetCol);
                }
            }

            // ------------------------------------------
            // データシートタイプ：独自-日付の場合のみ
            // 横方向に地点を出力する
            // ------------------------------------------
            if ($reportConfig->data_sheet_type == 8) {
                // 開始位置の列を取得して、地点の開始位置を算出
                preg_match('/^([A-Z]+)(\d+)$/', $startRepotSheetCol, $matches);
                $pointCol = $matches[1];
                $startRow = (int)$matches[2];
                $pointStartCell = $pointCol . $startRow - 1;

                // 横方向に地点を貼り付け
                $sheet->fromArray($outputSubColDataReport, null, $pointStartCell);
            }

            return true;
        } catch (\Exception $e) {
            \Log::error($e->getMessage());
            \Log::error($e->getTraceAsString());
            return false;
        }
    }

    /**
     * 独自処理
     * 
     */
    public function dokujiReportEdit($reportNo, $reportConfig, $reportPoint, $reportItem, $reportTokusyuItemRow, $reportTokusyuItemCol, &$spreadsheet)
    {
        try {
            // 報告書タイプ：霞ヶ浦水源農薬類検査結果表
            if ($reportConfig->report_type == 1) {
                // ----------------------------------------------------------------------
                // 下記の項目の場合、入力セルと報告書下限値セルの背景色をグレーにする
                //   ・カルタップ(項目番号：7134)
                //   ・ダゾメット，メタム及びメチルイソチオシアネート(項目番号：7150)
                //   ・ピラクロニル(項目番号：7153)
                //   ・フェリムゾン(項目番号：7157)
                //   ・プロチオホス(項目番号：7161)
                // ----------------------------------------------------------------------
                $sheet = $spreadsheet->getSheetByName('報告書シート');
                foreach ($reportItem as $rowData) {
                    if ($rowData->item_no == 7134 || $rowData->item_no == 7150 || $rowData->item_no == 7153
                     || $rowData->item_no == 7157 || $rowData->item_no == 7161) {

                        // ------------------------------------------
                        // 報告書下限値セルに「-」を設定
                        // ------------------------------------------
                        $namedRange = $spreadsheet->getNamedRange($rowData->base_cell_name);
                        $baseCell = $namedRange->getRange();

                        // 報告書下限値セルに「-」を設定
                        $sheet->setCellValue($baseCell, '-');

                        // ダゾメット，メタム及びメチルイソチオシアネート(項目番号：7150)の場合、設定と高さを調整
                        if ($rowData->item_no == 7150) {
                            // 座標から列と行を抽出
                            preg_match('/\$(\w+)\$(\d+)/', $baseCell, $baseMatches);
                            $baseRowIndex = $baseMatches[2];

                            // 高さ調整
                            $sheet->getRowDimension($baseRowIndex)->setRowHeight(35.25);

                            // 「折り返して全体を表示する」を設定
                            $sheet->getStyle('B' . $baseRowIndex)->getAlignment()->setWrapText(true);
                        }

                        // ------------------------------------------
                        // 入力セル～報告下限値セルまで背景色をグレーアウト
                        // ------------------------------------------
                        // 報告書下限値セルから入力セルの開始列を取得
                        //   (例)「$I$33」→「$C$33」
                        $inputCell = preg_replace('/\$(?:[A-Z])\$/', '$C$', $baseCell);

                        // 入力セルの開始列から地点数分、入力セルの背景色をグレーアウト
                        for ($i = 0; $i < count($reportPoint) + 2; $i++) {
                            if ($i != 0) {
                                // 座標から列と行を抽出
                                preg_match('/\$(\w+)\$(\d+)/', $inputCell, $inputMatches);
                                $inputColString = $inputMatches[1];   // 'C'
                                $inputRowIndex = $inputMatches[2];    // '33'

                                // 列を数値に変換して右に1列ずらす
                                $inputColIndex = Coordinate::columnIndexFromString($inputColString);          // (例)「C」 → 「3」に変換
                                $newInputColIndex = $inputColIndex + 1;                                       // (例) 1加算して「4」に更新
                                $newInputColString = Coordinate::stringFromColumnIndex($newInputColIndex);    // (例)「4」 → 「D」に変換

                                // 新しいセル参照を組み立て
                                $inputCell = '$' . $newInputColString . '$' . $inputRowIndex;
                            }

                            // 背景色をグレー (#D9D9D9) に設定
                            $sheet->getStyle($inputCell)
                                ->getFill()
                                ->setFillType(Fill::FILL_SOLID)
                                ->getStartColor()
                                ->setARGB('FFD9D9D9');
                        }

                        // ------------------------------------------
                        // 番号セルの背景色をグレーアウト
                        // ------------------------------------------
                        // 報告書下限値セルから入力セルの開始列を取得
                        //   (例)「$I$33」→「$A$33」
                        $noCell = preg_replace('/\$(?:[A-Z])\$/', '$A$', $baseCell);

                        // 背景色をグレー (#D9D9D9) に設定
                        $sheet->getStyle($noCell)
                            ->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()
                            ->setARGB('FFD9D9D9');
                    }
                }

                // ------------------------------------------
                // 採水年月日の入力セルを結合
                // ------------------------------------------
                $namedRange = $spreadsheet->getNamedRange('採水年月日');
                $range = $namedRange->getRange(); // 例: '報告書シート!B6'

                // シート名とセルアドレスを分離
                list(, $cellAddress) = explode('!', $range); // 'B6'
                preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $matches);

                $startColumn = $matches[1]; // 'B'
                $startRow = (int)$matches[2]; // 6

                $targetColIndex = Coordinate::columnIndexFromString($startColumn);

                // 結合セル一覧から対象セルが含まれる範囲を探す
                $mergedRanges = $sheet->getMergeCells();
                $targetMergeRange = null;

                foreach ($mergedRanges as $mergedRange) {
                    [$startCell, $endCell] = explode(':', $mergedRange);

                    // 開始セル
                    preg_match('/([A-Z]+)(\d+)/', $startCell, $startMatches);
                    $startColIndex = Coordinate::columnIndexFromString($startMatches[1]);
                    $startRowIndex = (int)$startMatches[2];

                    // 終了セル
                    preg_match('/([A-Z]+)(\d+)/', $endCell, $endMatches);
                    $endColIndex = Coordinate::columnIndexFromString($endMatches[1]);
                    $endRowIndex = (int)$endMatches[2];

                    // 対象セルが結合範囲内にあるか判定
                    if ($startRow >= $startRowIndex && $startRow <= $endRowIndex &&
                        $targetColIndex >= $startColIndex && $targetColIndex <= $endColIndex) {
                        $targetMergeRange = $mergedRange;
                        break;
                    }
                }

                // 採水年月日のみ結合解除
                if ($targetMergeRange !== null && $namedRange->getName() === '採水年月日') {
                    $sheet->unmergeCells($targetMergeRange);
                }

                // 列を数値に変換
                $startColumnIndex = Coordinate::columnIndexFromString($startColumn);            // (例)「C」 → 「3」に変換
                $endColumnIndex = $startColumnIndex + count($reportPoint) - 1;
                $endColumn = Coordinate::stringFromColumnIndex($endColumnIndex);                // (例)「4」 → 「D」に変換

                // セルを結合
                $mergeRange = $startColumn . $startRow . ':' . $endColumn . $startRow;
                $sheet->mergeCells($mergeRange);

            // 報告書タイプ：霞ヶ浦水源藻類（年報）
            } else if ($reportConfig->report_type == 3) {
                // ----------------------------------------------------------------------
                // 霞ヶ浦水源藻類（年報）の独自処理
                // 
                // ■「藍藻類」、「珪藻類」、「緑藻類」ごとにB列を結合し、太線を引く
                // 
                // ■その他藍藻類(項目番号：8160)の場合、太線の下線を引く
                // ----------------------------------------------------------------------
                $sheet = $spreadsheet->getSheetByName('報告書シート');

                // 分類位置を取得
                preg_match('/^([A-Z]+)(\d+)$/', $reportConfig->row_start_cell_name, $matches);
                $categoryColIndex = Coordinate::columnIndexFromString($matches[1]) - 1;
                $categoryColLetter = Coordinate::stringFromColumnIndex($categoryColIndex);
                $categoryRow = (int)$matches[2];

                // 取得した項目を並び替え
                $targetCategories = [81, 82, 83];
                $matchedItems = [];
                $matchedIndexes = [];

                // 対象カテゴリの要素とそのインデックスを抽出
                foreach ($reportItem as $index => $item) {
                    if (in_array($item->item_tyu_category_no, $targetCategories, true)) {
                        $matchedItems[] = $item;
                        $matchedIndexes[] = $index;
                    }
                }

                // 該当要素をitem_tyu_category_noの昇順でソート
                usort($matchedItems, function ($a, $b) {
                    return $a->item_tyu_category_no <=> $b->item_tyu_category_no;
                });

                // 元の配列に戻す（該当インデックスに上書き）
                foreach ($matchedIndexes as $i => $originalIndex) {
                    $reportItem[$originalIndex] = $matchedItems[$i];
                }

                $bkCategoryNo = 0;
                $targetStartRow = $categoryRow;
                foreach ($reportItem as $rowIndex => $rowData) {
                    if ($bkCategoryNo == 0) {
                        // 初回の場合
                        $bkCategoryNo = $rowData->item_tyu_category_no;

                    } else if ($bkCategoryNo != $rowData->item_tyu_category_no) {
                        if ($bkCategoryNo == 81 || $bkCategoryNo == 82 || $bkCategoryNo == 83) {
                            // ----------------------------------------------------------------------
                            // 項目中分類番号が変更された場合、結合してB列に分類名を設定
                            // ----------------------------------------------------------------------

                            // 終了行を算出
                            $targetEndRow = $rowIndex + $categoryRow - 2;

                            // セルを結合
                            $mergeRange = $categoryColLetter . $targetStartRow . ':' . $categoryColLetter . $targetEndRow;
                            $sheet->mergeCells($mergeRange);

                            // 分類を設定
                            $targetCell = $categoryColLetter . $targetStartRow;
                            if ($bkCategoryNo == 81) {
                                // 藍藻類の場合
                                $sheet->setCellValue($targetCell, '藍　藻　類');

                            } else if ($bkCategoryNo == 82) {
                                // 珪藻類の場合
                                $sheet->setCellValue($targetCell, '珪　藻　類');

                            } else if ($bkCategoryNo == 83) {
                                // 緑藻類の場合
                                $sheet->setCellValue($targetCell, '緑　藻　類');
                            }

                            // 太線の下線を引く
                            $endColIndex = $categoryColIndex + 2 + count($reportTokusyuItemCol);
                            $endColLetter = Coordinate::stringFromColumnIndex($endColIndex);
                            $rangeBorder = $categoryColLetter . $targetEndRow . ':' . $endColLetter . $targetEndRow;
                            $sheet->getStyle($rangeBorder)->getBorders()->getBottom()->setBorderStyle(Border::BORDER_MEDIUM);

                            // 次の開始位置と項目中分類番号を設定
                            $targetStartRow = $targetEndRow + 1;
                        }

                        $bkCategoryNo = $rowData->item_tyu_category_no;
                    }

                    // ----------------------------------------------------------------------
                    // その他藍藻類(項目番号：8160)の場合、太線の下線を引く
                    // ----------------------------------------------------------------------
                    if ($rowData->item_no == 8160) {
                        // 項目名の位置を取得
                        preg_match('/^([A-Z]+)(\d+)$/', $reportConfig->row_start_cell_name, $matches);
                        $itemStartCol = $matches[1];
                        $itemStartRow = (int)$matches[2];

                        // 下線を引く範囲を算出
                        $targetEndRow = $rowIndex + $itemStartRow - 1;
                        $itemColIndex = Coordinate::columnIndexFromString($itemStartCol);      // (例)「E」 → 「5」に変換
                        $endColIndex = $itemColIndex + 1 + count($reportTokusyuItemCol);       // (例) 加算して「6」に更新
                        $endColString = Coordinate::stringFromColumnIndex($endColIndex);       // (例)「6」 → 「F」に変換

                        // 太線の下線を引く
                        $rangeBorder = $itemStartCol . $targetEndRow . ':' . $endColString . $targetEndRow;
                        $sheet->getStyle($rangeBorder)->getBorders()->getBottom()->setBorderStyle(Border::BORDER_MEDIUM);
                    }
                }

            // 報告書タイプ：管理目標全項目検査結果書(結果一覧)
            } else if ($reportConfig->report_type == 5) {
                $sheet = $spreadsheet->getSheetByName('報告書シート');
                $inputNamedRange = $spreadsheet->getNamedRange('入力セル_開始位置');
                $inputRange = $inputNamedRange->getRange(); // 例: '報告書シート!B6'
                foreach ($reportItem as $rowIndex => $rowData) {

                    if ($reportNo == 650) {
                        // ----------------------------------------------------------------------
                        // 管理目標全項目検査結果書（結果一覧（浄水池））の独自処理
                        // 
                        // ■下記の項目の場合、3行すべて入力セルを結合し、「〇/〇測定済み」をセットする
                        //  ・亜塩素酸(項目番号：3090)
                        //  ・ジクロロアセトニトリル(項目番号：3120)
                        //  ・抱水クロラール(項目番号：3130)
                        // 
                        // ■下記の項目の場合、入力セルの背景色をグレーにする
                        //  ・残留塩素(項目番号：3150)
                        //  ・遊離炭酸(項目番号：3160)
                        //  ・有機物等（過マンガン酸カリウム消費量）(項目番号：3190)
                        //  ・臭気強度（ＴＯＮ）(項目番号：3200)
                        //  ・腐食性（ランゲリア指数）(項目番号：3210)
                        //  ・従属栄養細菌（培養７日後）(項目番号：5240)
                        // ----------------------------------------------------------------------
                        // シート名とセルアドレスを分離
                        list(, $cellAddress) = explode('!', $inputRange); // 'B6'
                        preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $inputMatches);
                        $inputStartColumn = $inputMatches[1]; // 'B'
                        $inputStartRow = (int)$inputMatches[2]; // 6

                        if ($rowData->item_no == 3090) {
                            // ----------------------------------------------------------------------
                            // 「亜塩素酸」の場合、3行すべて入力セルを結合し、「〇/〇測定済み」をセットする
                            // ----------------------------------------------------------------------

                            // 対象の行を算出
                            $targetStartIndex = $rowIndex + $inputStartRow;

                            // 終了列を算出（列を数値に変換して右に地点数分ずらす）
                            $inputColIndex = Coordinate::columnIndexFromString($inputStartColumn);      // (例)「C」 → 「3」に変換
                            $endColIndex = $inputColIndex + count($reportPoint) - 1;                    // (例) 1加算して「4」に更新
                            $endColString = Coordinate::stringFromColumnIndex($endColIndex);            // (例)「4」 → 「D」に変換

                            // 終了行を算出
                            $targetEndIndex = $rowIndex + $inputStartRow + 2;

                            // セルを結合
                            $mergeRange = $inputStartColumn . $targetStartIndex . ':' . $endColString . $targetEndIndex;
                            $sheet->mergeCells($mergeRange);

                            // 「〇/〇測定済み」を設定
                            $targetCell = $inputStartColumn . $targetStartIndex;
                            $sheet->setCellValue($targetCell, '〇/〇測定済み');

                            // 中央揃えを設定（水平・垂直）
                            $sheet->getStyle($targetCell)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        }


                        if ($rowData->item_no == 3150 || $rowData->item_no == 3160 || $rowData->item_no == 3190
                         || $rowData->item_no == 3200 || $rowData->item_no == 3210 || $rowData->item_no == 5240) {
                            $targetStartIndex = $rowIndex + $inputStartRow;

                            // ------------------------------------------
                            // 各入力セルの背景色をグレーに設定
                            // ------------------------------------------
                            for ($i = 0; $i < count($reportPoint); $i++) {
                                // 列を数値に変換して右に1列ずらす
                                $inputColIndex = Coordinate::columnIndexFromString($inputStartColumn);          // (例)「E」 → 「5」に変換
                                $newInputColIndex = $inputColIndex + $i;                                        // (例) 1加算して「4」に更新
                                $newInputColString = Coordinate::stringFromColumnIndex($newInputColIndex);      // (例)「5」 → 「E」に変換

                                // 新しいセル参照を組み立て
                                $inputCell = '$' . $newInputColString . '$' . $targetStartIndex;

                                // 背景色をグレー (#D9D9D9) に設定
                                $sheet->getStyle($inputCell)
                                        ->getFill()
                                        ->setFillType(Fill::FILL_SOLID)
                                        ->getStartColor()
                                        ->setARGB('FFD9D9D9');
                            }
                        }
                    } else if ($reportNo == 651) {
                        // ----------------------------------------------------------------------
                        // 管理目標全項目検査結果書（結果一覧（配水池））の独自処理
                        // 
                        // ■下記の項目の場合、3行すべて入力セルを結合し、「〇/〇測定済み」をセットする
                        //  ・亜塩素酸(項目番号：3090)
                        //  ・ジクロロアセトニトリル(項目番号：3120)
                        //  ・抱水クロラール(項目番号：3130)
                        // 
                        // ■下記の項目の場合、入力セルの背景色をグレーにする
                        //  ・残留塩素(項目番号：3150)
                        //  ・有機物等（過マンガン酸カリウム消費量）(項目番号：3190)
                        //  ・臭気強度（ＴＯＮ）(項目番号：3200)
                        //  ・従属栄養細菌（培養７日後）(項目番号：5240)
                        // ----------------------------------------------------------------------
                        // ----------------------------------------------------------------------
                        // シート名とセルアドレスを分離
                        list(, $cellAddress) = explode('!', $inputRange); // 'E6'
                        preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $inputMatches);
                        $inputStartColumn = $inputMatches[1];           // 列位置：'E'
                        $inputStartRow = (int)$inputMatches[2];         // 行目：6

                        if ($rowData->item_no == 3090) {
                            // ----------------------------------------------------------------------
                            // 「亜塩素酸」の場合、3行すべて入力セルを結合し、「〇/〇測定済み」をセットする
                            // ----------------------------------------------------------------------

                            // 対象の行を算出
                            $targetStartIndex = $rowIndex + $inputStartRow;

                            // 終了列を算出（列を数値に変換して右に地点数分ずらす）
                            $inputColIndex = Coordinate::columnIndexFromString($inputStartColumn);      // (例)「E」 → 「5」に変換
                            $endColIndex = $inputColIndex + count($reportPoint) - 1;                    // (例) 1加算して「4」に更新
                            $endColString = Coordinate::stringFromColumnIndex($endColIndex);            // (例)「5」 → 「E」に変換

                            // 終了行を算出
                            $targetEndIndex = $rowIndex + $inputStartRow + 2;

                            // セルを結合
                            $mergeRange = $inputStartColumn . $targetStartIndex . ':' . $endColString . $targetEndIndex;
                            $sheet->mergeCells($mergeRange);

                            // 「〇/〇測定済み」を設定
                            $targetCell = $inputStartColumn . $targetStartIndex;
                            $sheet->setCellValue($targetCell, '〇/〇測定済み');

                            // 中央揃えを設定（水平・垂直）
                            $sheet->getStyle($targetCell)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        }

                        $grayOutTargetItem = [3150, 3190, 3200, 5240];          // 背景色をグレーの対象項目
                        if (in_array($rowData->item_no, $grayOutTargetItem)) {
                            // 対象の行を算出
                            $targetStartIndex = $rowIndex + $inputStartRow;

                            // ------------------------------------------
                            // 各入力セルの背景色をグレーに設定
                            // ------------------------------------------
                            for ($i = 0; $i < count($reportPoint); $i++) {
                                // 列を数値に変換して右に1列ずらす
                                $inputColIndex = Coordinate::columnIndexFromString($inputStartColumn);          // (例)「E」 → 「5」に変換
                                $newInputColIndex = $inputColIndex + $i;                                        // (例) 1加算して「4」に更新
                                $newInputColString = Coordinate::stringFromColumnIndex($newInputColIndex);      // (例)「5」 → 「E」に変換

                                // 新しいセル参照を組み立て
                                $inputCell = '$' . $newInputColString . '$' . $targetStartIndex;

                                // 背景色をグレー (#D9D9D9) に設定
                                $sheet->getStyle($inputCell)
                                    ->getFill()
                                    ->setFillType(Fill::FILL_SOLID)
                                    ->getStartColor()
                                    ->setARGB('FFD9D9D9');
                            }
                        }
                    } else if ($reportNo == 652) {
                        // ----------------------------------------------------------------------
                        // 管理目標全項目検査結果書（結果一覧（原水））の独自処理
                        // 
                        // ■下記の項目の場合、入力セルに斜線を引く
                        //  ・亜塩素酸(項目番号：3090)
                        //  ・ジクロロアセトニトリル(項目番号：3120)
                        //  ・抱水クロラール(項目番号：3130)
                        //  ・残留塩素(項目番号：3150)
                        //  ・遊離炭酸(項目番号：3160)
                        //  ・腐食性（ランゲリア指数）(項目番号：3210)
                        //  ・従属栄養細菌（培養７日後）(項目番号：5240)
                        // ----------------------------------------------------------------------
                        // ----------------------------------------------------------------------
                        // シート名とセルアドレスを分離
                        list(, $cellAddress) = explode('!', $inputRange); // 'E6'
                        preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $inputMatches);
                        $inputStartColumn = $inputMatches[1];           // 列位置：'E'
                        $inputStartRow = (int)$inputMatches[2];         // 行目：6

                        $diagonalLineTargetItem = [3090, 3120, 3130, 3150, 3160, 3210, 5240];          // 各入力セルに斜線を引く
                        if (in_array($rowData->item_no, $diagonalLineTargetItem)) {
                            // 対象の行を算出
                            $targetStartIndex = $rowIndex + $inputStartRow;

                            // ------------------------------------------
                            // 各入力セルに斜線を引く
                            // ------------------------------------------
                            for ($i = 0; $i < count($reportPoint); $i++) {
                                // 列を数値に変換して右に1列ずらす
                                $inputColIndex = Coordinate::columnIndexFromString($inputStartColumn);          //「E」 → 「5」に変換
                                $newInputColIndex = $inputColIndex + $i;                                        // (例) 1加算して「4」に更新
                                $newInputColString = Coordinate::stringFromColumnIndex($newInputColIndex);      // (例)「5」 → 「E」に変換

                                // 新しいセル参照を組み立て
                                $inputCell = '$' . $newInputColString . '$' . $targetStartIndex;

                                // 斜線を設定
                                $sheet->getStyle($inputCell)->getBorders()->getDiagonal()->setBorderStyle(Border::BORDER_THIN);
                                $sheet->getStyle($inputCell)->getBorders()->setDiagonalDirection(Borders::DIAGONAL_UP);

                                // 値をクリア
                                $sheet->setCellValue($inputCell, '');
                            }
                        }
                    }
                }
            } else if ($reportConfig->report_type == 9) {
                // ----------------------------------------------------------------------
                // ■下記の項目の場合、「検出値 (mg/L)」と「検出値/目標値」のセルを斜線を引く
                //   ・カルタップ(項目番号：7134)
                //   ・ダゾメット，メタム及びメチルイソチオシアネート(項目番号：7150)
                //   ・ピラクロニル(項目番号：7153)
                //   ・フェリムゾン(項目番号：7157)
                //   ・プロチオホス(項目番号：7161)
                // 
                // ■下記の項目の場合、項目名の左隣に「※2」を付与する
                //   ・カルタップ(項目番号：7134)
                //   ・グルホシネート(項目番号：7137)
                //   ・ジチオカルバメート系農薬(項目番号：7173)
                //   ・ダゾメット，メタム及びメチルイソチオシアネート(項目番号：7150)
                //   ・パラコート(項目番号：7152)
                //   ・ピラクロニル(項目番号：7153)
                //   ・フェリムゾン(項目番号：7157)
                //   ・プロチオホス(項目番号：7161)
                // 
                // ■「用途」の項目を設定
                // 
                // ■ジチオカルバメート系農薬(項目番号：7173)の「目標値 (mg/L)」セルを結合
                // ----------------------------------------------------------------------
                $sheet = $spreadsheet->getSheetByName('報告書シート');
                $inputNamedRange = $spreadsheet->getNamedRange('入力セル_開始位置');
                $inputRange = $inputNamedRange->getRange(); // 例: '報告書シート!B6'

                // シート名とセルアドレスを分離
                list(, $cellAddress) = explode('!', $inputRange); // 'B6'
                preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $inputMatches);
                $inputStartColumn = $inputMatches[1]; // 'B'
                $inputStartRow = (int)$inputMatches[2]; // 6

                // 「検出値 (mg/L)」の開始位置（列と行）を取得
                $kensyutuColumnIndex = Coordinate::columnIndexFromString($inputStartColumn) + 1;
                $kensyutuColumnLetter = Coordinate::stringFromColumnIndex($kensyutuColumnIndex);
                $kensyutuRow = $inputStartRow;

                // 「検出値/目標値」の開始位置（列と行）を取得
                $mokuhyouColumnIndex = Coordinate::columnIndexFromString($inputStartColumn) + 3;
                $mokuhyouColumnLetter = Coordinate::stringFromColumnIndex($mokuhyouColumnIndex);
                $mokuhyouRow = $inputStartRow;
                
                // 「※2」の開始位置（列と行）を取得
                preg_match('/^([A-Z]+)(\d+)$/', $reportConfig->row_start_cell_name, $matches);
                $komeColumnIndex = Coordinate::columnIndexFromString($matches[1]) - 1;
                $komeColumnLetter = Coordinate::stringFromColumnIndex($komeColumnIndex);
                $komeRow = (int)$matches[2];

                // 用途欄の開始位置（列と行）を取得
                $youtoColumnIndex = Coordinate::columnIndexFromString($matches[1]) + 2;
                $youtoColumnLetter = Coordinate::stringFromColumnIndex($youtoColumnIndex);
                $youtoRow = (int)$matches[2];

                // 「ジチオカルバメート系農薬」結合の開始位置（列と行）を取得
                $ketugouColumnIndex = Coordinate::columnIndexFromString($inputStartColumn) - 1;
                $ketugouColumnLetter = Coordinate::stringFromColumnIndex($ketugouColumnIndex);
                $ketugouRow = $inputStartRow;

                $rowIndex = 0;
                foreach ($reportItem as $rowData) {
                    // 採水年月日、採水場所、農薬類（検出指標値）はヘッダー部分なので次の項目へ
                    if ($rowData->item_no == 1 || $rowData->item_no == 1164 || $rowData->item_no == 3140) {
                        continue;
                    }

                    // ----------------------------------------------------------------------
                    // 斜線処理
                    // ----------------------------------------------------------------------
                    if ($rowData->item_no == 7134 || $rowData->item_no == 7150 || $rowData->item_no == 7153
                     || $rowData->item_no == 7157 || $rowData->item_no == 7161) {
                        // ----------------------------------------------------------------------
                        // 「検出値 (mg/L)」の斜線処理
                        // ----------------------------------------------------------------------
                        $margeEndColIndex = $kensyutuColumnIndex + 1;
                        $margeEndColLetter = Coordinate::stringFromColumnIndex($margeEndColIndex);

                        // マージを実施
                        $mergeStartCell = $kensyutuColumnLetter . strval($kensyutuRow + $rowIndex);
                        $mergeEndCell = $margeEndColLetter . strval($kensyutuRow + $rowIndex);
                        $sheet->mergeCells($mergeStartCell . ':' . $mergeEndCell);

                        // 斜線を設定
                        $sheet->getStyle($mergeStartCell)->getBorders()->getDiagonal()->setBorderStyle(Border::BORDER_THIN);
                        $sheet->getStyle($mergeStartCell)->getBorders()->setDiagonalDirection(Borders::DIAGONAL_UP);

                        // ----------------------------------------------------------------------
                        // 「検出値/目標値」の斜線処理
                        // ----------------------------------------------------------------------
                        // 対象セルを取得
                        $mokuhyouCell = $mokuhyouColumnLetter . strval($mokuhyouRow + $rowIndex);

                        // 設定されている数式を削除
                        $sheet->setCellValue($mokuhyouCell, '');

                        // 斜線を設定
                        $sheet->getStyle($mokuhyouCell)->getBorders()->getDiagonal()->setBorderStyle(Border::BORDER_THIN);
                        $sheet->getStyle($mokuhyouCell)->getBorders()->setDiagonalDirection(Borders::DIAGONAL_UP);
                    }

                    // ----------------------------------------------------------------------
                    // 「※2」を付与
                    // ----------------------------------------------------------------------
                    if ($rowData->item_no == 7134 || $rowData->item_no == 7137 || $rowData->item_no == 7173 || $rowData->item_no == 7150
                     || $rowData->item_no == 7152 || $rowData->item_no == 7153 || $rowData->item_no == 7157 || $rowData->item_no == 7161) {
                        // 対象セルを取得
                        $komeCell = $komeColumnLetter . strval($komeRow + $rowIndex);

                        // 「※2」を設定
                        $sheet->setCellValue($komeCell, '※2');
                    }

                    // ----------------------------------------------------------------------
                    // 用途欄の設定
                    // ----------------------------------------------------------------------
                    foreach(config('const.youtoList') as $itemNo => $youtoName){
                        if ($rowData->item_no == $itemNo) {
                            // 対象セルを取得
                            $youtoCell = $youtoColumnLetter . strval($youtoRow + $rowIndex);

                            // 用途の名称を設定
                            $sheet->setCellValue($youtoCell, $youtoName);
                        }
                    }

                    // ----------------------------------------------------------------------
                    // ジチオカルバメート系農薬の「目標値 (mg/L)」セルを結合
                    // ----------------------------------------------------------------------
                    if ($rowData->item_no == 7173) {
                        // マージ終了位置を取得
                        $margeEndColIndex = $ketugouColumnIndex + 1;
                        $margeEndColLetter = Coordinate::stringFromColumnIndex($margeEndColIndex);

                        // マージ開始終了位置を取得
                        $mergeStartCell = $ketugouColumnLetter . strval($ketugouRow + $rowIndex);
                        $mergeEndCell = $margeEndColLetter . strval($ketugouRow + $rowIndex);

                        // 数式が消えてしまうので、結合前に値をコピー
                        $sheet->setCellValue($mergeStartCell, $sheet->getCell($mergeEndCell)->getValue());

                        // マージを実施
                        $sheet->mergeCells($mergeStartCell . ':' . $mergeEndCell);

                        // 中央揃えを設定（水平・垂直）
                        $sheet->getStyle($mergeStartCell)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle($mergeStartCell)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                    }

                    $rowIndex++;
                }

            // 報告書タイプ：消毒副生成物（目標・要検討）検査結果書
            } else if ($reportConfig->report_type == 17) {
                // ----------------------------------------------------------------------
                // 消毒副生成物（目標・要検討）検査結果書の独自処理
                // 
                // ■地点名称の1行上に浄水場名を出力
                // 
                // ■下記の項目の場合、入力セルを結合して斜線を引く
                //   ・ブロモクロロ酢酸(項目番号：4270)
                //   ・ブロモジクロロ酢酸(項目番号：4280)
                //   ・ジブロモクロロ酢酸(項目番号：4290)
                //   ・ブロモ酢酸(項目番号：4300)
                //   ・ジブロモ酢酸(項目番号：4310)
                //   ・トリブロモ酢酸(項目番号：4320)
                //   ・トリクロロアセトニトリル(項目番号：4330)
                //   ・ブロモクロロアセトニトリル(項目番号：4340)
                //   ・ジブロモアセトニトリル(項目番号：4350)
                //   ・アセトアルデヒド(項目番号：4360)
                // ----------------------------------------------------------------------
                $sheet = $spreadsheet->getSheetByName('報告書シート');
                
                // ------------------------------------------
                // 地点名称の1行上に浄水場名を出力
                // ------------------------------------------
                // 開始位置の行を取得
                preg_match('/^([A-Z]+)(\d+)$/', $reportConfig->col_start_cell_name, $matches);
                $startCol = $matches[1];
                $startRow = (int)$matches[2];

                foreach ($reportPoint as $colIndex => $colData) {
                    // 浄水場セルを算出
                    $currentColumnIndex = Coordinate::columnIndexFromString($startCol) + ($colIndex * 2);
                    $currentColumnLetter = Coordinate::stringFromColumnIndex($currentColumnIndex);
                    $currentRowIndex = $startRow - 1;
                    $sisetuCell = $currentColumnLetter . $currentRowIndex;

                    // 浄水場データを貼り付け
                    $sheet->setCellValue($sisetuCell, $colData->sisetu_name);
                }

                // ------------------------------------------
                // 各入力セルを結合して斜線を引く
                // ------------------------------------------
                $inputNamedRange = $spreadsheet->getNamedRange('入力セル_開始位置');
                $inputRange = $inputNamedRange->getRange(); // 例: '報告書シート!B6'

                // シート名とセルアドレスを分離
                list(, $cellAddress) = explode('!', $inputRange); // 'B6'
                preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $inputMatches);

                $inputStartColumn = $inputMatches[1]; // 'B'
                $inputStartRow = (int)$inputMatches[2]; // 6

                foreach ($reportItem as $rowIndex => $rowData) {
                    // 下記の項目の場合、入力セルを結合して斜線を引く
                    if ($rowData->item_no == 4270 || $rowData->item_no == 4280 || $rowData->item_no == 4290 || $rowData->item_no == 4300 || $rowData->item_no == 4310
                     || $rowData->item_no == 4320 || $rowData->item_no == 4330 || $rowData->item_no == 4340 || $rowData->item_no == 4350 || $rowData->item_no == 4360) {
                        // 対象の行を算出
                        $targetIndex = $rowIndex + $inputStartRow;

                        // 終了列を算出（列を数値に変換して右に地点数分ずらす）
                        $inputColIndex = Coordinate::columnIndexFromString($inputStartColumn);      // (例)「E」 → 「5」に変換
                        $endColIndex = $inputColIndex + 1;                                          // (例) 1加算して「4」に更新
                        $endColString = Coordinate::stringFromColumnIndex($endColIndex);            // (例)「5」 → 「E」に変換

                        // セルを結合
                        $startCell = $inputStartColumn . $targetIndex;
                        $endCell = $endColString . $targetIndex;
                        $mergeRange = $startCell . ':' . $endCell;
                        $sheet->mergeCells($mergeRange);

                        // 斜線を設定
                        $sheet->getStyle($startCell)->getBorders()->getDiagonal()->setBorderStyle(Border::BORDER_THIN);
                        $sheet->getStyle($startCell)->getBorders()->setDiagonalDirection(Borders::DIAGONAL_UP);

                        // 値をクリア
                        $sheet->setCellValue($startCell, '');
                    }
                }

            // 報告書タイプ：消毒副生成物（目標・要検討）検査結果書（結果一覧)
            } else if ($reportConfig->report_type == 18) {
                // ----------------------------------------------------------------------
                // 消毒副生成物（目標・要検討）検査結果書（結果一覧)の独自処理
                // 
                // ■地点名称の1行上に浄水場名を出力
                // 
                // ■下記の項目の場合、入力セルを結合して斜線を引く
                //   ・ブロモクロロ酢酸(項目番号：4270)
                //   ・ジブロモクロロ酢酸(項目番号：4290)
                //   ・ブロモ酢酸(項目番号：4300)
                //   ・トリブロモ酢酸(項目番号：4320)
                //   ・トリクロロアセトニトリル(項目番号：4330)
                //   ・ブロモクロロアセトニトリル(項目番号：4340)
                //   ・アセトアルデヒド(項目番号：4360)
                // ----------------------------------------------------------------------
                $sheet = $spreadsheet->getSheetByName('報告書シート');

                // ------------------------------------------
                // 地点名称の1行上に浄水場名を出力
                // ------------------------------------------
                // 開始位置の行を取得
                preg_match('/^([A-Z]+)(\d+)$/', $reportConfig->col_start_cell_name, $matches);
                $startCol = $matches[1];
                $startRow = (int)$matches[2];

                foreach ($reportPoint as $colIndex => $colData) {
                    // 浄水場セルを算出
                    $currentColumnIndex = Coordinate::columnIndexFromString($startCol) + $colIndex;
                    $currentColumnLetter = Coordinate::stringFromColumnIndex($currentColumnIndex);
                    $currentRowIndex = $startRow - 1;
                    $sisetuCell = $currentColumnLetter . $currentRowIndex;

                    // 浄水場データを貼り付け
                    $sheet->setCellValue($sisetuCell, $colData->sisetu_name);
                }

                // ------------------------------------------
                // 各入力セルを結合して斜線を引く
                // ------------------------------------------
                $inputNamedRange = $spreadsheet->getNamedRange('入力セル_開始位置');
                $inputRange = $inputNamedRange->getRange(); // 例: '報告書シート!B6'

                // シート名とセルアドレスを分離
                list(, $cellAddress) = explode('!', $inputRange); // 'B6'
                preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $inputMatches);

                $inputStartColumn = $inputMatches[1]; // 'B'
                $inputStartRow = (int)$inputMatches[2]; // 6

                foreach ($reportPoint as $colIndex => $colData) {
                    if ($colData->point_no == 34) {
                        // 若柴配水池の場合、罫線を引く項目が無いため、continueする
                        continue;
                    }

                    foreach ($reportItem as $rowIndex => $rowData) {
                        // 下記の項目の場合、入力セルを結合して斜線を引く
                        if ($rowData->item_no == 4270 || $rowData->item_no == 4290 || $rowData->item_no == 4300 || $rowData->item_no == 4320
                         || $rowData->item_no == 4330 || $rowData->item_no == 4340 || $rowData->item_no == 4360) {
                            // 対象の行を算出
                            $targetIndex = $rowIndex + $inputStartRow;

                            // 終了列を算出（列を数値に変換して右に地点数分ずらす）
                            $inputColIndex = Coordinate::columnIndexFromString($inputStartColumn);      // (例)「E」 → 「5」に変換
                            $editIndex = $inputColIndex + $colIndex;                                    // (例) 1加算して「4」に更新
                            $targetString = Coordinate::stringFromColumnIndex($editIndex);              // (例)「5」 → 「E」に変換

                            // 斜線を設定
                            $startCell = $targetString . $targetIndex;
                            $sheet->getStyle($startCell)->getBorders()->getDiagonal()->setBorderStyle(Border::BORDER_THIN);
                            $sheet->getStyle($startCell)->getBorders()->setDiagonalDirection(Borders::DIAGONAL_UP);

                            // 値をクリア
                            $sheet->setCellValue($startCell, '');
                        }
                    }
                }

            // 報告書タイプ：年報（水質管理目標設定項目（全項目）検査結果）
            } else if ($reportConfig->report_type == 42) {
                // ----------------------------------------------------------------------
                // 年報（水質管理目標設定項目（全項目）検査結果）の独自処理
                // 
                // ■地点名称の1行上に浄水場名を出力
                // 
                // ■下記の項目の場合、入力セルを結合して「農薬類検査結果書参照」を設定
                //   ・農薬類(項目番号：3140)
                // ----------------------------------------------------------------------
                $sheet = $spreadsheet->getSheetByName('報告書シート');

                // ------------------------------------------
                // 地点名称の1行上に浄水場名を出力
                // ------------------------------------------
                // 開始位置の行を取得
                preg_match('/^([A-Z]+)(\d+)$/', $reportConfig->col_start_cell_name, $matches);
                $startCol = $matches[1];
                $startRow = (int)$matches[2];

                $bkPointName = '';
                foreach ($reportPoint as $colIndex => $colData) {
                    // 浄水場名が変わった場合に浄水場データを貼り付け
                    if ($bkPointName != $colData->sisetu_name) {
                        // 浄水場セルを算出
                        $currentColumnIndex = Coordinate::columnIndexFromString($startCol) + $colIndex;
                        $currentColumnLetter = Coordinate::stringFromColumnIndex($currentColumnIndex);
                        $currentRowIndex = $startRow - 1;
                        $sisetuCell = $currentColumnLetter . $currentRowIndex;

                        // 浄水場データを貼り付け
                        $sheet->setCellValue($sisetuCell, $colData->sisetu_name);
                        $bkPointName = $colData->sisetu_name;
                    }
                }
                
                // ------------------------------------------
                // 農薬類の入力セルを結合して
                // 「農薬類検査結果書参照」を設定
                // ------------------------------------------
                $inputNamedRange = $spreadsheet->getNamedRange('入力セル_開始位置');
                $inputRange = $inputNamedRange->getRange(); // 例: '報告書シート!B6'

                // シート名とセルアドレスを分離
                list(, $cellAddress) = explode('!', $inputRange); // 'B6'
                preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $inputMatches);

                $inputStartColumn = $inputMatches[1]; // 'B'
                $inputStartRow = (int)$inputMatches[2]; // 6

                foreach ($reportItem as $rowIndex => $rowData) {
                    // 下記の項目の場合、入力セルを結合して「農薬類検査結果書参照」を設定
                    if ($rowData->item_no == 3140) {
                        // 対象の行を算出
                        $targetIndex = $rowIndex + $inputStartRow;

                        // 終了列を算出（列を数値に変換して右に地点数分ずらす）
                        $inputColIndex = Coordinate::columnIndexFromString($inputStartColumn);      // (例)「E」 → 「5」に変換
                        $endColIndex = $inputColIndex + count($reportPoint) - 1;                    // (例) 加算して「6」に更新
                        $endColString = Coordinate::stringFromColumnIndex($endColIndex);            // (例)「6」 → 「F」に変換

                        // セルを結合
                        $startCell = $inputStartColumn . $targetIndex;
                        $endCell = $endColString . $targetIndex;
                        $mergeRange = $startCell . ':' . $endCell;
                        $sheet->mergeCells($mergeRange);

                        // 「農薬類検査結果書参照」を設定
                        $sheet->setCellValue($startCell, '農薬類検査結果書参照');

                        // 中央揃えを設定（水平・垂直）
                        $sheet->getStyle($startCell)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle($startCell)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                    }
                }

            // 報告書タイプ：年報（水質管理目標設定項目検査結果表）
            } else if ($reportConfig->report_type == 43) {
                // ----------------------------------------------------------------------
                // 年報（水質管理目標設定項目検査結果表）の独自処理
                // 
                // ■下記の項目の場合、入力セルを結合して「農薬類検査結果書参照」を設定
                //   ・農薬類(項目番号：3140)
                // ----------------------------------------------------------------------
                $sheet = $spreadsheet->getSheetByName('報告書シート');

                // ------------------------------------------
                // 農薬類の入力セルを結合して
                // 「農薬類検査結果書参照」を設定
                // ------------------------------------------
                $inputNamedRange = $spreadsheet->getNamedRange('入力セル_開始位置');
                $inputRange = $inputNamedRange->getRange(); // 例: '報告書シート!B6'

                // シート名とセルアドレスを分離
                list(, $cellAddress) = explode('!', $inputRange); // 'B6'
                preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $inputMatches);

                $inputStartColumn = $inputMatches[1]; // 'B'
                $inputStartRow = (int)$inputMatches[2]; // 6

                foreach ($reportItem as $rowIndex => $rowData) {
                    // 下記の項目の場合、入力セルを結合して「農薬類検査結果書参照」を設定
                    if ($rowData->item_no == 3140) {
                        // 対象の行を算出
                        $targetIndex = $rowIndex + $inputStartRow;

                        // 終了列を算出（12ヶ月+3(最大最小平均)）
                        $inputColIndex = Coordinate::columnIndexFromString($inputStartColumn);      // (例)「E」 → 「5」に変換
                        $endColIndex = $inputColIndex + 12 + 3 - 1;                                 // (例) 加算して「6」に更新
                        $endColString = Coordinate::stringFromColumnIndex($endColIndex);            // (例)「6」 → 「F」に変換

                        // セルを結合
                        $startCell = $inputStartColumn . $targetIndex;
                        $endCell = $endColString . $targetIndex;
                        $mergeRange = $startCell . ':' . $endCell;
                        $sheet->mergeCells($mergeRange);

                        // 「農薬類検査結果書参照」を設定
                        $sheet->setCellValue($startCell, '農薬類検査結果書参照');

                        // 中央揃えを設定（水平・垂直）
                        $sheet->getStyle($startCell)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle($startCell)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                    }
                }

            // 報告書タイプ：年報（藻類）
            } else if ($reportConfig->report_type == 44) {
                // ----------------------------------------------------------------------
                // 年報（藻類）の独自処理
                // 
                // ■「藍藻類」、「珪藻類」、「緑藻類」ごとにA列を結合し、線を引く
                // 
                // ■その他系の最初と最後に太線を引く
                // ----------------------------------------------------------------------
                $sheet = $spreadsheet->getSheetByName('報告書シート');

                // 分類位置を取得
                preg_match('/^([A-Z]+)(\d+)$/', $reportConfig->row_start_cell_name, $matches);
                $categoryColIndex = Coordinate::columnIndexFromString($matches[1]) - 1;
                $categoryColLetter = Coordinate::stringFromColumnIndex($categoryColIndex);
                $categoryRow = (int)$matches[2] + 1;

                // 取得した項目を並び替え
                $targetCategories = [81, 82, 83];
                $matchedItems = [];
                $matchedIndexes = [];

                // 対象カテゴリの要素とそのインデックスを抽出
                foreach ($reportItem as $index => $item) {
                    if (in_array($item->item_tyu_category_no, $targetCategories, true)) {
                        $matchedItems[] = $item;
                        $matchedIndexes[] = $index;
                    }
                }

                // 該当要素をitem_tyu_category_noの昇順でソート
                usort($matchedItems, function ($a, $b) {
                    return $a->item_tyu_category_no <=> $b->item_tyu_category_no;
                });

                // 元の配列に戻す（該当インデックスに上書き）
                foreach ($matchedIndexes as $i => $originalIndex) {
                    $reportItem[$originalIndex] = $matchedItems[$i];
                }

                $bkCategoryNo = 0;
                $targetStartRow = $categoryRow;
                foreach ($reportItem as $rowIndex => $rowData) {
                    if ($bkCategoryNo == 0) {
                        // 初回の場合
                        $bkCategoryNo = $rowData->item_tyu_category_no;

                    } else if ($bkCategoryNo != $rowData->item_tyu_category_no) {
                        if ($bkCategoryNo == 81 || $bkCategoryNo == 82 || $bkCategoryNo == 83) {
                            // ----------------------------------------------------------------------
                            // 項目中分類番号が変更された場合、結合してA列に分類名を設定
                            // ----------------------------------------------------------------------

                            // 終了行を算出
                            $targetEndRow = $rowIndex + $categoryRow - 2;

                            // セルを結合
                            $mergeRange = $categoryColLetter . $targetStartRow . ':' . $categoryColLetter . $targetEndRow;
                            $sheet->mergeCells($mergeRange);

                            // 分類を設定
                            $targetCell = $categoryColLetter . $targetStartRow;
                            if ($bkCategoryNo == 81) {
                                // 藍藻類の場合
                                $sheet->setCellValue($targetCell, '藍　藻　類');

                            } else if ($bkCategoryNo == 82) {
                                // 珪藻類の場合
                                $sheet->setCellValue($targetCell, '珪　藻　類');

                            } else if ($bkCategoryNo == 83) {
                                // 緑藻類の場合
                                $sheet->setCellValue($targetCell, '緑　藻　類');
                            }

                            // 下線を引く
                            $endColIndex = $categoryColIndex + 2 + count($reportTokusyuItemCol);
                            $endColLetter = Coordinate::stringFromColumnIndex($endColIndex);
                            $rangeBorder = $categoryColLetter . $targetEndRow . ':' . $endColLetter . $targetEndRow;
                            $sheet->getStyle($rangeBorder)->getBorders()->getBottom()->setBorderStyle(Border::BORDER_THIN);

                            if ($rowData->item_tyu_category_no == 8) {
                                // ----------------------------------------------------------------------
                                // 項目中分類番号が8の場合、右側の線を消して下線を点線にする
                                // ----------------------------------------------------------------------
                                $targetRow = $rowIndex + $categoryRow - 1;
                                $noneBorder = $categoryColLetter . $targetRow;
                                $sheet->getStyle($noneBorder)->getBorders()->getRight()->setBorderStyle(Border::BORDER_NONE);
                                $sheet->getStyle($noneBorder)->getBorders()->getBottom()->setBorderStyle(Border::BORDER_HAIR);
                            }

                            // 次の開始位置と項目中分類番号を設定
                            $targetStartRow = $targetEndRow + 1;

                        } else if ($rowData->item_no == 1) {
                            // ----------------------------------------------------------------------
                            // 先頭ではない採水年月日の場合、上線に太線を下線に線を引く
                            // ----------------------------------------------------------------------
                            $targetRow = $rowIndex + $categoryRow - 1;
                            $endColIndex = $categoryColIndex + 2 + count($reportTokusyuItemCol);
                            $endColLetter = Coordinate::stringFromColumnIndex($endColIndex);
                            $boldBorder = $categoryColLetter . $targetRow . ':' . $endColLetter . $targetRow;
                            $sheet->getStyle($boldBorder)->getBorders()->getTop()->setBorderStyle(Border::BORDER_MEDIUM);

                            $itemColIndex = $categoryColIndex + 1;
                            $itemColLetter = Coordinate::stringFromColumnIndex($itemColIndex);
                            $cellBorder = $itemColLetter . $targetRow . ':' . $endColLetter . $targetRow;
                            $sheet->getStyle($cellBorder)->getBorders()->getBottom()->setBorderStyle(Border::BORDER_THIN);

                            // ----------------------------------------------------------------------
                            // 先頭ではない採水年月日の場合、先頭の採水年月日と同じセルの参照先に補正する
                            // ----------------------------------------------------------------------
                            $itemColIndex   = $categoryColIndex + 3;
                            $itemColLetter  = Coordinate::stringFromColumnIndex($itemColIndex);
                            $copyStartRow   = $categoryRow - 1;

                            // 列インデックス
                            $endColIndex = Coordinate::columnIndexFromString($endColLetter);

                            // コピー元の行は固定
                            for ($colIndex = $itemColIndex; $colIndex <= $endColIndex; $colIndex++) {
                                $colLetter = Coordinate::stringFromColumnIndex($colIndex);
                                $srcCell   = $colLetter . $copyStartRow;

                                // 値（数式含む）を取得
                                $value = $sheet->getCell($srcCell)->getValue();

                                // 貼り付け先セル
                                $destCell = $colLetter . $targetRow;

                                // 値を貼り付け
                                $sheet->setCellValue($destCell, $value);

                                // スタイルもコピーしたい場合
                                $sheet->duplicateStyle(
                                    $sheet->getStyle($srcCell),
                                    $destCell
                                );
                            }
                        }

                        $bkCategoryNo = $rowData->item_tyu_category_no;

                    } else if ($rowData->item_tyu_category_no == 8) {
                        // ----------------------------------------------------------------------
                        // 項目中分類番号が8の場合、右側の線を消して下線を点線にする
                        // ----------------------------------------------------------------------
                        $targetRow = $rowIndex + $categoryRow - 1;
                        $noneBorder = $categoryColLetter . $targetRow;
                        $sheet->getStyle($noneBorder)->getBorders()->getRight()->setBorderStyle(Border::BORDER_NONE);
                        $sheet->getStyle($noneBorder)->getBorders()->getBottom()->setBorderStyle(Border::BORDER_HAIR);
                    }
                }

            // 報告書タイプ：年報（農薬類）
            } else if ($reportConfig->report_type == 45) {
                // ----------------------------------------------------------------------
                // 下記の項目の場合、入力セルの背景色をグレーにする
                //   ・カルタップ(項目番号：7134)
                //   ・ダゾメット，メタム及びメチルイソチオシアネート(項目番号：7150)
                //   ・ピラクロニル(項目番号：7153)
                //   ・フェリムゾン(項目番号：7157)
                //   ・プロチオホス(項目番号：7161)
                // ----------------------------------------------------------------------
                $sheet = $spreadsheet->getSheetByName('報告書シート');

                $inputNamedRange = $spreadsheet->getNamedRange('入力セル_開始位置');
                $inputRange = $inputNamedRange->getRange(); // 例: '報告書シート!B6'

                // シート名とセルアドレスを分離
                list(, $cellAddress) = explode('!', $inputRange); // 'B6'
                preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $inputMatches);

                $inputStartColumn = $inputMatches[1]; // 'B'
                $inputStartRow = (int)$inputMatches[2]; // 6

                foreach ($reportItem as $rowIndex => $rowData) {
                    if ($rowData->item_no == 7134 || $rowData->item_no == 7150 || $rowData->item_no == 7153
                     || $rowData->item_no == 7157 || $rowData->item_no == 7161) {

                        // 入力セルの開始列から特殊地点数分、入力セルの背景色をグレーアウト
                        foreach ($reportTokusyuItemCol as $colIndex => $colData) {
                            if ($colIndex == 0) {
                                // 列を数値に変換して右に1列ずらす
                                $inputColIndex = Coordinate::columnIndexFromString($inputStartColumn);        // (例)「C」 → 「3」に変換
                                $newInputColIndex = $inputColIndex - 1;                                       // (例) 1減算して「2」に更新
                                $newInputColString = Coordinate::stringFromColumnIndex($newInputColIndex);    // (例)「2」 → 「B」に変換
                                $newRowIndex = $inputStartRow + $rowIndex;

                                // 新しいセル参照を組み立て
                                $inputCell = '$' . $newInputColString . '$' . $newRowIndex;

                                // 背景色をグレー (#D9D9D9) に設定
                                $sheet->getStyle($inputCell)
                                    ->getFill()
                                    ->setFillType(Fill::FILL_SOLID)
                                    ->getStartColor()
                                    ->setARGB('FFD9D9D9');
                            }

                            // 列を数値に変換して右に1列ずらす
                            $inputColIndex = Coordinate::columnIndexFromString($inputStartColumn);        // (例)「C」 → 「3」に変換
                            $newInputColIndex = $inputColIndex + $colIndex;                               // (例) 1加算して「4」に更新
                            $newInputColString = Coordinate::stringFromColumnIndex($newInputColIndex);    // (例)「4」 → 「D」に変換
                            $newRowIndex = $inputStartRow + $rowIndex;

                            // 新しいセル参照を組み立て
                            $inputCell = '$' . $newInputColString . '$' . $newRowIndex;

                            // 背景色をグレー (#D9D9D9) に設定
                            $sheet->getStyle($inputCell)
                                ->getFill()
                                ->setFillType(Fill::FILL_SOLID)
                                ->getStartColor()
                                ->setARGB('FFD9D9D9');
                        }
                    }
                }

            // 報告書タイプ：要検討項目検査結果書（ミクロキスチン）
            } else if ($reportConfig->report_type == 47) {
                // ----------------------------------------------------------------------
                // 要検討項目検査結果書（ミクロキスチン）の独自処理
                // 
                // ■地点名称の1行上に浄水場名を出力
                // 
                // ■下記地点の場合は浄水場名を出力せず、セルの結合を行う
                //  ・木原取水場(地点番号：16)
                //  ・霞ヶ浦用水取水口(地点番号：10)
                // ----------------------------------------------------------------------
                $sheet = $spreadsheet->getSheetByName('報告書シート');
                
                // ------------------------------------------
                // 地点名称の1行上に浄水場名を出力
                // ------------------------------------------
                // 開始位置の行を取得
                preg_match('/^([A-Z]+)(\d+)$/', $reportConfig->col_start_cell_name, $matches);
                $startCol = $matches[1];
                $startRow = (int)$matches[2];

                foreach ($reportPoint as $colIndex => $colData) {
                    if ($colData->point_no == 16 || $colData->point_no == 10) {
                        // セル結合位置を算出
                        $mergeColIndex = Coordinate::columnIndexFromString($startCol) + ($colIndex);
                        $mergecolString = Coordinate::stringFromColumnIndex($mergeColIndex);
                        $jyousuiRow = $startRow - 1;
                        $startCell = $mergecolString . $jyousuiRow;
                        $endCell = $mergecolString . $startRow;

                        // セルを結合
                        $mergeRange = $startCell . ':' . $endCell;
                        $sheet->mergeCells($mergeRange);

                        // 結合した際に値が消えるため、再度設定
                        $sheet->setCellValue($startCell, $colData->cell_name);

                        // 中央揃えを設定（水平・垂直）
                        $sheet->getStyle($startCell)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle($startCell)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

                    } else {
                        // 浄水場セルを算出
                        $currentColumnIndex = Coordinate::columnIndexFromString($startCol) + ($colIndex);
                        $currentColumnLetter = Coordinate::stringFromColumnIndex($currentColumnIndex);
                        $currentRowIndex = $startRow - 1;
                        $sisetuCell = $currentColumnLetter . $currentRowIndex;

                        // 浄水場データを貼り付け
                        $sheet->setCellValue($sisetuCell, $colData->sisetu_name);
                    }
                }

            // 報告書タイプ：要検討項目検査結果書（結果一覧）
            } else if ($reportConfig->report_type == 50) {
                // ----------------------------------------------------------------------
                // 要検討項目検査結果書（結果一覧）の独自処理
                // 
                // ■地点名称の1行上に浄水場名を出力
                // 
                // ■下記の項目の場合、入力セルを結合して斜線を引く
                //   ・フタル酸ジ-n-ブチル(項目番号：4230)
                //   ・フタル酸ブチルベンジル(項目番号：4240)
                //   ・キシレン(項目番号：4390)
                //   ・アニリン(項目番号：4432)
                //   ・ニトリロ三酢酸（NTA）(項目番号：4438)
                // ----------------------------------------------------------------------
                $sheet = $spreadsheet->getSheetByName('報告書シート');

                // ------------------------------------------
                // 地点名称の1行上に浄水場名を出力
                // ------------------------------------------
                // 開始位置の行を取得
                preg_match('/^([A-Z]+)(\d+)$/', $reportConfig->col_start_cell_name, $matches);
                $startCol = $matches[1];
                $startRow = (int)$matches[2];

                foreach ($reportPoint as $colIndex => $colData) {
                    // 浄水場セルを算出
                    $currentColumnIndex = Coordinate::columnIndexFromString($startCol) + $colIndex;
                    $currentColumnLetter = Coordinate::stringFromColumnIndex($currentColumnIndex);
                    $currentRowIndex = $startRow - 1;
                    $sisetuCell = $currentColumnLetter . $currentRowIndex;

                    if ($colData->point_no == 16) {
                        // 木原取水場の場合
                        $sisetu_name = "霞ヶ浦浄水場\n阿見浄水場";
                        $sheet->setCellValue($sisetuCell, $sisetu_name);

                    } else if ($colData->point_no == 10) {
                        // 霞ヶ浦用水取水口の場合
                        $sisetu_name = "関城浄水場\n新治浄水場";
                        $sheet->setCellValue($sisetuCell, $sisetu_name);

                    } else {
                        // 浄水場データを貼り付け
                        $sheet->setCellValue($sisetuCell, $colData->sisetu_name);
                    }
                }

                // ------------------------------------------
                // 各入力セルを結合して斜線を引く
                // ------------------------------------------
                $inputNamedRange = $spreadsheet->getNamedRange('入力セル_開始位置');
                $inputRange = $inputNamedRange->getRange(); // 例: '報告書シート!B6'

                // シート名とセルアドレスを分離
                list(, $cellAddress) = explode('!', $inputRange); // 'B6'
                preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $inputMatches);

                $inputStartColumn = $inputMatches[1]; // 'B'
                $inputStartRow = (int)$inputMatches[2]; // 6

                foreach ($reportPoint as $colIndex => $colData) {
                    if ($colData->point_no == 16 || $colData->point_no == 30) {
                        // 木原取水場と霞ヶ浦浄水池の場合、罫線を引く項目が無いため、continueする
                        continue;
                    }

                    foreach ($reportItem as $rowIndex => $rowData) {
                        // 下記の項目の場合、入力セルを結合して斜線を引く
                        if ($rowData->item_no == 4230 || $rowData->item_no == 4240 || $rowData->item_no == 4390
                         || $rowData->item_no == 4432 || $rowData->item_no == 4438) {
                            // 対象の行を算出
                            $targetIndex = $rowIndex + $inputStartRow;

                            // 終了列を算出（列を数値に変換して右に地点数分ずらす）
                            $inputColIndex = Coordinate::columnIndexFromString($inputStartColumn);      // (例)「E」 → 「5」に変換
                            $editIndex = $inputColIndex + $colIndex;                                    // (例) 1加算して「4」に更新
                            $targetString = Coordinate::stringFromColumnIndex($editIndex);              // (例)「5」 → 「E」に変換

                            // 斜線を設定
                            $startCell = $targetString . $targetIndex;
                            $sheet->getStyle($startCell)->getBorders()->getDiagonal()->setBorderStyle(Border::BORDER_THIN);
                            $sheet->getStyle($startCell)->getBorders()->setDiagonalDirection(Borders::DIAGONAL_UP);

                            // 値をクリア
                            $sheet->setCellValue($startCell, '');
                        }
                    }
                }

            // 報告書タイプ：取水原水全項目検査結果書
            } else if ($reportConfig->report_type == 54) {
                // ----------------------------------------------------------------------
                // 基準値設定
                // ----------------------------------------------------------------------
                $sheet = $spreadsheet->getSheetByName('報告書シート');

                foreach ($reportItem as $rowData) {
                    // 基準値セルに基準値を貼り付け
                    if (!is_null($rowData->base_cell_name)) {
                        // 基準値セル名から格納位置を取得
                        $namedRange = $spreadsheet->getNamedRange($rowData->base_cell_name);
                        $kijyunCell = $namedRange->getRange();

                        // シート名とセルアドレスを分離（シート名が含まれていない場合も考慮）
                        if (strpos($kijyunCell, '!') !== false) {
                            list(, $cellAddress) = explode('!', $kijyunCell);
                        } else {
                            $cellAddress = $kijyunCell;
                        }
                        preg_match('/\$(\w+)\$(\d+)/', $cellAddress, $matches);

                        $commentColumn = $matches[1]; // 'B'
                        $commentRow = (int)$matches[2]; // 6

                        // 列を数値に変換
                        $commentColumnIndex = Coordinate::columnIndexFromString($commentColumn);            // (例)「C」 → 「3」に変換
                        $commentColumnIndex = $commentColumnIndex + 1;
                        $commentColLetter = Coordinate::stringFromColumnIndex($commentColumnIndex);         // (例)「4」 → 「D」に変換
                        $kijyunCommentCell = $commentColLetter . $commentRow;
                        
                        $commentData = '';
                        if ($rowData->item_no == 2010) {
                            // 検査項目「大腸菌(定性)」の場合
                            $trimeData = '検出されないこと';

                        } else if ($rowData->item_no == 2450) {
                            // 検査項目「pH値」の場合
                            $trimeData = rtrim(rtrim($rowData->regulation_low_limit, '0'), '.') . '～' . rtrim(rtrim($rowData->regulation_up_limit, '0'), '.');

                        } else if ($rowData->item_no == 2470) {
                            // 検査項目「臭気」の場合
                            $trimeData = '異常なし';

                        } else {
                            // 上記以外は検査基準マスタの規制上限値を出力
                            $trimeData = rtrim(rtrim($rowData->regulation_up_limit, '0'), '.');
                            $commentData = $rowData->item_unit . '以下';
                        }

                        // 指定されたセルに基準値を貼り付け
                        $sheet->setCellValue($kijyunCell, $trimeData);
                        $sheet->setCellValue($kijyunCommentCell, $commentData);
                    }
                }
            }

            return true;
        } catch (\Exception $e) {
            \Log::error($e->getMessage());
            \Log::error($e->getTraceAsString());
            return false;
        }
    }

    public function getCurrentDisplayTime()
    {
        // サーバー時刻を取得
        $getCurrentDisplayTime = $this->commonDao->getCurrentDisplayTime();

        // Carbonで文字列を解析（サブセカンドデータも自動で読み込まれる）
        $dt = Carbon::parse($getCurrentDisplayTime->server_time);

        // ミリ秒 (`v`) を含むターゲットフォーマットで整形
        $target_format = $dt->format('Y-m-d H:i:s.v');

        return $target_format;
    }

    // 選択した画面の入力画面番号を取得
    public function getSelectedDspNo($input_menu_no){
        return $this->commonDao->getSelectedDspNo($input_menu_no);
    }
}
