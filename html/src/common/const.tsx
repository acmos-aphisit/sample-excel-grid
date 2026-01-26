import { SelectOptions } from "../common/interface";

// ヘッダのボタンメニュー
export const HEADER_BTN_NOTICE = "お知らせ";
export const HEADER_BTN_REGISTER = "検査情報登録";
export const HEADER_BTN_SEARCH = "検査情報検索";
export const HEADER_BTN_EXPORT = "報告書出力";
export const HEADER_BTN_SUPPORT = "サポート";
export const HEADER_BTN_MAINTAIN = "保守";

// ヘッダのボタンメニュー_URL
export const HEADER_URL_NOTICE = /CMN020/;
export const HEADER_URL_REGISTER = /WQM010/;
export const HEADER_URL_SEARCH = /WQM020/;
export const HEADER_URL_EXPORT = /WQM030/;
export const HEADER_URL_SUPPORT = /SPT/;
export const HEADER_URL_MAINTAIN = /MNG/;

// エラータイプ
export const errorType: { [index: string]: string } = {
  "401": "Unauthenticated.",
  "404": "404 error",
  "419": "CSRF token mismatch.",
  "500": "unexpected error",
};

// API HTTP ステータスコード
export const HTTP_STATUS_CODE: { [index: string]: string } = {
  "200": "リクエスト成功",
  "201": "新たにリソースが作成された。",
  "204": "内容無し",
  "400": "リクエスト不正",
  "401": "認証が必要である。",
  "404": "リソース未検出",
  "409": "競合",
  "419": "CSRFトークン一致されてない.",
  "422": "データ型不正",
  "500": "サーバ内部エラー",
};

// DB_テーブル定義
export const TABLE_LISTS = [
  { label: "全て", value: "all_table" },
  { label: "ユーザ定義_【m_user】", value: "m_user" },
  { label: "所属課マスタ_【m_affiliation】", value: "m_affiliation" },
  { label: "入力画面メニュー_【m_input_menu】", value: "m_input_menu" },
  {
    label: "入力画面構成マスタ_【m_input_dsp_config】",
    value: "m_input_dsp_config",
  },
  {
    label: "入力画面構成地点マスタ_【m_input_dsp_point】",
    value: "m_input_dsp_point",
  },
  {
    label: "入力画面構成項目マスタ_【m_input_dsp_item】",
    value: "m_input_dsp_item",
  },
  { label: "入力マスクNマスタ_【m_input_n_mask】", value: "m_input_n_mask" },
  { label: "報告書選択メニュー_【m_report_menu】", value: "m_report_menu" },
  { label: "報告書構成マスタ_【m_report_config】", value: "m_report_config" },
  { label: "報告書地点マスタ_【m_report_point】", value: "m_report_point" },
  { label: "報告書項目マスタ_【m_report_item】", value: "m_report_item" },
  { label: "報告書固定文言マスタ_【m_report_text】", value: "m_report_text" },
  {
    label: "月報報告書一覧_【t_monthly_report_list】",
    value: "t_monthly_report_list",
  },
  { label: "採水地点マスタ_【m_saisui_point】", value: "m_saisui_point" },
  { label: "採水区分マスタ_【m_saisui_kbn】", value: "m_saisui_kbn" },
  {
    label: "施設マスタ_【m_sisetu】",
    value: "m_sisetu",
  },
  {
    label: "処理過程マスタ_【m_process】",
    value: "m_process",
  },
  { label: "検査項目マスタ_【m_inspection_item】", value: "m_inspection_item" },
  { label: "検査区分マスタ_【m_inspection_kbn】", value: "m_inspection_kbn" },
  {
    label: "検査項目大分類マスタ_【m_inspection_dai_category】",
    value: "m_inspection_dai_category",
  },
  {
    label: "検査項目中分類マスタ_【m_inspection_tyu_category】",
    value: "m_inspection_tyu_category",
  },
  { label: "選択肢マスタ_【m_selection】", value: "m_selection" },
  {
    label: "検査基準マスタ_【m_inspection_criteria】",
    value: "m_inspection_criteria",
  },
  { label: "検査結果_【t_inspection_result】", value: "t_inspection_result" },
  {
    label: "入力データ確定日_【t_input_fixed_date】",
    value: "t_input_fixed_date",
  },
  { label: "運用メモ_【t_unyou】", value: "t_unyou" },
  { label: "お知らせ管理_【t_info】", value: "t_info" },
  { label: "統計値マスタ_【m_statistics】", value: "m_statistics" },
];

// 入力データ区分
export const INPUT_DATA_KBN: { [index: number]: string } = {
  1: "text",
  2: "select",
  // 2: "dropdown",
  // 3: "date",
  3: "dateEditor",
  // 4: "time",
  // 4: "timeEditor",
  4: "inputTime",
  5: "textArea",
  6: "combobox",
};

