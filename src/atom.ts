import { atom } from 'recoil';

// 一覧インターフェース
export interface sampleDataList {
    name: string;                                 // 1
    surname: string;                                 // 2
  }
  
  // 受給者一覧アトム
  export const sampleListState = atom<sampleDataList[]>({
    key: 'sampleDataListState',
    default: [],
  });
