<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\Wqm030Service;

class Wqm030Controller extends Controller
{
    // 報告書出力サービス
    private $Wqm030Service;

    /**
     * コンストラクタ
     * 
     * @param Auth $auth
     */
    public function __construct()
    {
        $this->Wqm030Service = new Wqm030Service();
    }

    /**
     * 出力一覧表示
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function getDspOutputList(Request $request)
    {
        // 報告書番号が空以外(日報、週報、月報、年報の場合)
        if (!empty($request->report_no)) {

            // 報告書分類が1(週報)の場合
            if ($request->report_category == config("const.report_category.week_report")) {
                // 出力一覧(週報) 取得
                $grid_table_data = $this->Wqm030Service->getDspWeekOutputList($request->report_no, $request->selected_date, $request->sort_column, $request->sort_order);
                if ($grid_table_data === false) {
                    return response()->json(array('errors' => array('getDspWeekOutputList'=> [['WQ-0009E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                }
                if (empty($grid_table_data)) {
                    return response()->json(array('errors' => array('getDspWeekOutputList'=> [['WQ-0018E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                }
            } else {
                // 出力一覧 取得
                $grid_table_data = $this->Wqm030Service->getDspOutputList($request);
                if ($grid_table_data === false) {
                    return response()->json(array('errors' => array('getDspOutputList'=> [['WQ-0009E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                }
                if (empty($grid_table_data)) {
                    return response()->json(array('errors' => array('getDspOutputList'=> [['WQ-0018E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                }
            }

        } else {

            if (empty($request->affiliation_section_no) && !empty($request->menu_no)) {
                $grid_table_data = $this->Wqm030Service->getDspLabelContentsOutputList($request->menu_no, $request->selected_date, $request->sort_column, $request->sort_order);
                if ($grid_table_data === false) {
                    return response()->json(array('errors' => array('getDspMonthlyOutputList'=> [['WQ-0009E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                }
                if (empty($grid_table_data)) {
                    return response()->json(array('errors' => array('getDspMonthlyOutputList'=> [['WQ-0018E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                }
            } else {
                // 報告書番号が空(月報報告書の場合)
                $grid_table_data = $this->Wqm030Service->getDspMonthlyOutputList($request->affiliation_section_no, $request->selected_date, $request->sort_column, $request->sort_order);
                if ($grid_table_data === false) {
                    return response()->json(array('errors' => array('getDspMonthlyOutputList'=> [['WQ-0009E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                }
                if (empty($grid_table_data)) {
                    return response()->json(array('errors' => array('getDspMonthlyOutputList'=> [['WQ-0018E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
                }
            }
        }

        // レスポンスの生成
        $response = array(
            'gridTableData' => $grid_table_data,
        );

        return response()->json($response, config('const.HTTP_STATUS_OK'));
    }
}
