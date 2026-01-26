import { atom } from 'jotai';

// 日時管理ライブラリー
import moment from "moment";

// お知らせ管理子画面_表示フラグ
export const oshiraseManageModalFlgState = atom<boolean>(false);

// 管理データ
export interface oshiraseManageInterface {
    dataMode: string;
    infoID: string;
    infoDate: string;
    infoText: string;
    infoLink: string;
    unyouId: string;
    infoFile: File;
    infoFilePath: string;
    infoFileName: string;
    infoFileSize: string;
    infoFileExt: string;
    infoDspFlg: string;
    currentShowFileName: string;
    infoRegistFlg: boolean;
    infoClearFileFlg: boolean;
}
export const defaultOshiraseManageState: oshiraseManageInterface = {
    dataMode: "登録",
    infoID: "",
    infoDate: moment(new Date()).format("YYYY-MM-DD"),
    infoText: "",
    infoLink: "",
    unyouId: "",
    infoFile: null,
    infoFilePath: "",
    infoFileName: "",
    infoFileSize: "",
    infoFileExt: "",
    infoDspFlg: "1",
    currentShowFileName: "",
    infoRegistFlg: false,
    infoClearFileFlg: false,
};
export const oshiraseManageState = atom<oshiraseManageInterface>(
    defaultOshiraseManageState
);

// 処理実施日時
export const inputDspDisplayTime = atom<any>();