// 汎用アトム
import { atom } from "jotai";

// ヘッダータイトル用
export const headerTitleState = atom<string>("");

// メッセージ用
export interface message {
  level: string;
  message: string;
}
export const messageState = atom<message[]>([]);

export const modalMessageState = atom<message[]>([]);

export const messageMutiLineState = atom<message[]>([]);

// ローディング用
export const loadingState = atom<boolean>(false);

export const modalloadingState = atom<boolean>(false);

// ユーザ情報用
export interface userType {
  agree_flg: boolean;
  agree_note: string;
  tel_no: string;
  is_login: string;
}
export const defaultUserState: userType = {
  agree_flg: false,
  agree_note: "",
  tel_no: "",
  is_login: "",
};
export const userState = atom<userType>(defaultUserState);

// パス情報state
export const locationState = atom<string>("");

// 帳票用
export const reportState = atom<string>("");

// 選択画面メニュー
export const inputMenuSelected = atom<string>("");

// 日付
export interface inputDate {
  inputYear: string;
  inputMonth: string;
  inputDate: string;
}
export const defaultInputDateState: inputDate = {
  inputYear: "",
  inputMonth: "",
  inputDate: "",
};
export const inputMenuDate = atom<inputDate>(defaultInputDateState);

// サイドメニューの広さ
export const sideMenuWidth = atom<number>(400);

// 異常値一覧モダールの開閉フラグ
export const outlinerModalShowBtn = atom<boolean>(false);

export const outlinerModalShowFlg = atom<boolean>(false);

export const outlinerModalDataLists = atom<any>();

// 検査情報登録画面_編集状態フラグ
export const inputEditingFlg = atom<boolean>(false);

// 宛先自動入力用の定数値管理ステート
export const destinationConst = atom<any>();

export interface DateType {
  setterName: any;
  outputState: any;
  seirekiName: string;
  selectedName: string;
  index: number;
  YYYY_Name?: string;
}

export interface dspDateType {
  inputDate: string;
  inputFlg: boolean;
}

export const dspDateDefault: dspDateType = {
  inputDate: null,
  inputFlg: false,
};

export const dspDate = atom<dspDateType>(dspDateDefault);

export const listAreaheightState = atom<string | number | boolean>();

export const displayTime = atom<string>("");
