import { atom } from 'jotai';

// 日時管理ライブラリー
import moment from "moment";

// モダール開閉フラグ
export const selectOptionSettingModalToggleFlg = atom<boolean>(false);

// 対象の選択肢項目
export const selectOptionItemNo = atom<String>("");

// 検索条件
export interface searchAndSortInterface {
    itemNo: string;
    itemDspName: string;
    sortColumn: string;
    sortOrder: string;
}
export const defaultSearchAndSortState: searchAndSortInterface = {
    itemNo: "",
    itemDspName: "",
    sortColumn: "",
    sortOrder: "ASC",
};
export const searchAndSortState = atom<searchAndSortInterface>(
    defaultSearchAndSortState
);

// 検索結果インタフェース
export interface selectOptionListInterface {
    itemDspName: string;            // 項目番号
    selectionNo: string;            // 選択肢番号
    selectionName: string;          // 選択肢
    sortValue: string;              // ソート値
}

// 選択肢
export const selectOptionListState = atom<selectOptionListInterface[]>([]);
export const selectOptionRegisterState = atom<selectOptionListInterface[]>([]);

// 登録フラグ
export const selectOptionRegisterFlgState = atom<boolean>(false);

// 入力前に戻るフラグ
export const backToInitFlg = atom<boolean>(false);

// 取消フラグ
export const discardDataFlg = atom<boolean>(false);

// 処理実施日時
export const selectOptionDisplayTime = atom<string>(moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS"));