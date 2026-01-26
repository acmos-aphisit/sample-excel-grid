/**
 * トレンドステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】トレンド
import * as AtomTrend from "../../stores/atomTrendModal";

// コンテナーコンポネント
export const TrendModalStateContainer = () => {
    const [useTrendSearchCond, setTrendSearchCond] = useAtom(AtomTrend.trendSearchCondState);      // 検索条件アトム
    const [useIsOpen, setIsOpen] = useAtom(AtomTrend.isOpen);                                      // トレンド開閉

    // ステート管理のプロパティ
    const confirmDialog = {
        useTrendSearchCond,
        setTrendSearchCond,
        useIsOpen,
        setIsOpen
    };

    return confirmDialog;
};