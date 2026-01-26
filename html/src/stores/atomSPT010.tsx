// 汎用アトム
import { atom } from "jotai";

// 管理データ
export interface searchAndSortInterface {
    sortColumn: string;
    sortOrder: string;
    infoText: string;
    infoDate: string;
    infoDspFlg: string;
}
export const defaultSearchAndSortState: searchAndSortInterface = {
    sortColumn: "",
    sortOrder: "ASC",
    infoText: "",
    infoDate: "",
    infoDspFlg: "1",
};
export const searchAndSortState = atom<searchAndSortInterface>(
    defaultSearchAndSortState
);

export const searchAndSortHiddenState = atom<searchAndSortInterface>(
    defaultSearchAndSortState
);

// 検索結果インタフェース
export interface oshiraseListInterface {
    info_id: string;                    // お知らせID
    info_text: string;                  // お知らせ内容
    info_date: string;                  // 掲載日
    info_link: string;                  // リンク
    unyou_id: string;                   // 運用ID
    file_path: string;                  // 添付ファイル
    dsp_flg: string;                    // 表示フラグ
}

// 検索項目
export const oshiraseListState = atom<oshiraseListInterface[]>([]);