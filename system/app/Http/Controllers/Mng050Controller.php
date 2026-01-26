<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CommonService;
use App\Services\Mng050Service;
use App\Http\Requests\Mng050Request;
use Illuminate\Support\Facades\Log;

class Mng050Controller extends Controller
{
    //汎用サービス
    private $commonService;

    // 入力画面設定サービス
    private $Mng050Service;

    /**
     * コンストラクタ
     * 
     * @param Auth $auth
     */
    public function __construct()
    {
        $this->commonService = new CommonService();
        $this->Mng050Service = new Mng050Service();
    }

    /**
     * 入力画面情報の表示内容取得
     * 
     * @param   Mng050Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function getSelectedMenu(Request $request)
    {
        // 入力画面情報の表示内容取得
        $getSelectedMenu = $this->Mng050Service->getSelectedMenu($request);

        // エラー発生
        if (!$getSelectedMenu) {
            return response()->json(array('errors' => array('getSelectedMenu' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        $getInspectionLists = $this->Mng050Service->getInspectionLists();
        if (!$getInspectionLists) {
            return response()->json(array('errors' => array('getSelectedMenu' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 地点番号_配列
        $fetchInputPoints = $this->Mng050Service->fetchInputPoints($request);
        $point_filters = [];
        foreach ($fetchInputPoints as $point_key => $point) {
            array_push($point_filters, $point->point_no);
        }

        // 項目番号_配列
        $fetchInputItems = $this->Mng050Service->fetchInputItems($request);
        $item_filters = [];
        foreach ($fetchInputItems as $item_key => $item) {
            array_push($item_filters, $item->item_no);
        }

        // 初期化項目[1,2]_配列
        $fetchInputInitItems = $this->Mng050Service->fetchInputInitItems($request);

        // 入力マスク_配列
        $fetchInputMask = $this->Mng050Service->fetchInputMask($request, $item_filters, $point_filters);

        // 採水地点マスタ_配列
        $fetchSelectionPoint = $this->Mng050Service->fetchSelectionPoint();

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'configDspData' => $getSelectedMenu,
            'inspectionLists' => $getInspectionLists,
            'itemData' => $fetchInputItems,
            'initItemData' => $fetchInputInitItems,
            'pointData' => $fetchInputPoints,
            'inputMask' => $fetchInputMask,
            'saisuiPointData' => $fetchSelectionPoint,
            'displayTime' => $this->commonService->getCurrentDisplayTime(),
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 類似入力画面作成処理
     * 
     * @param   Mng050Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function duplicateInputMenuDsp(Mng050Request $request)
    {
        // 類似入力画面作成
        $duplicateInputMenuDsp = $this->Mng050Service->duplicateInputMenuDsp($request);

        // エラー発生
        if ($duplicateInputMenuDsp && $duplicateInputMenuDsp !== 0) {
            switch ($duplicateInputMenuDsp) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('duplicateInputMenuDsp' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                default:
                    return response()->json(array('errors' => array('duplicateInputMenuDsp' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $duplicateInputMenuDsp,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 入力画面登録処理
     * 
     * @param   Mng050Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function saveInputMenuDsp(Mng050Request $request)
    {
        // 入力画面を登録
        $saveInputMenuDsp = $this->Mng050Service->saveInputMenuDsp($request);

        // エラー発生
        if ($saveInputMenuDsp && $saveInputMenuDsp !== 0) {
            switch ($saveInputMenuDsp) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('saveInputMenuDsp' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('saveInputMenuDsp' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他のユーザがを同一データを同時に更新
                    return response()->json(array('errors' => array('saveInputMenuDsp' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('saveInputMenuDsp' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('saveInputMenuDsp' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $saveInputMenuDsp,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * メニューラベルを登録
     * 
     * @param   Mng050Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function saveMenuLabel(Mng050Request $request)
    {
        // 検査情報の入力データを取得
        $saveMenuLabel = $this->Mng050Service->saveMenuLabel($request);

        // エラー発生
        if ($saveMenuLabel && $saveMenuLabel !== 0) {
            switch ($saveMenuLabel) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('saveMenuLabel' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('saveMenuLabel' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他のユーザがを同一データを同時に更新
                    return response()->json(array('errors' => array('saveMenuLabel' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('saveMenuLabel' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('saveMenuLabel' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
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
    public function exchangeMenuOrder(Mng050Request $request)
    {
        // 検査情報の入力データを取得
        $exchangeMenuOrder = $this->Mng050Service->exchangeMenuOrder($request);

        // エラー発生
        if ($exchangeMenuOrder && $exchangeMenuOrder !== 0) {
            switch ($exchangeMenuOrder) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('exchangeMenuOrder' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('exchangeMenuOrder' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他のユーザがを同一データを同時に更新
                    return response()->json(array('errors' => array('exchangeMenuOrder' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('exchangeMenuOrder' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('exchangeMenuOrder' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
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
     * メニュー削除処理
     * 
     * @param   Mng050Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function deleteInputMenu(Request $request)
    {
        // 検査情報の入力データを取得
        $deleteInputMenu = $this->Mng050Service->deleteInputMenu($request);

        // エラー発生
        if ($deleteInputMenu && $deleteInputMenu !== 0) {
            switch ($deleteInputMenu) {
                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('deleteInputMenu' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('deleteInputMenu' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $deleteInputMenu,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 検索項目マスタを取得
     * 
     * @param   Mng050Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function searchInspItem(Request $request)
    {
        // 検査情報の入力データを取得
        $searchInspItem = $this->Mng050Service->searchInspItem($request);

        // エラー発生
        if (!is_array($searchInspItem) && !$searchInspItem) {
            return response()->json(array('errors' => array('searchInspItem' => [['WQ-0006E', '検査項目マスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        } else if (is_array($searchInspItem) && count($searchInspItem) == 0) {
            return response()->json(array('errors' => array('searchInspItem' => [['WQ-0011E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'inspItemData' => $searchInspItem,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 入力画面構成登録処理
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function saveDspConfigData(Request $request)
    {

        // 検査情報の入力データを取得
        $saveDspConfigData = $this->Mng050Service->saveDspConfigData($request);

        // エラー発生
        if ($saveDspConfigData && $saveDspConfigData !== 0) {
            switch ($saveDspConfigData) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('saveDspConfigData' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('saveDspConfigData' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他のユーザがを同一データを同時に更新
                    return response()->json(array('errors' => array('saveDspConfigData' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('saveDspConfigData' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_MASTER_ERROR'):
                    // 排他チェック_マスタ情報更新あり
                    return response()->json(array('errors' => array('saveDspConfigData' => [['WQ-0030E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                default:
                    return response()->json(array('errors' => array('saveDspConfigData' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $saveDspConfigData,
            'displayTime' => $this->commonService->getCurrentDisplayTime(),
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 入力画面構成取消処理
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function discardDspConfigData(Request $request)
    {

        // 検査情報の入力データを取得
        // 202601 修正
        // ※ 入力画面メニューのみ削除
        $discardInputMenu = $this->Mng050Service->discardInputMenu($request);

        // 検査情報の入力データを取得
        // $discardDspConfigData = $this->Mng050Service->discardDspConfigData($request);

        // エラー発生
        // if ($discardDspConfigData && $discardDspConfigData !== 0) {
        //     switch ($discardDspConfigData) {
        //         case config('const.INSERT_NEW_ERROR'):
        //             // 排他チェック_新規登録➝データ存在
        //             return response()->json(array('errors' => array('discardDspConfigData' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        //             break;

        //         case config('const.UPDATE_NO_DATA_ERROR'):
        //             // 排他チェック_更新➝対象データ存在しない
        //             return response()->json(array('errors' => array('discardDspConfigData' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        //             break;

        //         case config('const.UPDATE_UPDATED_ERROR'):
        //             // 排他チェック_更新➝他のユーザがを同一データを同時に更新
        //             return response()->json(array('errors' => array('discardDspConfigData' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        //             break;

        //         case config('const.DELETE_NO_DATA_ERROR'):
        //             // 排他チェック_削除➝対象データ存在しない
        //             return response()->json(array('errors' => array('discardDspConfigData' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        //             break;


        //         default:
        //             return response()->json(array('errors' => array('discardDspConfigData' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        //             break;
        //     }
        // }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $discardInputMenu,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }
}
