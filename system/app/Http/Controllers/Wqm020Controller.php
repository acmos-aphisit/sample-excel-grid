<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\Wqm020Request;
use App\Dao\ReportDao;
use App\Dao\ReportDaoNo701;
use App\Services\ReportServiceNo701;
use App\Services\Wqm020Service;
use Illuminate\Support\Facades\Log;

class Wqm020Controller extends Controller
{
    // 報告書出力サービス
    private $Wqm020Service;

    /**
     * コンストラクタ
     * 
     * @param Auth $auth
     */
    public function __construct()
    {
        $this->Wqm020Service = new Wqm020Service();
    }

    /**
     * 初期値取得処理
     */
    public function index(){

        // 検査区分
        $kbnResult = array();
        $kbnResult = $this->Wqm020Service->getKbn();
        if ($kbnResult === false) {
            return response()->json(array('errors' => array('index_kbn'=> [['WQ-0009E']])) ,config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 浄水場(施設)
        $sisetuResult = array();
        $sisetuResult = $this->Wqm020Service->getSisetu();
        if ($sisetuResult === false) {
            return response()->json(array('errors' => array('index_sisetu'=> [['WQ-0009E']])) ,config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 処理過程
        $processResult = array();
        $processResult = $this->Wqm020Service->getProcess();
        if ($processResult === false) {
            return response()->json(array('errors' => array('index_process'=> [['WQ-0009E']])) ,config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 検査項目大分類
        $catResult = array();
        $catResult = $this->Wqm020Service->getCat();
        if ($catResult === false) {
            return response()->json(array('errors' => array('index_cat'=> [['WQ-0009E']])) ,config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 採水地点
        $pointResult = array();
        $pointResult = $this->Wqm020Service->getPoint();
        if ($pointResult === false) {
            return response()->json(array('errors' => array('index_point'=> [['WQ-0009E']])) ,config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 検査項目
        $itemResult = array();
        $itemResult = $this->Wqm020Service->getItem();
        if ($itemResult === false) {
            return response()->json(array('errors' => array('index_item'=> [['WQ-0009E']])) ,config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status'    => 'success',
            'kbn'       =>  $kbnResult,
            'sisetu'    =>  $sisetuResult,
            'process'   =>  $processResult,
            'cat'       =>  $catResult,
            'point'     =>  $pointResult,
            'item'      =>  $itemResult,
        );

        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 処理過程と詳細箇所を浄水場で絞り込んで取得
     */
    public function getPointAndProcess(Request $request)
    {
        // 処理過程
        $processResult = array();
        $processResult = $this->Wqm020Service->getProcess($request);
        if ($processResult === false) {
            return response()->json(array('errors' => array('getSaisuiPoint_process'=> [['WQ-0009E']])) ,config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 採水地点
        $pointResult = array();
        $pointResult = $this->Wqm020Service->getPoint($request);
        if ($pointResult === false) {
            return response()->json(array('errors' => array('getSaisuiPoint_point'=> [['WQ-0009E']])) ,config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status'    => 'success',
            'process'   =>  $processResult,
            'point'     =>  $pointResult,
        );

        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 浄水場と詳細箇所を処理過程で絞り込んで取得
     */
    public function getSaisuiPoint(Request $request)
    {

        // 浄水場(施設)
        $sisetuResult = array();
        $sisetuResult = $this->Wqm020Service->getSisetu($request);
        if ($sisetuResult === false) {
            return response()->json(array('errors' => array('getSaisuiPoint_sisetu'=> [['WQ-0009E']])) ,config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // 採水地点
        $pointResult = array();
        $pointResult = $this->Wqm020Service->getPoint($request);
        if ($pointResult === false) {
            return response()->json(array('errors' => array('getSaisuiPoint_point'=> [['WQ-0009E']])) ,config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status'    => 'success',
            'sisetu'    =>  $sisetuResult,
            'point'     =>  $pointResult,
        );

        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 検索項目設定 再取得
     * 検査項目を検査種類で絞り込んで取得
     */
    public function getItem(Request $request)
    {
        // 検査項目
        $itemResult = array();
        $itemResult = $this->Wqm020Service->getItem($request);
        if ($itemResult === false) {
            return response()->json(array('errors' => array('index_item'=> [['WQ-0009E']])) ,config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status'    => 'success',
            'item'      =>  $itemResult,
        );

        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 出力一覧表示
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function search(Wqm020Request $request)
    {
        $limitOver = true;
        $limitOver = $this->Wqm020Service->getCountSearchList($request);
        if ($limitOver === true) {
            return response()->json(array('errors' => array('search_count'=> [['WQ-0015W','検索結果',config('const.SEARCH_LIMIT','50000').'件']])) ,config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        $result = array();
        $result = $this->Wqm020Service->getList($request);
        if ($result === false) {
            return response()->json(array('errors' => array('search_list'=> [['WQ-0009E']])) ,config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        $calcResult = array();
        $calcResult = $this->Wqm020Service->getCalcState($request);
        if ($calcResult === false) {
            return response()->json(array('errors' => array('search_calc'=> [['WQ-0009E']])) ,config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
        }

        // レスポンスの生成
        $response = array(
            'status'    => 'success',
            'list'      =>  $result,
            'calc'      =>  $calcResult, 
        );

        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }

    /**
     * 出力処理
     */
    public function exportSearchData(Request $request)
    {
        try {
            $limitOver = true;
            $limitOver = $this->Wqm020Service->getCountSearchList($request);
            if ($limitOver === true) {
                return response()->json(array('errors' => array('export_search_count'=> [['WQ-0015W','検索結果',config('const.SEARCH_LIMIT','50000').'件']])) ,config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }

            $result = array();
            $result = $this->Wqm020Service->getList($request,false);
            if ($result === false) {
                return response()->json(array('errors' => array('export_search'=> [['WQ-0009E']])) ,config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
            }

            // テンプレート書き込み処理
            $filePath = $this->Wqm020Service->exportSearchData($result);
            if ($filePath === false) {
                return response()->json(array('errors' => array('export_file' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
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
     * トレンド画面
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function getTrendData(Request $request)
    {
        // 検査情報の入力データを取得
        $trendData = $this->Wqm020Service->getTrendData($request);

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
            $filePath = $this->Wqm020Service->exportTrend($request);
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
}
