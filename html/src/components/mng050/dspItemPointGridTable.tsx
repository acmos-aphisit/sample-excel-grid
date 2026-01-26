//【汎用】
import React, { useState, useReducer } from "react";
import { Api, getMessage } from "../../common/api";
import { useAtom, useSetAtom, useAtomValue } from "jotai";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Const from "../../common/const";

// 日時管理ライブラリー
import moment from "moment";

//【セル自動計算】
import * as CellCalculate from "../../common/cellCalculate.tsx";

//【スタイル】グリッドテーブルスタイル
import cssGridTable from "../../scss/common/gridTable.module.scss";

//【ライブラリー】ReactGrid
import {
    ReactGrid,
    Column,
    Row,
    CellChange,
    TextCell,
    DefaultCellTypes,
    CellLocation,
    MenuOption,
    Id,
    SelectionMode,
    DropPosition,
} from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";

//【ステート】汎用
import * as AtomCommon from "../../stores/atom";

//【ステート】入力（登録）_ストア
import * as AtomGridTable from "../../stores/atomGridTable.tsx";

//【ステート】サイドメニューアトム
import * as AtomSideMenu from "../../stores/atomSideMenu";

//【ステート】確認ダイアログ
import * as AtomConfirmDialog from "../../stores/atomConfirmDialog";

//【ステート】カレンダー
import * as AtomSideMenuCalendar from "../../stores/atomSidemenuCalendar";
import * as AtomInspectionItemSetting from "../../stores/atomInspectionItemSetting";
import * as AtomDspConfigGridTable from "../../stores/atomDspConfigGridTable";

//【コンポネント】セレクトボックスセル
import {
    ComboBoxCell,
    ComboBoxCellTemplate,
} from "../common/grid-table-custom-cells/comboBox.cell.tsx";

import { readDataTransferFromClipboard } from "@testing-library/user-event/dist/cjs/utils/index.js";

//【コンポネント】異常値一覧のモダール
import { OutlierListModal } from "../modals/index.ts";
import { input } from "@testing-library/user-event/dist/cjs/event/input.js";

// 属性
interface Props {
    dataGrid?: any;
}

