<?php

namespace App\Services;

use App\Dao\ReportDao;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx as XlsxReader;
use PhpOffice\PhpSpreadsheet\Cell\CellAddress;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Shared\Date as PHPDate; //Date属性を使用
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use DateTime;

/**
 * 帳票用サービス
 *
 * @author
 */
abstract class ReportService
{
    //画面からのパラメタ
    protected int $reportNo;
    protected string $saisuiDate;
    protected string $saisuiTime;
    protected string $pointNo;
    protected int $inspectionKbnCode;
    protected string $dspSpace;
    protected string $nendo;

    // ユーザID
    protected string $userId;

    //帳票用 DAO
    protected ReportDao $reportDao;
    /**
     * @var array $reportConfig 報告書構成マスタ
     */
    protected array $reportConfig;

    /**
     * @var array $criteria 基準値補正マスタ
     */
    protected array $criteria;

    /**
     * @var CommonService $commonService  汎用サービス
     */
    protected CommonService $commonService;

    /**
     * @var int $yearStartMonth 年度開始月
     */
    private int $yearStartMonth = 4;

    /**
     * @var int $bcScale 浮動小数点精度桁数
     */
    private int $bcScale = 8;

    /**
     * コンストラクタ
     *
     * @param array|Standard Class Object $reportConfig 報告書構成マスタ情報
     */
    public function __construct($reportConfig, array $reqParam, ReportDao $dao, $user_id)
    {
        $this->commonService = new CommonService();
        $this->reportDao = $dao;
        $this->reportConfig = (array)$reportConfig;
        // 基準値補正取得
        $this->criteria = $this->reportDao->getCriteriaCorrection(intval($reqParam['report_no']), strval($reqParam['saisui_date']));
        bcscale($this->bcScale);

        //画面からのパラメタ設定
        $this->reportNo = intval($reqParam['report_no']);
        $this->saisuiDate = strval($reqParam['saisui_date']);
        $this->saisuiTime = strval($reqParam['saisui_time']);
        $this->pointNo = strVal($reqParam['point_no']);
        $this->inspectionKbnCode = intval($reqParam['kensa_kbn_code']);
        $this->dspSpace =  strval($reqParam['dsp_space']);

        // ユーザIDを設定
        $this->userId = $user_id;
    }
    /**
     * 帳票出力
     *
     * @return string 出力処理成否
     */
    abstract public function outputExcelReport();

    /**
     * パラメータチェック処理
     *
     * @return bool 正常(true)/異常(false)
     */
    protected function checkParameter(): bool
    {
        // パラメータチェック(数値は0以下は未選択として扱う)
        if (
            $this->reportNo <= 0 ||
            $this->saisuiDate === '' ||
            $this->saisuiTime === '' ||
            $this->pointNo <= 0 ||
            $this->inspectionKbnCode <= 0
        ) {
            return false;
        }

        return true;
    }
    /**
     * getUnitChange
     * 単位変換
     * @param int $itemNo 項目番号
     * @param string $dsp_low_limit 下限表示
     * @param &$data 変換する値
     * @return
     * @throws Exception
     */
    public function getUnitChange(int $itemNo, string $dsp_low_limit, &$data)
    {

        $mulNum = "0.000001";
        //検査結果.項目番号が「2400(ジェオスミン)」 または 「2410(2-メチルイソボルネオール)」のみ、実行する。
        if ($itemNo !== 2400 && $itemNo !== 2410) {
            return;
        }

        //数値
        if (is_Numeric($data)) {
            $data = bcmul($data, $mulNum, 6);
            return;
        } else {
            //数値以外かつ下限表示用テキストを含む場合
            if (strPos($data, $dsp_low_limit) !== false) {
                if (strlen($dsp_low_limit) === 1) {
                    $tmpData = substr($data, 1, mb_strlen($data));
                    $data = $dsp_low_limit . bcmul($tmpData, $mulNum, 6);
                    return;
                } else {
                    $tmpData = substr($data, 0, mb_strlen($data) - mb_strlen($dsp_low_limit));
                    $data = bcmul($tmpData, $mulNum, 6) . $dsp_low_limit;
                    return;
                }
            }
        }
        return;
    }

    /**
     * 報告書固定文言マスタ取得
     *
     * @param int $reportNo 報告書番号
     * @param int $pointNo 地点番号
     * @return string||null 固定文言マスタ
     */
    protected function getMReportText(string $reportNo)
    {
        $reportTexts = null;
        $reportTextData = $this->reportDao->getReportText($reportNo);
        if ($reportTextData !== false) {
            if (count($reportTextData) > 0) {
                $reportTexts = ((array)$reportTextData);
                // 2025/07/31 溝口追記 採水地点ごとに取得する必要のある固定文言が追加されたため
                // [地点別採水年月日]を含む場合は、当該報告書の全地点で再検索
                $dayByLocation = array_search('[地点別採水年月日]', array_column($reportTexts, 'text_cell_kbn'));
                if ($dayByLocation !== false) {
                    array_splice($reportTexts, $dayByLocation, 1);
                    $addReportTextData = $this->reportDao->getReportText($reportNo, '[地点別採水年月日]');
                    $reportTexts = array_merge($reportTexts, $addReportTextData);
                }
            }
        }
        return $reportTexts;
    }

    /**
     * 帳票Excel出力処理
     *
     * @param int $reportNo 報告書番号
     * @param array $inspectionResult 検査結果
     * @return void
     */
    protected function outputReport(array $inspectionResult, $arrReportText = null): void
    {
        syslog(LOG_INFO, "templateFile:" . $this->reportConfig['template_file']);
        // 出力帳票名を取得(一旦固定値で作成)
        $excelPath = config('const.OutputTempPath', '/var/www/suishitsu/resources/excel/outputFormat/');
        $filePath = $excelPath . $this->reportConfig['template_file'];
        syslog(LOG_INFO, "excelPath:" . $excelPath);
        // Excelテンプレートを開く
        $reader = new XlsxReader();
        $reader->setReadDataOnly(false);
        $spreadsheet = $reader->load($filePath);
        if ($spreadsheet->sheetNameExists('データシート') === false) {
            return;
        }

        // 検査結果を添付
        $tmpSpread = $spreadsheet->copy();
        $sheet = $tmpSpread->getSheetByName('データシート');

        // 「開始位置」からセル番地を抽出（例：$B$5 → B5）
        $named = $tmpSpread->getNamedRange('開始位置');
        $rawRef = substr($named->getRange(), strpos($named->getRange(), '!') + 1); // "$B$5"
        $cellRef = str_replace('$', '', $rawRef); // → "B5"

        // ★下記のif文は1帳票だけ自動テンプレート更新を対応したための特殊処理★
        if (
            $this->reportConfig['report_type'] == 1 || $this->reportConfig['report_type'] == 17 || $this->reportConfig['report_type'] == 18
            || $this->reportConfig['report_type'] == 40 || $this->reportConfig['report_type'] == 42
            || $this->reportConfig['report_type'] == 47 || $this->reportConfig['report_type'] == 50 || $this->reportConfig['report_type'] == 4
            || $this->reportConfig['report_type'] == 5 || $this->reportConfig['report_type'] == 14 || ($this->reportConfig['report_type'] == 19 && $this->reportNo != 300)
            || $this->reportConfig['report_type'] == 48 || $this->reportConfig['report_type'] == 49 || $this->reportConfig['report_type'] == 52
        ) {
            // 報告書地点マスタ(横)と報告書項目マスタ(縦) 取得
            $colPointList = $this->reportDao->getReportPoint($this->reportNo);
            $rowItemList = $this->reportDao->getReportItem($this->reportNo);
            $stringifiedData = [];

            // 報告書項目分ループ（縦方向）
            foreach ($rowItemList as $rowItemIndex => $rowItem) {
                $stringifiedData[$rowItemIndex] = [];

                // 報告書地点分ループ（横方向）
                foreach ($colPointList as $colPointIndex => $colPoint) {
                    // データインデックスを地点×項目数＋項目インデックスで算出
                    $dataIndex = $colPointIndex * count($rowItemList) + $rowItemIndex;
                    $data = $inspectionResult['inspectionData'][$dataIndex] ?? [];

                    if (is_array($data)) {
                        // データを文字列化し、末尾ゼロも保持
                        $stringifiedRow = array_map(function ($value) {
                            if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                                $decimalPart = explode('.', (string)$value)[1] ?? '';
                                $decimalLength = strlen($decimalPart);
                                return number_format((float)$value, $decimalLength, '.', '');
                            }
                            return (string)$value;
                        }, $data);

                        // 配列を文字列に変換（カンマ区切り）
                        $stringifiedData[$rowItemIndex][] = implode(',', $stringifiedRow);
                    } else {
                        $stringifiedData[$rowItemIndex][] = '';
                    }
                }
            }

            // データを指定したセルから貼り付け
            // $sheet->fromArray($stringifiedData, null, $cellRef);
            $this->fromArrayNoAutoAdjustmentfromArray($sheet, $stringifiedData, null, $cellRef);

            // } else if ($this->reportConfig['report_type'] == 2 || $this->reportConfig['report_type'] == 9) { 
        } else if (
            $this->reportNo == 317 || $this->reportNo == 435 || $this->reportNo == 414 || $this->reportNo == 416 || $this->reportConfig['report_type'] == 38
            || $this->reportConfig['report_type'] == 39 || $this->reportConfig['report_type'] == 43 || $this->reportConfig['report_type'] == 45 || $this->reportConfig['report_type'] == 3
        ) {
            // 報告書特殊項目マスタ(横)と報告書項目マスタ(縦) 取得
            $colTokusyuItemList = $this->commonService->getReportTokusyuItem($this->reportNo);
            $rowItemList = $this->reportDao->getReportItem($this->reportNo);
            $stringifiedData = [];

            // 報告書項目分ループ（縦方向）
            foreach ($rowItemList as $rowItemIndex => $rowItem) {
                $stringifiedData[$rowItemIndex] = [];

                // 報告書特殊項目分ループ（横方向）
                foreach ($colTokusyuItemList as $colTokusyuItemIndex => $colTokusyuItem) {
                    // データインデックスを特殊項目×項目数＋項目インデックスで算出
                    $dataIndex = $colTokusyuItemIndex * count($rowItemList) + $rowItemIndex;
                    $data = $inspectionResult['inspectionData'][$dataIndex] ?? [];

                    if (is_array($data)) {
                        // データを文字列化し、末尾ゼロも保持
                        $stringifiedRow = array_map(function ($value) {
                            if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                                $decimalPart = explode('.', (string)$value)[1] ?? '';
                                $decimalLength = strlen($decimalPart);
                                return number_format((float)$value, $decimalLength, '.', '');
                            }
                            return (string)$value;
                        }, $data);

                        // 配列を文字列に変換（カンマ区切り）
                        $stringifiedData[$rowItemIndex][] = implode(',', $stringifiedRow);
                    } else {
                        $stringifiedData[$rowItemIndex][] = '';
                    }
                }
            }

