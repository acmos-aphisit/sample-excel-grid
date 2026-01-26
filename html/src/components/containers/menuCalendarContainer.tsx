/**
 * サイドメニューのカレンダーステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】サイドメニューのカレンダー
import * as AtomSideMenuCalendar from "../../stores/atomSidemenuCalendar";

// コンテナーコンポネント
export const MenuCalendarStateContainer = () => {
    const [useSidemenuSelectedDate, setSidemenuSelectedDate] = useAtom(AtomSideMenuCalendar.sidemenuSelectedDate);
    const [useStoreEditedData, setStoreEditedData] = useAtom(AtomSideMenuCalendar.sidemenuStoreEditedDate);
    const [useCurrrentMonth, setCurrrentMonth] = useAtom(AtomSideMenuCalendar.sidemenuCurrentMonth);                          // 現在の開いてるカレンダ―の月
    const [useDataExistDateLists, setDataExistDateLists] = useAtom(AtomSideMenuCalendar.sidemenuDataExistDateLists);          // 入力データがある日付

    // ステート管理のプロパティ
    const menuCalendarState = {
        useSidemenuSelectedDate,
        setSidemenuSelectedDate,
        useStoreEditedData,
        setStoreEditedData,
        useCurrrentMonth,
        setCurrrentMonth,
        useDataExistDateLists,
        setDataExistDateLists,
    };

    return menuCalendarState;
};