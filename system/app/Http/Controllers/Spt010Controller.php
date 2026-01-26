<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CommonService;
use App\Services\Spt010Service;
use App\Http\Requests\Spt010Request;

class Spt010Controller extends Controller
{
    //汎用サービス
    private $commonService;

    // お知らせ管理サービス
    private $Spt010Service;

    /**
     * コンストラクタ
     * 
     * @param Auth $auth
     */
    public function __construct()
    {
        $this->commonService = new CommonService();
        $this->Spt010Service = new Spt010Service();
    }

    /**
     * お知らせを取得
     * 
     * @param   Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function searchOshiraseData(Request $request)
    {
        // (1)-2 お知らせ一覧取得
        $searchOshiraseData = $this->Spt010Service->searchOshiraseData($request);

        // エラー発生
        if (!is_array($searchOshiraseData) && $searchOshiraseData == false) {
            // 取得処理のエラー発生
            return response()->json(array('errors' => array('searchOshiraseData' => [['WQ-0006E', 'お知らせ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        } else if (is_array($searchOshiraseData) && count($searchOshiraseData) == 0) {
            // 結果は0件
            return response()->json(array('errors' => array('searchOshiraseData' => [['WQ-0011E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'oshirase' => $searchOshiraseData,
            'displayTime' => $this->commonService->getCurrentDisplayTime(),
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * お知らせ登録処理
     * 
     * @param Spt010Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function saveOshiraseData(Spt010Request $request)
    {
        // お知らせ登録処理
        $saveOshiraseData = $this->Spt010Service->saveOshiraseData($request);

        // エラー発生
        if ($saveOshiraseData && $saveOshiraseData !== 0) {
            switch ($saveOshiraseData) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('saveOshiraseData' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('saveOshiraseData' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他のユーザがを同一データを同時に更新
                    return response()->json(array('errors' => array('saveOshiraseData' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('saveOshiraseData' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('saveOshiraseData' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $saveOshiraseData,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }
}
