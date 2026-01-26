/**
 * 入力画面構成マスタステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】入力画面構成マスタ
import * as AtomDspConfigGridTable from "../../stores/atomDspConfigGridTable";

// コンテナーコンポネント
export const DspConfigGridTableStateContainer = () => {
    const [useInputDspConfigState, setInputDspConfigState] = useAtom(AtomDspConfigGridTable.inputDspConfigState);               // 入力画面構成マスタ
    const [useSelectInspectKbnState, setSelectInspectKbnState] = useAtom(AtomDspConfigGridTable.selectInspectKbnState);         // 検査区分選択肢

    // ステート管理のプロパティ
    const confirmDialog = {
        useInputDspConfigState,
        setInputDspConfigState,
        useSelectInspectKbnState,
        setSelectInspectKbnState
    };

    return confirmDialog;
};