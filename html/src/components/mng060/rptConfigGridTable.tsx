//【汎用】
import React, { useState, useReducer, useEffect } from "react";
import { Api, getMessage } from "../../common/api";
import { useAtom, useSetAtom, useAtomValue } from "jotai";
import { useQuery } from "@tanstack/react-query";
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
//【ステート】カレンダー
import * as AtomSideMenuCalendar from "../../stores/atomSidemenuCalendar";
//【ステート】カレンダー
import * as AtomMng060 from "../../stores/atomMNG060";
//【ステート】検査項目変更子画面
import * as AtomInspectionItemSetting from "../../stores/atomInspectionItemSetting";
//【ステート】確認ダイアログ
import * as AtomConfirmDialog from "../../stores/atomConfirmDialog";

//【コンポネント】セレクトボックスセル
import {
  SelectCell,
  SelectCellTemplate,
} from "../common/grid-table-custom-cells/select.cell.tsx";
import {
  TimeCell,
  TimeCellTemplate,
} from "../common/grid-table-custom-cells/time.cell.tsx";
import { TextAreaCellTemplate } from "../common/grid-table-custom-cells/textArea.cell.tsx";
import { DateEditorTemplate } from "../common/grid-table-custom-cells/dateEditor.cell.tsx";
import { readDataTransferFromClipboard } from "@testing-library/user-event/dist/cjs/utils/index.js";

import {
  ComboBoxCell,
  ComboBoxCellTemplate,
} from "../common/grid-table-custom-cells/comboBoxSearch.cell.tsx";

//【コンポネント】異常値一覧のモダール
import { OutlierListModal } from "../modals/index.ts";
import { input } from "@testing-library/user-event/dist/cjs/event/input.js";

import { GridTable } from "../common/gridTable.tsx";
import { info } from "console";
import { SelectOptions } from "../../common/interface.ts";
import { itemSelect } from "../../stores/atomWQM020.tsx";
import { L } from "vitest/dist/chunks/reporters.d.BFLkQcL6.js";

// 属性
interface Props {
  id: string;
  className?: any;
  height?: string;
  width?: string;
  dataGrid?: any;
  leftColumn?: number;
}

