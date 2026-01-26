/**
 * サイドメニューステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】サイドメニュー
import * as AtomSideMenu from "../../stores/atomSideMenu";

// コンテナーコンポネント
export const SideMenuStateContainer = () => {
    const [useDataSideMenu, setDataSideMenu] = useAtom(AtomSideMenu.sideMenuListState);                                             // サイドリストメニュー_データ
    const [useDataSideMenuLink, setDataSideMenuLink] = useAtom(AtomSideMenu.sideMenuLinkListState);                                 // サイドリストメニュー_データ
    const [useDataSideMenuLinkWqm010, setDataSideMenuLinkWqm010] = useAtom(AtomSideMenu.sideMenuLinkListWqm010State);               // サイドリストメニュー_データ
    const [useDataSideMenuLinkWqm030, setDataSideMenuLinkWqm030] = useAtom(AtomSideMenu.sideMenuLinkListWqm030State);               // サイドリストメニュー_データ
    const [useSideSearchMenu, setDataSideSearchMenu] = useAtom(AtomSideMenu.sideMenuSearchState);                                   // 絞り込み検索ステート
    const [useSideMenuSelected, setSideMenuSelected] = useAtom(AtomSideMenu.sideMenuSelectedState);                                 // 選択したメニューデータアトム
    const [useSideMenuSearchListState, setSideMenuSearchListState] = useAtom(AtomSideMenu.sideMenuSearchListState);                 // 選択したメニューデータアトム
    const [useBarWidth, setBarWidth] = useAtom(AtomSideMenu.sideMenuWidthState);                                                    // サイドメニュー 横幅

    // ステート管理のプロパティ
    const sideMenuState = {
        useDataSideMenu,
        setDataSideMenu,
        useDataSideMenuLink,
        setDataSideMenuLink,
        useDataSideMenuLinkWqm010,
        setDataSideMenuLinkWqm010,
        useDataSideMenuLinkWqm030,
        setDataSideMenuLinkWqm030,
        useSideSearchMenu,
        setDataSideSearchMenu,
        useSideMenuSelected,
        setSideMenuSelected,
        useSideMenuSearchListState,
        setSideMenuSearchListState,
        useBarWidth,
        setBarWidth
    };

    return sideMenuState;
};



