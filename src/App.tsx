import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { useRecoilValue, useSetRecoilState } from "recoil";
import * as Atom from "./atom";
import { RecoilRoot } from "recoil";

/** ReactGrid */
import { ReactGrid, Column, Row, CellChange, TextCell, DefaultCellTypes, CellLocation, MenuOption, Id, SelectionMode, DropPosition } from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";
import moment from "moment";

import { SelectCell, SelectCellTemplate } from "./components/select.cell";

function App() {
  /** 一覧情報 */
  const bodyData: any[] = useRecoilValue(Atom.sampleListState);
  const setbodyData = useSetRecoilState(Atom.sampleListState);

  /** カラム */
  const columnData: any[] = useRecoilValue(Atom.sampleColumnListState);
  const setColumnData = useSetRecoilState(Atom.sampleColumnListState);
  const [columnSt, setColumnSt] = React.useState<any[]>([]);

  /** ヘッダー */
  const [headerSt, setHeaderSt] = React.useState<any[]>([]);

  /** データセット（保存する場合） */
  const [sendData, setSendData] = React.useState<any[]>([]);

  /** セレクトボックスの項目を作成 */
  const listNo: number = 20;
  let statusLists = [{ label: "", value: "" }];
  for (let index = 1; index <= listNo; index++) {
    statusLists.push({ label: `サンプル ${index}`, value: `サンプル ${index}` });
  }

  /** 初期表示 */
  React.useEffect(() => {
    /** カラム作成（縦） */
    let newColumn: any = [];

    /**　データ指定（横）  */
    const fetchData = async () => {
      try {
        /** 各カラムの情報（ヘッダー） */
        const columnResponse = await fetch("/data/searchItemRow.json");
        let columnData = await columnResponse.json();

        for (let index = 0; index < 20; index++) {
          newColumn.push({ dataNo: index + 1, dataId: "dataNo" + (index + 1), dataName: columnData[index].searchItem });
        }
        setColumnData(newColumn);

        /** 一覧表の情報（body） */
        const response = await fetch("/data/oldsearchItemRow.json");
        let data = await response.json();
        data.forEach((item: any) => {
          newColumn.forEach((column: any, key: number) => {
            let newObj = `dataNo${column.dataNo}`;
            let newIsOpenObj = `dataNo${column.dataNo}IsOpen`;
            item[newIsOpenObj] = false;

            // 無活性
            let newDisableObj = `dataNo${column.dataNo}Disable`;
            item[newDisableObj] = false;

            // マスクデータ
            let newMaskObj = `dataNo${column.dataNo}Mask`;
            item[newMaskObj] = "";

            switch (item.type) {
              case "text":
                item[newObj] = `${item.name}： ${column.dataNo}`;
                if (item.name.match(/採水者/) && column.dataNo > 1) {
                  item[newDisableObj] = true;
                  item[newMaskObj] = "*****";
                } else if (item.name.match(/ニッケル及びその化合物/)) {
                  item[newDisableObj] = true;
                  item[newMaskObj] = "*****";
                } else if (item.name.match(/ウラン及びその化合物/) && column.dataNo % 2 == 0) {
                  item[newDisableObj] = true;
                  item[newMaskObj] = "*****";
                }
                break;
              case "select":
                item[newObj] = statusLists[Math.floor(Math.random() * listNo)].value;
                break;
              case "date":
                item[newObj] = new Date(`2024-03-${key + 1}`);
                break;
              default:
                break;
            }
          });
        });
        // データを変える時、変更履歴ステートに追加する
        setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), data]);

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
    let setColumnObj: any = [{ columnId: "name", columnType: "text", width: 300, reorderable: true }];
    let setHeaderObj: any = [{ type: "header", text: "" }];
    let i = 0;

    columnData.forEach((columnItem: any) => {
      let newObjName = columnItem.dataId;
      let newHeaderName = columnItem.dataName;

      setColumnObj.push({ columnId: newObjName, columnType: "text", reorderable: true });
      setHeaderObj.push({ type: "header", text: newHeaderName });
      i++;
    });

    setColumnSt(setColumnObj);
    setHeaderSt(setHeaderObj);
  }, [columnData]);

  const getColumns = (): Column[] => columnSt;

  const headerRow: Row = {
    rowId: "header",
    cells: headerSt,
  };

  /** 一覧表の情報 (body) を設定 */
  const getRows = (people: any[]): Row[] => [
    headerRow,
    ...people.map<Row>((person, idx) => ({
      rowId: idx,
      reorderable: true,
      cells: columnSt.map((cell: any) => {
        var ret: any = new Object();
        /** 入力：テキスト */
        //if (cell.columnType == "text") {
        if (person.type == "text" || cell.columnId == "name" || person[cell.columnId + "Disable"]) {
          //ret.type = cell.columnType;
          ret.type = "text";
          ret.text = person[cell.columnId + "Disable"] ? "*****" : person[cell.columnId];
          ret.nonEditable = cell.columnId == "name" || person[cell.columnId + "Disable"] ? true : false;
          if (cell.columnId !== "name") {
            ret.className = person[cell.columnId + "Disable"] ? "disabled-cell" : idx % 2 == 0 ? "strip-bg-color" : "";
          }
        } else if (person.type == "select") {
          /** 入力：セレクトボックス */
          //ret.type = cell.columnType;
          ret.type = "select";
          ret.selectedValue = person[cell.columnId];
          //ret.text = person[cell.columnId];
          ret.text = person[cell.columnId + "Disable"] ? "*****" : person[cell.columnId];
          ret.options = statusLists;
          ret.nonEditable = person[cell.columnId + "Disable"];
          ret.isOpen = person[cell.columnId + "IsOpen"];
          ret.className = person[cell.columnId + "Disable"] ? "disabled-cell" : idx % 2 == 0 ? "strip-bg-color select-like-span" : "select-like-span";
        } else {
          /** 入力：日付 */
          ret.type = "date";
          ret.date = person[cell.columnId];
          ret.nonEditable = person[cell.columnId + "Disable"];
          ret.className = person[cell.columnId + "Disable"] ? "disabled-cell" : idx % 2 == 0 ? "strip-bg-color" : "";
        }
        return ret;
      }),
    })),
  ];

  /** 各行のデータステート */
  const [rows, setRows] = React.useState<any>(getRows(bodyData));

  /** カラムステート */
  const [columns, setColumns] = React.useState<Column[]>(getColumns());

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
    console.log("11111 :",changes);
    
    if (changes[0].newCell.text !== "*****") {
      let newList = bodyData;
      changes.forEach((changeItem) => {
        let columnIdx = changeItem.columnId;
        let columnType = changeItem.type;

        newList = [...Object.values(newList)].map((item, key) => {
          if (key === changeItem.rowId) {
            // コラム名を指定
            let updatedFieldName = `${columnIdx}`;
            let changedData = changeItem.newCell.text;

            if (columnType == "date") {
              changedData = changeItem.newCell.date;
            } else if (columnType == "select") {
              /** 別のコンポネントに処理する */
              // const changedIsopen = changeItem.newCell.isOpen;
              // changedData = changeItem.newCell.text;
              // return { ...item, [updatedFieldName + "IsOpen"]:  changedIsopen, [updatedFieldName]: changedData};
            } else if (columnType == "checkbox") {
              changedData = changeItem.newCell.checked;
            }
            return { ...item, [updatedFieldName]: changedData };
          } else {
            return item;
          }
        });
      });
      // データを変える時、変更履歴ステートに追加する
      setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), newList]);

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
  React.useEffect(() => {
    console.log("cellChangesIndex", cellChangesIndex);
    console.log("cellChanges", cellChanges);
    setRows(getRows(bodyData));
  }, [bodyData]);

  /**
   * カラムの広さを調整する処理
   *
   * @param ci
   * @param width
   */
  const handleColumnResize = (ci: any, width: number) => {
    setColumns((prevColumns) => {
      const columnIndex = prevColumns.findIndex((el) => el.columnId === ci);
      const resizedColumn = prevColumns[columnIndex];
      const updatedColumn = { ...resizedColumn, width };
      prevColumns[columnIndex] = updatedColumn;
      return [...prevColumns];
    });
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
    const columnId: any = (selectedRanges[0]) ? `${selectedRanges[0]["0"].columnId}Disable` : null;
    const checkMask = (selectedRanges[0]) ? bodyData[rowId][columnId] : null;
  
    // 情報マスク処理
    if (checkMask) {
      menuOptions = [
        {
          id: "mask",
          label: "マスク解除",
          handler: () => {
            let newList = bodyData;
            selectedRanges[0].forEach((item) => {
              const getRow: any = item.rowId;
              const getcolumnId: any = `${item.columnId}Disable`;
  
              newList = [...Object.values(newList)].map((item, key) => {
                if (key == getRow) {
                  return { ...item, [getcolumnId]: !checkMask };
                } else {
                  return item;
                }
              });
            });
  
            setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), newList]);
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
            selectedRanges[0].forEach((item) => {
              const getRow: any = item.rowId;
              const getcolumnId: any = `${item.columnId}Disable`;
  
              newList = [...Object.values(newList)].map((item, key) => {
                if (key == getRow) {
                  return { ...item, [getcolumnId]: !checkMask };
                } else {
                  return item;
                }
              });
            });
  
            setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), newList]);
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
      console.log(cellChanges);
      
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
      setCellChangesIndex(cellChangesIndex - 1);
      setbodyData(cellChanges[cellChangesIndex - 1]);
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
      setCellChangesIndex(cellChangesIndex + 1);
      setbodyData(cellChanges[cellChangesIndex + 1]);
    }
  };

  // TODO カラムの表示順を変える
  /**
   * 
   * @param arr 
   * @param idxs 
   * @param to 
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
    const to = columns.findIndex((column) => column.columnId === targetColumnId);
    const columnIdxs = columnIds.map((columnId) => columns.findIndex((c) => c.columnId === columnId));
    setColumns(prevColumns => reorderArray(prevColumns, columnIdxs, to));
  }

  // TODO 行の表示順を変える
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
    setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), newList]);

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
          >
            <ReactGrid 
              rows={rows}
              columns={columnSt}
              labels={customLabels}
              onCellsChanged={handleChanges}
              onColumnResized={handleColumnResize}
              onContextMenu={simpleHandleContextMenu}
              customCellTemplates={{ select: new SelectCellTemplate() }}
              onColumnsReordered={handleColumnsReorder}
              onRowsReordered={handleRowsReorder}
              canReorderRows={handleCanReorderRows}
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
