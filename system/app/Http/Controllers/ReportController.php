<?php

// 帳票出力用コントローラー
namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use App\Dao\ReportDao;
use App\Dao\ReportDaoNo107;
use App\Dao\ReportDaoNo701;
use App\Dao\ReportDaoAnnual;
use App\Dao\ReportDaoAnnualAllPoint;
use App\Dao\ReportDaoAnnualAllPointKbn;
use App\Dao\ReportDaoAnnualNo111;
use App\Dao\ReportDaoAnnualNo125;
use App\Dao\ReportDaoAnnualNo127;
use App\Dao\ReportDaoAnnualNo139;
use App\Dao\ReportDaoAnnualNo416;
use App\Dao\ReportDaoAnnualNo418;
use App\Dao\ReportDaoAnnualNo513;
use App\Dao\ReportDaoAnnualNo536;
use App\Dao\ReportDaoAnnualNo540;
use App\Dao\ReportDaoAnnualNo610;
use App\Dao\ReportDaoAnnualProcAggregation;
use App\Dao\ReportDaoAnnualProcPoint;
use App\Dao\ReportDaoMonthly;
use App\Dao\ReportDaoMonthlyNo400;
use App\Dao\ReportDaoMonthlyNo412;
use App\Dao\ReportDaoMonthlyAllInsKbn;
use App\Dao\ReportDaoMonthlyAllPoint;
use App\Dao\ReportDaoMonthlyAllPointPeriod;
use App\Dao\ReportDaoMonthlyRange;
use App\Dao\ReportDaoMonthlyRangeAllpoint;
use App\Dao\ReportDaoWeekly;
use App\Dao\ReportDaoWeeklyNo320;
use App\Dao\ReportDaoDaily;
use App\Services\ReportService;
use App\Services\ReportServiceNo107;
use App\Services\ReportServiceNo701;
use App\Services\ReportServiceAnnual;
use App\Services\ReportServiceAnnualNo127;
use App\Services\ReportServiceAnnualNo416;
use App\Services\ReportServiceAnnualNo418;
use App\Services\ReportServiceAnnualNo536;
use App\Services\ReportServiceAnnualNo540;
use App\Services\ReportServiceAnnualProc;
use App\Services\ReportServiceDaily;
use App\Services\ReportServiceMonthly;
use App\Services\ReportServiceMonthlyNo14;
use App\Services\ReportServiceMonthlyNo64;
use App\Services\ReportServiceMonthlyNo166;
use App\Services\ReportServiceMonthlyNo213;
use App\Services\ReportServiceMonthlyNo300;
use App\Services\ReportServiceMonthlyNo400;
use App\Services\ReportServiceMonthlyNo404;
use App\Services\ReportServiceMonthlyNo412;
use App\Services\ReportServiceMonthlyNo435;
use App\Services\ReportServiceMonthlyMultiItem;
use App\Services\ReportServiceWeekly;
use App\Services\ReportServiceWeeklyNo320;
use Carbon\Carbon;
use SebastianBergmann\CodeCoverage\Report\Xml\Report;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use App\Services\CommonService;

class ReportController extends Controller
{
    /**
     * @var const OUTPUT_FILE_PATH ファイル出力パス
     */
    private const OUTPUT_FILE_PATH = '/home/suishitsu/system/tmp/';

    //汎用サービス
    private $commonService;

    /**
     * コンストラクタ
     *
     * @param Auth $auth
     */
    public function __construct()
    {
        $this->commonService = new CommonService();
    }

