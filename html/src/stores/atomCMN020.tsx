// 汎用アトム
import { atom } from "jotai";

// 管理データ
export interface fetchPaginationInterface {
    perPage: number;
    curPage: number;
    allPage: number;
}
export const defaultFetchPaginationState: fetchPaginationInterface = {
    perPage: 10,
    curPage: 1,
    allPage: 1,
};
export const fetchPaginationState = atom<fetchPaginationInterface>(
    defaultFetchPaginationState
);

export const resultInfoPagination = atom<any>();