/**
 * お知らせ管理画面ステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】お知らせ管理
import * as atomSpt010 from "../../stores/atomSPT010";

// コンテナーコンポネント
export const Spt010StateContainer = () => {
    const [useOshirase, setOshirase] = useAtom(atomSpt010.oshiraseListState);                                                 // 
    const [useSearchAndSortState, setSearchAndSortState] = useAtom(atomSpt010.searchAndSortState);                            // 
    const [useSearchAndSortHiddenState, setSearchAndSortHiddenState] = useAtom(atomSpt010.searchAndSortHiddenState);          // 

    // ステート管理のプロパティ
    const spt010State = {
        useOshirase,
        setOshirase,
        useSearchAndSortState,
        setSearchAndSortState,
        useSearchAndSortHiddenState,
        setSearchAndSortHiddenState
    };

    return spt010State;
};