// 汎用アトム
import { atom } from "jotai";
import { SelectOptions } from "../common/interface";

// 検索結果 定義
export interface listType {
  date: string; // 日付
  time: string; // 時刻
  point: string; // 採水地点
  item: string; // 項目
  kbn: string; // 検査区分
  c_data: string; // 定量データ
  q_data: string; // 定性データ
}

// 検索項目
export const listState = atom<listType[]>([]);

// 検索結果_計算 定義
export interface calcType {
  max: string;
  min: string;
  avg: string;
  count: string;
}

export const defaultCalcType: calcType = {
  max: "",
  min: "",
  avg: "",
  count: "",
};

export const calcState = atom<calcType>(defaultCalcType);

// 検索条件
export interface searchCondType {
  date_from: string; // 日付_から
  date_to: string; // 日付_まで
  nendo: string;
  kbn: string; // 検査区分コード
  sisetu: string; // 浄水場(施設)
  cat: string; // 検査種類(大分類)
  process: string; // 処理過程(中分類)
  point_no: string[]; // 詳細箇所(採水地点)
  point_name: string[];
  item_no: string[]; // 検査項目
  item_name: string[];
  order_column: string;
  order_direction: boolean;
  offset: number;
  limit: number;
}

export const defaultSearchCond: searchCondType = {
  date_from: "",
  date_to: "",
  nendo: "",
  kbn: "",
  sisetu: "",
  cat: "",
  process: "",
  point_no: [],
  point_name: [],
  item_no: [],
  item_name: [],
  order_column: "wqm020date",
  order_direction: true,
  offset: 0,
  limit: 1000,
};

// 検索条件
export const searchCondState = atom<searchCondType>(defaultSearchCond);

// 検索条件保持用
export const searchHiddenCondState = atom<searchCondType>(defaultSearchCond);

export const searchClick = atom<boolean>(true);

// スクロール位置用インターフェース
export interface barHeight {
  before: number;
  after: number;
}

// スクロール位置用初期値
export const defaultBarHeight: barHeight = {
  before: 0,
  after: 0,
};

// スクロール位置用アトム
export const barHeightState = atom<barHeight>(defaultBarHeight);

// スクロールフラグ用アトム
export const scrollFlgState = atom<boolean>(true);

export interface ItemOptions {
  label: string;
  value: string;
  flg: string; // 定量定性フラグ
}

// 検索条件部 ↓---------------------------------------------------------------------------------
export const nendoSelect = atom<SelectOptions[]>(); // 年度
export const kbnSelect = atom<SelectOptions[]>(); // 検査区分
export const sisetuSelect = atom<SelectOptions[]>(); // 浄水場(施設)
export const processSelect = atom<SelectOptions[]>(); // 処理過程(中分類)
export const pointSelect = atom<SelectOptions[]>(); // 詳細箇所(採水地点)
export const catSelect = atom<SelectOptions[]>(); // 検査種類(検査項目大分類)
export const itemSelect = atom<ItemOptions[]>(); // 検査項目
// 検索条件部 ↑---------------------------------------------------------------------------------