            // データを指定したセルから貼り付け（縦項目が行、横項目が列）
            $this->fromArrayNoAutoAdjustmentfromArray($sheet, $stringifiedData, null, $cellRef);
        } else if ($this->reportConfig['report_type'] == 44) {
            // 報告書項目マスタ(縦) 取得
            $rowItemList = $this->reportDao->getReportItem($this->reportNo);
            $stringifiedData = [];

            $keyList = array_keys($inspectionResult['inspectionData'][0]);
            $columnList = array_values(array_filter($keyList, function ($key) {
                return str_contains($key, 'result_data_month');
            }));

            // 行項目分ループ（縦方向）
            $hoseiCounter = 0;
            foreach ($rowItemList as $rowItemIndex => $rowItem) {
                $stringifiedData[$rowItemIndex] = [];

                // 列項目分ループ（横方向）
                foreach ($columnList as $dataColumn) {
                    if ($rowItemIndex <> 0 && $rowItem->item_no == 1) {
                        $data = null;
                        $hoseiCounter = 1;
                    } else {
                        $data = $inspectionResult['inspectionData'][$rowItemIndex - $hoseiCounter][$dataColumn] ?? null;
                    }

                    if ($data) {
                        // データを文字列化し、末尾ゼロも保持
                        if (is_numeric($data) && strpos((string)$data, '.') !== false) {
                            $decimalPart   = explode('.', (string)$data)[1] ?? '';
                            $decimalLength = strlen($decimalPart);
                            $stringifiedValue = number_format((float)$data, $decimalLength, '.', '');
                        } else {
                            $stringifiedValue = (string)$data;
                        }

                        $stringifiedData[$rowItemIndex][] = $stringifiedValue;
                    } else {
                        $stringifiedData[$rowItemIndex][] = '';
                    }
                }
            }

            // データを指定したセルから貼り付け（縦項目が行、横項目が列）
            $this->fromArrayNoAutoAdjustmentfromArray($sheet, $stringifiedData, null, $cellRef);

        } else if ($this->reportConfig['report_type'] == 56) {
            // 報告書特殊項目マスタ(横)と報告書項目マスタ(縦) 取得
            $colTokusyuItemList = $this->commonService->getReportTokusyuItem($this->reportNo);
            $rowItemList = $this->reportDao->getReportItem($this->reportNo);
            $stringifiedData = [];

            // 報告書項目分ループ（縦方向）
            foreach ($rowItemList as $rowItemIndex => $rowItem) {
                $stringifiedData[$rowItemIndex] = [];

                // 報告書特殊項目分ループ（横方向）
                foreach ($colTokusyuItemList as $colTokusyuItemIndex => $colTokusyuItem) {
                    // データインデックスを項目インデックス×特殊項目数＋特殊項目インデックスで算出
                    $dataIndex = $rowItemIndex * count($colTokusyuItemList) + $colTokusyuItemIndex;
                    $data = $inspectionResult['inspectionData'][$dataIndex] ?? [];

                    if (is_array($data)) {
                        // データを文字列化し、末尾ゼロも保持
                        $stringifiedRow = array_map(function ($value) {
                            if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                                $decimalPart = explode('.', (string)$value)[1] ?? '';
                                $decimalLength = strlen($decimalPart);
                                return number_format((float)$value, $decimalLength, '.', '');
                            }
                            return (string)$value;
                        }, $data);

                        // 配列を文字列に変換（カンマ区切り）
                        $stringifiedData[$rowItemIndex][] = implode(',', $stringifiedRow);
                    } else {
                        $stringifiedData[$rowItemIndex][] = '';
                    }
                }
            }

            // データを指定したセルから貼り付け（縦項目が行、横項目が列）
            $this->fromArrayNoAutoAdjustmentfromArray($sheet, $stringifiedData, null, $cellRef);

        } else if ($this->reportConfig['report_type'] == 6 || $this->reportConfig['report_type'] == 16) {
            // 報告書特殊項目マスタ(縦)と報告書項目マスタ(横) 取得
            $rowTokusyuItemList = $this->commonService->getReportTokusyuItem($this->reportNo);
            $colItemList = $this->reportDao->getReportItem($this->reportNo);
            $stringifiedData = [];

            // 報告書特殊項目分ループ（縦方向）
            foreach ($rowTokusyuItemList as $rowItemIndex => $rowItem) {
                $stringifiedData[$rowItemIndex] = [];

                foreach ($colItemList as $colItemIndex => $colItem) {
                    // データインデックスを行×列数＋列インデックスで算出
                    $dataIndex = $rowItemIndex * count($colItemList) + $colItemIndex;
                    $data = $inspectionResult['inspectionData'][$dataIndex] ?? [];

                    if (is_array($data)) {
                        $stringifiedRow = array_map(function ($value) {
                            if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                                $decimalPart = explode('.', (string)$value)[1] ?? '';
                                $decimalLength = strlen($decimalPart);
                                return number_format((float)$value, $decimalLength, '.', '');
                            }
                            return (string)$value;
                        }, $data);

                        $stringifiedData[$rowItemIndex][$colItemIndex] = implode(',', $stringifiedRow);
                    } else {
                        $stringifiedData[$rowItemIndex][$colItemIndex] = '';
                    }
                }
            }

            // データを指定したセルから貼り付け（縦項目が行、横項目が列）
            $this->fromArrayNoAutoAdjustmentfromArray($sheet, $stringifiedData, null, $cellRef);
        } else if ($this->reportConfig['report_type'] == 15 || $this->reportConfig['report_type'] == 55) {
            // 報告書特殊項目マスタ(縦)と報告書項目マスタ(横) と地点情報を取得
            $rowTokusyuItemList = $this->commonService->getReportTokusyuItem($this->reportNo);
            $colItemList = $this->reportDao->getReportItem($this->reportNo);
            $pointList = $this->reportDao->getReportPoint($this->reportNo);
            $stringifiedData = [];

            // 報告書特殊項目分ループ（縦方向）
            foreach ($rowTokusyuItemList as $rowItemIndex => $rowItem) {
                $stringifiedData[$rowItemIndex] = [];

                // データインデックスを行×(地点数×項目数)で算出（採水年月日用）
                $saisuiDataIndex = $rowItemIndex * (count($pointList) * count($colItemList));
                $data = $inspectionResult['inspectionData'][$saisuiDataIndex] ?? [];

                if ($rowItem->item_type == 1) {
                    if (is_array($data)) {
                        $stringifiedRow = array_map(function ($value) {
                            if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                                $decimalPart = explode('.', (string)$value)[1] ?? '';
                                $decimalLength = strlen($decimalPart);
                                return number_format((float)$value, $decimalLength, '.', '');
                            }
                            return (string)$value;
                        }, $data);

                        $stringifiedData[$rowItemIndex][0] = implode(',', $stringifiedRow);
                    } else {
                        $stringifiedData[$rowItemIndex][0] = '';
                    }
                }

                $colItemIndex = 0;

                foreach ($pointList as $pointIndex => $pointData) {
                    foreach ($colItemList as $colIndex => $colItem) {
                        // 1日～31日のデータを格納
                        if ($colIndex != 0) {
                            // インデックスで算出
                            $dataIndex = $rowItemIndex * (count($pointList) * count($colItemList)) + $pointIndex * count($colItemList) + ($colIndex);
                            $data = $inspectionResult['inspectionData'][$dataIndex] ?? [];

                            if (is_array($data)) {
                                $stringifiedRow = array_map(function ($value) {
                                    if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                                        $decimalPart = explode('.', (string)$value)[1] ?? '';
                                        $decimalLength = strlen($decimalPart);
                                        return number_format((float)$value, $decimalLength, '.', '');
                                    }
                                    return (string)$value;
                                }, $data);

                                $stringifiedData[$rowItemIndex][$colItemIndex] = implode(',', $stringifiedRow);
                            } else {
                                $stringifiedData[$rowItemIndex][$colItemIndex] = '';
                            }
                        } else {
                            // 最大、最小などを格納
                            if ($rowItem->item_type == 2) {
                                // インデックスで算出
                                $dataIndex = $rowItemIndex * (count($pointList) * count($colItemList)) + $pointIndex * count($colItemList) + ($colIndex);
                                $data = $inspectionResult['inspectionData'][$dataIndex] ?? [];

                                if (is_array($data)) {
                                    $stringifiedRow = array_map(function ($value) {
                                        if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                                            $decimalPart = explode('.', (string)$value)[1] ?? '';
                                            $decimalLength = strlen($decimalPart);
                                            return number_format((float)$value, $decimalLength, '.', '');
                                        }
                                        return (string)$value;
                                    }, $data);

                                    $stringifiedData[$rowItemIndex][0] = implode(',', $stringifiedRow);
                                } else {
                                    $stringifiedData[$rowItemIndex][0] = '';
                                }
                            }
                        }

                        $colItemIndex++;
                    }
                }
            }

            // データを指定したセルから貼り付け（縦項目が行、横項目が列）
            $this->fromArrayNoAutoAdjustmentfromArray($sheet, $stringifiedData, null, $cellRef);
        } else if ($this->reportConfig['report_type'] == 35) {
            // データを文字列化し、末尾ゼロも保持
            $stringifiedData = array_map(function ($row) {
                return array_map(function ($value) {
                    if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                        $decimalPart = explode('.', (string)$value)[1] ?? '';
                        $decimalLength = strlen($decimalPart);
                        return number_format((float)$value, $decimalLength, '.', '');
                    }
                    return (string)$value;
                }, $row);
            }, $inspectionResult['inspectionData']);

            $stringifiedData = [];
            // 必要データ取得
            $colItemList = $this->reportDao->getReportItem($this->reportNo);
            $pointList = $this->reportDao->getReportPoint($this->reportNo);
            $insIndex = 0;
            // 一週間分
            for ($day = 1; $day < 8; $day++) {
                // 地点ごとループ
                foreach ($pointList as $pKey => $pointElem) {
                    // 項目ごとループ
                    foreach ($colItemList as $iKey => $itemElem) {
                        $stringifiedData[$iKey][] = $inspectionResult['inspectionData'][$insIndex][0];
                        $insIndex++;
                    }
                }
            }

            // 平均分
            // 地点ごとループ
            foreach ($pointList as $pKey => $pointElem) {
                // 項目ごとループ
                foreach ($colItemList as $iKey => $itemElem) {
                    $stringifiedData[$iKey][] = $inspectionResult['inspectionData'][$insIndex][0];
                    $insIndex++;
                }
            }

            // データを指定したセルから貼り付け
            $this->fromArrayNoAutoAdjustmentfromArray($sheet, $stringifiedData, null, $cellRef);
        } else if ($this->reportConfig['report_type'] == 36) {
            // データを文字列化し、末尾ゼロも保持
            $stringifiedData = array_map(function ($row) {
                return array_map(function ($value) {
                    if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                        $decimalPart = explode('.', (string)$value)[1] ?? '';
                        $decimalLength = strlen($decimalPart);
                        return number_format((float)$value, $decimalLength, '.', '');
                    }
                    return (string)$value;
                }, $row);
            }, $inspectionResult['inspectionData']);

            $stringifiedData = [];
            // 必要データ取得
            $colItemList = $this->reportDao->getReportItem($this->reportNo);
            $insIndex = 0;
            // 一週間分
            for ($day = 1; $day < 8; $day++) {
                // 項目ごとループ
                foreach ($colItemList as $iKey => $itemElem) {
                    $stringifiedData[$iKey][] = $inspectionResult['inspectionData'][$insIndex][0];
                    $insIndex++;
                }
            }

            // データを指定したセルから貼り付け
            $this->fromArrayNoAutoAdjustmentfromArray($sheet, $stringifiedData, null, $cellRef);
        } else if ($this->reportConfig['report_type'] == 37) {
            $itemList = $this->reportDao->getReportItem($this->reportNo);
            $pointList = $this->reportDao->getReportPoint($this->reportNo);
            $index = 0;
            $calIndex = 0;
            $stringifiedData = [];

            // 報告書地点分ループ
            foreach ($pointList as $colPointIndex => $colPoint) {
                // 報告書項目分ループ
                for ($i = 1; $i <= 12; $i++) {
                    foreach ($itemList as $rowItemIndex => $rowItem) {
                        $data = $inspectionResult['inspectionData'][$index] ??  [];
                        $index++;
                        // \Log::info($data);

                        if ($data !== []) {
                            $stringifiedRow = array_map(function ($value) {
                                if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                                    $decimalPart = explode('.', (string)$value)[1] ?? '';
                                    $decimalLength = strlen($decimalPart);
                                    return number_format((float)$value, $decimalLength, '.', '');
                                }
                                return (string)$value;
                            }, $data);

                            $stringifiedData[$rowItemIndex][$colPointIndex * 15 + $i] = implode(',', $stringifiedRow);
                        } else {
                            $stringifiedData[$rowItemIndex][$colPointIndex * 15 + $i] = '';
                        }
                    }
                }

                // 最大・最小・平均
                // 地点数 * 各月(12ヶ月分) * 項目数 の隣に、最大が地点数 * 項目数、次に最小が地点数 * 項目数、その次に平均が地点数 * 項目数で配置されている
                for ($i = 0; $i <= 2; $i++) {
                    foreach ($itemList as $rowItemIndex => $rowItem) {
                        $calcindex = count($pointList) * count($itemList) * (12 + $i) + $rowItemIndex + ($colPointIndex * count($itemList));
                        $data = $inspectionResult['inspectionData'][$calcindex] ??  [];

                        if ($data !== []) {
                            $stringifiedRow = array_map(function ($value) {
                                if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                                    $decimalPart = explode('.', (string)$value)[1] ?? '';
                                    $decimalLength = strlen($decimalPart);
                                    return number_format((float)$value, $decimalLength, '.', '');
                                }
                                return (string)$value;
                            }, $data);

                            $stringifiedData[$rowItemIndex][$colPointIndex * 15 + $i + 13] = implode(',', $stringifiedRow);
                        } else {
                            $stringifiedData[$rowItemIndex][$colPointIndex * 15 + $i + 13] = '';
                        }
                    }
                }
            }

            // // データを指定したセルから貼り付け
            $this->fromArrayNoAutoAdjustmentfromArray($sheet, $stringifiedData, null, $cellRef);
        } else if (in_array($this->reportConfig['report_type'], [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34])) { // 日報系
            $itemList = $this->reportDao->getReportItem($this->reportNo);
            $pointList = $this->reportDao->getReportPoint($this->reportNo);
            $index = 0;
            $stringifiedData = [];

            // 報告書地点分ループ
            foreach ($pointList as $colPointIndex => $colPoint) {
                // 報告書項目分ループ
                foreach ($itemList as $rowItemIndex => $rowItem) {
                    $data = $inspectionResult['inspectionData'][$index] ??  [];
                    $index++;

                    if (is_array($data)) {
                        $stringifiedRow = array_map(function ($value) {
                            if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                                $decimalPart = explode('.', (string)$value)[1] ?? '';
                                $decimalLength = strlen($decimalPart);
                                return number_format((float)$value, $decimalLength, '.', '');
                            }
                            return (string)$value;
                        }, $data);

                        $stringifiedData[$rowItemIndex][$colPointIndex] = implode(',', $stringifiedRow);
                    } else {
                        $stringifiedData[$rowItemIndex][$colPointIndex] = '';
                    }
                }
            }

            // // データを指定したセルから貼り付け
            $this->fromArrayNoAutoAdjustmentfromArray($sheet, $stringifiedData, null, $cellRef);
            // $sheet->fromArray($stringifiedData, null, $cellRef);

        } else if ($this->reportConfig['report_type'] == 41 || $this->reportConfig['report_type'] == 21 || $this->reportConfig['report_type'] == 12) {
            // データを文字列化し、末尾ゼロも保持
            $stringifiedData = array_map(function ($row) {
                return array_map(function ($value) {
                    if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                        $decimalPart = explode('.', (string)$value)[1] ?? '';
                        $decimalLength = strlen($decimalPart);
                        return number_format((float)$value, $decimalLength, '.', '');
                    }
                    return (string)$value;
                }, $row);
            }, $inspectionResult['inspectionData']);

            // データを指定したセルから貼り付け
            $this->fromArrayNoAutoAdjustmentfromArray($sheet, $stringifiedData, null, $cellRef);

        } else {
            // 報告書項目マスタ(縦) 取得
            $rowItemList = $this->reportDao->getReportItem($this->reportNo);

            // 報告書項目分ループ（縦方向）
            foreach ($rowItemList as $rowItemIndex => $rowItem) {
                $stringifiedData[$rowItemIndex] = [];

                // データインデックスを地点×項目数＋項目インデックスで算出
                $dataIndex = $rowItemIndex;
                $data = $inspectionResult['inspectionData'][$dataIndex] ?? [];

                if (is_array($data)) {
                    // データを文字列化し、末尾ゼロも保持
                    $stringifiedRow = array_map(function ($value) {
                        if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                            $decimalPart = explode('.', (string)$value)[1] ?? '';
                            $decimalLength = strlen($decimalPart);
                            return number_format((float)$value, $decimalLength, '.', '');
                        }
                        return (string)$value;
                    }, $data);

                    // 配列を文字列に変換（カンマ区切り）
                    $stringifiedData[$rowItemIndex][] = implode(',', $stringifiedRow);
                } else {
                    $stringifiedData[$rowItemIndex][] = '';
                }
            }

            // データを指定したセルから貼り付け
            $this->fromArrayNoAutoAdjustmentfromArray($sheet, $stringifiedData, null, $cellRef);
        }

        // セル番地を分解（列と行）
        list($startCol, $startRow) = Coordinate::coordinateFromString($cellRef);
        $colIndex = Coordinate::columnIndexFromString($startCol);
        $rowIndex = (int)$startRow;

        // // 書式を各セルに適用（小数点桁数に応じて）
        // foreach ($stringifiedData as $rowData) {
        //     $col = $colIndex;
        //     foreach ($rowData as $value) {
        //         if (is_numeric($value) && strpos($value, '.') !== false) {
        //             $decimalLength = strlen(explode('.', $value)[1] ?? '');
        //             $formatCode = '0.' . str_repeat('0', $decimalLength);
        //             $coordinate = Coordinate::stringFromColumnIndex($col) . $rowIndex;
        //             $sheet->getStyle($coordinate)->getNumberFormat()->setFormatCode($formatCode);
        //         }
        //         $col++;
        //     }
        //     $rowIndex++;
        // }

        // 報告書シートを取得
        $reportSheet = $tmpSpread->getSheetByName('報告書シート');
        $maxColumn = $reportSheet->getHighestColumn();
        $maxRow = $reportSheet->getHighestRow();

        // 取得・出力開始位置 無ければA1から
        $startCell = 'A1';
        foreach (config('const.reportStartCell') as $checkReportNo => $cell) {
            if ($checkReportNo === $this->reportNo) {
                $startCell = $cell;
                break;
            }
        };

        // データ取得
        $reportData = $reportSheet->rangeToArray($startCell . ":$maxColumn$maxRow", null, true, false);

        // 小数点付き数値を文字列に変換
        foreach ($reportData as &$row) {
            foreach ($row as &$value) {
                if (is_numeric($value) && strpos((string)$value, '.') !== false) {
                    // 小数を文字列化
                    $value = (string)$value;
                }
            }
        }

        // 参照解除
        unset($row, $value);

        // 一括貼り付け
        $this->fromArrayNoAutoAdjustmentfromArray($reportSheet, $reportData, null, $startCell, true);

        //★固定文言出力処理
        //Cell::setValueBinder(new AdvancedValueBinder());
        if (!is_null($arrReportText)) {
            foreach ($arrReportText as $key => $value) {
                syslog(LOG_INFO, "固定文言 key:{$key}");
                $named = $tmpSpread->getNamedRange($key);
                if ($named != null) {
                    syslog(LOG_INFO, "固定文言 value:{$value}");
                    syslog(LOG_INFO, "固定文言 range:{$named->getRange()}");
                    if ($this->checkOutputReportDate($value)) {
                        //$value = Date::createFromFormat('Y/m/d', $value);
                        $value = PHPDate::PHPToExcel($value);
                        syslog(LOG_INFO, "固定文言 日付 :{$value}");
                    }
                    $reportSheet->setCellValue($named->getRange(), $value);

                    syslog(LOG_INFO, "設定後 getValue :{$reportSheet->getCell($named->getRange())->getValue()}");
                    syslog(LOG_INFO, "設定後 getFormattedValue :{$reportSheet->getCell($named->getRange())->getFormattedValue()}");
                    syslog(LOG_INFO, "設定後 getCalculatedValue :{$reportSheet->getCell($named->getRange())->getCalculatedValue()}");
                }
            }
        }
        // 不要となるデータシートを削除
        //$sheetIndex = $tmpSpread->getIndex($sheet);
        //$tmpSpread->removeSheetByIndex($sheetIndex);
        // ファイル保存：アクモス
        $writer = new Xlsx($tmpSpread);

        // システムのテンポラリディレクトリを取得
        $tempDir = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $this->userId;
        // 保存ファイル名
        $fileName = $this->getFileName();
        
        if(!file_exists($tempDir)){
            if(!mkdir($tempDir,0777,true)){
                throw new \Exception('帳票作成失敗');
            }
        }

        // フルパスを生成
        $filePath = $tempDir . DIRECTORY_SEPARATOR . $fileName;

        //ファイル保存
        $writer->save($filePath);
    }

    /**
     * JIS丸め処理
     *
     * @param string $inData 丸め対象値
     * @param int $validDigit 有効桁数
     * @param int $minDigit 最小入力桁数
     * @param string &$sOutData 丸め処理結果
     * @return void
     */
    protected function jisRound(string $sInData, int $validDigit, int $minDigit, string &$sOutData): void
    {
        $sOutData = '';

        // 前提チェック
        if (!is_numeric($sInData) || $validDigit < 0 || $minDigit > 0) {
            return;
        }

        // 符号を分離
        $sign = 1;
        if (substr($sInData, 0, 1) === '-') {
            $sign    = -1;
            $sInData = substr($sInData, 1);
        }

        // // 整数部・小数部の正規化
        // $pos = strpos($sInData, '.');
        // if ($pos !== false) {
        //     if ($pos > 0) {
        //         $intPart  = ltrim(substr($sInData, 0, $pos), '0');
        //         $intPart  = $intPart === '' ? '0' : $intPart;
        //         $fracPart = substr($sInData, $pos + 1);
        //         $text     = $intPart . '.' . $fracPart;
        //     } else {
        //         // .123 → 0.123
        //         $fracPart = substr($sInData, 1);
        //         $text     = '0.' . $fracPart;
        //     }
        // } else {
        //     // 小数点なし
        //     $text = ltrim($sInData, '0');
        //     $text = $text === '' ? '0' : $text;
        // }

        // SQLでもjis丸めされるので、調整
        $sInData = number_format($sInData, 8, '.', '');

        // 小数点位置を取得
        $text = $sInData;
        $dotIndex  = strpos($text, '.');
        $integerLen = $dotIndex !== false ? $dotIndex : strlen($text);

        // 有効桁数が0 → 小数以下を全部残したまま符号だけ反映
        if ($validDigit === 0) {
            if ($dotIndex !== false) {
                $scale    = strlen($text) - $dotIndex - 1;
                $value    = bcmul($text, (string)$sign, $scale);
                $sOutData = number_format($value, $scale, '.', '');
            } else {
                $value    = bcmul($text, (string)$sign, 0);
                $sOutData = $value;
            }
            return;
        }

        // 桁数A (最初の非0文字までの桁 + 有効桁数)
        if ($dotIndex > 0 && preg_match('/[1-9][0-9]+/', $sInData, $matchStr)) {
            $left  = substr($text, 0, $dotIndex);
            $pos = $left === '0' ? strpos($sInData, $matchStr[0]) - 1 : strpos($sInData, $matchStr[0]);
            $digitA = $pos + $validDigit;
        } else {
            $digitA = $validDigit;
        }

        // 桁数B (整数部長さ－最小入力桁)
        $digitB = $integerLen - $minDigit;

        // 出力桁数 & モード (1:切捨て, 2:切上)
        if ($digitA <= $digitB) {
            $outputDigits = $digitA;
            $mode         = 1;
        } else {
            $outputDigits = $digitB;
            $mode         = 2;
        }

        // 小数点を外した対象文字列を作成
        if ($dotIndex !== false) {
            $left  = substr($text, 0, $dotIndex);
            $right = substr($text, $dotIndex + 1);
            $roundStr = $left . $right;
        } else {
            $roundStr = $text;
        }

        // 切上補正用文字列 ("000...1")
        $incStr = str_repeat('0', max(0, $outputDigits - 1)) . '1';
        if (strlen($roundStr) < $outputDigits) {
            $pad       = str_repeat('0', $outputDigits - strlen($roundStr));
            $incStr   .= $pad;
            $roundStr .= $pad;
        }

        // 基準桁の次の文字を取得して四捨五入判定
        $nextChar = $outputDigits < strlen($roundStr) ? $roundStr[$outputDigits] : '';
        if (in_array($nextChar, ['0', '1', '2', '3', '4'], true)) {
            $rndMode = 1;
        } elseif (in_array($nextChar, ['6', '7', '8', '9'], true)) {
            $rndMode = 2;
        } elseif ($nextChar === '5') {
            $rest = substr($roundStr, $outputDigits + 1);
            if ($rest === '' || bccomp($rest, '0', 0) === 0) {
                // 偶数丸め判定
                $prev = $roundStr[$outputDigits - 1];
                //奇数は切り上げ
                $rndMode = (intval(bcmod($prev, 2)) === 1 ?  2 : 1);
            } else {
                $rndMode = 2;
            }
        } else {
            $rndMode = 1;
        }

        // 切り捨て or 切り上げの実行
        switch ($rndMode) {
            case 1:  // 切り捨て
                $roundStr = substr($roundStr, 0, $outputDigits);
                $diff     = $integerLen - strlen($roundStr);
                if ($diff >= 0) {
                    $head = substr($roundStr, 0, $integerLen) . str_repeat('0', $diff);
                    $tail = '';
                } else {
                    $head = substr($roundStr, 0, $integerLen) . '.';
                    $tail = substr($roundStr, $integerLen);
                }
                $roundStr = $head . $tail;
                break;

            case 2:  // 切り上げ(四捨五入)
                $roundStr = substr($roundStr, 0, $outputDigits);
                $diff     = $integerLen - strlen($roundStr);

                if ($diff >= 0) {
                    // 整数部のみ切り上げ
                    $tAdd   = substr(bcadd($incStr, '0', 0), 0, $integerLen)
                        . str_repeat('0', $diff);
                    $hVal   = substr(bcadd($roundStr, '0', 0), 0, $integerLen)
                        . str_repeat('0', $diff);
                    $roundStr = bcadd($hVal, $tAdd, 0);
                } else {
                    // 小数部への繰り上げ含む
                    $tAdd   = substr($incStr, 0, $integerLen)
                        . '.'
                        . substr($incStr, $integerLen);
                    $hVal   = substr($roundStr, 0, $integerLen)
                        . '.'
                        . substr($roundStr, $integerLen);
                    $scale  = strlen($roundStr) - $integerLen;
                    $roundStr = bcadd($hVal, $tAdd, $scale);
                }
                // 必要なら小数点以下を0埋め
                if (strpos($roundStr, '.') === false && $outputDigits > $integerLen) {
                    $roundStr .= '.' . str_repeat('0', $outputDigits - $integerLen);
                }
                break;
        }

        // 最終フォーマット
        $decPlaces = $outputDigits - $integerLen;
        if ($decPlaces > 0) {
            $roundStr = number_format($roundStr, $decPlaces, '.', '');
        } else {
            $roundStr = number_format($roundStr, 0, '.', '');
        }

        // // 切捨てモードなら末尾の0/. をトリム
        // if ($mode === 1 && strpos($roundStr, '.') !== false) {
        //     $roundStr = rtrim(rtrim($roundStr, '0'), '.');
        // }

        // 符号再付与
        $sOutData = ((int)$sign < 0 && $roundStr != 0)
            ? '-' . $roundStr
            : $roundStr;
    }

    /**
     * 定量データ加工処理
     *
     * @param int $itemNo 項目番号
     * @param int $saisuiKbnNo 採水区分番号
     * @param string $dspUpLimit 上限表示
     * @param string $dspLowLimit 下限表示
     * @param string &$data 定量データ
     * @return void
     */
    protected function configureFixedQuantityData(
        int $itemNo,
        int $saisuiKbnNo,
        string $dspUpLimit,
        string $dspLowLimit,
        string &$data,
        int $pointNo,
        string $saisuiDate = null,
        string $saisuiTime = null,
        string $inspectionKbnCode = null,
        int $nendo = null
    ): void {
        // 検査基準取得
        $refValue = $this->getInoutReferenceValue($itemNo, $pointNo, $nendo);

        if (count($refValue) === 0) {
            return;
        }
        $lowerLimit = $refValue['report_low_limit'];
        $validDigits = $refValue['valid_digits'];
        $inputMinDigits = $refValue['input_min_digits'];
        $outputMinDigits = $refValue['output_min_digits'];

        // 補正条件に即して使用する補正値を決定する。
        $isCriteria = false;
        foreach ($this->criteria as $criteriaRow) {
            $criteriaData = (array)$criteriaRow;
            // 基準値補正を利用するか各判定を実施、条件を満たす場合は検査基準の値を上書きする。
            if (
                (
                    $criteriaData['item_no'] == $itemNo &&
                    $criteriaData['inspection_kbn_code'] == $this->inspectionKbnCode &&
                    $criteriaData['saisui_kbn_no'] == $saisuiKbnNo &&
                    bccomp($data, '0.08') == 1
                ) || (
                    $criteriaData['item_no'] == $itemNo &&
                    $criteriaData['inspection_kbn_code'] == $this->inspectionKbnCode &&
                    bccomp($data, '0.08') == 1
                ) || (
                    $criteriaData['item_no'] == $itemNo &&
                    $criteriaData['report_no'] == $this->reportNo &&
                    $criteriaData['point_no'] == $pointNo
                )
            ) {
                // 4項目を上書きする。
                $lowerLimit = $criteriaData['report_low_limit'];
                $validDigits = $criteriaData['valid_digits'];
                $inputMinDigits = $criteriaData['input_min_digits'];
                $outputMinDigits = $criteriaData['output_min_digits'];
                $isCriteria = true;
            } elseif (
                (
                    $criteriaData['item_no'] == $itemNo &&
                    $criteriaData['point_no'] == $pointNo &&
                    is_null($criteriaData['report_no'])
                ) || (
                    $criteriaData['item_no'] == $itemNo &&
                    is_null($criteriaData['point_no']) &&
                    is_null($criteriaData['inspection_kbn_code']) &&
                    bccomp($data, '0.1') == -1
                )
            ) {
                // 3項目を上書きする。
                $validDigits = $criteriaData['valid_digits'];
                $inputMinDigits = $criteriaData['input_min_digits'];
                $outputMinDigits = $criteriaData['output_min_digits'];
                $isCriteria = true;
            }

            // 補正値を取得できたら、ループを終了する。
            if ($isCriteria) {
                break;
            }
        }

        // 「2250(総トリハロメタン)」 または 「6010(トリハロメタン生成能)」の場合、各定量データの取得を行う。
        if ($itemNo === 2250 || $itemNo === 6010) {
            $date = $saisuiDate == null ? $this->saisuiDate : $saisuiDate;
            $time = $saisuiTime == null ? $this->saisuiTime : $saisuiTime;
            $kbn = $inspectionKbnCode == null ? $this->inspectionKbnCode : $inspectionKbnCode;
            // 対象の4項目の値を取得する。
            $itemCriteria = $this->reportDao->getInspectionResultCriteria(
                $pointNo,
                $date,
                $time,
                $kbn,
                $itemNo
            );

            if ($itemCriteria) {
                $maxValue = '';
                $decimalFlg = false;
                foreach ($itemCriteria as $rowItem) {
                    $tmpRow = (array)$rowItem;
                    $ajustData = $tmpRow['inspection_data'];
                    $this->configureFixedQuantityData($tmpRow['item_no'], $saisuiKbnNo, $dspUpLimit, $dspLowLimit, $ajustData, $pointNo);

                    if ($this->dspSpace == $ajustData) {
                        // 空白表示はNULLと同一に扱う。
                        $ajustData = null;
                    } else if (!is_numeric($ajustData)) {
                        // 下限値を割った場合は0とする。
                        $ajustData = 0.000;
                    }

                    if (!$decimalFlg) {
                        if (strpos($tmpRow['inspection_data'], ".") !== false) {
                            $decimalFlg = true;
                        }
                    }

                    if ($maxValue === '' || bccomp($maxValue, $ajustData) === -1) {
                        $maxValue = $ajustData;
                    }
                }

                // 取得データに小数点が存在する場合、最小桁数を定量データ内の桁数とする。
                if ($decimalFlg) {
                    $tmpDigits = 0;
                    $tmpData = substr($maxValue, strpos($maxValue, ".") + 1);
                    $tmpDigits = mb_strlen($tmpData);
                    $tmpDigits = is_numeric($tmpDigits) ? $tmpDigits * -1 : 0;
                    // 入力/出力最小桁を上記で算出した値とする。
                    $inputMinDigits = $tmpDigits;
                    $outputMinDigits = $tmpDigits;
                }
            }
        }

        // 定量データが0の場合、補正を行う。
        if ($data === '0.00000000') {
            $data = '0.000000001';
        }

        // 帳票下限値がNULLの場合、下限値を補正する。
        if (is_null($lowerLimit) || $lowerLimit === '') {
            $lowerLimit = '-100';
        }

        // 定量データのJIS丸めを行う。
        $tempData = '';
        // 定量データと帳票下限値を比較する。
        if (bccomp($data, $lowerLimit) === -1 && (is_null($outputMinDigits) || is_null($validDigits))) {
            $data = '<' . $lowerLimit;
        } else if (is_null($outputMinDigits) || is_null($validDigits)) {
            $data = $data;
        } else if (bccomp($data, $lowerLimit) === -1) {
            // 帳票下限値未満であれば、帳票下限値を出力データとし、先頭に<を付与する
            $this->jisRound($lowerLimit, $validDigits, $outputMinDigits, $tempData);
            $data = '<' . $tempData;
        } else {
            $this->jisRound($data, $validDigits, $outputMinDigits, $tempData);
            $data = $tempData;
        }

        // 補正条件に沿って上限文字と下限文字を設定する。
        if (strpos($data, '<') !== false) {
            // 報告書構成マスタの下限表示に従って、出力内容を変更
            if (mb_strlen($dspLowLimit) >= 2) {
                $data = str_replace('<', '', $data);
                $data = $data . $dspLowLimit;
            } else {
                $data = str_replace('<', $dspLowLimit, $data);
            }
        } elseif (strpos($data, '>') !== false) {
            // 報告書構成マスタの上限表示に従って、出力内容を変更
            if (mb_strlen($dspUpLimit) >= 2) {
                $data = str_replace('>', '', $data);
                $data = $data . $dspUpLimit;
            } else {
                $data = str_replace('>', $dspUpLimit, $data);
            }
        }

        return;
    }

    /**
     * 固定文言取得処理
     *
     * @param int $reportType 報告書タイプ
     * @param string $textCellKbn 固定文言区分
     * @param array $inspectionResult 検査結果
     * @return string 取得固定文言
     */
    public function getReportText(
        int $reportType,
        string $textCellKbn,
        string $textCellName,
        array $inspectionResult
    ): string {
        $tmpStr = '';
        $retStr = '';
        syslog(LOG_INFO, "getReportText START");
        syslog(LOG_INFO, "textCellKbn : {$textCellKbn}");

        // 固定文言区分により処理を分岐する。
        switch ($textCellKbn) {
            case '[地点大分類]':
                // 地点大分類
                // 地点名称・施設名称・地点大分類名を取得
                $param = ['point_no' => $this->pointNo];
                $reportText = array();
                $reportText = DB::select('SELECT saisui.point_dsp_name, saisui.point_report_name, sisetu.sisetu_name
                    FROM m_saisui_point saisui JOIN m_sisetu sisetu ON saisui.sisetu_no = sisetu.sisetu_no
                    where saisui.point_no = :point_no', $param);

                // 報告書タイプにより分岐
                if ($reportType === 51 || $reportType === 19) {
                    if ($reportText[0]->point_report_name === '木原取水場') {
                        $retStr = '霞ヶ浦・阿見浄水場';
                    } elseif ($reportText[0]->point_report_name === '霞ヶ浦用水取水口') {
                        $retStr = '関城・新治浄水場';
                    } else {
                        $retStr = $reportText[0]->sisetu_name;
                    }
                } else {
                    // 「51」、「19」以外の場合、施設名称を設定して返す
                    $retStr = $reportText[0]->sisetu_name;
                }
                break;
            case '[年月]':
                //年月
                //「ggy年M月」は現在日付を出力
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYYMM');
                if ($reportType === 51) {
                    // ggy年M月 + "に実施したこのことについては、下表のとおりです。"
                    $retStr = $wareki . "に実施したこのことについては、下表のとおりです。";
                } elseif ($reportType === 47 || $reportType === 49 || $reportType === 17) {
                    // "このことについて、" + ggy年M月 + "の実施分は、下表のとおりです。"
                    $retStr = "このことについて、" . $wareki . "の実施分は、下表のとおりです。";
                } else {
                    //ggy年M月;
                    $retStr = $wareki;
                }
                break;
            case '[採水地点]':
                // 採水地点
                // 地点名称・地点名称報告書を取得
                $param = ['point_no' => $this->pointNo];
                $reportText = array();
                $reportText = DB::select('SELECT point_dsp_name, point_report_name
                FROM m_saisui_point where point_no = :point_no', $param);

                // 地点名称により補正を実施
                if (count($reportText) === 0) {
                    $retStr = "";
                } elseif ($reportText[0]->point_report_name === '美浦配水場') {
                    $retStr = '配水場';
                } else {
                    $retStr  = $reportText[0]->point_report_name;
                }
                break;
            case '[採水年月日]':
                // 採水年月日
                // 引数の採水年月日を戻り値に設定
                $retStr =  $this->saisuiDate;
                break;
            case '[採水年月日_曜日]':
                // 採水年月日_曜日
                // 対象の採水年月日を指定
                $retStr = $this->saisuiDate;
                break;
            case '[週報_受付年月日_7日後]':
                // 週報_受付年月日_7日後
                // DateTimeオブジェクトに変換して7日加算
                $date = new DateTime($this->saisuiDate);
                $date->modify('+7 days');

                // 加算後の日付を取得（フォーマットは元の形式に合わせて調整）
                $retStr = $date->format('Y/m/d');
                break;

            case '[地点別採水年月日]':
                // 採水年月日
                // 引数の採水年月日を戻り値に設定
                $order = str_replace('地点別採水年月日_', '', $textCellName);
                $filtered =  array_values(array_filter($inspectionResult, function ($item) use ($order) {
                    return $item->item_no === 1 && (string)$item->point_order === $order;
                }));
                if (is_null($filtered) || $filtered == array() || is_null($filtered[0]->inspection_data)) {
                    $retStr = $this->dspSpace;
                } else {
                    $retStr = $filtered[0]->inspection_data;
                }
                break;

            case '[受付年月日]':
                // 受付年月日
                // 引数の採水年月日を戻り値に設定
                $filtered =  array_values(array_filter($inspectionResult, function ($item) {
                    return $item->item_no === 1153;
                }));

                if ($this->reportNo == 410) {
                    // 共同検査（臨時 省略不可能項目）の場合のみ、「受付年月日」の年を「採水年月日」の年に補正する
                    $result_data =  array_values(array_filter($inspectionResult, function ($item) {
                        return $item->item_no === 1;
                    }));

                    $saisui_date = new DateTime($result_data[0]->inspection_data);
                    $saisui_date_YYYY = $saisui_date->format('Y');

                    $retStr = $saisui_date_YYYY . '/' . $filtered[0]->inspection_data;
                } else {
                    $retStr = $filtered[0]->inspection_data;
                }
                break;

            case '[当日天候]':
                // 当日天候
                // 検査結果から項目番号「1030」の定性データを戻り値に設定
                $inspectionData = $this->reportDao->getInspectionResultReportText(
                    $this->reportNo,
                    $this->pointNo,
                    $this->saisuiDate,
                    $this->inspectionKbnCode
                );
                $retStr =  $this->getInspectionResultFilter($inspectionData, 1030, 2);
                break;
            case '[所属]+[採水者]':
                // 所属+採水者
                // 報告書タイプ毎に検査結果を組合せ、戻り値に設定
                if ($reportType === 10 || $reportType === 11 || $reportType === 8 || $reportType === 7) {
                    //所属(共同水質)+採水者(共同水質)
                    $company = $this->getInspectionResultFilter($inspectionResult, 1132, 2);
                    $user = $this->getInspectionResultFilter($inspectionResult, 1072, 2);
                } else {
                    //所属+採水者
                    $company = $this->getInspectionResultFilter($inspectionResult, 1130, 2);
                    $user = $this->getInspectionResultFilter($inspectionResult, 1070, 2);
                }

                // 無い場合は、広めの条件で再度検索してフィルタ
                if ($company == $this->dspSpace || $user == $this->dspSpace) {
                    $inspectionData = $this->reportDao->getInspectionResultReportText(
                        $this->reportNo,
                        $this->pointNo,
                        $this->saisuiDate,
                        $this->inspectionKbnCode
                    );

                    if ($reportType === 10 || $reportType === 11 || $reportType === 8 || $reportType === 7) {
                        //所属(共同水質)+採水者(共同水質)
                        $company = $this->getInspectionResultFilter($inspectionData, 1132, 2);
                        $user = $this->getInspectionResultFilter($inspectionData, 1072, 2);
                    } else {
                        //所属+採水者
                        $company = $this->getInspectionResultFilter($inspectionData, 1130, 2);
                        $user = $this->getInspectionResultFilter($inspectionData, 1070, 2);
                    }
                }

                $retStr =  $company . " " . $user;
                break;
            case '[Microcystis(colony cell)]':
                // Microcystis(colony cell)
                // 検査結果から項目番号「8105」の値を戻り値に設定
                $retStr =  $this->getInspectionResultFilter($inspectionResult, 8105, 1);
                break;
            case '[藍藻類合計_1]':
                // 藍藻類合計_1
                // 検査結果から項目番号「8172」の値を戻り値に設定
                $inspectionResult = $this->reportDao->getInspectionResultReportText(
                    $this->reportNo,
                    $this->pointNo,
                    $this->saisuiDate,
                    $this->inspectionKbnCode
                );
                $retStr =  $this->getInspectionResultFilter($inspectionResult, 8172, 1);
                break;
            case '[藍藻類合計_2]':
                // 藍藻類合計_2
                // 検査結果から項目番号「8174」の値を戻り値に設定
                $inspectionResult = $this->reportDao->getInspectionResultReportText(
                    $this->reportNo,
                    $this->pointNo,
                    $this->saisuiDate,
                    $this->inspectionKbnCode
                );
                $retStr =  $this->getInspectionResultFilter($inspectionResult, 8174, 1);
                break;
            case '[藻類合計_1]':
                // 藻類合計_1
                // 検査結果から項目番号「8988」の値を戻り値に設定
                $inspectionResult = $this->reportDao->getInspectionResultReportText(
                    $this->reportNo,
                    $this->pointNo,
                    $this->saisuiDate,
                    $this->inspectionKbnCode
                );
                $retStr =  $this->getInspectionResultFilter($inspectionResult, 8988, 1);
                break;
            case '[藻類合計_2]':
                // 藻類合計_2
                // 検査結果から項目番号「8989」の値を戻り値に設定
                $inspectionResult = $this->reportDao->getInspectionResultReportText(
                    $this->reportNo,
                    $this->pointNo,
                    $this->saisuiDate,
                    $this->inspectionKbnCode
                );
                $retStr =  $this->getInspectionResultFilter($inspectionResult, 8989, 1);
                break;
            case '[所属]+[試験担当者]':
                // 所属+試験担当者
                // 検査結果から項目番号「1130」と「1202」の値を取得し、半角スペースで結合し戻り値に設定
                // 所属 + 試験担当者
                $inspectionResult = $this->reportDao->getInspectionResultReportText(
                    $this->reportNo,
                    $this->pointNo,
                    $this->saisuiDate,
                    $this->inspectionKbnCode
                );
                $retStr =  $this->getInspectionResultFilter($inspectionResult, 1130, 2) . " " .
                    $this->getInspectionResultFilter($inspectionResult, 1202, 2);
                break;
            case '[年]':
                // 年
                // 現在日付を「ggy年度」に変換して戻り値に設定
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYY');
                $retStr =  $wareki . '度';
                break;
            case '[所属]':
                // 所属
                // 検査結果から項目番号「1130」の値を取得し戻り値に設定
                $inspectionResult = $this->reportDao->getInspectionResultReportText(
                    $this->reportNo,
                    $this->pointNo,
                    $this->saisuiDate,
                    $this->inspectionKbnCode
                );
                $retStr =  $this->getInspectionResultFilter($inspectionResult, 1130, 2);
                break;
            case '[採水者]':
                // 採水者
                // 検査結果から項目番号「1070」の値を取得し戻り値に設定
                $inspectionResult = $this->reportDao->getInspectionResultReportText(
                    $this->reportNo,
                    $this->pointNo,
                    $this->saisuiDate,
                    $this->inspectionKbnCode
                );
                $retStr =  $this->getInspectionResultFilter($inspectionResult, 1070, 2);
                break;
            case '[文書番号]':
                // 文書番号
                // 報告書タイプより、各補正を行った結果を戻り値に設定
                $inspectionData = $this->reportDao->getInspectionResultReportText(
                    $this->reportNo,
                    $this->pointNo,
                    $this->saisuiDate,
                    $this->inspectionKbnCode
                );

                $documentNo = "";
                if ($reportType === 52) {
                    $documentNo = $this->getInspectionResultFilter($inspectionData, 1205, 2); //文書番号（嫌気性芽胞菌）
                } else {
                    $documentNo = $this->getInspectionResultFilter($inspectionData, 1204, 2); //文書番号
                }

                if ($reportType === 20) {
                    if ($documentNo == $this->dspSpace) {
                        $retStr = "結果書番号";
                    } else {
                        $retStr = "結果書番号" . $documentNo;
                    }
                } elseif (in_array($reportType, [10, 11, 8, 7], true)) {
                    if ($documentNo == $this->dspSpace) {
                        $retStr = "企水セ第   　号";
                    } else {
                        $retStr = "企水セ第" . $documentNo . "号";
                    }
                } elseif (in_array($reportType, [53, 23, 51, 54, 19, 47, 17, 52, 49], true)) {
                    if ($documentNo == $this->dspSpace) {
                        $retStr = "企水セ第   - 号";
                    } else {
                        $retStr = "企水セ第" . $documentNo . "号";
                    }
                } elseif ($reportType === 14) {
                    //検査結果に「-」が含まれている かつ検査結果が2文字以上の場合
                    if (strpos($documentNo, "-") !== false && strLen($documentNo) >= 2) {
                        $retStr = "企水セ第" . explode("-", $documentNo)[0] . "-1号";
                    } else {
                        $retStr = "企水セ第   - 号";
                    }
                }
                break;
            case '[発出日]':
                //発出日
                $issueDate = "";
                $inspectionData = $this->reportDao->getInspectionResultReportText(
                    $this->reportNo,
                    $this->pointNo,
                    $this->saisuiDate,
                    $this->inspectionKbnCode
                );
                if ($reportType === 52) {
                    $issueDate = $this->getInspectionResultFilter($inspectionData, 1207, 2);
                } else {
                    $issueDate = $this->getInspectionResultFilter($inspectionData, 1206, 2);
                }

                if ($issueDate == $this->dspSpace) {
                    $retStr =  "令和　年　月　日";
                } else {
                    $retStr =  $issueDate;
                    // 月と日だけの場合は、画面.採水年月日の年を追加
                    if (mb_strlen($retStr) <= 5) {
                        $cond_year = substr($this->saisuiDate, 0, 4);
                        $retStr =  $cond_year . '/' . $issueDate;
                    }
                }
                break;
            case '[期間]':
                // 期間
                if ($reportType === 17) {
                    //①-18-1-1 検査区分CDを「20000」(臨時試験)に補正して、検査結果から項目番号「1120」(検査終了日)を取得する。
                    // 対象日付の検査結果を取得
                    $inspectionData = $this->reportDao->getInspectionResultReportText(
                        $this->reportNo,
                        $this->pointNo,
                        $this->saisuiDate,
                        20000,
                        true
                    );

                    if ($inspectionData !== false && Count($inspectionData) > 0) {
                        $tmpStr = $this->getInspectionResultFilter($inspectionData, 1120, 2);
                    }
                } else {
                    $inspectionData = $this->reportDao->getInspectionResultReportText(
                        $this->reportNo,
                        $this->pointNo,
                        $this->saisuiDate,
                        $this->inspectionKbnCode
                    );
                    $tmpStr =  $this->getInspectionResultFilter($inspectionData, 1120, 2);
                }

                if ($tmpStr == $this->dspSpace) {
                    $retStr = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYYMMDD') . "～";
                } else {
                    $chkStr =  preg_match('/^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])$/', $tmpStr, $chkStr);
                    if ($chkStr) {
                        $retStr = $this->commonService->warekiConv(substr($this->saisuiDate, 0, 4) . "/" . $tmpStr, false, 'YYYYMMDD');
                        $retStr =  $this->commonService->warekiConv($this->saisuiDate, false, 'YYYYMMDD') . "～" . $retStr;
                    } elseif (strtotime($tmpStr) !== false) {
                        $retStr =  $this->commonService->warekiConv($this->saisuiDate, false, 'YYYYMMDD') . "～" .
                            $this->commonService->warekiConv($tmpStr, false, 'YYYYMMDD');
                    }
                }
                break;
            case '[検査対象]':
                // 検査対象
                // 検査結果から項目番号「1172」の値を戻り値に設定
                $inspectionResult = $this->reportDao->getInspectionResultReportText(
                    $this->reportNo,
                    $this->pointNo,
                    $this->saisuiDate,
                    $this->inspectionKbnCode
                );
                $retStr =  $this->getInspectionResultFilter($inspectionResult, 1172, 2);
                break;
            case '[検査機関]':
                // 検査機関
                // 検査結果から項目番号「1080」の値を戻り値に設定
                $inspectionResult = $this->reportDao->getInspectionResultReportText(
                    $this->reportNo,
                    $this->pointNo,
                    $this->saisuiDate,
                    $this->inspectionKbnCode
                );
                $retStr =  $this->getInspectionResultFilter($inspectionResult, 1080, 2);
                break;
            case '[検査責任者]':
                // 検査責任者
                // 報告書固定文言マスタから、検査責任者の固定文言を取得し、戻り値に設定
                $param = [
                    'report_No' => $this->reportNo,
                    'nendo' => substr(date("Y/m/d", strtotime("$this->saisuiDate -3 month")), 0, 4),
                    'text_cell_kbn' => '[検査責任者]'
                ];
                $reportText = array();
                $reportText = DB::select('SELECT text_cell_code
                                    FROM m_report_text
                                    where report_no = :report_No AND
                                    text_cell_kbn = :text_cell_kbn AND
                                    nendo = :nendo ', $param);
                if (Count($reportText) > 0 && !is_null($reportText[0]->text_cell_code)) {
                    $retStr =  $reportText[0]->text_cell_code;
                } else {
                    $inspectionResult = $this->reportDao->getInspectionResultReportText(
                        $this->reportNo,
                        $this->pointNo,
                        $this->saisuiDate,
                        $this->inspectionKbnCode
                    );
                    $retStr =  $this->getInspectionResultFilter($inspectionResult, 1090, 2);
                }
                break;
            case '[地点大分類]+[採水地点]':
                // 地点大分類+採水地点
                // 地点名称・地点大分類名を取得、地点大分類と地点名称を半角スペースで結合し、戻り値に設定
                $param = ['point_no' => $this->pointNo];
                $reportText = array();
                $reportText = DB::select('SELECT saisui.point_dsp_name, saisui.point_report_name, sisetu.sisetu_name
                    FROM m_saisui_point saisui JOIN m_sisetu sisetu ON saisui.sisetu_no = sisetu.sisetu_no
                    where saisui.point_no = :point_no', $param);
                if (Count($reportText) > 0) {
                    $retStr =  $reportText[0]->sisetu_name . " " . $reportText[0]->point_dsp_name;
                } else {
                    $retStr = "";
                }
                break;
            case '[備考]':
                // 備考
                // 報告書タイプより、各補正を行った結果を戻り値に設定
                if ($reportType == 11) {
                    $res1151 = $this->getInspectionResultFilter($inspectionResult, 1151, 2); //再採水時データ
                    $res5110 = $this->getInspectionResultFilter($inspectionResult, 5110, 1); //アンモニア態窒素

                    if ($res1151 <> $this->dspSpace && strPos($res1151, "。") !== false) {
                        $arr1151 = explode("。", $res1151);
                        $tmpStr = "";
                        foreach ($arr1151 as $str) {
                            $tmpStr .= $str . "。" . PHP_EOL;
                        }
                        $tmpStr = trim($tmpStr);
                    } else {
                        $tmpStr = "";
                    }

                    if ($res1151 <> $this->dspSpace && $res5110 <> $this->dspSpace) {
                        $retStr = "検査結果(再採水時のデータ)" . PHP_EOL;
                        $retStr .= "      * アンモニア態窒素は、水道GLP適用範囲外である。";
                        $retStr .= "検査は、上水試験方法（2020年版）に基づく方法で行った。" . PHP_EOL;
                    } elseif ($res1151 <> $this->dspSpace && $res5110 == $this->dspSpace) {
                        $retStr = $tmpStr . PHP_EOL;
                    } elseif ($res1151 == $this->dspSpace && $res5110 <> $this->dspSpace) {
                        $retStr = "      * アンモニア態窒素は、水道GLP適用範囲外である。";
                        $retStr .= "検査は、上水試験方法（2020年版）に基づく方法で行った。" . PHP_EOL;
                    } else {
                        $retStr = "";
                    }
                } elseif ($reportType == 10) {
                    $res1151 = $this->getInspectionResultFilter($inspectionResult, 1151, 2); //再採水時データ
                    $res5110 = $this->getInspectionResultFilter($inspectionResult, 5110, 1); //アンモニア態窒素

                    if ($res1151 <> $this->dspSpace && strPos($res1151, "。") !== false) {
                        $arr1151 = explode("。", $res1151);
                        $tmpStr = "";
                        foreach ($arr1151 as $str) {
                            $tmpStr .= $str . "。" . PHP_EOL;
                        }
                        $tmpStr = trim($tmpStr);
                    } else {
                        $tmpStr = "";
                    }

                    if ($res1151 <> "" && $res5110 <> "") {
                        $retStr = "検査結果(再採水時のデータ)" . PHP_EOL;
                        $retStr .= "      * アンモニア態窒素の検査は、上水試験方法（2020年版）に基づく方法で行った。" . PHP_EOL;
                    } elseif ($res1151 <> "" &&  $res5110 == "") {
                        $retStr = $tmpStr . PHP_EOL;
                    } elseif ($res1151 == "" && $res5110 <> "") {
                        $retStr = "      * アンモニア態窒素の検査は、上水試験方法（2020年版）に基づく方法で行った。" . PHP_EOL;
                    } else {
                        $retStr = "";
                    }
                } elseif ($reportType == 7) {
                    $res1151 = $this->getInspectionResultFilter($inspectionResult, 1151, 2); //再採水時データ

                    if ($res1151 <> $this->dspSpace && strPos($res1151, "。") !== false) {
                        $arr1151 = explode("。", $res1151);
                        $tmpStr = "";
                        foreach ($arr1151 as $str) {
                            $tmpStr .= $str . "。" . PHP_EOL;
                        }
                        $tmpStr = trim($tmpStr);
                    } else {
                        $tmpStr = "";
                    }

                    if ($res1151 <> $this->dspSpace) {
                        $retStr = "備考)　検査は、厚生労働省健康局水道課長通知健水発第0330006号に基づく方法で行った。";
                        $retStr .= $tmpStr . PHP_EOL;
                    } else {
                        $retStr = "備考)　検査は、厚生労働省健康局水道課長通知健水発第0330006号に基づく方法で行った。";
                    }
                } elseif ($reportType == 8) {
                    $res1151 = $this->getInspectionResultFilter($inspectionResult, 1151, 2); //再採水時データ

                    if ($res1151 <> $this->dspSpace && strPos($res1151, "。") !== false) {
                        $arr1151 = explode("。", $res1151);
                        $tmpStr = "";
                        foreach ($arr1151 as $str) {
                            $tmpStr .= $str . "。" . PHP_EOL;
                        }
                        $tmpStr = trim($tmpStr);
                    } else {
                        $tmpStr = "";
                    }

                    if ($res1151 <> $this->dspSpace) {
                        $retStr = $tmpStr;
                    } else {
                        $retStr = "";
                    }
                } else {
                    $inspectionResult = $this->reportDao->getInspectionResultReportText(
                        $this->reportNo,
                        $this->pointNo,
                        $this->saisuiDate,
                        $this->inspectionKbnCode
                    );
                    $res1150 = $this->getInspectionResultFilter($inspectionResult, 1150, 2);
                    if ($res1150 <> $this->dspSpace) {
                        $retStr = $res1150;
                    } else {
                        $retStr = "";
                    }
                }
                break;
            case '[藻類備考]':
                //藻類備考
                $retStr =  $this->getInspectionResultFilter($inspectionResult, 1156, 2);
                if ($retStr == $this->dspSpace) {
                    $retStr =  " ";
                }
                break;
            case '[宛先共同水質]':
                // 宛先共同水質
                // 報告書固定文言マスタから、宛先共同水質の固定文言を取得し、戻り値に設定
                if ($this->reportNo == 409 || $this->reportNo == 410 || $this->reportNo == 412) {
                    // 共同検査(臨時)系の場合、検査結果「給水事業体(1155)」で選択された市町村と紐づく宛先共同水質を取得する
                    $param = [
                        'point_no' => $this->pointNo,
                        'item_no' => 1155,
                        'saisuiDate' => $this->saisuiDate,
                        'saisuiTime' => $this->saisuiTime,
                        'inspectionKbnCode' => $this->inspectionKbnCode
                    ];
                    $reportResult = array();
                    $reportResult = DB::select('SELECT qualitative_data
                                        FROM t_inspection_result
                                        where point_no = :point_no AND
                                        item_no = :item_no  AND
                                        saisui_date = :saisuiDate AND
                                        saisui_time = :saisuiTime AND
                                        inspection_kbn_code = :inspectionKbnCode', $param);

                    if (Count($reportResult) > 0) {
                        $retStr = "";
                        $atesakiKyoudouSuishituList = config('const.atesakiKyoudouSuishitu');

                        foreach ($atesakiKyoudouSuishituList as $row) {
                            // 市町村名と期間が一致する宛先共同水質を格納する
                            if ($reportResult[0]->qualitative_data == $row['sityouson']) {
                                if ($row['startDate'] <= $this->saisuiDate && $this->saisuiDate <= $row['endDate']) {
                                    $retStr = $row['name'];
                                    break;
                                }
                            }
                        }
                    } else {
                        $retStr = "";
                    }
                } else {
                    $param = [
                        'report_No' => $this->reportNo,
                        'point_no' => $this->pointNo,
                        'saisuiDate' => $this->saisuiDate,
                        'text_cell_kbn' => '[宛先共同水質]'
                    ];
                    $reportText = array();
                    $reportText = DB::select('SELECT text_cell_code
                                        FROM m_report_text
                                        where report_no = :report_No AND
                                        point_no = :point_no  AND
                                        text_cell_kbn = :text_cell_kbn AND
                                        (start_valid_date <= :saisuiDate AND :saisuiDate <= end_valid_date )', $param);
                    if (Count($reportText) > 0) {
                        $retStr = $reportText[0]->text_cell_code;
                    } else {
                        $retStr = "";
                    }
                }
                break;
            case '[宛先共同水質_事業名]':
                // 宛先共同水質_事業名
                // 報告書固定文言マスタから、宛先共同水質_事業名の固定文言を取得し、戻り値に設定
                if ($this->reportNo == 409 || $this->reportNo == 410 || $this->reportNo == 412) {
                    // 共同検査(臨時)系の場合、検査結果「給水事業体(1155)」で選択された市町村と紐づく宛先共同水質_事業名を取得する
                    $param = [
                        'point_no' => $this->pointNo,
                        'item_no' => 1155,
                        'saisuiDate' => $this->saisuiDate,
                        'saisuiTime' => $this->saisuiTime,
                        'inspectionKbnCode' => $this->inspectionKbnCode
                    ];
                    $reportResult = array();
                    $reportResult = DB::select('SELECT qualitative_data
                                        FROM t_inspection_result
                                        where point_no = :point_no AND
                                        item_no = :item_no  AND
                                        saisui_date = :saisuiDate AND
                                        saisui_time = :saisuiTime AND
                                        inspection_kbn_code = :inspectionKbnCode', $param);

                    if (Count($reportResult) > 0) {
                        $retStr = "";
                        $atesakiKyoudouSuishituJigyouList = config('const.atesakiKyoudouSuishituJigyou');

                        foreach ($atesakiKyoudouSuishituJigyouList as $row) {
                            // 市町村名が一致する宛先共同水質_事業名を格納する
                            if ($reportResult[0]->qualitative_data == $row['sityouson']) {
                                $retStr = $row['name'];
                                break;
                            }
                        }
                    } else {
                        $retStr = "";
                    }
                } else {
                    $param = [
                        'report_No' => $this->reportNo,
                        'point_no' => $this->pointNo,
                        'text_cell_kbn' => '[宛先共同水質_事業名]'
                    ];
                    $reportText = array();
                    $reportText = DB::select('SELECT text_cell_code
                                        FROM m_report_text
                                        where report_no = :report_No AND
                                        point_no = :point_no  AND
                                        text_cell_kbn = :text_cell_kbn', $param);
                    if (Count($reportText) > 0) {
                        $retStr = $reportText[0]->text_cell_code;
                    } else {
                        $retStr = "";
                    }
                }
                break;
            case '[センター長]':
                // センター長
                // 報告書固定文言マスタから、センター長の固定文言を取得し、戻り値に設定
                $param = [
                    'report_No' => $this->reportNo,
                    'nendo' => substr(date("Y/m/d", strtotime("$this->saisuiDate -3 month")), 0, 4),
                    'text_cell_kbn' => '[センター長]'
                ];
                $reportText = array();
                $reportText = DB::select('SELECT text_cell_code
                                    FROM m_report_text
                                    where report_no = :report_No AND
                                    text_cell_kbn = :text_cell_kbn AND
                                    nendo = :nendo ', $param);
                if (Count($reportText) > 0) {
                    $retStr = $reportText[0]->text_cell_code;
                } else {
                    $retStr = "";
                }
                break;
            case '[採水年月日_7日後]':
                // 画面上での採水年月日の7日後の日付を返す。
                $retStr = date("Y/m/d", strtotime("$this->saisuiDate +7 day"));
                break;
            case '過去3年データ':
                // 報告書固定文言マスタから、過去3年データの固定文言を取得し、戻り値に設定
                $param = [
                    'report_No' => $this->reportNo,
                    'text_cell_kbn' => '過去3年データ'
                ];
                $reportText = array();
                $reportText = DB::select('SELECT text_cell_code
                                    FROM m_report_text
                                    where report_no = :report_No AND
                                    text_cell_kbn = :text_cell_kbn', $param);
                if (Count($reportText) > 0 && $this->nendo != '') {
                    $retStr = $reportText[0]->text_cell_code;
                    // 各年度を取得する
                    $startNendo = strval(intval($this->nendo) - 2);
                    // 開始/終了年度を差替え
                    $retStr = str_replace('HStarty', $startNendo, $retStr);
                    $retStr = str_replace('HEndY', $this->nendo, $retStr);
                } else {
                    $retStr = "";
                }
                break;

            case '[年度_西暦_今年度]':
                // 年度の開始年を取得(採水年月-3か月の年をスタートとする)
                $tmpNenGetsu = explode('/', date("Y/m/d", strtotime("$this->saisuiDate -3 month")));
                $nendoYYYY = intval($tmpNenGetsu[0]);
                $retStr =  $nendoYYYY . '年度';
                break;

            case '[年度_西暦_前年度]':
                // 年度の開始年を取得(採水年月-3か月の年をスタートとする)
                $tmpNenGetsu = explode('/', date("Y/m/d", strtotime("$this->saisuiDate -3 month")));
                $nendoYYYY = intval($tmpNenGetsu[0]) - 1;
                $retStr =  $nendoYYYY . '年度';
                break;

            case '[年度_西暦_前々年度]':
                // 年度の開始年を取得(採水年月-3か月の年をスタートとする)
                $tmpNenGetsu = explode('/', date("Y/m/d", strtotime("$this->saisuiDate -3 month")));
                $nendoYYYY = intval($tmpNenGetsu[0]) - 2;
                $retStr =  $nendoYYYY . '年度';
                break;

            default:
                //固定値文言が[HF~]かチェック
                if (preg_match('/[HF\[0-9]+\]/', $textCellKbn, $matchStr) !== false) {
                    $param = [
                        'report_No' => $this->reportNo,
                        'point_no' => $this->pointNo,
                        'text_cell_kbn' =>  $textCellKbn
                    ];
                    $reportText = array();
                    $reportText = DB::select('SELECT text_cell_code
                                        FROM m_report_text
                                        where report_no = :report_No AND
                                        point_no = :point_no  AND
                                        text_cell_kbn = :text_cell_kbn', $param);
                    if (Count($reportText) > 0) {
                        $retStr = $reportText[0]->text_cell_code;
                    } else {
                        $retStr = "";
                    }

                    if ($reportType == 42) {
                        $filter = array_filter($inspectionResult, function ($insResult) {
                            return in_array($insResult->item_no, [3090, 3120, 3130]) &&
                                $insResult->inspection_data !== null &&
                                (strpos($insResult->point_report_name, '浄水池') !== false || strpos($insResult->point_report_name, '配水池') !== false);
                        });
                        $first = array_values($filter)[0] ?? null;

                        if ($first !== null) {
                            $dt = new DateTime($first->saisui_date);
                            $md = $dt->format('n月j日');
                            $retStr = str_replace('AJOMMDD', $md, $retStr);
                        } else {
                            $retStr = '';
                        }
                    }

                    break;
                }
                $retStr = "";
        }
        syslog(LOG_INFO, "report_No:{$this->reportNo}");
        syslog(LOG_INFO, "point_no:{$this->pointNo}");
        syslog(LOG_INFO, "retStr:{$retStr}");
        return $retStr ?? '';
    }

    /**
     * 検査結果フィルタ処理
     * @param array $inspectionResult 検査結果
     * @param int $itemNo 項目番号
     * @param int $type 定量定性タイプ (1:constant_data,2:qualitative_data)
     * @return string
     */
    protected function getInspectionResultFilter(array $inspectionResult, int $itemNo, int $type): string
    {
        syslog(LOG_INFO, print_r($inspectionResult, true));
        $filter = array_filter($inspectionResult, function ($insResult) use ($itemNo) {
            return $insResult->item_no == $itemNo;
        });

        $first = array_values($filter)[0] ?? null;

        if (!$first) {
            return $this->dspSpace; // または適切なエラーハンドリング
        }

        if ($type == 1) {
            $retval = $first->constant_data ?? $this->dspSpace;
        } else {
            $retval = $first->qualitative_data ?? $this->dspSpace;
        }

        // 定量データと定性データを統合して取得していた場合
        if ($retval == $this->dspSpace) {
            $retval = $first->inspection_data ?? $this->dspSpace;
        }
        return strval($retval);
    }

    /**
     * 入出力基準値取得処理
     *
     * @param int $itemNo 項目番号
     * @return array 入出力基準値配列
     */
    protected function getInoutReferenceValue(int $itemNo, int $pointNo, int $nendo = null): array
    {
        $reference = [];

        if (isset($nendo)) {
            $saisuiNen = $nendo;
        } else {
            // 採水年を取得
            $tmpNenGetsu = explode('/', $this->saisuiDate);

            // YYYY/MM/DD構成でない場合は、エラーとする
            if (count($tmpNenGetsu) !== 3) {
                return $reference;
            }

            $saisuiNen = intval($tmpNenGetsu[1]) < $this->yearStartMonth ?
                intval($tmpNenGetsu[0]) - 1 : intval($tmpNenGetsu[0]);
        }

        // 特定の報告書番号の場合は採水区分を固定
        $reportNofilter = array_filter(config('const.saisuiKbnList'), function ($elem) {
            return $elem['report_no'] == $this->reportNo;
        });
        $saisuiKbnNo = array_values($reportNofilter)[0]['saisui_kbn_no'] ?? null;

        // 入出力基準値を取得
        $retData = $this->reportDao->getInoutInspectionCriteria($pointNo, $itemNo, $saisuiNen, $saisuiKbnNo);

        if ($retData !== false) {
            if (count($retData) > 0) {
                $reference = (array)$retData[0];
            }
        }
        return $reference;
    }

    /**
     * 月初採水日取得処理
     *
     * @param int $reportNo 報告書番号
     * @param int $inspectionKbnCode 検査区分CD
     * @param string $saisuiDate 採水年月日
     * @param int $pointNo 地点番号
     * @param int $itemNo 項目番号
     * @return string 月初採水年月日
     */
    protected function getSaisuiDateBeginMonth(
        int $itemNo
    ): string {
        $saisui = '';

        // 指定年月日を取得する。
        // 採水年月日を/で区切る
        $tmpNenGetsu = explode('/', $this->saisuiDate);

        // YYYY/MM/DD構成でない場合は、エラーとする
        if (count($tmpNenGetsu) !== 3) {
            return $saisui;
        }

        // 月初日を取得する
        $tmpNenGetsu[2] = '01';
        $saisuiStart = implode('/', $tmpNenGetsu);

        // 月末を取得する
        $saisuitmp = date("Y/m/d", strtotime("$saisuiStart 1 month"));
        $saisuiEnd = date("Y/m/d", strtotime("$saisuitmp -1 day"));

        // 指定年月日の検査結果を全レコード取得する
        $result = $this->reportDao->getRangeInspectionResultSaisuiDate(
            $this->pointNo,
            $itemNo,
            $saisuiStart,
            $saisuiEnd,
            $this->inspectionKbnCode
        );

        // 取得結果がある場合、一番最初のレコードの採水年月日をYYYY/mm/DD形式にして戻り値に設定する。
        if ($result !== false) {
            if (count($result) > 0) {
                $tmpArray = (array)$result[0];
                $saisui = date("Y/m/d", strtotime($tmpArray['saisui_date']));
            }
        }

        return $saisui;
    }

    /**
     * 統計用データ設定
     *
     * @param array $inspectionData 検査データ(1項目単位)
     * @param array $statistics 統計データ配列
     * @return void
     */
    protected function setStatisticsData(array $inspectionData, array &$statistics)
    {
        if (array_key_exists('item_no_renban', $inspectionData)) {
            $strKey = 'item_no_renban';
        } else {
            $strKey = 'item_no';
        }
        // 統計データに対象項目のキーが無い場合は、項目を作成
        if (!array_key_exists($inspectionData[$strKey], $statistics)) {
            $statistics[$inspectionData[$strKey]] = [
                'max' => '',
                'data' => [],
                'min' => '',
                'saisuiKbnNo' => $inspectionData['saisui_kbn_no'],
                'qualitativeFlg' => $inspectionData['constant_qualitative_flg']
            ];
        }

        // 集計ごとに値を保持
        $tmpData = $inspectionData['inspection_data'];
        if (!is_null($tmpData) && $tmpData !== '') {
            // 平均
            array_push($statistics[$inspectionData[$strKey]]['data'], $tmpData);

            // 不足分のデータが存在する場合は設定
            if (
                is_null($statistics[$inspectionData[$strKey]]['saisuiKbnNo']) ||
                $statistics[$inspectionData[$strKey]]['saisuiKbnNo'] !== ''
            ) {
                $statistics[$inspectionData[$strKey]]['saisuiKbnNo'] = $inspectionData['saisui_kbn_no'];
            }

            if (
                is_null($statistics[$inspectionData[$strKey]]['qualitativeFlg']) ||
                $statistics[$inspectionData[$strKey]]['qualitativeFlg'] !== ''
            ) {
                $statistics[$inspectionData[$strKey]]['qualitativeFlg'] = $inspectionData['constant_qualitative_flg'];
            }

            // 対象データが定性データの場合、以降スキップ
            if ($inspectionData['constant_qualitative_flg'] === 2 || is_null($inspectionData['constant_qualitative_flg'])) {
                return;
            }

            // 最大値
            if (
                ($statistics[$inspectionData[$strKey]]['max'] === '') ||
                (bccomp($statistics[$inspectionData[$strKey]]['max'], $tmpData) === -1)
            ) {
                $statistics[$inspectionData[$strKey]]['max'] = $tmpData;
            }

            // 最小値
            if (
                ($statistics[$inspectionData[$strKey]]['min'] === '') ||
                (bccomp($statistics[$inspectionData[$strKey]]['min'], $tmpData) === 1)
            ) {
                $statistics[$inspectionData[$strKey]]['min'] = $tmpData;
            }
        }

        return;
    }
    /**
     * 統計用データ設定
     *
     * @param array $statistics 統計データ配列
     * @return array 統計算出後配列
     */
    protected function calcStatistics(
        array $statistics
    ): array {
        $retArray = [
            'max' => [],
            'avg' => [],
            'min' => [],
            'count' => [],
            'sum' => []
        ];

        // 集計種類
        $calcType = ['max', 'data', 'min'];

        // 項目単位に処理を実施
        foreach ($statistics as $key => $value) {
            foreach ($calcType as $type) {
                $data = '';
                if ($type === 'data') {
                    // 各種登録値に対する統計処理
                    $dataArray = [
                        'avg' => '',
                        'count' => count($value[$type]),
                        'sum' => ''
                    ];

                    if ($value['qualitativeFlg'] === 1) {
                        $dataArray['avg'] = $this->calcAvg($value[$type]);
                        $dataArray['sum'] = $this->calcSum($value[$type]);
                    }

                    foreach ($dataArray as $calc => $tmpValue) {
                        if ($calc !== 'count') {
                            // 合計数以外は定量データ加工を行ってからデータ登録
                            if ($tmpValue !== '') {
                                // データの加工
                                $this->configureFixedQuantityData(
                                    $key,
                                    $value['saisuiKbnNo'],
                                    $this->reportConfig['dsp_up_limit'],
                                    $this->reportConfig['dsp_low_limit'],
                                    $tmpValue,
                                    $this->pointNo
                                );
                            }
                        }
                        array_push($retArray[$calc], [$tmpValue]);
                    }
                } else {
                    $data = $value[$type];
                    if ($data !== '') {
                        // データの加工
                        $this->configureFixedQuantityData(
                            $key,
                            $value['saisuiKbnNo'],
                            $this->reportConfig['dsp_up_limit'],
                            $this->reportConfig['dsp_low_limit'],
                            $data,
                            $this->pointNo
                        );
                    }
                    array_push($retArray[$type], [$data]);
                }
            }
        }
        return $retArray;
    }

    /**
     * 統計用データ設定(複数項目)
     *
     * @param array $inspectionData 検査データ(1項目単位)
     * @param array $calcKey 集計用キー
     * @param array $statistics 統計データ配列
     * @return void
     */
    protected function setStatisticsDataMulti(array $inspectionData, array $calcKey, array &$statistics)
    {
        // キーを連結して作成する。
        $tmpArray = [];
        foreach ($calcKey as $tmpKey) {
            array_push($tmpArray, $inspectionData[$tmpKey]);
        }
        $key = implode('.', $tmpArray);

        // 統計データに対象項目のキーが無い場合は、項目を作成
        if (!array_key_exists($key, $statistics)) {
            $statistics[$key] = [
                'max' => '',
                'data' => [],
                'min' => '',
                'itemNo' => $inspectionData['item_no'],
                'saisuiKbnNo' => $inspectionData['saisui_kbn_no'],
                'qualitativeFlg' => $inspectionData['constant_qualitative_flg']
            ];
        }

        // 集計ごとに値を保持
        $tmpData = $inspectionData['inspection_data'];
        if (!is_null($tmpData) && $tmpData !== '') {
            // 集計データ
            array_push(
                $statistics[$key]['data'],
                $tmpData
            );

            // 不足分のデータが存在する場合は設定
            if (is_null($statistics[$key]['saisuiKbnNo']) || $statistics[$key]['saisuiKbnNo'] !== '') {
                $statistics[$key]['saisuiKbnNo'] = $inspectionData['saisui_kbn_no'];
            }

            if (is_null($statistics[$key]['qualitativeFlg']) || $statistics[$key]['qualitativeFlg'] !== '') {
                $statistics[$key]['qualitativeFlg'] = $inspectionData['constant_qualitative_flg'];
            }

            // 対象データが定性データの場合、以降スキップ
            if ($inspectionData['constant_qualitative_flg'] === 2 || is_null($inspectionData['constant_qualitative_flg'])) {
                return;
            }

            // 最大値
            if (
                ($statistics[$key]['max'] === '') ||
                (bccomp($statistics[$key]['max'], $tmpData) === -1)
            ) {
                $statistics[$key]['max'] = $tmpData;
            }

            // 最小値
            if (
                ($statistics[$key]['min'] === '') ||
                (bccomp($statistics[$key]['min'], $tmpData) === 1)
            ) {
                $statistics[$key]['min'] = $tmpData;
            }
        }

        return;
    }

    /**
     * 統計用データ設定(複数項目)
     *
     * @param array $statistics 統計データ配列
     * @return array 統計算出後配列
     */
    protected function calcStatisticsMulti(
        array $statistics
    ): array {
        $retArray = [
            'max' => [],
            'avg' => [],
            'min' => [],
            'count' => [],
            'sum' => []
        ];

        // 集計種類
        $calcType = ['max', 'data', 'min'];

        // 項目単位に処理を実施
        foreach ($statistics as $key => $value) {
            foreach ($calcType as $type) {
                $data = '';
                if ($type === 'data') {
                    // 各種登録値に対する統計処理
                    $dataArray = [
                        'avg' => '',
                        'count' => count($value[$type]),
                        'sum' => ''
                    ];

                    if ($value['qualitativeFlg'] === 1) {
                        $dataArray['avg'] = $this->calcAvg($value[$type]);
                        $dataArray['sum'] = $this->calcSum($value[$type]);
                    }

                    foreach ($dataArray as $calc => $tmpValue) {
                        if ($calc !== 'count') {
                            // 合計数以外は定量データ加工を行ってからデータ登録
                            if ($tmpValue !== '') {
                                // データの加工
                                $this->configureFixedQuantityData(
                                    $value['itemNo'],
                                    $value['saisuiKbnNo'],
                                    $this->reportConfig['dsp_up_limit'],
                                    $this->reportConfig['dsp_low_limit'],
                                    $tmpValue,
                                    $this->pointNo
                                );
                            }
                        }
                        array_push($retArray[$calc], [$tmpValue]);
                    }
                } else {
                    $data = $value[$type];
                    if ($data !== '') {
                        // データの加工
                        $this->configureFixedQuantityData(
                            $value['itemNo'],
                            $value['saisuiKbnNo'],
                            $this->reportConfig['dsp_up_limit'],
                            $this->reportConfig['dsp_low_limit'],
                            $data,
                            $this->pointNo
                        );
                    }
                    array_push($retArray[$type], [$data]);
                }
            }
        }
        return $retArray;
    }

    /**
     * 平均計算(文字列)
     *
     * @param array $calcData 計算対象配列データ
     * @return string 計算結果
     */
    protected function calcAvg(array $calcData): string
    {
        $avg = '';
        $total = '0';

        if (count($calcData) === 0) {
            return $avg;
        }

        $total = $this->calcSum($calcData);
        $avg = bcdiv($total, strval(count($calcData)));

        return $avg;
    }

    /**
     * 合計計算(文字列)
     *
     * @param array $calcData 計算対象配列データ
     * @return string 計算結果
     */
    protected function calcSum(array $calcData): string
    {
        $total = '0';

        if (count($calcData) === 0) {
            return '';
        }

        foreach ($calcData as $data) {
            $total = bcadd($total, $data);
        }

        return $total;
    }

    /**
     * ファイル名 取得：アクモス
     *
     * @param string $saisuiDate 採水年月日
     * @param int $pointNo 地点番号
     * @return string ファイル名
     */
    public function getFileName(): string
    {
        $fileName = '';

        // 報告書タイプごとのファイル名を取得
        switch ($this->reportConfig['report_type']) {
            case 1:  // 霞ヶ浦水源農薬類検査結果表
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                }
                break;

            case 2:  // 霞ヶ浦水源調査結果表（年報）
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYY');
                $pointInfo = $this->commonService->getPointInfo($this->pointNo);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                }
                break;

            case 3:  // 霞ヶ浦水源藻類（年報）
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYY');
                $pointInfo = $this->commonService->getPointInfo($this->pointNo);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                }
                break;

            case 4: // 管理目標全項目検査<10帳票>
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                }
                break;

            case 5:  // 管理目標全項目検査結果書（結果一覧）
            case 18: // 消毒副生成物（目標・要検討）検査結果書（結果一覧) <2帳票>
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYY');
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                }
                break;

            case 6: // 気象状況及び薬品注入率<11帳票>
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYYMM');
                $pointInfo = $this->commonService->getPointInfo($this->pointNo);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                }
                break;

            case 7: // 共同検査（クリプト指標菌）（嫌気性芽胞菌）<2帳票>
            case 8: // 共同検査（管理目標）
            case 9: // 共同検査（管理目標_農薬）
            case 10: // 共同検査（原水）
            case 11: // 共同検査（浄水）（臨時）<4帳票>
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false);
                $pointInfo = $this->commonService->getPointInfo($this->pointNo);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                }
                break;

            case 12: // 共同検査StartY-EndY 値51 項目(OutPutDay)
                //共同検査[画面.年度-2年のYYYY]-[画面.年度のYYYY]値51項目([現在日時のMMDD]).xlsx
                // 各年度を取得する
                $startNendo = strval(intval($this->nendo) - 2);
                // 当日の日付を取得
                $nowDate = date('md');
                // 開始/終了年度を差替え
                $fileName = "{$this->reportConfig['report_name']}.xlsx";
                $fileName = str_replace('StartY', $startNendo, $fileName);
                $fileName = str_replace('EndY', $this->nendo, $fileName);
                $fileName = str_replace('OutPutDay', $nowDate, $fileName);
                break;

            case 13: // 共同検査年報<2帳票>
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYY');
                $pointInfo = $this->commonService->getPointInfo($this->pointNo);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                }
                break;

            case 14: // 施設課用<10帳票>
                //画面.報告書名称_[ggy年M月].xlsx
                //[画面.報告書名称]_[ggy年M月].xlsx
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYYMM');
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                }
                break;

            // case 14: // 施設課用<10帳票>
            case 15: // 臭気原因物質検査結果<17帳票>
                //画面.報告書名称_[ggy年M月].xlsx
                //[画面.報告書名称]_[ggy年M月].xlsx
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYYMM');
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                }
                break;

            case 16: // 処理過程検査結果<21帳票>
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYYMM');
                $pointInfo = $this->commonService->getPointInfo($this->pointNo);
                //★　一部報告書マスタにPointNoの定義がないためと採水地点が紐づかないが問題ないか
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                }
                break;

            case 17: // 消毒副生成物（目標・要検討）検査結果書<10帳票>
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                }
                break;

            case 19: //浄水場用<2帳票>
                if ($this->reportNo == 299) {
                    $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYYMM');
                    if ($this->reportConfig['monthly_list_order'] != 0) {
                        // 月報報告書から出力する場合、番号を付与
                        $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                    } else {
                        $fileName = "{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                    }
                } else {
                    $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYYMMDD');
                    $pointInfo = $this->commonService->getPointInfo($this->pointNo);
                    if ($this->reportConfig['monthly_list_order'] != 0) {
                        // 月報報告書から出力する場合、番号を付与
                        $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                    } else {
                        $fileName = "{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                    }
                }
                break;

            case 20: //浄水水質検査結果書<3帳票>
                //[画面.報告書名称]_[ggy年M月]_[採水地点マスタ.地点名称報告書].xlsx
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false);
                $pointInfo = $this->commonService->getPointInfo($this->pointNo);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                }
                break;

            case 21: // 浄水配水StartY-EndY 値51 項目(OutPutDay)
                //浄水配水[画面.年度-2年のYYYY]-[画面.年度のYYYY]値51項目([現在日時のMMDD]).xlsx
                // 各年度を取得する
                $startNendo = strval(intval($this->nendo) - 2);
                // 当日の日付を取得
                $nowDate = date('md');
                // 開始/終了年度を差替え
                $fileName = "{$this->reportConfig['report_name']}.xlsx";
                $fileName = str_replace('StartY', $startNendo, $fileName);
                $fileName = str_replace('EndY', $this->nendo, $fileName);
                $fileName = str_replace('OutPutDay', $nowDate, $fileName);
                break;

            case 22: //水質検査結果及び概況<17帳票>
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYYMM');
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                }
                break;

            case 23: //生物試験結果書
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false);
                $pointInfo = $this->commonService->getPointInfo($this->pointNo);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                }
                break;

            case 24: //日報（阿見浄水場）
            case 25: //日報（霞ヶ浦浄水場）
            case 26: //日報（関城浄水場）
            case 27: //日報（鹿島浄水場）
            case 28: //日報（新治浄水場）
            case 29: //日報（水海道浄水場）
            case 30: //日報（水戸浄水場）
            case 31: //日報（那珂川浄水場）
            case 32: //日報（利根川浄水場）
            case 33: //日報（鰐川浄水場）
            case 34: //日報（涸沼川浄水場）
                //[画面.報告書名称]_[ggy年M月D日].xlsx
                // 和暦取得
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                }
                break;

            case 35: //週報<2帳票>
            case 36: //週報（工業用水：鹿島浄水場_薬品注入率）
                // DateTimeオブジェクトに変換
                $date = new DateTime($this->saisuiDate);

                // 日を取得（1〜31）
                $day = (int)$date->format('d');

                // 第何週かを計算（1週目は1〜7日）
                $week = floor(($day - 1) / 7) + 1;
                $week_Name = '第' . $week . '週';

                // 和暦取得
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYYMM');
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}_{$week_Name}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}_{$week_Name}.xlsx";
                }
                break;

            case 37: //年報（クリプトスポリジウム等）<3帳票>
                //年報（クリプトスポジウム等）（xxxxxx）_[ggy]年.xlsx
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYY');
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                }
                break;

            case 38: //年報（基準項目検査結果表）
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYY');
                $pointInfo = $this->commonService->getPointInfo($this->pointNo);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_年報（基準項目検査結果表）_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                } else {
                    $fileName = "年報（基準項目検査結果表）_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                }
                break;

            case 39: //年報（取水原水水質検査）
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYY');
                $pointInfo = $this->commonService->getPointInfo($this->pointNo);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_年報（取水原水水質検査）_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                } else {
                    $fileName = "年報（取水原水水質検査）_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                }
                break;

            case 40: //年報（取水原水全項目検査結果）<3帳票>
            case 41: //年報（処理過程）<59帳票>
            case 42: //年報（水質管理目標設定項目（全項目）検査結果）<4帳票>
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYY');
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                }
                break;

            case 43: //年報（水質管理目標設定項目検査結果表）
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYY');
                $pointInfo = $this->commonService->getPointInfo($this->pointNo);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_年報（水質管理目標設定項目検査結果表）_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                } else {
                    $fileName = "年報（水質管理目標設定項目検査結果表）_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                }
                break;

            case 44: //年報（藻類）
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYY');
                $pointInfo = $this->commonService->getPointInfo($this->pointNo);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_年報（藻類）_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                } else {
                    $fileName = "年報（藻類）_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                }
                break;

            case 45: //年報（農薬類）
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYY');
                $pointInfo = $this->commonService->getPointInfo($this->pointNo);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_年報（農薬類）_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                } else {
                    $fileName = "年報（農薬類）_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                }
                break;

            case 46: //年報（要検討項目）<4帳票>
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYY');
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                }
                break;

            case 47: //要検討項目検査結果書（ミクロキスチン）<10帳票>
            case 49: //要検討項目検査結果書（浄水場）<10帳票>
                //★画面：報告書名称のパラメータが不明のため暫定
                // [画面.報告書名称]([採水地点マスタ.地点名称報告書])_[ggy年M月d日].xlsx
                // [画面.報告書名称]([採水地点マスタ.地点名称報告書])_[ggy年度].xlsx
                // [画面.報告書名称]([採水地点マスタ.地点名称報告書])_[ggy年M月D日].xlsx
                // [画面.報告書名称]([採水地点マスタ.地点名称報告書])_[ggy年].xlsx
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                }
                break;

            case 48: //要検討項目検査結果書（ミクロキスチン）(結果一覧)
            case 50: //要検討項目検査結果書（結果一覧）<2帳票>
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYY');
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                }
                break;

            case 51: //農薬類検査結果書
            case 53: //原水水質検査結果
            case 54: //取水原水全項目検査結果書
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false);
                $pointInfo = $this->commonService->getPointInfo($this->pointNo);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                }
                break;

            case 52: //嫌気性芽胞菌検査結果書
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYYMM');
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                }
                break;

            case 55: //総トリハロメタン検査結果書<10帳票>
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYYMM');
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}.xlsx";
                }
                break;

            case 56: //3年データ
                $wareki = $this->commonService->warekiConv($this->saisuiDate, false, 'YYYY');
                $pointInfo = $this->commonService->getPointInfo($this->pointNo);
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}_{$wareki}_{$pointInfo[0]->point_report_name}.xlsx";
                }
                break;

            default:
                if ($this->reportConfig['monthly_list_order'] != 0) {
                    // 月報報告書から出力する場合、番号を付与
                    $fileName = "{$this->reportConfig['monthly_list_order']}_{$this->reportConfig['report_name']}.xlsx";
                } else {
                    $fileName = "{$this->reportConfig['report_name']}.xlsx";
                }
        }

        return $fileName;
    }

    /**
     * 帳票出力時日付チェック
     *
     * @param ?string $value チェック対象文字列
     * @return bool 日付判定結果(true:日付/false:日付以外)
     */
    protected function checkOutputReportDate(?string $value): bool
    {
        // 日付への変換が出来ない場合は、NGとする。
        if (is_null($value) || strtotime($value) == false) {
            return false;
        }

        // YYYY/MM/DD形式以外の文字列の場合は、NGとする。
        if (preg_match('/^\d{4}\/(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])$/', $value) !== 1) {
            return false;
        }

        // 各値が正常な日付である場合、正常とする。
        $tmpValue = explode('/', $value);
        if (!checkdate(intval($tmpValue[1]), intval($tmpValue[2]), intval($tmpValue[0]))) {
            return false;
        }

        return true;
    }

    /**
     * fromArray 自動調整を除外
     * 対象シート->fromArrayになっていたが、第一引数にシートを設定するように変更。
     * ほかの引数はfromArrayと同様
     */
    public function fromArrayNoAutoAdjustmentfromArray($sheet, array $source, mixed $nullValue = null, string $startCell = 'A1', bool $strictNullComparison = false): void
    {
        //    Convert a 1-D array to 2-D (for ease of looping)
        if (!is_array(end($source))) {
            $source = [$source];
        }
        /** @var mixed[][] $source */

        // start coordinate
        [$startColumn, $startRow] = Coordinate::coordinateFromString($startCell);
        $startRow = (int) $startRow;

        // Loop through $source
        if ($strictNullComparison) {
            foreach ($source as $rowData) {
                /** @var string */
                $currentColumn = $startColumn;
                foreach ($rowData as $cellValue) {
                    if ($cellValue !== $nullValue) {
                        /** @var string $currentColumn */
                        $sheet->getCell($currentColumn . $startRow)->setValueExplicit($cellValue);
                    }
                    /** @var string $currentColumn */
                    ++$currentColumn;
                }
                ++$startRow;
            }
        } else {
            foreach ($source as $rowData) {
                $currentColumn = $startColumn;
                foreach ($rowData as $cellValue) {
                    if ($cellValue != $nullValue) {
                        /** @var string $currentColumn */
                        $sheet->getCell($currentColumn . $startRow)->setValueExplicit($cellValue);
                    }
                    /** @var string $currentColumn */
                    ++$currentColumn;
                }
                ++$startRow;
            }
        }

        // return $this;
    }
}