// 入力タイプ
export const INPUT_DATA_KBN_NAME: { [index: number]: string } = {
  1: "テキストボックス",
  2: "セレクトボックス",
  3: "日付",
  4: "時刻",
  5: "テキストエリア",
  6: "コンボボックス",
};

// セルからフォーカスが外れる時、処理がある対象の項目番号
export const FOCUS_OUT_ITEM_NO: number[] = [
  1132, 1155, 1212, 1902, 1903, 1904, 1905,
];

// 計算用の定数値
export const SAISUI_DATE_ITEM_NO: number = 1; // 採水年月日の項目番号
export const SAISUI_TIME_ITEM_NO: number = 2; // 採水時刻の項目番号
export const INPUT_PH_LOW: number = 5.8; // pH値下限値
export const INPUT_PH_UP: number = 8.6; // pH値上限値
export const RANSOU_TYU_CATEGORY_NO: number = 81; // 藍藻類番号：81
export const KEISOU_TYU_CATEGORY_NO: number = 82; // 珪藻類番号：82
export const RYOKUSOU_TYU_CATEGORY_NO: number = 83; // 緑藻類番号：83
export const INSPECTION_DAI_CATEGORY_NOUYAKU: number = 7; // 項目大分類農薬：7

// 折れ線グラフ 色
export const lineColor: { [index: number]: string } = {
  0: "#4692c9",
  1: "#cf504c",
  2: "#55c343",
  3: "#c239d9",
  4: "#b1ad09",
};

// 藻類備考のテンプレート
export const SORUI_NOTES_PATTERN: { [patternNo: number]: string } = {
  1: "",
  2: "沈殿処理水での生物検査結果\n採水時間○：○，濁度○○度\n○○藻類名，○○個/ml，サイズは○μm程度\n○○藻類名，○○個/ml，サイズは○μm程度\n状況 ：（コメント）",
  3: "砂ろ過水での生物検査結果\n採水時間○：○，濁度○○度\n○○藻類名，○○個/mlサイズは○μm程度\n○○藻類名，○○個/ml，サイズは○μm程度\n状況 ：（コメント）",
  4: "沈殿処理水での生物検査結果\n採水時間○：○，濁度○○度\n○○藻類名，○○個/ml，サイズは○μm程度\n○○藻類名，○○個/ml，サイズは○μm程度\n状況 ：（コメント）\n\n砂ろ過水での生物検査結果\n採水時間○：○，濁度○○度\n○○藻類名，○○個/ml，サイズは○μm程度\n○○藻類名，○○個/ml，サイズは○μm程度\n状況 ：（コメント）",
};

// 確定ボタンフラグ
export const CONFIRM_BTN_FLG_LISTS = [
  { label: "非表示", value: "0" },
  { label: "表示", value: "1" },
];

export const CONFIRM_FLG_LISTS = [
  { label: "表示", value: '1' },
  { label: "非表示", value: '0' },
];

export const FLG_OPTIONS = [
  { label: "非表示", value: "0" },
  { label: "表示", value: "1" },
];

/** 報告書分類 選択肢 */
export const rptCategoryOptions = [
  { label: "日報", value: "0" },
  { label: "週報", value: "1" },
  { label: "月報", value: "2" },
  { label: "年報", value: "3" },
];

/** データシートタイプ 選択肢 */
export const dataSheetOptions: SelectOptions[] = [
  { label: "標準", value: "1" },
  { label: "単拠点", value: "2" },
  { label: "年報", value: "3" },
  { label: "日付", value: "4" },
  { label: "独自-横", value: "5" },
  { label: "独自-縦", value: "6" },
  { label: "独自", value: "7" },
  { label: "手動更新", value: "99" },
];

/** マスクパターン 選択肢 */
export const maskPatternOptions = [
  { label: "グレーアウト", value: "0" },
  { label: "斜線", value: "1" },
  { label: "点々", value: "2" },
  { label: "黄色", value: "3" },
];

// 自動様式更新フラグ
export const TEMPLATE_AUTO_UPDATE_FLG_LISTS = [
  { label: "無", value: "0" },
  { label: "有", value: "1" },
];


/** ユーザマスタのヘッダ */
export const MNG010_HEADER_ITEM: { [name: string]: string } = {
  "ユーザID": "user_id",
  "パスワード": "user_password",
  "氏名": "user_name",
  "ふりがな": "user_furigana",
  "所属部": "affiliation_dept",
  "所属課": "affiliation_section_no",
  "権限": "security_level",
  "確定ボタン表示非表示": "fix_flg",
  "登録年月日": "regist_date",
  "終了年月日": "end_date",
};

