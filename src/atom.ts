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
