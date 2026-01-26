/**
 * 【共通コンポネント】サイドメニュー用のリンクリストメニュー
 * ※ 折り畳み_可
 *
 */
import React from "react";
import { getMessage } from "../../common/api";
import { useQuery } from "@tanstack/react-query";
import { CommonStateContainer } from "../containers/commonStateContainer";
import { SideMenuStateContainer } from "../containers/sideMenuStateContainer";
import { ConfirmDialogStateContainer } from "../containers/confirmDialogStateContainer";

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

// ヘッダ列設定　※ サイドメニューにはヘッダ非表示
const dataColumns = (
  barWidth: number,
  reorderable: boolean,
  resizable: boolean
): Column[] => [{ columnId: "menu", width: barWidth, reorderable, resizable }];

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
      foundChevronCell.hasChildren = hasRowChildrens;
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
// ######### サイドメニュー操作関数　#########

// サイドメニュ_中部_[子コンポネント]
const SideMenuArea = ({
  sideMenuState,
  commonState,
  confirmDialog,
  paramMenuData,
  paramPage,
}): JSX.Element => {
  /**
   * #####【ステート】ローカル #####
   *
   */
  const [columns, setColumns] = React.useState(() =>
    dataColumns(sideMenuState.useBarWidth - 30, true, false)
  ); // グリッドテーブルのCOLUMN設定
  const [rows, setRows] = React.useState(() => buildToggleListMenu([])); // グリッドテーブルのROW設定
  const [useMenuData, setMenuData] = React.useState<any>([]);

  // サイドメニュー横幅変更時
  useQuery({
    queryKey: ["sideListWidth", sideMenuState.useBarWidth],
    queryFn: () => {
      setColumns(dataColumns(sideMenuState.useBarWidth - 30, true, false));

      return true;
    },
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

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
        let isHasChild = sideMenuState.useDataSideMenuLink.some((r) => {
          return r ? r.parentId === item.rowId : false;
        });
        if (isHasChild) {
          const getParentData: any = sideMenuState.useDataSideMenuLink.filter(
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

      let newData: any[] = paramMenuData;
      let newDataRePosition: any = [];

      // 配列順序を調整 
      // ※ 1回以上実施すると、システムが停止になる原因
      // rePositionAllLevel(newData, newDataRePosition);

      const securityLevel: string = localStorage.getItem("securityLevel");
      const affiliationSectionNo: string = localStorage.getItem(
        "affiliationSectionNo"
      );

      // ユーザ定義.権限が'1':管理用ID、水質管理センター、企業局施設課の場合
      if (
        securityLevel == "1" ||
        affiliationSectionNo == "01" ||
        affiliationSectionNo == "13"
      ) {
        rePositionAllLevel(newData, newDataRePosition);
      } else {
        // ユーザ定義.権限が'0':業務用IDの場合
        if (newData.length > 0) {
          rePositionAllLevel(newData, newDataRePosition, newData[0].level);
        }
      }

      // リストメニューをビルド
      sideMenuState.setDataSideMenuLink(newDataRePosition);

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
              },
            ],
          });
        }
      });

      const dataRows = (): Row[] => newRows;

      setRows(() => buildToggleListMenu(dataRows()));
      setRowsToRender([headerRow, ...getExpandedRows(newRows)]);
    } catch {}
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
  React.useEffect(() => {
    /** カラム作成（縦）_ヘッダのみ */
    let newData: any[] = sideMenuState.useDataSideMenuLink;
    let newDataRePosition: any = [];

    // 配列順序を調整
    const securityLevel: string = localStorage.getItem("securityLevel");
    const affiliationSectionNo: string = localStorage.getItem(
      "affiliationSectionNo"
    );

    // ユーザ定義.権限が'1':管理用ID、水質管理センターの場合
    if (
      securityLevel == "1" ||
      affiliationSectionNo == "01" ||
      affiliationSectionNo == "13"
    ) {
      rePositionAllLevel(newData, newDataRePosition);
    } else {
      // ユーザ定義.権限が'0':業務用IDの場合
      if (newData.length > 0) {
        rePositionAllLevel(newData, newDataRePosition, newData[0].level);
      }
    }

    // リストメニューをビルド
    // setDataSideMenuLink(newDataRePosition);

    let newRows: Row[] = [];

    const height = 25;
    const reorderable = false;

    newDataRePosition.forEach((item, key) => {
      if (item.showFlg) {
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
                parentId: key == 0 ? null : item.parentId,
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
      }
    });

    const dataRows = (): Row[] => newRows;

    setRows(() => buildToggleListMenu(dataRows()));
    setRowsToRender([headerRow, ...getExpandedRows(newRows)]);
  }, [sideMenuState.useDataSideMenuLink]);

  /**
   * 絞り込み検索の処理
   *
   */
  useQuery({
    queryKey: ["dataSideSearchMenuChanged", sideMenuState.useSideSearchMenu],
    queryFn: () => {
      if (sideMenuState.useSideSearchMenu !== null) {
        // 更新用のサイドメニューデータを新規作成
        const newSideMenu: any = [...sideMenuState.useDataSideMenuLink];

        // 絞り込み検索_表示フラグ
        newSideMenu.forEach((item, key) => {
          if (item.text.includes(sideMenuState.useSideSearchMenu)) {
            item.showFlg = true;
          } else {
            item.showFlg = false;
          }
        });

        // 子項目を表示に設定
        newSideMenu.forEach((item, key) => {
          // ※ 例えば、当階層は３階層目なら、２階層目（親のみ）、１階層目（親のみ）まで表示するようにループを実施
          if (item.rowId && item.showFlg) {
            // 親項目を表示に設定「ループ関数」
            setChildShowFlgFilter(newSideMenu, item.rowId);
          }
        });

        // 親項目を表示に設定
        newSideMenu.forEach((item, key) => {
          // ※ 例えば、当階層は３階層目なら、２階層目（親のみ）、１階層目（親のみ）まで表示するようにループを実施
          if (item.parentId && item.showFlg) {
            // 親項目を表示に設定「ループ関数」
            setShowFlgFilter(newSideMenu, item.parentId);
          }
        });

        sideMenuState.setDataSideMenuLink(newSideMenu);
      } else {
        sideMenuState.setDataSideSearchMenu("");
      }

      return true;
    },
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
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

  // 子項目を表示に設定「ループ関数」
  const setChildShowFlgFilter = (newSideMenu: any, rowId: number) => {
    newSideMenu.forEach((flg, index) => {
      if (flg.parentId == rowId) {
        flg.showFlg = true;

        // 最下層の子項目まで
        setChildShowFlgFilter(newSideMenu, flg.rowId);
      }
    });
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
   *
   *
   * @param location
   */
  const updateActionMenu = (location: CellLocation) => {
    // 選択したセルを取得
    const changedRow: any = rows.filter((row) => row.rowId == location.rowId);
    const selectRow: any = sideMenuState.useDataSideMenuLink.filter(
      (row) => row.rowId == location.rowId
    );

    // 親項目か子項目かを判断
    if (!changedRow[0].cells[0].hasChildren) {
      // 選択画面表示_子項目
      sideMenuState.setSideMenuSelected({
        ...sideMenuState.useSideMenuSelected,
        selectedMenuNo: changedRow[0].rowId,
        selectedMenuName: changedRow[0].cells[0].text,
        selectedDspNo: selectRow[0].dspNo,
        inspectionKbnCode: selectRow[0].inspectionKbnCode,
        report_no: selectRow[0].report_no,
        report_category: selectRow[0].report_category,
        affiliation_section_no: selectRow[0].affiliation_section_no,
        report_type: selectRow[0].report_type,
      });
    }

    // 親項目開閉トグル_親項目

    const newRows: any = JSON.parse(JSON.stringify(rows));
    newRows.forEach((row, key) => {
      const newCell: any = rows[key].cells[0];
      const setParentId = newCell.parentId ? newCell.parentId : null;

      if (changedRow[0].cells[0].hasChildren) {
        // ラベルをクリック
        if (row.rowId == location.rowId) {
          newRows[key].cells[0] = {
            type: newCell.type,
            text: newCell.text,
            isExpanded: !changedRow[0].cells[0].hasChildren
              ? newCell.isExpanded
              : !newCell.isExpanded,
            parentId: setParentId,
            nonEditable: true,
            className: newCell.className,
          };
        } else {
          newRows[key].cells[0] = {
            type: newCell.type,
            text: newCell.text,
            isExpanded: newCell.isExpanded,
            parentId: setParentId,
            nonEditable: true,
            className: newCell.className,
          };
        }
      } else {
        // 画面メニューをクリック
        if (row.rowId == location.rowId) {
          newRows[key].cells[0] = {
            type: newCell.type,
            text: newCell.text,
            isExpanded: !changedRow[0].cells[0].hasChildren
              ? newCell.isExpanded
              : !newCell.isExpanded,
            parentId: setParentId,
            nonEditable: true,
            className: !changedRow[0].cells[0].hasChildren
              ? "activated_menu"
              : "",
          };
        } else {
          newRows[key].cells[0] = {
            type: newCell.type,
            text: newCell.text,
            isExpanded: newCell.isExpanded,
            parentId: setParentId,
            nonEditable: true,
            className: !changedRow[0].cells[0].hasChildren
              ? ""
              : newCell.className,
          };
        }
      }
    });

    // 親項目開閉
    const dataRows = (): Row[] => newRows;
    setRows(buildToggleListMenu(dataRows()));
    setRowsToRender([headerRow, ...getExpandedRows(newRows)]);
  };

  // JSXリターン
  return (
    // 折り畳みリストメニュー
    <ReactGrid
      rows={rowsToRender}
      columns={columns}
      enableFullWidthHeader
      onCellsChanged={handleChanges}
      // メニュークリック処理
      onFocusLocationChanged={(location: CellLocation) => {
        const selectRow: any = sideMenuState.useDataSideMenuLink.filter(
          (row) => row.rowId == location.rowId
        );

        // メッセージ
        if (
          commonState.useInputEditingFlg &&
          !selectRow[0].isParent &&
          sideMenuState.useSideMenuSelected.selectedMenuNo !== location.rowId
        ) {
          confirmDialog.setDialog((prev) => ({
            ...prev,
            isOpen: true,
            message: getMessage(["WQ-0006Q"]).message,
            onConfirm: () => {
              commonState.setInputEditingFlg(false);
              updateActionMenu(location);
            },
            onCancel: () => {
              // 処理なし
            },
          }));
        } else {
          updateActionMenu(location);
        }
      }}
    />
  );
};

// 属性
interface Props {
  menuData?: any;
  page?: string;
}

// コンポネントエクスポート_[親コンポネント]
export var SideList: React.FC<Props> = function ({ menuData, page }) {
  /**
   * ステートコンテナーからステートを呼び出す
   *
   */
  const commonState = CommonStateContainer(); // 汎用
  const sideMenuState = SideMenuStateContainer(); // サイドメニュー
  const confirmDialog = ConfirmDialogStateContainer(); // 確認ダイアログ

  // ステート管理のプロパティを設定
  const comblineProps = {
    // 汎用
    commonState: commonState,
    // サイドメニュー
    sideMenuState: sideMenuState,
    // 確認ダイアログ
    confirmDialog: confirmDialog,
    // 引数
    paramMenuData: menuData,
    paramPage: page,
  };

  return (
    <>
      {/* サイドメニュ */}
      <SideMenuArea {...comblineProps} />
    </>
  );
};
