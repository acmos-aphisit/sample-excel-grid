import { atom } from 'recoil';

// 一覧インターフェース
export interface sampleDataList {
    name: string;
    surname: string;
    age: string;
    gender: string;
    birthDate: Date | undefined;
    birthDateStr: string;
    checkFlg: boolean;
    status: string;
    isOpen: boolean;
  }
  
  // 受給者一覧アトム
  export const sampleListState = atom<sampleDataList[]>({
    key: 'sampleDataListState',
    default: [],
  });
