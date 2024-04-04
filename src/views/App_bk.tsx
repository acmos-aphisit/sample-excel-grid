import React, { useState } from "react";
import logo from "./logo.svg";
import "../App.css";
import { useRecoilValue, useSetRecoilState } from "recoil";
import * as Atom from "../atom";
import { RecoilRoot } from "recoil";

/** ReactGrid */
import { ReactGrid, Column, Row, CellChange, TextCell, DefaultCellTypes, CellLocation, MenuOption, Id, SelectionMode, DropPosition } from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";
import moment from "moment";

import { SelectCell, SelectCellTemplate } from "../components/select.cell";

function App() {
  /** 一覧情報（情報取得 ※実際に使えば、DBからの情報） */
  const bodyData: any[] = useRecoilValue(Atom.sampleListState);　//　一覧情報
  const setbodyData = useSetRecoilState(Atom.sampleListState);　 //　一覧情報指定

  /** カラム（情報取得　※実際に使えば、DBからの情報） */
  const columnData: any[] = useRecoilValue(Atom.sampleColumnListState); // カラム名（例：利根川取水口、木原取水場、南椎尾調整池 等）
  const setColumnData = useSetRecoilState(Atom.sampleColumnListState);  // カラム名指定 

  /** カラムヘッダ設定 */
  interface ColumnSetting {
    columnId: string;
    columnType: string;
    width: number;
    reorderable: boolean;
    resizable: boolean;
  }
  const [columnSetting, setColumnSetting] = React.useState<ColumnSetting[]>([]);　// 例：columnId: "name", columnType: "text", width: 300, reorderable: true, resizable: true

  /** ヘッダー情報 */
  interface HeaderInfo {
    type: String;
    text: String;
  }
  const [headerInfo, setHeaderInfo] = React.useState<HeaderInfo[]>([]);　//　セル種、セルテキスト設定（例：type: "header", text: "利根川取水口"）

  /** データセット（保存する場合） */
  const [sendData, setSendData] = React.useState<any[]>([]);

  const [focusInfo, setFocusInfo] = React.useState<any>();

  /** セレクトボックスの項目を作成 */
  const listNo: number = 20;
  let statusLists: [{label: String, value: String}] = [{ label: "", value: "" }];
  for (let index = 1; index <= listNo; index++) {
    statusLists.push({ label: `サンプル ${index}`, value: `サンプル ${index}` });
  }

  /** 初期表示 */
  React.useEffect(() => {
    /** カラム作成（縦） */
    let newColumn: {dataNo: Number, dataId: String, dataName: String, dataKey: Number}[] = [];

    /**　データ指定（横）  */
    const fetchData = async () => {
      try {
        /** 各カラムの情報（ヘッダー） */
        const columnResponse = await fetch("/data/searchItemRow.json");
        let columnData = await columnResponse.json();

        for (let index = 0; index < 20; index++) {
          newColumn.push({ dataNo: index + 1, dataId: "dataNo" + (index + 1), dataName: columnData[index].searchItem, dataKey: index });
        }
        setColumnData(newColumn);

        /** 一覧表の情報（body） */
        const response = await fetch("/data/oldsearchItemRow.json");
        let data = await response.json();
        data.forEach((item: any) => {
          item.data = [];
          newColumn.forEach((column: any, key: number) => {
            let newObj = `data`;
            let newIsOpenObj = `dataIsOpen`;
            let newOrderObj = `dataOrder`;
            item.data[key] = {};
            item.data[key][newIsOpenObj] = false;
            item.data[key][newOrderObj] = key;

            // 無活性
            let newDisableObj = `dataDisable`;
            item.data[key][newDisableObj] = false;

            // マスクデータ
            let newMaskObj = `dataMask`;
            item.data[key][newMaskObj] = "";


            switch (item.type) {
              case "text":
                item.data[key][newObj] = `${item.name}： ${column.dataNo}`;
                if (item.name.match(/採水者/) && column.dataNo > 1) {
                  item.data[key][newDisableObj] = true;
                  item.data[key][newMaskObj] = "*****";
                } else if (item.name.match(/ニッケル及びその化合物/)) {
                  item.data[key][newDisableObj] = true;
                  item.data[key][newMaskObj] = "*****";
                } else if (item.name.match(/ウラン及びその化合物/) && column.dataNo % 2 == 0) {
                  item.data[key][newDisableObj] = true;
                  item.data[key][newMaskObj] = "*****";
                }
                break;
              case "select":
                item.data[key][newObj] = statusLists[Math.floor(Math.random() * listNo)].value;
                break;
              case "date":
                item.data[key][newObj] = new Date(`2024-03-${key + 1}`);
                break;
              default:
                break;
            }
          });
        });
        
        // データを変える時、変更履歴ステートに追加する
        const setChangeData: any = [data, newColumn]
        setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), setChangeData]);

        // 変更回数を増やす
        setCellChangesIndex(cellChangesIndex + 1);
        setbodyData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  /** カラムが変わる時 */
  
  React.useEffect(() => {
    let setColumnObj: ColumnSetting[] = [{ columnId: "name", columnType: "text", width: (columnSetting.length  > 0) ? columnSetting[0].width : 300, reorderable: false, resizable: true }];
    let setHeaderObj: HeaderInfo[] = [{ type: "header", text: "" }];

    columnData.forEach((columnItem: {dataKey: string, dataName: string}) => {
      setColumnObj.push({ columnId: columnItem.dataKey, columnType: "text", width: 150, reorderable: true, resizable: false });
      setHeaderObj.push({ type: "header", text: columnItem.dataName });
    });

    setColumnSetting(setColumnObj);
    setHeaderInfo(setHeaderObj);

    setRows(setDataInRows(bodyData, setHeaderObj));
    console.log("cellChanges", cellChanges);
    let roughObjSize = JSON.stringify(cellChanges);

    console.log("Objet Size : ", roughObjSize);
    
  }, [bodyData, columnData]);

  /** 一覧表の情報 (body) を設定 */
  const setDataInRows = (bodyData: any[], headerInfo: any[]): Row[] => [
    {
      rowId: "header",
      cells: headerInfo,
    },
    ...bodyData.map<Row>((dataItem, idx) => ({
      rowId: idx,
      reorderable: true,
      cells: columnSetting.map((cell: {columnId: string}, key: number) => {
        var ret: any = new Object();
       
        /** 入力：テキスト */
        //if (cell.columnType == "text") { 
        if (cell.columnId == "name") {
          ret.type = "text";
          ret.text = dataItem.name;
          ret.nonEditable = true;
        } else if (dataItem.type == "text" || dataItem.data[key - 1].dataDisable) {
          //ret.type = cell.columnType;
          ret.type = "text";
          ret.text = dataItem.data[key - 1].dataDisable ? "*****" : dataItem.data[key - 1].data;
          ret.nonEditable = cell.columnId == "name" || dataItem.data[key - 1].dataDisable ? true : false;
          if (cell.columnId !== "name") {
            ret.className = dataItem.data[key - 1].dataDisable ? "disabled-cell" : idx % 2 == 0 ? "strip-bg-color" : "";
          }
        } else if (dataItem.type == "select") {
          /** 入力：セレクトボックス */
          //ret.type = cell.columnType;
          ret.type = "select";
          ret.selectedValue = dataItem.data[key - 1].data;
          //ret.text = person[cell.columnId];
          ret.text = dataItem.data[key - 1].dataDisable ? "*****" : dataItem.data[key - 1].data;
          ret.options = statusLists;
          ret.nonEditable = dataItem.data[key - 1].dataDisable;
          ret.isOpen = dataItem.data[key - 1].dataDisable;
          ret.className = dataItem.data[key - 1].dataDisable ? "disabled-cell" : idx % 2 == 0 ? "strip-bg-color select-like-span" : "select-like-span";
        } else {
          /** 入力：日付 */
          ret.type = "date";
          ret.date = dataItem.data[key - 1].data;
          ret.nonEditable = dataItem.data[key - 1].dataDisable;
          ret.className = dataItem.data[key - 1].dataDisable ? "disabled-cell" : idx % 2 == 0 ? "strip-bg-color" : "";
        }
        return ret;
      }),
    })),
  ];

  /** 各行のデータステート */
  const [rows, setRows] = React.useState<any>(setDataInRows(bodyData, headerInfo)); // ReactGridに各行の情報を指定

  /** undo・redoの変更履歴ステート */
  const [cellChangesIndex, setCellChangesIndex] = React.useState(() => -1);
  const [cellChanges, setCellChanges] = React.useState<CellChange<any>[][]>(() => []);

  /** MACを確認 */
  const isMacOs = () => window.navigator.appVersion.indexOf("Mac") !== -1;

  /**
   * データを更新する処理
   * 
   * @param changes  ライブラリーのデータ変更値
   */
  const handleChanges = (changes: CellChange<any>[]) => {
    if (changes[0].newCell.text !== "*****") {
      let newList = bodyData;
      changes.forEach((changeItem) => {
        let columnIdx = changeItem.columnId;
        let columnType = changeItem.type;

        newList = [...Object.values(newList)].map((item, key) => {
          if (key === changeItem.rowId) {
            // コラム名を指定
            let dataKey = `${columnIdx}`;
            let changedData = changeItem.newCell.text;

            if (columnType == "date") {
              changedData = changeItem.newCell.date;
            } else if (columnType == "select") {
              /** 別のコンポネントに処理する */
              // const changedIsopen = changeItem.newCell.isOpen;
              // changedData = changeItem.newCell.text;
              // return { ...item, [updatedFieldName + "IsOpen"]:  changedIsopen, [updatedFieldName]: changedData};
            } else if (columnType == "checkbox") {
              //changedData = changeItem.newCell.checked;
            }
              return {
                ...item,
                data: item.data.map((innerItem: any, innerIndex: any) => {
                  if (innerIndex == dataKey) {
                    return { ...innerItem, data: changedData };
                  } else {
                    return innerItem;
                  }
                })
              };
            } else {
              return item;
            }
        });
      });
      // データを変える時、変更履歴ステートに追加する
      const setChangeData: any = [newList, columnData]
      setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), setChangeData]);
      

      // 変更回数を増やす
      setCellChangesIndex(cellChangesIndex + 1);

      // 一覧表の情報 (body) を設定
      setbodyData(newList);
    }
  };

  /**
   * データが更新する時、テーブル内のデータも更新
   *
   */
  // React.useEffect(() => {
  //   setRows(setDataInRows(bodyData, headerInfo));
  //   const divToClick = document.querySelector(`.rg-header-cell[data-cell-colidx="1"][data-cell-rowidx="0"]`) as HTMLElement;
  //   if (divToClick) {
  //     console.log("CLICK", divToClick);
      
  //     divToClick.click();
  //   }
  // }, []);

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
          width: setWidth
        }
      } else {
        return item;
      }
    });

    setColumnSetting(newWidth);
    setRows(setDataInRows(bodyData, headerInfo));
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
  const simpleHandleContextMenu = (selectedRowIds: Id[], selectedColIds: Id[], selectionMode: SelectionMode, menuOptions: MenuOption[], selectedRanges: Array<CellLocation[]>): MenuOption[] => {
    if (selectedRanges[0]) {
      // 行の項目名を選択する時、行項目を取り外す
      if (selectedRanges[0]["0"].columnId == "name" || ((Object.keys(selectedRanges[0]).length - 1) == Object.keys(bodyData).length)) {       
        selectedRanges[0].shift();
      }

      if (selectedRanges[0].length == 0 || selectedRanges[0]["0"].columnId == "name") {
        return menuOptions = [];
      }
    }

    const rowId: any = (selectedRanges[0] && typeof selectedRanges[0]["0"] != "undefined") ? selectedRanges[0]["0"].rowId : null;
    const columnId: any = (selectedRanges[0]) ? selectedRanges[0]["0"].columnId : null;
    const checkMask = (selectedRanges[0]) ? bodyData[rowId].data[columnId].dataDisable : null;

    // 情報マスク処理
    if (checkMask) {
      menuOptions = [
        {
          id: "mask",
          label: "マスク解除",
          handler: () => {
            let newList = bodyData;
            selectedRanges[0].forEach((selectItem) => {
              newList = [...Object.values(newList)].map((item, key) => {
                if (key == selectItem.rowId) {
                  // return { ...item, [getcolumnId]: !checkMask };
                  return {
                    ...item,
                    data: item.data.map((innerItem: any, innerIndex: any) => {
                      if (innerIndex == selectItem.columnId) {
                        return { ...innerItem, dataDisable: false };
                      } else {
                        return innerItem;
                      }
                    })
                  };
                } else {
                  return item;
                }
              });
            });
  
            const setChangeData: any = [newList, columnData]
            setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), setChangeData]);
            setCellChangesIndex(cellChangesIndex + 1);
            setbodyData(newList);
          },
        },
      ];
    } else {
      menuOptions = [
        ...menuOptions,
        {
          id: "mask",
          label: "マスク",
          handler: () => {
            let newList = bodyData;
            selectedRanges[0].forEach((selectItem) => {
              newList = [...Object.values(newList)].map((item, key) => {
                if (key == selectItem.rowId) {
                  // return { ...item, [getcolumnId]: !checkMask };
                  return {
                    ...item,
                    data: item.data.map((innerItem: any, innerIndex: any) => {
                      if (innerIndex == selectItem.columnId) {
                        return { ...innerItem, dataDisable: true };
                      } else {
                        return innerItem;
                      }
                    })
                  };
                } else {
                  return item;
                }
              });
            });
  
            const setChangeData: any = [newList, columnData]
            setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), setChangeData]);
            setCellChangesIndex(cellChangesIndex + 1);
            setbodyData(newList);
          },
        },
      ];
    }

    return menuOptions;
  };

  /**
   * 元に戻す（ctrl + z）
   * 
   */
  const handleUndoChanges = () => {
    if (cellChangesIndex > 0) {
      // let newList = bodyData;
      // cellChanges[cellChangesIndex].forEach((changeItem) => {
      //   let columnIdx = changeItem.columnId;
      //   let columnType = changeItem.type;     

      //   newList = [...Object.values(newList)].map((item, key) => {
      //     if (key === changeItem.rowId) {
      //       // コラム名を指定
      //       let updatedFieldName = `${columnIdx}`;
      //       let changedData = columnType == "mask" ? null : changeItem.previousCell.text;

      //       if (columnType == "date") {
      //         changedData = changeItem.previousCell.date;
      //       } else if (columnType == "select") {
      //         /** 別のコンポネントに処理する */
      //         // const changedIsopen = changeItem.newCell.isOpen;
      //         // changedData = changeItem.newCell.text;
      //         // return { ...item, [updatedFieldName + "IsOpen"]:  changedIsopen, [updatedFieldName]: changedData};
      //       } else if (columnType == "checkbox") {
      //         changedData = changeItem.previousCell.checked;
      //       } else if (columnType == "mask") {
      //         const getcolumnId: any = `${changeItem.columnId}Disable`;
      //         return { ...item, [getcolumnId]: !changeItem.previousCell };
      //       }

      //       return { ...item, [updatedFieldName]: changedData };
      //     } else {
      //       return item;
      //     }
      //   });
      // });
      const getData: any = cellChanges[cellChangesIndex - 1]['0'];
      const getColumn: any = cellChanges[cellChangesIndex - 1]['1'];
      
      setColumnData(getColumn);
      setbodyData(getData);
      
      setCellChangesIndex(cellChangesIndex - 1);
    }
  };

  /**
   * やり直す（ctrl + y）
   * 
   */
  const handleRedoChanges = () => {   
    if (cellChangesIndex + 1 <= cellChanges.length - 1) {
      // let newList = bodyData;
      // cellChanges[cellChangesIndex + 1].forEach((changeItem) => {
      //   let columnIdx = changeItem.columnId;
      //   let columnType = changeItem.type;

      //   newList = [...Object.values(newList)].map((item, key) => {
      //     if (key === changeItem.rowId) {
      //       // コラム名を指定
      //       let updatedFieldName = `${columnIdx}`;
      //       let changedData = columnType == "mask" ? null : changeItem.newCell.text;

      //       if (columnType == "date") {
      //         changedData = changeItem.newCell.date;
      //       } else if (columnType == "select") {
      //         /** 別のコンポネントに処理する */
      //         // const changedIsopen = changeItem.newCell.isOpen;
      //         // changedData = changeItem.newCell.text;
      //         // return { ...item, [updatedFieldName + "IsOpen"]:  changedIsopen, [updatedFieldName]: changedData};
      //       } else if (columnType == "checkbox") {
      //         changedData = changeItem.newCell.checked;
      //       } else if (columnType == "mask") {
      //         const getcolumnId: any = `${changeItem.columnId}Disable`;
      //         return { ...item, [getcolumnId]: changeItem.previousCell };
      //       }

      //       return { ...item, [updatedFieldName]: changedData };
      //     } else {
      //       return item;
      //     }
      //   });
      // });
      const getData: any = cellChanges[cellChangesIndex + 1]['0'];
      const getColumn: any = cellChanges[cellChangesIndex + 1]['1'];
      
      setbodyData(getData);
      setColumnData(getColumn);

      setCellChangesIndex(cellChangesIndex + 1);
    }
  };

  /**
   * 
   * @param arr   Array　　　対象配列データ 
   * @param idxs  Number    対象データのキー
   * @param to    Number    配列の位置
   * @returns 
   */
  const reorderArray = <T extends {}>(arr: T[], idxs: number[], to: number) => {
    const movedElements = arr.filter((_, idx) => idxs.includes(idx));
    const targetIdx = Math.min(...idxs) < to ? to += 1 : to -= idxs.filter(idx => idx < to).length;
    const leftSide = arr.filter((_, idx) => idx < targetIdx && !idxs.includes(idx));
    const rightSide = arr.filter((_, idx) => idx >= targetIdx && !idxs.includes(idx));
    return [...leftSide, ...movedElements, ...rightSide];
  }

  /**
   * 
   * @param targetColumnId 
   * @param columnIds 
   */
  const handleColumnsReorder = (targetColumnId: Id, columnIds: Id[]) => {
    //console.log("headerSt : ", headerSt);
    // Main Change
    //console.log("columnData : ", columnData);
    
    const to = columnData.findIndex((item, key) => key === targetColumnId);
    const rowsIds = columnIds.map((id) => columnData.findIndex((rowItem, rowKey) => rowKey === id));
    console.log("to : " , to);
    console.log("rowsIds : " , rowsIds);
    console.log("Re-order : ", reorderArray(columnData, rowsIds, to));
    let newColumn = reorderArray(columnData, rowsIds, to);
    newColumn = [...Object.values(newColumn)].map((newItem, newKey) => {
      return {
        ...newItem,
        dataKey: newKey
      };
    });

    // row data
    let newList = bodyData;
    newList = newList.map((rowItem:any, rowKey: any) => {
      return {
        ...rowItem,
        data: reorderArray(rowItem.data, rowsIds, to)
      };
    });

    // データを変える時、変更履歴ステートに追加する
    const setChangeData: any = [newList, newColumn]
    setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), setChangeData]);

    // 変更回数を増やす
    setCellChangesIndex(cellChangesIndex + 1);
    
    setColumnData(newColumn);
    setbodyData(newList);
    setFocusInfo({rowId: 0, columnId: to});
  }

  /**
   * 
   * @param targetRowId 
   * @param rowIds 
   */
  const handleRowsReorder  = (targetRowId: Id, rowIds: Id[]) => {
    console.log("targetRowId : ", targetRowId);
    console.log("rowIds : ", rowIds);

    const to = bodyData.findIndex((person, key) => key === targetRowId);
    const rowsIds = rowIds.map((id) => bodyData.findIndex((person, key) => key === id));
    console.log("to : " , to);
    console.log("rowsIds : " , rowsIds);
    console.log("Re-order : ", reorderArray(bodyData, rowsIds, to));
    let newList = reorderArray(bodyData, rowsIds, to);
    // データを変える時、変更履歴ステートに追加する
    const setChangeData: any = [newList, columnData]
    setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), setChangeData]);

    // 変更回数を増やす
    setCellChangesIndex(cellChangesIndex + 1);
    setbodyData(newList);
  }

  /**
   * 
   * @param targetRowId 
   * @param rowIds 
   * @returns 
   */
  const handleCanReorderRows = (targetRowId: Id, rowIds: Id[], dropPosition: DropPosition): boolean => {
    return targetRowId !== 'header';
  }

  /**
   * データセットを確認する処理
   *
   */
  const checkSendData = () => {
    if (sendData.length == 0) {
      let setData: any = [];
      columnData.forEach((item, key) => {
        setData[key] = {};
        bodyData.forEach((data) => {
          setData[key][`itemNo${data.itemNo}`] = data[`${item.dataId}`];
        });
      });

      setSendData(setData);
    } else {
      setSendData([]);
    }
  };

  return (
    <>
      <div className="excel-grid-sample">
        <h1>
          グリッド：Excelスタイルのフィルター (React + <a href="https://reactgrid.com/">ReactGrid</a>)
        </h1>

        {/* ReactGrid */}
        <div className="sample-panel">
          <div
            className="react-grid-panel"
            style={{ width: "90vw", height: "70vh", overflow: "scroll", fontSize: "10pt" }}
            onKeyDown={(e) => {
              if ((!isMacOs() && e.ctrlKey) || e.metaKey) {
                switch (e.key) {
                  case "z":
                    handleUndoChanges();
                    return;
                  case "y":
                    handleRedoChanges();
                    return;
                }
              }
            }}
            onClick={() => { setFocusInfo(null); }}
          >
            <ReactGrid 
              rows={rows}
              columns={columnSetting}
              labels={customLabels}
              onCellsChanged={handleChanges}
              onColumnResized={handleColumnResize}
              onContextMenu={simpleHandleContextMenu}
              customCellTemplates={{ select: new SelectCellTemplate() }}
              onColumnsReordered={handleColumnsReorder}
              onRowsReordered={handleRowsReorder}
              canReorderRows={handleCanReorderRows}
              focusLocation={focusInfo}
              stickyLeftColumns={1}
              stickyTopRows={1}
              enableFillHandle
              enableRangeSelection
              enableRowSelection
              enableColumnSelection
            />
          </div>
        </div>

        <button id="set" onClick={checkSendData}>
          データセットを確認
        </button>
        <button id="clear" onClick={checkSendData}>
          クリア
        </button>
        <pre>{JSON.stringify(sendData, undefined, 2)}</pre>
      </div>
    </>
  );
}

export default App;
