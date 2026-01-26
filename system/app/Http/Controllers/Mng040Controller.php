<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CommonService;
use App\Services\Mng040Service;
use App\Http\Requests\Mng040Request;
use Illuminate\Support\Facades\Log;

class Mng040Controller extends Controller
{
    //汎用サービス
    private $commonService;

    // 検査基準マスタ設定サービス
    private $Mng040Service;

    /**
     * コンストラクタ
     * 
     * @param Auth $auth
     */
    public function __construct()
    {
        $this->commonService = new CommonService();
        $this->Mng040Service = new Mng040Service();
    }

    /**
     * 検査基準マスタを取得
     * 
     * @param   Mng050Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function fetchInspCriteriaData(Request $request)
    {
        // (1)-1 基準値一覧検索条件に使用するセレクトボックスの値を取得し、画面に設定する。
        // 検査基準マスタ
        $fetchInspCriteriaHoukijyunList = $this->Mng040Service->fetchInspCriteriaHoukijyunList();
        if (!is_array($fetchInspCriteriaHoukijyunList) && !$fetchInspCriteriaHoukijyunList) {
            return response()->json(array('errors' => array('fetchInspCriteriaHoukijyunList' => [['WQ-0006E', '検査基準マスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // (2)-1 基準値一覧で使用するセレクトボックスの値を取得し、画面に設定する。
        // 採水区分マスタ
        $fetchSaisuiKbnData = $this->commonService->fetchSaisuiKbnData();
        if (!is_array($fetchSaisuiKbnData) && !$fetchSaisuiKbnData) {
            return response()->json(array('errors' => array('fetchSaisuiKbnData' => [['WQ-0006E', '採水区分マスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // (2)-2 画面で選択した検索条件を基に検索結果を取得する。
        // 検査基準マスタ
        $searchInspCriteriaData = $this->Mng040Service->searchInspCriteriaData($request);

        // エラー発生
        if (!is_array($searchInspCriteriaData) && !$searchInspCriteriaData) {
            return response()->json(array('errors' => array('searchInspCriteriaData' => [['WQ-0006E', '検査基準マスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // (4)-1 基準値一覧検索条件に使用するセレクトボックスの値を取得し、画面に設定する。
        // 検査項目大分類マスタ
        $fetchItemDaiCategoryData = $this->commonService->fetchItemDaiCategoryData();
        if (!is_array($fetchItemDaiCategoryData) && !$fetchItemDaiCategoryData) {
            return response()->json(array('errors' => array('fetchItemDaiCategoryData' => [['WQ-0006E', '検査項目大分類マスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 検査項目中分類マスタ
        $fetchItemTyuCategoryData = $this->commonService->fetchItemTyuCategoryData();
        if (!is_array($fetchItemTyuCategoryData) && !$fetchItemTyuCategoryData) {
            return response()->json(array('errors' => array('fetchItemTyuCategoryData' => [['WQ-0006E', '検査項目中分類マスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 最新の適用年度と追加する適用年度を以下条件で取得し、画面に設定する。
        $getLatestYear = $this->Mng040Service->getLatestYear();

        // エラー発生
        if (!is_array($getLatestYear) && !$getLatestYear) {
            return response()->json(array('errors' => array('getLatestYear' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 採水区分マスタ
        $fetchSaisuiKbnData = $this->commonService->fetchSaisuiKbnData();
        if (!$fetchSaisuiKbnData) {
            return response()->json(array('errors' => array('fetchSaisuiKbnData' => [['WQ-0006E', '採水区分マスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'inspCriteriaData' => $searchInspCriteriaData,
            'houKijyunNoList' => $fetchInspCriteriaHoukijyunList,
            'saisuiKbnList' => $fetchSaisuiKbnData,
            'itemDaiCategoryData' => $fetchItemDaiCategoryData,
            'itemTyuCategoryData' => $fetchItemTyuCategoryData,
            'latestYear' => $getLatestYear[0]->latest_year,
            'saisuiKbnData' => $fetchSaisuiKbnData,
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
    public function fetchInspCriteriaHoukijyunList()
    {
        // (1)-1 基準値一覧検索条件に使用するセレクトボックスの値を取得し、画面に設定する。
        // 検査基準マスタ
        $fetchInspCriteriaHoukijyunList = $this->Mng040Service->fetchInspCriteriaHoukijyunList();
        if (!$fetchInspCriteriaHoukijyunList) {
            return response()->json(array('errors' => array('fetchInspCriteriaHoukijyunList' => [['WQ-0006E', '検査基準マスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 採水区分マスタ
        $fetchSaisuiKbnData = $this->commonService->fetchSaisuiKbnData();
        if (!$fetchSaisuiKbnData) {
            return response()->json(array('errors' => array('fetchSaisuiKbnData' => [['WQ-0006E', '採水区分マスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'applyYearList' => $fetchInspCriteriaHoukijyunList,
            'saisuiKbnData' => $fetchSaisuiKbnData,
            'displayTime' => $this->commonService->getCurrentDisplayTime(),
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 選択肢マスタ登録処理
     * 
     * @param Mng040Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function saveSelectionOptionData(Request $request)
    {
        // 検査基準マスタ登録処理
        $saveSelectionOptionData = $this->Mng040Service->saveSelectionOptionData($request);

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
     * 検査基準マスタ登録処理
     * 
     * @param Mng040Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function saveInspCriteriaData(Request $request)
    {
        // 検査基準マスタ登録処理
        $saveInspCriteriaData = $this->Mng040Service->saveInspCriteriaData($request);

        // エラー発生
        if ($saveInspCriteriaData && $saveInspCriteriaData !== 0) {
            switch ($saveInspCriteriaData) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('saveInspCriteriaData' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('saveInspCriteriaData' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他の検査項目がを同一データを同時に更新
                    return response()->json(array('errors' => array('saveInspCriteriaData' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('saveInspCriteriaData' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('saveInspCriteriaData' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $saveInspCriteriaData,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 適用年度追加処理
     * 
     * @param Mng040Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function addNextYearInspCriteria(Request $request)
    {
        // 適用年度追加処理
        $addNextYearInspCriteria = $this->Mng040Service->addNextYearInspCriteria($request);

        // エラー発生
        if ($addNextYearInspCriteria && $addNextYearInspCriteria !== 0) {
            switch ($addNextYearInspCriteria) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('addNextYearInspCriteria' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('addNextYearInspCriteria' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他の検査項目がを同一データを同時に更新
                    return response()->json(array('errors' => array('addNextYearInspCriteria' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('addNextYearInspCriteria' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('addNextYearInspCriteria' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $addNextYearInspCriteria,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }
}
