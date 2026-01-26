/**
 * 採水項目設定ステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】採水項目設定
import * as AtomInspectionItemSetting from "../../stores/atomInspectionItemSetting";

// コンテナーコンポネント
export const InspectionItemSettingStateContainer = () => {
    const [useInspectionItemManageState, setInspectionItemManageState] = useAtom(AtomInspectionItemSetting.inspectionItemManageState);              // 項目管理データ
    const [useInspectionItemModalFlgState, setInspectionItemModalFlgState] = useAtom(AtomInspectionItemSetting.inspectionItemModalFlgState);        // メニューラベル管理子画面_表示フラグ

    // ステート管理のプロパティ
    const confirmDialog = {
        useInspectionItemManageState,
        setInspectionItemManageState,
        useInspectionItemModalFlgState,
        setInspectionItemModalFlgState
    };

    return confirmDialog;
};