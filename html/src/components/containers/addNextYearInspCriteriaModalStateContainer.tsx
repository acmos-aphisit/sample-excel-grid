/**
 * 適用年度追加子画面ステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】適用年度追加子画面
import * as AtomAddNextYearInspCriteriaModal from "../../stores/atomAddNextYearInspCriteriaModal";

// コンテナーコンポネント
export const AddNextYearStateContainer = () => {
    // 適用年度追加子画面
    const [useAddNextYearInspCriteriaModalToggleFlg, setAddNextYearInspCriteriaModalToggleFlg] = useAtom(AtomAddNextYearInspCriteriaModal.addNextYearInspCriteriaModalToggleFlg);
    const [useAddNextYearAvailableFlg, setAddNextYearAvailableFlg] = useAtom(AtomAddNextYearInspCriteriaModal.addNextYearAvailableFlg);

    // ステート管理のプロパティ
    const addNextYear = {
        useAddNextYearInspCriteriaModalToggleFlg,
        setAddNextYearInspCriteriaModalToggleFlg,
        useAddNextYearAvailableFlg,
        setAddNextYearAvailableFlg,
    };

    return addNextYear;
};