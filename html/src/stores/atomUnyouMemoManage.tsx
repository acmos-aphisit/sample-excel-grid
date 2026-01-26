import { atom } from 'jotai';

// 日時管理ライブラリー
import moment from "moment";

// 運用メモ管理子画面_表示フラグ
export const unyouMemoManageModalFlgState = atom<boolean>(false);

// 管理データ
export interface unyouMemoManageInterface {
    dataMode: string;
    unyouID: string;
    unyouTitle: string;
    unyouDate: string;
    unyouMemo: string;
    unyouBikou: string;
    unyouFile: File;
    unyouFilePath: string;
    unyouFileName: string;
    unyouFileSize: string;
    unyouFileExt: string;
    unyouDspFlg: string;
    currentShowFileName: string;
    infoRegistFlg: boolean;
    infoClearFileFlg: boolean;
}
export const defaultUnyouMemoManageState: unyouMemoManageInterface = {
    dataMode: "登録",
    unyouID: "",
    unyouTitle: "",
    unyouDate: moment(new Date()).format("YYYY-MM-DD"),
    unyouMemo: "",
    unyouBikou: "",
    unyouFile: null,
    unyouFilePath: "",
    unyouFileName: "",
    unyouFileSize: "",
    unyouFileExt: "",
    unyouDspFlg: "1",
    currentShowFileName: "",
    infoRegistFlg: false,
    infoClearFileFlg: false,
};
export const unyouMemoManageState = atom<unyouMemoManageInterface>(
    defaultUnyouMemoManageState
);

// 処理実施日時
export const inputDspDisplayTime = atom<any>();