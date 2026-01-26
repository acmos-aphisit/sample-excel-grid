// 汎用アトム
import { atom } from "jotai";

// 日時管理ライブラリー
import moment from "moment";

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
// 地点・項目・入力データ_gridTableコンポの引数用
export interface wqm010InterfacePointItemData {
  selectMenuNo: string;
  selectDate: string;
  pointData: any;
  itemData: any;
  inputData: any;
  inputMask: any;
  inspectCriteria: any;
  inspectCriteriaDataKbnCorrection: any;
  criteriaCorrection: any;
  cellOutline: any;
}
export const wqm010DefaultPointItemData: wqm010InterfacePointItemData = {
  selectMenuNo: "",
  selectDate: "",
  pointData: [],
  itemData: [],
  inputData: [],
  inputMask: [],
  inspectCriteria: [],
  inspectCriteriaDataKbnCorrection: [],
  criteriaCorrection: [],
  cellOutline: [],
};
export const wqm010PointItemData = atom<wqm010InterfacePointItemData>(
  wqm010DefaultPointItemData
);
export const wqm010InputData = atom<wqm010InterfacePointItemData>(
  wqm010DefaultPointItemData
);

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

// 処理実施日時
export const wqm010DisplayTime = atom<string>(
  moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS")
);
