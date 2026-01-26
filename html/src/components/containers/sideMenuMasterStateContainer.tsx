/**
 * サイドメニューマスタステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】サイドメニューマスタ
import * as AtomSideMasterMenu from "../../stores/atomSideMenuMaster";

// コンテナーコンポネント
export const SideMenuMasterStateContainer = () => {
    const [useSideMenuSelected, setSideMenuSelected] = useAtom(AtomSideMasterMenu.sideMenuSelectedState);           // 選択したメニューデータアトム
    const [barWidth, setBarWidth] = useAtom(AtomSideMasterMenu.sideMenuWidthState);                                 // 一覧表の高さ

    // ステート管理のプロパティ
    const sideMenuMaster = {
        useSideMenuSelected,
        setSideMenuSelected,
        barWidth,
        setBarWidth
    };

    return sideMenuMaster;
};