import React, { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Api, getMessage } from "../../common/api.tsx";
import * as Const from "../../common/const.tsx";
import { useAtom, useSetAtom } from "jotai";
import { InputText, ListCollapse } from "../common/index.tsx";
import { EditMenuModal } from "../modals/index.ts";

// サイドメニュスタイル
import cssSideMenu from "../../scss/layouts/sidemenu.module.scss";
import cssSideMenuMaster from "../../scss/layouts/sidemenuMaster.module.scss";

// サイドメニューアトム
import * as AtomCommon from "../../stores/atom.tsx";
import * as AtomSideMasterMenu from "../../stores/atomSideMenuMaster.tsx";
import * as AtomSideEditMenu from "../../stores/atomSideEditMenuModal.tsx";
import * as AtomSideMenu from "../../stores/atomSideMenu.tsx";

//
import * as SideMenu from "./sidemenu.tsx";

// グリッドテーブルスタイル
import cssGridTable from "../../scss/common/gridTable.module.scss";

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
import { useQuery } from "@tanstack/react-query";

// 列インターフェース
const dataColumns = (reorderable: boolean, resizable: boolean): Column[] => [
  { columnId: "id", reorderable, resizable, width: 280 },
];

// 列の高さ
const height = 0;

// 列のヘッダ
const headerRow: Row = {
  rowId: "header",
  reorderable: true,
  height,
  cells: [],
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
    const foundChevronCell: any = findChevronCell(r);
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

/**
 * サイドメニュー閉じる
 *
 */
const SideMenuToggleArea = (): JSX.Element => {
  // ナビゲーション
  const navigate = useNavigate();
  const url = useLocation();

  // 開閉フラグ
  const [openMenuFlg, setOpenMenuFlg] = React.useState<boolean>(true);

  // メッセージ
  const [getResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);

  // メニューデータ
  const [dataSideMenuLink, setDataSideMenuLink] = useAtom(
    AtomSideMenu.sideMenuLinkListState
  );

  const [barWidth, setBarWidth] = useAtom(
    AtomSideMasterMenu.sideMenuWidthState
  );

  /**
   * 開閉ボタンの処理
   *
   */
  React.useEffect(() => {
    if (openMenuFlg) {
      // サイドバーのサイズが伸びる
      setBarWidth(400);
      if (document.getElementById("main-content-table")) {
        document.getElementById("main-content-table")!.style.width =
          "calc(100% - 415px)";
      }

      // 絞り込み検索・リストメニュー・カレンダー_表示
      if (document.getElementById("main-sidebar-top")) {
        document.getElementById("side-search-menu")!.style.visibility =
          "visible";
        document.getElementById("main-sidebar-top")!.style.visibility =
          "visible";
      }
      document.getElementById("main-sidebar-middle")!.style.visibility =
        "visible";
      if (document.getElementById("main-sidebar-bottom")) {
        document.getElementById("main-sidebar-bottom")!.style.visibility =
          "visible";
      }
    } else {
      // サイドバーのサイズが縮む
      setBarWidth(50);
      if (document.getElementById("main-content-table")) {
        document.getElementById("main-content-table")!.style.width =
          "calc(100% - 65px)";
      }

      // 絞り込み検索・リストメニュー・カレンダー_非表示
      if (document.getElementById("main-sidebar-top")) {
        document.getElementById("side-search-menu")!.style.visibility =
          "hidden";
        document.getElementById("main-sidebar-top")!.style.visibility =
          "hidden";
      }
      document.getElementById("main-sidebar-middle")!.style.visibility =
        "hidden";
      if (document.getElementById("main-sidebar-bottom")) {
        document.getElementById("main-sidebar-bottom")!.style.visibility =
          "hidden";
      }
    }
    setBarWidth(openMenuFlg ? 400 : 50);
  }, [openMenuFlg]);

  // 1024px以下の初期表示画面はサイドメニュを閉じる（ログインした後だけ開いたまま）
  React.useEffect(() => {
    if (window.innerWidth <= 1024 && url.pathname !== "/menu") {
      //toggleSidebar();
    }
  }, []);

  // 下にスクロールすると、トップのスペースを削除
  React.useEffect(() => {
    window.onscroll = function () {
      if (window.pageYOffset === 0) {
        document
          .getElementById("main-sidebar")!
          .classList.remove("side_menu_remove_top");
        document.getElementById("sidemenu-toggle-icon")!.style.top = "72px";
      } else {
        document
          .getElementById("main-sidebar")!
          .classList.add("side_menu_remove_top");
        document.getElementById("sidemenu-toggle-icon")!.style.top = "12px";
      }
    };
  });

  return (
    <div
      id="main-sidebar-toggle"
      className={`container_row ${cssSideMenu.sidemenu_top}`}
      onClick={() => {
        setOpenMenuFlg(!openMenuFlg);
      }}
    >
      <div
        id="sidemenu-toggle-text"
        className={
          openMenuFlg
            ? `${cssSideMenu.sidemenu_top_text_open}`
            : `${cssSideMenu.sidemenu_top_text_close}`
        }
      >
        サイドメニューを閉じる
      </div>
      <div
        id="sidemenu-toggle-icon"
        title={openMenuFlg ? `サイドメニューを閉じる` : `サイドメニューを開く`}
        className={
          openMenuFlg
            ? `${cssSideMenu.sidemenu_open}`
            : `${cssSideMenu.sidemenu_close}`
        }
      ></div>
    </div>
  );
};

// サイドメニュ_中部
const SideMenuArea = (): JSX.Element => {
  // メッセージ
  const [getResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);
  // ##### Jotai ステート #####
  // サイドリストメニュー
  const [dataSideMenu, setDataSideMenu] = useAtom(
    AtomSideMasterMenu.sideMenuListState
  );
  const [dataSideMenuMaster, setDataSideMenuMaster] = useAtom(
    AtomSideMasterMenu.sideMenuMasterListState
  );

  // 選択したメニューデータ
  const [dataSideMenuSelected, setSideMenuSelected] = useAtom(
    AtomSideMasterMenu.sideMenuMasterSelectedState
  );

  // 編集用のメニュー_ステート
  const [dataSideEditMenuSelected, setSideEditMenuSelected] = useAtom(
    AtomSideEditMenu.sideEditMenuState
  );

  // メニューデータ
  const [dataSideMenuLink, setDataSideMenuLink] = useAtom(
    AtomSideMenu.sideMenuLinkListState
  );

  // ##### React Grid ステート #####
  // 列・行
  const [columns] = React.useState(() => dataColumns(true, false));
  const [rows, setRows] = React.useState(() => buildToggleListMenu([]));

  const url = useLocation();

  /**
   * 初期表示_初期データを設定
   *
   * */
  React.useEffect(() => {
    if (url.pathname == "/MNG060") {
      // if (false) {
      // 報告書画面系のメニュー一覧を取得
      const params = {
        affiliation_section_no: localStorage.getItem("affiliationSectionNo"),
        security_level: localStorage.getItem("securityLevel"),
      };

      Api.post("/MNG060/getReportMenu", setResultMessage, params)
        .then((data: any) => {
          if (data.menuData.length <= 0) {
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["PM-0006E", "報告書メニュー"]));
            setResultMessage(errorInfo);
          } else {
            // 設定用のメニュー構成_ステート
            setDataSideMenuMaster(data.menuData);

            // カラム作成（縦）
            let newRows: Row[] = [];

            // 行の高さ
            const height = 25;

            // 並び替えフラグ
            const reorderable = true;

            // Rowsデータに変換
            data.menuData.forEach((item, key) => {
              // 親か子か確認
              if (item.parentId) {
                // 子項目の場合
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
                      hasChildren: item.isParent ? true : false,
                    },
                  ],
                });
              } else {
                // 親項目の場合
                newRows.push({
                  rowId: item.rowId, // 行ID
                  height, // 行の高さ
                  reorderable, // 並び替えフラグ
                  cells: [
                    {
                      type: item.type, // セル種（chevron：折り畳み可能なセル）
                      text: item.text, // セルのテキスト（項目名称）
                      isExpanded: item.isExpanded, // 折り畳み状態フラグ
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
          }
        })
        .catch((error: Error) => {
          // 内部エラーメッセージを表示
          if (error.message == Const.HTTP_STATUS_CODE["500"]) {
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["PM-0003E"]));
            setResultMessage(errorInfo);
          }
        });
    } else {
      Api.get("/getInputMenu", setResultMessage)
        .then((data: any) => {
          if (data.menuData.length <= 0) {
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["PM-0006E", "報告書メニュー"]));
            setResultMessage(errorInfo);
          } else {
            // 設定用のメニュー構成_ステート
            setDataSideMenuMaster(data.menuData);

            // カラム作成（縦）
            let newRows: Row[] = [];

            // 行の高さ
            const height = 25;

            // 並び替えフラグ
            const reorderable = true;

            // Rowsデータに変換
            data.menuData.forEach((item, key) => {
              // 親か子か確認
              if (item.parentId) {
                // 子項目の場合
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
                      hasChildren: item.isParent ? true : false,
                    },
                  ],
                });
              } else {
                // 親項目の場合
                newRows.push({
                  rowId: item.rowId, // 行ID
                  height, // 行の高さ
                  reorderable, // 並び替えフラグ
                  cells: [
                    {
                      type: item.type, // セル種（chevron：折り畳み可能なセル）
                      text: item.text, // セルのテキスト（項目名称）
                      isExpanded: item.isExpanded, // 折り畳み状態フラグ
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
          }
        })
        .catch((error: Error) => {
          // 内部エラーメッセージを表示
          if (error.message == Const.HTTP_STATUS_CODE["500"]) {
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["PM-0003E"]));
            setResultMessage(errorInfo);
          }
        });
    }
  }, []);

  /**
   * リストメニューの更新があった時
   *
   */
  // React.useEffect(() => {
  //     console.log("dataSideMenuMaster更新あり", dataSideMenuMaster);

  //     // カラム作成（縦）
  //     let newRows: Row[] = [];

  //     // 行の高さ
  //     const height = 25;

  //     // 並び替えフラグ
  //     const reorderable = false;

  //     // Rowsデータに変換
  //     dataSideMenuMaster.forEach((item, key) => {
  //         if (item.parentId) {
  //             newRows.push(
  //                 {
  //                     rowId: item.rowId,              // 行ID
  //                     height,                         // 行の高さ
  //                     reorderable,                    // 並び替えフラグ
  //                     cells: [
  //                         {
  //                             type: item.type,                        // セル種（chevron：折り畳み可能なセル）
  //                             text: item.text,                        // セルのテキスト（項目名称）
  //                             isExpanded: item.isExpanded,            // 折り畳み状態フラグ
  //                             parentId: item.parentId,                 // 親ID
  //                             hasChildren: (item.isParent) ? true : false
  //                         },
  //                     ]
  //                 }
  //             );
  //         } else {
  //             newRows.push(
  //                 {
  //                     rowId: item.rowId,              // 行ID
  //                     height,                         // 行の高さ
  //                     reorderable,                    // 並び替えフラグ
  //                     cells: [
  //                         {
  //                             type: item.type,                        // セル種（chevron：折り畳み可能なセル）
  //                             text: item.text,                        // セルのテキスト（項目名称）
  //                             isExpanded: item.isExpanded,             // 折り畳み状態フラグ
  //                             hasChildren: (item.isParent) ? true : false
  //                         },
  //                     ]
  //                 }
  //             );
  //         }
  //     });

  //     // Row データ設定
  //     const dataRows = (): Row[] => newRows;

  //     // リストメニューをビルド
  //     setRows(() => buildToggleListMenu(dataRows()));

  //     // リストメニューをレンダー
  //     setRowsToRender([headerRow, ...getExpandedRows(newRows)]);

  // }, [dataSideMenuMaster]);

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

  // データ行を作成
  const [rowsToRender, setRowsToRender] = React.useState<Row[]>([
    headerRow,
    ...getExpandedRows(rows),
  ]);

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

  return (
    // 折り畳みリストメニュー
    <div
      id="main-sidebar-middle"
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

const SideMenuMaster = (): JSX.Element => {
  // 編集用のメニュー
  const [dataSideEditMenuSelected, setSideEditMenuSelected] = useAtom(
    AtomSideEditMenu.sideEditMenuState
  );

  const [barWidth, setBarWidth] = useAtom(
    AtomSideMasterMenu.sideMenuWidthState
  );
  const [mousePosition, setMousePosition] = React.useState(0);
  const [mouseMove, setMouseMove] = React.useState<boolean>(false);

  const handleMouseDown = (e) => {
    if (!mouseMove) {
      console.log("開始");
      setMouseMove(true);
      setMousePosition(e.clientX);

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseMove = (e) => {
    // window以上の幅にはならないように
    // 左クリック中のみ発動するように
    if (e.clientX < window.outerWidth - 40 && (e.buttons & 1) !== 0) {
      setBarWidth(e.clientX);
    }
  };

  const handleMouseUp = (e) => {
    console.log("解除");
    setMouseMove(false);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <>
      <div
        style={{
          width: barWidth + 10,
          height: "100vh",
          position: "fixed",
          top: 45,
          left: 0,
          // border: "none",
          // borderRight: "2px dotted #000",
          // borderRight: "1px dashed #000",
        }}
        className="cursor_resize"
        onPointerDown={handleMouseDown}
      ></div>
      <div
        id="top-sidebar"
        className={`${cssSideMenuMaster.top_sidebar}`}
        style={{ width: barWidth }}
      ></div>

      <div
        id="main-sidebar"
        className={`${cssSideMenuMaster.sidemenu}`}
        style={{ width: barWidth }}
      >
        {/* 開閉エリア */}
        <SideMenuToggleArea />

        {/* サイドメニュ_中部 */}
        <SideMenuArea />
      </div>
      {dataSideEditMenuSelected && <EditMenuModal />}
    </>
  );
};

export default SideMenuMaster;
