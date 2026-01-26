import { atom } from "jotai";

// メニュー管理子画面_表示フラグ
export const inputMenuManageModalFlgState = atom<boolean>(false);

//
export const dataMenuEdited = atom<any>({ text: "", parentId: "" });

// 管理データ
export interface inputRptInterface {
  inputRptMode: string;
  inputRptNo: string;
  inputRptName: string;
  inputRptParent: string;
  inputRptRef: string;
  inputRptAffiliation: string;
  inputRptMonth: boolean;
  inputRptMonthFlg: boolean;
}
export const defaultInputRptState: inputRptInterface = {
  inputRptMode: "追加",
  inputRptNo: "",
  inputRptName: "",
  inputRptParent: "",
  inputRptRef: "",
  inputRptAffiliation: "",
  inputRptMonth: false,
  inputRptMonthFlg: false,
};
export const inputMenuState = atom<inputRptInterface>(defaultInputRptState);

// 処理実施日時
export const inputRptDisplayTime = atom<any>();