// コンポーネントエクスポート
export var DspItemPointGridTable: React.FC<Props> = function ({ dataGrid }) {
    /**
     * 1.共通ステート設定
     *
     */
    //TODO ########### 画面操作のデータ（編集中）START ###########
    // クエリクライアント_他のコンポネントの関数を実行する為
    const queryClient = useQueryClient();

    // 編集中のデータ（情報取得 ※実際に使えば、DBからの情報）
    const [useEditingData, setEditingData] = useAtom(
        AtomGridTable.sampleListState
    );

    // 地点ヘッダーデータ（情報取得　※実際に使えば、DBからの情報）
    const [columnData, setColumnData] = useAtom(
        AtomGridTable.sampleColumnListState
    );

    //フッターの操作リクエスト
    const [useGridTableFooterBtnClick, setGridTableFooterBtnClick] = useAtom(
        AtomGridTable.gridTableFooterBtnClick
    );

    // 編集状態フラグ
    const [useInputEditingFlg, setInputEditingFlg] = useAtom(
        AtomCommon.inputEditingFlg
    );

    //TODO ########### 画面操作のデータ（編集中）END ###########

    //TODO ########### 子画面操作 START ###########

    // 異常値一覧モダールの開閉フラグ
    const [useOutlinerModalShowFlg, setOutlinerModalShowFlg] = useAtom(
        AtomCommon.outlinerModalShowFlg
    );
    const [useOutlinerModalDataLists, setOutlinerModalDataLists] = useAtom(
        AtomCommon.outlinerModalDataLists
    );

    //TODO ########### 子画面操作 END ###########

    //TODO ########### 共通コンポネントデータ START ###########

    // カレンダー
    const [useSidemenuSelectedDate, setSidemenuSelectedDate] = useAtom(
        AtomSideMenuCalendar.sidemenuSelectedDate
    );
    const [useStoreEditedData, setStoreEditedData] = useAtom(
        AtomSideMenuCalendar.sidemenuStoreEditedDate
    );

    // 選択したメニューデータアトム
    const [dataSideMenuSelected, setSideMenuSelected] = useAtom(
        AtomSideMenu.sideMenuSelectedState
    );

    //
    const [useOutlinerModalShowBtn, setOutlinerModalShowBtn] = useAtom(
        AtomCommon.outlinerModalShowBtn
    );

    // 処理結果メッセージ
    const [useResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);

    //TODO ########### 共通コンポネントデータ END ###########

    //TODO ########### 画面操作（その他）START ###########

    // 列数
    const [dataNumbersState, setDataNumbersState] = useAtom(
        AtomGridTable.dataNumbersState
    );

    // 日付
    const [dataDateState, setDataDateState] = useAtom(
        AtomGridTable.dataDateState
    );

    // 列参考
    const [useColumnIndex, setColumnIndex] = React.useState<any[]>([]);

    // 行参考
    const [useRowIndex, setRowIndex] = React.useState<any[]>([]);

    // メニューラベル管理子画面_表示フラグ
    const [useInspectionItemModalFlgState, setInspectionItemModalFlgState] = useAtom(AtomInspectionItemSetting.inspectionItemModalFlgState);

    // 入力画面構成マスタ
    const [useInputDspConfigState, setInputDspConfigState] = useAtom(AtomDspConfigGridTable.inputDspConfigState);

    // 項目管理データ
    const [useInspectionItemManageState, setInspectionItemManageState] = useAtom(AtomInspectionItemSetting.inspectionItemManageState);

    //TODO ########### 画面操作（その他）END ###########

    //TODO ########### 画面操作の保持データ（全ての取得したデータ）START ###########

    // 画面保持データ
    const [useTempSaveData, setTempSaveData] = useAtom(
        AtomGridTable.gridTableTempSaveData
    );
    const [focusInfo, setFocusInfo] = React.useState<any>();

    //TODO ########### 画面操作の保持データ（全ての取得したデータ）END ###########

    // 確認ダイアログ設定
    const setDialog = useSetAtom(AtomConfirmDialog.confirmDialogAtom);

    /**
     * ２.カラムヘッダインタフェース設定
     * ※ GridTableにカラム設定用（ヘッダー属性）
     *
     */
    interface ColumnSetting {
        columnId: string;
        columnType: string;
        width: number;
        reorderable: boolean;
        resizable: boolean;
    }
    const [columnSetting, setColumnSetting] = React.useState<ColumnSetting[]>([]); // 例：columnId: "name", columnType: "text", width: 300, reorderable: true, resizable: true
    const [columnSettingInit, setColumnSettingInit] = React.useState<ColumnSetting[]>([]);

    /**
     * ３.ヘッダー情報インタフェース設定
     * ※ 編集データ設定（ヘッダー表示）
     *
     * */
    interface HeaderInfo {
        type: String;
        text: String;
    }
    const [headerInfo, setHeaderInfo] = React.useState<HeaderInfo[]>([]); //　セル種、セルテキスト設定（例：type: "header", text: "利根川取水口"）
    /**
     * ４.初期表示_初期データを設定
     *
     * */
    const setItemPoint = async () => {
        if (dataGrid.length !== 0) {
            // データクリア
            setEditingData([]); // 編集中のデータ
            setColumnData([]); // 地点ヘッダーデータ
            setColumnSetting([]); // カラム設定（横ヘッダー）
            setHeaderInfo([]); //
            // setInputEditingFlg(false); // 編集状態リセット

            /** カラム作成（縦） */
            let newColumn: {
                dataNo: Number;
                dataId: String;
                dataName: String;
                dataKey: Number;
                dataPointNo: Number;
                dataProcessNo: Number;
            }[] = [];
            setDataNumbersState(dataGrid.pointData.length);

            /**　データ指定（横）  */
            const fetchData = async () => {
                try {
                    // (1)
                    /**
                     * タイトル（列）を生成
                     *
                     */
                    for (let index = 0; index < dataGrid.pointData.length; index++) {
                        newColumn.push({
                            dataNo: index + 1,
                            dataId: "dataNo" + (index + 1),
                            dataName: dataGrid.pointData[index].pointData,
                            dataKey: index,
                            dataPointNo: dataGrid.pointData[index].pointNo,
                            dataProcessNo: dataGrid.pointData[index].processNo,
                        });
                    }
                    setColumnData(newColumn); // 地点ヘッダーデータを設定

                    // (2)
                    // 保持データを取得

                    // (3)
                    /** 一覧表の情報（body） */

                    // 異常値のリストに格納する
                    let newOutlinerObj: any = [];

                    //
                    let setDataGridItemData: any = [];
                    setOutlinerModalShowBtn(false); //

                    // データ編集履歴がない場合
                    // 項目（行）ループ
                    dataGrid.itemData.forEach((item: any, itemKey: number) => {
                        // 地点（列）ループ
                        newColumn.forEach((point: any, pointKey: number) => {
                            let newObj = `data`;
                            let newIsOpenObj = `dataIsOpen`;
                            let newOrderObj = `dataOrder`;
                            item.data[pointKey] = {};
                            item.data[pointKey][newIsOpenObj] = false;
                            item.data[pointKey][newOrderObj] = pointKey;

                            // 無活性
                            let newDisableObj = `dataDisable`;
                            item.data[pointKey][newDisableObj] = false;

                            // マスクデータ
                            let newMaskObj = `dataMask`;
                            item.data[pointKey][newMaskObj] = "";

                            // 編集状態フラグ
                            item.data[pointKey][`pointNo`] = point.dataPointNo;
                            item.data[pointKey][`pointName`] = point.dataName;
                            item.data[pointKey][`handleEditData`] = false; // DB格納値から入力値が変更されたフラグ
                            item.data[pointKey][`constantQualitativeFlg`] =
                                item.constantQualitativeFlg; // 異常値有無フラグ
                            item.data[pointKey][`proccessNo`] = point.dataProcessNo; // 処理過程番号

                            // テキスト
                            item.data[pointKey][newObj] = (item.itemNo < 0) ? point.dataName : "";

                            // マスクデータ
                            const findInputMask: any = dataGrid.inputMask.find(
                                (mask) =>
                                    item.itemNo == mask.item_no &&
                                    point.dataPointNo == mask.point_no
                            );
                            if (findInputMask) {
                                item.data[pointKey][newDisableObj] = true;
                                item.data[pointKey][newMaskObj] = "*****";
                            }
                        });
                    });

                    // 加工データ設定
                    setDataGridItemData = dataGrid.itemData;

                    if (newOutlinerObj.length > 0) {
                        setOutlinerModalDataLists(newOutlinerObj);
                        setOutlinerModalShowBtn(true);
                    }

                    // 編集中のデータ
                    setEditingData(setDataGridItemData);

                    // (4)
                    /** 項目（行）、地点（列）、入力データを設定 */
                    let setColumnObj: ColumnSetting[] = [
                        {
                            columnId: "name",
                            columnType: "text",
                            width: columnSetting.length > 0 ? columnSetting[0].width : 300,
                            reorderable: false,
                            resizable: true,
                        },
                    ];
                    let setHeaderObj: HeaderInfo[] = [{ type: "header", text: "" }];

                    newColumn.forEach((columnItem: any) => {
                        setColumnObj.push({
                            columnId: columnItem.dataKey,
                            columnType: "text",
                            width: 200,
                            reorderable: true,
                            resizable: true,
                        });
                        setHeaderObj.push({ type: "header", text: columnItem.dataName });
                    });

                    setColumnSetting(setColumnObj);
                    setColumnSettingInit(setColumnObj);     // 入力前に戻る用の保持
                    setHeaderInfo(setHeaderObj);

                    setRows(
                        setInputDataToGridTable(
                            setDataGridItemData,
                            setHeaderObj,
                            setColumnObj
                        )
                    );

                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };
            fetchData();

            return true;
        }
    };

    // 地点、項目、入力データの更新
    useQuery({
        queryKey: ["dataGrid", dataGrid],
        queryFn: setItemPoint,
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });
    /** カラムが変わる時 */
    const setDataColumnRow = async () => {
        // データクリア
        setColumnSetting([]);
        setHeaderInfo([]);

        let setColumnObj: ColumnSetting[] = [
            {
                columnId: "name",
                columnType: "text",
                width: columnSetting.length > 0 ? columnSetting[0].width : 300,
                reorderable: false,
                resizable: true,
            },
        ];
        let setHeaderObj: HeaderInfo[] = [{ type: "header", text: "" }];

        if (columnSetting.length <= 0 || headerInfo.length <= 0) {
            // 初期化の場合
            columnData.forEach((columnItem: { dataKey: string; dataName: string }) => {
                setColumnObj.push({
                    columnId: columnItem.dataKey,
                    columnType: "text",
                    width: 200,
                    reorderable: true,
                    resizable: true,
                });
                setHeaderObj.push({ type: "header", text: columnItem.dataName });
            });

            setColumnSetting(setColumnObj);
            setHeaderInfo(setHeaderObj);

            setRows(setInputDataToGridTable(useEditingData, setHeaderObj, setColumnObj));
        } else {
            // 更新する場合
            setColumnSetting(columnSetting);
            setHeaderInfo(headerInfo);

            setRows(setInputDataToGridTable(useEditingData, headerInfo, columnSetting));
        }

        return true;
    };

    useQuery({
        queryKey: ["dataColumRow", useEditingData],
        queryFn: setDataColumnRow,
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

    /** 一覧表の情報 (body) を設定 */
    const setInputDataToGridTable = (
        useEditingData: any[],
        headerInfo: any[],
        columnInfo: any[]
    ): Row[] => [
            {
                rowId: "header",
                height: 0,
                cells: headerInfo,
            },
            ...useEditingData.map<Row>((dataItem, idx) => ({
                rowId: idx,
                reorderable: (dataItem.itemNo > 2) ? true : false,
                height: 25,
                cells: columnInfo.map((cell: { columnId: string }, key: number) => {
                    var ret: any = new Object();
                    if (cell.columnId == "name") {
                        /** 縦ヘッダ（項目名） */
                        ret.type = "text";
                        ret.text = dataItem.name;
                        ret.nonEditable = true;

                        const hdrSettingClass: string = (dataItem.itemNo < 0) ? "hdr-item-cell" : "";
                        ret.className = "bg-grid-item " + hdrSettingClass;
                    } else {
                        /** 入力：テクストボックス */
                        let setType: string = "text";
                        let setNonEditable: boolean = true;
                        if ((dataItem.itemNo < 0)) {
                            setType = "combobox";
                            setNonEditable = false;
                            ret.options = dataGrid.saisuiPointData;
                        }
                        ret.type = setType;
                        ret.text = (dataItem.data[key - 1].dataDisable) ? "*****" : (dataItem.data[key - 1].data) ? dataItem.data[key - 1].data : "";
                        ret.nonEditable = setNonEditable;

                        // スタイル設定　※ 縦ヘッダ（項目名）確認
                        if (cell.columnId !== "name") {
                            const hdrSettingClass: string = (dataItem.itemNo < 0) ? "hdr-point-cell" : "";
                            const textAlignClass: string = "";
                            const disabledClass: string = dataItem.data[key - 1].dataDisable
                                ? "disabled-cell"
                                : "";
                            const inputBgClass: string = "";
                            const abnormalClass: string = dataItem.data[key - 1].abnormalData
                                ? " abnormal-cell"
                                : "";
                            ret.className =
                                hdrSettingClass + disabledClass + inputBgClass + abnormalClass + textAlignClass;
                        }
                    }

                    return ret;
                }),
            })),
        ];

    /** 各行のデータステート */
    const [rows, setRows] = React.useState<any>(
        setInputDataToGridTable(useEditingData, headerInfo, columnSetting)
    ); // ReactGridに各行の情報を指定

    /** MACを確認 */
    const isMacOs = () => window.navigator.appVersion.indexOf("Mac") !== -1;

    /**
     * データを更新する処理
     *
     * @param changes  ライブラリーのデータ変更値
     */
    const handleChanges = async (changes: CellChange<any>[]) => {
        if (changes[0].newCell.text !== "*****") {
            // メッセージクリア
            setResultMessage([]);

            // 保持データを設定_初期化
            const newTempData: any = useTempSaveData;
            const findTempData = newTempData.find((item) => {
                return (
                    item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                    item.inputSelectDate == useSidemenuSelectedDate
                );
            });

            if (!findTempData) {
                newTempData.push({
                    inputMenuNo: dataSideMenuSelected.selectedMenuNo,
                    inputSelectDate: useSidemenuSelectedDate,
                    inputEditingData: useEditingData,
                    cellChanges: [[useEditingData, columnData]],
                    cellChangesIndex: 0,
                });
            }

            let newList = [];
            const useEditingDataDeepCopy: any = JSON.parse(JSON.stringify(useEditingData));
            const changedData: any = changes;
            const changedColumnId: Id = changes[0].columnId;
            const changedRowId: Id = changes[0].rowId;

            changes.forEach((changeItem) => {
                let columnIdx = changeItem.columnId;
                let columnType = changeItem.type;
                let dataKey = `${columnIdx}`;

                newList = useEditingDataDeepCopy.map((item, key) => {
                    if (columnType == "combobox") {
                        // コラム名を指定
                        let changedData = changeItem.newCell.text;
                        let previousData = changeItem.previousCell.text;

                        return {
                            ...item,
                            data: item.data.map((innerItem: any, innerIndex: any) => {
                                if (innerIndex == dataKey) {
                                    let editFlgChange: boolean = true;
                                    let changedDataAdj = changedData;

                                    return {
                                        ...innerItem,
                                        data: (item.itemNo < 0) ? changedDataAdj : "",
                                        handleEditData: editFlgChange,
                                        pointNo: (dataGrid.saisuiPointData.find(point => point.label == changedDataAdj)) ? dataGrid.saisuiPointData.find(point => point.label == changedDataAdj).value : "",
                                        pointName: changedDataAdj,
                                        abnormalData: 0,
                                    };
                                } else {
                                    return innerItem;
                                }
                            }),
                        };
                    } else {
                        if (key === changeItem.rowId) {
                            // コラム名を指定
                            let changedData = changeItem.newCell.text;
                            let previousData = changeItem.previousCell.text;

                            // ***** ReactGrid_日付 *****
                            if (columnType == "date") {
                                if (moment(changeItem.newCell.date).format("YYYY").length > 4) {
                                    changedData = null;

                                    // エラーメッセージ表示
                                    const errorInfo: AtomCommon.message[] = [];
                                    errorInfo.push(getMessage(["WQ-0020W", item.name]));
                                    setResultMessage(errorInfo);
                                } else {
                                    changedData = moment(changeItem.newCell.date, "YYYY-MM-DD", true).isValid() ? changeItem.newCell.date : null;
                                }

                                previousData = moment(changeItem.previousCell.date, "YYYY-MM-DD", true).isValid() ? changeItem.previousCell.date : null;

                                // ***** CUSTOMCELL_日付 *****
                            } else if (columnType == "dateEditor") {
                                if (moment(changeItem.newCell.date).format("YYYY").length > 4) {
                                    changedData = null;

                                    // エラーメッセージ表示
                                    const errorInfo: AtomCommon.message[] = [];
                                    errorInfo.push(getMessage(["WQ-0020W", item.name]));
                                    setResultMessage(errorInfo);
                                } else {
                                    changedData = moment(changeItem.newCell.date, "YYYY-MM-DD", true).isValid() ? changeItem.newCell.date : null;
                                }
                                previousData = moment(changeItem.previousCell.date, "YYYY-MM-DD", true).isValid() ? changeItem.previousCell.date : null;

                                // ***** ReactGrid_時刻 *****
                            } else if (columnType == "time") {
                                changedData = moment(changeItem.newCell.time, "YYYY-MM-DD", true).isValid() ? changeItem.newCell.time : null;
                                previousData = moment(changeItem.previousCell.time, "YYYY-MM-DD", true).isValid() ? changeItem.previousCell.time : null;

                                // ***** ReactGrid_ドロップダウン *****
                            } else if (columnType == "dropdown") {

                                // ***** CUSTOMCELL_セレクトボックス *****
                            } else if (columnType == "select") {
                                const getLabel: any = changeItem.newCell.options.find(
                                    (option) => option.value == changeItem.newCell.text
                                );
                                changedData = getLabel ? getLabel.label : "";

                                // ***** CUSTOMCELL_チェックボックス *****
                            } else if (columnType == "checkbox") {
                            }

                            return {
                                ...item,
                                data: item.data.map((innerItem: any, innerIndex: any) => {
                                    if (innerIndex == dataKey) {
                                        let editFlgChange: boolean = true;
                                        let changedDataAdj = changedData;

                                        return {
                                            ...innerItem,
                                            data: changedDataAdj,
                                            handleEditData: editFlgChange,
                                            pointNo: dataGrid.saisuiPointData.find(point => point.label == changedDataAdj).value,
                                            pointName: changedDataAdj,
                                            abnormalData: 0,
                                        };
                                    } else {
                                        return innerItem;
                                    }
                                }),
                            };
                        } else {
                            return item;
                        }
                    }
                });
            });

            // データを変える時、変更履歴ステートに追加する
            // 編集中のデータを設定
            setEditingData(newList);

            // 保持データを設定
            const findTempDataLast = newTempData.find((item) => {
                return (
                    item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                    item.inputSelectDate == useSidemenuSelectedDate
                );
            });

            if (!findTempDataLast) {
                newTempData.push({
                    inputMenuNo: dataSideMenuSelected.selectedMenuNo,
                    inputSelectDate: useSidemenuSelectedDate,
                    inputEditingData: newList,
                    cellChanges: [[newList, columnData]],
                    cellChangesIndex: 0,
                });
            } else {
                newTempData.forEach((item, key) => {
                    if (
                        item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                        item.inputSelectDate == useSidemenuSelectedDate
                    ) {
                        item.inputEditingData = newList;
                        item.cellChanges.push([newList, columnData]);
                        item.cellChangesIndex = item.cellChangesIndex + 1;
                    }
                });
            }

            setTempSaveData(newTempData);

            // カレンダーに編集がある日をメモする
            let newStoreEditedDataObj: any = [];
            useStoreEditedData.forEach((element: any) => {
                newStoreEditedDataObj.push({
                    date: element.date,
                    editedFlg: useSidemenuSelectedDate == element.date ? true : false,
                });
            });

            // 配列
            setStoreEditedData(newStoreEditedDataObj);

            // 編集状態を設定
            setInputEditingFlg(true);
        }
    };

    /**
     * カラムの広さを調整する処理
     *
     * @param getColumnId   　String    カラム名
     * @param width　         Number　  セルの広さ
     */
    const handleColumnResize = (getColumnId: any, setWidth: number) => {
        let newWidth = columnSetting;
        newWidth = newWidth.map((item: any) => {
            if (item.columnId == getColumnId) {
                return {
                    ...item,
                    width: setWidth,
                };
            } else {
                return item;
            }
        });

        setColumnSetting(newWidth);
        setRows(setInputDataToGridTable(useEditingData, headerInfo, columnSetting));
    };

    /** 日本語でのラベルを調整 */
    const customLabels = {
        copyLabel: "コピー",
        cutLabel: "切り取り",
        pasteLabel: "貼り付け",
    };

    /**
     * コンテキストメニュー（コピー・貼り付け・切り取り）
     *
     * @param selectedRowIds   当行の全カラムを選択する行目
     * @param selectedColIds   当カラムの全行を選択するカラム目
     * @param selectionMode    'row' | 'column' | 'range'
     * @param menuOptions      コンテキストメニュー（コピー・貼り付け・切り取り）
     * @param selectedRanges   選択しているセル
     * @returns
     */
    const simpleHandleContextMenu = (
        selectedRowIds: Id[],
        selectedColIds: Id[],
        selectionMode: SelectionMode,
        menuOptions: MenuOption[],
        selectedRanges: Array<CellLocation[]>
    ): MenuOption[] => {
        if (selectedRanges[0]) {
            // 行の項目名を選択する時、行項目を取り外す
            if (
                selectedRanges[0]["0"].columnId == "name" ||
                Object.keys(selectedRanges[0]).length - 1 ==
                Object.keys(useEditingData).length
            ) {
                selectedRanges[0].shift();
            }

            if (
                selectedRanges[0].length == 0 ||
                selectedRanges[0]["0"].columnId == "name"
            ) {
                return (menuOptions = []);
            }
        }

        const rowId: any =
            selectedRanges[0] && typeof selectedRanges[0]["0"] != "undefined"
                ? selectedRanges[0]["0"].rowId
                : null;
        const columnId: any = selectedRanges[0]
            ? selectedRanges[0]["0"].columnId
            : null;
        // const checkMask = (selectedRanges[0]) ? useEditingData[rowId].data[columnId].dataDisable : null;

        return menuOptions;
    };

    /**
     * コンテキスト操作_挿入
     * 
     */
    const insertNewRow = (selectedRowId, position = "上") => {
        // 保持データを設定_初期化
        const newTempData: any = useTempSaveData;
        const findTempData = newTempData.find((item) => {
            return (
                item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                item.inputSelectDate == useSidemenuSelectedDate
            );
        });

        if (!findTempData) {
            newTempData.push({
                inputMenuNo: dataSideMenuSelected.selectedMenuNo,
                inputSelectDate: useSidemenuSelectedDate,
                inputEditingData: useEditingData,
                cellChanges: [[useEditingData, columnData]],
                cellChangesIndex: 0,
            });
        }

        // 編集中のデータを複製
        const useEditingDataDeepCopy = JSON.parse(JSON.stringify(useEditingData));

        let newList = [];
        let initItemData = [];
        useEditingDataDeepCopy.forEach((item, key) => {
            //
            if (item.itemNo == 1) {
                initItemData = item.data
            }

            // 選択している項目の下に挿入
            if (key == (selectedRowId)) {
                if (position == "下") {
                    // 当行を設定
                    newList.push(item);
                }

                // 行を新規挿入
                newList.push({
                    itemNo: null,
                    name: "",
                    reportName: "",
                    constantQualitativeFlg: null,
                    type: item.type,
                    checkFlg: false,
                    status: "",
                    isOpen: false,
                    selectorList: null,
                    data: (initItemData.length > 0) ? initItemData : item.data
                });

                if (position == "上") {
                    // 当行を設定
                    newList.push(item);
                }
            } else {
                newList.push(item);
            }
        });

        setEditingData(newList);
        setInputDspConfigState({
            ...useInputDspConfigState,
            inputDspItemCnt: String(newList.length - 1)
        });

        // 保持データを設定
        const findTempDataLast = newTempData.find((item) => {
            return (
                item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                item.inputSelectDate == useSidemenuSelectedDate
            );
        });

        if (!findTempDataLast) {
            newTempData.push({
                inputMenuNo: dataSideMenuSelected.selectedMenuNo,
                inputSelectDate: useSidemenuSelectedDate,
                inputEditingData: newList,
                cellChanges: [[newList, columnData]],
                cellChangesIndex: 0,
            });
        } else {
            newTempData.forEach((item, key) => {
                if (
                    item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                    item.inputSelectDate == useSidemenuSelectedDate
                ) {
                    item.inputEditingData = newList;
                    item.cellChanges.push([newList, columnData]);
                    item.cellChangesIndex = item.cellChangesIndex + 1;
                }
            });
        }

        setTempSaveData(newTempData);

        // 編集状態を設定
        setInputEditingFlg(true);
        // queryClient.invalidateQueries({ queryKey: ["useInputDspConfigStateUpdate"] });
    }

    /**
     * コンテキスト操作_削除
     * 
     */
    const deleteRow = (selectedRowId) => {
        // 保持データを設定_初期化
        const newTempData: any = useTempSaveData;
        const findTempData = newTempData.find((item) => {
            return (
                item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                item.inputSelectDate == useSidemenuSelectedDate
            );
        });

        if (!findTempData) {
            newTempData.push({
                inputMenuNo: dataSideMenuSelected.selectedMenuNo,
                inputSelectDate: useSidemenuSelectedDate,
                inputEditingData: useEditingData,
                cellChanges: [[useEditingData, columnData]],
                cellChangesIndex: 0,
            });
        }

        // 編集中のデータを複製
        const useEditingDataDeepCopy = JSON.parse(JSON.stringify(useEditingData));

        let newList = [];
        useEditingDataDeepCopy.forEach((item, key) => {
            if (key == selectedRowId) {
                // 当行をスキップ
            } else {
                newList.push(item);
            }
        });

        setEditingData(newList);
        setInputDspConfigState({
            ...useInputDspConfigState,
            inputDspItemCnt: String(newList.length - 1)
        });

        // 保持データを設定
        const findTempDataLast = newTempData.find((item) => {
            return (
                item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                item.inputSelectDate == useSidemenuSelectedDate
            );
        });

        if (!findTempDataLast) {
            newTempData.push({
                inputMenuNo: dataSideMenuSelected.selectedMenuNo,
                inputSelectDate: useSidemenuSelectedDate,
                inputEditingData: newList,
                cellChanges: [[newList, columnData]],
                cellChangesIndex: 0,
            });
        } else {
            newTempData.forEach((item, key) => {
                if (
                    item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                    item.inputSelectDate == useSidemenuSelectedDate
                ) {
                    item.inputEditingData = newList;
                    item.cellChanges.push([newList, columnData]);
                    item.cellChangesIndex = item.cellChangesIndex + 1;
                }
            });
        }

        setTempSaveData(newTempData);

        // 編集状態を設定
        setInputEditingFlg(true);
    }

    /**
     * コンテキスト操作_列の挿入
     * 
     */
    const insertNewColumn = (selectedColumnId) => {
        // 保持データを設定_初期化
        const newTempData: any = useTempSaveData;
        const findTempData = newTempData.find((item) => {
            return (
                item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                item.inputSelectDate == useSidemenuSelectedDate
            );
        });

        if (!findTempData) {
            newTempData.push({
                inputMenuNo: dataSideMenuSelected.selectedMenuNo,
                inputSelectDate: useSidemenuSelectedDate,
                inputEditingData: useEditingData,
                cellChanges: [[useEditingData, columnData]],
                cellChangesIndex: 0,
            });
        }

        // 編集中のデータを複製
        const useEditingDataDeepCopy = JSON.parse(JSON.stringify(useEditingData));

        let newList = [];
        useEditingDataDeepCopy.forEach((item, key) => {
            let newDataObj = [];
            if (selectedColumnId == "name") {
                // 新列を挿入
                newDataObj.push({
                    dataIsOpen: false,
                    dataOrder: 0,
                    dataDisable: false,
                    dataMask: "",
                    pointNo: null,
                    pointName: "",
                    handleEditData: false,
                    constantQualitativeFlg: null,
                    proccessNo: null,
                    data: ""
                });
            }

            item.data.forEach((point, pointKey) => {
                if (selectedColumnId == pointKey) {
                    // 当行を設定
                    newDataObj.push(point);

                    // 新列を挿入
                    newDataObj.push({
                        dataIsOpen: false,
                        dataOrder: 0,
                        dataDisable: false,
                        dataMask: "",
                        pointNo: null,
                        pointName: "",
                        handleEditData: false,
                        constantQualitativeFlg: null,
                        proccessNo: null,
                        data: ""
                    });
                } else {
                    newDataObj.push(point);
                }
            });

            // 当行を設定
            item.data = newDataObj;
            newList.push(item);
        });

        setEditingData(newList);
        setInputDspConfigState({
            ...useInputDspConfigState,
            inputDspPointCnt: String(newList[0].data.length)
        });

        let setNewColumnObj = [];
        columnSetting.forEach(clm => {
            setNewColumnObj.push(clm);
        });

        setNewColumnObj.push({
            columnId: columnSetting.length - 1,
            columnType: "text",
            width: 200,
            reorderable: true,
            resizable: true
        });

        setColumnSetting(setNewColumnObj);

        // 保持データを設定
        const findTempDataLast = newTempData.find((item) => {
            return (
                item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                item.inputSelectDate == useSidemenuSelectedDate
            );
        });

        if (!findTempDataLast) {
            newTempData.push({
                inputMenuNo: dataSideMenuSelected.selectedMenuNo,
                inputSelectDate: useSidemenuSelectedDate,
                inputEditingData: newList,
                cellChanges: [[newList, columnData]],
                cellChangesIndex: 0,
            });
        } else {
            newTempData.forEach((item, key) => {
                if (
                    item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                    item.inputSelectDate == useSidemenuSelectedDate
                ) {
                    item.inputEditingData = newList;
                    item.cellChanges.push([newList, columnData]);
                    item.cellChangesIndex = item.cellChangesIndex + 1;
                }
            });
        }

        setTempSaveData(newTempData);

        // 編集状態を設定
        setInputEditingFlg(true);
    }

    /**
     * コンテキスト操作_列の削除
     * 
     */
    const deleteColumn = (selectedColumnId) => {
        // 保持データを設定_初期化
        const newTempData: any = useTempSaveData;
        const findTempData = newTempData.find((item) => {
            return (
                item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                item.inputSelectDate == useSidemenuSelectedDate
            );
        });

        if (!findTempData) {
            newTempData.push({
                inputMenuNo: dataSideMenuSelected.selectedMenuNo,
                inputSelectDate: useSidemenuSelectedDate,
                inputEditingData: useEditingData,
                cellChanges: [[useEditingData, columnData]],
                cellChangesIndex: 0,
            });
        }

        // 編集中のデータを複製
        const useEditingDataDeepCopy = JSON.parse(JSON.stringify(useEditingData));

        let newList = [];
        useEditingDataDeepCopy.forEach((item, key) => {
            let newDataObj = [];
            item.data.forEach((point, pointKey) => {
                if (selectedColumnId == pointKey) {
                    // 当行をスキップ
                } else {
                    newDataObj.push(point);
                }
            });

            // 当行を設定
            item.data = newDataObj;
        });

        setEditingData(useEditingDataDeepCopy);
        setInputDspConfigState({
            ...useInputDspConfigState,
            inputDspPointCnt: String(useEditingDataDeepCopy[0].data.length)
        });

        let setNewColumnObj = [];
        columnSetting.forEach(clm => {
            setNewColumnObj.push(clm);
        });
        setNewColumnObj.pop();

        setColumnSetting(setNewColumnObj);

        // 保持データを設定
        const findTempDataLast = newTempData.find((item) => {
            return (
                item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                item.inputSelectDate == useSidemenuSelectedDate
            );
        });

        if (!findTempDataLast) {
            newTempData.push({
                inputMenuNo: dataSideMenuSelected.selectedMenuNo,
                inputSelectDate: useSidemenuSelectedDate,
                inputEditingData: newList,
                cellChanges: [[newList, columnData]],
                cellChangesIndex: 0,
            });
        } else {
            newTempData.forEach((item, key) => {
                if (
                    item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                    item.inputSelectDate == useSidemenuSelectedDate
                ) {
                    item.inputEditingData = newList;
                    item.cellChanges.push([newList, columnData]);
                    item.cellChangesIndex = item.cellChangesIndex + 1;
                }
            });
        }

        setTempSaveData(newTempData);

        // 編集状態を設定
        setInputEditingFlg(true);
    }

    /**
     * マスク設定/解除追加
     * 
     */
    const maskSetting = (selectedRanges) => {
        const setRowId = selectedRanges.rowId;
        const setColumnId = selectedRanges.columnId;

        // 保持データを設定_初期化
        const newTempData: any = useTempSaveData;
        const findTempData = newTempData.find((item) => {
            return (
                item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                item.inputSelectDate == useSidemenuSelectedDate
            );
        });

        if (!findTempData) {
            newTempData.push({
                inputMenuNo: dataSideMenuSelected.selectedMenuNo,
                inputSelectDate: useSidemenuSelectedDate,
                inputEditingData: useEditingData,
                cellChanges: [[useEditingData, columnData]],
                cellChangesIndex: 0,
            });
        }

        // 編集中のデータを複製
        const useEditingDataDeepCopy: any = JSON.parse(JSON.stringify(useEditingData));

        let newList = useEditingData;
        newList = [...Object.values(newList)].map((item, key) => {
            if (key === setRowId) {
                // コラム名を指定
                return {
                    ...item,
                    data: item.data.map((innerItem: any, innerIndex: any) => {
                        if (innerIndex == setColumnId) {
                            let editFlgChange: boolean = true;

                            return {
                                ...innerItem,
                                handleEditData: editFlgChange,
                                dataDisable: !innerItem.dataDisable,
                            };
                        } else {
                            return innerItem;
                        }
                    }),
                };
            } else {
                return item;
            }
        });

        setEditingData(newList);

        // 保持データを設定
        const findTempDataLast = newTempData.find((item) => {
            return (
                item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                item.inputSelectDate == useSidemenuSelectedDate
            );
        });

        if (!findTempDataLast) {
            newTempData.push({
                inputMenuNo: dataSideMenuSelected.selectedMenuNo,
                inputSelectDate: useSidemenuSelectedDate,
                inputEditingData: newList,
                cellChanges: [[newList, columnData]],
                cellChangesIndex: 0,
            });
        } else {
            newTempData.forEach((item, key) => {
                if (
                    item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                    item.inputSelectDate == useSidemenuSelectedDate
                ) {
                    item.inputEditingData = newList;
                    item.cellChanges.push([newList, columnData]);
                    item.cellChangesIndex = item.cellChangesIndex + 1;
                }
            });
        }

        setTempSaveData(newTempData);

        // 編集状態を設定
        setInputEditingFlg(true);
    }

    /**
   * 位置確認、上・下移動操作可を設定
   *
   * @param rowId
   */
    const handlerCheckPosition = (rowId: any, columnId: any) => {
        const selectedRowId = rowId;
        const selectedRowData = useEditingData.find((item, key) => key == selectedRowId);

        // 選択しているメニューがあれば、処理実施
        if (selectedRowData) {
            // コンテキストDOMを取得
            // const domContextMenu = document.getElementsByClassName(
            //     "rg-context-menu-option"
            // );
            const countPoint: number = selectedRowData.data.length;
            const domContextMenu = document.querySelectorAll("#MNG050-item-point-grid-table .rg-context-menu-option");

            // 初期化_クリア
            domContextMenu.forEach(ele => {
                ele.classList.remove("disabled");
            });

            // 1番目の項目は上に移動の操作を非活性に設定
            switch (selectedRowData.itemNo) {
                case 1:
                    domContextMenu[0].classList.add("disabled");
                    domContextMenu[1].classList.add("disabled");
                    domContextMenu[2].classList.add("disabled");
                    domContextMenu[5].classList.add("disabled");
                    domContextMenu[6].classList.add("disabled");
                    break;
                case 2:
                    domContextMenu[0].classList.add("disabled");
                    domContextMenu[2].classList.add("disabled");
                    domContextMenu[5].classList.add("disabled");
                    domContextMenu[6].classList.add("disabled");
                    break;

                default:
                    domContextMenu.forEach(ele => {
                        ele.classList.remove("disabled");
                    });
                    break;
            }

            // 項目名称の列削除不可
            if (columnId == "name" && rowId > 0) {
                domContextMenu[4].classList.add("disabled");
            } else if (columnId == "name" && rowId == 0) {
                domContextMenu.forEach(ele => {
                    ele.classList.add("disabled");
                });
            } else {
                // 表示中の列が1件もなくなってしまう場合
                if (countPoint == 1) {
                    domContextMenu[4].classList.add("disabled");
                } else {
                    domContextMenu[4].classList.remove("disabled");
                }
            }


        }
    };

    // コンテキストメニュー（右クリック操作）
    const handlerContextMenu = (
        selectedRowIds: Id[],
        selectedColIds: Id[],
        selectionMode: SelectionMode,

        // コンテキスト設定
        menuOptions: MenuOption[],

        // 選択しているセル範囲
        selectedRanges: Array<CellLocation[]>
    ): MenuOption[] => {
        // 追加位置を取得
        if (selectedRanges.length > 0) {
            handlerCheckPosition(selectedRanges[0][0].rowId, selectedRanges[0][0].columnId);
        }

        menuOptions = [
            {
                id: "row-insert",
                label: "挿入",
                handler: () => {
                    const selectedRowId = selectedRanges[0][0].rowId;
                    insertNewRow(selectedRowId, "上");
                },
            },
            {
                id: "row-insert-below",
                label: "下に挿入",
                handler: () => {
                    const selectedRowId = selectedRanges[0][0].rowId;
                    insertNewRow(selectedRowId, "下");
                },
            },
            {
                id: "row-delete",
                label: "削除",
                handler: () => {
                    // 確認ダイアログ
                    setDialog((prev) => ({
                        ...prev,
                        isOpen: true,
                        cancelBtnName: "いいえ",
                        message: getMessage(["WQ-0003Q"]).message,
                        onConfirm: () => {
                            const selectedRowId = selectedRanges[0][0].rowId;
                            deleteRow(selectedRowId);
                        },
                        onCancel: () => {
                            // 処理なし
                        },
                    }));
                },
            },
            {
                id: "column-insert",
                label: "列の挿入",
                handler: () => {
                    const selectedColumnId = selectedRanges[0][0].columnId;
                    insertNewColumn(selectedColumnId);
                },
            },
            {
                id: "column-delete",
                label: "列の削除",
                handler: () => {
                    // 確認ダイアログ
                    setDialog((prev) => ({
                        ...prev,
                        isOpen: true,
                        cancelBtnName: "いいえ",
                        message: getMessage(["WQ-0003Q"]).message,
                        onConfirm: () => {
                            const selectedColumnId = selectedRanges[0][0].columnId;
                            deleteColumn(selectedColumnId);
                        },
                        onCancel: () => {
                            // 処理なし
                        },
                    }));
                },
            },
            {
                id: "inspection-item-edit",
                label: "検査項目変更",
                handler: () => {
                    const selectedRowId = selectedRanges[0][0].rowId;
                    const getSelectedItem = useEditingData.find((item, key) => key == selectedRowId);

                    setInspectionItemManageState({
                        ...useInspectionItemManageState,
                        selectedItemKey: Number(selectedRowId),
                        selectedItemNo: getSelectedItem.itemNo,
                        selectedItemName: getSelectedItem.name
                    });
                    setInspectionItemModalFlgState(true);
                },
            },
            {
                id: "mask-data-manage",
                label: "マスク設定/削除",
                handler: () => {
                    maskSetting(selectedRanges[0][0])
                },
            },

        ];

        return menuOptions;
    };

    /**
     * 元に戻す（ctrl + z）
     *
     */
    const handleUndoChanges = () => {
        // 保持データを取得
        let getTempData: any = null;
        useTempSaveData.forEach((item, key) => {
            if (
                item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                item.inputSelectDate == useSidemenuSelectedDate
            ) {
                getTempData = item;
            }
        });

        if (getTempData) {
            const undoColumn: any =
                getTempData.cellChanges[getTempData.cellChangesIndex - 1]["1"]; // ヘッダーカラム
            const undoData: any =
                getTempData.cellChanges[getTempData.cellChangesIndex - 1]["0"]; // 編集中のデータ

            setColumnData(undoColumn); // ヘッダーカラム
            setEditingData(undoData); // 編集中のデータ

            // 保持データを設定
            let newTempData: any = useTempSaveData;
            newTempData.forEach((item, key) => {
                if (
                    item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                    item.inputSelectDate == useSidemenuSelectedDate
                ) {
                    item.inputEditingData = undoData;
                    item.cellChangesIndex = item.cellChangesIndex - 1;
                }
            });
            setTempSaveData(newTempData);
        }
    };

    /**
     * やり直す（ctrl + y）
     *
     */
    const handleRedoChanges = () => {
        // 保持データを取得
        let getTempData: any = null;
        useTempSaveData.forEach((item, key) => {
            if (
                item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                item.inputSelectDate == useSidemenuSelectedDate
            ) {
                getTempData = item;
            }
        });

        if (
            getTempData &&
            getTempData.cellChangesIndex + 1 <= getTempData.cellChanges.length - 1
        ) {
            const redoColumn: any =
                getTempData.cellChanges[getTempData.cellChangesIndex + 1]["1"]; // 編集中のデータ
            const redoData: any =
                getTempData.cellChanges[getTempData.cellChangesIndex + 1]["0"]; // ヘッダーカラム

            setColumnData(redoColumn); // ヘッダーカラム
            setEditingData(redoData); // 編集中のデータ

            // 保持データを設定
            let newTempData: any = useTempSaveData;
            newTempData.forEach((item, key) => {
                if (
                    item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                    item.inputSelectDate == useSidemenuSelectedDate
                ) {
                    item.inputEditingData = redoData;
                    item.cellChangesIndex = item.cellChangesIndex + 1;
                }
            });
            setTempSaveData(newTempData);
        }
    };

    /**
     * 配列順_再設定の処理
     *
     * @param arr   Array　　　対象配列データ
     * @param idxs  Number    対象データのキー
     * @param to    Number    配列の位置
     * @returns
     */
    const reorderArray = <T extends {}>(arr: T[], idxs: number[], to: number) => {
        const movedElements = arr.filter((_, idx) => idxs.includes(idx));
        const targetIdx =
            Math.min(...idxs) < to
                ? (to += 1)
                : (to -= idxs.filter((idx) => idx < to).length);
        const leftSide = arr.filter(
            (_, idx) => idx < targetIdx && !idxs.includes(idx)
        );
        const rightSide = arr.filter(
            (_, idx) => idx >= targetIdx && !idxs.includes(idx)
        );
        return [...leftSide, ...movedElements, ...rightSide];
    };

    /**
     * ヘッダカラムの並び順を変更
     *
     * @param targetColumnId
     * @param columnIds
     */
    const handleColumnsReorder = (targetColumnId: Id, columnIds: Id[]) => {
        const to = columnData.findIndex((item, key) => key === targetColumnId);
        const rowsIds = columnIds.map((id) =>
            columnData.findIndex((rowItem, rowKey) => rowKey === id)
        );
        let newColumn = reorderArray(columnData, rowsIds, to);
        newColumn = [...Object.values(newColumn)].map((newItem, newKey) => {
            return {
                ...newItem,
                dataKey: newKey,
            };
        });

        // row data
        let newList = useEditingData;
        newList = newList.map((rowItem: any, rowKey: any) => {
            return {
                ...rowItem,
                data: reorderArray(rowItem.data, rowsIds, to),
            };
        });

        // データを変える時、変更履歴ステートに追加する
        // const setChangeData: any = [newList, newColumn]
        // setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), setChangeData]);

        setColumnData(newColumn);
        setEditingData(newList); // 編集中のデータ
        setFocusInfo({ rowId: 0, columnId: to });
    };

    /**
     * 変更可能カラム・セルを確認
     *
     * @param targetRowId
     * @param rowIds
     * @returns
     */
    const handleCanReorderRows = (
        targetRowId: Id,
        rowIds: Id[],
        dropPosition: DropPosition
    ): boolean => {
        // ヘッダー及び採水年月日・採水時刻には並び替えできないように設定
        return (targetRowId !== "header" && Number(targetRowId) > 2);
    };

    /**
     * 行セルの並び順を変更
     *
     * @param targetRowId
     * @param rowIds
     */
    const handleRowsReorder = (targetRowId: Id, rowIds: Id[]) => {
        // 保持データを設定_初期化
        const newTempData: any = useTempSaveData;
        const findTempData = newTempData.find((item) => {
            return (
                item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                item.inputSelectDate == useSidemenuSelectedDate
            );
        });

        if (!findTempData) {
            newTempData.push({
                inputMenuNo: dataSideMenuSelected.selectedMenuNo,
                inputSelectDate: useSidemenuSelectedDate,
                inputEditingData: useEditingData,
                cellChanges: [[useEditingData, columnData]],
                cellChangesIndex: 0,
            });
        }

        const to = useEditingData.findIndex((person, key) => key === targetRowId);
        const rowsIds = rowIds.map((id) =>
            useEditingData.findIndex((person, key) => key === id)
        );
        let newList = reorderArray(useEditingData, rowsIds, to);

        // 変更回数を増やす
        setEditingData(newList); // 編集中のデータ

        // 保持データを設定
        const findTempDataLast = newTempData.find((item) => {
            return (
                item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                item.inputSelectDate == useSidemenuSelectedDate
            );
        });

        if (!findTempDataLast) {
            newTempData.push({
                inputMenuNo: dataSideMenuSelected.selectedMenuNo,
                inputSelectDate: useSidemenuSelectedDate,
                inputEditingData: newList,
                cellChanges: [[newList, columnData]],
                cellChangesIndex: 0,
            });
        } else {
            newTempData.forEach((item, key) => {
                if (
                    item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                    item.inputSelectDate == useSidemenuSelectedDate
                ) {
                    item.inputEditingData = newList;
                    item.cellChanges.push([newList, columnData]);
                    item.cellChangesIndex = item.cellChangesIndex + 1;
                }
            });
        }

        setTempSaveData(newTempData);
        setFocusInfo({ rowId: targetRowId, columnId: "name" });

        // 編集状態を設定
        setInputEditingFlg(true);
    };

    /**
     * フォーカス変更
     *
     * @param location
     */
    const handleFocusChange = async (location: CellLocation) => {
        // セルからフォーカスが外れた場合
        if (
            useCurFocusRow &&
            useCurFocusRow !== location.rowId &&
            useCurFocusCnt > 0
        ) {

            // フォーカス管理設定
            setCurFocusColumn(location.columnId);
            setCurFocusRow(location.rowId);
            setCurFocusCnt(0);
        } else {
            // フォーカス管理設定
            setCurFocusColumn(location.columnId);
            setCurFocusRow(location.rowId);
            setCurFocusCnt(0);
        }
    };

    // フォーカス管理
    const [useCurFocusColumn, setCurFocusColumn] = useAtom(
        AtomGridTable.useCurFocusColumn
    );
    const [useCurFocusRow, setCurFocusRow] = useAtom(
        AtomGridTable.useCurFocusRow
    );
    const [useCurFocusCnt, setCurFocusCnt] = React.useState<number>(0);

    /**
     * 
     * 
     */
    const settingSelectedChangedItem = async () => {
        // 保持データを設定_初期化
        const newTempData: any = useTempSaveData;
        const findTempData = newTempData.find((item) => {
            return (
                item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                item.inputSelectDate == useSidemenuSelectedDate
            );
        });

        if (!findTempData) {
            newTempData.push({
                inputMenuNo: dataSideMenuSelected.selectedMenuNo,
                inputSelectDate: useSidemenuSelectedDate,
                inputEditingData: useEditingData,
                cellChanges: [[useEditingData, columnData]],
                cellChangesIndex: 0,
            });
        }

        // データ更新
        let newList = useEditingData;
        newList = [...Object.values(newList)].map((item, key) => {
            if (key === useInspectionItemManageState.selectedItemKey && useInspectionItemManageState.changedItemNo && useInspectionItemManageState.changedItemName) {
                // コラム名を指定
                return {
                    ...item,
                    itemNo: useInspectionItemManageState.changedItemNo,
                    name: useInspectionItemManageState.changedItemName,
                };
            } else {
                return item;
            }
        });

        setEditingData(newList);

        // 保持データを設定
        const findTempDataLast = newTempData.find((item) => {
            return (
                item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                item.inputSelectDate == useSidemenuSelectedDate
            );
        });

        if (!findTempDataLast) {
            newTempData.push({
                inputMenuNo: dataSideMenuSelected.selectedMenuNo,
                inputSelectDate: useSidemenuSelectedDate,
                inputEditingData: newList,
                cellChanges: [[newList, columnData]],
                cellChangesIndex: 0,
            });
        } else {
            newTempData.forEach((item, key) => {
                if (
                    item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                    item.inputSelectDate == useSidemenuSelectedDate
                ) {
                    item.inputEditingData = newList;
                    item.cellChanges.push([newList, columnData]);
                    item.cellChangesIndex = item.cellChangesIndex + 1;
                }
            });
        }

        setTempSaveData(newTempData);
    };

    useQuery({
        queryKey: ["settingSelectedChangedItem", useInspectionItemManageState],
        queryFn: () => {
            settingSelectedChangedItem();

            return true;
        },
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

    // データ取消
    const removeAllEditingData = async () => {
        // メッセージクリア
        setResultMessage([]);

        if (useEditingData && useEditingData.length !== 0) {
            // 編集状態を設定
            setInputEditingFlg(true);

            let newList = useEditingData;
            newList = [...Object.values(newList)].map((item, key) => {
                return {
                    ...item,
                    data: item.data.map((innerItem: any, innerIndex: any) => {
                        return { ...innerItem, data: "", handleEditData: false };
                    }),
                };
            });

            // 編集中のデータを設定
            setEditingData(newList);

            // 保持データを設定
            const newTempData: any = useTempSaveData;
            const findTempData = newTempData.find((item) => {
                return (
                    item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                    item.inputSelectDate == useSidemenuSelectedDate
                );
            });

            if (!findTempData) {
                newTempData.push({
                    inputMenuNo: dataSideMenuSelected.selectedMenuNo,
                    inputSelectDate: useSidemenuSelectedDate,
                    inputEditingData: newList,
                    cellChanges: [[newList, columnData]],
                    cellChangesIndex: 0,
                });
            } else {
                newTempData.forEach((item, key) => {
                    if (
                        item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                        item.inputSelectDate == useSidemenuSelectedDate
                    ) {
                        item.inputEditingData = newList;
                        item.cellChanges.push([newList, columnData]);
                        item.cellChangesIndex = item.cellChangesIndex + 1;
                    }
                });
            }

            setTempSaveData(newTempData);
        }

        setGridTableFooterBtnClick("");
    };

    // 入力前に戻る
    const discardAllEditingData = async () => {
        // メッセージクリア
        setResultMessage([]);

        if (useEditingData && useEditingData.length !== 0) {
            // 保持データを取得
            let getTempData: any = null;
            useTempSaveData.forEach((item, key) => {
                if (
                    item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                    item.inputSelectDate == useSidemenuSelectedDate
                ) {
                    getTempData = item;
                }
            });

            // 入力前に戻す
            if (getTempData) {
                const discardColumn: any = getTempData.cellChanges[0]["1"]; // ヘッダーカラム
                const discardData: any = getTempData.cellChanges[0]["0"]; // 編集中のデータ

                setColumnData(discardColumn);           // ヘッダーカラム
                setEditingData(discardData);            // 編集中のデータ
                setColumnSetting(columnSettingInit);    // カラム設定を初期化

                // 保持データを設定
                let newTempData: any = useTempSaveData;
                newTempData.forEach((item, key) => {
                    if (
                        item.inputMenuNo == dataSideMenuSelected.selectedMenuNo &&
                        item.inputSelectDate == useSidemenuSelectedDate
                    ) {
                        item.inputEditingData = discardData;
                        item.cellChangesIndex = 0;
                    }
                });
                setTempSaveData(newTempData);

                // 編集状態を設定
                setInputEditingFlg(false);
            }
        }

        setInputEditingFlg(false); // 編集状態リセット
        setGridTableFooterBtnClick("");
    };

    // ボタン押下操作
    const checkFooterButtonClick = async () => {
        if (useGridTableFooterBtnClick == "取消") {
            removeAllEditingData();
        } else if (useGridTableFooterBtnClick == "入力前に戻る") {
            discardAllEditingData();
        }
        return true;
    };

    useQuery({
        queryKey: ["checkFooterButtonClick", useGridTableFooterBtnClick],
        queryFn: checkFooterButtonClick,
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

    return (
        <>
            <div
                id="grid-table-setting-panel"
                className={cssGridTable.grid_table_setting_panel}
                // 入力履歴管理
                onKeyDown={(e) => {
                    if ((!isMacOs() && e.ctrlKey) || e.metaKey) {
                        switch (e.key) {
                            // 元に戻す
                            case "z":
                                handleUndoChanges();
                                return;
                            // やり直す
                            case "y":
                                handleRedoChanges();
                                return;
                        }
                    }
                }}
                onClick={() => {
                    setFocusInfo(null);
                }}
                // 入力開始
                onDoubleClick={() => {
                    setCurFocusCnt(useCurFocusCnt + 1);
                }}
                // 入力確定
                onKeyDownCapture={(e) => {
                    if (e.key == "Enter") {
                        setCurFocusCnt(useCurFocusCnt + 1);
                    }
                }}
            >
                <ReactGrid
                    rows={rows}
                    columns={columnSetting}
                    labels={customLabels}
                    onCellsChanged={handleChanges}
                    onColumnResized={handleColumnResize}
                    onContextMenu={handlerContextMenu}
                    onFocusLocationChanged={async (location: CellLocation) => {
                        handleFocusChange(location);
                    }}
                    customCellTemplates={{
                        combobox: new ComboBoxCellTemplate(),
                    }}
                    // onColumnsReordered={handleColumnsReorder}
                    onRowsReordered={handleRowsReorder}
                    canReorderRows={handleCanReorderRows}
                    focusLocation={focusInfo}
                    stickyLeftColumns={1}
                    stickyTopRows={2}
                    enableFillHandle
                    enableRangeSelection={false}
                    enableRowSelection={true}
                    enableColumnSelection={true}
                />
            </div>
        </>
    );
};