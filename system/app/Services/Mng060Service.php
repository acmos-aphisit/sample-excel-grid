<?php

namespace App\Services;

use App\Dao\Mng060Dao;
use App\Dao\CommonDao;
use Illuminate\Support\FacadesLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
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
class Mng060Service
{
    // 報告書出力DAO
    private $commonDao;
    private $Mng060Dao;

    private $templateFileName = 'trend_template.xlsx';
    private $saveFileName     = '/save_trend.xlsx';

    /**
     * コンストラクタ
     * 
     */
    public function __construct()
    {
        $this->commonDao = new CommonDao();
        $this->Mng060Dao = new Mng060Dao();
    }

    public function optionInputMenu()
    {
        return $this->Mng060Dao->optionInputMenu();
    }

    public function optionPoint()
    {
        return $this->Mng060Dao->optionPoint();
    }

    public function optionInspectionKbn()
    {
        return $this->Mng060Dao->optionInspectionKbn();
    }

    public function optionRptType()
    {
        return $this->Mng060Dao->optionRptType();
    }

    public function optionRptItem()
    {
        return $this->Mng060Dao->optionRptItem();
    }

    public function optionReport()
    {
        return $this->Mng060Dao->optionReport();
    }

    /**
     * 検査情報登録画面のメニューを取得
     * 
     */
    public function getReportMenu($affiliation_section_no, $security_level)
    {
        $getReportMenu = $this->commonDao->getReportMenu($affiliation_section_no, $security_level);
        $tuneUp = array();
        foreach ($getReportMenu as $key => $menu) {
            $tuneUp[] = array(
                'rowId'     => $menu->report_menu_no,
                'parentId'  => $menu->report_parent_menu_no !== $menu->report_menu_no ? $menu->report_parent_menu_no : null,
                'isParent'  => count(array_filter((array) $getReportMenu, fn($otherMenu) => $otherMenu->report_parent_menu_no == $menu->report_menu_no)) > 0,
                'text'      => explode(".xlsx", $menu->report_title)[0],
                'type'      => 'chevron',
                'isExpanded' => true,
                'showFlg'   => true,
                'level'     => $menu->report_hierarchy != null ? $menu->report_hierarchy : 0,
                'order'     => $menu->report_order
            );
        }

        return array(
            'status'    =>  'success',
            'menuData'  =>  $tuneUp,
        );
    }

