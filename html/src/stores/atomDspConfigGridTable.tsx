// 汎用アトム
import { atom } from 'jotai';

// 管理データ
export interface inputDspConfigInterface {
    inputDspMode: string;
    inputDspNo: string;
    inputDspName: string;
    inputDspInspKbnCode: number;
    inputDspInspKbnName: string;
    inputDspPointCnt: string;
    inputDspItemCnt: string;
    inputDspConfFlg: number;
    inputSheetTitle: string;
}
export const defaultInputDspConfigState: inputDspConfigInterface = {
    inputDspMode: "追加",
    inputDspNo: "",
    inputDspName: "",
    inputDspInspKbnCode: null,
    inputDspInspKbnName: "",
    inputDspPointCnt: "",
    inputDspItemCnt: "",
    inputDspConfFlg: null,
    inputSheetTitle: "",
};
export const inputDspConfigState = atom<inputDspConfigInterface>(
    defaultInputDspConfigState
);

// 検査区分選択肢
export const selectInspectKbnState = atom<any>();