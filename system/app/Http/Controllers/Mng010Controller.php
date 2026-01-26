<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CommonService;
use App\Services\Mng010Service;
use App\Http\Requests\Mng010Request;
use Illuminate\Support\Facades\Log;

class Mng010Controller extends Controller
{
    //汎用サービス
    private $commonService;

    // ユーザマスタ設定サービス
    private $Mng010Service;

    /**
     * コンストラクタ
     * 
     * @param Auth $auth
     */
    public function __construct()
    {
        $this->commonService = new CommonService();
        $this->Mng010Service = new Mng010Service();
    }

    /**
     * ユーザマスタを取得
     * 
     * @param   Mng050Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function fetchUserData(Request $request)
    {
        // (1)-1 所属課セレクトボックスの作成
        $getAffiliationData = $this->commonService->getAffiliationData();
        if (!$getAffiliationData) {
            return response()->json(array('errors' => array('メニューラベル' => [['WQ-0006E', '所属課']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }
        

        // (1)-2 ユーザマスタ一覧取得
        $fetchUserData = $this->Mng010Service->fetchUserData($request);

        // エラー発生
        if (!$fetchUserData) {
            return response()->json(array('errors' => array('fetchUserData' => [['WQ-0006E', 'ユーザマスタ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'userData' => $fetchUserData,
            'affiliationData' => $getAffiliationData,
            'displayTime' => $this->commonService->getCurrentDisplayTime(),
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * ユーザマスタ登録処理
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function saveUserMasterData(Mng010Request $request)
    {
        // ユーザマスタ登録処理
        $saveUserMasterData = $this->Mng010Service->saveUserMasterData($request);

        // エラー発生
        if ($saveUserMasterData && $saveUserMasterData !== 0) {
            switch ($saveUserMasterData) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('saveUserMasterData' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('saveUserMasterData' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他のユーザがを同一データを同時に更新
                    return response()->json(array('errors' => array('saveUserMasterData' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('saveUserMasterData' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('saveUserMasterData' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $saveUserMasterData,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }
}
