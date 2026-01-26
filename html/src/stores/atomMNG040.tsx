// 汎用アトム
import { atom } from "jotai";

// 日時管理ライブラリー
import moment from "moment";

// データグリッドAtom
export const mng040GridTableAtom = atom({
  columnData: [],
  rowData: [],
  rowInterface: [],
});

// 管理データ
export interface searchAndSortInterface {
    applyYear: string;
    sortColumn: string;
    sortOrder: string;
    itemName: string;
    saisuiKbnNo: string;
    saisuiKbnName: string;
}
export const defaultSearchAndSortState: searchAndSortInterface = {
    applyYear: "2025",
    sortColumn: "",
    sortOrder: "ASC",
    itemName: "",
    saisuiKbnNo: "",
    saisuiKbnName: "",
};
export const searchAndSortState = atom<searchAndSortInterface>(
    defaultSearchAndSortState
);

// 検査項目大分類
export const selectItemDaiCategoryState = atom<any>();

// 検査項目中分類
export const selectItemTyuCategoryState = atom<any>();

// 適用年度
export const selectApplyYearState = atom<any>();

// 採水区分
export const selectSaisuiKbnState = atom<any>();

// データ区分名称
export const selectConstantQualitativeFlgState = atom<any>();

// 入力タイプ
export const selectInputTypeState = atom<any>();

// 有効桁数選択肢
export const selectValidDigitsState = atom<any>();

// 入力最小桁選択肢
export const selectInputDigitsState = atom<any>();

// 出力最小桁選択肢
export const selectOutputDigitsState = atom<any>();

// 登録用のステート
export const inspCriteriaRegistState = atom<any[]>([]);
export const inspCriteriaRegistFlgState = atom<boolean>(false);

// 最新の適用年度
export const latestYear = atom<any>();

// 追加する適用年度
export const addNextYear = atom<any>();

// 処理実施日時
export const mng040DisplayTime = atom<string>(moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS"));