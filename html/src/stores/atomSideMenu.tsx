import { atom } from "jotai";

// メニュー構成一覧アトム
export const sideMenuListState = atom<any[]>([]);

// 絞り込み検索アトム
export const sideMenuSearchState = atom<string | null | undefined>("");

// 絞り込み検索結果アトム
export const sideMenuSearchListState = atom<any[]>([]);

// サイドメニューのリスト
export const sideMenuLinkListState = atom<any[]>([]);

// サイドメニューのリスト_検査情報登録
export const sideMenuLinkListWqm010State = atom<any[]>([]);

// サイドメニューのリスト_報告書出力
export const sideMenuLinkListWqm030State = atom<any[]>([]);

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
};
export const sideMenuSelectedState = atom<inputSelectedMenu>(
  defaultInputSelectedMenuState
);

export const sideMenuWidthState = atom<number>(400);
