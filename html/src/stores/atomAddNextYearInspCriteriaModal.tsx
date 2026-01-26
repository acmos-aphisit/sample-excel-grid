import { atom } from 'jotai';

// モダール開閉フラグ
export const addNextYearInspCriteriaModalToggleFlg = atom<boolean>(false);

// 登録用のステート
export interface addNextYearDataInterface {
    latestYear: string;
    addNextYear: string;
    dataRegistState: any[];
}
export const defaultAddNextYearDataState: addNextYearDataInterface = {
    latestYear: "",
    addNextYear: "",
    dataRegistState: [],
};
export const addNextYearDataState = atom<addNextYearDataInterface>(
    defaultAddNextYearDataState
);

// 適用年度追加の可能フラグ
export const addNextYearAvailableFlg = atom<boolean>(true);