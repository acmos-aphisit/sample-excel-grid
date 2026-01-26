<?php

// 帳票出力用コントローラー
namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use App\Dao\ReportDao;
use App\Dao\ReportDaoNo700;
use App\Dao\ReportDaoNo701;
use App\Services\ReportServiceNo700;
use App\Services\ReportServiceNo701;
use Illuminate\Support\Facades\Log;

class Report3SigmaController extends Controller
{
    /**
     * コンストラクタ
     *
     * @param Auth $auth
     */
    public function __construct()
    {
    }

    /**
     * 出力処理
     */
    public function export3Sigma(Request $request)
    {
        try {
            //パラメータを変数に格納
            $data = $request->json()->all();
            foreach ($data['output_data'] as $param) {
                $reportNo = $param['report_no']; // 報告書番号
                // 報告書分類を取得
                $retData = ReportDao::getReportCategory($reportNo);
                if ($retData === false) {
                    //★エラー処理は後で
                    return false ;
                }

                // 共同検査StartY-EndY51項目(OutPutDay)の出力処理
                if ($reportNo == 700) {
                    $reportDao = new ReportDaoNo700();
                    $reportService = new ReportServiceNo700($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                } elseif ($reportNo == 701){
                    $reportDao = new ReportDaoNo701();
                    $reportService = new ReportServiceNo701($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                } else {
                    // 何も実施しない
                }
            }

            // ZIPファイル作成処理：アクモス
            $tempDir = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $request->user()->user_id;
            
            if(!file_exists($tempDir)){
                if(!mkdir($tempDir,0777,true)){
                    throw new \Exception('帳票作成失敗');
                }
            }

            // 対象ファイル一覧
            $files = glob($tempDir . DIRECTORY_SEPARATOR . '*.xlsx');

            // ファイルが1件ならそのままダウンロード
            if (count($files) === 1) {
                $filePath = $files[0];
                $fileName = basename($filePath);

                $headers = [
                    'Content-Disposition' => "attachment; filename*=UTF-8''" . rawurlencode($fileName),
                    'Access-Control-Expose-Headers' => 'Content-Disposition'
                ];

                // ダウンロード後にファイル削除
                dispatch(function () use ($filePath) {
                    if (file_exists($filePath)) {
                        unlink($filePath);
                    }
                })->afterResponse();

                return response()->download($filePath, $fileName, $headers);
            }
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());
        }
        return response()->json(array('errors' => array('export' => [['WQ-0002E']])), config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'));
    }
}
