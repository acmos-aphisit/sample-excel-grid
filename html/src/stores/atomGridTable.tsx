import { atom } from 'jotai';

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
export const sampleListState = atom<any[]>([]);

// 受給者一覧アトム
export const dataSaveToDb = atom<any[]>([]);

// カラムアトム
export const sampleColumnListState = atom<any[]>([]);

// 列数
export const dataNumbersState = atom(0);

// 日付
export const dataDateState = atom<Date | undefined>();
export const dataTimeState = atom<Date | undefined>();

// リーレンダリング
export const gridReRendering = atom<number>(0);

// 入力値
export interface gridTableInterfaceButtomInfo {
    saisuiKbnName: string;
    regulationUpLimit: string;
    inputLowLimit: string;
    reportLowLimit: string;
    calUp: string;
    calLow: string;
    calUpLow: string;
    prevInputData: string;
}
export const gridTableDefaultButtomInfo: gridTableInterfaceButtomInfo = {
    saisuiKbnName: '○○',
    regulationUpLimit: '○○',
    inputLowLimit: '○○',
    reportLowLimit: '○○',
    calUp: '○○',
    calLow: '○○',
    calUpLow: '○○～○○',
    prevInputData: '○○',
};
export const gridTableButtomInfo = atom<gridTableInterfaceButtomInfo>(gridTableDefaultButtomInfo);

// データセット（保存する場合）
export const gridTableTempSaveData = atom<any[]>([]);

// フッターの操作リクエスト
export const gridTableFooterBtnClick = atom<string>('');

// 選択座標
export const useCurFocusRow = atom<any>();
export const useCurFocusColumn = atom<any>();

// 入力確定して、次のセルに移動 ※ column：右のセルに移動、row：下のセルに移動
export const wqm010EnterToCell = atom<string>("column");

// 入力データ確定フラグ
export const wqm010InputFixedFlg = atom<boolean>(false);

// 入力データ確定ボタンの表示フラグ
export const wqm010InputFixedBtnFlg = atom<boolean>(false);

// 基準値補正データ
export const gridTablecriteriaCorrectionData = atom<any[]>([]);