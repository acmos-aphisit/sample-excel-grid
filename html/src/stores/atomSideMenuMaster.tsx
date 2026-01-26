import { atom } from "jotai";

// メニュー構成一覧アトム
export const sideMenuListState = atom<any[]>([]);

// 絞り込み検索アトム
export const sideMenuSearchState = atom<string>("");

// 絞り込み検索結果アトム
export const sideMenuSearchListState = atom<any[]>([]);

//
export const sideMenuMasterListState = atom<any[]>([]);

// 選択したメニューデータアトム
export const sideMenuMasterSelectedState = atom<any>(null);

// 編集用のメニュー
export const sideEditMenuMasterState = atom<any[]>([]);

// 
export const sideMenuWidthState = atom<number>(400);

//
export const sideMenuLinkListState = atom<any[]>([]);

// 選択したメニューデータアトム
export interface inputSelectedMenu {
  selectedMenuNo: string;
  selectedMenuName: string;
  selectedDspNo: string;
  inspectionKbnCode: string;
  report_no: string;
  report_category: string;
  affiliation_section_no: string;
  report_type: string;
  label_flg: boolean;
}
export const defaultInputSelectedMenuState: inputSelectedMenu = {
  selectedMenuNo: "",
  selectedMenuName: "",
  selectedDspNo: "",
  inspectionKbnCode: "",
  report_no: "",
  report_category: "",
  affiliation_section_no: "",
  report_type: "",
  label_flg: false,
};
export const sideMenuSelectedState = atom<inputSelectedMenu>(
  defaultInputSelectedMenuState
);

// 所属課データアトム
export const sideMenuAffiliationState = atom<any[]>([]);

// 親ラベルリストアトム
export const sideMenuLabelParentState = atom<any[]>([]);

// 参照画面リストアトム
export const sideRefMenuState = atom<any[]>([]);

// 順序取替
export interface exchangeMenuOrderInterface {
  curMenuNo: number;
  targetMenuNo: number;
}
export const defaultExchangeMenuOrderState: exchangeMenuOrderInterface = {
  curMenuNo: null,
  targetMenuNo: null,
};
export const exchangeMenuOrderState = atom<exchangeMenuOrderInterface>(
  defaultExchangeMenuOrderState
);

// 削除
export const deleteInputMenuState = atom<any>();
