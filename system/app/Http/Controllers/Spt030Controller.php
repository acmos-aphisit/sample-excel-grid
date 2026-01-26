<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CommonService;
use App\Services\Spt030Service;
use App\Http\Requests\Spt030Request;

class Spt030Controller extends Controller
{
    //汎用サービス
    private $commonService;

    // 運用メモ設定サービス
    private $Spt030Service;

    /**
     * コンストラクタ
     * 
     * @param Auth $auth
     */
    public function __construct()
    {
        $this->commonService = new CommonService();
        $this->Spt030Service = new Spt030Service();
    }

    /**
     * 運用メモを取得
     * 
     * @param   Mng050Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function searchUnyouMemoData(Request $request)
    {
        // (1)-2 運用メモ一覧取得
        $searchUnyouMemoData = $this->Spt030Service->searchUnyouMemoData($request);

        // エラー発生
        if (!is_array($searchUnyouMemoData) && $searchUnyouMemoData == false) {
            // 取得処理のエラー発生
             return response()->json(array('errors' => array('searchUnyouMemoData' => [['WQ-0006E', '運用メモ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        } else if (is_array($searchUnyouMemoData) && count($searchUnyouMemoData) == 0) {
            // 結果は0件
            return response()->json(array('errors' => array('searchOshiraseData' => [['WQ-0011E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'unyouMemo' => $searchUnyouMemoData,
            'displayTime' => $this->commonService->getCurrentDisplayTime(),
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 運用メモ登録処理
     * 
     * @param Spt030Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function saveUnyouMemoData(Spt030Request $request)
    {
        // 運用メモ登録処理
        $saveUnyouMemoData = $this->Spt030Service->saveUnyouMemoData($request);

        // エラー発生
        if ($saveUnyouMemoData && $saveUnyouMemoData !== 0) {
            switch ($saveUnyouMemoData) {
                case config('const.INSERT_NEW_ERROR'):
                    // 排他チェック_新規登録➝データ存在
                    return response()->json(array('errors' => array('saveUnyouMemoData' => [['WQ-0024E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_NO_DATA_ERROR'):
                    // 排他チェック_更新➝対象データ存在しない
                    return response()->json(array('errors' => array('saveUnyouMemoData' => [['WQ-0026E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.UPDATE_UPDATED_ERROR'):
                    // 排他チェック_更新➝他のユーザがを同一データを同時に更新
                    return response()->json(array('errors' => array('saveUnyouMemoData' => [['WQ-0005E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;

                case config('const.DELETE_NO_DATA_ERROR'):
                    // 排他チェック_削除➝対象データ存在しない
                    return response()->json(array('errors' => array('saveUnyouMemoData' => [['WQ-0025E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;


                default:
                    return response()->json(array('errors' => array('saveUnyouMemoData' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                    break;
            }
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'result' => $saveUnyouMemoData,
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }
}
