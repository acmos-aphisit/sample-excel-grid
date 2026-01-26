/**
 * 編集用のメニューステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】編集用のメニュー
import * as AtomSideEditMenu from "../../stores/atomSideEditMenuModal";

// コンテナーコンポネント
export const SideEditMenuModalStateContainer = () => {
    const [useMenuEdit, setMenuEdit] = useAtom(AtomSideEditMenu.dataMenuEdited);
    const [useSideEditMenuSelected, setSideEditMenuSelected] = useAtom(AtomSideEditMenu.sideEditMenuState);// 編集用のメニュー

    // ステート管理のプロパティ
    const sideEditMenuState = {
        useMenuEdit,
        setMenuEdit,
        useSideEditMenuSelected,
        setSideEditMenuSelected
    };

    return sideEditMenuState;
};