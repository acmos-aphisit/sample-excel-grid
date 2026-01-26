<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use App\Services\CommonService;
use Illuminate\Support\Facades\Log;

class CommonController extends Controller
{
    //汎用サービス
    private $commonService;

    /**
     * コンストラクタ
     * 
     * @param Auth $auth
     */
    public function __construct()
    {
        $this->commonService = new CommonService();
    }

    /**
     * 
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function index(Request $request)
    {

        // レスポンスの生成
        $response = array();

        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * CSVデータ移行
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function migrateCsvToDb(Request $request)
    {
        $migrateCsvToDb = $this->commonService->migrateCsvToDb($request);

        // レスポンスの生成
        $response = array($migrateCsvToDb);

        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * ページを判定し、メニュー情報を取得
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function checkSideMenuInputOrReport(Request $request)
    {
        Log::info($request);
        // 登録画面か出力画面かを判定
        if ($request->page == "WQM010") {
            return $this->getInputMenu();
        } else if ($request->page == "WQM030") {
            return $this->getReportMenu($request);
        }
    }

    /**
     * 検査情報登録画面のメニューを取得
     * 
     * @return JsonResponse
     * @throws Exception
     */
    public function getInputMenu()
    {
        $getInputMenu = $this->commonService->getInputMenu();
        if (!$getInputMenu) {
            return response()->json(array('errors' => array('getInputMenu' => [['WQ-0006E', '入力メニュー']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        $getAffiliationData = $this->commonService->getAffiliationData();
        if (!$getAffiliationData) {
            return response()->json(array('errors' => array('getAffiliationData' => [['WQ-0006E', '所属課']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status'   => 'success',
            'menuData' => $getInputMenu,
            'affiliationData' => $getAffiliationData,
        );

        // 結果レスポンス
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 報告書画面系のメニューを取得
     * 
     * @return JsonResponse
     * @throws Exception
     */
    public function getReportMenu(Request $request)
    {
        $getReportMenu = $this->commonService->getReportMenu($request->affiliation_section_no, $request->security_level);
        if (!$getReportMenu) {
            return response()->json(array('errors' => array('getReportMenu' => [['WQ-0006E', '報告書メニュー']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        $getAffiliationData = $this->commonService->getAffiliationData();
        if (!$getAffiliationData) {
            return response()->json(array('errors' => array('getAffiliationData' => [['WQ-0006E', '所属課']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status'   => 'success',
            'menuData' => $getReportMenu,
            'affiliationData' => $getAffiliationData,
        );

        // 結果レスポンス
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 選択している画面の情報を取得
     * 
     * @return JsonResponse
     * @throws Exception
     */
    public function getSelectedDspInfo(Request $request)
    {
        $getSelectedDspInfo = $this->commonService->getSelectedDspInfo($request->input_menu_no);
        if (!$getSelectedDspInfo) {
            return response()->json(array('errors' => array('getSelectedDspInfo' => [['WQ-0006E', '画面情報']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status'   => 'success',
            'dspInfo' => $getSelectedDspInfo[0]
        );

        // 結果レスポンス
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 地点情報を取得
     * 
     * @return JsonResponse
     * @throws Exception
     */
    public function getPointInfo(Request $request)
    {
        $getPointInfo = $this->commonService->getPointInfo($request->point_no);
        if (!$getPointInfo) {
            return response()->json(array('errors' => array('getPointInfo' => [['WQ-0006E', '地点情報']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status'   => 'success',
            'pointInfo' => $getPointInfo[0]
        );

        // 結果レスポンス
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * メニューラベルの選択肢を取得
     * 
     * @return JsonResponse
     * @throws Exception
     */
    public function getMenuLabelSelection()
    {
        // 親ラベル_入力画面用
        $getParentMenuData = $this->commonService->getParentMenuData();
        if (!$getParentMenuData) {
            return response()->json(array('errors' => array('getParentMenuData' => [['WQ-0006E', '入力画面用の親ラベル']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 親ラベル_帳票出力用
        $getParentMenuReportData = $this->commonService->getParentMenuReportData();
        if (!$getParentMenuReportData) {
            return response()->json(array('errors' => array('getParentMenuReportData' => [['WQ-0006E', '帳票出力用の親ラベル']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 所属課
        $getAffiliationData = $this->commonService->getAffiliationData();
        if (!$getAffiliationData) {
            return response()->json(array('errors' => array('getAffiliationData' => [['WQ-0006E', '所属課']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 参照画面
        $getRefMenuData = $this->commonService->getRefMenuData();
        if (!$getRefMenuData) {
            return response()->json(array('errors' => array('getRefMenuData' => [['WQ-0006E', '参照画面']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 参照報告書
        // $getRefRptMenuData = $this->commonService->getRefRptMenuData();
        $getRefRptMenuData = $this->commonService->getRefRptMenuListData();
        if (!$getRefMenuData) {
            return response()->json(array('errors' => array('getRefRptMenuListData' => [['WQ-0006E', '参照報告書']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status'   => 'success',
            'parentMenuData' => $getParentMenuData,
            'getParentMenuReportData' => $getParentMenuReportData,
            'affiliationData' => $getAffiliationData,
            'refMenuData' => $getRefMenuData,
            'refRptMenuData' => $getRefRptMenuData,
            'displayTime' => $this->commonService->getCurrentDisplayTime(),
        );

        // 結果レスポンス
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 検査項目設定子画面表示処理
     * 
     * @return JsonResponse
     * @throws Exception
     */
    public function getItemSettingSelection()
    {
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

        // レスポンスの生成
        $response = array(
            'status'   => 'success',
            'itemDaiCategoryData' => $fetchItemDaiCategoryData,
            'itemTyuCategoryData' => $fetchItemTyuCategoryData,
            'displayTime' => $this->commonService->getCurrentDisplayTime(),
        );

        // 結果レスポンス
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 採水地点一覧に使用するセレクトボックス処理
     * 
     * @return JsonResponse
     * @throws Exception
     */
    public function getSaisuiPointSelection()
    {
        // 施設マスタ
        $fetchSisetuData = $this->commonService->fetchSisetuData();
        if (!$fetchSisetuData) {
            return response()->json(array('errors' => array('fetchSisetuData' => [['WQ-0006E', '施設マスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 処理過程マスタ
        $fetchProcessData = $this->commonService->fetchProcessData();
        if (!$fetchProcessData) {
            return response()->json(array('errors' => array('fetchProcessData' => [['WQ-0006E', '処理過程マスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 採水区分マスタ
        $fetchSaisuiKbnData = $this->commonService->fetchSaisuiKbnData();
        if (!$fetchSaisuiKbnData) {
            return response()->json(array('errors' => array('fetchSaisuiKbnData' => [['WQ-0006E', '採水区分マスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status'   => 'success',
            'sisetuData' => $fetchSisetuData,
            'processData' => $fetchProcessData,
            'saisuiKbnData' => $fetchSaisuiKbnData,
            'displayTime' => $this->commonService->getCurrentDisplayTime(),
        );

        // 結果レスポンス
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 動画マニュアル情報を取得
     * 
     * @return JsonResponse
     * @throws Exception
     */
    public function fetchManualVideoList(Request $request)
    {
        $fetchManualVideoList = $this->commonService->fetchManualVideoList();
        if (!$fetchManualVideoList) {
            return response()->json(array('errors' => array('fetchManualVideoList' => [['WQ-0006E', '動画マニュアルマスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status'   => 'success',
            'manualVideoList' => $fetchManualVideoList,
            'displayTime' => $this->commonService->getCurrentDisplayTime(),
        );

        // 結果レスポンス
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }
}
