// 汎用アトム
import { atom } from "jotai";

// 日時管理ライブラリー
import moment from "moment";

// データグリッドAtom
export const mng030GridTableAtom = atom({
  columnData: [],
  rowData: [],
  rowInterface: [],
});

// 管理データ
export interface searchAndSortInterface {
    sortColumn: string;
    sortOrder: string;
    itemName: string;
}
export const defaultSearchAndSortState: searchAndSortInterface = {
    sortColumn: "",
    sortOrder: "ASC",
    itemName: ""
};
export const searchAndSortState = atom<searchAndSortInterface>(
    defaultSearchAndSortState
);

// 検査項目大分類
export const selectItemDaiCategoryState = atom<any>();

// 検査項目中分類
export const selectItemTyuCategoryState = atom<any>();

// データ区分名称
export const selectConstantQualitativeFlgState = atom<any>();

// 入力タイプ
export const selectInputTypeState = atom<any>();

// 登録用のステート
export const inspItemRegistState = atom<any[]>([]);
export const inspItemRegistFlgState = atom<boolean>(false);

// 項目番号の最大値
export const maxItemNo = atom<any>();

// 処理実施日時
export const mng030DisplayTime = atom<string>(moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS"));