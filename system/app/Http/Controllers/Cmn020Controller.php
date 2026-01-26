<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CommonService;
use App\Services\Cmn020Service;

class Cmn020Controller extends Controller
{
    //汎用サービス
    private $commonService;

    // お知らせ設定サービス
    private $Cmn020Service;

    /**
     * コンストラクタ
     * 
     * @param Auth $auth
     */
    public function __construct()
    {
        $this->commonService = new CommonService();
        $this->Cmn020Service = new Cmn020Service();
    }

    /**
     * お知らせを取得
     * 
     * @param   Mng050Request $request
     * @return  JsonResponse
     * @throws  Exception
     */
    public function fetchInfoData(Request $request)
    {
        // (1)-2 お知らせ一覧取得
        $fetchInfoData = $this->Cmn020Service->fetchInfoData($request);

        // エラー発生
        if (!is_array($fetchInfoData) && $fetchInfoData == false) {
            return response()->json(array('errors' => array('fetchInfoData' => [['WQ-0006E', 'お知らせ']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status' => 'success',
            'infoData' => $fetchInfoData,
            'displayTime' => date("Y-m-d H:i:s"),
        );

        // ログイン成功
        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }
}
