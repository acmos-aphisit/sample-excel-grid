// 汎用アトム
import { atom } from "jotai";
import { SelectOptions } from "../common/interface";
import { atomFamily } from "jotai/utils";

interface mng060SelectReportNoType {
  report_no: number;
}
export const mng060SelectReportNo = atom<mng060SelectReportNoType>();

// ↓ GridTable ↓

// GridTable引数用
export interface mng060InterfacePointItemData {
  selectMenuNo: string;
  colData: any;
  rowData: any;
  header: any;
  inputData: any;
  inputMask: any;
  inspectCriteria: any;
}
export const mng060DefaultRptConfigData: mng060InterfacePointItemData = {
  selectMenuNo: "",
  colData: [],
  rowData: [],
  header: [
    { type: "header", text: "報告書番号" },
    { type: "header", text: "報告書名称" },
    { type: "header", text: "報告書タイプ" },
    { type: "header", text: "報告書分類" },
    { type: "header", text: "データシートタイプ" },
    { type: "header", text: "入力画面" },
    { type: "header", text: "地点" },
    { type: "header", text: "項目" },
    { type: "header", text: "マスクパターン" },
    { type: "header", text: "縦開始セル名" },
    { type: "header", text: "横開始セル名" },
    { type: "header", text: "検査区分" },
    { type: "header", text: "上限表示" },
    { type: "header", text: "下限表示" },
    { type: "header", text: "空白表示" },
  ],
  inputData: [],
  inputMask: [],
  inspectCriteria: [],
};
export const mng060DefaultRptItemData: mng060InterfacePointItemData = {
  selectMenuNo: "",
  colData: [],
  rowData: [],
  header: [
    { type: "header", text: "出力項目＼出力位置" },
    { type: "header", text: "出力名称" },
    { type: "header", text: "単位" },
    { type: "header", text: "目標値" },
    { type: "header", text: "基準値" },
    { type: "header", text: "番号" },
    { type: "header", text: "番号名" },
  ],
  inputData: [],
  inputMask: [],
  inspectCriteria: [],
};
export const mng060DefaultPointData: mng060InterfacePointItemData = {
  selectMenuNo: "",
  colData: [],
  rowData: [],
  header: [
    { type: "header", text: "地点名称" },
    { type: "header", text: "出力地点名称" },
  ],
  inputData: [],
  inputMask: [],
  inspectCriteria: [],
};
export const mng060DefaultTextData: mng060InterfacePointItemData = {
  selectMenuNo: "",
  colData: [],
  rowData: [],
  header: [
    { type: "header", text: "地点名称" },
    { type: "header", text: "出力位置セル名" },
    { type: "header", text: "区分" },
    { type: "header", text: "内容" },
    { type: "header", text: "年度" },
    { type: "header", text: "有効期間（開始）" },
    { type: "header", text: "有効期間（終了）" },
  ],
  inputData: [],
  inputMask: [],
  inspectCriteria: [],
};

export const mng060DefaultMonthListData: mng060InterfacePointItemData = {
  selectMenuNo: "",
  colData: [],
  rowData: [],
  header: [
    { type: "header", text: "報告書名称" },
    { type: "header", text: "地点名称" },
    { type: "header", text: "採水日数" },
  ],
  inputData: [],
  inputMask: [],
  inspectCriteria: [],
};

/** 報告書設定用 */
export const mng060RptConfigData = atom<mng060InterfacePointItemData>(
  mng060DefaultRptConfigData
);
/** 検査項目用 */
export const mng060RptItemData = atom<mng060InterfacePointItemData>(
  mng060DefaultRptItemData
);
/** 測定地点用 */
export const mng060RptPointData = atom<mng060InterfacePointItemData>(
  mng060DefaultPointData
);
/** 固定文言用 */
export const mng060RptTextData = atom<mng060InterfacePointItemData>(
  mng060DefaultTextData
);
/** 月報報告書一覧用 */
export const mng060RptMonthListData = atom<mng060InterfacePointItemData>(
  mng060DefaultMonthListData
);

/** 表データ */
export const mng060EditData = atomFamily((key: string) => atom<any[]>([]));

/**
 * セレクトボックス選択肢
 * input_menu:入力画面
 * point:採水地点
 * item:項目
 * inspection_kbn:検査区分
 * report_type:報告書タイプ
 */
export const mng060Options = atomFamily((key: string) =>
  atom<SelectOptions[]>(defautlItemSelect)
);
export const defautlItemSelect: SelectOptions[] = [];
// ↑ GridTable ↑
