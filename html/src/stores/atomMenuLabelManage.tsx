import { atom } from 'jotai';

// メニューラベル管理子画面_表示フラグ
export const menuLabelManageModalFlgState = atom<boolean>(false);

// 
export const dataMenuEdited = atom<any>({ text: '', parentId: '' });

// 管理データ
export interface menuLabelInterface {
    menuLabelMode: string;
    menuLabelNo: string;
    menuLabelName: string;
    menuLabelParent: string;
    menuLabelAffiliation: string;
}
export const defaultMenuLabelState: menuLabelInterface = {
    menuLabelMode: "追加",
    menuLabelNo: "",
    menuLabelName: "",
    menuLabelParent: "",
    menuLabelAffiliation: "",
};
export const menuLabelState = atom<menuLabelInterface>(
    defaultMenuLabelState
);

// 処理実施日時
export const menuLabelDisplayTime = atom<any>();

// 所属課選択肢
export interface selectionAffiliationInterFace {
    label: string; 
    value: string;
};
export const selectionAffiliation = atom<selectionAffiliationInterFace[]>();

// 親ラベル選択肢
export interface selectParentMenuInterFace {
    label: string; 
    value: string;
};
export const selectParentMenu = atom<selectParentMenuInterFace[]>();