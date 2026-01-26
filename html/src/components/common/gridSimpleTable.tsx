//【汎用】
import React, { useState } from "react";
import { useAtom, SetStateAction } from "jotai";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Const from "../../common/const";
import * as atomWqm030 from "../../stores/atomWQM030";

import Loading from "../../components/layouts/loading";

//【スタイル】グリッドテーブルスタイル
import cssGridTable from "../../scss/common/gridTable.module.scss";

//【ライブラリー】ReactGrid
import {
  ReactGrid,
  Row,
  CellChange,
  TextCell,
  Id,
  CheckboxCell,
  DropdownCell,
  NumberCell,
  DateCell,
  TimeCell,
} from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";

// ステート管理【コンテナー】
import { SideMenuStateContainer } from "../../components/containers/sideMenuStateContainer"; // サイドメニュー

// 属性
interface Props {
  dataGrid?: any;
  setterName?: (value: SetStateAction<any>) => void;
}

// コンポーネントエクスポート
export var GridSimpleTable: React.FC<Props> = function ({
  dataGrid,
  setterName,
}) {
  /**
   * 1.カラムヘッダ設定
   *
   */
  interface ColumnSetting {
    columnId: string;
    width: number;
    resizable?: boolean;
  }
  const [columnSetting, setColumnSetting] = React.useState<ColumnSetting[]>([]);

  // カラム情報
  const [useDataGridColumn, setDataGridColumn] = React.useState<any>();

  // カラムヘッダ情報
  const [useDataGridColumnHdr, setDataGridColumnHdr] = React.useState<any>();

  // データ型
  const [useDataGridInterface, setDataGridInterface] = React.useState<any>();

  // データ内容
  const [useDataInTable, setDataInTable] = React.useState<any[]>([]); // GridTable形
  const [useDataGridRow, setDataGridRow] = React.useState<any>(); // データ情報

  // クエリクライアント_他のコンポネントの関数を実行する為
  const queryClient = useQueryClient();

  /**
   * 1.ステートコンテナーからステートを呼び出す
   *
   */
  const sideMenuState = SideMenuStateContainer(); // サイドメニュー

  // WQM030_報告書出力
  const [useWqm030SearchAndSortState, setWqm030SearchAndSortState] = useAtom(atomWqm030.searchAndSortState);            // 検索条件の管理データ

  // 引数のデータを指定
  const setDataToGrid = async () => {
    let setNewColumn: any = []; // カラム情報
    let setNewColumnHeader: any = []; // カラムヘッダ情報
    let setNewInterfaceByCache: any = [];
    
    /**
     * ################################################################################################################################
     * キャッシュAPI処理_取得
     * ################################################################################################################################
     */
    let columnPositionCachApiArr = [];

    // キャッシュAPIを開始
    const openCache = await caches.open("app-data-storage");

    // レスポンスを取得
    const cachedResponse = await openCache.match(
      `/column-position/${sideMenuState.useSideMenuSelected.selectedMenuNo}`
    );

    // レスポンスを確認
    if (cachedResponse) {
      // レスポンスをJSONオブジェクト（配列）に変換
      columnPositionCachApiArr = await cachedResponse.json();
    }
    // ################################################################################################################################


    /**
     * ################################################################################################################################
     * キャッシュAPI処理_指定
     * ################################################################################################################################
     */
      if (columnPositionCachApiArr.length <= 0) {
        // 保持データが存在していない場合
        columnPositionCachApiArr = dataGrid.columnData;

        // 配列をJSON stringに変換
        const jsonString = JSON.stringify(columnPositionCachApiArr);

        // StringからレスポンスOBJを作成
        const response = new Response(jsonString, {
          headers: { "Content-Type": "application/json" },
        });

        // キャッシュキー
        const cacheKey = `/column-position/${sideMenuState.useSideMenuSelected.selectedMenuNo}`;

        // キャッシュAPIを開始 と 幅の配列を指定
        const cache = await caches.open("app-data-storage");
        await cache.put(cacheKey, response);
      }
    // ################################################################################################################################

    // カラムデータを取得
    columnPositionCachApiArr?.forEach((column) => {
      // カラム情報
      setNewColumn.push({
        columnId: column.columnName,
        width: column.width,
        resizable: column.resizeAble,
        reorderable: (column.columnName !== "check_box") ? true : false,
      });

      // カラムヘッダ情報
      setNewColumnHeader.push({
        type: "header",
        text: column.columnTitle,
      });

      // インターフェース設定
      const findInterface = dataGrid.rowInterface.find((rowInt) => rowInt.interfaceName == column.columnName);
      if (findInterface) {
        setNewInterfaceByCache.push(findInterface);
      }

    });

    // GridTable_カラム形
    const getColumns = (): ColumnSetting[] => setNewColumn;

    // 列設定
    setDataGridColumn(setNewColumn);
    setColumnSetting(getColumns());
    setDataGridColumnHdr(setNewColumnHeader);

    // 行設定
    setDataGridRow(dataGrid.rowData);

    // データインターフェース設定
    setDataGridInterface(setNewInterfaceByCache);

    // データ内容_GridTable形
    setDataInTable(getRows(dataGrid.rowData, setNewColumnHeader, setNewInterfaceByCache));

    return true;
  };

  // 引数のデータを指定
  const { isFetching, data } = useQuery({
    queryKey: ["dataGrid"],
    queryFn: setDataToGrid,
  });

  // データ内容を設定_GridTable形
  const getRows = (rows: any[], headerCells = useDataGridColumnHdr, rowsInterface = useDataGridInterface): Row[] => [
    {
      rowId: "header",
      height: 50,
      cells: headerCells,
    },
    ...rows.map<Row>((row, index) => {
      const setRowCells = rowsInterface.map((item) => {
        const value = row[item.interfaceName];

        switch (item.interfaceType) {
          case "string":
            // 表示のみ
            return {
              type: "text",
              text: value ?? "",
              nonEditable: true,
            };
          case "text":
            // テキスト
            return {
              type: "text",
              text: value ?? "",
            };
          case "number":
            // 数字
            return {
              type: "number",
              value: typeof value === "number" ? value : Number(value) || 0,
            };
          case "checkbox":
            // チェックボックス
            return {
              type: "checkbox",
              checked: Boolean(value),
            };
          case "dropdown":
            // セレクトボックス
            return {
              type: "dropdown",
              selectedId: value ?? "",
              options: item.options ?? [],
            };
          case "date":
            // 日付
            return {
              type: "date",
              date: value ? new Date(value) : new Date(),
            };
          case "time":
            // 時刻
            return {
              type: "time",
              time: value ? new Date(value) : new Date(),
            };
          default:
            // セル型不明
            console.warn("Unknown cell type:", item.interfaceType);
            return {
              type: "text",
              text: value ?? "",
            };
        }
      });

      // セル設定
      return {
        rowId: index,
        cells: setRowCells,
      };
    }),
  ];

  // データ内容を更新
  const applyChanges = (
    changes: CellChange<
      TextCell | NumberCell | CheckboxCell | DropdownCell | DateCell | TimeCell
    >[],
    prevData: any[]
  ): any[] => {
    changes.forEach((change: any) => {
      const dataRowId = change.rowId;
      const fieldName = change.columnId;
      let dataRow = prevData.find((d) => d.rowId === dataRowId);

      const dataColumnIdx = useDataGridColumn.findIndex(
        (column) => column.columnId == fieldName
      );

      if (change.type === "text") {
        dataRow.cells[dataColumnIdx].text = change.newCell.text as never;
      } else if (change.type === "number") {
        dataRow.cells[dataColumnIdx].value = change.newCell.value as never;
      } else if (change.type === "checkbox") {
        dataRow.cells[dataColumnIdx].checked = change.newCell.checked as never;
      } else if (change.type === "dropdown") {
        dataRow.cells[dataColumnIdx].inputValue = change.newCell
          .inputValue as never;
      } else if (change.type === "date") {
        dataRow.cells[dataColumnIdx].date = change.newCell.date as never;
      } else if (change.type === "time") {
        dataRow.cells[dataColumnIdx].time = change.newCell.time as never;
      } else {
        console.log("ERROR", change.type, dataRow.cells[dataColumnIdx]);
      }
    });
    return [...prevData];
  };

  const handleChanges = (changes: CellChange<any>[]) => {
    setDataInTable((useDataInTable) => applyChanges(changes, useDataInTable));

    setterName((prev) => ({
      ...prev,
      rowData: prev.rowData.map((row, index) =>
        index === changes[0].rowId ? { ...row, check_box: !row.check_box } : row
      ),
    }));
  };

  const handleColumnResize = (ci: Id, width: number) => {
    setColumnSetting((prevColumns) => {
      const columnIndex = prevColumns.findIndex((el) => el.columnId === ci);
      const resizedColumn = prevColumns[columnIndex];
      const updatedColumn = { ...resizedColumn, width };
      prevColumns[columnIndex] = updatedColumn;
      return [...prevColumns];
    });
  };

  const setSortHeader = (ctn) => {
    // WQM030_報告書出力 ※ 現在は採水年月日のみ対応
    if (ctn.textContent == "採水年月日") {
      let searchCondValueWqm030: atomWqm030.searchAndSortInterface = useWqm030SearchAndSortState;
      if (useWqm030SearchAndSortState.sortColumn && (Const.WQM030_HEADER_ITEM[ctn.textContent] !== useWqm030SearchAndSortState.sortColumn)) {
        searchCondValueWqm030 = {
          ...searchCondValueWqm030,
          sortColumn: Const.WQM030_HEADER_ITEM[ctn.textContent],
          sortOrder: "DESC",
        };
      } else {
        searchCondValueWqm030 = {
          ...searchCondValueWqm030,
          sortColumn: Const.WQM030_HEADER_ITEM[ctn.textContent],
          sortOrder: (useWqm030SearchAndSortState.sortOrder == "ASC") ? "DESC" : "ASC",
        };
      }

      setWqm030SearchAndSortState(searchCondValueWqm030);

      // 一定時間を設定
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["getDspReport"] });
      }, 100);
    }
  };

  // チェックボックス項目がある時_ヘッダーにチェックボックスを設定
  // React.useEffect(() => {
  //   requestAnimationFrame(() => {
  //     // ヘッダーコンテナー
  //     const container = document.getElementsByClassName(
  //       "rg-cell rg-header-cell "
  //     );
      

  //     // チェックボックス存在確認
  //     const checkCheckBoxInterface: any = useDataGridInterface
  //       ? useDataGridInterface.find((item) => item.interfaceType == "checkbox")
  //       : null;

  //     // チェックボックスを設定
  //     if (checkCheckBoxInterface) {
  //       Array.from(container).forEach((ctn, key) => {
  //         if (key === container.length - 1) {
  //           // チェックボックスを作成
  //           const checkbox = document.createElement("input");
  //           checkbox.type = "checkbox";
  //           checkbox.id = "grid-simple-checkbox-select-all";
  //           checkbox.classList.add("custom-select-all-checkbox");

  //           // クリック処理
  //           checkbox.onclick = function () {
  //             setSelectAllCheckBox(checkbox.checked);
  //           };

  //           // チェックボックス存在確認
  //           const hasInput = ctn.querySelector("input") !== null;

  //           // 初期時だけチェックボックスを設定
  //           if (!hasInput) {
  //             ctn.appendChild(checkbox);
  //           }
  //         }
  //       });
  //     }

  //     // ヘッダ－にソートボタンを設定
  //     const tableHeadercontainer = document.querySelectorAll(
  //       "#grid-simple-table .rg-cell.rg-header-cell"
  //     );

  //     // 画面判定
  //     let columnCheckState = useWqm030SearchAndSortState;
  //     let headerArray = Object.entries(Const.WQM030_HEADER_ITEM).map(([label, key]) => ({ label, key }));

  //     // ヘッダ文言を取得
  //     let getContentText = "";
  //     if (headerArray?.length > 0) {
  //       headerArray?.forEach((item: any, index: any) => {
  //         if (columnCheckState.sortColumn == item.key) {
  //           getContentText = item.label;
  //         }
  //       });
  //     }

  //     // ソートクラスを追加
  //     let sortClass = `sort_asc`;
  //     if (columnCheckState.sortOrder === "DESC") {
  //       sortClass = `sort_desc`;
  //     }

  //     // 押下関数設定
  //     if (tableHeadercontainer) {
  //       Array.from(tableHeadercontainer)?.forEach((ctn, key) => {
  //         // ソートクラスをクリア
  //         ctn.classList.remove("sort_th");
  //         ctn.classList.remove("sort_desc");
  //         ctn.classList.remove("sort_asc");

  //         if (ctn.textContent == "採水年月日") {
  //           // ソートによる検索が成功した場合のみ、ソートアイコンの表示を切替える
  //           ctn.classList.add("sort_th");
  //           ctn.classList.remove("sort_asc");
  //           ctn.classList.remove("sort_desc");

  //           if (ctn.textContent == getContentText) {
  //             ctn.classList.add(sortClass);
  //           }

  //           ctn.addEventListener("click", function (e) {
  //             setSortHeader(ctn);
  //           });
  //         }
  //       });
  //     }

  //     console.info("ヘッダー設定");
  //   });
  // }, [useDataInTable]);

  React.useEffect(() => {
  // 1. グリッドテーブルを確認
  const targetNode = document.getElementById("grid-simple-table");
  if (!targetNode) return;

  const updateHeaderSubFnc = () => {
    // ヘッダーコンテナー
    const container = document.getElementsByClassName("rg-cell rg-header-cell ");
    if (container.length === 0) return;

    // --- ▢ チェックボックス設定セクション ---
    const checkCheckBoxInterface = useDataGridInterface
      ? useDataGridInterface.find((item) => item.interfaceType === "checkbox")
      : null;

    if (checkCheckBoxInterface) {
      Array.from(container).forEach((ctn, key) => {
        // 最後の要素にチェックボックスを追加
        const htmlCtn = ctn as HTMLElement;
        if (key === container.length - 1) {
          const hasInput = htmlCtn.querySelector("#grid-simple-checkbox-select-all");
          if (!hasInput) {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = "grid-simple-checkbox-select-all";
            checkbox.classList.add("custom-select-all-checkbox");
            checkbox.onclick = (e) => {
              // stopPropagation helps prevent triggering header clicks
              e.stopPropagation(); 
              setSelectAllCheckBox(checkbox.checked);
            };
            htmlCtn.appendChild(checkbox);
          }
        }
      });
    }

    // --- ▲▼ ソートボタン設定セクション ---
    let columnCheckState = useWqm030SearchAndSortState;
    let headerArray = Object.entries(Const.WQM030_HEADER_ITEM).map(([label, key]) => ({ label, key }));
    
    let getContentText = "";
    headerArray?.forEach((item) => {
      if (columnCheckState.sortColumn === item.key) {
        getContentText = item.label;
      }
    });

    let sortClass = columnCheckState.sortOrder === "DESC" ? "sort_desc" : "sort_asc";

    Array.from(container).forEach((ctn) => {
      // クラスをクリア
      const htmlCtn = ctn as HTMLElement;
      htmlCtn.classList.remove("sort_th", "sort_desc", "sort_asc");

      if (htmlCtn.textContent?.includes("採水年月日")) {
        htmlCtn.classList.add("sort_th");
        
        if (htmlCtn.textContent.trim() === getContentText) {
          htmlCtn.classList.add(sortClass);
        }

        // onclickを使用して重複登録を防ぐ
        htmlCtn.onclick = () => {
          setSortHeader(htmlCtn);
        };
      }
    });
  };

  // 2. Observerの設定: 要素を監視
  const observer = new MutationObserver((mutations) => {
    updateHeaderSubFnc();
  });

  observer.observe(targetNode, {
    childList: true,
    subtree: true,
  });

  // 初回実行（すでにDOMが存在する場合のため）
  updateHeaderSubFnc();

  // 3. クリーンアップ: コンポーネントが消える時に監視を止める
  return () => observer.disconnect();
  
  // 依存関係にStateを含めることで、ソート状態が変わった際も再適用されます
}, [useDataInTable, useDataGridInterface, useWqm030SearchAndSortState]); 

  // 全件選択を押下
  const setSelectAllCheckBox = (isAllSelected: boolean) => {
    let newCheclBoxDataDeepCopy = JSON.parse(JSON.stringify(useDataInTable));

    // 更新データを生成
    const newChangesData: CellChange<any>[] = [];
    newCheclBoxDataDeepCopy.forEach((data, index) => {
      if (index > 0) {
        newChangesData.push(
          {
            "previousCell": {
              "type": "checkbox",
              "checked": null,
              "value": null,
              "text": null
            },
            "newCell": {
              "type": "checkbox",
              "checked": (isAllSelected) ? true : false,
              "value": (isAllSelected) ? 1 : null,
              "text": (isAllSelected) ? "1" : ""
            },
            "type": "checkbox",
            "rowId": Number(data.rowId),
            "columnId": "check_box"
          }
        );
      }
    });

    // 更新データを設定
    setDataInTable((useDataInTable) => applyChanges(newChangesData, useDataInTable));

    setterName((prev) => ({
      ...prev,
      rowData: prev.rowData.map((row) => ({
        ...row,
        check_box: isAllSelected,
      })),
    }));

    return true;
  };

  /**
   * 
   * @param targetRowId 
   * @param rowIds 
   * @returns 
   */
  const handleCanReorderColumns = (targetColumnId: Id, columnIds: Id[]): boolean => {
    // チェックボックス以前に並び替え不可
    return targetColumnId !== 'check_box';
  }

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
   * 列の位置の並び替え関数
   * 
   * @param targetColumnId 
   * @param columnIds 
   */
  const handleReorderColumns = (targetColumnId: Id, columnIds: Id[]) => {
    const to = columnSetting.findIndex((column) => column.columnId === targetColumnId);
    const columnIdxs = columnIds.map((columnId) => columnSetting.findIndex((c) => c.columnId === columnId));
    const reorderedColumns = reorderArray(columnSetting, columnIdxs, to);
    const reorderedInterface = reorderArray(useDataGridInterface, columnIdxs, to);

    // グリッドテーブル設定を更新
    setDataToGridByReorderColumns(reorderedColumns, reorderedInterface);
  };

  const setDataToGridByReorderColumns = async (reorderedColumns, reorderedInterface) => {
    let setNewColumn: any = []; // カラム情報
    let setNewColumnHeader: any = []; // カラムヘッダ情報
    let setNewCacheArry: any =[];     // 新並び替えのヘッダ情報


    // カラムデータを取得
    reorderedColumns?.forEach((column) => {
      // カラム情報
      setNewColumn.push({
        columnId: column.columnId,
        width: column.width,
        resizable: column.resizable,
        reorderable: (column.columnId !== "check_box") ? true : false,
      });

      // カラムタイトルを取得
      const getColumnsTitle = dataGrid.columnData?.find(data => data.columnName == column.columnId);
      setNewCacheArry.push(getColumnsTitle);

      // カラムヘッダ情報
      setNewColumnHeader.push({
        type: "header",
        text: getColumnsTitle.columnTitle,
      });
    });

    /**
     * ################################################################################################################################
     * キャッシュAPI処理_指定
     * ################################################################################################################################
     */
      // 配列をJSON stringに変換
      const jsonString = JSON.stringify(setNewCacheArry);

      // StringからレスポンスOBJを作成
      const response = new Response(jsonString, {
        headers: { "Content-Type": "application/json" },
      });

      // キャッシュキー
      const cacheKey = `/column-position/${sideMenuState.useSideMenuSelected.selectedMenuNo}`;

      // キャッシュAPIを開始 と 幅の配列を指定
      const cache = await caches.open("app-data-storage");
      await cache.put(cacheKey, response);
    // ################################################################################################################################

    // GridTable_カラム形
    const getColumns = (): ColumnSetting[] => setNewColumn;

    // 列設定
    setDataGridColumn(setNewColumn);
    setColumnSetting(getColumns());
    setDataGridColumnHdr(setNewColumnHeader);

    // 行設定
    setDataGridRow(dataGrid.rowData);

    // データインターフェース設定
    setDataGridInterface(reorderedInterface);

    // データ内容_GridTable形
    setDataInTable(getRows(dataGrid.rowData, setNewColumnHeader, reorderedInterface));
  };

  return (
    <>
      {isFetching ? (
        <div
          style={{
            width: 150,
            justifySelf: "center",
            marginTop: "35dvh",
          }}
        >
          <Loading />
        </div>
      ) : (
        <>
          <div id="grid-simple-table" className={cssGridTable.grid_simple_table_panel}>
            <ReactGrid
              rows={useDataInTable}
              columns={columnSetting}
              onCellsChanged={handleChanges}
              onColumnResized={handleColumnResize}
              stickyLeftColumns={1}
              stickyTopRows={1}
              enableRangeSelection
              disableVirtualScrolling={true}
              enableColumnSelection
              canReorderColumns={handleCanReorderColumns}
              onColumnsReordered={handleReorderColumns}
            />
          </div>
        </>
      )}
    </>
  );
};