    /**
     * メニューラベルを登録
     * 
     */
    public function saveMenuLabel($request)
    {
        DB::beginTransaction();
        try {
            // 新規登録
            if ($request->process_name == "menu_add") {
                // 登録されている順序の最大値 + 10の値を取得する。
                $getMaxOrder = $this->Mng060Dao->getReportMenuMaxOrder();
                $setMaxOrder = intval($getMaxOrder[0]->max) + 10;

                // 選択された親メニューの階層を取得する。
                $getCurHierarchy = $this->Mng060Dao->getReportMenuHierarchy($request->report_parent_menu_no);
                $setCurHierarchy = intval($getCurHierarchy[0]->report_hierarchy) + 1;

                // 新規登録処理
                $saveNewMenuLabel = $this->Mng060Dao->saveNewMenuLabel($request->report_parent_menu_no, $request->affiliation_section_no, $setCurHierarchy, $request->report_title, $setMaxOrder);

                // エラー発生
                if (!$saveNewMenuLabel) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            } else if ($request->process_name == "menu_edit") {
                // 更新

                // 排他チェック                
                $haitaReportMenuData = $this->Mng060Dao->haitaReportMenuData($request->report_menu_no, $request->display_time);
                if (!$haitaReportMenuData) {
                    return config('const.UPDATE_UPDATED_ERROR');
                }

                // 選択された親メニューの階層を取得する。 ※ 親ラベル編集した時、階層を更新
                $getCurHierarchy = $this->Mng060Dao->getReportMenuHierarchy($request->report_parent_menu_no);
                $setCurHierarchy = intval($getCurHierarchy[0]->report_hierarchy) + 1;

                // 更新処理
                $saveUpdateMenuLabel = $this->Mng060Dao->saveUpdateReportMenu($request->report_menu_no, $request->report_parent_menu_no, $request->affiliation_section_no, $setCurHierarchy, $request->report_title);

                // エラー発生
                if (!$saveUpdateMenuLabel) {
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
     * メニューの順序を取替
     * 
     */
    public function exchangeMenuOrder($request)
    {
        DB::beginTransaction();
        try {
            // 順序取替

            // 排他チェック                
            $haitaCurInputMenuData = $this->Mng060Dao->haitaInputMenuData($request->cur_menu_no, $request->display_time);
            if (!$haitaCurInputMenuData) {
                return config('const.UPDATE_UPDATED_ERROR');
            }

            $haitaTargetInputMenuData = $this->Mng060Dao->haitaInputMenuData($request->target_menu_no, $request->display_time);
            if (!$haitaTargetInputMenuData) {
                return config('const.UPDATE_UPDATED_ERROR');
            }

            // 移動対象の順序更新
            $saveUpdateCurMenuLabelOrder = $this->Mng060Dao->exchangeMenuOrder($request->cur_menu_no, $haitaTargetInputMenuData[0]->report_order);

            // エラー発生
            if (!$saveUpdateCurMenuLabelOrder) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }

            // 移動先の順序更新
            $saveUpdateTargetMenuLabelOrder = $this->Mng060Dao->exchangeMenuOrder($request->target_menu_no, $haitaCurInputMenuData[0]->report_order);

            // エラー発生
            if (!$saveUpdateTargetMenuLabelOrder) {
                DB::rollback();
                return config('const.OTHER_ERROR');
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
     * メニュー削除処理
     * 
     */
    public function deleteReportMenu($request)
    {
        DB::beginTransaction();
        try {
            // 排他チェック                
            $haitaCurReportMenuData = $this->Mng060Dao->haitaReportMenuData($request->report_menu_no, $request->display_time);
            if (!$haitaCurReportMenuData) {
                return config('const.UPDATE_UPDATED_ERROR');
            }

            // 報告書番号を取得
            $set_input_rpt_no = ($haitaCurReportMenuData[0]->report_no) ? $haitaCurReportMenuData[0]->report_no : null;

            // 移動先の順序更新
            $deleteReportMenu = $this->Mng060Dao->deleteReportMenu($request->report_menu_no, $set_input_rpt_no);

            // エラー発生
            if (!$deleteReportMenu) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }

            DB::commit();

            return config('const.DELETE_NO_ERROR');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return config('const.OTHER_ERROR');
        }
    }

    /**
     * 類似入力画面作成
     * 
     */
    public function duplicateInputMenuRpt($request)
    {
        DB::beginTransaction();
        try {
            // 報告書選択メニュー
            $getReportMenuData = $this->Mng060Dao->getReportMenuData($request->report_menu_no);
            if (!$getReportMenuData) {
                return config('const.OTHER_ERROR');
            }

            // 類似の報告番号
            $target_report_no = $getReportMenuData[0]->report_no;

            /**
             * ########### 報告書構成マスタ START ###########
             */
            if ($target_report_no) {
                // (2)-2 排他制御 報告書構成マスタ
                $haitaReportConfig = $this->Mng060Dao->haitaReportConfig($target_report_no, $request->display_time);
                if (!$haitaReportConfig) {
                    return config('const.UPDATE_UPDATED_ERROR');
                }

                // (2)-3 報告書構成マスタの登録
                $getReportConfigData = $this->Mng060Dao->getReportConfigData($target_report_no);
                if ($getReportConfigData) {
                    // (2)-3 報告書構成マスタ m_report_config
                    $duplicateReportConfig = $this->Mng060Dao->duplicateReportConfig($getReportConfigData[0]);

                    // エラー発生
                    if (!$duplicateReportConfig) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    }
                }
            }
            /** ########### 報告書構成マスタ END ########### */

            // (2)-1 報告書番号の取得
            $set_rpt_no = $duplicateReportConfig;

            // エラー発生
            if (!$set_rpt_no) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }

            /**
             * ########### 報告書項目マスタ START ###########
             */
            if ($target_report_no) {
                // (2)-4 排他制御 報告書項目マスタ
                $haitaReportItem = $this->Mng060Dao->haitaReportItem($target_report_no, $request->display_time);
                if ($haitaReportItem) {
                    return config('const.UPDATE_UPDATED_ERROR');
                }

                // (2)-5 報告書項目マスタの登録
                $getReportItemData = $this->Mng060Dao->getReportItemData($target_report_no);
                if ($getReportItemData) {
                    // (2)-5 報告書項目マスタの登録 m_report_item
                    foreach ($getReportItemData as $value) {
                        $duplicateReportItem = $this->Mng060Dao->duplicateReportItem($set_rpt_no, $value);
                        // エラー発生
                        if (!$duplicateReportItem) {
                            DB::rollback();
                            return config('const.OTHER_ERROR');
                        }
                    }
                }
            }
            /** ########### 報告書項目マスタ END ########### */

            /**
             * ########### 報告書地点マスタ START ###########
             */
            if ($target_report_no) {
                // (2)-6 排他制御 報告書地点マスタ
                $haitaReportPoint = $this->Mng060Dao->haitaReportPoint($target_report_no, $request->display_time);
                if ($haitaReportPoint) {
                    return config('const.UPDATE_UPDATED_ERROR');
                }

                // (2)-7 報告書地点マスタの登録
                $getReporPointData = $this->Mng060Dao->getReporPointData($target_report_no);
                if ($getReporPointData) {
                    foreach ($getReporPointData as $value) {
                        // (2)-7 報告書地点マスタの登録 m_report_item
                        $duplicateReportPoint = $this->Mng060Dao->duplicateReportPoint($set_rpt_no, $value);

                        // エラー発生
                        if (!$duplicateReportPoint) {
                            DB::rollback();
                            return config('const.OTHER_ERROR');
                        }
                    }
                }
            }
            /** ########### 報告書地点マスタ END ########### */

            /**
             * ########### 報告書固定文言マスタ START ###########
             */
            if ($target_report_no) {
                // (2)-8 排他制御 報告書固定文言マスタ
                $haitaReportText = $this->Mng060Dao->haitaReportText($target_report_no, $request->display_time);
                if ($haitaReportText) {
                    return config('const.UPDATE_UPDATED_ERROR');
                }

                // (2)-9 報告書固定文言マスタの登録
                $getReporTextData = $this->Mng060Dao->getReporTextData($target_report_no);
                if ($getReporTextData) {
                    foreach ($getReporTextData as $value) {
                        // (2)-9 報告書固定文言マスタの登録 m_report_text
                        $duplicateReportText = $this->Mng060Dao->duplicateReportText($set_rpt_no, $value);

                        // エラー発生
                        if (!$duplicateReportText) {
                            DB::rollback();
                            return config('const.OTHER_ERROR');
                        }
                    }
                }
            }
            /** ########### 報告書固定文言マスタの登録 END ########### */

            /**
             * ########### 報告書選択メニュー START ###########
             */
            // (2)-10 メニュー番号の取得 _ 登録されている順序の最大値 + 10の値を取得する。
            $getMaxOrder = $this->Mng060Dao->getReportMenuMaxOrder();
            $setMaxOrder = intval($getMaxOrder[0]->max) + 10;

            // (2)-11 排他制御 報告書選択メニュー
            $haitaReportMenu = $this->Mng060Dao->haitaReportMenu($target_report_no, $request->display_time);
            if (!$haitaReportMenu) {
                return config('const.UPDATE_UPDATED_ERROR');
            }

            // (2)-12 報告書選択メニューの登録
            $getReporMenuData = $this->Mng060Dao->getReporMenuData($request->report_menu_no);
            if (!$getReporMenuData) {
                return config('const.OTHER_ERROR');
            }

            // (2)-12 報告書選択メニューの登録 m_report_menu
            $duplicateReportMenu = $this->Mng060Dao->duplicateReportMenu($set_rpt_no, $setMaxOrder, $getReporMenuData[0]);

            // エラー発生
            if (!$duplicateReportMenu) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }
            /** ########### 報告書選択メニュー END ########### */

            /**
             * ########### テンプレートファイル 新規作成 START ###########
             */
            // テンプレートファイル名 登録
            $template_file_name = 'tmp_' . $set_rpt_no . '.xlsx';
            $result = $this->Mng060Dao->registReportFile($set_rpt_no, $template_file_name);
            if (!$result) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }

            // ベースファイルパスを取得
            $baseFilePath = config('const.OutputTempPath', '/var/www/suishitsu/resources/excel/outputFormat/');
            $filePath = $baseFilePath . $getReportConfigData[0]->template_file;

            // Excelベースファイルを開く
            $reader = new XlsxReader();
            $reader->setReadDataOnly(false);
            $spreadsheet = $reader->load($filePath);

            // 保存処理
            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
            $writer->save(config('const.OutputTempPath', '/var/www/suishitsu/resources/excel/outputFormat/') . $template_file_name);
            /** ########### テンプレートファイル 新規作成 END ########### */

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
     * 報告書メニューを新規・更新登録
     * 
     */
    public function saveInputMenuRpt($request, $max_order, $report_hierarchy, $sisetu_no)
    {
        DB::beginTransaction();
        try {
            // 新規登録
            if ($request->process_name == "rpt_add") {
                // (4)-2 参照報告書情報の取得
                $report_no = false;
                if ($request->input_ref_menu) {
                    $report_no = $this->Mng060Dao->checkConfig($request->input_ref_menu);
                }

                // 参照画面が選択されている場合
                if ($report_no === false && !$request->report_month) {
                    // (4)-8 報告書構成マスタ登録処理・(4)-3 報告書番号の取得
                    $report_no = $this->Mng060Dao->insertReportConfig($request->report_title);
                    if (!$report_no) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    }

                    // テンプレートファイル名 登録
                    $template_file_name = 'tmp_' . $report_no . '.xlsx';
                    $result = $this->Mng060Dao->registReportFile($report_no, $template_file_name);
                    if (!$result) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    }

                    // ------------------------------------------
                    // テンプレートファイルを新規作成
                    // ------------------------------------------
                    // ベースファイルパスを取得
                    $baseFilePath = config('const.BaseFilePath', '/var/www/suishitsu/resources/excel/baseFormat/');
                    $filePath = $baseFilePath . config('const.TmpBaseFileName');

                    // Excelベースファイルを開く
                    $reader = new XlsxReader();
                    $reader->setReadDataOnly(false);
                    $spreadsheet = $reader->load($filePath);

                    // 保存処理
                    $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
                    $writer->save(config('const.OutputTempPath', '/var/www/suishitsu/resources/excel/outputFormat/') . $template_file_name);
                }

                // (4)-7 報告書選択メニュー登録処理
                $result = $this->Mng060Dao->insertReportMenu($request, $report_no, $max_order, $report_hierarchy, $sisetu_no);
                if (!$result) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }

                // (4)-9 月報報告書一覧登録処理
                $checkMonthlyReportList = $this->Mng060Dao->checkMonthlyReportList($sisetu_no);
                // 月報報告書一覧に (4)-6 で取得した施設番号が 1件も 登録されていない場合
                if ($request->report_month && !$checkMonthlyReportList) {
                    $result = $this->Mng060Dao->insertMonthlyReportList($sisetu_no);
                    if (!$result) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    }
                }
            } else if ($request->process_name == "rpt_edit") {
                // 更新

                // (4)-11 排他チェック_報告書選択メニュー
                $haitaReportMenu = $this->Mng060Dao->haitaReportMenu($request->report_menu_no, $request->display_time);
                if (!$haitaReportMenu) {
                    return config('const.UPDATE_UPDATED_ERROR');
                }

                // 月報以外の報告書を確認
                if (!$request->report_month_flg) {
                    // (4)-11 排他チェック_報告書構成マスタ
                    $haitaReportConfig = $this->Mng060Dao->haitaReportConfig($request->input_ref_menu, $request->display_time);
                    if (!$haitaReportConfig) {
                        return config('const.UPDATE_UPDATED_ERROR');
                    }
                }

                // 選択された親メニューの階層を取得する。 ※ 親ラベル編集した時、階層を更新
                $getCurHierarchy = $this->Mng060Dao->getReportMenuHierarchy($request->input_parent_menu_no);
                $setCurHierarchy = intval($getCurHierarchy[0]->report_hierarchy) + 1;

                // (4)-12 報告書選択メニュー更新処理
                $saveUpdateReportMenu = $this->Mng060Dao->saveUpdateReportMenu($request->report_menu_no, $request->input_parent_menu_no, $request->affiliation_section_no, $setCurHierarchy, $request->report_title);

                // エラー発生
                if (!$saveUpdateReportMenu) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }

                // (4)-13 月報報告書一覧登録処理
                $checkMonthlyReportList = $this->Mng060Dao->checkMonthlyReportList($sisetu_no);
                // 月報報告書一覧に (4)-10 で取得した施設番号が 1件も 登録されていない場合
                if (!$checkMonthlyReportList) {
                    $result = $this->Mng060Dao->insertMonthlyReportList($sisetu_no);
                    if (!$result) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
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
     * メニュー番号より、報告書番号を取得
     */
    public function menuToReport($request)
    {
        return $this->Mng060Dao->menuToReport($request);
    }

    /**
     * グリッドテーブル用に成形
     */
    private function settingGridTableData($data)
    {
        $rowData = array();
        $columnData = array();
        $index = 0;
        if ($data !== null && $data !== false && $data !== array() && count($data) > 0) {
            foreach ($data as $row) {
                foreach ($row as $key => $value) {
                    $val = (string)$value;
                    $type = "text";
                    $rowData[$index][] = array(
                        // 'rowNo' =>  0,
                        'colNo' =>  $index,
                        'colName'   =>  $key,
                        'text'  =>  $val,
                        'value' =>  $val,
                        'type'  =>  'text'
                    );
                    if ($index === 0) {
                        $columnData[] = array(
                            'key'   =>  $key,
                            'type'  =>  'text',
                            'width' =>  200
                        );
                    }
                }
                $index++;
            }
        }

        $responceData = array(
            'rowData'       =>  $rowData,
            'colData'       =>  $columnData,
        );

        return $responceData;
    }

    /**
     * 報告書構成
     */
    public function getRptConfig($request)
    {
        $result = array();
        $responce = array();
        $result = $this->Mng060Dao->getRptConfig($request);
        $responce = $this->settingGridTableData($result);

        return $responce;
    }

    /**
     * 検査項目
     */
    public function getRptItem($request)
    {
        $result = array();
        $responce = array();
        $result = $this->Mng060Dao->getRptItem($request);
        $responce = $this->settingGridTableData($result);

        return $responce;
    }

    /**
     * 測定地点
     */
    public function getRptPoint($request)
    {
        $result = array();
        $responce = array();
        $result = $this->Mng060Dao->getRptPoint($request);
        $responce = $this->settingGridTableData($result);

        return $responce;
    }

    /**
     * 固定文言
     */
    public function getRptText($request)
    {
        $result = array();
        $responce = array();
        $result = $this->Mng060Dao->getRptText($request);
        $responce = $this->settingGridTableData($result);

        return $responce;
    }

    /**
     * 月報報告書一覧
     */
    public function getRptMonthList($request)
    {
        $result = array();
        $responce = array();
        $result = $this->Mng060Dao->getMonthReportList($request);
        $responce = $this->settingGridTableData($result);

        return $responce;
    }

    /** 排他制御 */
    public function haitaCheck($report_no, $time)
    {
        // 報告書選択メニュー
        $isMenuUnchanged = $this->Mng060Dao->haitaCheck('m_report_menu', $report_no, $time);

        // 報告書構成
        $isConfigUnchanged = $this->Mng060Dao->haitaCheck('m_report_config', $report_no, $time);

        // 報告書項目
        $isItemUnchanged = $this->Mng060Dao->haitaCheck('m_report_item', $report_no, $time);

        // 報告書地点
        $isPointUnchanged = $this->Mng060Dao->haitaCheck('m_report_point', $report_no, $time);

        // 報告書固定文言
        $isTextUnchanged = $this->Mng060Dao->haitaCheck('m_report_text', $report_no, $time);

        return ($isMenuUnchanged && $isConfigUnchanged && $isItemUnchanged && $isPointUnchanged && $isTextUnchanged);
    }

    /** 排他制御 月報報告書一覧 */
    public function haitaCheckMonthly($sisetu_no, $time)
    {
        $isMonthlyReportUnchanged = $this->Mng060Dao->haitaCheckMonthly('t_monthly_report_list', $sisetu_no, $time);
        return ($isMonthlyReportUnchanged);
    }

    /**
     * 各マスタを更新
     * 
     */
    public function updateReportData($report_no, $user_id, $configData, $itemData, $pointData, $textData)
    {
        try {
            DB::beginTransaction();

            // 報告書構成マスタ 更新
            $resultReportConfig = $this->updateReportConfig($configData, $user_id);
            if (!$resultReportConfig) {
                throw new \Exception("登録処理_報告書構成マスタの更新に失敗しました。");
            }

            // 報告書項目マスタ 更新
            $resultReportItem = $this->updateReportItem($itemData, $report_no, $user_id);
            if (!$resultReportItem) {
                throw new \Exception("登録処理_報告書項目マスタの更新に失敗しました。");
            }

            // 報告書地点マスタ 更新
            $resultReportPoint = $this->updateReportPoint($pointData, $report_no, $user_id);
            if (!$resultReportPoint) {
                throw new \Exception("登録処理_報告書地点マスタの更新に失敗しました。");
            }

            // 報告書固定文言マスタ 更新
            $resultReportText = $this->updateReportText($textData, $report_no, $user_id);
            if (!$resultReportText) {
                throw new \Exception("登録処理_報告書固定文言マスタの更新に失敗しました。");
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);
            return false;
        }
    }

    /** 報告書構成 更新 */
    public function updateReportConfig($configData, $user_id)
    {
        try {
            Log::info((array) $configData);
            $bindValue = array();               // 報告書構成マスタ
            $bindBaseValue = array();           // 報告書ベース情報マスタ
            for ($elemIndex = 0; $elemIndex < count($configData); $elemIndex++) {
                if ($configData[$elemIndex]['colName'] == "auto_update_flg") {
                    // 報告書ベース情報マスタ_自動様式更新フラグがある場合
                    $bindBaseValue[$configData[$elemIndex]['colName']] = $configData[$elemIndex]['value'];
                } else {
                    // 報告書構成マスタの情報
                    $bindValue[$configData[$elemIndex]['colName']] = $configData[$elemIndex]['value'];
                }
            }
            $bindValue['user'] = $user_id;

            // 報告書ベース情報マスタ_自動様式更新フラグがある場合
            if (count($bindBaseValue) > 0) {
                $bindBaseValue['user'] = $user_id;
            }

            $result = $this->Mng060Dao->updateReportConfig($bindValue, $bindBaseValue);
            if ($result) {
                return true;
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /** 報告書項目 更新 */
    public function updateReportItem($itemData, $report_no, $user_id)
    {
        try {
            // 現時点で登録済みの報告書項目を全削除
            $delete = $this->Mng060Dao->deleteReportItem($report_no);
            if ($delete === false) {
                Log::info('報告書項目_削除失敗');
                return false;
            }

            // 
            $bindValueList = array();
            for ($i = 0; $i < count($itemData); $i++) {
                $bindValue = array();
                $bindValue['report_no'] = $report_no;
                for ($elemIndex = 0; $elemIndex < count($itemData[$i]); $elemIndex++) {
                    if ($itemData[$i][$elemIndex]['colName'] == 'item_report_name') {
                        continue;
                    }
                    $bindValue[$itemData[$i][$elemIndex]['colName']] = $itemData[$i][$elemIndex]['value'];
                }
                $bindValue['item_order'] = $i + 1;
                $bindValue['insert_user'] = $user_id;
                $bindValue['update_user'] = $user_id;
                $bindValueList[] = $bindValue;
            }
            // Log::info($bindValueList);
            $insert = $this->Mng060Dao->insertReportItem($bindValueList);
            if ($insert === false) {
                Log::info('報告書項目_登録失敗');
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /** 報告書地点 更新 */
    public function updateReportPoint($pointData, $report_no, $user_id)
    {
        try {
            // 現時点で登録済みの報告書地点を全削除
            $delete = $this->Mng060Dao->deleteReportPoint($report_no);
            if ($delete === false) {
                Log::info('報告書地点_削除失敗');
                return false;
            }

            // 
            $bindValueList = array();
            for ($i = 0; $i < count($pointData); $i++) {
                $bindValue = array();
                $bindValue['report_no'] = $report_no;
                for ($elemIndex = 0; $elemIndex < count($pointData[$i]); $elemIndex++) {
                    $bindValue[$pointData[$i][$elemIndex]['colName']] = $pointData[$i][$elemIndex]['value'];
                }
                $bindValue['point_order'] = $i + 1;
                $bindValue['insert_user'] = $user_id;
                $bindValue['update_user'] = $user_id;

                // 地点番号がある場合のみ格納
                if (!is_null($bindValue['point_no'])) {
                    $bindValueList[] = $bindValue;
                }
            }

            if ($bindValueList != array()) {
                $insert = $this->Mng060Dao->insertReportPoint($bindValueList);
                if ($insert === false) {
                    Log::info('報告書地点_登録失敗');
                    return false;
                }
            }

            return true;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /** 報告書固定文言 更新 */
    public function updateReportText($textData, $report_no, $user_id)
    {
        try {
            // 現時点で登録済みの報告書固定文言を削除
            $delete = $this->Mng060Dao->deleteReportText($report_no);
            if ($delete === false) {
                Log::info('報告書固定文言_削除失敗');
                return false;
            }

            // 
            $bindValueList = array();
            for ($i = 0; $i < count($textData); $i++) {
                $bindValue = array();
                $bindValue['report_no'] = $report_no;
                for ($elemIndex = 0; $elemIndex < count($textData[$i]); $elemIndex++) {
                    $bindValue[$textData[$i][$elemIndex]['colName']] = $textData[$i][$elemIndex]['value'];
                }
                $bindValue['text_renban'] = 1;
                $bindValue['insert_user'] = $user_id;
                $bindValue['update_user'] = $user_id;

                $serachRenban = array_values(array_filter($bindValueList, function ($elem) use ($bindValue) {
                    return $elem['text_cell_name'] == $bindValue['text_cell_name'];
                }));
                // Log::info(count($serachRenban));
                if (count($serachRenban) > 0) {
                    $bindValue['text_renban'] = $serachRenban[count($serachRenban) - 1]['text_renban'] + 1;
                }


                $bindValueList[] = $bindValue;
            }
            // Log::info($bindValueList);
            $insert = $this->Mng060Dao->insertReportText($bindValueList);
            if ($insert === false) {
                Log::info('報告書固定文言_登録失敗');
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /** 報告書構成 更新 */
    public function insertReportConfig($user_id, $report_title)
    {
        try {
            $bindValue = array();

            $bindValue['title'] = $report_title;
            $bindValue['user'] = $user_id;
            $result = $this->Mng060Dao->insertReportConfig($bindValue);

            if ($result) {
                DB::commit();
                return $result;
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }


    /** 月報報告書一覧 更新 */
    public function updateMonthReportList($monthListData, $sisetu_no, $user_id)
    {
        DB::beginTransaction();
        try {
            // 月報報告書一覧 有効期限
            $nowData = $this->Mng060Dao->checkMonthlyReportList($sisetu_no);

            // 現時点で登録済みの月報報告書一覧を削除
            $delete = $this->Mng060Dao->deleteMonthReportList($sisetu_no);
            if ($delete === false) {
                Log::info('月報報告書一覧_削除失敗');
                DB::rollback();
                return false;
            }

            $bindValue = array();
            $values = "VALUES";

            // 同一項目
            $bindValue['sisetu_no'] = $sisetu_no;
            $bindValue['start_valid_date'] = $nowData[0]->start_valid_date;
            $bindValue['end_valid_date'] = $nowData[0]->end_valid_date;
            $bindValue['insert_user'] = $user_id;
            $bindValue['update_user'] = $user_id;

            for ($i = 0; $i < count($monthListData); $i++) {
                $bindValue['report_list_order' . (string)$i] = $i + 1; // 主キー
                for ($elemIndex = 0; $elemIndex < count($monthListData[$i]); $elemIndex++) {
                    // 各表示項目
                    $bindValue[$monthListData[$i][$elemIndex]['colName'] . (string)$i] = $monthListData[$i][$elemIndex]['value'];
                }

                $values .=
                    "( 
                    :sisetu_no
                    , :report_no{$i}
                    , :point_no{$i}
                    , :saisui_days{$i}
                    , :report_list_order{$i}
                    , :start_valid_date
                    , :end_valid_date
                    , CURRENT_TIMESTAMP
                    , :insert_user
                    , CURRENT_TIMESTAMP
                    , :update_user
                ),";
            }
            $values = rtrim($values, ',');

            $insert = $this->Mng060Dao->insertMonthlyReportList($sisetu_no, $bindValue, $values);
            if ($insert === false) {
                Log::info('月報報告書一覧_登録失敗');
                DB::rollback();
                return false;
            }
            Log::info('成功');

            DB::commit();
            return true;
        } catch (\Exception $e) {
            Log::error($e);
        }
        DB::rollback();
        return false;
    }

    /** 報告書設定 存在確認 */
    public function checkConfig($request)
    {
        return $this->Mng060Dao->checkConfig($request);
    }

    /** 報告書選択メニュー 順序取得 */
    public function getRptMenuOrder()
    {
        return $this->Mng060Dao->getRptMenuOrder();
    }

    /** 報告書選択メニュー 階層 */
    public function getRptMenuParentHierarchy($request)
    {
        return $this->Mng060Dao->getRptMenuParentHierarchy($request);
    }

    /** 報告書選択メニュー 階層 */
    public function getSisetuNo($request)
    {
        return $this->Mng060Dao->getSisetuNo($request);
    }

    /**
     * 2025/12
     * ※ 使用していない関数
     * 
     */
    public function registRptMenu($request, $report_no, $max_order, $report_hierarchy, $sisetu_no)
    {
        // try {
        //     $insert = $this->Mng060Dao->registRptMenu($request, $report_no, $max_order, $report_hierarchy, $sisetu_no);
        //     if ($insert === false) {
        //         Log::info('報告書選択メニュー_登録失敗');
        //         return false;
        //     }

        //     return true;
        // } catch (\Exception $e) {
        //     Log::error($e);
        // }
        // return false;
    }

    /** 報告書設定 テンプレートファイル 取得 */
    public function getTemplateFile($request)
    {
        try {
            return $this->Mng060Dao->getTemplateFileName($request);
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /** 報告書設定 ファイル取込 */
    public function setFile($request)
    {
        try {
            $today = new \DateTime();
            $ymdhis = $today->format('YmdHis');

            $filePath = config('const.OutputTempPath', '/var/www/suishitsu/resources/excel/outputFormat/'); // ファイル配置場所
            $fullPath = $filePath . "tmp_" . $request->report_no . ".xlsx";

            // 既に存在する場合
            if (file_exists($fullPath)) {
                $bkPath = config('const.OutputTempBkPath', '/var/www/suishitsu/resources/excel/outputFormatBk/'); // バックアップ配置場所
                $bkFullPath = $bkPath . "tmp_" . $request->report_no . "_" . $ymdhis . ".xlsx";

                $this->prepareDirectory($bkPath);
                // 元ファイルをバックアップフォルダに移動
                if (!rename($fullPath,  $bkFullPath)) {
                    throw new \Exception('ファイル移動失敗');
                }
            }

            // ファイル登録
            move_uploaded_file($request->file('import_file'), $fullPath);
            return true;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    /** ディレクトリ存在チェック 無ければ作成 */
    private function prepareDirectory($filePath): void
    {
        if (!file_exists($filePath)) {
            if (!mkdir($filePath, 0777, true)) {
                throw new \Exception('テンプレートフォルダ作成失敗');
            }
        }
    }

    /** 報告書 削除処理 */
    public function deleteDataByReportNo($report_no)
    {
        DB::beginTransaction();
        try {
            // 報告書選択メニュー
            $isMenuDeleted = $this->Mng060Dao->deleteDataByReportNo('m_report_menu', $report_no);
            if (!$isMenuDeleted) {
                throw new \Exception('報告書選択メニュー 削除失敗');
            }

            // 報告書構成
            $isConfigDeleted = $this->Mng060Dao->deleteDataByReportNo('m_report_config', $report_no);
            if (!$isConfigDeleted) {
                throw new \Exception('報告書構成 削除失敗');
            }

            // 報告書項目
            $isItemDeleted = $this->Mng060Dao->deleteDataByReportNo('m_report_item', $report_no);
            if (!$isItemDeleted) {
                throw new \Exception('報告書項目 削除失敗');
            }

            // 報告書地点
            $isPointDeleted = $this->Mng060Dao->deleteDataByReportNo('m_report_point', $report_no);
            if (!$isPointDeleted) {
                throw new \Exception('報告書地点 削除失敗');
            }

            // 報告書固定文言
            $isTextDeleted = $this->Mng060Dao->deleteDataByReportNo('m_report_text', $report_no);
            if (!$isTextDeleted) {
                throw new \Exception('報告書固定文言 削除失敗');
            }

            return true;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e);
        }
        return false;
    }

    /**
     * メニュー削除処理
     * 202601 修正
     * ※ 報告書メニューのみ削除
     * 
     */
    public function discardReportMenu($selectedMenuNo, $displayTime)
    {
        DB::beginTransaction();
        try {
            // 排他チェック                
            $haitaCurReportMenuData = $this->Mng060Dao->haitaReportMenuData($selectedMenuNo, $displayTime);
            if (!$haitaCurReportMenuData) {
                return config('const.UPDATE_UPDATED_ERROR');
            }

            // 報告書番号を取得
            $set_input_rpt_no = ($haitaCurReportMenuData[0]->report_no) ? $haitaCurReportMenuData[0]->report_no : null;

            // 移動先の順序更新
            $deleteReportMenu = $this->Mng060Dao->deleteReportMenu($selectedMenuNo, $set_input_rpt_no);

            // エラー発生
            if (!$deleteReportMenu) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }

            DB::commit();

            return config('const.DELETE_NO_ERROR');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return config('const.OTHER_ERROR');
        }
    }
}
