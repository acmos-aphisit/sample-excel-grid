<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CommonService;
use App\Services\Mng020Service;
use App\Http\Requests\Mng020Request;
use Illuminate\Support\Facades\Log;

class Mng020Controller extends Controller
{
    //汎用サービス
    private $commonService;

    // 採水地点設定サービス
    private $Mng020Service;

    /**
     * コンストラクタ
     * 
     * @param Auth $auth
     */
    public function __construct()
    {
        $this->commonService = new CommonService();
        $this->Mng020Service = new Mng020Service();
    }

    /**
     * 採水地点マスタを取得
     * 
     * @param   Mng050Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function searchSaisuiPoint(Request $request)
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

        // 採水地点マスタデータを取得
        $searchSaisuiPoint = $this->Mng020Service->searchSaisuiPoint($request);

        // エラー発生
        if (!$searchSaisuiPoint) {
            return response()->json(array('errors' => array('searchSaisuiPoint' => [['WQ-0006E', '採水地点マスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 採水地点マスタデータを取得 (最大の値)
        $searchMaxSaisuiPoint = $this->Mng020Service->searchMaxSaisuiPoint();

        // エラー発生
        if (!$searchMaxSaisuiPoint) {
            return response()->json(array('errors' => array('searchMaxSaisuiPoint' => [['WQ-0006E', '最大の採水地点番号']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'sisetuData' => $fetchSisetuData,
            'processData' => $fetchProcessData,
            'saisuiKbnData' => $fetchSaisuiKbnData,
            'searchSaisuiPoint' => $searchSaisuiPoint,
            'maxSaisuiPoint'    => $searchMaxSaisuiPoint[0]->max_point_no,
            'displayTime' => $this->commonService->getCurrentDisplayTime(),
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 採水地点設定登録処理
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function saveSaisuiPointData(Mng020Request $request)
    {
        // 採水地点設定登録処理
        $saveSaisuiPointData = $this->Mng020Service->saveSaisuiPointData($request);

        // エラー発生
        if ($saveSaisuiPointData && $saveSaisuiPointData !== 0) {
            switch ($saveSaisuiPointData) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('saveSaisuiPointData' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('saveSaisuiPointData' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他のユーザがを同一データを同時に更新
                    return response()->json(array('errors' => array('saveSaisuiPointData' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('saveSaisuiPointData' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('saveSaisuiPointData' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $saveSaisuiPointData,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }
}
