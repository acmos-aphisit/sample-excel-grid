// 動画マニュアルサブ画面（モーダル）
import React from 'react';
import { Api, getMessage } from "../../common/api";
import * as Const from '../../common/const';

import { Button, ModalMessageArea } from '../common';

import { useAtom, useSetAtom } from "jotai";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 日時管理ライブラリー
import moment from "moment";

// スタイル
import cssEditMenuModal from '../../scss/modals/editMenuModal.module.scss'
import selectOptionSettingModal from '../../scss/modals/selectOptionSettingModal.module.scss'

// サイドメニューアトム
import * as AtomSideEditMenu from "../../stores/atomSideEditMenuModal";

//【ステート】共通
import * as Common from '../../common/common';
import * as AtomCommon from "../../stores/atom";

//【ステート】選択肢設定子画面
import * as AtomSelectOptionModal from "../../stores/atomSelectOptionSettingModal";

//【ステート】確認ダイアログ
import * as AtomConfirmDialog from "../../stores/atomConfirmDialog";

//【スタイル】グリッドテーブルスタイル
import cssGridTable from "../../scss/common/gridTable.module.scss";

//【ライブラリー】ReactGrid
import {
  ReactGrid,
  Row,
  MenuOption,
  CellLocation,
  SelectionMode,
  CellChange,
  TextCell,
  Id,
  CheckboxCell,
  DropdownCell,
  NumberCell,
  DateCell,
  TimeCell,
  DropPosition,
} from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";

// ローディング
import Loading from "../../components/layouts/loading";

// ヘッダー
const HeaderArea = (): JSX.Element => {
  return (
    <div
      className={`${selectOptionSettingModal.select_option_modal_header}`}
    >
      <span>選択肢設定</span>
    </div>
  );
};

