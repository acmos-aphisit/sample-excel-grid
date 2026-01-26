<?php

namespace App\Services;

use App\Dao\Wqm030Dao;
use Illuminate\Support\Facades\Log;
use DateTime;

/**
 * 報告書出力サービス
 *
 * @author
 */
class Wqm030Service
{
    // 報告書出力DAO
    private $Wqm030Dao;

    /**
     * コンストラクタ
     * 
     */
    public function __construct()
    {
        $this->Wqm030Dao = new Wqm030Dao();
    }

    /**
     * 出力一覧 取得
     * 
     */
    public function getDspOutputList($request)
    {
        try {
            // 報告書構成 地点有無チェック
            $point_flg = $this->Wqm030Dao->getReportConfigPoint($request->report_no);
            if ($point_flg === false) {
                throw new \Exception("報告書構成 地点有無チェックに失敗しました。");
            }

            // 報告書構成に地点なし
            if ($point_flg == '0' || $request->report_no == 1) {
                // 報告書分類が3(年報)の場合
                if ($request->report_category == config("const.report_category.year_report")) {
                    // 選択した日付の年度開始日～年度終了日を算出
                    $date = new DateTime($request->selected_date);
                    $start_date = new DateTime((clone $date)->modify("-3 months")->format('Y') . '-04-01');
                    $end_date = new DateTime(((clone $date)->modify("-3 months")->format('Y') + 1) . '-03-31');
                    $start_date_str = $start_date->format('Y/m/d');
                    $end_date_str = $end_date->format('Y/m/d');
                    $unify_flg = true;
                } else {
                    // 選択した日付の月初～月末を算出
                    $date = new DateTime($request->selected_date);
                    $start_date = new DateTime($date->format('Y-m-01'));
                    $end_date = new DateTime($date->format('Y-m-t'));
                    $start_date_str = $start_date->format('Y/m/d');
                    $end_date_str = $end_date->format('Y/m/d');

                    // 月報の日付取得パターンを判定
                    $unify_flg = true;
                    foreach(config('const.MonthlyReportNonUnify') as $nonUnifyReportType){
                        if ($request->report_type == $nonUnifyReportType) {
                            $unify_flg = false;
                            break;
                        }
                    }
                }

                // 農薬類検査結果書の場合
                if ($request->report_no == '64') {
                    // 農薬類検査結果書 出力一覧 取得
                    $grid_table_data = $this->Wqm030Dao->getDspOutputListNouyaku($request->report_no, $start_date_str, $end_date_str, $request->affiliation_section_no, $request->sort_column, $request->sort_order);
                    if ($grid_table_data === false) {
                        throw new \Exception("出力一覧の取得に失敗しました。");
                    }
                } else {
                    // 出力一覧 取得
                    $grid_table_data = $this->Wqm030Dao->getDspOutputListNonPoint($request->report_no, $start_date_str, $end_date_str, $unify_flg, $request->sort_column, $request->sort_order);
                    if ($grid_table_data === false) {
                        throw new \Exception("出力一覧の取得に失敗しました。");
                    }
                }
            } else {
                // 報告書分類が3(年報)の場合
                if ($request->report_category == config("const.report_category.year_report")) {
                    // 選択した日付の年度開始日～年度終了日を算出
                    $date = new DateTime($request->selected_date);
                    $start_date = new DateTime((clone $date)->modify("-3 months")->format('Y') . '-04-01');
                    $end_date = new DateTime(((clone $date)->modify("-3 months")->format('Y') + 1) . '-03-31');
                    $start_date_str = $start_date->format('Y/m/d');
                    $end_date_str = $end_date->format('Y/m/d');
                } else {
                    // 選択した日付の月初～月末を算出
                    $date = new DateTime($request->selected_date);
                    $start_date = new DateTime($date->format('Y-m-01'));
                    $end_date = new DateTime($date->format('Y-m-t'));
                    $start_date_str = $start_date->format('Y/m/d');
                    $end_date_str = $end_date->format('Y/m/d');
                }

                // 出力一覧 取得
                $grid_table_data = $this->Wqm030Dao->getDspOutputListPoint($request->report_no, $start_date_str, $end_date_str, $request->report_category, $request->sort_column, $request->sort_order);
                if ($grid_table_data === false) {
                    throw new \Exception("出力一覧の取得に失敗しました。");
                }
            }

            return $grid_table_data;
        } catch(\Exception $e){
            Log::info($e->getMessage());
            Log::info($e->getTraceAsString());
            return false;
        }
    }