/** 採水地点設定のヘッダ */
export const MNG020_HEADER_ITEM: { [name: string]: string } = {
  "地点番号": "point_no",
  "地点名称画面": "point_dsp_name",
  "地点名称報告書": "point_report_name",
  "採水区分名称": "saisui_kbn_name",
  "浄水場": "sisetu_name",
  "処理過程": "process_name",
};

/** 検索項目マスタのヘッダ */
export const MNG030_HEADER_ITEM: { [name: string]: string } = {
  "項目番号": "item_no",
  "項目名称画面": "item_dsp_name",
  "項目名称報告書": "item_report_name",
  "単位": "item_unit",
  "データ区分名称": "constant_qualitative_flg",
  "入力タイプ": "input_type",
  "項目大分類名称": "item_dai_category_name",
  "項目中分類名称": "item_tyu_category_name",
  "コメント": "inspection_item_comment",
};

/** 検査基準マスタのヘッダ */
export const MNG040_HEADER_ITEM: { [name: string]: string } = {
  "項目番号": "item_no",
  "項目名称画面": "item_dsp_name",
  "採水区分": "saisui_kbn_no",
  "規制下限値": "regulation_low_limit",
  "規制上限値\n(目標値)": "regulation_up_limit",
  "入力下限値\n(定量下限値)": "input_low_limit",
  "入力上限値": "input_up_limit",
  "帳票下限値": "report_low_limit",
  "帳票上限値": "report_up_limit",
  "有効桁数": "valid_digits",
  "入力最小桁": "input_min_digits",
  "出力最小桁": "output_min_digits",
  "コメント": "insp_criteria_comment",
};

/** 報告書出力のヘッダ */
export const WQM030_HEADER_ITEM: { [name: string]: string } = {
  "状態": "report_status",
  "採水年月日": "saisui_date",
  "採水時刻": "saisui_time",
  "報告書名称": "report_name",
  "ふりがな": "point_report_name",
  "所属部": "item_report_name",
  "所属課": "inspection_kbn_name",
  "権限": "kensa_kbn_code",
  "登録年月日": "report_no",
  "終了年月日": "report_type_name",
};

/** 選択肢設定のヘッダ */
export const SELECTION_OPTION_ITEM: { [name: string]: string } = {
  "選択肢番号": "selection_no",
  "選択肢": "selection_name",
  "順序": "sort_value",
};

/** 所属課 選択肢 */
export const AFFI_DEPT_OPTIONS = [
  { label: "システム保守", value: "システム保守" },
  { label: "茨城県企業局", value: "茨城県企業局" },
];

/** 権限 選択肢 */
export const SECURITY_LEVEL_OPTIONS = [
  { label: "管理用ID", value: 1 },
  { label: "業務用ID", value: 0 },
];

/** 確定ボタン表示フラグ 選択肢 */
export const FIX_FLG_OPTIONS = [
  { label: "表示", value: 1 },
  { label: "非表示", value: 0 },
];

/** データ区分名称 選択肢 */
export const DATA_KBN_NAME_OPTIONS = [
  { label: "定量", value: 1 },
  { label: "定性", value: 2 },
];

/** 入力タイプ 選択肢 */
export const INPUT_TYPE_NAME_OPTIONS = [
  { label: "テキストボックス", value: 1 },
  { label: "セレクトボックス", value: 2 },
  { label: "日付", value: 3 },
  { label: "時刻", value: 4 },
  { label: "テキストエリア", value: 5 },
];

// 統計値置換処理の対象検査区分CD
export const STAT_SUB_KBN = [200, 5000, 7100];

// 対応の濁度地点の番号
// ※ 詳細設計書_WQM010_検査情報登録画面 セル値の自動設定処理シート
export const TARGET_2490_POINT_NO = [141, 142, 143, 144, 145, 146, 147, 152, 153, 154, 165, 166, 167, 168, 174, 175, 176, 177, 185, 186, 187, 194, 195, 196, 197, 198, 205, 206, 207, 216, 217, 223, 224, 238, 239, 240, 304, 305, 311, 4014, 4016, 4018, 4020, 4022, 4024, 4026]

// 運用メモにとってのアップデート可能ファイル拡張子
export const ALLOWED_UNYOU_FILE_EXT = ["pdf","docx","xlsx","jpg", "jpeg", "png"];
export const ALLOWED_UNYOU_FILE_SIZE = 100 * 1024 * 1024;

// 操作マニュアルファイルパス
export const PDF_MANUAL_PATH = '/manual/pdf/manual.pdf';
export const PDF_MANUAL_USER_PATH = '/manual/pdf/manual-user.pdf';