    /**
     * 帳票出力処理
     *
     * @param Request $request
     * @return
     * @throws Exception
     */
    public function export(Request $request)
    {
        //パラメータを変数に格納
        $data = $request->json()->all();
        $monthly_order = 1;

        // 年報一括出力の場合
        if (is_null($data['menu_report_no']) && is_null($data['affiliation_no'])) {
            // ini max_execution_time 30 → 120
            set_time_limit(120);
        }

        foreach ($data['output_data'] as $param) {
            $reportNo = $param['report_no']; // 報告書番号
            $reportCategory = null;

            // 報告書分類を取得
            $retData = ReportDao::getReportCategory($reportNo);
            if ($retData !== false) {
                if (count($retData) > 0) {
                    $reportCategory = ((array)$retData[0])['report_category'];
                }
            } else {
                //★エラー処理は後で
                return false ;
            }

            // 月報報告書の場合
            if (is_null($data['menu_report_no'])) {
                $retData[0]->monthly_list_order = $monthly_order;
            }

            switch ($reportNo) {
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 28:
                case 29:
                case 30:
                case 31:
                case 32:
                case 33:
                case 34:
                case 35:
                case 36:
                case 37:
                case 38:
                case 39:
                case 40:
                case 147:
                case 149:
                case 151:
                case 357:
                case 480:
                    // 月報(期間)
                    $reportDao = new ReportDaoMonthlyRange();
                    $reportService = new ReportServiceMonthly($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 299:
                    // 浄水場用（小山・板戸井）
                    $reportDao = new ReportDaoMonthlyAllPoint();
                    $reportService = new ReportServiceMonthlyNo300($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 300:
                    // 浄水場用（個別）
                    $reportDao = new ReportDaoMonthly();
                    $reportService = new ReportServiceMonthlyNo300($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 319:
                case 600:
                case 601:
                case 602:
                case 603:
                case 604:
                case 605:
                case 606:
                case 607:
                case 608:
                case 609:
                    // 月報(全地点)
                    $reportDao = new ReportDaoMonthlyAllPoint();
                    $reportService = new ReportServiceMonthly($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 285:
                case 286:
                case 287:
                case 288:
                case 289:
                case 290:
                case 291:
                case 292:
                case 297:
                case 298:
                case 301:
                    // 月報(全地点・期間内検査結果取得)
                    $reportDao = new ReportDaoMonthlyAllPointPeriod();
                    $reportService = new ReportServiceMonthly($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 42:
                case 43:
                case 44:
                case 45:
                case 46:
                case 47:
                case 48:
                case 49:
                case 50:
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57:
                case 65:
                case 702:
                case 703:
                case 704:
                case 705:
                case 706:
                case 707:
                case 708:
                case 709:
                case 710:
                case 711:
                    // 月報(期間・全地点)
                    $reportDao = new ReportDaoMonthlyRangeAllpoint();
                    $reportService = new ReportServiceMonthlyMultiItem($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 64:
                    // 農薬類検査結果書
                    $reportDao = new ReportDaoMonthly();
                    $reportService = new ReportServiceMonthlyNo64($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 620:
                case 621:
                case 622:
                case 623:
                case 624:
                case 625:
                case 626:
                case 627:
                case 628:
                case 629:
                case 640:
                case 641:
                case 642:
                case 643:
                case 644:
                case 645:
                case 646:
                case 647:
                case 648:
                case 649:
                    // 月報(全地点・検査区分複数)
                    $reportDao = new ReportDaoMonthlyAllInsKbn();
                    $reportService = new ReportServiceMonthly($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 630:
                case 631:
                case 650:
                case 651:
                    // 年報(全地点)
                    $reportDao = new ReportDaoAnnualAllPointKbn();
                    $reportService = new ReportServiceAnnual($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 215:
                case 216:
                case 217:
                case 218:
                case 652:
                case 660:
                case 661:
                case 662:
                case 663:
                case 664:
                case 665:
                case 666:
                case 667:
                case 668:
                case 669:
                case 670:
                case 671:
                    // 年報(全地点・検査区分複数)
                    $reportDao = new ReportDaoAnnualAllPoint();
                    $reportService = new ReportServiceAnnual($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 320:
                    // 週報(工業用水：鹿島浄水場_薬品注入率)の出力処理
                    $reportDao = new ReportDaoWeeklyNo320();
                    $reportService = new ReportServiceWeeklyNo320($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 400:
                case 440:
                case 441:
                case 442:
                case 443:
                case 444:
                case 445:
                case 446:
                    // 共同検査(浄水)(臨時)の出力処理
                    $reportDao = new ReportDaoMonthlyNo400();
                    $reportService = new ReportServiceMonthlyNo400($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 409:
                case 410:
                    // 共同検査(浄水)(臨時)の出力処理
                    $reportDao = new ReportDaoMonthly();
                    $reportService = new ReportServiceMonthlyNo400($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 412:
                    // 共同検査(浄水)(臨時)の出力処理
                    $reportDao = new ReportDaoMonthlyNo412();
                    $reportService = new ReportServiceMonthlyNo412($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 414:
                case 416:
                    // 共同検査年報の出力処理
                    $reportDao = new ReportDaoAnnualNo416();
                    $reportService = new ReportServiceAnnualNo416($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;

                case 418:
                    // 3年データの出力処理
                    $reportDao = new ReportDaoAnnualNo418();
                    $reportService = new ReportServiceAnnualNo418($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;

                case 404:
                    // 共同検査(管理目標)の出力処理
                    $reportDao = new ReportDaoMonthly();
                    $reportService = new ReportServiceMonthlyNo404($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 435:
                    // 共同検査(管理目標_農薬)の出力処理
                    $reportDao = new ReportDaoMonthly();
                    $reportService = new ReportServiceMonthlyNo435($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 701:
                    // 共同検査StartY-EndY51項目(OutPutDay)の出力処理
                    $reportDao = new ReportDaoNo701();
                    $reportService = new ReportServiceNo701($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 14:
                    // 原水水質検査結果の出力処理
                    $reportDao = new ReportDaoMonthly();
                    $reportService = new ReportServiceMonthlyNo14($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 213:
                    // 取水原水全項目検査結果書の出力処理
                    $reportDao = new ReportDaoMonthly();
                    $reportService = new ReportServiceMonthlyNo213($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 111:
                    // 年報（取水原水水質検査）
                    $reportDao = new ReportDaoAnnualNo111();
                    $reportService = new ReportServiceAnnual($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 536:
                case 537:
                case 538:
                case 539:
                    // 年報（要検討項目）
                    $reportDao = new ReportDaoAnnualNo536();
                    $reportService = new ReportServiceAnnualNo536($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 540:
                case 541:
                case 543:
                    // 年報（クリプトスポリジウム等）
                    $reportDao = new ReportDaoAnnualNo540();
                    $reportService = new ReportServiceAnnualNo540($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 166:
                case 167:
                case 168:
                    // 浄水水質検査結果書の出力処理
                    $reportDao = new ReportDaoMonthly();
                    $reportService = new ReportServiceMonthlyNo166($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 125:
                    // 年報（基準項目検査結果表）の出力処理
                    $reportDao = new ReportDaoAnnualNo125();
                    $reportService = new ReportServiceAnnual($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 136:
                case 137:
                case 138:
                case 139:
                    // 年報（水質管理目標設定項目（全項目）検査結果）
                    $reportDao = new ReportDaoAnnualNo139();
                    $reportService = new ReportServiceAnnual($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 98:
                case 99:
                case 100:
                case 101:
                case 102:
                case 103:
                case 104:
                case 105:
                case 106:
                case 107:
                case 108:
                case 109:
                case 110:
                case 141:
                case 142:
                case 143:
                case 144:
                    // 水質検査結果及び概況
                    $reportDao = new ReportDaoNo107();
                    $reportService = new ReportServiceNo107($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 230:
                case 231:
                case 259:
                case 260:
                case 232:
                case 220:
                case 355:
                case 224:
                case 356:
                case 354:
                case 240:
                case 269:
                case 270:
                case 242:
                case 244:
                case 241:
                case 243:
                case 275:
                case 261:
                case 262:
                case 234:
                case 284:
                case 235:
                case 263:
                case 264:
                case 236:
                case 267:
                case 268:
                case 245:
                case 246:
                case 247:
                case 307:
                case 249:
                case 271:
                case 272:
                case 250:
                case 252:
                case 306:
                case 248:
                case 253:
                case 255:
                case 254:
                case 273:
                case 274:
                case 227:
                case 225:
                case 228:
                case 229:
                case 226:
                case 314:
                case 265:
                case 266:
                case 238:
                case 239:
                case 256:
                case 257:
                case 258:
                    $reportDao = new ReportDaoAnnualProcPoint();
                    $reportService = new ReportServiceAnnualProc($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 233:
                case 237:
                    $reportDao = new ReportDaoAnnualProcAggregation();
                    $reportService = new ReportServiceAnnualProc($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 127:
                    // 年報（藻類）
                    $reportDao = new ReportDaoAnnualNo127();
                    $reportService = new ReportServiceAnnualNo127($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 513:
                    // 年報（藻類）
                    $reportDao = new ReportDaoAnnualNo513();
                    $reportService = new ReportServiceAnnual($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                case 610:
                    // 要検討項目検査結果書（ミクロキスチン）（結果一覧）
                    $reportDao = new ReportDaoAnnualNo610();
                    $reportService = new ReportServiceAnnual($retData[0], $param, $reportDao, $request->user()->user_id);
                    $reportService->outputExcelReport();
                    break;
                default:
                    switch ($reportCategory) {
                        // 日報(汎用)
                        case 0:
                            $reportDao = new ReportDaoDaily();
                            $reportService = new ReportServiceDaily($retData[0], $param, $reportDao, $request->user()->user_id);
                            $reportService->outputExcelReport();
                            break;
                        //週報
                        case 1:
                            $reportDao = new ReportDaoWeekly();
                            $reportService = new ReportServiceWeekly($retData[0], $param, $reportDao, $request->user()->user_id);
                            $reportService->outputExcelReport();
                            break;
                        //月報
                        case 2:
                            $reportDao = new ReportDaoMonthly();
                            $reportService = new ReportServiceMonthly($retData[0], $param, $reportDao, $request->user()->user_id);
                            $reportService->outputExcelReport();
                            break;
                        //年報
                        case 3:
                            $reportDao = new ReportDaoAnnual();
                            $reportService = new ReportServiceAnnual($retData[0], $param, $reportDao, $request->user()->user_id);
                            $reportService->outputExcelReport();
                            break;
                        default:
                        //★年報_一日の分類不明
                        //デフォルト処理
                            break;
                    }
                    break;
            }
            $monthly_order++;
        }

        // ZIPファイル作成処理：アクモス
        $reportName = ((array)$retData[0])['report_name'];
        $timestamp = Carbon::now()->format('YmdHis');
        $tempDir = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR);

        // 対象ファイル一覧
        $files = glob($tempDir . DIRECTORY_SEPARATOR . $request->user()->user_id . DIRECTORY_SEPARATOR . '*.xlsx');

        // 数値部分を抽出してソート
        usort($files, function($a, $b) {
            // basenameでファイル名だけ取り出す
            $numA = (int)preg_replace('/^(\d+).*/', '$1', basename($a));
            $numB = (int)preg_replace('/^(\d+).*/', '$1', basename($b));
            return $numA <=> $numB;
        });

        // if (is_null($data['menu_report_no']) && !is_null($data['affiliation_no'])) { // 年報一括をzipにする場合
        if (is_null($data['menu_report_no'])) {
            // まとめ用の新しいSpreadsheetを作成
            $finalSpreadsheet = new Spreadsheet();

            // 初期シートは不要なので削除
            $finalSpreadsheet->removeSheetByIndex(0);

            $counter = 1;

            foreach ($files as $file) {
                // ファイルを読み込み
                $spreadsheet = IOFactory::load($file);
                $sheet = $spreadsheet->getSheet(0);

                if ($counter == 1) {
                    // 先頭シートの場合
                    $sheet->setTitle('報告書シート');
                } else {
                    // タイトルをユニークに設定
                    $sheet->setTitle($counter);
                }

                // 外部シートとして追加
                $finalSpreadsheet->addExternalSheet($sheet);

                $counter++;
            }

            // 最初のシートをアクティブに設定
            $finalSpreadsheet->setActiveSheetIndex(0);

            // 保存
            $writer = new Xlsx($finalSpreadsheet);

            // ファイル名を設定
            $wareki = $this->commonService->warekiConv($data['selected_date'], false, 'YYYYMM');
            $fileName = $data['selected_menu_name'] . '_' . $wareki . '.xlsx';

            $filePath = $tempDir . DIRECTORY_SEPARATOR . $fileName;
            $writer->save($filePath);

            $headers = [
                'Content-Disposition' => "attachment; filename*=UTF-8''" . rawurlencode($fileName),
                'Access-Control-Expose-Headers' => 'Content-Disposition'
            ];

            // ダウンロード後にファイル削除
            dispatch(function () use ($filePath, $files) {
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
                foreach ($files as $file) {
                    if (file_exists($file)) {
                        unlink($file);
                    }
                }
            })->afterResponse();

            return response()->download($filePath, $fileName, $headers);

        } else {
            if (count($files) === 1) {
                // ファイルが1件ならそのままダウンロード
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
            } else {
                // 複数ファイルならZIP化してダウンロード
                $zipFileName = "{$reportName}_{$timestamp}.zip";
                $zipFilePath = $tempDir . DIRECTORY_SEPARATOR . $zipFileName;

                $zip = new \ZipArchive();
                if ($zip->open($zipFilePath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE)) {
                    foreach ($files as $file) {
                        $zip->addFile($file, basename($file));
                    }
                    $zip->close();
                }

                $headers = [
                    'Content-Disposition' => "attachment; filename*=UTF-8''" . rawurlencode($zipFileName),
                    'Access-Control-Expose-Headers' => 'Content-Disposition'
                ];

                // ダウンロード後に元ファイルとZIPを削除
                dispatch(function () use ($files, $zipFilePath) {
                    foreach ($files as $file) {
                        if (file_exists($file)) {
                            unlink($file);
                        }
                    }
                    if (file_exists($zipFilePath)) {
                        unlink($zipFilePath);
                    }
                })->afterResponse();

                return response()->download($zipFilePath, $zipFileName, $headers);
            }
        }
    }
}