    /**
     * 出力一覧(週報) 取得
     * 
     */
    public function getDspWeekOutputList($report_no, $selected_date, $sort_column, $sort_order)
    {
        try {
            $mondays = [];
            $timestamp = strtotime($selected_date);
            $month = date('m', $timestamp);
            $year = date('Y', $timestamp);

            // 月の最初の日を取得
            $firstDay = strtotime("$year-$month-01");

            // 月の最初の月曜日を取得
            $firstMonday = strtotime('Monday', $firstDay);

            // 選択した日付の月の範囲内で月曜日の日付を取得
            while (date('m', $firstMonday) == $month) {
                $mondays[] = date('Y-m-d', $firstMonday);
                $firstMonday = strtotime('+1 week', $firstMonday);
            }

            // 出力一覧(週報) 取得
            $grid_table_data = $this->Wqm030Dao->getDspWeekOutputList($report_no, $mondays, $sort_column, $sort_order);
            if ($grid_table_data === false) {
                throw new \Exception("出力一覧の取得に失敗しました。");
            }

            return $grid_table_data;
        } catch(\Exception $e){
            Log::info($e->getMessage());
            Log::info($e->getTraceAsString());
            return false;
        }
    }

    /**
     * 出力一覧(月報報告書) 取得
     * 
     */
    public function getDspMonthlyOutputList($affiliation_section_no, $selected_date, $sort_column, $sort_order)
    {
        try {
            // 選択した日付の月初～月末を算出
            $date = new DateTime($selected_date);
            $start_date = new DateTime($date->format('Y-m-01'));
            $end_date = new DateTime($date->format('Y-m-t'));
            $start_date_str = $start_date->format('Y/m/d');
            $end_date_str = $end_date->format('Y/m/d');

            // 出力一覧(月報報告書) 取得
            $grid_table_data = $this->Wqm030Dao->getDspMonthlyOutputList($affiliation_section_no, $start_date_str, $end_date_str, $sort_column, $sort_order);
            if ($grid_table_data === false) {
                throw new \Exception("出力一覧の取得に失敗しました。");
            }

            return $grid_table_data;
        } catch(\Exception $e){
            Log::info($e->getMessage());
            Log::info($e->getTraceAsString());
            return false;
        }
    }

    /**
     * 出力一覧() 取得
     * 
     */
    public function getDspLabelContentsOutputList($menu_no, $selected_date, $sort_column, $sort_order)
    {
        try {
            // 選択した日付の月初～月末を算出
            $date = new DateTime($selected_date);
            $start_date = new DateTime((clone $date)->modify("-3 months")->format('Y') . '-04-01');
            $end_date = new DateTime(((clone $date)->modify("-3 months")->format('Y') + 1) . '-03-31');
            $start_date_str = $start_date->format('Y/m/d');
            $end_date_str = $end_date->format('Y/m/d');

            // 出力一覧() 取得
            $grid_table_data = $this->Wqm030Dao->getDspLabelContentsOutputList($menu_no, $start_date_str, $end_date_str, $sort_column, $sort_order);
            if ($grid_table_data === false) {
                throw new \Exception("出力一覧の取得に失敗しました。");
            }

            return $grid_table_data;
        } catch(\Exception $e){
            Log::info($e->getMessage());
            Log::info($e->getTraceAsString());
            return false;
        }
    }
}