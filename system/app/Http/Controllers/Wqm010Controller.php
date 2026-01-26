<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CommonService;
use App\Http\Requests\Wqm010Request;
use App\Services\Wqm010Service;
use Illuminate\Support\Facades\Log;

class Wqm010Controller extends Controller
{
    //汎用サービス
    private $commonService;

    // 検査情報登録サービス
    private $Wqm010Service;

    /**
     * コンストラクタ
     * 
     * @param Auth $auth
     */
    public function __construct()
    {
        $this->commonService = new CommonService();
        $this->Wqm010Service = new Wqm010Service();
    }

    /**
     * 検査情報の項目・地点を取得
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function fetchPointItemData(Request $request)
    {
        // 地点番号_配列
        $fetchInputPoints = $this->Wqm010Service->fetchInputPoints($request);
        $point_filters = [];
        foreach ($fetchInputPoints as $point_key => $point) {
            array_push($point_filters, $point->point_no);
        }

        // 項目番号_配列
        $fetchInputItems = $this->Wqm010Service->fetchInputItems($request);
        // 項目の選択肢_配列
        $fetchInputItemsSelector = $this->Wqm010Service->fetchInputItemsSelector($request);
        $item_filters = [];
        foreach ($fetchInputItems as $item_key => $item) {
            array_push($item_filters, $item->item_no);

            $selector_list = [];
            $selector_list = array_filter((array) $fetchInputItemsSelector, function ($list) use ($item) {
                return $list->item_no == $item->item_no;
            });

            if (count($selector_list) > 0) {
                $item->select_list = $selector_list;
            }
        }

        // 検査基準情報を取得
        $fetchInspectCriteriaData = $this->Wqm010Service->fetchInspectCriteriaData($request, $item_filters, $point_filters);
        $fetchInspectCriteriaDataKbnCorrection = $this->Wqm010Service->fetchInspectCriteriaDataKbnCorrection($request, $item_filters, $point_filters);

        // 検査情報の入力データを取得
        $fetchInputData = $this->Wqm010Service->fetchInputData($request, $item_filters, $point_filters);

        // 入力データがある日付を取得
        $fetchInputDataExistDate = $this->Wqm010Service->fetchAllInputDataExistDate($request, $item_filters, $point_filters);

        // 基準値補正マスタ取得
        $ext_jis_cal_item_no = [2490, 2497, 1060, 1424];
        $fetchCriteriaCorrection = $this->Wqm010Service->fetchCriteriaCorrection($request, $ext_jis_cal_item_no, $point_filters);

        // 入力マスク_配列
        $fetchInputMask = $this->Wqm010Service->fetchInputMask($request, $item_filters, $point_filters);

        // 入力データ確定情報
        $getInputFixedDate = $this->Wqm010Service->getInputFixedDate($request);

        // 確定ボタン表示フラグを取得
        $getInputFixedFlg = $this->Wqm010Service->getInputFixedFlg($request);

        // メニュー番号から入力画面番号を取得
        $dspNo = $this->commonService->getSelectedDspNo($request->selected_menu_no);

        $connectData = $this->Wqm010Service->getConnect($dspNo);

        // 枠線指定があるか
        $cellOutline = array();
        if(array_key_exists($dspNo,config('const.cellOutline',null))){
            $cellOutline = config('const.cellOutline',null)[$dspNo];
        } else {
            $cellOutline = $connectData;
        }

        // レスポンスの生成
        $response = array(
            'status'   => 'success',
            'itemData' => $fetchInputItems,
            'pointData' => $fetchInputPoints,
            'inspectCriteria' => $fetchInspectCriteriaData,
            'inspectCriteriaDataKbnCorrection' => $fetchInspectCriteriaDataKbnCorrection,
            'criteriaCorrection' => $fetchCriteriaCorrection,
            'dataDateLists' => $fetchInputDataExistDate,
            'inputData' => $fetchInputData,
            'inputMask' => $fetchInputMask,
            'inputFixed' => $getInputFixedDate,
            'inputFixedFlg' => $getInputFixedFlg,
            'displayTime' => $this->commonService->getCurrentDisplayTime(),
            'destinationCont' => config('const.DESTINATION_CONST'),
            'cellOutline' => $cellOutline,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 入力データが存在している日付を取得
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function fetchDataExistDate(Request $request)
    {

        // 地点番号_配列
        $fetchInputPoints = $this->Wqm010Service->fetchInputPoints($request);
        $point_filters = [];
        foreach ($fetchInputPoints as $point_key => $point) {
            array_push($point_filters, $point->point_no);
        }

        // 項目番号_配列
        $fetchInputItems = $this->Wqm010Service->fetchInputItems($request);
        $item_filters = [];
        foreach ($fetchInputItems as $item_key => $item) {
            array_push($item_filters, $item->item_no);
        }

        // 入力データがある日付を取得
        $fetchInputDataExistDate = $this->Wqm010Service->fetchAllInputDataExistDate($request, $item_filters, $point_filters);

        // レスポンスの生成
        $response = array(
            'status'   => 'success',
            'dataDateLists' => $fetchInputDataExistDate,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 検査情報を取得
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function fetchInputData(Request $request)
    {
        // 地点番号_配列
        $fetchInputPoints = $this->Wqm010Service->fetchInputPoints($request);
        $point_filters = [];
        foreach ($fetchInputPoints as $point_key => $point) {
            array_push($point_filters, $point->point_no);
        }

        // 項目番号_配列
        $fetchInputItems = $this->Wqm010Service->fetchInputItems($request);
        $item_filters = [];
        foreach ($fetchInputItems as $item_key => $item) {
            array_push($item_filters, $item->item_no);
        }

        // 検査情報の入力データを取得
        $fetchInputData = $this->Wqm010Service->fetchInputData($request, $item_filters, $point_filters);

        // 入力データ確定情報
        $getInputFixedDate = $this->Wqm010Service->getInputFixedDate($request);

        // 確定ボタン表示フラグを取得
        $getInputFixedFlg = $this->Wqm010Service->getInputFixedFlg($request);

        // 検査基準情報を取得
        $fetchInspectCriteriaData = $this->Wqm010Service->fetchInspectCriteriaData($request, $item_filters, $point_filters);
        $fetchInspectCriteriaDataKbnCorrection = $this->Wqm010Service->fetchInspectCriteriaDataKbnCorrection($request, $item_filters, $point_filters);

        // レスポンスの生成
        $response = array(
            'status'   => 'success',
            'inputData' => $fetchInputData,
            'inputFixed' => $getInputFixedDate,
            'inputFixedFlg' => $getInputFixedFlg,
            'inspectCriteria' => $fetchInspectCriteriaData,
            'inspectCriteriaDataKbnCorrection' => $fetchInspectCriteriaDataKbnCorrection,
            'displayTime' => $this->commonService->getCurrentDisplayTime(),
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 検査情報を登録
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function saveInputData(Request $request)
    {

        // 検査情報の入力データを取得
        $saveInputData = $this->Wqm010Service->saveInputData($request);

        // エラー発生
        if ($saveInputData && $saveInputData !== 0) {
            switch ($saveInputData) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('saveInputData' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('saveInputData' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他のユーザがを同一データを同時に更新
                    return response()->json(array('errors' => array('saveInputData' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('saveInputData' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('getWarekiList' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $saveInputData,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 入力データ確定管理（登録・削除）
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function manageInputFixedDate(Request $request)
    {

        // 検査情報の入力データを取得
        $manageInputFixedDate = $this->Wqm010Service->manageInputFixedDate($request);

        // エラー発生
        if ($manageInputFixedDate && $manageInputFixedDate !== 0) {
            switch ($manageInputFixedDate) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('manageInputFixedDate' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('manageInputFixedDate' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他のユーザがを同一データを同時に更新
                    return response()->json(array('errors' => array('manageInputFixedDate' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('manageInputFixedDate' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('getWarekiList' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $manageInputFixedDate,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }


    /**
     * トレンド画面
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function getTrendData(Request $request)
    {
        // 検査情報の入力データを取得
        $trendData = $this->Wqm010Service->getTrendData($request);

        // レスポンスの生成
        $response = array(
            'status'   => 'success',
            'trendData' => $trendData,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 出力処理
     */
    public function exportTrend(Request $request)
    {

        try {
            // テンプレート書き込み処理
            $filePath = $this->Wqm010Service->exportTrend($request);
            if ($filePath === false) {
                return response()->json(array('errors' => array('export' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }

            // ダウンロードパス取得
            return response()->download($filePath)->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
        }
        return response()->json(array('errors' => array('export' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
    }

    /**
     * 出力処理
     */
    public function exportImportTemplate(Request $request)
    {

        try {
            // 農薬類 濃度or指標値取込時 対応する別入力画面の画面番号を取得
            $additionalNumber = null;
            $additionalRequest = null;
            // 入力画面構成情報取得
            $inputDspConfig = $this->Wqm010Service->getInputDspConfig($request->selected_menu_no);
            foreach (config('const.pairDspConfig') as $nums) {
                if (in_array($inputDspConfig->input_dsp_no, $nums)) {
                    $additionalNumber = $nums[1];
                    $additionalMenuNumber = $this->Wqm010Service->getMenuNo($additionalNumber);
                    $additionalRequest['selected_menu_no'] = count($additionalMenuNumber) > 0 ? $additionalMenuNumber[0]->input_menu_no : null;
                    $additionalRequest['current_month'] = $request->current_month;
                    $additionalRequest['selected_date'] = $request->selected_date;
                    // 直接入れようとしたらUndefined propertyのエラーメッセージが出たので、以下のようにして設定
                    $tmpRequest = (array)$request;
                    $menuNumber = $this->Wqm010Service->getMenuNo($nums[0]);
                    $tmpRequest['selected_menu_no'] = count($menuNumber) > 0 ? $menuNumber[0]->input_menu_no : null;
                    $tmpRequest['current_month'] = $request->current_month;
                    $tmpRequest['selected_date'] = $request->selected_date;
                    $request = (object)$tmpRequest;
                    break;
                }
            }

            // 項目番号_配列
            $fetchInputItems = $this->Wqm010Service->fetchInputItems($request);
            // 項目の選択肢_配列
            $fetchInputItemsSelector = $this->Wqm010Service->fetchInputItemsSelector($request);
            $itemFilters = [];
            $selectItemList = [];
            $this->formatItem($fetchInputItems, $fetchInputItemsSelector, $itemFilters, $selectItemList);

            // 地点番号_配列
            $fetchInputPoints = $this->Wqm010Service->fetchInputPoints($request);
            $point_filters = [];
            foreach ($fetchInputPoints as $point_key => $point) {
                array_push($point_filters, $point->point_no);
            }

            // 検査情報の入力データを取得
            $fetchInputData = $this->Wqm010Service->fetchInputData($request, $itemFilters, $point_filters);
            $inputDataList = array();
            $this->formatInputData($inputDataList, $fetchInputData);

            $filePath = false;
            // 指標値の分を取得
            if (!is_null($additionalNumber)) {
                // 項目番号
                $additionalInputItems = $this->Wqm010Service->fetchInputItems((object)$additionalRequest);
                $additionalItemFilters = [];
                $additionalItemSelector = null;
                $this->formatItem($additionalInputItems, null, $additionalItemFilters, $additionalItemSelector);
                // 入力データ
                $additionalInputData = $this->Wqm010Service->fetchInputData((object)$additionalRequest, $additionalItemFilters, $point_filters);
                $additionalInputDataList = array();
                $this->formatInputData($additionalInputDataList, $additionalInputData);
                // 採水地点は同一のため、地点番号に関してはそのまま利用する。

                // テンプレート書き込み処理
                $filePath = $this->Wqm010Service->exportnouyaku($fetchInputItems, $fetchInputPoints, $inputDataList, $selectItemList, $additionalInputItems, $additionalInputDataList);
            } else {
                // テンプレート書き込み処理
                $filePath = $this->Wqm010Service->exportImportTemplate($fetchInputItems, $fetchInputPoints, $inputDataList, $selectItemList);
            }

            if ($filePath === false) {
                return response()->json(array('errors' => array('export' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }

            // ダウンロードパス取得
            return response()->download($filePath)->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
        }
        return response()->json(array('errors' => array('export' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
    }

    /**
     * 取得した項目の整形
     */
    private function formatItem($fetchInputItems, $fetchInputItemsSelector, &$itemFilters, &$selectItemList = null)
    {
        foreach ($fetchInputItems as  $item) {
            array_push($itemFilters, $item->item_no);
        }

        if ($selectItemList !== null) {
            $item = $fetchInputItemsSelector[0]->item_no;
            $selectItem = array();
            foreach ($fetchInputItemsSelector as $value) {
                if ($item !== $value->item_no) {
                    $selectItemList[$item] = $selectItem;
                    $item = $value->item_no;
                    $selectItem = array();
                }
                $selectItem[] = $value->selection_name;
            }
        }
    }

    /**
     * 取得した入力データの整形
     */
    private function formatInputData(&$inputDataList, $fetchInputData)
    {
        $inputData = array();
        if ($fetchInputData !== null && count((array) $fetchInputData) !== 0) {
            $point = $fetchInputData[0]->point_no;
            foreach ($fetchInputData as $value) {
                if ($point !== $value->point_no) {
                    $inputDataList[$point] = $inputData;
                    $point = $value->point_no;
                    $inputData = array();
                }
                if ($value->constant_qualitative_flg == 2) {
                    $inputData[$value->item_no] = $value->qualitative_data;
                } else {
                    $inputData[$value->item_no] = $value->constant_data;
                }
            }
            $inputDataList[$point] = $inputData;
        }
    }

    /**
     * Excel出力画面 取込処理
     */
    public function fileImport(Wqm010Request $request)
    {

        // Excelファイルか否かのチェック
        if (strtolower(pathinfo($_FILES['import_file']['name'], PATHINFO_EXTENSION)) !== 'xlsx') {
            return response()->json(array('errors' => array('fileImport' => [['WQ-0017E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 入力画面構成情報取得
        $inputDspConfig = $this->Wqm010Service->getInputDspConfig($request->selected_menu_no);

        // 農薬類 濃度or指標値取込時 対応する別入力画面の画面番号を設定
        $additionalNumber = null;
        foreach (config('const.pairDspConfig') as $nums) {
            if (in_array($inputDspConfig->input_dsp_no, $nums)) {
                $dspNumber = $nums[0] == $inputDspConfig->input_dsp_no ? $nums[1] : $nums[0];
                $menuNumber = $this->Wqm010Service->getMenuNo($dspNumber);
                $additionalNumber = count($menuNumber) > 0 ? $menuNumber[0]->input_menu_no : null;
                break;
            }
        }
        $additionalRequest['selected_menu_no'] = $additionalNumber;

        // 項目番号_配列
        $fetchInputItems = $this->Wqm010Service->fetchInputItems($request);
        $itemList = [];
        $item_filters = [];
        foreach ($fetchInputItems as $item_key => $item) {
            array_push($item_filters, $item->item_no);
            $itemList[$item->item_name] = array(
                'item_no'   =>  $item->item_no,
                'flg'       =>  $item->constant_qualitative_flg,
                'type'      =>  $item->input_type,
            );
        }

        // 農薬類 濃度or指標値取込時 対応する別入力画面の入力項目を取得
        if ($additionalNumber !== null) {
            $addfetchInputItems = $this->Wqm010Service->fetchInputItems((object)$additionalRequest);
            foreach ($addfetchInputItems as $item_key => $item) {
                array_push($item_filters, $item->item_no);
                $itemList[$item->item_name] = array(
                    'item_no'   =>  $item->item_no,
                    'flg'       =>  $item->constant_qualitative_flg,
                    'type'      =>  $item->input_type,
                );
            }
        }

        // 採水地点_配列
        $fetchInputPoints = $this->Wqm010Service->fetchInputPoints($request);
        $pointList = [];
        $point_filters = [];
        foreach ($fetchInputPoints as $point_key => $point) {
            $pointList[$point->point_name] = $point->point_no;
            array_push($point_filters, $point->point_no);
        }

        // マスク項目_配列
        $fetchInputMask = $this->Wqm010Service->fetchInputMask($request, $item_filters, $point_filters);
        $maskList = [];
        $point_no = '';
        foreach ($fetchInputMask as $maskData) {
            $maskList[$maskData->point_no][$maskData->item_no] = $maskData->input_dsp_no;
        }

        // ファイルデータ読込
        $importData = $this->Wqm010Service->fileImport($request, $itemList, $pointList, $maskList, $inputDspConfig);
        if ($importData === false) {
            return response()->json(array('errors' => array('fileImport_excel' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        } else if (!array_key_exists('import_data', $importData)) {
            return response()->json(array('errors' => $importData), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 排他チェック　入力用テンプレートファイルの出力後に、変更のあった項目は存在するか
        $haitaCheck = $this->Wqm010Service->fileImportHaitaCheck($request->selected_menu_no, $importData['create_date']);
        if ($haitaCheck) {
            return response()->json(array('errors' => array('fileImport_haita' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 登録 or 更新 or 削除
        $saveInputData = array();
        $saveInputData = $this->Wqm010Service->saveFileInputData($request, $importData['import_data'], $maskList);
        if ($saveInputData === false) {
            return response()->json(array('errors' => array('fileImport_save' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'resultDateList' => $saveInputData,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }
}
