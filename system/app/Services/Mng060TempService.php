<?php

namespace App\Services;

use App\Dao\Mng060TempDao;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;


/**
 * 報告書設定サービス
 *
 * @author
 */
class Mng060TempService
{
    // 検査情報登録DAO
    private $Mng060TempDao;

    /**
     * コンストラクタ
     * 
     */
    public function __construct()
    {
        $this->Mng060TempDao = new Mng060TempDao();
    }

    /**
     * メニューラベルを登録
     * 
     */
    public function saveMenuLabel($request)
    {
        DB::beginTransaction();
        try {
            // 新規登録
            if ($request->process_name == "menu_add") {
                // 登録されている順序の最大値 + 10の値を取得する。
                $getMaxOrder = $this->Mng060TempDao->getReportMenuMaxOrder();
                $setMaxOrder = intval($getMaxOrder[0]->max) + 10;

                // 選択された親メニューの階層を取得する。
                $getCurHierarchy = $this->Mng060TempDao->getReportMenuHierarchy($request->report_parent_menu_no);
                $setCurHierarchy = intval($getCurHierarchy[0]->report_hierarchy) + 1;

                // 新規登録処理
                $saveNewMenuLabel = $this->Mng060TempDao->saveNewMenuLabel($request->report_parent_menu_no, $request->affiliation_section_no, $setCurHierarchy, $request->report_title, $setMaxOrder);

                // エラー発生
                if (!$saveNewMenuLabel) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            } else if ($request->process_name == "menu_edit") {
                // 更新

                // 排他チェック                
                $haitaReportMenuData = $this->Mng060TempDao->haitaReportMenuData($request->report_menu_no, $request->display_time);
                if (!$haitaReportMenuData) {
                    return config('const.UPDATE_UPDATED_ERROR');
                }

                // 選択された親メニューの階層を取得する。 ※ 親ラベル編集した時、階層を更新
                $getCurHierarchy = $this->Mng060TempDao->getReportMenuHierarchy($request->report_parent_menu_no);
                $setCurHierarchy = intval($getCurHierarchy[0]->report_hierarchy) + 1;

                // 更新処理
                $saveUpdateMenuLabel = $this->Mng060TempDao->saveUpdateReportMenu($request->report_menu_no, $request->report_parent_menu_no, $request->affiliation_section_no, $setCurHierarchy, $request->report_title);

                // エラー発生
                if (!$saveUpdateMenuLabel) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }

            DB::commit();

            return config('const.INSERT_NO_ERROR');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return config('const.OTHER_ERROR');
        }
    }

    /**
     * メニューの順序を取替
     * 
     */
    public function exchangeMenuOrder($request)
    {
        DB::beginTransaction();
        try {
            // 順序取替

            // 排他チェック                
            $haitaCurInputMenuData = $this->Mng060TempDao->haitaInputMenuData($request->cur_menu_no, $request->display_time);
            if (!$haitaCurInputMenuData) {
                return config('const.UPDATE_UPDATED_ERROR');
            }

            $haitaTargetInputMenuData = $this->Mng060TempDao->haitaInputMenuData($request->target_menu_no, $request->display_time);
            if (!$haitaTargetInputMenuData) {
                return config('const.UPDATE_UPDATED_ERROR');
            }

            // 移動対象の順序更新
            $saveUpdateCurMenuLabelOrder = $this->Mng060TempDao->exchangeMenuOrder($request->cur_menu_no, $haitaTargetInputMenuData[0]->report_order);

            // エラー発生
            if (!$saveUpdateCurMenuLabelOrder) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }

            // 移動先の順序更新
            $saveUpdateTargetMenuLabelOrder = $this->Mng060TempDao->exchangeMenuOrder($request->target_menu_no, $haitaCurInputMenuData[0]->report_order);

            // エラー発生
            if (!$saveUpdateTargetMenuLabelOrder) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }

            DB::commit();

            return config('const.INSERT_NO_ERROR');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return config('const.OTHER_ERROR');
        }
    }
}
