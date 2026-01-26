/**
 * 【共通コンポネント】サイドメニュー用のリンクリストメニュー
 * ※ 折り畳み_可
 *
 */
import React from "react";
import { Api, getMessage } from "../../common/api";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useAtom, useSetAtom } from "jotai";

//【ステート】汎用
import * as AtomCommon from "../../stores/atom";

//【ステート】サイドメニュー
import * as AtomSideMasterMenu from "../../stores/atomSideMenuMaster";
import * as AtomSideEditMenu from "../../stores/atomSideEditMenuModal";

//【ステート】確認ダイアログ
import * as AtomConfirmDialog from "../../stores/atomConfirmDialog";

// CSS
import cssSideMenuMaster from "../../scss/layouts/sidemenuMaster.module.scss";

// ReactGrid_ライブラリー
import {
  ReactGrid,
  Column,
  Row,
  CellChange,
  TextCell,
  ChevronCell,
  DefaultCellTypes,
  CellLocation,
  MenuOption,
  Id,
  SelectionMode,
  DropPosition,
} from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";
import { useQueries } from "@tanstack/react-query";

// ヘッダ列設定　※ サイドメニューにはヘッダ非表示
const dataColumns = (reorderable: boolean, resizable: boolean): Column[] => [
  { columnId: "menu", width: 375, reorderable, resizable },
];

// ヘッダ行の高さ
const height = 25;

// ヘッダ行
const headerRow: Row = {
  rowId: "header",
  reorderable: false,
  height,
  cells: [{ type: "header", text: "" }],
};

// ######### サイドメニュー操作関数　#########
/**
 * 子項目がある親項目を検索
 *
 * @param row
 * @returns
 */
const findChevronCell = (row: Row) =>
  row.cells.find((cell) => cell.type === "chevron") as ChevronCell | undefined;

/**
 * 親項目を検索
 *
 * @param rows
 * @param row
 * @returns
 */
const findParentRow = (rows: Row[], row: Row) =>
  rows.find((r) => {
    const foundChevronCell = findChevronCell(row);
    return foundChevronCell ? r.rowId === foundChevronCell.parentId : false;
  });

/**
 * 子項目がある行を確認
 *
 * @param rows
 * @param row
 * @returns
 */
const hasChildren = (rows: Row[], row: Row): boolean =>
  rows.some((r) => {
    const foundChevronCell = findChevronCell(r);
    return foundChevronCell ? foundChevronCell.parentId === row.rowId : false;
  });

/**
 * メニュー開閉確認
 *
 * @param rows
 * @param row
 * @returns
 */
const isRowFullyExpanded = (rows: Row[], row: Row): boolean => {
  const parentRow = findParentRow(rows, row);
  if (parentRow) {
    const foundChevronCell = findChevronCell(parentRow);
    if (foundChevronCell && !foundChevronCell.isExpanded) return false;
    return isRowFullyExpanded(rows, parentRow);
  }
  return true;
};

/**
 * 開いている行を取得
 *
 * @param rows
 * @returns
 */
const getExpandedRows = (rows: Row[]): Row[] =>
  rows.filter((row) => {
    const areAllParentsExpanded = isRowFullyExpanded(rows, row);
    return areAllParentsExpanded !== undefined ? areAllParentsExpanded : true;
  });

/**
 * 子項目の行を取得
 *
 * @param rows
 * @param parentRow
 * @returns
 */
const getDirectChildRows = (rows: Row[], parentRow: Row): Row[] =>
  rows.filter(
    (row) =>
      !!row.cells.find(
        (cell) =>
          cell.type === "chevron" &&
          (cell as ChevronCell).parentId === parentRow.rowId
      )
  );
// ######### サイドメニュー操作関数　#########

/**
 * インデントと子ありフラグを指定
 *
 * @param rows
 * @param parentRow
 * @param indent
 */
const assignIndentAndHasChildren = (
  rows: Row[],
  parentRow: Row,
  indent: number = 0
) => {
  ++indent;
  getDirectChildRows(rows, parentRow).forEach((row) => {
    const foundChevronCell = findChevronCell(row);
    const hasRowChildrens = hasChildren(rows, row);
    if (foundChevronCell) {
      foundChevronCell.indent = indent;
      foundChevronCell.hasChildren = foundChevronCell.hasChildren
        ? foundChevronCell.hasChildren
        : hasRowChildrens;
    }
    if (hasRowChildrens) assignIndentAndHasChildren(rows, row, indent);
  });
};

