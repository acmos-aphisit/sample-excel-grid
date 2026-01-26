/**
 * 【共通コンポネント】サイドメニュー用のリンクリストメニュー
 * ※ 折り畳み_可
 *
 */
import React from "react";
import { Api, getMessage } from "../../common/api";
import { useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAtom, useSetAtom } from "jotai";

//【ステート】汎用
import * as AtomCommon from "../../stores/atom";

//【ステート】サイドメニュー
import * as AtomSideMasterMenu from "../../stores/atomSideMenuMaster";
import * as AtomSideEditMenu from "../../stores/atomSideEditMenuModal";
import * as AtomMenuLabelManage from "../../stores/atomMenuLabelManage";
import * as AtomInputMenuDspManage from "../../stores/atomInputDspManage";
import * as AtomInputMenuRptManage from "../../stores/atomInputRptManage";
import * as AtomInputRptManage from "../../stores/atomInputRptManage";

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

import moment from "moment";
import { log } from "node:console";

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
  // メッセージ
  const [getResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);
  const [useMessageMutiLine, setMessageMutiLine] = useAtom(AtomCommon.messageMutiLineState);      // 複数メッセージ用
  const [useResultModalMessage, setResultModalMessage] = useAtom(AtomCommon.modalMessageState);   // モダールメッセージ用

  // サイドリストメニュー_データ
  const [dataSideMenuLink, setDataSideMenuLink] = useAtom(
    AtomSideMasterMenu.sideMenuLinkListState
  );

  // 選択したメニューデータアトム
  const [useSideMenuSelected, setSideMenuSelected] = useAtom(
    AtomSideMasterMenu.sideMenuSelectedState
  );

  // サイドリストメニュー
  const [dataSideMenu, setDataSideMenu] = useAtom(
    AtomSideMasterMenu.sideMenuListState
  );
  const [dataSideMenuMaster, setDataSideMenuMaster] = useAtom(
    AtomSideMasterMenu.sideMenuMasterListState
  );

  // 親ラベルリスト
  const [useMenuLabelParentList, setMenuLabelParentList] = useAtom(
    AtomSideMasterMenu.sideMenuLabelParentState
  );

  // 管理データ
  const [useMenuLabelState, setMenuLabelState] = useAtom(
    AtomMenuLabelManage.menuLabelState
  );

  // 管理データ_入力画面設定
  const [useInputMenuDspState, setInputMenuDspState] = useAtom(
    AtomInputMenuDspManage.inputMenuState
  );

  // 管理データ_報告書画面設定
  const [useInputMenuRptState, setInputMenuRptState] = useAtom(
    AtomInputRptManage.inputMenuState
  );

  // メニューラベル管理子画面_表示フラグ
  const [useMenuLabelManageModalFlg, setMenuLabelManageModalFlg] = useAtom(
    AtomMenuLabelManage.menuLabelManageModalFlgState
  );

  // メニュー管理子画面_表示フラグ
  const [useInputMenuManageModalFlg, setInputMenuManageModalFlg] = useAtom(
    AtomInputMenuDspManage.inputMenuManageModalFlgState
  );
  const [useInputRptManageModalFlg, setInputRptManageModalFlg] = useAtom(
    AtomInputMenuRptManage.inputMenuManageModalFlgState
  );

  const [columns] = React.useState(() => dataColumns(true, false));
  const [rows, setRows] = React.useState(() => buildToggleListMenu([]));

  // 編集状態フラグ
  const [useInputEditingFlg, setInputEditingFlg] = useAtom(
    AtomCommon.inputEditingFlg
  );

  // クエリクライアント
  const queryClient = useQueryClient();

  // メニュー順序
  const [useExchangeMenuOrder, setExchangeMenuOrder] = useAtom(
    AtomSideMasterMenu.exchangeMenuOrderState
  );

  // メニュー削除
  const [useDeleteInputMenuState, setDeleteInputMenuState] = useAtom(
    AtomSideMasterMenu.deleteInputMenuState
  );

  // パス確認
  const url = useLocation();

  /**
   * 初期表示_初期データを設定
   *
   * */
  const fetchData = async () => {
    try {
      // (1)
      /** 各カラムの情報（ヘッダー） */
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
                hasChildren: item.isParent ? true : false,
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
                hasChildren: item.isParent ? true : false,
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
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

  /**
   * リストメニューの更新があった時
   *
   */
  const sideListMenuUpdate = async () => {
    /** カラム作成（縦）_ヘッダのみ */
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
              hasChildren: item.isParent ? true : false,
              className:
                useSideMenuSelected.selectedMenuNo == item.rowId
                  ? "side_menu_master_list activated_menu"
                  : "side_menu_master_list",
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
              hasChildren: item.isParent ? true : false,
              className:
                useSideMenuSelected.selectedMenuNo == item.rowId
                  ? "side_menu_master_list activated_menu"
                  : "side_menu_master_list",
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
    },
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
    const className = "side_menu_master_list activated_menu";

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
              className: activeId == item.rowId ? className : "side_menu_master_list",
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
              className: activeId == item.rowId ? className : "side_menu_master_list",
              hasChildren: item.isParent ? true : false,
            },
          ],
        });
      }
    });

    const dataRows = (): Row[] => newRows;

    // リストメニューをビルド
    setRows(() => buildToggleListMenu(dataRows()));

    // リストメニューをレンダー
    setRowsToRender([headerRow, ...getExpandedRows(newRows)]);
  };

  /**
   * データを更新
   * 2025/08/01 不用
   *
   * @param changes
   */
  const handleChanges = (changes: CellChange[]) => {
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

    // 選択しているメニューがあれば、処理実施
    if (selectedRowData) {
      let maxOrder: number = 0;
      dataSideMenuMaster.forEach((row, key) => {
        if (selectedRowData.level == 1) {
          if (row.level == 1 && maxOrder < row.order) {
            maxOrder = row.order;
          }
        } else {
          if (
            row.parentId == selectedRowData.parentId &&
            maxOrder < row.order
          ) {
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
        domContextMenu[4].classList.add("disabled");
      } else {
        domContextMenu[4].classList.remove("disabled");
      }

      // 最後尾の項目は上に移動の操作を非活性に設定
      if (selectedRowData.order == maxOrder) {
        domContextMenu[5].classList.add("disabled");
      } else {
        domContextMenu[5].classList.remove("disabled");
      }

      // 入力画面番号が空の場合、類似入力画面が非活性となっている
      // ※ 入力設定画面のみ
      if (!selectedRowData.dspNo && url.pathname == "/MNG050") {
        domContextMenu[0].classList.add("disabled");
      } else {
        domContextMenu[0].classList.remove("disabled");
      }
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
   * メニュー削除の対象配列_ループ
   * ※ 2025/08/01 不用
   *
   * @param data
   * @param newData
   * @param level
   */
  const setInputMenuDelete = (
    selectedRowId: any,
    newData: any,
    level: number = 1
  ) => {
    let reOrderNo: number = 1;
    newData.push(selectedRowId);

    dataSideMenuMaster.forEach((item, key) => {
      if (item.parentId == selectedRowId) {
      }
    });
  };

  // データ登録
  const exchangeMenuOrderMutation = useMutation({
    mutationFn: async () => {
      // リクエスト
      const request = {
        cur_menu_no: useExchangeMenuOrder.curMenuNo,
        target_menu_no: useExchangeMenuOrder.targetMenuNo,
        display_time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
      };

      // URL設定
      let requestApiUrl;
      if (url.pathname == "/MNG050") {
        // 親ラベル_検査情報入力設定
        requestApiUrl = "/MNG050/exchangeMenuOrder";
      } else if (url.pathname == "/MNG060") {
        // 親ラベル_報告書設定
        requestApiUrl = "/MNG060/exchangeMenuOrder";
      }

      // 選択しているメニューと移動先に順序を取替
      const response = await Api.post(requestApiUrl, setResultMessage, request);

      return response;
    },
    // 正常終了
    onSuccess: () => {
      // ステートクリア
      setExchangeMenuOrder(AtomSideMasterMenu.defaultExchangeMenuOrderState);

      // 再取得クエリキー
      queryClient.invalidateQueries({ queryKey: ["getInitMenuLists"] });

      // 処理正常終了のメッセージ
      const msgInfo: AtomCommon.message[] = [];
      msgInfo.push(getMessage(["WQ-0007I", "メニューの順序更新"]));
      setResultMessage(msgInfo);
      setMessageMutiLine(msgInfo);
    },
    // エラー発生
    onError: (error) => {
      // エラーメッセージ
      // const errorInfo: AtomCommon.message[] = [];
      // errorInfo.push(getMessage(["WQ-0003E"]));
      // setResultMessage(errorInfo);
    },
  });

  /**
   * 【コンテキスト】項目を上・下に移動の処理
   *
   * @param rowId
   * @param position
   */
  const handlerMoveData = (rowId: any, position: string) => {
    // 追加位置を取得
    const selectedRowId = rowId;
    const selectedRowInfo = dataSideMenuMaster.find((row) => {
      return row.rowId == selectedRowId ? row.parentId : null;
    });
    const getParentArray = dataSideMenuMaster.filter((row) => {
      return row.parentId == selectedRowInfo.parentId ? row : null;
    });

    let curDataKey: number = 0;
    let targetDataKey: number = 0;
    // 移動対象のキーを取得
    getParentArray.forEach((row, key) => {
      if (row.rowId == rowId) {
        curDataKey = key;
        if (position == "up") {
          targetDataKey = key - 1;
        } else {
          targetDataKey = key + 1;
        }
      }
    });

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

    setExchangeMenuOrder({
      ...useExchangeMenuOrder,
      curMenuNo: getParentArray[curDataKey].rowId,
      targetMenuNo: getParentArray[targetDataKey].rowId,
    });

    // DBに更新順序を保存
    exchangeMenuOrderMutation.mutate();
  };

  const deleteInputMenuMutation = useMutation({
    mutationFn: async (selectedRowId) => {
      // URL設定
      let requestApiUrl;
      let request;
      if (url.pathname == "/MNG050") {
        // 親ラベル_検査情報入力設定
        requestApiUrl = "/MNG050/deleteInputMenu";

        // リクエスト
        request = {
          input_menu_no: selectedRowId,
          display_time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        };
      } else if (url.pathname == "/MNG060") {
        // 親ラベル_報告書設定
        requestApiUrl = "/MNG060/deleteReportMenu";

        // リクエスト
        request = {
          report_menu_no: selectedRowId,
          display_time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        };
      }

      // 選択しているメニューを削除
      const response = await Api.post(requestApiUrl, setResultMessage, request);

      return response;
    },
    // 正常終了
    onSuccess: () => {
      // ステートクリア
      setDeleteInputMenuState(null);

      // 選択しているメニューをクリア
      setSideMenuSelected(AtomSideMasterMenu.defaultInputSelectedMenuState);

      // 再取得クエリキー
      queryClient.invalidateQueries({ queryKey: ["getInitMenuLists"] });

      // 処理正常終了のメッセージ
      setTimeout(() => {
        const msgInfo: AtomCommon.message[] = [];
        msgInfo.push(getMessage(["WQ-0004I"]));
        setResultMessage(msgInfo);
        setMessageMutiLine(msgInfo);
      }, 1000);
    },
    // エラー発生
    onError: (error) => {
      // エラーメッセージ
      // const errorInfo: AtomCommon.message[] = [];
      // errorInfo.push(getMessage(["WQ-0003E"]));
      // setResultMessage(errorInfo);
    },
  });

  // 類似入力画面作成処理
  const duplicateInputMenuDspMutation = useMutation({
    mutationFn: async (selectedRowId: any) => {
      // URL設定
      let requestApiUrl;
      let request;
      if (url.pathname == "/MNG050") {
        // 親ラベル_検査情報入力設定
        requestApiUrl = "/MNG050/duplicateInputMenuDsp";

        // リクエスト
        request = {
          input_menu_no: selectedRowId,
          display_time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        };
      } else if (url.pathname == "/MNG060") {
        // 親ラベル_報告書設定
        requestApiUrl = "/MNG060/duplicateInputMenuRpt";

        // リクエスト
        request = {
          report_menu_no: selectedRowId,
          display_time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        };
      }

      // 選択している日付に基づき、検査情報を取得
      const response = await Api.post(requestApiUrl, setResultMessage, request);

      return response;
    },
    // 正常終了
    onSuccess: () => {
      // 再取得クエリキー
      queryClient.invalidateQueries({ queryKey: ["getInitMenuLists"] });

      // 処理正常終了のメッセージ
      const msgInfo: AtomCommon.message[] = [];
      msgInfo.push(getMessage(["WQ-0007I", "類似入力画面作成"]));
      setResultMessage(msgInfo);
      setMessageMutiLine(msgInfo);
    },
    // エラー発生
    onError: (error) => {
      // エラーメッセージ
      // const errorInfo: AtomCommon.message[] = [];
      // errorInfo.push(getMessage(["WQ-0003E"]));
      // setResultModalMessage(errorInfo);
    },
  });

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
        label:
          url.pathname == "/MNG050" ? "類似入力画面作成" : "類似報告書作成",
        handler: () => {
          // 確認ダイアログ
          setDialog((prev) => ({
            ...prev,
            isOpen: true,
            cancelBtnName: "いいえ",
            message: getMessage(["WQ-0005Q", url.pathname == "/MNG050" ? "類似入力画面作成" : "類似報告書作成"]).message,
            onConfirm: () => {
              // ※ 操作⓵：同じ階層で項目を作成
              // 追加位置を取得
              const selectedRowId = selectedRanges[0][0].rowId;
              duplicateInputMenuDspMutation.mutate(selectedRowId);
            },
            onCancel: () => {
              // 処理なし
            },
          }));
        },
      },
      {
        id: "change-input-menu-name",
        label: "編集",
        handler: () => {
          // メニューラベル子画面_初期化
          setResultModalMessage([]);
          setMenuLabelState(AtomMenuLabelManage.defaultMenuLabelState);

          // 入力画面子画面_初期化
          setInputMenuDspState(AtomInputMenuDspManage.defaultInputDspState);

          // 対象データを取得
          const getSelectData: any = dataSideMenuLink.find(
            (row) => row.rowId == selectedRanges[0][0].rowId
          );

          // メニューラベル判定
          if (getSelectData.isParent) {
            // 編集ステート指定
            setMenuLabelState({
              ...useMenuLabelState,
              menuLabelMode: "編集",
              menuLabelNo: getSelectData.rowId,
              menuLabelName: getSelectData.text,
              menuLabelParent: getSelectData.parentId,
              menuLabelAffiliation: getSelectData.affiliationSectionNo,
            });

            // メニューラベル子画面を表示
            setMenuLabelManageModalFlg(true);
          } else {
            // 入力画面設定
            if (url.pathname == "/MNG050") {
              // 編集ステート指定
              setInputMenuDspState({
                ...useInputMenuDspState,
                inputDspMode: "編集",
                inputDspNo: getSelectData.rowId,
                inputDspName: getSelectData.text,
                inputDspParent: getSelectData.parentId,
                inputDspRef: getSelectData.dspNo,
                inputDspAffiliation: getSelectData.affiliationSectionNo,
              });

              // 入力画面子画面を表示
              setInputMenuManageModalFlg(true);
            } else {
              // 報告書設定
              setInputMenuRptState({
                ...useInputMenuRptState,
                inputRptMode: "編集",
                inputRptNo: getSelectData.rowId,
                inputRptName: getSelectData.text,
                inputRptParent: getSelectData.parentId,
                inputRptRef: getSelectData.reportNo,
                inputRptAffiliation: getSelectData.affiliationSectionNo,
                inputRptMonthFlg: (getSelectData.isParent == false && getSelectData.reportNo == null) ? true : false,
              });

              // 報告書子画面を表示
              setInputRptManageModalFlg(true);
            }
          }
        },
      },
      {
        id: "create-label-menu",
        label: "メニューラベル追加",
        handler: () => {
          // メニューラベル子画面_初期化
          setMenuLabelState(AtomMenuLabelManage.defaultMenuLabelState);

          // メニューラベル子画面を表示
          setMenuLabelManageModalFlg(true);
        },
      },
      {
        id: "create-new-input-menu",
        label:
          url.pathname == "/MNG050" ? "新規入力画面作成" : "新規報告書作成",
        handler: () => {
          // メニュー子画面を表示
          url.pathname == "/MNG050"
            ? setInputMenuManageModalFlg(true)
            : setInputRptManageModalFlg(true);
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
        label: url.pathname == "/MNG050" ? "入力画面を削除" : "削除",
        handler: () => {
          // 確認ダイアログ
          setDialog((prev) => ({
            ...prev,
            isOpen: true,
            cancelBtnName: "いいえ",
            message: getMessage(["WQ-0003Q"]).message,
            onConfirm: () => {
              const selectedRowId: any = selectedRanges[0][0].rowId;
              const checkHasChild = dataSideMenuMaster.find((row) => {
                return row.parentId == selectedRowId ? row : null;
              });

              // 対象ラベルは入力画面が存在する場合、削除不可
              if (checkHasChild) {
                // 処理正常終了のメッセージ
                const msgInfo: AtomCommon.message[] = [];
                const msgCode = "WQ-0027E";
                msgInfo.push(getMessage([msgCode]));
                setResultMessage(msgInfo);
                setMessageMutiLine(msgInfo);
              } else {
                deleteInputMenuMutation.mutate(selectedRowId);
              }
            },
            onCancel: () => {
              // 処理なし
            },
          }));
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
          className: "side_menu_master_list activated_menu",
          hasChildren: newCell.hasChildren,
        };

        // 対象データを取得
        const getSelectData: any = dataSideMenuLink.find(
          (data) => data.rowId == row.rowId
        );
        setSideMenuSelected({
          ...useSideMenuSelected,
          selectedMenuNo: getSelectData.rowId,
          selectedMenuName: newCell.text,
          selectedDspNo: getSelectData.dspNo,
          report_no: getSelectData.reportNo,
          affiliation_section_no: getSelectData.affiliationSectionNo,
          label_flg: newCell.hasChildren,
        });
      } else {
        newRows[key].cells[0] = {
          type: newCell.type,
          text: newCell.text,
          isExpanded: newCell.isExpanded,
          parentId: setParentId,
          nonEditable: true,
          className: "side_menu_master_list",
          hasChildren: newCell.hasChildren,
        };
      }
    });

    // 親項目開閉
    const dataRows = (): Row[] => newRows;
    setRows(buildToggleListMenu(dataRows()));
    setRowsToRender([headerRow, ...getExpandedRows(newRows)]);
  };

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
