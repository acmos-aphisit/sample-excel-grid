/**
 * 運用メモ管理画面ステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】運用メモ管理
import * as atomSpt030 from "../../stores/atomSPT030";

// コンテナーコンポネント
export const Spt030StateContainer = () => {
    const [useUnyouMemo, setUnyouMemo] = useAtom(atomSpt030.unyouMemoListState);                            // 
    const [useSearchAndSortState, setSearchAndSortState] = useAtom(atomSpt030.searchAndSortState);          // 検索条件の管理データ
    const [useSearchAndSortHiddenState, setSearchAndSortHiddenState] = useAtom(atomSpt030.searchAndSortHiddenState);

    // ステート管理のプロパティ
    const spt030State = {
        useUnyouMemo,
        setUnyouMemo,
        useSearchAndSortState,
        setSearchAndSortState,
        useSearchAndSortHiddenState,
        setSearchAndSortHiddenState
    };

    return spt030State;
};