// コンポーネントエクスポート
export var RptConfigGridTable: React.FC<Props> = function ({
  id = "grid-table-panel",
  className = "",
  height,
  width,
  dataGrid,
  leftColumn = 0,
}) {
  // 編集中のデータ（情報取得 ※実際に使えば、DBからの情報）
  // const [useEditingData, setEditingData] = useAtom(
  //   AtomGridTable.sampleListState
  // );
  const [useEditingData, setEditingData] = useAtom(
    AtomMng060.mng060EditData(id)
  );
  // 画面保持データ
  const [useTempSaveData, setTempSaveData] = useAtom(
    AtomGridTable.gridTableTempSaveData
  );
  // 地点ヘッダーデータ（情報取得　※実際に使えば、DBからの情報）
  const [columnData, setColumnData] = useAtom(
    AtomGridTable.sampleColumnListState
  );
  // 選択したメニューデータアトム
  const [dataSideMenuSelected, setSideMenuSelected] = useAtom(
    AtomSideMenu.sideMenuSelectedState
  );

  // 処理結果メッセージ
  const [useResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);

  /** 検査項目変更子画面 */
  // 表示フラグ
  const [useInputEditingFlg, setInputEditingFlg] = useAtom(
    AtomCommon.inputEditingFlg
  );
  // 項目管理データ
  const [useInspectionItemManageState, setInspectionItemManageState] = useAtom(
    AtomInspectionItemSetting.inspectionItemManageState
  );

  /** セレクトボックス 入力メニュー */
  const optionInputMenu = useAtomValue(AtomMng060.mng060Options("input_menu"));
  /** セレクトボックス 採水地点 */
  const optionPoint = useAtomValue(AtomMng060.mng060Options("point"));
  /** セレクトボックス 検査区分 */
  const optionKbn = useAtomValue(AtomMng060.mng060Options("inspection_kbn"));
  /** セレクトボックス 報告書タイプ */
  const optionType = useAtomValue(AtomMng060.mng060Options("report_type"));
  /** セレクトボックス 検査項目 */
  const optionItem = useAtomValue(AtomMng060.mng060Options("item"));
  /** セレクトボックス 報告書 */
  const optionReport = useAtomValue(AtomMng060.mng060Options("report"));

  /**メニューラベル管理子画面_表示フラグ */
  const [useInspectionItemModalFlgState, setInspectionItemModalFlgState] =
    useAtom(AtomInspectionItemSetting.inspectionItemModalFlgState);

  // フォーカス管理
  const [useCurFocusColumn, setCurFocusColumn] = useAtom(
    AtomGridTable.useCurFocusColumn
  );
  const [useCurFocusRow, setCurFocusRow] = useAtom(
    AtomGridTable.useCurFocusRow
  );
  const [useCurFocusCnt, setCurFocusCnt] = React.useState<number>(0);
  const [focusInfo, setFocusInfo] = React.useState<any>();

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

  /**
   * ４.初期表示_初期データを設定
   *
   * */
  /** 各行のデータステート */
  const [rows, setRows] = React.useState<any>([]); // ReactGridに各行の情報を指定

  /** 関数 start */
  /**
   * 初期データ設定関数
   */
  const setInitialData = () => {
    if (dataGrid.length !== 0) {
      console.log("dataGrid", dataGrid);

      // データクリア
      // setEditingData([]); // 編集中のデータ
      // setColumnData([]); // 地点ヘッダーデータ
      // setColumnSetting([]); // カラム設定（横ヘッダー）
      // setHeaderInfo([]); //
      setInputEditingFlg(false); // 編集状態リセット

      // setRows(setInputDataToGridTable(dataGrid.rowData, dataGrid.header));
      let columnObj: ColumnSetting[] = [];
      const setWidthArrForMonthListTable: number[] = [350, 200, 100];
      dataGrid.colData.forEach((element, key) => {
        if (element.key == "report_no" && id !== "monthListTable") {
          columnObj.push({
            // columnId: id + "_" + element.key,
            columnId: element.key,
            columnType: element.type,
            width: 0,
            reorderable: true,
            resizable: true,
          });
        } else if (id == "monthListTable") {
          // 2025/12 月報のレイアウトを調整
          columnObj.push({
            columnId: element.key,
            columnType: element.type,
            width: setWidthArrForMonthListTable[key],
            reorderable: true,
            resizable: true,
          });

        } else {
          columnObj.push({
            // columnId: id + "_" + element.key,
            columnId: element.key,
            columnType: element.type,
            width: element.width,
            reorderable: true,
            resizable: true,
          });
        }
      });
      // console.log("column", columnObj);
      setColumnSetting(columnObj);
      setEditingData(dataGrid.rowData);
    }
  };

  /** 一覧表の情報 (header及びbody) をReactGrid用の構造に変換して設定 */
  const setInputDataToGridTable = (
    useEditingData: any[],
    headerInfo: any[]
  ): Row[] => [
      {
        rowId: "header",
        height: 30,
        cells: headerInfo,
      },
      ...useEditingData.map<Row>((dataItem, idx) => {
        let setHeight: number = 25;
        if (id == "itemTable" || id == "pointTable") {
          setHeight = 45;
        } else if (dataItem.type == "textArea") {
          setHeight = 240;
        }

        return {
          rowId: idx,
          reorderable: true,
          height: setHeight,
          cells: dataItem.map((rowData, key) => {
            let colData = columnSetting.find(
              (param) => param.columnId.replace(id + "_", "") == rowData.colName
            );

            // コンボボックスの場合
            const comboElem = (opt: SelectOptions[]): any => {
              let selected = opt.find((option) => option.value == rowData.value);
              return {
                ...rowData,
                type: "combobox",
                value: rowData.value,
                text: selected ? selected.label : "",
                options: opt,
                // nonEditable: leftColumn > key ? true : false,
              };
            };

            // セレクトボックスの場合
            const selectElem = (opt: SelectOptions[]): any => {
              let selected = opt.find((option) => option.value == rowData.value);
              return {
                ...rowData,
                type: "select",
                selectedValue: rowData.value,
                value: rowData.value,
                text: selected ? selected.label : "",
                options: opt,
                nonEditable: leftColumn > key ? true : false,
                defaultOption: true,
              };
            };

            // テキストエリアの場合
            const textAreaElem = (): any => {
              return {
                ...rowData,
                type: "textArea",
                value: rowData.value,
                text: rowData.value ?? "",
                nonEditable: leftColumn > key ? true : false,
              };
            };

            if (id == "configTable" && rowData.colName == "report_category") {
              return comboElem(Const.rptCategoryOptions);
            } else if (
              id == "configTable" &&
              rowData.colName == "data_sheet_type"
            ) {
              return comboElem(Const.dataSheetOptions);
            } else if (id == "configTable" && rowData.colName == "mask") {
              return comboElem(Const.maskPatternOptions);
            } else if (id == "configTable" && rowData.colName == "report_type") {
              return comboElem(optionType);
            } else if (
              (id == "configTable" && rowData.colName == "point_name") ||
              (id == "pointTable" && rowData.colName == "point_no") ||
              (id == "textTable" && rowData.colName == "point_no") ||
              (id == "monthListTable" && rowData.colName == "point_no")
            ) {
              return comboElem(optionPoint);
            } else if (id == "configTable" && rowData.colName == "dsp_name") {
              return comboElem(optionInputMenu);
            } else if (id == "configTable" && rowData.colName == "item_name") {
              return comboElem(optionItem);
            } else if (
              (id == "itemTable" && rowData.colName == "report_item_name") ||
              id == "pointTable" && rowData.colName == "report_point_name"
            ) {
              return textAreaElem();
            } else if (id == "itemTable" && rowData.colName == "item_no") {
              return selectElem(optionItem);
            } else if (
              id == "configTable" &&
              rowData.colName == "inspection_kbn"
            ) {
              return comboElem(optionKbn);
            } else if (id == "monthListTable" && rowData.colName == "report_no") {
              return selectElem(optionReport);
            }

            // // 見出しとしての指定があった場合、値変更不可
            // if (leftColumn > 0) {
            //   return {
            //     ...rowData,
            //     nonEditable: leftColumn > key ? true : false,
            //   };
            // }

            return rowData;
          }),
        };
      }),
    ];

  /** ReactGridセル内容変更時発動処理
   * 変更前データの保持と、変更後データのRowTypeへの変換
   */
  const handleChanges = async (changes: CellChange<any>[]) => {

    if (changes[0].newCell.text !== "*****") {
      // メッセージクリア
      setResultMessage([]);

      // 保持データを設定_初期化
      const newTempData: any = useTempSaveData;
      const findTempData = newTempData.find((item) => {
        return item.inputMenuNo == dataSideMenuSelected.selectedMenuNo;
      });

      if (!findTempData) {
        newTempData.push({
          inputMenuNo: dataSideMenuSelected.selectedMenuNo,
          inputEditingData: useEditingData,
          cellChanges: [[useEditingData, columnData]],
          cellChangesIndex: 0,
        });
      }

      let newList = useEditingData;
      const changedData: any = changes;
      const changedColumnId: Id = changes[0].columnId;
      const changedRowId: Id = changes[0].rowId;

      changes.forEach((changeItem) => {
        let columnIdx = changeItem.columnId;
        let columnType = changeItem.type;

        newList = [...Object.values(newList)].map((item, key) => {
          if (key === changeItem.rowId) {
            // コラム名を指定
            let dataKey = `${columnIdx}`;
            let changedData = changeItem.newCell.text;
            let changedValue = changeItem.newCell.value;
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
                changedData = moment(
                  changeItem.newCell.date,
                  "YYYY-MM-DD",
                  true
                ).isValid()
                  ? changeItem.newCell.date
                  : null;
              }

              previousData = moment(
                changeItem.previousCell.date,
                "YYYY-MM-DD",
                true
              ).isValid()
                ? changeItem.previousCell.date
                : null;

              // ***** CUSTOMCELL_日付 *****
            } else if (columnType == "dateEditor") {
              if (moment(changeItem.newCell.date).format("YYYY").length > 4) {
                changedData = null;

                // エラーメッセージ表示
                const errorInfo: AtomCommon.message[] = [];
                errorInfo.push(getMessage(["WQ-0020W", item.name]));
                setResultMessage(errorInfo);
              } else {
                changedData = moment(
                  changeItem.newCell.date,
                  "YYYY-MM-DD",
                  true
                ).isValid()
                  ? changeItem.newCell.date
                  : null;
              }
              previousData = moment(
                changeItem.previousCell.date,
                "YYYY-MM-DD",
                true
              ).isValid()
                ? changeItem.previousCell.date
                : null;

              // ***** ReactGrid_時刻 *****
            } else if (columnType == "time") {
              changedData = moment(
                changeItem.newCell.time,
                "YYYY-MM-DD",
                true
              ).isValid()
                ? changeItem.newCell.time
                : null;
              previousData = moment(
                changeItem.previousCell.time,
                "YYYY-MM-DD",
                true
              ).isValid()
                ? changeItem.previousCell.time
                : null;

              // ***** ReactGrid_ドロップダウン *****
            } else if (columnType == "dropdown") {
              // ***** CUSTOMCELL_セレクトボックス *****
            } else if (columnType == "select") {
              const getLabel: any = changeItem.newCell.options.find(
                (option) => option.value == changeItem.newCell.text
              );
              changedData = getLabel ? getLabel.label : "";
              changedValue = getLabel ? getLabel.value : "";

              // ***** CUSTOMCELL_チェックボックス *****
            } else if (columnType == "checkbox") {
            } else if (columnType == "text") {
              changedValue = changedData;
            } else if (columnType == "combobox") {
              const getLabel: any = changeItem.newCell.options.find(
                (option) => option.label == changeItem.newCell.text
              );
              changedData = getLabel ? getLabel.label : "";
              changedValue = getLabel ? getLabel.value : "";
            } else if (columnType == "textArea") {
              changedValue = changedData;
            }

            return item.map((innerItem: any, innerIndex: any) => {
              if (innerItem.colName == dataKey.replace(id + "_", "")) {
                return {
                  ...innerItem,
                  text: changedData,
                  value: changedValue,
                };
              } else {
                return innerItem;
              }
            });
          } else {
            return item;
          }
        });
      });

      // セル値の自動設定処理
      console.log("newList", newList);

      // データを変える時、変更履歴ステートに追加する
      // 編集中のデータを設定
      setEditingData(newList);

      // 保持データを設定
      const findTempDataLast = newTempData.find((item) => {
        return item.inputMenuNo == dataSideMenuSelected.selectedMenuNo;
      });

      if (!findTempDataLast) {
        newTempData.push({
          inputMenuNo: dataSideMenuSelected.selectedMenuNo,
          inputEditingData: newList,
          cellChanges: [[newList, columnData]],
          cellChangesIndex: 0,
        });
      } else {
        newTempData.forEach((item, key) => {
          if (item.inputMenuNo == dataSideMenuSelected.selectedMenuNo) {
            item.inputEditingData = newList;
            item.cellChanges.push([newList, columnData]);
            item.cellChangesIndex = item.cellChangesIndex + 1;
          }
        });
      }
      // console.log(newTempData);
      setTempSaveData(newTempData);

      // 編集状態を設定
      setInputEditingFlg(true);
    }
  };

  // 選択セルの内容をコピー
  const handleCopy = async (rowId, colId) => {
    if (rowId === undefined || rowId === null || rowId === "") return;
    const row = rows.find((r) => r.rowId === rowId);
    if (!row) return;
    const cell = row.cells.find((r) => r.colName === colId);
    if (cell.type === "text") {
      await navigator.clipboard.writeText(cell.text);
    }
  };

  // ペースト
  const handlePaste = async (rowId, colId) => {
    if (rowId === undefined || rowId === null || rowId === "") return;
    const text = await navigator.clipboard.readText();
    let selectRow = rows.find((r) => r.rowId === rowId);
    let changedCells = selectRow.cells.map((r) =>
      r.colName === colId ? { ...r, text: text, value: text } : r
    );
    // setRows((prev) =>
    //   prev.map((r) => (r.rowId === rowId ? { ...r, cells: changedCells } : r))
    // );
    setEditingData(
      useEditingData.map((data, key) => (key == rowId ? changedCells : data))
    );
  };

  // 行削除
  const handleDeleteRow = async (rowId) => {
    setEditingData(useEditingData.filter((data, key) => key !== rowId));
    // setRows((prev) => prev.filter((r) => r.rowId !== rowId));
  };

  // 行追加
  const handleAddRow = async (rowId) => {
    // 選択セル
    let selectRow = rows.find((r) => r.rowId === rowId);

    // 初期化セル
    const newCells = selectRow.cells.map((cell) => {
      if (cell.type === "text") {
        return { ...cell, text: "", value: "" } as TextCell;
      } else if (cell.type === "select") {
        return { ...cell, text: "", selectedValue: "", value: "" };
      } else if (cell.type === "textArea") {
        return { ...cell, text: "", value: "" };
      }

      return { ...cell };
    });

    // console.log(newCells, "newCells");
    // 追加行
    const newRow: Row = { rowId: 0, cells: newCells };
    // 選択セル位置取得
    const index = rows.findIndex((r) => r.rowId === rowId);
    if (index === -1) return;

    // 振り直し
    const reindexRows = (newRow: Row[]) => {
      return newRow.map((r) => r.cells);
    };

    setEditingData(
      reindexRows([
        ...rows.slice(1, index + 1),
        newRow,
        ...rows.slice(index + 1),
      ])
    );
  };

  // 検査項目変更子画面表示
  const handleChangeItem = async (rowId, colId) => {
    if (rowId === undefined || rowId === null || rowId === "") return;
    const getSelectedItem = useEditingData.find((item, key) => key == rowId);

    // console.log("colId", colId);
    // console.log("rowId", rowId);
    // console.log("getSelectedItem", getSelectedItem);

    setInspectionItemManageState({
      ...useInspectionItemManageState,
      selectedItemKey: Number(rowId),
      selectedItemNo: getSelectedItem[0]["value"],
      selectedItemName: getSelectedItem[1]["value"],
    });
    setInspectionItemModalFlgState(true);
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
  const handleContextMenu = (
    selectedRowIds: Id[],
    selectedColIds: Id[],
    selectionMode: SelectionMode,
    menuOptions: MenuOption[],
    selectedRanges: Array<CellLocation[]>
  ): MenuOption[] => {
    // if (id !== "itemTable" && id !== "textTable" && id !== "pointTable") {
    //   return (menuOptions = []);
    // }
    // console.log(selectedRanges, "selectRanges_" + id);

    const rowId: any =
      selectedRanges[0] && typeof selectedRanges[0]["0"] != "undefined"
        ? selectedRanges[0]["0"].rowId
        : null;
    const columnId: any = selectedRanges[0]
      ? selectedRanges[0]["0"].columnId
      : null;
    // const checkMask = (selectedRanges[0]) ? useEditingData[rowId].data[columnId].dataDisable : null;

    // 切り取りを削除
    menuOptions.splice(1, 1);

    // return [
    //   {
    //     id: "copy",
    //     label: "コピー",
    //     handler: () => {
    //       handleCopy(rowId, columnId);
    //     },
    //   },
    //   {
    //     id: "paste",
    //     label: "貼り付け",
    //     handler: () => {
    //       handlePaste(rowId, columnId);
    //     },
    //   },
    //   {
    //     id: "add-row",
    //     label: "挿入",
    //     handler: () => {
    //       handleAddRow(rowId);
    //     },
    //   },
    //   {
    //     id: "delete-row",
    //     label: "削除",
    //     handler: () => {
    //       if (!window.confirm(getMessage(["WQ-0003Q"]).message)) {
    //         return;
    //       }
    //       handleDeleteRow(rowId);
    //     },
    //   },
    //   id === "itemTable" && {
    //     id: "inspection-item-edit",
    //     label: "検査項目変更",
    //     handler: () => {
    //       handleChangeItem(rowId, columnId);
    //     },
    //   },
    // ];

    // カスタム操作を追加
    menuOptions = [
      ...menuOptions,
      {
        id: "add-row",
        label: "挿入",
        handler: () => {
          handleAddRow(rowId);
        },
      },
      {
        id: "delete-row",
        label: "削除",
        handler: () => {
          // 確認ダイアログ
          setDialog((prev) => ({
            ...prev,
            isOpen: true,
            cancelBtnName: "いいえ",
            message: getMessage(["WQ-0003Q"]).message,
            onConfirm: () => {
              handleDeleteRow(rowId);
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
          handleChangeItem(rowId, columnId);
        },
      },
    ];

    // 検査項目以外は項目設定メニューを削除
    if (id !== "itemTable") {
      menuOptions.pop();
    }

    return menuOptions;
  };

  const selectChangeItem = () => {
    let selectedItem =
      useEditingData[useInspectionItemManageState.selectedItemKey];

    selectedItem = selectedItem.map((item, key) => {
      if (key === 0) {
        return {
          ...item,
          text: useInspectionItemManageState.changedItemNo,
          value: useInspectionItemManageState.changedItemNo,
        };
      } else if (key === 1) {
        return {
          ...item,
          text: useInspectionItemManageState.changedItemName,
          value: useInspectionItemManageState.changedItemName,
        };
      } else {
        return item;
      }
    });
    let newCells = useEditingData;
    newCells = newCells.map((item, key) => {
      if (key === useInspectionItemManageState.selectedItemKey) {
        {
          return selectedItem;
        }
      } else {
        return item;
      }
    });

    setEditingData(newCells);
  };

  const handleFocusChange = async (location: CellLocation) => {
    // フォーカス管理設定
    setCurFocusColumn(location.columnId);
    setCurFocusRow(location.rowId);
    setCurFocusCnt(0);
  };

  /** 関数 end */

  /** useQuery + useEffect start */

  // サイドメニュー選択時 検索データを設定 useEdingDataを更新
  useQuery({
    queryKey: ["dataGridChange_" + id, dataGrid],
    queryFn: setInitialData,
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

  // セルの表示データ変更
  useQuery({
    queryKey: ["dataColumRow", useEditingData],
    queryFn: () => {
      setRows(setInputDataToGridTable(useEditingData, dataGrid.header));
    },
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

  //
  if (id === "itemTable") {
    useQuery({
      queryKey: [
        "settingSelectedChangedItem" + id,
        useInspectionItemManageState,
      ],
      queryFn: () => {
        if (id === "itemTable") {
          // 検査項目設定子画面から項目を選択する時、データ更新
          if (useInspectionItemManageState.changedItemNo && useInspectionItemManageState.changedItemName) {
            selectChangeItem();
          }
        }
      },
      refetchOnWindowFocus: false,
    });
  }

  /** useQuery + useEffect end */

  return (
    <>
      <div
        id={id}
        className={
          className
            ? `${cssGridTable.grid_table_panel} ${className}`
            : cssGridTable.grid_table_panel
        }
        style={{ height, width }}
      >

        {/* 報告書類を確認 */}
        {(id == "configTable") ? (
          // 右クリック不用のグリッドテーブル
          <ReactGrid
            rows={rows}
            columns={columnSetting}
            labels={customLabels}
            onCellsChanged={handleChanges}
            customCellTemplates={{
              select: new SelectCellTemplate(),
              timeEditor: new TimeCellTemplate(),
              textArea: new TextAreaCellTemplate(),
              dateEditor: new DateEditorTemplate(),
              combobox: new ComboBoxCellTemplate(),
            }}
            focusLocation={focusInfo}
            stickyTopRows={1}
            stickyLeftColumns={leftColumn ? leftColumn : 0}
            initialFocusLocation={{ columnId: 0, rowId: 0 }}
            disableVirtualScrolling={true}
            enableFillHandle
            enableRangeSelection
            enableRowSelection
            enableColumnSelection
          />
        ) : (
          // 右クリック可能なグリッドテーブル
          <ReactGrid
            rows={rows}
            columns={columnSetting}
            labels={customLabels}
            onCellsChanged={handleChanges}
            onContextMenu={handleContextMenu}
            customCellTemplates={{
              select: new SelectCellTemplate(),
              timeEditor: new TimeCellTemplate(),
              textArea: new TextAreaCellTemplate(),
              dateEditor: new DateEditorTemplate(),
              combobox: new ComboBoxCellTemplate(),
            }}
            focusLocation={focusInfo}
            stickyTopRows={1}
            stickyLeftColumns={leftColumn ? leftColumn : 0}
            initialFocusLocation={{ columnId: 0, rowId: 0 }}
            disableVirtualScrolling={true}
            enableFillHandle
            enableRangeSelection
            enableRowSelection
            enableColumnSelection
          />
        )}
      </div>
    </>
  );
};
