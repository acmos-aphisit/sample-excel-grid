<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CommonService;
use App\Services\Mng060Service;
use App\Http\Requests\Mng060Request;
use Illuminate\Support\Facades\Log;

class Mng060Controller extends Controller
{
    // 報告書出力サービス
    private $commonService;
    private $Mng060Service;

    /**
     * コンストラクタ
     * 
     * @param Auth $auth
     */
    public function __construct()
    {
        $this->commonService = new CommonService();
        $this->Mng060Service = new Mng060Service();
    }

    /**
     * サイドメニュー用検索処理
     * 報告書を取得
     * 
     * @return JsonResponse
     * @ths Exception
     */
    public function getReportMenu(Request $request)
    {
        $getReportMenu = $this->Mng060Service->getReportMenu($request->affiliation_section_no, $request->security_level);
        if (!$getReportMenu) {
            return response()->json(array('errors' => array('報告書メニュー' => [['WQ-0006E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = $getReportMenu;

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * メニューラベルを登録
     * 
     * @param   Mng060Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function saveMenuLabel(Mng060Request $request)
    {
        // 検査情報の入力データを取得
        $saveMenuLabel = $this->Mng060Service->saveMenuLabel($request);

        // エラー発生
        if ($saveMenuLabel && $saveMenuLabel !== 0) {
            switch ($saveMenuLabel) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('MNG060Controller_saveMenuLabel' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('MNG060Controller_saveMenuLabel' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他のユーザがを同一データを同時に更新
                    return response()->json(array('errors' => array('MNG060Controller_saveMenuLabel' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('MNG060Controller_saveMenuLabel' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('MNG060Controller_saveMenuLabel' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $saveMenuLabel,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * メニューの順序更新処理
     * 
     * @param   Mng050Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function exchangeMenuOrder(Mng060Request $request)
    {
        // 検査情報の入力データを取得
        $exchangeMenuOrder = $this->Mng060Service->exchangeMenuOrder($request);

        // エラー発生
        if ($exchangeMenuOrder && $exchangeMenuOrder !== 0) {
            switch ($exchangeMenuOrder) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('MNG060Controller_exchangeMenuOrder' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('MNG060Controller_exchangeMenuOrder' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他のユーザがを同一データを同時に更新
                    return response()->json(array('errors' => array('MNG060Controller_exchangeMenuOrder' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('MNG060Controller_exchangeMenuOrder' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('MNG060Controller_exchangeMenuOrder' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $exchangeMenuOrder,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 報告書情報を取得
     * ・報告書設定
     * ・検査項目
     * ・測定地点
     * ・固定文言
     */
    public function getRptConfig(Request $request)
    {
        // 報告書番号取得
        // 報告書構成取得
        $configData = array();
        $configData = $this->Mng060Service->getRptConfig($request);
        if ($configData === false) {
            return response()->json(array('errors' => array('getRptConfig_config' => [['WQ-0006E', '報告書構成']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 検査項目
        $itemData = array();
        $itemData = $this->Mng060Service->getRptItem($request);
        if ($itemData === false) {
            return response()->json(array('errors' => array('getRptConfig_item' => [['WQ-0006E', '検査項目']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 測定地点
        $pointData = array();
        $pointData = $this->Mng060Service->getRptPoint($request);
        if ($pointData === false) {
            return response()->json(array('errors' => array('getRptConfig_point' => [['WQ-0006E', '測定地点']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 固定文言
        $textData = array();
        $textData = $this->Mng060Service->getRptText($request);
        if ($textData === false) {
            return response()->json(array('errors' => array('getRptConfig_text' => [['WQ-0006E', '固定文言']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 施設番号取得
        $sisetu_no = $request->report_no !== null ? '' : $this->Mng060Service->getSisetuNo($request);
        // 月報報告書一覧
        $monthListData = array();
        $monthListData = $this->Mng060Service->getRptMonthList($sisetu_no);
        if ($monthListData === false) {
            return response()->json(array('errors' => array('getRptConfig_monthList' => [['WQ-0006E', '月報報告書一覧']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }



        // 報告書構成取得
        $menuOpt = array();
        $menuOpt = $this->Mng060Service->optionInputMenu();
        if ($menuOpt === false) {
            return response()->json(array('errors' => array('index_menu' => [['WQ-0006E', '報告書構成']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 採水地点
        $pointOpt = array();
        $pointOpt = $this->Mng060Service->optionPoint();
        if ($pointOpt === false) {
            return response()->json(array('errors' => array('index_point' => [['WQ-0006E', '採水地点']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 検査区分コード
        $kbnOpt = array();
        $kbnOpt = $this->Mng060Service->optionInspectionKbn();
        if ($kbnOpt === false) {
            return response()->json(array('errors' => array('index_kbn' => [['WQ-0006E', '検査区分コード']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 報告書タイプ
        $typeOpt = array();
        $typeOpt = $this->Mng060Service->optionRptType();
        if ($typeOpt === false) {
            return response()->json(array('errors' => array('index_type' => [['WQ-0006E', '報告書タイプ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 検査項目
        $itemOpt = array();
        $itemOpt = $this->Mng060Service->optionRptItem();
        if ($itemOpt === false) {
            return response()->json(array('errors' => array('index_item' => [['WQ-0006E', '検査項目']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 報告書
        $rptOpt = array();
        $rptOpt = $this->Mng060Service->optionReport();
        if ($rptOpt === false) {
            return response()->json(array('errors' => array('index_report' => [['WQ-0006E', '報告書']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 実施時間
        $time = $this->commonService->getCurrentDisplayTime();
        if ($time === false) {
            return response()->json(array('errors' => array('current_time' => [['WQ-0006E', '実施時間']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'config'    =>  $configData,
            'item'      =>  $itemData,
            'point'     =>  $pointData,
            'text'      =>  $textData,
            'monthList' =>  $monthListData,
            'menuOpt'   =>  $menuOpt,
            'pointOpt'  =>  $pointOpt,
            'kbnOpt'    =>  $kbnOpt,
            'typeOpt'   =>  $typeOpt,
            'itemOpt'   =>  $itemOpt,
            'reportOpt' =>  $rptOpt,
            'time'      =>  $this->commonService->getCurrentDisplayTime(),
        );

        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /** 登録処理 */
    public function regist(Mng060Request $request)
    {
        $reportNo = $request->sidemenu['report_no'];                                                // サイドメニュー.報告書番号
        $displayTime = $request->displayTime;                                                       // 実施日時
        $userId = $request->user()->user_id;                                                        // 実施しているユーザＩＤ
        $configData = count($request->config) > 0 ? $request->config[0] : $request->config;         // 報告書構成
        $itemData = $request->item;                                                                 // 検査項目
        $pointData = $request->point;                                                               // 測定地点
        $textData = $request->text;                                                                 // 固定文言
        $monthListData = $request->monthList;                                                       // 月報
 
        // 月報以外の報告書設定
        if(count($request->monthList) == 0){
            // 入力チェック start
            $reportNo = optional(collect($configData)->firstWhere('colName', 'report_no'))['value'] ?? null; // 画面.報告書番号
            if($reportNo == '' || $reportNo == null){
                return response()->json(array('errors' => array('登録処理' => [['WQ-0006W', '報告書番号']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }

            $reportName = optional(collect($configData)->firstWhere('colName', 'report_name'))['value'] ??  null;
            if($reportName == '' || $reportName == null){
                return response()->json(array('errors' => array('登録処理' => [['WQ-0006W', '報告書名称']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }

            $reportType = optional(collect($configData)->firstWhere('colName', 'report_type'))['value'] ??  null;
            if($reportType == '' || $reportType == null){
                return response()->json(array('errors' => array('登録処理' => [['WQ-0006W', '報告書タイプ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }

            $reportCategory = optional(collect($configData)->firstWhere('colName', 'report_category'))['value'] ??  null;
            if($reportCategory == '' || $reportCategory == null){
                return response()->json(array('errors' => array('登録処理' => [['WQ-0006W', '報告書分類']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }

            // ※ 202601 修正
            // ※※ 画面上に項目を削除した。
            // $maskPattern = optional(collect($configData)->firstWhere('colName', 'mask'))['value'] ??  null;
            // if($maskPattern == '' || $maskPattern == null){
            //     return response()->json(array('errors' => array('登録処理' => [['WQ-0006W', 'マスクパターン']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            // }

            $inspectionKbn = optional(collect($configData)->firstWhere('colName', 'inspection_kbn'))['value'] ??  null;
            if($inspectionKbn == '' || $inspectionKbn == null){
                return response()->json(array('errors' => array('登録処理' => [['WQ-0006W', '調査区分']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }

            if(count($itemData) == 0 || (count($itemData) == 1 && $itemData[0][0]['value'] == null)){
                return response()->json(array('errors' => array('登録処理_排他制御' => [['WQ-0014W','出力項目','1件']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }
            
            // 入力チェック end

            // 排他制御処理
            $check = $this->Mng060Service->haitaCheck($reportNo, $displayTime);
            if (!$check) {
                return response()->json(array('errors' => array('登録処理_排他制御' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }

            // 各マスタを更新
            $resultReportData = $this->Mng060Service->updateReportData($reportNo, $userId, $configData, $itemData, $pointData, $textData);
            if (!$resultReportData) {
                return response()->json(array('errors' => array('登録処理_各マスタ' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }

            // ---------------------------------------------
            // テンプレート自動更新処理
            // ---------------------------------------------
            $targetFileList = array();

            // 報告書タイプマスタ 取得
            $reportTypeList = $this->commonService->getReportType();

            // 更新対象の帳票がテンプレート自動更新の対象か判定
            foreach ($reportTypeList as $reportType) {
                if ($reportType->report_type == optional(collect($configData)->firstWhere('colName', 'report_type'))['value'] &&
                    $reportType->report_no == optional(collect($configData)->firstWhere('colName', 'report_no'))['value'] &&
                    $reportType->auto_update_flg == 1) {
                    array_push($targetFileList, $reportNo);
                    break;
                }
            }

            // テンプレート自動更新対象の帳票の場合のみ、自動更新を行う
            if (!empty($targetFileList)) {
                $resultTemplate = $this->commonService->updateTemplateFile($targetFileList);
                if (!$resultTemplate) {
                    return response()->json(array('errors' => array('テンプレート自動更新処理' => [['WQ-0029E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                }
            }

        } else {
            // 入力チェック start
            $nameFilterd = collect($monthListData)->filter(fn($reportData) => optional(collect($reportData)->firstWhere('colName','report_no'))['value'] == null);
            $dateFilterd = collect($monthListData)->filter(fn($reportData) => optional(collect($reportData)->firstWhere('colName','saisui_days'))['value'] == null);

            if(count($nameFilterd) > 0){
                return response()->json(array('errors' => array('登録処理' => [['WQ-0006W', '報告書名称']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }
            if(count($dateFilterd) > 0){
                return response()->json(array('errors' => array('登録処理' => [['WQ-0006W', '採水日数']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }
            if(count($monthListData) == 0 || $monthListData[0][0]['value'] == null){
                return response()->json(array('errors' => array('登録処理' => [['WQ-0014W', '報告書名称', '1件']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }
            // 入力チェック end

            // 施設番号取得
            $sisetuNo = $reportNo !== null ? '' : $this->Mng060Service->getSisetuNo((object)$request->sidemenu);

            // 排他チェック処理
            $check = $this->Mng060Service->haitaCheckMonthly($sisetuNo, $displayTime);
            if (!$check) {
                return response()->json(array('errors' => array('登録処理_排他制御' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }

            // 月報報告書一覧 更新
            $resultMonthReportList = $this->Mng060Service->updateMonthReportList($monthListData, $sisetuNo, $userId);
            if (!$resultMonthReportList) {
                return response()->json(array('errors' => array('登録処理_月報報告書一覧' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }
        }

        // 実施時間
        $time = $this->commonService->getCurrentDisplayTime();
        if ($time === false) {
            return response()->json(array('errors' => array('current_time' => [['WQ-0006E', '実施時間']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'time'      =>  $this->commonService->getCurrentDisplayTime(),
        );

        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 報告書削除処理
     */
    public function deleteReport(Request $request){
        
        // selectedMenuNo
        $report_no = $request->sidemenu['report_no'];
        $selectedMenuNo = $request->sidemenu['selectedMenuNo'];
        $displayTime = $request->displayTime;
        $isDeleteded = false;

        
        // 202601 修正
        // ※ 報告書メニューのみ削除
        $discardReportMenu = $this->Mng060Service->discardReportMenu($selectedMenuNo, $displayTime);
        // エラー発生
        if ($discardReportMenu && $discardReportMenu !== 0) {
            switch ($discardReportMenu) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('discardReportMenu' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('discardReportMenu' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他のユーザがを同一データを同時に更新
                    return response()->json(array('errors' => array('discardReportMenu' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('discardReportMenu' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_MASTER_ERROR'):
                    // 排他チェック_マスタ情報更新あり
                    return response()->json(array('errors' => array('discardReportMenu' => [['WQ-0030E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                default:
                    return response()->json(array('errors' => array('discardReportMenu' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // if($report_no !== null && $report_no !== false && $report_no !== ''){
        //     // 報告書番号が空でない場合
        //     // 排他制御処理
        //     $check = $this->Mng060Service->haitaCheck($report_no, $displayTime);
        //     if (!$check) {
        //         return response()->json(array('errors' => array('削除処理_排他制御' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        //     }

        //     // 削除処理 一括(報告書メニュー、報告書構成、報告書項目、報告書地点、報告書固定文言)
        //     $isDeleteded = $this->Mng060Service->deleteDataByReportNo($report_no);

        // }
        // if($isDeleteded == false){
        //     return response()->json(array('errors' => array('削除処理' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        // }

        // 実施時間
        $time = $this->commonService->getCurrentDisplayTime();
        if ($time === false) {
            return response()->json(array('errors' => array('current_time' => [['WQ-0006E', '実施時間']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'time'      =>  $this->commonService->getCurrentDisplayTime(),
        );

        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 類似入力画面作成処理
     * 
     * @param   Mng050Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function duplicateInputMenuRpt(Mng060Request $request)
    {
        // 類似入力画面作成
        $duplicateInputMenuRpt = $this->Mng060Service->duplicateInputMenuRpt($request);

        // エラー発生
        if ($duplicateInputMenuRpt && $duplicateInputMenuRpt !== 0) {
            switch ($duplicateInputMenuRpt) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('MNG060Controller_duplicateInputMenuDsp' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                default:
                    return response()->json(array('errors' => array('MNG060Controller_duplicateInputMenuDsp' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $duplicateInputMenuRpt,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /** 報告書新規登録 */
    public function saveInputMenuRpt(Mng060Request $request)
    {
        // (4)-4 報告書選択メニュー 順序
        $max_order = $this->Mng060Service->getRptMenuOrder();
        if ($max_order === false) {
            return response()->json(array('errors' => array('報告書選択メニュー' => [['WQ-0006E', '報告書選択メニュー']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // (4)-5 親ラベル情報の取得
        $report_hierarchy = $this->Mng060Service->getRptMenuParentHierarchy($request);
        if ($report_hierarchy === false) {
            return response()->json(array('errors' => array('親ラベル情報の取得' => [['WQ-0006E', '親ラベル情報']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // (4)-6 施設番号の取得（新規登録）、(4)-10 施設番号の取得（編集）
        $sisetu_no = $this->Mng060Service->getSisetuNo($request);
        if ($sisetu_no === false) {
            return response()->json(array('errors' => array('施設番号の取得' => [['WQ-0006E', '施設番号']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 報告書新規登録
        $saveInputMenuRpt = $this->Mng060Service->saveInputMenuRpt($request, $max_order, $report_hierarchy, $sisetu_no);

        // エラー発生
        if ($saveInputMenuRpt && $saveInputMenuRpt !== 0) {
            switch ($saveInputMenuRpt) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('排他チェック_新規登録➝データ存在' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('排他チェック_更新➝対象データ存在しない' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他のユーザがを同一データを同時に更新
                    return response()->json(array('errors' => array('排他チェック_更新➝他のユーザがを同一データを同時に更新' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('排他チェック_削除➝対象データ存在しない' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('その他' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $saveInputMenuRpt,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * メニュー削除処理
     * 
     * @param   Mng050Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function deleteReportMenu(Request $request)
    {
        // メニュー削除処理を実施
        $deleteReportMenu = $this->Mng060Service->deleteReportMenu($request);

        // エラー発生
        if ($deleteReportMenu && $deleteReportMenu !== 0) {
            switch ($deleteReportMenu) {
                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('MNG060Controller_deleteReportMenu' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('MNG060Controller_deleteReportMenu' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $deleteReportMenu,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }


    /**
     * 出力処理
     */
    public function exportImportTemplate(Request $request)
    {
        try {
            $result = array();
            $result = $this->Mng060Service->getTemplateFile($request);
            if($result == false){
                return response()->json(array('errors' => array('export' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }else if($result->template_file == '' || $result->template_file == null){
                // テンプレートファイルに値無し

                // これ以降はテンプレートファイル自動更新の一環であるため、一旦保留
            }else{
                $filePath = config('const.OutputTempPath', '/var/www/suishitsu/resources/excel/outputFormat/');
                $filePath .= $result->template_file;
            }

            // ダウンロードパス取得
            return response()->download($filePath);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
        }
        return response()->json(array('errors' => array('export' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
    }

    /**
     * ファイル取込
     */
    public function fileImport(Request $request)
    {
        try {
            // Excelファイルか否かのチェック
            if (strtolower(pathinfo($_FILES['import_file']['name'], PATHINFO_EXTENSION)) !== 'xlsx') {
                return response()->json(array('errors' => array('fileImport_fileCheck' => [['WQ-0017E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }

            $result = $this->Mng060Service->setFile($request);
            if (!$result) {
                return response()->json(array('errors' => array('fileImport' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }

            return response()->json(true, config('const.HTTP_STATUS_OK'));

        } catch (\Exception $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
        }
        return response()->json(array('errors' => array('fileImport' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
    }
}
