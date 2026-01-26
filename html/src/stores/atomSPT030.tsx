// 汎用アトム
import { atom } from "jotai";

// 管理データ
export interface searchAndSortInterface {
    sortColumn: string;
    sortOrder: string;
    unyouTitle: string;
    unyouDateStt: string;
    unyouDateEnd: string;
    unyouMemo: string;
    unyouBikou: string;
    unyouDspFlg: string;
}
export const defaultSearchAndSortState: searchAndSortInterface = {
    sortColumn: "",
    sortOrder: "ASC",
    unyouTitle: "",
    unyouDateStt: "",
    unyouDateEnd: "",
    unyouMemo: "",
    unyouBikou: "",
    unyouDspFlg: "1",
};
export const searchAndSortState = atom<searchAndSortInterface>(
    defaultSearchAndSortState
);
export const searchAndSortHiddenState = atom<searchAndSortInterface>(
    defaultSearchAndSortState
);

// 検索結果インタフェース
export interface unyouMemoListInterface {
    unyou_id: string;                   // 運用ID
    unyou_title: string;                // タイトル
    unyou_date: string;                 // 作成日
    unyou_memo: string;                 // メモ
    unyou_bikou: string;                // 備考
    file_path: string;                  // 添付ファイル
    dsp_flg: string;                    // 表示フラグ
}

// 検索項目
export const unyouMemoListState = atom<unyouMemoListInterface[]>([]);