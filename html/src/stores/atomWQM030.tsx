// 汎用アトム
import { atom } from "jotai";

// 日付
export interface inputDate {
  inputYear: string;
  inputMonth: string;
  inputDate: string;
}
export const defaultInputDateState: inputDate = {
  inputYear: "",
  inputMonth: "",
  inputDate: "",
};
export const inputMenuDate = atom<inputDate>(defaultInputDateState);

/**
 * 編集データ
 * ※ DBから取得するデータを格納
 *
 */
// 一覧
export interface rowData {
  check_box: boolean;
  input_menu_no: string;
  input_parent_menu_no: number;
  affiliation_section_no: string;
  input_dsp_no: number;
  input_hierarchy: number;
  input_title: string;
  input_order: number;
  label_flg: number;
  insert_date: string;
  insert_user: number;
  update_date: string;
  update_user: number;
}

// // 一覧Atom
// export const wqm030ListDataAtom = atom<wqm030ListData[]>([]);

// ヘッダ部
export interface columnData {
  id: number;
  columnName: string;
  columnTitle: string;
  width: number;
}

// 各データのインタフェース
export interface rowInterface {
  interfaceName: string;
  interfaceType: string;
}

// データグリッドAtom
export const wqm030GridTableAtom = atom({
  columnData: [],
  rowData: [],
  rowInterface: [],
});

// 地点データ
export const wqm010PointData = atom<any[]>();

// 項目データ
export const wqm010ItemData = atom<any[]>();

// 入力データ
export const wqm010Data = atom<any[]>();

/**
 * カレンダー_日付
 * ※ 画面上の処理用
 *
 */
// 変数_データの編集中の日付
export const wqm010SelectedDate = atom<Date | undefined>();

// 配列_カレンダーから選択した日付を格納
export interface wqm010InterfaceEditedDate {
  date: Date;
  editedFlg: boolean;
}
export const wqm010DefaultEditedDate = atom<wqm010InterfaceEditedDate[]>([]);

// ソートデータ
export interface searchAndSortInterface {
    sortColumn: string;
    sortOrder: string;
}
export const defaultSearchAndSortState: searchAndSortInterface = {
    sortColumn: "",
    sortOrder: "ASC",
};
export const searchAndSortState = atom<searchAndSortInterface>(
    defaultSearchAndSortState
);