/**
 * リストメニューを作成
 *
 * @param rows
 * @returns
 */
const buildToggleListMenu = (rows: Row[]): Row[] =>
  rows.map((row) => {
    const foundChevronCell = findChevronCell(row);
    if (foundChevronCell && !foundChevronCell.parentId) {
      const hasRowChildrens = hasChildren(rows, row);
      foundChevronCell.hasChildren = hasRowChildrens;
      if (hasRowChildrens) assignIndentAndHasChildren(rows, row);
    }
    return row;
  });

// サイドメニュ_中部
const SideMenuArea = (): JSX.Element => {
  // サイドリストメニュー_データ
  const [dataSideMenuLink, setDataSideMenuLink] = useAtom(
    AtomSideMasterMenu.sideMenuLinkListState
  );

  // 選択したメニューデータアトム
  const [dataSideMenuSelected, setSideMenuSelected] = useAtom(
    AtomSideMasterMenu.sideMenuSelectedState
  );

  // サイドリストメニュー
  const [dataSideMenu, setDataSideMenu] = useAtom(
    AtomSideMasterMenu.sideMenuListState
  );
  const [dataSideMenuMaster, setDataSideMenuMaster] = useAtom(
    AtomSideMasterMenu.sideMenuMasterListState
  );

  // 編集用のメニュー_ステート
  const [dataSideEditMenuSelected, setSideEditMenuSelected] = useAtom(
    AtomSideEditMenu.sideEditMenuState
  );

  const [columns] = React.useState(() => dataColumns(true, false));
  const [rows, setRows] = React.useState(() => buildToggleListMenu([]));

  // 編集状態フラグ
  const [useInputEditingFlg, setInputEditingFlg] = useAtom(AtomCommon.inputEditingFlg);

  /**
   * 初期表示_初期データを設定
   *
   * */
  const fetchData = async () => {
    try {
      // (1)
      /** 各カラムの情報（ヘッダー） */
      // const columnResponse = await fetch('./data/menuListData.json');
      // let columnData = await columnResponse.json();
      // setDataSideMenuLink(columnData);

      // 選択しているメニューをクリア
      // setSideMenuSelected(AtomSideMenu.defaultInputSelectedMenuState);

      console.log("SIDELISTMASTER_初期表示_初期データを設定", dataSideMenuLink);

      let newData: any[] = dataSideMenuLink;
      let newDataRePosition: any = [];

      // 配列順序を調整
      rePositionAllLevel(newData, newDataRePosition);

      // リストメニューをビルド
      setDataSideMenuLink(newDataRePosition);

      /** カラム作成（縦） */
      let newRows: Row[] = [];

      const height = 25;
      const reorderable = false;

      newDataRePosition.forEach((item, key) => {
        if (item.parentId) {
          // 親項目あり
          newRows.push({
            rowId: item.rowId,
            height,
            reorderable,
            cells: [
              {
                type: item.type,
                text: item.text,
                isExpanded: item.isExpanded,
                parentId: item.parentId,
                nonEditable: true,
              },
            ],
          });
        } else {
          // 親項目なし
          newRows.push({
            rowId: item.rowId,
            height,
            reorderable,
            cells: [
              {
                type: item.type,
                text: item.text,
                isExpanded: item.isExpanded,
                nonEditable: true,
              },
            ],
          });
        }
      });

      const dataRows = (): Row[] => newRows;

      setRows(() => buildToggleListMenu(dataRows()));
      setRowsToRender([headerRow, ...getExpandedRows(newRows)]);
    } catch { }
  };

  useQuery({
    queryKey: ["sideListInit"],
    queryFn: async () => {
      await fetchData();
      return true;
    },
    refetchOnWindowFocus: false,        // フォーカス外れた時リーレンダリングはオフにする
  });

  /**
   * リストメニューの更新があった時
   *
   */
  const sideListMenuUpdate = async () => {
    /** カラム作成（縦）_ヘッダのみ */
    console.log("SIDELISTMASTER_dataSideMenuMaster", dataSideMenuMaster);
    console.log("SIDELISTMASTER_リストメニューの更新があった時", dataSideMenuLink);

    let newData: any[] = dataSideMenuLink;
      let newDataRePosition: any = [];

      // 配列順序を調整
      rePositionAllLevel(newData, newDataRePosition);

      // リストメニューをビルド
      setDataSideMenuLink(newDataRePosition);

      /** カラム作成（縦） */
      let newRows: Row[] = [];

      const height = 25;
      const reorderable = false;

      newDataRePosition.forEach((item, key) => {
        if (item.parentId) {
          // 親項目あり
          newRows.push({
            rowId: item.rowId,
            height,
            reorderable,
            cells: [
              {
                type: item.type,
                text: item.text,
                isExpanded: item.isExpanded,
                parentId: item.parentId,
                nonEditable: true,
              },
            ],
          });
        } else {
          // 親項目なし
          newRows.push({
            rowId: item.rowId,
            height,
            reorderable,
            cells: [
              {
                type: item.type,
                text: item.text,
                isExpanded: item.isExpanded,
                nonEditable: true,
              },
            ],
          });
        }
      });

      const dataRows = (): Row[] => newRows;

      setRows(() => buildToggleListMenu(dataRows()));
      setRowsToRender([headerRow, ...getExpandedRows(newRows)]);
  };

  useQuery({
    queryKey: ["sideListMenuUpdate", dataSideMenuLink],
    queryFn: () => {
      sideListMenuUpdate();
      return true;
    }
  });


  // 親項目を表示に設定「ループ関数」
  const setShowFlgFilter = (newSideMenu: any, parentId: number) => {
    newSideMenu.forEach((flg, index) => {
      if (flg.rowId == parentId) {
        flg.showFlg = true;

        // トップ階層の親項目まで
        if (flg.parentId) {
          setShowFlgFilter(newSideMenu, flg.parentId);
        }
      }
    });
  };

  // データ行を作成
  const [rowsToRender, setRowsToRender] = React.useState<Row[]>([
    headerRow,
    ...getExpandedRows(rows),
  ]);

  /**
   * リストメニューをビルド
   *
   * @param activeId
   */
  const buildRowListMenu = (
    data: any = dataSideMenuMaster,
    activeId: any = null
  ) => {
    // カラム作成（縦）
    let newRows: Row[] = [];

    // 行の高さ
    const height = 25;

    // 並び替えフラグ
    const reorderable = false;

    //
    const className = "activated_menu";

    // Rowsデータに変換
    data.forEach((item, key) => {
      if (item.parentId) {
        newRows.push({
          rowId: item.rowId, // 行ID
          height, // 行の高さ
          reorderable, // 並び替えフラグ
          cells: [
            {
              type: item.type, // セル種（chevron：折り畳み可能なセル）
              text: item.text, // セルのテキスト（項目名称）
              isExpanded: item.isExpanded, // 折り畳み状態フラグ
              parentId: item.parentId, // 親ID
              className: activeId == item.rowId ? className : "",
              hasChildren: item.isParent ? true : false,
            },
          ],
        });
      } else {
        newRows.push({
          rowId: item.rowId, // 行ID
          height, // 行の高さ
          reorderable, // 並び替えフラグ
          cells: [
            {
              type: item.type, // セル種（chevron：折り畳み可能なセル）
              text: item.text, // セルのテキスト（項目名称）
              isExpanded: item.isExpanded, // 折り畳み状態フラグ
              className: activeId == item.rowId ? className : "",
              hasChildren: item.isParent ? true : false,
            },
          ],
        });
      }
    });

    // Row データ設定
    const dataRows = (): Row[] => newRows;

    // リストメニューをビルド
    setRows(() => buildToggleListMenu(dataRows()));

    // リストメニューをレンダー
    setRowsToRender([headerRow, ...getExpandedRows(newRows)]);
  };

  /**
   * データを更新
   *
   * @param changes
   */
  const handleChanges = (changes: CellChange[]) => {
    console.log("change", changes);

    const newRows = [...rows];
    changes.forEach((change) => {
      const changeRowIdx = rows.findIndex((el) => el.rowId === change.rowId);
      const changeColumnIdx = columns.findIndex(
        (el) => el.columnId === change.columnId
      );
      newRows[changeRowIdx].cells[changeColumnIdx] = change.newCell;
    });
    setRows(buildToggleListMenu(newRows));
    setRowsToRender([headerRow, ...getExpandedRows(newRows)]);
  };

  /**
   * 同じ階層の最後項目の位置を取得
   *
   * @param addPositonData
   */
  const checkLastPosition = (addPositonData: any) => {
    console.log("checkLastPosition -- ", addPositonData);

    addPositonData.forEach((element) => {
      dataSideMenuMaster.forEach((item, key) => {
        if (element.id == item.rowId) {
          element.id = item.rowId;
          element.parentId = item.rowId;

          if (!element.topParentId) {
            element.topParentId = item.parentId;
          }
        } else if (element.parentId == item.parentId) {
          element.id = item.rowId;
        }
      });
    });

    if (
      dataSideMenuMaster.find((data) => data.parentId == addPositonData[0].id)
    ) {
      addPositonData[0].parentId = addPositonData[0].id;
      checkLastPosition(addPositonData);
    } else {
    }
  };

  /**
   * 位置確認、上・下移動操作可を設定
   *
   * @param rowId
   */
  const handlerCheckPosition = (rowId: any) => {
    const selectedRowId = rowId;
    const selectedRowData = dataSideMenuMaster.find((row) => {
      return row.rowId == selectedRowId ? row : null;
    });

    let maxOrder: number = 0;
    dataSideMenuMaster.forEach((row, key) => {
      if (selectedRowData.level == 1) {
        if (row.level == 1 && maxOrder < row.order) {
          maxOrder = row.order;
        }
      } else {
        if (row.parentId == selectedRowData.parentId && maxOrder < row.order) {
          maxOrder = row.order;
        }
      }
    });

    // コンテキストDOMを取得
    const domContextMenu = document.getElementsByClassName(
      "rg-context-menu-option"
    );

    // 1番目の項目は上に移動の操作を非活性に設定
    if (selectedRowData.order == 1) {
      domContextMenu[3].classList.add("disabled");
    } else {
      domContextMenu[3].classList.remove("disabled");
    }

    //
    if (selectedRowData.order == maxOrder) {
      domContextMenu[4].classList.add("disabled");
    } else {
      domContextMenu[4].classList.remove("disabled");
    }
  };

  /**
   * 配列順序を調整_ループ
   *
   * @param data
   * @param newData
   * @param level
   */
  const rePositionAllLevel = (data: any, newData: any, level: number = 1) => {
    let reOrderNo: number = 1;
    data.forEach((item, key) => {
      if (item.level == level) {
        let isHasChild = dataSideMenuMaster.some((r) => {
          return r ? r.parentId === item.rowId : false;
        });
        if (isHasChild) {
          const getParentData: any = dataSideMenuMaster.filter(
            (row: any) => row.parentId == item.rowId
          );

          // 順序調整
          item.order = reOrderNo;
          reOrderNo += 1;

          // データ追加
          newData.push(item);
          rePositionAllLevel(getParentData, newData, level + 1);
        } else {
          // 順序調整
          item.order = reOrderNo;
          reOrderNo += 1;

          // データ追加
          newData.push(item);
        }
      }
    });
  };

  /**
   * 【コンテキスト】項目を上・下に移動の処理
   *
   * @param rowId
   * @param position
   */
  const handlerMoveData = (rowId: any, position: string) => {
    // 追加位置を取得
    const selectedRowId = rowId;
    const selectedParentId = dataSideMenuMaster.find((row) => {
      return row.rowId == selectedRowId ? row.parentId : null;
    });

    let checkOrder: number = 0;
    if (position === "up") {
      checkOrder = selectedParentId.order - 1;
    } else {
      checkOrder = selectedParentId.order + 1;
    }

    // 親項目の場合
    let selectedRowIndex = 0;
    let selectedRowOrder = 0;
    let selectedRowData: any = null;

    let moveIndex: number = 0;
    let moveRowOrder = 0;
    let moveRowData: any = null;

    let newData: any[] = dataSideMenuMaster;
    let newDataRePosition: any = [];

    // 選択項目
    dataSideMenuMaster.forEach((row, key) => {
      if (row.rowId == selectedRowId) {
        selectedRowIndex = key;
        selectedRowOrder = row.order;
        selectedRowData = row;
      }

      if (
        selectedParentId.parentId == row.parentId &&
        checkOrder == row.order
      ) {
        moveIndex = key;
        moveRowOrder = row.order;
        moveRowData = row;
      }
    });

    selectedRowData.order = moveRowOrder;
    moveRowData.order = selectedRowOrder;

    newData[moveIndex] = selectedRowData;
    newData[selectedRowIndex] = moveRowData;

    // 配列順序を調整
    rePositionAllLevel(newData, newDataRePosition);

    // リストメニューをビルド
    setDataSideMenuMaster(newDataRePosition);
    buildRowListMenu(newDataRePosition, selectedRowId);
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
      handlerCheckPosition(selectedRanges[0][0].rowId);
    }

    menuOptions = [
      {
        id: "create-input-menu",
        label: "類似入力画面で作成(ラベル)",
        // handler: () => {
        //     // ※ 操作⓶：フォルダ見たい項目を追加処理
        //     // 追加位置を取得
        //     const selectedRowId = selectedRanges[0][0].rowId;
        //     const selectedParentId = dataSideMenuMaster.find((row) => { return row.rowId == selectedRowId ? row.parentId : null });

        //     let newData: any[] = dataSideMenuMaster;
        //     let addNewDataIndex: number = 0;                // 追加位置
        //     let addNewDataOrder: number = 0;                // 最大の順序番号
        //     let maxRowId: number = 0;                       // 最大行ID
        //     let currentData: any = null;                    // 判断中のデータ
        //     let childCnt: number = 0;                       // 子項目の確認状態 ※ 0より：確認中

        //     dataSideMenuMaster.forEach((item, key) => {
        //         if (selectedParentId.parentId == item.parentId && item.order > addNewDataOrder) {
        //             // 同親ID・順序 > 新順序
        //             addNewDataOrder = item.order;
        //             addNewDataIndex = key;
        //             currentData = item;
        //         } else if ((currentData && currentData.rowId == item.parentId && currentData.level < item.level)) {
        //             // 同最新データの親ID・最新データの階層 < 階層
        //             childCnt += 1;
        //             addNewDataIndex = key;
        //         } else if (childCnt > 0 && currentData.level < item.level) {
        //             // 子項目・最新データの階層 < 階層
        //             childCnt += 1;
        //             addNewDataIndex = key;
        //         } else {
        //             // その他
        //             childCnt = 0;
        //         }

        //         // 最大行IDを設定
        //         if (item.rowId > maxRowId) {
        //             maxRowId = item.rowId;
        //         }

        //     });

        //     // 新項目を設定
        //     const addNewRow: any = {
        //         rowId: maxRowId + 1,
        //         parentId: selectedParentId.parentId,
        //         isParent: true,
        //         text: "xxxxxxxxxxx新規追加項目_" + selectedParentId.parentId + "_" + (maxRowId + 1),
        //         type: selectedParentId.type,
        //         isExpanded: selectedParentId.isExpanded,
        //         showFlg: selectedParentId.showFlg,
        //         level: selectedParentId.level,
        //         order: addNewDataOrder + 1
        //     }

        //     // 追加位置に新項目を追加
        //     newData.splice(addNewDataIndex + 1, 0, addNewRow);

        //     // リストメニューをビルド
        //     setDataSideMenuMaster(newData);
        //     buildRowListMenu(maxRowId + 1);
        // }
        handler: () => {
          // ※ 操作⓵：同じ階層で項目を作成
          // 追加位置を取得
          const selectedRowId = selectedRanges[0][0].rowId;
          const selectedParentId = dataSideMenuMaster.find((row) => {
            return row.rowId == selectedRowId ? row.parentId : null;
          });

          let newData: any[] = dataSideMenuMaster; // 調整のデータ
          let newDataRePosition: any = []; // 調整のデータ_順序調整
          let addNewDataIndex: number = 0; // 追加位置
          let addNewDataOrder: number = 0; // 最大の順序番号
          let maxRowId: number = 0; // 最大行ID
          let currentData: any = null; // 判断中のデータ
          let childCnt: number = 0; // 子項目の確認状態 ※ 0より：確認中

          dataSideMenuMaster.forEach((item, key) => {
            if (
              selectedParentId.parentId == item.parentId &&
              item.order > addNewDataOrder
            ) {
              // 同親ID・順序 > 新順序
              addNewDataOrder = item.order;
              addNewDataIndex = key;
              currentData = item;
            } else if (
              currentData &&
              currentData.rowId == item.parentId &&
              currentData.level < item.level
            ) {
              // 同最新データの親ID・最新データの階層 < 階層
              childCnt += 1;
              addNewDataIndex = key;
            } else if (childCnt > 0 && currentData.level < item.level) {
              // 子項目・最新データの階層 < 階層
              childCnt += 1;
              addNewDataIndex = key;
            } else {
              // その他
              childCnt = 0;
            }

            // 最大行IDを設定
            if (item.rowId > maxRowId) {
              maxRowId = item.rowId;
            }
          });

          // 新項目を設定
          const addNewRow: any = {
            rowId: maxRowId + 1,
            parentId: selectedParentId.parentId,
            isParent: true,
            text:
              "xxxxx_新規ラベル_" +
              selectedParentId.parentId +
              "_" +
              (maxRowId + 1),
            type: selectedParentId.type,
            isExpanded: selectedParentId.isExpanded,
            showFlg: selectedParentId.showFlg,
            level: selectedParentId.level,
            order: addNewDataOrder + 1,
          };

          // 追加位置に新項目を追加
          newData.push(addNewRow);
          console.log("newData >>> ", newData);

          // 配列順序を調整
          rePositionAllLevel(newData, newDataRePosition);

          // リストメニューをビルド
          setDataSideMenuMaster(newDataRePosition);
          buildRowListMenu(newDataRePosition, maxRowId + 1);
        },
      },
      {
        id: "change-input-menu-name",
        label: "編集",
        handler: () => {
          const getDataRow: any = rows.filter(
            (row) => row.rowId == selectedRanges[0][0].rowId
          );
          const getSelectParent: any = rows.filter(
            (row: any) => row.cells[0].hasChildren
          );
          // const getSelectParent: any = rows;
          const setSelectParent: any = [];

          // 親の選択肢を設定
          getSelectParent.forEach((item) => {
            // const blankStr = '　';
            // const labelText = blankStr.repeat(item.cells[0].indent) + item.cells[0].text;
            setSelectParent.push({
              label: item.cells[0].text,
              value: item.rowId,
            });
          });

          // 子画面用の編集データ
          setSideEditMenuSelected({
            rowId: getDataRow[0].rowId,
            parentId: getDataRow[0].cells[0].parentId,
            parentIdEdit: getDataRow[0].cells[0].parentId,
            text: getDataRow[0].cells[0].text,
            textEdit: getDataRow[0].cells[0].text,
            setSelectParent: setSelectParent,
          });
        },
      },
      {
        id: "create-label-menu",
        label: "メニューラベル追加",
        handler: () => {
          // ※ 操作⓵：同じ階層で項目を作成
          // 追加位置を取得
          const selectedRowId = selectedRanges[0][0].rowId;
          const selectedParentId = dataSideMenuMaster.find((row) => {
            return row.rowId == selectedRowId ? row.parentId : null;
          });

          let newData: any[] = dataSideMenuMaster; // 調整のデータ
          let newDataRePosition: any = []; // 調整のデータ_順序調整
          let addNewDataIndex: number = 0; // 追加位置
          let addNewDataOrder: number = 0; // 最大の順序番号
          let maxRowId: number = 0; // 最大行ID
          let currentData: any = null; // 判断中のデータ
          let childCnt: number = 0; // 子項目の確認状態 ※ 0より：確認中

          dataSideMenuMaster.forEach((item, key) => {
            if (
              selectedParentId.parentId == item.parentId &&
              item.order > addNewDataOrder
            ) {
              // 同親ID・順序 > 新順序
              addNewDataOrder = item.order;
              addNewDataIndex = key;
              currentData = item;
            } else if (
              currentData &&
              currentData.rowId == item.parentId &&
              currentData.level < item.level
            ) {
              // 同最新データの親ID・最新データの階層 < 階層
              childCnt += 1;
              addNewDataIndex = key;
            } else if (childCnt > 0 && currentData.level < item.level) {
              // 子項目・最新データの階層 < 階層
              childCnt += 1;
              addNewDataIndex = key;
            } else {
              // その他
              childCnt = 0;
            }

            // 最大行IDを設定
            if (item.rowId > maxRowId) {
              maxRowId = item.rowId;
            }
          });

          // 新項目を設定
          const addNewRow: any = {
            rowId: maxRowId + 1,
            parentId: selectedParentId.parentId,
            isParent: true,
            text:
              "XXXXX　" +
              selectedParentId.inspectionKbnName,
            type: selectedParentId.type,
            isExpanded: selectedParentId.isExpanded,
            showFlg: selectedParentId.showFlg,
            level: selectedParentId.level,
            order: addNewDataOrder + 1,
          };

          // 追加位置に新項目を追加
          newData.push(addNewRow);
          console.log("newData >>> ", newData);

          // 配列順序を調整
          rePositionAllLevel(newData, newDataRePosition);

          // リストメニューをビルド
          setDataSideMenuMaster(newDataRePosition);
          buildRowListMenu(newDataRePosition, maxRowId + 1);
        },
      },
      {
        id: "create-new-input-menu",
        label: "新規入力画面で作成",
        handler: () => {
          // 追加位置を取得
          const selectedRowId = selectedRanges[0][0].rowId;
          const selectedParentId = dataSideMenuMaster.find((row) => {
            return row.rowId == selectedRowId ? row.parentId : null;
          });

          let newData: any[] = dataSideMenuMaster;
          let newDataRePosition: any = [];
          let maxRowId: number = 0; // 最大行ID
          let maxOrder: number = 0;

          dataSideMenuMaster.forEach((item, key) => {
            // 最大行IDを設定
            if (item.rowId > maxRowId) {
              maxRowId = item.rowId;
            }

            if (item.parentId == selectedRowId && item.order > maxOrder) {
              maxOrder = item.order;
            }
          });

          newData.push({
            rowId: maxRowId + 1,
            parentId: selectedRowId,
            isParent: false,
            text: "xxxxxxxxxxx新画面",
            type: "chevron",
            isExpanded: true,
            level: selectedParentId.level + 1,
            order: maxOrder + 1,
          });

          // 配列順序を調整
          rePositionAllLevel(newData, newDataRePosition);

          // リストメニューをビルド
          setDataSideMenuMaster(newDataRePosition);
          buildRowListMenu(newDataRePosition, maxRowId + 1);
        },
      },
      {
        id: "move-menu-top",
        label: "メニューを上に移動",
        handler: () => {
          handlerMoveData(selectedRanges[0][0].rowId, "up");
        },
      },
      {
        id: "move-menu-bottom",
        label: "メニューを下に移動",
        handler: () => {
          handlerMoveData(selectedRanges[0][0].rowId, "down");
        },
      },
      {
        id: "delete-input-menu",
        label: "入力画面を削除",
        handler: () => {
          setDataSideMenuMaster((prevMenu) => {
            console.log("prevMenu >>> ", prevMenu);
            console.log("selectedRowIds >>> ", selectedRanges);

            return [
              ...prevMenu.filter((menu, idx) =>
                selectedRanges[0][0].rowId !== menu.rowId ? true : false
              ),
            ];
          });

          // TODO 一覧ビルド
        },
      },
    ];

    return menuOptions;
  };

  /**
   * 選択しているメニューにアクティブ背景を調整
   *
   * @param location
   */
  const updateActionMenu = (location: CellLocation) => {
    // 選択したセルを取得
    const changedRow: any = rows.filter((row) => row.rowId == location.rowId);

    // 親項目か子項目かを判断
    if (!changedRow[0].cells[0].hasChildren) {
      // 選択画面表示_子項目
      // setSideMenuSelected(changedRow[0].cells[0].text)
    }

    // 親項目開閉トグル_親項目
    const newRows: any = [...rows];
    newRows.forEach((row, key) => {
      const newCell: any = rows[key].cells[0];
      const setParentId = newCell.parentId ? newCell.parentId : null;

      if (row.rowId == location.rowId) {
        newRows[key].cells[0] = {
          type: newCell.type,
          text: newCell.text,
          isExpanded: !changedRow[0].cells[0].hasChildren
            ? newCell.isExpanded
            : !newCell.isExpanded,
          parentId: setParentId,
          nonEditable: true,
          className: "activated_menu",
          hasChildren: newCell.hasChildren,
        };
      } else {
        newRows[key].cells[0] = {
          type: newCell.type,
          text: newCell.text,
          isExpanded: newCell.isExpanded,
          parentId: setParentId,
          nonEditable: true,
          className: "",
          hasChildren: newCell.hasChildren,
        };
      }
    });

    // 親項目開閉
    const dataRows = (): Row[] => newRows;
    setRows(buildToggleListMenu(dataRows()));
    setRowsToRender([headerRow, ...getExpandedRows(newRows)]);
  };

  /**
   * 【コンテキスト】子画面に編集データを保存
   *
   */
  React.useEffect(() => {
    if (dataSideEditMenuSelected) {
      // 編集データがある場合
      if (
        dataSideEditMenuSelected.text !== dataSideEditMenuSelected.textEdit ||
        dataSideEditMenuSelected.parentId !==
        dataSideEditMenuSelected.parentIdEdit
      ) {
        // 選択しているデータを設定
        const selectedRowId = dataSideEditMenuSelected.rowId;
        const selectedParentId: number = parseInt(
          dataSideEditMenuSelected.parentIdEdit
        );
        let selectedRowIndex = 0;
        let selectedRowData: any = null;

        // 判断変数
        let curOrder: number = 0;
        let curIndex: number = 0;
        let curParentLevel: number = 0;
        let childCnt: number = 0; // 子項目の確認状態 ※ 0より：確認中
        let currentData: any = null; // 判断中のデータ

        // データ配列
        let newData: any[] = dataSideMenuMaster; // 調整のデータ
        let newDataRePosition: any = []; // 調整のデータ_順序調整

        dataSideMenuMaster.forEach((row, key) => {
          if (row.rowId == selectedRowId) {
            selectedRowIndex = key;
            selectedRowData = row;
          }

          if (selectedParentId == row.rowId) {
            // 親のレベル
            curParentLevel = row.level;
          }

          if (selectedParentId == row.parentId) {
            // 同親ID・順序 > 新順序
            if (curOrder < row.order) {
              curIndex = key;
              curOrder = row.order;
              currentData = row;
            }
          } else if (
            currentData &&
            currentData.rowId == row.parentId &&
            currentData.level < row.level
          ) {
            // 同最新データの親ID・最新データの階層 < 階層
            childCnt += 1;
            curIndex = key;
          } else if (childCnt > 0 && currentData.level < row.level) {
            // 子項目・最新データの階層 < 階層
            childCnt += 1;
            curIndex = key;
          } else {
            // その他
            childCnt = 0;
          }
        });

        // 選択しているデータを取消
        newData.splice(selectedRowIndex, 1);

        // 編集データを指定
        selectedRowData.text = dataSideEditMenuSelected.textEdit;
        selectedRowData.parentId = Number(
          dataSideEditMenuSelected.parentIdEdit
        );
        selectedRowData.order = curOrder + 1;
        if (
          dataSideEditMenuSelected.parentId !==
          dataSideEditMenuSelected.parentIdEdit
        ) {
          // 親ID変更がある場合
          selectedRowData.level = curParentLevel + 1;
        }

        // 調整データを末尾に指定
        newData.push(selectedRowData);

        // 配列順序を調整
        rePositionAllLevel(newData, newDataRePosition);
        console.log("newDataRePosition >>> ", newDataRePosition);

        // リストメニューをビルド
        setDataSideMenuMaster(newDataRePosition);
        buildRowListMenu(newDataRePosition, selectedRowId);

        setSideEditMenuSelected(null);

        // TODO : 親を他の親の中に移動☓
      }
    }
  }, [dataSideEditMenuSelected]);

  // 確認ダイアログ設定
  const setDialog = useSetAtom(AtomConfirmDialog.confirmDialogAtom);

  // JSXリターン
  return (
    // 折り畳みリストメニュー
    <div
      id="main-sidebar-master-middle"
      className={`container_row ${cssSideMenuMaster.sidemenu_middle}`}
    >
      {/* <ListCollapse
                data={dataSideMenu}
            /> */}

      <ReactGrid
        rows={rowsToRender}
        columns={columns}
        // onCellsChanged={handleChanges}
        onContextMenu={handlerContextMenu}
        // メニュークリック処理
        onFocusLocationChanged={(location: CellLocation) => {
          updateActionMenu(location);
        }}
      />
    </div>
  );
};

interface Props { }

// コンポネントエクスポート
export var SideListMaster: React.FC<Props> = function ({ }) {
  return (
    <>
      {/* サイドメニュ */}
      <SideMenuArea />
    </>
  );
};