// メニュー構成編集
const EditMenuArea = (): JSX.Element => {
  // 対象の選択肢項目
  const [useSearchAndSortState, setSearchAndSortState] = useAtom(AtomSelectOptionModal.searchAndSortState);

  // 検索項目一覧
  const [useSelectOptionList, setSelectOptionList] = useAtom(AtomSelectOptionModal.selectOptionListState);
  const [useSelectOptionRegister, setSelectOptionRegister] = useAtom(AtomSelectOptionModal.selectOptionRegisterState);
  const [useSelectOptionRegisterFlg, setSelectOptionRegisterFlg] = useAtom(AtomSelectOptionModal.selectOptionRegisterFlgState);

  // 入力前に戻るフラグ
  const [useBackToInitFlg, setBackToInitFlg] = useAtom(AtomSelectOptionModal.backToInitFlg);

  // 入力前に戻るフラグ
  const [useDiscardDataFlg, setDiscardDataFlg] = useAtom(AtomSelectOptionModal.discardDataFlg);

  // メッセージ
  const [getResultModalMessage, setResultModalMessage] = useAtom(
    AtomCommon.modalMessageState
  );

  // 処理実施日時
  const [useDisplayTime, setDisplayTime] = useAtom(
    AtomSelectOptionModal.selectOptionDisplayTime
  );

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

  // 項目名
  const [useItemDspName, setItemDspName] = React.useState<string>("");

  // 確認ダイアログ設定
  const setDialog = useSetAtom(AtomConfirmDialog.confirmDialogAtom);

  // クエリクライアント_他のコンポネントの関数を実行する為
  const queryClient = useQueryClient();

  /**
   * 選択している項目番号に基づき、選択肢マスタを取得
   * 
   */
  const searchSelectOptionData = async (): Promise<any> => {
    setResultModalMessage([]);
    setDataInTable([]);
    setSelectOptionList([]);
    setSelectOptionRegister([]);

    Api.post("/MNG030/searchSelectOptionData", setResultModalMessage, useSearchAndSortState)
      .then((result) => {
        let newSelectionObj = [];
        if (result.selectOptionList.length > 0) {
          // 項目名称画面
          setItemDspName(result.selectOptionList[0].item_dsp_name);

          // 選択肢を指定
          if (result.selectOptionList?.length > 0) {
            result.selectOptionList?.forEach(option => {
              newSelectionObj.push({
                itemDspName: option.item_dsp_name,
                selectionNo: String(option.selection_no),
                selectionName: option.selection_name,
                sortValue: String(option.sort_value),
              });
            });
          }
        } else {
          // 項目名称画面
          setItemDspName(useSearchAndSortState.itemDspName);

          // 選択肢を新規追加
          newSelectionObj.push({
            itemDspName: useSearchAndSortState.itemDspName,
            selectionNo: "1",
            selectionName: "",
            sortValue: "",
          });
        }

        setSelectOptionList(newSelectionObj);
        setSelectOptionRegister(newSelectionObj);
        setDisplayTime(moment(result.displayTime).format("YYYY-MM-DD HH:mm:ss.SSS"));
        setSelectOptionRegisterFlg(false);
      })
      .catch((error: Error) => {
        // 想定外のエラーの場合メッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          setResultModalMessage(errorInfo);
        }
      });
  };

  // 選択している日付に基づき、検査情報を取得
  useQuery({
    queryKey: ["searchSelectOptionData"],
    queryFn: async () => {
      // 検査情報を取得処理
      await searchSelectOptionData();
    },
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

  // 引数のデータを指定
  const setDataToGrid = async () => {
    // 選択肢一覧
    let newRowObj: any = [];
    if (useSelectOptionRegister && useSelectOptionRegister.length > 0) {
      useSelectOptionRegister?.forEach((option) => {
        newRowObj.push({
          selectionNo: String(option.selectionNo),
          selectionName: option.selectionName,
          sortValue: String(option.sortValue)
        });
      });

      // ヘッダデータ
      const newColumnObj: any = [
        { id: 1, columnName: 'selectionNo', columnTitle: '選択肢番号', width: 125, resizeAble: true },
        { id: 2, columnName: 'selectionName', columnTitle: '選択肢', width: 455, resizeAble: true },
        { id: 3, columnName: 'sortValue', columnTitle: '順序', width: 80, resizeAble: true },
      ];

      // 各データのインタフェース
      const newRowDataInterface: any = [
        { interfaceName: 'selectionNo', interfaceType: 'string' },
        { interfaceName: 'selectionName', interfaceType: 'text' },
        { interfaceName: 'sortValue', interfaceType: 'text' },
      ];

      let setNewColumn: any = []; // カラム情報
      let setNewColumnHeader: any = []; // カラムヘッダ情報

      // GridTable_カラム形
      const getColumns = (): ColumnSetting[] => setNewColumn;

      // 列設定
      setDataGridColumn(setNewColumn);
      setColumnSetting(getColumns());
      setDataGridColumnHdr(setNewColumnHeader);

      // 行設定
      setDataGridRow(useSelectOptionRegister);

      /**
       * 共通_カラムデータを取得
       * 
       */
      if (newColumnObj && newColumnObj.length > 0) {
        newColumnObj?.forEach((column) => {
          // カラム情報
          setNewColumn.push({
            columnId: column.columnName,
            width: column.width,
            resizable: column.resizeAble,
          });

          // カラムヘッダ情報
          setNewColumnHeader.push({
            type: "header",
            text: column.columnTitle,
          });
        });
      }

      /**
       * グリッドテーブル設定
       * 
       */
      setDataGridInterface(newRowDataInterface);                    // データインターフェース設定
      await setDataInTable(getRows(newRowObj));                           // データ内容_GridTable形
    }
  };

  const { isFetching, data } = useQuery({
    queryKey: ["setDataToGrid", useSelectOptionRegister],
    queryFn: async () => {
      await setDataToGrid();
    },
  });

  // データ内容を設定_GridTable形
  const getRows = (rows: any[]): Row[] => [
    {
      rowId: "header",
      height: 50,
      cells: useDataGridColumnHdr,
    },
    ...rows.map<Row>((row, index) => {
      const setRowCells = useDataGridInterface.map((item) => {
        const cellValue = row[item.interfaceName];
        switch (item.interfaceType) {
          case "string":
            // 表示のみ
            return {
              type: "text",
              text: cellValue ?? "",
              nonEditable: true,
              className: "disabled",
            };
          case "text":
            // テキスト
            return {
              type: "text",
              text: cellValue ?? "",
            };
          default:
            // セル型不明
            return {
              type: "text",
              text: cellValue ?? "",
            };
        }
      });

      // セル設定
      return {
        rowId: index,
        cells: setRowCells,
        // reorderable: true, ※ 不用
      };
    }),
  ];

  /**
     * 列の広さを調整
     * 
     * @param ci 
     * @param width 
     */
  const handleColumnResize = (ci: Id, width: number) => {
    setColumnSetting((prevColumns) => {
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

  // データ内容を更新
  const applyChanges = (
    changes: CellChange<
      TextCell | NumberCell | CheckboxCell | DropdownCell | DateCell | TimeCell
    >[],
    prevData: any[]
  ): any[] => {
    if (changes && changes.length > 0) {
      changes?.forEach((change: any) => {
        const dataRowId = change.rowId;
        const fieldName = change.columnId;
        let dataRow = prevData.find((d) => d.rowId === dataRowId);

        const dataColumnIdx = useDataGridColumn.findIndex(
          (column) => column.columnId == fieldName
        );

        if (change.type === "text") {
          dataRow.cells[dataColumnIdx].text = change.newCell.text as never;
        } else {
          console.log("ERROR", change.type, dataRow.cells[dataColumnIdx]);
        }
      });
      return [...prevData];
    }
  };

  // データ変更
  const handleChanges = (changes: CellChange<any>[]) => {
    // メッセージクリア
    setResultModalMessage([]);

    // 変更値を指定
    const setApplyChanges = applyChanges(changes, useDataInTable);
    setDataInTable((useDataInTable) => setApplyChanges);

    /**
     * 登録用のステート
     * 
     */
    let newUserObj: any = [];

    if (setApplyChanges?.length > 0) {
      setApplyChanges?.forEach(value => {
        if (value.rowId !== "header") {
          newUserObj.push({
            selectionNo: value.cells[0].text,
            selectionName: value.cells[1].text,
            sortValue: value.cells[2].text,
          });
        }
      });
    }
    setSelectOptionRegister(newUserObj);

    // 登録フラグを有効にする
    setSelectOptionRegisterFlg(true);
  };

  /**
     * 挿入
     * ※ 選択行の上に行を追加する。
     * 
     * @param selectedRowId 
     */
  const insertNewRow = (selectedRowId) => {
    // 編集中のデータを複製
    const useEditingDataDeepCopy = JSON.parse(JSON.stringify(useSelectOptionRegister));

    let newInsertRowObj = [];
    if (useEditingDataDeepCopy?.length > 0) {
      useEditingDataDeepCopy?.forEach((option, key) => {
        // 選択している項目の下に挿入
        if (key == (selectedRowId)) {
          // 当行を設定
          newInsertRowObj.push(option);

          // 行を新規挿入
          newInsertRowObj.push({
            selectionNo: "",
            selectionName: "",
            sortValue: String(useEditingDataDeepCopy.length + 1).padStart(2, "0"),
          });
        } else {
          newInsertRowObj.push(option);
        }
      });
    }

    let newRowNo: number = 0;
    if (newInsertRowObj?.length > 0) {
      newInsertRowObj?.forEach(item => {
        newRowNo += 1;
        item.selectionNo = String(newRowNo);
      });
    }

    // 一覧データを更新
    setSelectOptionRegister(newInsertRowObj);

    // 登録フラグを有効にする
    setSelectOptionRegisterFlg(true);

    // グリッドテーブル設定
    setDataInTable(getRows(newInsertRowObj));
  };

  /**
   * 削除
   * ※ 行を削除し、上に詰める。
   * 
   * @param selectedRowId 
   */
  const deleteRow = (selectedRowId) => {
    // 編集中のデータを複製
    const useDataInTableDeepCopy = JSON.parse(JSON.stringify(useSelectOptionRegister));

    // 対象データを削除
    useDataInTableDeepCopy.splice(selectedRowId, 1);

    // 一覧データを更新
    setSelectOptionRegister(useDataInTableDeepCopy);

    // 登録フラグを有効にする
    setSelectOptionRegisterFlg(true);

    // グリッドテーブル設定
    setDataInTable(getRows(useDataInTableDeepCopy));
  };

  const handlerContextMenu = (
    selectedRowIds: Id[],
    selectedColIds: Id[],
    selectionMode: SelectionMode,

    // コンテキスト設定
    menuOptions: MenuOption[],

    // 選択しているセル範囲
    selectedRanges: Array<CellLocation[]>
  ): MenuOption[] => {
    // 取消のメニューを削除
    menuOptions.splice(1, 1);

    // 挿入と削除のメニューを追加_共有メニュー
    menuOptions = [
      ...menuOptions,
      {
        id: "add-new",
        label: "挿入",
        handler: () => {
          const selectedRowId = selectedRanges[0][0].rowId;
          insertNewRow(selectedRowId);
        },
      },
      {
        id: "delete",
        label: "削除",
        handler: () => {
          // 確認ダイアログ
          setDialog((prev) => ({
            ...prev,
            isOpen: true,
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
    ];

    return menuOptions;
  };

  const setSortHeader = (ctn) => {
    let searchCondValue: AtomSelectOptionModal.searchAndSortInterface = useSearchAndSortState;
    if (useSearchAndSortState.sortColumn && (Const.SELECTION_OPTION_ITEM[ctn.textContent] !== useSearchAndSortState.sortColumn)) {
      searchCondValue = {
        ...searchCondValue,
        sortColumn: Const.SELECTION_OPTION_ITEM[ctn.textContent],
        sortOrder: AtomSelectOptionModal.defaultSearchAndSortState.sortOrder,
      };
    } else {
      searchCondValue = {
        ...searchCondValue,
        sortColumn: Const.SELECTION_OPTION_ITEM[ctn.textContent],
        sortOrder: (useSearchAndSortState.sortOrder == "ASC") ? "DESC" : "ASC",
      };
    }

    setSearchAndSortState(searchCondValue);

    // 一定時間を設定
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["searchSelectOptionData"] });
    }, 100);

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
    // ヘッダーには並び替えできないように設定
    return (targetRowId !== "header");
  };

  /**
   * 行セルの並び順を変更
   *
   * @param targetRowId
   * @param rowIds
   */
  const handleRowsReorder = (targetRowId: Id, rowIds: Id[]) => {
    // 編集中のデータを複製
    const useDataInTableDeepCopy = JSON.parse(JSON.stringify(useSelectOptionRegister));

    // 順序切替
    const to = useDataInTableDeepCopy.findIndex((person, key) => key === targetRowId);
    const rowsIds = rowIds.map((id) =>
      useDataInTableDeepCopy.findIndex((person, key) => key === id)
    );
    let newList: any = reorderArray(useDataInTableDeepCopy, rowsIds, to);

    let reorderNewObj: any = [];
    if (newList?.length > 0) {
      newList?.forEach((item, key) => {
        reorderNewObj.push({
          selectionNo: item.selectionNo,
          selectionName: item.selectionName,
          sortValue: item.sortValue
        });
      });
    }

    // 一覧データを更新
    setSelectOptionRegister(reorderNewObj);

    // 登録フラグを有効にする
    setSelectOptionRegisterFlg(true);

    // グリッドテーブル設定
    setDataInTable(getRows(reorderNewObj));
  };

  // チェックボックス項目がある時_ヘッダーにチェックボックスを設定
  useQuery({
    queryKey: ["requestAnimationFrame", useDataInTable],
    queryFn: async () => {
      setTimeout(() => {
        requestAnimationFrame(() => {
          // ヘッダーコンテナー
          const container = document.querySelectorAll(
            "#select-option-setting-grid-table .rg-cell.rg-header-cell"
          );

          // 画面判定
          let columnCheckState = useSearchAndSortState;
          let headerArray = Object.entries(Const.SELECTION_OPTION_ITEM).map(([label, key]) => ({ label, key }));

          // ヘッダ文言を取得
          let getContentText = "";
          if (headerArray?.length > 0) {
            headerArray?.forEach((item: any, index: any) => {
              if (columnCheckState.sortColumn == item.key) {
                getContentText = item.label;
              }
            });
          }

          // ソートクラスを追加
          let sortClass = `sort_asc`;
          if (columnCheckState.sortOrder === "DESC") {
            sortClass = `sort_desc`;
          }

          // 押下関数設定
          if (container) {
            Array.from(container)?.forEach((ctn, key) => {
              // ソートによる検索が成功した場合のみ、ソートアイコンの表示を切替える
              ctn.classList.add("sort_th");
              ctn.classList.remove("sort_asc");
              ctn.classList.remove("sort_desc");

              if (ctn.textContent == getContentText) {
                ctn.classList.add(sortClass);
              }

              // クリック操作を設定
              ctn.addEventListener("click", function (e) {
                setSortHeader(ctn);
              });

            });
          }
        });
      }, 200);
    }
  });

  /**
   * 入力前に戻る
   * 
   */
  useQuery({
    queryKey: ["backToInitSelectOption", useBackToInitFlg],
    queryFn: () => {
      if (useBackToInitFlg) {
        // メッセージクリア
        setResultModalMessage([]);

        // データ内容_GridTable形
        setDataInTable(getRows(useSelectOptionList));
        setSelectOptionRegister(useSelectOptionList);

        // 登録フラグを有効にする
        setSelectOptionRegisterFlg(false);
        setBackToInitFlg(false);
      }

    }
  });

  /**
   * 取消
   * 
   */
  useQuery({
    queryKey: ["discardSelectOption", useDiscardDataFlg],
    queryFn: () => {
      if (useDiscardDataFlg) {
        // メッセージクリア
        setResultModalMessage([]);

        // データ内容_GridTable形
        const discardNewObj: any = [{
          selectionName: "",
          selectionNo: "",
          sortValue: "",
        }];
        setDataInTable(getRows(discardNewObj));
        setSelectOptionRegister(discardNewObj);

        // 登録フラグを有効にする
        setSelectOptionRegisterFlg(true);
        setDiscardDataFlg(false);
      }

    }
  });

  return (
    <>
      {isFetching ? (
        <div
          style={{
            width: 100,
            justifySelf: "center",
            marginTop: "15dvh",
          }}
        >
          <Loading />
        </div>
      ) : (
        <>
          <div>
            <span style={{ marginLeft: 5 }} >{useItemDspName}</span>
          </div>
          <div
            id="select-option-setting-grid-table"
            className={(getResultModalMessage.length > 0) ? cssGridTable.grid_simple_context_table_panel_modal_msg : cssGridTable.grid_simple_context_table_panel_modal}
          >
            <ReactGrid
              rows={useDataInTable}
              columns={columnSetting}
              labels={customLabels}
              onCellsChanged={handleChanges}
              onColumnResized={handleColumnResize}
              onContextMenu={handlerContextMenu}
              onRowsReordered={handleRowsReorder}
              canReorderRows={handleCanReorderRows}
              // enableRowSelection
              enableColumnSelection={false}
              // stickyLeftColumns={1}
              stickyTopRows={1}
            // enableRangeSelection
            />
          </div>
        </>
      )}


    </>
  )
}

// フッター
const FooterArea = (): JSX.Element => {
  // 対象の選択肢項目
  const [useSearchAndSortState, setSearchAndSortState] = useAtom(AtomSelectOptionModal.searchAndSortState);

  // モダール開閉のフラグ
  const [useSelectOptionSettingModalToggleFlg, setSelectOptionSettingModalToggleFlg] = useAtom(AtomSelectOptionModal.selectOptionSettingModalToggleFlg);
  const [useSelectOptionList, setSelectOptionList] = useAtom(AtomSelectOptionModal.selectOptionListState);
  const [useSelectOptionRegister, setSelectOptionRegister] = useAtom(AtomSelectOptionModal.selectOptionRegisterState);
  const [useSelectOptionRegisterFlg, setSelectOptionRegisterFlg] = useAtom(AtomSelectOptionModal.selectOptionRegisterFlgState);

  // 入力前に戻るフラグ
  const [useBackToInitFlg, setBackToInitFlg] = useAtom(AtomSelectOptionModal.backToInitFlg);

  // 入力前に戻るフラグ
  const [useDiscardDataFlg, setDiscardDataFlg] = useAtom(AtomSelectOptionModal.discardDataFlg);

  // 確認ダイアログ設定
  const setDialog = useSetAtom(AtomConfirmDialog.confirmDialogAtom);

  // クエリクライアント_他のコンポネントの関数を実行する為
  const queryClient = useQueryClient();

  // 検証完了の登録データ
  const [useValidatedData, setValidatedData] = React.useState<any>([]);

  // メッセージ
  const [getResultModalMessage, setResultModalMessage] = useAtom(
    AtomCommon.modalMessageState
  );

  // 処理実施日時
  const [useDisplayTime, setDisplayTime] = useAtom(
    AtomSelectOptionModal.selectOptionDisplayTime
  );

  // 登録するデータ検証
  const validateSaveUserMasterData = async () => {
    // データ検証
    setValidatedData([]);
    setResultModalMessage([]);

    if (useSelectOptionRegisterFlg) {
      let errorCnt: number = 0;
      let dupSortValue: string[] = [];

      // 検査項目マスタのバリデーション
      if (useSelectOptionRegister && useSelectOptionRegister.length > 0) {
        // 取消確認
        if (useSelectOptionRegister.length == 1 && (!useSelectOptionRegister[0].selectionNo && !useSelectOptionRegister[0].selectionName && !useSelectOptionRegister[0].sortValue)) {
          // 入力チェックを実施しない
        } else {
          if (useSelectOptionRegister?.length > 0) {
            useSelectOptionRegister?.forEach(data => {
              /**
               * ########## 選択肢 ##########
               */
              // 選択肢が未入力の場合エラー
              if (Common.checkNullOfString(data.selectionName)) {
                // エラー数える
                errorCnt += 1;

                // 必須項目のエラーメッセージを表示
                const errorInfo: AtomCommon.message[] = [];
                errorInfo.push(getMessage(["WQ-0006W", "選択肢"]));
                setResultModalMessage(errorInfo);
              }

              // 選択肢が51桁以上の場合エラー
              if (Common.checkLengthOverOfString(data.selectionName, 50)) {
                // エラー数える
                errorCnt += 1;

                // 必須項目のエラーメッセージを表示
                const errorInfo: AtomCommon.message[] = [];
                errorInfo.push(getMessage(["WQ-0012W", "選択肢", "50"]));
                setResultModalMessage(errorInfo);
              }

              /**
               * ########## 順序 ##########
               */
              // 順序が未入力の場合、エラー
              if (Common.checkNullOfString(data.sortValue)) {
                // エラー数える
                errorCnt += 1;

                // 必須項目のエラーメッセージを表示
                const errorInfo: AtomCommon.message[] = [];
                errorInfo.push(getMessage(["WQ-0006W", "順序"]));
                setResultModalMessage(errorInfo);
              }

              // 順序が重複している場合エラー
              if (dupSortValue.find((userId) => userId == data.sortValue)) {
                // エラー数える
                errorCnt += 1;

                // 必須項目のエラーメッセージを表示
                const errorInfo: AtomCommon.message[] = [];
                errorInfo.push(getMessage(["WQ-0017W", "順序"]));
                setResultModalMessage(errorInfo);
              } else {
                dupSortValue.push(data.sortValue);
              }
            });
          }
        }
      }

      // エラー発生を判定
      if (errorCnt === 0) {
        saveSelectionMutation.mutate();
        return true;
      } else {
        return false;
      }
    } else {
      // エラーメッセージ
      const errorInfo: AtomCommon.message[] = [];
      errorInfo.push(getMessage(["WQ-0019W"]));
      setResultModalMessage(errorInfo);

      setSelectOptionRegisterFlg(false);

      return false;
    }
  };

  // データ登録
  const saveSelectionMutation = useMutation({
    mutationFn: async (saveData) => {
      let setValidateMode = "selection";
      let setDataToSave = useSelectOptionRegister;
      if (useSelectOptionRegister.length == 1 && (!useSelectOptionRegister[0].selectionNo && !useSelectOptionRegister[0].selectionName && !useSelectOptionRegister[0].sortValue)) {
        // 取消モード
        setValidateMode = "selection_discard";
        setDataToSave = [];
      }

      // リクエスト
      const request = {
        item_no: useSearchAndSortState.itemNo,
        data_to_save: setDataToSave,
        validateMode: setValidateMode,
        display_time: moment(useDisplayTime).format("YYYY-MM-DD HH:mm:ss.SSS") || moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS"),
      };

      // 登録実施
      const response = await Api.post(
        "/MNG030/saveSelectionOptionData",
        setResultModalMessage,
        request
      );

      return response;
    },
    // 正常終了
    onSuccess: () => {
      // 再取得クエリキー
      queryClient.invalidateQueries({ queryKey: ["searchSelectOptionData"] });

      // 処理正常終了のメッセージ
      const msgInfo: AtomCommon.message[] = [];
      msgInfo.push(getMessage(["WQ-0002I"]));
      setResultModalMessage(msgInfo);
    },
    // エラー発生
    onError: (error) => {
      // エラーメッセージ　※ Apiファイルからエラーメッセージを設定
    },
  });

  return (
    <div
      className={`${selectOptionSettingModal.select_option_modal_footer}`}
      id="selectOptionModalFooter"
    >
      <div className={`${cssEditMenuModal.modal_footer_button}`}>
        <Button
          title="取消"
          width="120px"
          margin="0px 0px 0px 15px"
          className={`button_hover_orange ${selectOptionSettingModal.footer_btn_left}`}
          onClick={() => {
            // 確認ダイアログ
            setDialog((prev) => ({
              ...prev,
              isOpen: true,
              message: getMessage(["WQ-0005Q", "選択肢設定した情報をすべて取消"]).message,
              onConfirm: async () => {
                setDiscardDataFlg(true);
              },
              onCancel: () => {
                // 処理なし
              },
            }));
          }}
        />
        <Button
          title="入力前に戻る"
          width="120px"
          margin="0px 0px 0px 15px"
          className={`footer_prev_btn button_hover_gray ${selectOptionSettingModal.footer_btn_left}`}
          onClick={() => {
            // 確認ダイアログ
            setDialog((prev) => ({
              ...prev,
              isOpen: true,
              message: getMessage(["WQ-0005Q", "選択肢設定した情報をすべて廃棄"]).message,
              onConfirm: async () => {
                // queryClient.invalidateQueries({ queryKey: ["backToInitSelectOption"] });
                setBackToInitFlg(true);
              },
              onCancel: () => {
                // 処理なし
              },
            }));
          }}
        />

        {/* 閉じるボタン */}
        <Button
          title="閉じる"
          width="100px"
          margin="0px 0px 0px 15px"
          className={`footer_cencel_btn button_active_white ${selectOptionSettingModal.footer_btn_right}`}
          onClick={() => {
            // ステートクリア
            setSelectOptionList([]);
            setSelectOptionRegister([]);
            setSelectOptionRegisterFlg(false);
            setSearchAndSortState(AtomSelectOptionModal.defaultSearchAndSortState);

            // 子画面閉じる
            setSelectOptionSettingModalToggleFlg(false);
          }}
        />
        {/* 登録ボタン */}
        <Button
          title="登録"
          width="100px"
          margin="0px 0px 0px 15px"
          className={`button_hover_green ${selectOptionSettingModal.footer_btn_right}`}
          onClick={() => {
            // 確認ダイアログ
            setDialog((prev) => ({
              ...prev,
              isOpen: true,
              message: getMessage(["WQ-0001Q"]).message,
              onConfirm: () => {
                const isValid = validateSaveUserMasterData();
              },
              onCancel: () => {
                // 処理なし
              },
            }));
          }}
        />
      </div>
    </div>
  );
};

export const SelectOptionSettingModal = (): JSX.Element => {

  return (
    <div
      className='modal'
    >
      <div
        className='modal_content'
        style={{ width: 700 }}
      >
        <HeaderArea />
        <div
          className={`contents_panel ${cssEditMenuModal.panel_modal_content}`}
        >
          <ModalMessageArea />
          <EditMenuArea />

        </div>
        <FooterArea />
      </div>
    </div>
  );
};

export default SelectOptionSettingModal;
