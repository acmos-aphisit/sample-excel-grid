/**
 * 選択肢設定子画面ステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】選択肢設定子画面
import * as AtomSelectOptionModal from "../../stores/atomSelectOptionSettingModal";

// コンテナーコンポネント
export const SelectOptionStateContainer = () => {
    const [useSelectOptionSettingModalToggleFlg, setSelectOptionSettingModalToggleFlg] = useAtom(AtomSelectOptionModal.selectOptionSettingModalToggleFlg);      // 選択肢設定の子画面開閉フラグ
    const [useSelectOptionItemNo, setSelectOptionItemNo] = useAtom(AtomSelectOptionModal.selectOptionItemNo);                                                   // 選択肢の項目番号
    const [useMng030SearchAndSort, setMng030SearchAndSort] = useAtom(AtomSelectOptionModal.searchAndSortState);                                                 // 検索条件・ソート値

    // ステート管理のプロパティ
    const confirmDialog = {
        useSelectOptionSettingModalToggleFlg,
        setSelectOptionSettingModalToggleFlg,
        useSelectOptionItemNo,
        setSelectOptionItemNo,
        useMng030SearchAndSort,
        setMng030SearchAndSort
    };

    return confirmDialog;
};