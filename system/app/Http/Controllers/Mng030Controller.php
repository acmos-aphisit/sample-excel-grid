<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CommonService;
use App\Services\Mng030Service;
use App\Http\Requests\Mng030Request;
use Illuminate\Support\Facades\Log;

class Mng030Controller extends Controller
{
    //汎用サービス
    private $commonService;

    // 検査項目マスタ設定サービス
    private $Mng030Service;

    /**
     * コンストラクタ
     * 
     * @param Auth $auth
     */
    public function __construct()
    {
        $this->commonService = new CommonService();
        $this->Mng030Service = new Mng030Service();
    }

    /**
     * 検査項目マスタを取得
     * 
     * @param   Mng050Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function fetchInspItemData(Request $request)
    {
        // (1)-1 検査項目一覧に使用するセレクトボックスの値を取得し、画面に設定する。
        // 検査項目大分類マスタ
        $fetchItemDaiCategoryData = $this->commonService->fetchItemDaiCategoryData();
        if (!$fetchItemDaiCategoryData) {
            return response()->json(array('errors' => array('fetchItemDaiCategoryData' => [['WQ-0006E', '検査項目大分類マスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 検査項目中分類マスタ
        $fetchItemTyuCategoryData = $this->commonService->fetchItemTyuCategoryData();
        if (!$fetchItemTyuCategoryData) {
            return response()->json(array('errors' => array('fetchItemTyuCategoryData' => [['WQ-0006E', '検査項目中分類マスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // (1)-2 検査項目一覧を取得し、画面に設定する。
        $fetchInspItemData = $this->Mng030Service->fetchInspItemData($request);

        // エラー発生
        if (!$fetchInspItemData) {
            return response()->json(array('errors' => array('fetchInspItemData' => [['WQ-0006E', '検査項目マスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 検査項目マスタデータを取得 (最大の値)
        $searchMaxItemNo = $this->Mng030Service->searchMaxItemNo();

        // エラー発生
        if (!$searchMaxItemNo) {
            return response()->json(array('errors' => array('searchMaxItemNo' => [['WQ-0006E', '最大の検査項目番号']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'inspItemData' => $fetchInspItemData,
            'itemDaiCategoryData' => $fetchItemDaiCategoryData,
            'itemTyuCategoryData' => $fetchItemTyuCategoryData,
            'maxItemNo' => $searchMaxItemNo[0]->max_item_no,
            'displayTime' => $this->commonService->getCurrentDisplayTime(),
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 選択肢マスタを取得
     * 
     * @param   Mng050Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function searchSelectOptionData(Request $request)
    {
        // (3)-1 選択肢の設定を押下した項目の選択肢の一覧を取得し表示する。
        // 選択肢マスタ
        $searchSelectOptionData = $this->Mng030Service->searchSelectOptionData($request);

        // エラー発生
        if (!is_array($searchSelectOptionData) && $searchSelectOptionData == false) {
            return response()->json(array('errors' => array('searchSelectOptionData' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }


        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'selectOptionList' => $searchSelectOptionData,
            'displayTime' => $this->commonService->getCurrentDisplayTime(),
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 選択肢マスタ登録処理
     * 
     * @param Mng030Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function saveSelectionOptionData(Mng030Request $request)
    {
        // 検査項目マスタ登録処理
        $saveSelectionOptionData = $this->Mng030Service->saveSelectionOptionData($request);

        // エラー発生
        if ($saveSelectionOptionData && $saveSelectionOptionData !== 0) {
            switch ($saveSelectionOptionData) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('saveSelectionOptionData' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('saveSelectionOptionData' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他の検査項目がを同一データを同時に更新
                    return response()->json(array('errors' => array('saveSelectionOptionData' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('saveSelectionOptionData' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('saveSelectionOptionData' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $saveSelectionOptionData,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 検査項目マスタ登録処理
     * 
     * @param Mng030Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function saveInspItemData(Mng030Request $request)
    {
        // 検査項目マスタ登録処理
        $saveInspItemData = $this->Mng030Service->saveInspItemData($request);

        // エラー発生
        if ($saveInspItemData && $saveInspItemData !== 0) {
            switch ($saveInspItemData) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('saveInspItemData' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('saveInspItemData' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他の検査項目がを同一データを同時に更新
                    return response()->json(array('errors' => array('saveInspItemData' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('saveInspItemData' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('saveInspItemData' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $saveInspItemData,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }
}
