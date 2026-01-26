import { atom } from 'jotai';

// メニュー管理子画面_表示フラグ
export const inputMenuManageModalFlgState = atom<boolean>(false);

// 
export const dataMenuEdited = atom<any>({ text: '', parentId: '' });

// 管理データ
export interface inputDspInterface {
    inputDspMode: string;
    inputDspNo: string;
    inputDspName: string;
    inputDspParent: string;
    inputDspRef: string;
    inputDspAffiliation: string;
}
export const defaultInputDspState: inputDspInterface = {
    inputDspMode: "追加",
    inputDspNo: "",
    inputDspName: "",
    inputDspParent: "",
    inputDspRef: "",
    inputDspAffiliation: "",
};
export const inputMenuState = atom<inputDspInterface>(
    defaultInputDspState
);

// 処理実施日時
export const inputDspDisplayTime = atom<any>();