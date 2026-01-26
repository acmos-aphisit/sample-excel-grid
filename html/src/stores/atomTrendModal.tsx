// 汎用アトム
import { atom } from "jotai";
import { SelectOptions } from "../common/interface";

// 折れ線グラフ用インターフェース
export interface LineDataType {
  XAxisName: string;
  [key: string]: string | number | null;
}

// 折れ線グラフ(Line)用インターフェース
export interface LineLayoutData {
  dataKey: string;
  stroke: string;
  strokeWidth: number;
}

export const lineDataState = atom<LineDataType[]>();

const defaultLineLayoutData: LineLayoutData[] = [
  {
    dataKey: "",
    stroke: "",
    strokeWidth: 1,
  },
];

export const lineLayoutState = atom<LineLayoutData[]>();

// 検索項目 定義
export interface trendSearchCondType {
  date_from: string; // 日付
  date_to: string; // 日付
  item_no: string; // 項目No
  item_name: string; // 項目名
  point_no: string[]; // 採水地点
  point_name: string[]; // 採水地点名
  kensa: string; // 検査区分コード
}

// 検索項目 初期値
export const defaultTrendSearchCond: trendSearchCondType = {
  date_from: "",
  date_to: "",
  item_no: "",
  item_name: "",
  point_no: [],
  point_name: [],
  kensa: "",
};

// 仮検索条件 登録画面と検索画面が見れるようになったら、画面から値を引っ張ってくるようにする
// const testTrendSearchCond: trendSearchCondType = {
//   date_from: "",
//   date_to: "2025/06/30",
//   item_no: "1040",
//   item_name: "雨量",
//   point_no: ["1000"],
//   point_name: ["霞ヶ浦浄水場"],
//   // date_from: "2024/04/01",
//   // date_to: "2024/04/30",
//   // item_no: "",
//   // item_name: "",
//   // point_no: ["1000", "1001", "1007", "1006", "1002"],
//   // point_name: ["霞ヶ浦浄水場", "利根川浄水場", "水海道浄水場", "新治浄水場", "阿見浄水場"],
// };

// 検索項目
export const trendSearchCondState = atom<trendSearchCondType>(
  defaultTrendSearchCond
);

export const isOpen = atom<boolean>(false);

export const defautlItemSelect: SelectOptions[] = [];

export const trendItemSelect = atom<SelectOptions[]>(defautlItemSelect);
