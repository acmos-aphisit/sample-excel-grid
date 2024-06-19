import { atom } from 'recoil';

// 一覧インターフェース
export interface sampleDataList {
    itemNo: string;
    name: string;
    age: string;
    gender: string;
    birthDate: Date | undefined;
    birthDateStr: string;
    checkFlg: boolean;
    status: string;
    isOpen: boolean;
  }
  
  // 受給者一覧アトム
  export const sampleListState = atom<any[]>({
    key: 'sampleDataListState',
    default: [],
  });

// カラムアトム
export const sampleColumnListState = atom<any[]>({
  key: 'sampleColumnListState',
  default: [],
});

// 列数
export const dataNumbersState = atom<any>({
  key: 'dataNumbersState',
  default: 31,
});

// 日付
export const dataDateState = atom<Date>({
  key: 'dataDateState',
  default: undefined,
});
