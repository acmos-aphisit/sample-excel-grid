<?php
// 定数設定用ファイル
return [
    // API HTTP レスポンスコード
    'HTTP_STATUS_OK'                    => 200,
    'HTTP_STATUS_CREATED'               => 201,
    'HTTP_STATUS_NO_CONTENT'            => 204,
    'HTTP_STATUS_BAD_REQUEST'           => 400,
    'HTTP_STATUS_UNAUTHORIZED'          => 401,
    'HTTP_STATUS_FORBIDDEN'             => 403,
    'HTTP_STATUS_NOT_FOUND'             => 404,
    'HTTP_STATUS_CONFLICT'              => 409,
    'HTTP_STATUS_UNPROCESSABLE_ENTITY'  => 422,
    'HTTP_STATUS_INTERNAL_SERVER_ERROR' => 500,

    // 登録排他確認結果
    'INSERT_NO_ERROR'                   => 0,   // 新規登録成功
    'UPDATE_NO_ERROR'                   => 0,   // 更新成功
    'DELETE_NO_ERROR'                   => 0,   // 削除成功
    'INSERT_NEW_ERROR'                  => 1,   // 新規登録失敗（エラー）
    'UPDATE_NO_DATA_ERROR'              => 2,   // 更新する時、登録データなし（エラー）
    'UPDATE_UPDATED_ERROR'              => 3,   // 更新する時、更新データあり（エラー）
    'UPDATE_UPDATED_MASTER_ERROR'       => 5,   // 更新する時、マスタ更新データあり（エラー）
    'DELETE_NO_DATA_ERROR'              => 4,   // 削除する時、登録データなし（エラー）
    'OTHER_ERROR'                       => 9,


    // 宛先自動入力
    // ※ 判定値がある場合、並び順は降順で並び下さい。
    'DESTINATION_CONST' => [
        [
            'processNo' => 20,
            'processName' => '美浦村',
            'desAddress' => [],     // 判定なければ、DBからの最新データを使用
            'desCity' => ['美浦村'],
            'desOffice' => ['美浦村経済建設部上下水道課'],
        ],
        [
            'processNo' => 21,
            'processName' => 'つくば市',
            'desAddress' => [
                ['date' => '2016/11/16', 'data' => 'つくば市長　市原　健一　殿'],
            ],
            'desCity' => ['つくば市'],
            'desOffice' => ['つくば市生活環境部浄配水場運転管理業務受託者 東芝電機サービス(株)'],
        ],
        [
            'processNo' => 22,
            'processName' => '阿見町',
            'desAddress' => [],     // 判定なければ、DBからの最新データを使用
            'desCity' => ['阿見町'],
            'desOffice' => ['阿見町産業建設部上下水道課'],
        ],
        [
            'processNo' => 23,
            'processName' => '河内町',
            'desAddress' => [
                ['date' => '2021/05/28', 'data' => '河内町長　雜賀　正光　殿'],
            ],
            'desCity' => ['河内町'],
            'desOffice' => ['河内町上下水道課'],
        ],
        [
            'processNo' => 24,
            'processName' => '稲敷市',
            'desAddress' => [
                ['date' => '2018/11/24', 'data' => '稲敷市長　田口　久克　殿'],
            ],
            'desCity' => ['稲敷市'],
            'desOffice' => ['稲敷市上下水道部水道課'],
        ],
        [
            'processNo' => 25,
            'processName' => '守谷市',
            'desAddress' => [
                ['date' => '2016/12/05', 'data' => '守谷市上下水道事業　守谷市長　会田　真一　殿'],
            ],
            'desCity' => ['守谷市'],
            'desOffice' => [''],
        ],
        [
            'processNo' => 26,
            'processName' => '土浦市',
            'desAddress' => [],     // 判定なければ、DBからの最新データを使用
            'desCity' => ['土浦市'],
            'desOffice' => ['土浦市建設部水道課'],
        ],

    ],

    // 月報 日付取得パターン(非統一)
    'MonthlyReportNonUnify' => [
        53,
        23,
        51,
        20,
        14,
        19,
        10,
        11,
        8,
        7,
        9,
        52
    ],

    // 権限
    'security_level' => [
        'kanri_id'  => 1, // 管理用ID
        'gyoumu_id' => 0, // 業務用ID
    ],

    // 所属課番号
    'affiliation_section_no' => [
        'suishitu_center'       => '01', // 水質管理センター
        'kasumigaura_plant'     => '02', // 霞ヶ浦浄水場
        'mito_plant'            => '03', // 水戸浄水場
        'kashima_plant'         => '04', // 鹿島浄水場
        'sekijyou_plant'        => '05', // 関城浄水場
        'tonegawa_plant'        => '06', // 利根川浄水場
        'niihari_plant'         => '07', // 新治浄水場
        'hinumagawa_plant'      => '08', // 涸沼川浄水場
        'mitukaidou_plant'      => '09', // 水海道浄水場
        'wanigawa_plant'        => '10', // 鰐川浄水場
        'ami_plant'             => '11', // 阿見浄水場
        'nakagawa_plant'        => '12', // 那珂川浄水場
        'kigyoukyoku_shisetuka' => '13', // 企業局施設課
        'system_hosyu'          => '99', // システム保守
    ],

    // 報告書分類
    'report_category' => [
        'day_report'     => 0, // 日報
        'week_report'    => 1, // 週報
        'monthly_report' => 2, // 月報
        'year_report'    => 3, // 年報
    ],

    // 登録処理フラグ
    'UPDATE_TIME'           => 1,   // 採水時刻だけ更新処理フラグ
    'UPDATE_DATA'           => 2,   // 入力データだけ更新処理フラグ
    'UPDATE_BOTH'           => 3,   // 採水時刻と入力データ更新処理フラグ

    // トレンド画面用テンプレートファイル
    'TrendTempPath' => env('TREND_TEMP_PATH', ''),

    // 帳票出力用テンプレートファイル 変更前ファイル配置場所
    'OutputTempBkPath' => env('OUTPUT_EXCEL_BACKUP_PATH', ''),

    // 帳票出力用テンプレートファイル
    'OutputTempPath' => resource_path('/excel/outputFormat/'),

    // 帳票一時出力用ディレクトリ
    'OutputTempDir' => base_path('/tmp/'),

    // 和暦変換用
    'WarekiList' => [
        array(
            'date'       => 20190501,
            'year'     => 2018,
            'gengo'    => '令和',
            'gengo_en' => 'R'
        ),
        array(
            'date'       => 19890108,
            'year'     => 1988,
            'gengo'    => '平成',
            'gengo_en' => 'H'
        ),
        array(
            'date'       => 19261225,
            'year'     => 1925,
            'gengo'    => '昭和',
            'gengo_en' => 'S'
        ),
    ],

    // 検索数制限
    'SEARCH_LIMIT'  =>  50000,

    // ↓ 報告書設定用 ↓
    // マスクパターン
    'MaskPattern' => [
        0   =>  "グレーアウト", 
        1   =>  "斜線", 
        2   =>  "点々", 
        3   =>  "黄色", 
    ],

    'ReMaskPattern' => [
        "グレーアウト"   => 0 , 
        "斜線"   => 1 , 
        "点々"   => 2 , 
        "黄色"   => 3 , 
    ],
    
    
    // データシートタイプ
    'DataSheetType' => [
        1   =>  "標準", 
        2   =>  "単拠点", 
        3   =>  "年報", 
        4   =>  "日付", 
        5   =>  "独自-横", 
        6   =>  "独自-縦", 
        7   =>  "独自", 
        99   =>  "手動更新", 
    ],

    // ↑ 報告書設定用 ↑

    // 宛先共同水質
    'atesakiKyoudouSuishitu' => [
        array(
              'startDate' => 19900101
            , 'endDate'   => 20991231
            , 'sityouson' => '土浦市'
            , 'name'      => '土浦市建設部水道課長　殿'
        ),
        array(
              'startDate' => 19900101
            , 'endDate'   => 20991231
            , 'sityouson' => '美浦村'
            , 'name'      => '美浦村長　中島　栄　殿'
        ),
        array(
              'startDate' => 19900101
            , 'endDate'   => 20161116
            , 'sityouson' => 'つくば市'
            , 'name'      => 'つくば市長　市原　健一　殿'
        ),
        array(
              'startDate' => 20161117
            , 'endDate'   => 20991231
            , 'sityouson' => 'つくば市'
            , 'name'      => 'つくば市長　五十嵐　立青　殿'
        ),
        array(
              'startDate' => 19900101
            , 'endDate'   => 20991231
            , 'sityouson' => '阿見町'
            , 'name'      => '阿見町産業建設部上下水道課長　殿'
        ),
        array(
              'startDate' => 19900101
            , 'endDate'   => 20210528
            , 'sityouson' => '河内町'
            , 'name'      => '河内町長　雜賀　正光　殿'
        ),
        array(
              'startDate' => 20210529
            , 'endDate'   => 20991231
            , 'sityouson' => '河内町'
            , 'name'      => '河内町長　野澤　良治　殿'
        ),
        array(
              'startDate' => 19900101
            , 'endDate'   => 20181124
            , 'sityouson' => '稲敷市'
            , 'name'      => '稲敷市長　田口　久克　殿'
        ),
        array(
              'startDate' => 20181125
            , 'endDate'   => 20991231
            , 'sityouson' => '稲敷市'
            , 'name'      => '稲敷市長　筧　信太郎　殿'
        ),
        array(
              'startDate' => 19900101
            , 'endDate'   => 20161205
            , 'sityouson' => '守谷市'
            , 'name'      => '守谷市長　会田　真一　殿'
        ),
        array(
              'startDate' => 20161206
            , 'endDate'   => 20991231
            , 'sityouson' => '守谷市'
            , 'name'      => '守谷市長　松丸　修久　殿'
        ),
    ],

    // 宛先共同水質_事業名
    'atesakiKyoudouSuishituJigyou' => [
        array(
              'sityouson' => '土浦市'
            , 'name'      => ''
        ),
        array(
              'sityouson' => '美浦村'
            , 'name'      => ''
        ),
        array(
              'sityouson' => 'つくば市'
            , 'name'      => ''
        ),
        array(
              'sityouson' => '阿見町'
            , 'name'      => ''
        ),
        array(
              'sityouson' => '河内町'
            , 'name'      => ''
        ),
        array(
              'sityouson' => '稲敷市'
            , 'name'      => ''
        ),
        array(
              'sityouson' => '守谷市'
            , 'name'      => '守谷市上下水道事業'
        ),
    ],

    // 採水区分が固定化される報告書の一覧
    // 年報で[saisui_kbn_no => 2]を使用する可能性あり
    'saisuiKbnList' => [
        // 共同検査（浄水）
        array(
              'report_no' => 400
            , 'saisui_kbn_no'   => 1
        ),
        // 共同検査（原水）
        array(
              'report_no' => 402
            , 'saisui_kbn_no'   => 1
        ),
        // 共同検査（管理目標）
        array(
              'report_no' => 404
            , 'saisui_kbn_no'   => 1
        ),
        // 共同検査（臨時 浄水全項目）
        array(
              'report_no' => 409
            , 'saisui_kbn_no'   => 1
        ),
        // 共同検査（臨時 省略不可能項目）
        array(
              'report_no' => 410
            , 'saisui_kbn_no'   => 1
        ),
        // 共同検査（臨時 任意項目）
        array(
              'report_no' => 412
            , 'saisui_kbn_no'   => 1
        ),
        // 共同検査年報（浄水）
        array(
              'report_no' => 414
            , 'saisui_kbn_no'   => 1
        ),
        // 共同検査年報（原水）
        array(
              'report_no' => 416
            , 'saisui_kbn_no'   => 1
        ),
    ],

    // 縦横タイプ
    'row_type' => 1,    // 縦
    'col_type' => 2,    // 横

    // 自動テンプレート更新用 ベースファイルパス
    'BaseFilePath' => env('BASE_FILE_PATH', ''),

    // テンプレートファイル用 ベースファイル名
    'TmpBaseFileName' => 'base_tmp.xlsx',

    // 独自仕様ありデータシートタイプ
    'dokujiShiyouReportType' => [
        1,
        3,
        5,
        9,
        17,
        18,
        42,
        43,
        44,
        45,
        47,
        50,
        54
    ],

    // 出力位置がずれる報告書
    'reportStartCell' => [
        700 => 'C6',
        701 => 'C6',
        418 => 'F5',
    ],

    // 濃度と指標値のペア 入力画面番号
    'pairDspConfig' => [
        [1800,1802], 
        [1801,1803], 
        [1804,1806], 
        [1805,1807], 
        [1808,1810], 
        [1809,1811], 
    ],

    // 共同検査（管理目標_農薬）_用途一覧（自動テンプレート更新で使用）
    'youtoList' => [
        7014 => '殺菌剤',
        7028 => '殺菌剤',
        7150 => '殺菌剤',
        7160 => '殺菌剤',
        7060 => '殺菌剤',
        7096 => '殺菌剤',
        7074 => '殺菌剤',
        7003 => '殺虫剤',
        7015 => '殺虫剤',
        7126 => '殺虫剤',
        7004 => '殺虫剤',
        7021 => '殺虫剤',
        7053 => '殺虫剤',
        7129 => '殺虫剤',
        7133 => '殺虫剤',
        7047 => '殺虫剤',
        7022 => '殺虫剤',
        7140 => '殺虫剤',
        7010 => '殺虫剤',
        7141 => '殺虫剤',
        7065 => '殺虫剤',
        7095 => '殺虫剤',
        7023 => '殺虫剤',
        7024 => '殺虫剤',
        7070 => '殺虫剤',
        7161 => '殺虫剤',
        7165 => '殺虫剤',
        7166 => '殺虫剤',
        7073 => '殺虫剤',
        7033 => '殺虫剤',
        7056 => '殺虫剤',
        7020 => '殺虫剤、殺菌剤',
        7127 => '殺虫剤、殺菌剤',
        7069 => '殺虫剤、殺菌剤',
        7027 => '殺虫剤、殺菌剤',
        7132 => '殺虫剤、殺菌剤',
        7008 => '殺虫剤、殺菌剤',
        7173 => '殺虫剤、殺菌剤',
        7005 => '殺虫剤、殺菌剤',
        7151 => '殺虫剤、殺菌剤',
        7000 => '殺虫剤、殺菌剤',
        7054 => '殺虫剤、殺菌剤',
        7049 => '殺虫剤、殺菌剤',
        7110 => '殺虫剤、殺菌剤',
        7011 => '殺虫剤、殺菌剤',
        7157 => '殺虫剤、殺菌剤',
        7078 => '殺虫剤、殺菌剤',
        7050 => '殺虫剤、殺菌剤',
        7079 => '殺虫剤、殺菌剤',
        7081 => '殺虫剤、殺菌剤',
        7032 => '殺虫剤、殺菌剤',
        7075 => '殺虫剤、殺菌剤',
        7168 => '殺虫剤、殺菌剤',
        7034 => '殺虫剤、殺菌剤',
        7007 => '殺虫剤、殺菌剤、植物成長調整剤',
        7086 => '殺虫剤、殺菌剤、植物成長調整剤',
        7006 => '殺虫剤、殺菌剤、植物成長調整剤',
        7134 => '殺虫剤、殺菌剤、除草剤',
        7083 => '殺虫剤、殺菌剤、除草剤',
        7100 => '殺虫剤、除草剤',
        7058 => '殺虫剤、除草剤',
        7123 => '除草剤',
        7124 => '除草剤',
        7125 => '除草剤',
        7035 => '除草剤',
        7062 => '除草剤',
        7061 => '除草剤',
        7046 => '除草剤',
        7212 => '除草剤',
        7128 => '除草剤',
        7082 => '除草剤',
        7130 => '除草剤',
        7135 => '除草剤',
        7136 => '除草剤',
        7071 => '除草剤',
        7138 => '除草剤',
        7012 => '除草剤',
        7139 => '除草剤',
        7067 => '除草剤',
        7064 => '除草剤',
        7066 => '除草剤',
        7036 => '除草剤',
        7149 => '除草剤',
        7001 => '除草剤',
        7088 => '除草剤',
        7076 => '除草剤',
        7002 => '除草剤',
        7175 => '除草剤',
        7037 => '除草剤',
        7019 => '除草剤',
        7099 => '除草剤',
        7038 => '除草剤',
        7152 => '除草剤',
        7087 => '除草剤',
        7153 => '除草剤',
        7154 => '除草剤',
        7155 => '除草剤',
        7039 => '除草剤',
        7158 => '除草剤',
        7159 => '除草剤',
        7040 => '除草剤',
        7052 => '除草剤',
        7009 => '除草剤',
        7162 => '除草剤',
        7163 => '除草剤',
        7016 => '除草剤',
        7042 => '除草剤',
        7164 => '除草剤',
        7044 => '除草剤',
        7169 => '除草剤',
        7051 => '除草剤',
        7059 => '除草剤',
        7137 => '除草剤、植物成長調整剤',
        7043 => '除草剤、植物成長調整剤',
        7172 => '代謝物',
    ],
    
    // 最大・最小・平均・件数・合計がいらない帳票
    'calcRemove' => [
        5,
        18,
        40,
        50
    ],

    // 水質検査結果書及び概況 総トリハロメタン 取得先
    // 報告書番号 => [施設番号, 処理過程番号]
    'thmPointList' => [
        98 => ['sisetu' => '9','process' => '31'],
        100 => ['sisetu' => '3','process' => '31'],
        102 => ['sisetu' => '4','process' => '31'],
        104 => ['sisetu' => '11','process' => '31'],
        106 => ['sisetu' => '5','process' => '31'],
        107 => ['sisetu' => '10','process' => '31'],
        109 => ['sisetu' => '8','process' => '31'],
        110 => ['sisetu' => '2','process' => '31'],
        141 => ['sisetu' => '6','process' => '31'],
        143 => ['sisetu' => '7','process' => '31'],
    ],


    'cellOutline' => [
        1812    =>  [
            3090    =>  'outline-green',
            3120    =>  'outline-green',
            3130    =>  'outline-green',
            4270    =>  'outline-blue',
            4280    =>  'outline-blue',
            4290    =>  'outline-blue',
            4300    =>  'outline-blue',
            4310    =>  'outline-blue',
            4320    =>  'outline-blue',
            4330    =>  'outline-blue',
            4340    =>  'outline-blue',
            4350    =>  'outline-blue',
            4360    =>  'outline-blue',
            4370    =>  'outline-blue',
        ],
        1813    =>  [
            3090    =>  'outline-green',
            3120    =>  'outline-green',
            3130    =>  'outline-green',
            4270    =>  'outline-blue',
            4280    =>  'outline-blue',
            4290    =>  'outline-blue',
            4300    =>  'outline-blue',
            4310    =>  'outline-blue',
            4320    =>  'outline-blue',
            4330    =>  'outline-blue',
            4340    =>  'outline-blue',
            4350    =>  'outline-blue',
            4360    =>  'outline-blue',
            4370    =>  'outline-blue',
        ],
        1814    =>  [
            3090    =>  'outline-green',
            3120    =>  'outline-green',
            3130    =>  'outline-green',
            4270    =>  'outline-blue',
            4280    =>  'outline-blue',
            4290    =>  'outline-blue',
            4300    =>  'outline-blue',
            4310    =>  'outline-blue',
            4320    =>  'outline-blue',
            4330    =>  'outline-blue',
            4340    =>  'outline-blue',
            4350    =>  'outline-blue',
            4360    =>  'outline-blue',
            4370    =>  'outline-blue',
        ],
        1815    =>  [
            3090    =>  'outline-green',
            3120    =>  'outline-green',
            3130    =>  'outline-green',
            4270    =>  'outline-blue',
            4280    =>  'outline-blue',
            4290    =>  'outline-blue',
            4300    =>  'outline-blue',
            4310    =>  'outline-blue',
            4320    =>  'outline-blue',
            4330    =>  'outline-blue',
            4340    =>  'outline-blue',
            4350    =>  'outline-blue',
            4360    =>  'outline-blue',
            4370    =>  'outline-blue',
        ],
        1816    =>  [
            3090    =>  'outline-green',
            3120    =>  'outline-green',
            3130    =>  'outline-green',
            4270    =>  'outline-blue',
            4280    =>  'outline-blue',
            4290    =>  'outline-blue',
            4300    =>  'outline-blue',
            4310    =>  'outline-blue',
            4320    =>  'outline-blue',
            4330    =>  'outline-blue',
            4340    =>  'outline-blue',
            4350    =>  'outline-blue',
            4360    =>  'outline-blue',
            4370    =>  'outline-blue',
        ],
        1817    =>  [
            3090    =>  'outline-green',
            3120    =>  'outline-green',
            3130    =>  'outline-green',
            4270    =>  'outline-blue',
            4280    =>  'outline-blue',
            4290    =>  'outline-blue',
            4300    =>  'outline-blue',
            4310    =>  'outline-blue',
            4320    =>  'outline-blue',
            4330    =>  'outline-blue',
            4340    =>  'outline-blue',
            4350    =>  'outline-blue',
            4360    =>  'outline-blue',
            4370    =>  'outline-blue',
        ],
        1818    =>  [
            3090    =>  'outline-green',
            3120    =>  'outline-green',
            3130    =>  'outline-green',
            4270    =>  'outline-blue',
            4280    =>  'outline-blue',
            4290    =>  'outline-blue',
            4300    =>  'outline-blue',
            4310    =>  'outline-blue',
            4320    =>  'outline-blue',
            4330    =>  'outline-blue',
            4340    =>  'outline-blue',
            4350    =>  'outline-blue',
            4360    =>  'outline-blue',
            4370    =>  'outline-blue',
        ],
        1819    =>  [
            3090    =>  'outline-green',
            3120    =>  'outline-green',
            3130    =>  'outline-green',
            4270    =>  'outline-blue',
            4280    =>  'outline-blue',
            4290    =>  'outline-blue',
            4300    =>  'outline-blue',
            4310    =>  'outline-blue',
            4320    =>  'outline-blue',
            4330    =>  'outline-blue',
            4340    =>  'outline-blue',
            4350    =>  'outline-blue',
            4360    =>  'outline-blue',
            4370    =>  'outline-blue',
        ],
        1820    =>  [
            3090    =>  'outline-green',
            3120    =>  'outline-green',
            3130    =>  'outline-green',
            4270    =>  'outline-blue',
            4280    =>  'outline-blue',
            4290    =>  'outline-blue',
            4300    =>  'outline-blue',
            4310    =>  'outline-blue',
            4320    =>  'outline-blue',
            4330    =>  'outline-blue',
            4340    =>  'outline-blue',
            4350    =>  'outline-blue',
            4360    =>  'outline-blue',
            4370    =>  'outline-blue',
        ],
        1821    =>  [
            3090    =>  'outline-green',
            3120    =>  'outline-green',
            3130    =>  'outline-green',
            4270    =>  'outline-blue',
            4280    =>  'outline-blue',
            4290    =>  'outline-blue',
            4300    =>  'outline-blue',
            4310    =>  'outline-blue',
            4320    =>  'outline-blue',
            4330    =>  'outline-blue',
            4340    =>  'outline-blue',
            4350    =>  'outline-blue',
            4360    =>  'outline-blue',
            4370    =>  'outline-blue',
        ],
    ],
];
