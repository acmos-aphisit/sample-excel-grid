// 汎用アトム
import { atom } from 'jotai';

/**
 * カレンダー_日付
 * ※ 画面上の処理用
 * 
 */
// 変数_データの編集中の日付
export const sidemenuSelectedDate = atom<string>();

// 現在の開いてるカレンダ―の月
export const sidemenuCurrentMonth = atom<string>();

// 入力データがある日付
export interface sidemenuInterfaceDataExistDate {
  date: string;
}
export const sidemenuDataExistDateLists = atom<sidemenuInterfaceDataExistDate[]>([]);

// 配列_カレンダーから選択した日付を格納
export interface sidemenuInterfaceEditedDate {
  date: string;
  editedFlg: boolean;
}
export const sidemenuStoreEditedDate = atom<sidemenuInterfaceEditedDate[]>([]);