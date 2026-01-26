// 汎用アトム
import { atom } from "jotai";

// 日時管理ライブラリー
import moment from "moment";

// データグリッドAtom
export const mng010GridTableAtom = atom({
  columnData: [],
  rowData: [],
  rowInterface: [],
});

// 管理データ
export interface searchAndSortInterface {
    sortColumn: string;
    sortOrder: string;
}
export const defaultSearchAndSortState: searchAndSortInterface = {
    sortColumn: "",
    sortOrder: "ASC",
};
export const searchAndSortState = atom<searchAndSortInterface>(
    defaultSearchAndSortState
);

// 所属部
export const selectAffiDeptState = atom<any>();

// 所属課
export const selectAffiSectState = atom<any>();

// 権限
export const selectSecurityLevelState = atom<any>();

// 確定ボタン表示フラグ
export const selectFixFlgState = atom<any>();

// 検索結果 定義
export interface saisuiPointListInterface {
    rowNo: string;                      // 行番号
    pointNo: string;                      // 地点番号
    pointDspName: string;                 // 地点名称画面
    pointReportName: string;              // 地点名称報告書
    saisuiKbnNo: string;                  // 採水区分番号
    saisuiKbnName: string;                // 採水区分名称
    sisetuNo: string;                     // 施設番号
    sisetuName: string;                   // 施設名称
    processNo: string;                    // 処理過程番号
    processName: string;                  // 処理過程名称
}

// 検索項目
export const saisuiPointListState = atom<saisuiPointListInterface[]>([]);

// 採水区分選択肢
export const selectSaisuiKbnState = atom<any>();

// 施設選択肢
export const selectSisetuState = atom<any>();

// 処理過程選択肢
export const selectProcessState = atom<any>();

// 登録用のステート
export const userMasterRegistState = atom<any[]>([]);
export const userMasterRegistFlgState = atom<boolean>(false);

// 採水地点番号の最大値
export const maxSaisuiPoint = atom<any>();

// 所属課マスタ用のステート
export const affiliationInfoState = atom<any[]>([]);

// 処理実施日時
export const mng010DisplayTime = atom<string>(moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS"));