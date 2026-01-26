/**
 * 【汎用】
 *  MNG010、MNG020、MNG030、MNG040向けの共通コンポネント
 * 
 */
import React from "react";
import { Api, getMessage } from "../../common/api";
import { SetStateAction, useAtom, useSetAtom } from "jotai";
// useQuery
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Const from "../../common/const";

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
} from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";

// ローディング
import Loading from "../../components/layouts/loading";

//【コンポネント】セレクトボックスセル
import {
  SelectCell,
  SelectCellTemplate,
} from "../../components/common/grid-table-custom-cells/select.cell.tsx";

//【コンポネント】異常値一覧のモダール
import { SelectOptionSettingModal } from "../modals/index.ts";
import { CommonStateContainer } from '../../components/containers/commonStateContainer';
import { Mng010StateContainer } from '../../components/containers/mng010StateContainer';
import { Mng020StateContainer } from '../../components/containers/mng020StateContainer';
import { Mng030StateContainer } from '../../components/containers/mng030StateContainer';
import { Mng040StateContainer } from '../../components/containers/mng040StateContainer';
import { SelectOptionStateContainer } from '../../components/containers/selectOptionStateContainer';
import { DspConfigGridTableStateContainer } from '../../components/containers/dspConfigGridTableStateContainer';
import { InspectionItemSettingStateContainer } from '../../components/containers/inspectionItemSettingStateContainer';
import { ConfirmDialogStateContainer } from '../../components/containers/confirmDialogStateContainer';

//【ステート】汎用
import * as AtomCommon from "../../stores/atom";
import * as AtomDspConfigGridTable from "../../stores/atomDspConfigGridTable";
import * as AtomMng010 from "../../stores/atomMNG010";
import * as AtomMng020 from "../../stores/atomMNG020";
import * as AtomMng030 from "../../stores/atomMNG030";
import * as AtomMng040 from "../../stores/atomMNG040";

// 日時管理ライブラリー
import moment from "moment";

// 属性
interface Props {
  dataGrid?: any;
  setterName?: (value: SetStateAction<any>) => void;
}

// コンポーネントエクスポート
export var GridSimpleContextTable: React.FC<Props> = function ({
  dataGrid,
  setterName,
}) {
  /**
   * ステートコンテナーからステートを呼び出す
   * 
   */
  const commonState = CommonStateContainer();                                       // 汎用
  const mng010State = Mng010StateContainer();                                       // ユーザマスタ
  const mng020State = Mng020StateContainer();                                       // 採水地点設定マスタ
  const mng030State = Mng030StateContainer();                                       // 検査項目設定
  const Mng040State = Mng040StateContainer();                                       // 基準値設定
  const selectOptionState = SelectOptionStateContainer();                           // 選択肢設定子画面
  const confirmDialog = ConfirmDialogStateContainer();                              // 確認ダイアログ
  const dspConfigGridTable = DspConfigGridTableStateContainer();                    // 入力画面構成マスタ
  const InspectionItemSettingState = InspectionItemSettingStateContainer();         // 採水項目設定

  /**
   * ローカルステート
   * 
   */
  const [columnSetting, setColumnSetting] = React.useState<ColumnSetting[]>([]);      // カラム設定
  const [useDataGridColumn, setDataGridColumn] = React.useState<any>();               // カラム情報
  const [useDataGridColumnHdr, setDataGridColumnHdr] = React.useState<any>();         // カラムヘッダ情報
  const [useDataGridInterface, setDataGridInterface] = React.useState<any>();         // データ型
  const [useManageProcessNo, setManageProcessNo] = React.useState<any>(null);         // 管理画面番号
  const [useDataInTable, setDataInTable] = React.useState<any[]>([]);                 // GridTable形
  const [useDataGridRow, setDataGridRow] = React.useState<any>();                     // データ情報

  /**
   * 1.カラムヘッダ設定
   *
   */
  interface ColumnSetting {
    columnId: string;
    width: number;
    resizable?: boolean;
  }

  // クエリクライアント_他のコンポネントの関数を実行する為
  const queryClient = useQueryClient();

  // 引数のデータを指定
  const setDataToGrid = () => {
    // ステートクリア_MNG010
    mng010State.setUserMasterRegistState([]);
    mng010State.setUserMasterRegistFlgState(false)

    // ステートクリア_MNG020
    mng020State.setSaisuiPointRegistState([]);
    mng020State.setSaisuiPointRegistFlgState(false);
    dspConfigGridTable.setSelectInspectKbnState([]);
    dspConfigGridTable.setInputDspConfigState(AtomDspConfigGridTable.defaultInputDspConfigState);

    // ステートクリア_MNG030
    mng030State.setMng030InspItemRegist([]);
    mng030State.setMng030InspItemRegistFlg(false)

    // ステートクリア_MNG040
    Mng040State.setMng040InspCriteriaRegist([]);
    Mng040State.setMng040InspCriteriaRegistFlg(false)

    let setNewColumn: any = []; // カラム情報
    let setNewColumnHeader: any = []; // カラムヘッダ情報

    /**
     * 共通_カラムデータを取得
     * 
     */
    if (dataGrid.columnData?.length > 0) {
      dataGrid.columnData?.forEach((column) => {
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

    // GridTable_カラム形
    const getColumns = (): ColumnSetting[] => setNewColumn;

    // 列設定
    setDataGridColumn(setNewColumn);
    setColumnSetting(getColumns());
    setDataGridColumnHdr(setNewColumnHeader);

    // 行設定
    setDataGridRow(dataGrid.rowData);

    // 管理画面番号を指定
    setManageProcessNo(dataGrid.mngNo);

    /**
     * MNG010_ユーザマスタ
     * 
     */
    mng010State.setSelectAffiDeptState(dataGrid.affiliaDeptSelect);           // 所属部
    mng010State.setSelectAffiSectState(dataGrid.affiliaSectSelect);           // 所属課
    mng010State.setSelectSecurityLevelState(dataGrid.securityLevelSelect);    // 権限
    mng010State.setSelectFixFlgState(dataGrid.fixFlgSelect);                  // 確定ボタン表示フラグ
    mng010State.setUserMasterRegistState(dataGrid.rowData);

    /**
     * MNG020_採水地点設定
     * 
     */
    mng020State.setSaisuiPointListState(dataGrid.rowData);                    // 採水地点検索一覧
    mng020State.setSelectSaisuiKbnState(dataGrid.saisuiKbnSelect);            // 採水区分選択肢
    mng020State.setSelectSisetuState(dataGrid.sisetuKbnSelect);               // 施設選択肢
    mng020State.setSelectProcessState(dataGrid.processKbnSelect);             // 処理過程選択肢
    mng020State.setSaisuiPointRegistState(dataGrid.rowData);                  // 登録用の採水地点データ
    mng020State.setMaxSaisuiPoint(dataGrid.maxSaisuiPoint)                    // 採水地点番号の最大値
    Mng040State.setValidDigitsState(dataGrid.validDigitsSelect);                          // 有効桁数選択肢
    Mng040State.setInputDigitsState(dataGrid.inputDigitsSelect);                          // 入力最小桁選択肢
    Mng040State.setOutputDigitsState(dataGrid.outputDigitsSelect);                        // 出力最小桁選択肢

    /**
     * MNG030_検査項目マスタ
     * 
     */
    mng030State.setMng030SelectItemDaiCategory(dataGrid.itemDaiCategorySelect);                // 検査項目大分類
    mng030State.setMng030SelectItemTyuCategory(dataGrid.itemTyuCategorySelect);                // 検査項目中分類
    mng030State.setMng030SelectConstantQualitativeFlg(dataGrid.ConstantQualitativeSelect);     // データ区分名称
    mng030State.setMng030SelectInputType(dataGrid.InputTypeSelect);                            // 入力タイプ
    mng030State.setMng030InspItemRegist(dataGrid.rowData);                                     // 登録用の検査項目データ
    mng030State.setMng030MaxItemNo(dataGrid.maxItemNo)                                         // 採水地点番号の最大値

    /**
     * MNG040_検査基準マスタ
     * 
     */
    mng030State.setMng030SelectItemDaiCategory(dataGrid.itemDaiCategorySelect);                // 検査項目大分類
    mng030State.setMng030SelectItemTyuCategory(dataGrid.itemTyuCategorySelect);                // 検査項目中分類
    Mng040State.setMng040ApplyYear(dataGrid.houKijyunNoSelect);                                // 適用年度
    Mng040State.setMng040SaisuiKbn(dataGrid.houKijyunNoSelect);                                // 採水区分
    Mng040State.setMng040LatestYear(dataGrid.latestYear)                                       // 最新の適用
    Mng040State.setMng040AddNextYear(Number(dataGrid.latestYear) + 1)                          // 追加する適用年度
    Mng040State.setMng040InspCriteriaRegist(dataGrid.rowData);                                 // 登録用の検査基準データ

    /**
     * グリッドテーブル設定
     * 
     */
    setDataGridInterface(dataGrid.rowInterface);                  // データインターフェース設定
    setDataInTable(getRows(dataGrid.rowData));                    // データ内容_GridTable形

    window.onresize = reportWindowSize;

    return true;
  };

  // 引数のデータを指定
  const { isFetching, data } = useQuery({
    queryKey: ["dataGrid", dataGrid],
    queryFn: setDataToGrid,
  });

  useQuery({
    queryKey: ["gridTableUpdate", mng020State.useSaisuiPointListState],
    queryFn: () => {
      // データ内容_GridTable形
      setDataInTable(getRows(dataGrid.rowData));

      return true;
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
      // 項目番号が「1」か「2」の場合、セルを非活性にする。
      let setNonEditable: boolean = false;
      let setClassName: string = "";
      if (row.itemNo == "1" || row.itemNo == "2") {
        setNonEditable = true;
        setClassName = "disable_primary_cell";
      }

      const setRowCells = useDataGridInterface.map((item) => {
        const cellValue = row[item.interfaceName];
        let setColumnClassName: string = " ";
        if (useManageProcessNo == "MNG040") {
          if (item.interfaceName == "itemNo" || item.interfaceName == "itemDspName") {
            setColumnClassName = " disable_primary_cell";
          }

        }
        switch (item.interfaceType) {
          case "string":
            // 表示のみ
            return {
              type: "text",
              text: cellValue ?? "",
              nonEditable: true,
              className: "text_align_center " + setClassName + setColumnClassName
            };
          case "text":
            // テキスト
            return {
              type: "text",
              text: cellValue ?? "",
              nonEditable: setNonEditable,
              className: setClassName
            };
          case "date":
            // 日付
            return {
              type: "date",
              date: cellValue ? new Date(cellValue) : new Date(),
              nonEditable: setNonEditable,
              className: setClassName
            };
          case "select":
            // セレクトボックス
            let setText = "";
            let setOptions = [];

            // MNG010, MNG020, MNG030, MNG040を判定
            switch (useManageProcessNo) {
              case "MNG010":
                if (item.interfaceName == "affiliationDept") {
                  // 所属部
                  setText = (mng010State.useSelectAffiDeptState.find(({ value }) => value == cellValue)) ? mng010State.useSelectAffiDeptState.find(({ value }) => value == cellValue).label : "";
                  setOptions = mng010State.useSelectAffiDeptState ?? [];
                } else if (item.interfaceName == "affiliationSectionNo") {
                  // 所属課
                  setText = (mng010State.useSelectAffiSectState.find(({ value }) => value == cellValue)) ? mng010State.useSelectAffiSectState.find(({ value }) => value == cellValue).label : "";
                  setOptions = mng010State.useSelectAffiSectState ?? [];
                } else if (item.interfaceName == "securityLevel") {
                  // 権限
                  setText = (mng010State.useSelectSecurityLevelState.find(({ value }) => value == cellValue)) ? mng010State.useSelectSecurityLevelState.find(({ value }) => value == cellValue).label : "";
                  setOptions = mng010State.useSelectSecurityLevelState ?? [];
                } else {
                  // 確定ボタンの表示フラグ
                  setText = (mng010State.useSelectFixFlgState.find(({ value }) => value == cellValue)) ? mng010State.useSelectFixFlgState.find(({ value }) => value == cellValue).label : "";
                  setOptions = mng010State.useSelectFixFlgState ?? [];
                }
                break;
              case "MNG020":
                if (item.interfaceName == "saisuiKbnNo") {
                  // 採水区分選択肢
                  setText = (mng020State.useSelectSaisuiKbnState.find(({ value }) => value == cellValue)) ? mng020State.useSelectSaisuiKbnState.find(({ value }) => value == cellValue).label : "";
                  setOptions = mng020State.useSelectSaisuiKbnState ?? [];
                } else if (item.interfaceName == "sisetuNo") {
                  // 施設選択肢（浄水場）
                  setText = (mng020State.useSelectSisetuState.find(({ value }) => value == cellValue)) ? mng020State.useSelectSisetuState.find(({ value }) => value == cellValue).label : "";
                  setOptions = mng020State.useSelectSisetuState ?? [];
                } else {
                  // その他（処理過程選択肢）
                  setText = (mng020State.useSelectProcessState.find(({ value }) => String(value) == String(cellValue))) ? mng020State.useSelectProcessState.find(({ value }) => String(value) == String(cellValue)).label : "";
                  setOptions = mng020State.useSelectProcessState ?? [];
                }
                break;
              case "MNG030":
                if (item.interfaceName == "constantQualitativeFlg") {
                  // データ区分名称
                  setText = (mng030State.useMng030SelectConstantQualitativeFlg.find(({ value }) => value == cellValue)) ? mng030State.useMng030SelectConstantQualitativeFlg.find(({ value }) => value == cellValue).label : "";
                  setOptions = mng030State.useMng030SelectConstantQualitativeFlg ?? [];
                } else if (item.interfaceName == "inputType") {
                  // 入力タイプ
                  setText = (mng030State.useMng030SelectInputType.find(({ value }) => value == cellValue)) ? mng030State.useMng030SelectInputType.find(({ value }) => value == cellValue).label : "";
                  setOptions = mng030State.useMng030SelectInputType ?? [];
                } else if (item.interfaceName == "itemDaiCategoryNo") {
                  // 検査項目大分類
                  setText = (mng030State.useMng030SelectItemDaiCategory.find(({ value }) => value == cellValue)) ? mng030State.useMng030SelectItemDaiCategory.find(({ value }) => value == cellValue).label : "";
                  setOptions = mng030State.useMng030SelectItemDaiCategory ?? [];
                } else {
                  // 検査項目中分類
                  setText = (mng030State.useMng030SelectItemTyuCategory.find(({ value }) => value == cellValue)) ? mng030State.useMng030SelectItemTyuCategory.find(({ value }) => value == cellValue).label : "";
                  setOptions = mng030State.useMng030SelectItemTyuCategory ?? [];
                }
                break;
              case "MNG040":
                if (item.interfaceName == "saisuiKbnNo") {
                  // 採水区分選択肢
                  setText = (mng020State.useSelectSaisuiKbnState.find(({ value }) => value == cellValue)) ? mng020State.useSelectSaisuiKbnState.find(({ value }) => value == cellValue).label : "";
                  setOptions = mng020State.useSelectSaisuiKbnState ?? [];
                } else if (item.interfaceName == "validDigits") {
                  // 有効桁数選択肢
                  setText = (Mng040State.useValidDigitsState.find(({ value }) => value == cellValue)) ? Mng040State.useValidDigitsState.find(({ value }) => value == cellValue).label : null;
                  setOptions = Mng040State.useValidDigitsState ?? [];
                } else if (item.interfaceName == "inputMinDigits") {
                  // 入力最小桁選択肢
                  setText = (Mng040State.useInputDigitsState.find(({ value }) => value == cellValue)) ? Mng040State.useInputDigitsState.find(({ value }) => value == cellValue).label : null;
                  setOptions = Mng040State.useInputDigitsState ?? [];
                } else if (item.interfaceName == "outputMinDigits") {
                  // 出力最小桁選択肢
                  setText = (Mng040State.useOutputDigitsState.find(({ value }) => value == cellValue)) ? Mng040State.useOutputDigitsState.find(({ value }) => value == cellValue).label : null;
                  setOptions = Mng040State.useOutputDigitsState ?? [];
                }
                break;
              default:
                break;
            }

            return {
              type: "select",
              selectedValue: cellValue,
              value: cellValue,
              text: setText,
              options: setOptions,
              nonEditable: setNonEditable,
              className: setClassName,
              defaultOption: true,
            };
          default:
            // セル型不明
            console.warn("セル種は不明 : ", item.interfaceType);
            return {
              type: "text",
              text: cellValue ?? "",
              nonEditable: setNonEditable,
              className: setClassName
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
    if (changes?.length > 0) {
      changes?.forEach((change: any) => {
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
        } else if (change.type === "select") {
          dataRow.cells[dataColumnIdx].selectedValue = change.newCell.value as never;
          dataRow.cells[dataColumnIdx].value = change.newCell.value as never;

          // MNG010, MNG020, MNG030, MNG040を判定_項目確認
          switch (useManageProcessNo) {
            case "MNG010":
              if (fieldName == "affiliationDept") {
                // 所属部
                if (mng010State.useSelectAffiDeptState.find(({ value }) => value == change.newCell.text)) {
                  dataRow.cells[dataColumnIdx].text = mng010State.useSelectAffiDeptState.find(({ value }) => value == change.newCell.text).label as never;
                } else {
                  dataRow.cells[dataColumnIdx].text = "";
                }
              } else if (fieldName == "affiliationSectionNo") {
                // 所属課
                if (mng010State.useSelectAffiSectState.find(({ value }) => value == change.newCell.text)) {
                  dataRow.cells[dataColumnIdx].text = mng010State.useSelectAffiSectState.find(({ value }) => value == change.newCell.text).label as never;
                } else {
                  dataRow.cells[dataColumnIdx].text = "";
                }
              } else if (fieldName == "securityLevel") {
                // 権限
                if (mng010State.useSelectSecurityLevelState.find(({ value }) => value == change.newCell.value)) {
                  dataRow.cells[dataColumnIdx].text = mng010State.useSelectSecurityLevelState.find(({ value }) => value == change.newCell.value).label as never;
                } else {
                  dataRow.cells[dataColumnIdx].text = "";
                }
              } else {
                // 権限
                if (mng010State.useSelectFixFlgState.find(({ value }) => value == change.newCell.value)) {
                  dataRow.cells[dataColumnIdx].text = mng010State.useSelectFixFlgState.find(({ value }) => value == change.newCell.value).label as never;
                } else {
                  dataRow.cells[dataColumnIdx].text = "";
                }
              }
              break;
            case "MNG020":
              if (fieldName == "saisuiKbnNo") {
                // 採水区分選択肢
                if (mng020State.useSelectSaisuiKbnState.find(({ value }) => value == change.newCell.value)) {
                  dataRow.cells[dataColumnIdx].text = mng020State.useSelectSaisuiKbnState.find(({ value }) => value == change.newCell.value).label as never;
                } else {
                  dataRow.cells[dataColumnIdx].text = "";
                }
              } else if (fieldName == "sisetuNo") {
                // 施設選択肢（浄水場）
                if (mng020State.useSelectSisetuState.find(({ value }) => value == change.newCell.value)) {
                  dataRow.cells[dataColumnIdx].text = mng020State.useSelectSisetuState.find(({ value }) => value == change.newCell.value).label as never;
                } else {
                  dataRow.cells[dataColumnIdx].text = "";
                }
              } else {
                // その他（処理過程選択肢）
                if (mng020State.useSelectProcessState.find(({ value }) => String(value) == String(change.newCell.value))) {
                  dataRow.cells[dataColumnIdx].text = mng020State.useSelectProcessState.find(({ value }) => String(value) == String(change.newCell.value)).label as never;
                } else {
                  dataRow.cells[dataColumnIdx].text = "";
                }
              }
              break;
            case "MNG030":
              if (fieldName == "constantQualitativeFlg") {
                // データ区分名称
                if (mng030State.useMng030SelectConstantQualitativeFlg.find(({ value }) => value == change.newCell.value)) {
                  dataRow.cells[dataColumnIdx].text = mng030State.useMng030SelectConstantQualitativeFlg.find(({ value }) => value == change.newCell.value).label as never;
                } else {
                  dataRow.cells[dataColumnIdx].text = mng030State.useMng030SelectConstantQualitativeFlg[0].label;
                }
              } else if (fieldName == "inputType") {
                // 入力タイプ
                if (mng030State.useMng030SelectInputType.find(({ value }) => value == change.newCell.value)) {
                  dataRow.cells[dataColumnIdx].text = mng030State.useMng030SelectInputType.find(({ value }) => value == change.newCell.value).label as never;
                } else {
                  dataRow.cells[dataColumnIdx].text = "";
                }
              } else if (fieldName == "itemDaiCategoryNo") {
                // 入力タイプ
                if (mng030State.useMng030SelectItemDaiCategory.find(({ value }) => value == change.newCell.value)) {
                  dataRow.cells[dataColumnIdx].text = mng030State.useMng030SelectItemDaiCategory.find(({ value }) => value == change.newCell.value).label as never;
                } else {
                  dataRow.cells[dataColumnIdx].text = "";
                }
              } else {
                // 検査項目中分類
                if (mng030State.useMng030SelectItemTyuCategory.find(({ value }) => value == change.newCell.value)) {
                  dataRow.cells[dataColumnIdx].text = mng030State.useMng030SelectItemTyuCategory.find(({ value }) => value == change.newCell.value).label as never;
                } else {
                  dataRow.cells[dataColumnIdx].text = "";
                }
              }
              break;
            case "MNG040":
              if (fieldName == "saisuiKbnNo") {
                // 採水区分選択肢
                if (mng020State.useSelectSaisuiKbnState.find(({ value }) => value == change.newCell.value)) {
                  dataRow.cells[dataColumnIdx].text = mng020State.useSelectSaisuiKbnState.find(({ value }) => value == change.newCell.value).label as never;
                } else {
                  dataRow.cells[dataColumnIdx].text = "";
                }
              } else if (fieldName == "validDigits") {
                // 有効桁数選択肢
                if (Mng040State.useValidDigitsState.find(({ value }) => value == change.newCell.value)) {
                  dataRow.cells[dataColumnIdx].text = Mng040State.useValidDigitsState.find(({ value }) => value == change.newCell.value).label as never;
                } else {
                  dataRow.cells[dataColumnIdx].text = "";
                }
              } else if (fieldName == "inputMinDigits") {
                // 入力最小桁選択肢
                if (Mng040State.useInputDigitsState.find(({ value }) => value == change.newCell.value)) {
                  dataRow.cells[dataColumnIdx].text = Mng040State.useInputDigitsState.find(({ value }) => value == change.newCell.value).label as never;
                } else {
                  dataRow.cells[dataColumnIdx].text = "";
                }
              } else if (fieldName == "outputMinDigits") {
                // 出力最小桁選択肢
                if (Mng040State.useOutputDigitsState.find(({ value }) => value == change.newCell.value)) {
                  dataRow.cells[dataColumnIdx].text = Mng040State.useOutputDigitsState.find(({ value }) => value == change.newCell.value).label as never;
                } else {
                  dataRow.cells[dataColumnIdx].text = "";
                }
              }
              break;
            default:
              break;
          }
        } else if (change.type === "date") {
          dataRow.cells[dataColumnIdx].date = change.newCell.date as never;
        } else if (change.type === "time") {
          dataRow.cells[dataColumnIdx].time = change.newCell.time as never;
        } else {
          console.log("ERROR", change.type, dataRow.cells[dataColumnIdx]);
        }
      });
    }

    return [...prevData];
  };

  // データ変更
  const handleChanges = (changes: CellChange<any>[]) => {
    const setApplyChanges = applyChanges(changes, useDataInTable);
    setDataInTable((useDataInTable) => setApplyChanges);

    /**
     * 登録用のステート
     * 
     */
    // MNG010, MNG020, MNG030, MNG040を判定_項目確認
    let newObjIndex: number = 0;
    switch (useManageProcessNo) {
      case "MNG010":
        // MNG010_ユーザマスタ
        let newUserMasterObj: any = [];

        if (setApplyChanges?.length > 0) {
          setApplyChanges?.forEach(value => {
            if (value.rowId !== "header") {
              newObjIndex += 1;
              const getCurData = mng010State.useUserMasterRegistState[value.rowId];

              newUserMasterObj.push({
                rowNo: getCurData.rowNo,
                userNo: value.cells[0].text,
                userId: value.cells[1].text,
                userPassword: value.cells[2].text,
                userName: value.cells[3].text,
                userFurigana: value.cells[4].text,
                affiliationDept: value.cells[5].text,
                affiliationSectionNo: String(value.cells[6].value).padStart(2, '0'),
                securityLevel: (value.cells[7].text == "管理用ID") ? 1 : 0,
                fixFlg: (value.cells[8].text == "表示") ? 1 : 0,
                registDate: value.cells[9].date,
                endDate: value.cells[10].date,
                processFlg: (value.rowId == changes[0].rowId && getCurData.processFlg !== "NEW") ? "EDIT" : getCurData.processFlg,
              });
            }
          });
        }

        mng010State.setUserMasterRegistState(newUserMasterObj);

        // 登録フラグを有効にする
        mng010State.setUserMasterRegistFlgState(true);
        break;
      case "MNG020":
        // MNG020_採水地点設定
        let newSaisuiPointObj: any = [];
        if (useDataInTable?.length > 0) {
          useDataInTable?.forEach(value => {
            if (value.rowId !== "header") {
              newObjIndex += 1;
              newSaisuiPointObj.push({
                rowNo: value.cells[0].text,
                pointNo: value.cells[1].text,
                pointDspName: value.cells[2].text,
                pointReportName: value.cells[3].text,
                saisuiKbnNo: value.cells[4].value,
                sisetuNo: value.cells[5].value,
                processNo: String(value.cells[6].value)
              });
            }
          });
        }

        mng020State.setSaisuiPointRegistState(newSaisuiPointObj);

        // 登録フラグを有効にする
        mng020State.setSaisuiPointRegistFlgState(true);
        break;
      case "MNG030":
        // MNG030_検査項目設定
        let newInspItemObj: any = [];
        if (setApplyChanges?.length > 0) {
          setApplyChanges?.forEach(value => {
            if (value.rowId !== "header") {
              newObjIndex += 1;
              const getCurData = mng030State.useMng030InspItemRegist[value.rowId];

              newInspItemObj.push({
                rowNo: value.cells[0].text,
                itemNo: value.cells[1].text,
                itemDspName: value.cells[2].text,
                itemReportName: value.cells[3].text,
                itemUnit: value.cells[4].text,
                constantQualitativeFlg: value.cells[5].value,
                inputType: value.cells[6].value,
                itemDaiCategoryNo: value.cells[7].value,
                itemTyuCategoryNo: value.cells[8].value,
                inspectionItemComment: value.cells[9].text,
                processFlg: (value.rowId == changes[0].rowId && getCurData.processFlg !== "NEW") ? "EDIT" : getCurData.processFlg,
              });
            }
          });
        }

        mng030State.setMng030InspItemRegist(newInspItemObj);

        // 登録フラグを有効にする
        mng030State.setMng030InspItemRegistFlg(true);
        break;
      case "MNG040":
        // MNG030_検査項目設定
        let newInspCriteriaObj: any = [];
        if (setApplyChanges?.length > 0) {
          setApplyChanges?.forEach(value => {
            if (value.rowId !== "header") {
              newObjIndex += 1;
              const getCurData = Mng040State.useMng040InspCriteriaRegist[value.rowId];

              newInspCriteriaObj.push({
                rowNo: value.cells[0].text,
                itemNo: value.cells[1].text,
                itemDspName: value.cells[2].text,
                saisuiKbnNo: value.cells[3].value,
                regulationLowLimit: value.cells[4].text,
                regulationUpLimit: value.cells[5].text,
                inputLowLimit: value.cells[6].text,
                inputUpLimit: value.cells[7].text,
                reportLowLimit: value.cells[8].text,
                reportUpLimit: value.cells[9].text,
                validDigits: value.cells[10].text,
                inputMinDigits: value.cells[11].text,
                outputMinDigits: value.cells[12].text,
                inspCriteriaComment: value.cells[13].text,
                processFlg: (value.rowId == changes[0].rowId && getCurData.processFlg !== "NEW") ? "EDIT" : getCurData.processFlg,
              });
            }
          });
        }

        Mng040State.setMng040InspCriteriaRegist(newInspCriteriaObj);

        // 登録フラグを有効にする
        Mng040State.setMng040InspCriteriaRegistFlg(true);
        break;
      default:
        break;
    }

  };

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

  /**
   * 挿入
   * ※ 選択行の上に行を追加する。
   * 
   * @param selectedRowId 
   */
  const insertNewRow = (selectedRowId) => {
    // 編集中のデータを複製
    const useEditingDataDeepCopy = (useManageProcessNo == "MNG010") ? JSON.parse(JSON.stringify(mng010State.useUserMasterRegistState)) // MNG010
      : (useManageProcessNo == "MNG010") ? JSON.parse(JSON.stringify(mng020State.useSaisuiPointRegistState)) // MNG020
        : (useManageProcessNo == "MNG030") ? JSON.parse(JSON.stringify(mng030State.useMng030InspItemRegist)) // MNG030
          : JSON.parse(JSON.stringify(Mng040State.useMng040InspCriteriaRegist)); // MNG040

    let newInsertRowObj = [];
    if (useEditingDataDeepCopy?.length > 0) {
      useEditingDataDeepCopy?.forEach((point, key) => {
        // 選択している項目の下に挿入
        if (key == (selectedRowId)) {
          // 行を新規挿入
          switch (useManageProcessNo) {
            case "MNG010":
              // 当行を設定
              newInsertRowObj.push(point);

              // 新規を挿入
              newInsertRowObj.push({
                rowNo: useEditingDataDeepCopy.length + 1,
                userNo: "",
                userId: "",
                userPassword: "",
                userName: "",
                userFurigana: "",
                affiliationDept: "",
                affiliationSectionNo: "",
                securityLevel: "1",
                fixFlg: "0",
                registDate: moment(new Date()).format("YYYY-MM-DD"),
                endDate: moment("2040-03-31").format("YYYY-MM-DD"),
                processFlg: "NEW",
              });
              break;
            case "MNG020":
              let maxPointNo = (mng020State.useMaxSaisuiPoint) ? mng020State.useMaxSaisuiPoint + 1 : 1;

              // 新規を挿入
              newInsertRowObj.push({
                rowNo: "",
                pointNo: String(maxPointNo),
                pointDspName: "",
                pointReportName: "",
                saisuiKbnNo: "",
                sisetuNo: "",
                processNo: ""
              });
              // 当行を設定
              newInsertRowObj.push(point);

              mng020State.setMaxSaisuiPoint(maxPointNo);
              break;
            case "MNG030":
              let maxItemNo = (mng030State.useMng030MaxItemNo) ? mng030State.useMng030MaxItemNo + 1 : 1;

              // 新規を挿入
              newInsertRowObj.push({
                rowNo: String(useEditingDataDeepCopy.length + 1),
                itemNo: String(maxItemNo),
                itemDspName: "",
                itemReportName: "",
                itemUnit: "",
                constantQualitativeFlg: "",
                inputType: "",
                itemDaiCategoryNo: "",
                itemTyuCategoryNo: "",
                inspectionItemComment: "",
                processFlg: "",
              });

              // 当行を設定
              newInsertRowObj.push(point);
              mng030State.setMng030MaxItemNo(maxItemNo);
              break;
            case "MNG040":
              // 新規を挿入
              newInsertRowObj.push({
                rowNo: String(useEditingDataDeepCopy.length + 1),
                itemNo: "",
                itemDspName: "",
                saisuiKbnNo: "",
                regulationLowLimit: "",
                regulationUpLimit: "",
                inputLowLimit: "",
                inputUpLimit: "",
                reportLowLimit: "",
                reportUpLimit: "",
                validDigits: "1",
                inputMinDigits: "0",
                outputMinDigits: "0",
                inspCriteriaComment: "",
                processFlg: "",
              });

              // 当行を設定
              newInsertRowObj.push(point);
              break;
            default:
              break;
          }
        } else {
          newInsertRowObj.push(point);
        }
      });
    }

    let newRowNo: number = 0;
    if (newInsertRowObj?.length > 0) {
      newInsertRowObj?.forEach(item => {
        newRowNo += 1;
        switch (useManageProcessNo) {
          case "MNG010":
            // 登録フラグを有効にする
            mng010State.setUserMasterRegistFlgState(true);
            break;
          case "MNG020":
            item.rowNo = String(newRowNo);

            // 登録フラグを有効にする
            mng020State.setSaisuiPointRegistFlgState(true);
            break;
          case "MNG030":
            item.rowNo = String(newRowNo);

            // 登録フラグを有効にする
            mng030State.setMng030InspItemRegistFlg(true);
            break;
          case "MNG040":
            item.rowNo = String(newRowNo);

            // 登録フラグを有効にする
            Mng040State.setMng040InspCriteriaRegistFlg(true);
            break;
          default:
            break;
        }

      });
    }

    // 一覧データを更新
    switch (useManageProcessNo) {
      case "MNG010":
        // MNG010_ユーザマスタ
        mng010State.setUserMasterRegistState(newInsertRowObj);

        // 登録フラグを有効にする
        mng010State.setUserMasterRegistFlgState(true);
        break;
      case "MNG020":
        // MNG020_採水地点設定
        mng020State.setSaisuiPointRegistState(newInsertRowObj);

        // 登録フラグを有効にする
        mng020State.setSaisuiPointRegistFlgState(true);
        break;
      case "MNG030":
        // MNG030_検査項目マスタ
        mng030State.setMng030InspItemRegist(newInsertRowObj);

        // 登録フラグを有効にする
        mng030State.setMng030InspItemRegistFlg(true);
        break;
      case "MNG040":
        // MNG040_検査基準マスタ
        Mng040State.setMng040InspCriteriaRegist(newInsertRowObj);

        // 登録フラグを有効にする
        Mng040State.setMng040InspCriteriaRegistFlg(true);
        break;
      default:
        break;
    }
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
    const useDataInTableDeepCopy = (useManageProcessNo == "MNG010") ? JSON.parse(JSON.stringify(mng010State.useUserMasterRegistState)) // MNG010
      : (useManageProcessNo == "MNG020") ? JSON.parse(JSON.stringify(mng020State.useSaisuiPointRegistState)) // MNG020
        : (useManageProcessNo == "MNG030") ? JSON.parse(JSON.stringify(mng030State.useMng030InspItemRegist)) // MNG030
          : JSON.parse(JSON.stringify(Mng040State.useMng040InspCriteriaRegist)); // MNG040

    // 
    if (useManageProcessNo == "MNG010") {
      // 
      const getUserData = useDataInTableDeepCopy[selectedRowId];
      if (getUserData.securityLevel == 1 && (getUserData.affiliationSectionNo == "01")) {
        const checkKanriUser = useDataInTableDeepCopy.filter(user => {
          return user.securityLevel == 1 && (user.affiliationSectionNo == "01")
        });

        if (checkKanriUser.length <= 1) {
          // 必須項目のエラーメッセージを表示
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0022W"]));
          commonState.setResultMessage(errorInfo);

          return;
        }
      }


      useDataInTableDeepCopy.splice(selectedRowId, 1);

      let newRowNo: number = 0;
      if (useDataInTableDeepCopy?.length > 0) {
        useDataInTableDeepCopy?.forEach(point => {
          newRowNo += 1;
          point.rowNo = String(newRowNo);
        });
      }
    } else {
      useDataInTableDeepCopy.splice(selectedRowId, 1);

      let newRowNo: number = 0;
      if (useDataInTableDeepCopy?.length > 0) {
        useDataInTableDeepCopy?.forEach(point => {
          newRowNo += 1;
          point.rowNo = String(newRowNo);
        });
      }
    }

    // 一覧データを更新
    switch (useManageProcessNo) {
      case "MNG010":
        // MNG010_ユーザマスタ
        mng010State.setUserMasterRegistState(useDataInTableDeepCopy);

        // 登録フラグを有効にする
        mng010State.setUserMasterRegistFlgState(true);
        break;
      case "MNG020":
        // MNG020_採水地点設定
        mng020State.setSaisuiPointRegistState(useDataInTableDeepCopy);

        // 登録フラグを有効にする
        mng020State.setSaisuiPointRegistFlgState(true);
        break;
      case "MNG030":
        // MNG030_検査項目マスタ
        mng030State.setMng030InspItemRegist(useDataInTableDeepCopy);

        // 登録フラグを有効にする
        mng030State.setMng030InspItemRegistFlg(true);
        break;
      case "MNG040":
        // MNG040_検査基準マスタ
        Mng040State.setMng040InspCriteriaRegist(useDataInTableDeepCopy);

        // 登録フラグを有効にする
        Mng040State.setMng040InspCriteriaRegistFlg(true);
        break;
      default:
        break;
    }
    setDataInTable(getRows(useDataInTableDeepCopy));
  };

  /**
   * 項目設定処理
   * 
   */
  const settingSelectedChangedItem = async () => {
    // データ更新
    let newListDataDeepCopy: any = JSON.parse(JSON.stringify(Mng040State.useMng040InspCriteriaRegist));
    newListDataDeepCopy = newListDataDeepCopy.map((item, key) => {
      if (key === InspectionItemSettingState.useInspectionItemManageState.selectedItemKey && InspectionItemSettingState.useInspectionItemManageState.changedItemNo && InspectionItemSettingState.useInspectionItemManageState.changedItemName) {
        // コラム名を指定
        return {
          ...item,
          itemNo: String(InspectionItemSettingState.useInspectionItemManageState.changedItemNo),
          itemDspName: InspectionItemSettingState.useInspectionItemManageState.changedItemName,
        };
      } else {
        return item;
      }
    });

    Mng040State.setMng040InspCriteriaRegist(newListDataDeepCopy);
    setDataInTable(getRows(newListDataDeepCopy));
  };

  useQuery({
    queryKey: ["settingSelectedChangedItem", InspectionItemSettingState.useInspectionItemManageState],
    queryFn: () => {
      settingSelectedChangedItem();

      return true;
    },
  });

  /** 日本語でのラベルを調整 */
  const customLabels = {
    copyLabel: "コピー",
    cutLabel: "切り取り",
    pasteLabel: "貼り付け",
  };

  /**
   * 位置確認、上・下移動操作可を設定
   *
   * @param rowId
   */
  const handlerCheckPosition = (rowId: any, columnId: any) => {
    const selectedRowData = mng030State.useMng030InspItemRegist[rowId];
    const domContextMenuDiv = document.querySelector("#grid-simple-context-table .rg-context-menu");
    const domContextMenu = document.querySelectorAll("#grid-simple-context-table .rg-context-menu-option");

    // 初期化_クリア
    domContextMenuDiv.classList.remove("hide-context-menu");        // コンテキストメニュー非表示をクリア
    if (domContextMenu?.length > 0) {
      domContextMenu?.forEach(ele => {
        ele.classList.remove("disabled");                             // 各メニューの非活性をクリア
      });
    }

    // 選択しているメニューがあれば、処理実施
    if (selectedRowData) {
      switch (useManageProcessNo) {
        case "MNG010":
          if (selectedRowData.userId == localStorage.getItem("userId")) {
            // ログインユーザの場合、削除ができないように設定
            domContextMenu[3].classList.add("disabled");                  // メニューの非活性を設定
          }

          break;
        case "MNG030":
          // 採水年月日と採水時刻を確認
          if (selectedRowData.itemNo == '1' || selectedRowData.itemNo == '2') {
            domContextMenuDiv.classList.add("hide-context-menu")          // コンテキストメニュー非表示を設定
          }

          // 項目名称の列削除不可
          if (String(selectedRowData.inputType) !== "2") {
            domContextMenu[4].classList.add("disabled");                  // メニューの非活性を設定
          }
          break;
        default:
          break;
      }

    }
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
    // 項目によって、右クリック操作活性を設定
    if (selectedRanges.length > 0) {
      handlerCheckPosition(selectedRanges[0][0].rowId, selectedRanges[0][0].columnId);
    }

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
          confirmDialog.setDialog((prev) => ({
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

    // MNG030_検査項目設定のメニュー
    if (useManageProcessNo == "MNG030") {
      menuOptions = [
        ...menuOptions,
        {
          id: "setting-select-option",
          label: "選択肢の設定",
          handler: () => {
            const selectedRowId = selectedRanges[0][0].rowId;
            selectOptionState.setSelectOptionItemNo(mng030State.useMng030InspItemRegist[selectedRowId].itemNo);      // 対象の選択肢項目
            selectOptionState.setMng030SearchAndSort({
              ...selectOptionState.useMng030SearchAndSort,
              itemNo: mng030State.useMng030InspItemRegist[selectedRowId].itemNo,
              itemDspName: mng030State.useMng030InspItemRegist[selectedRowId].itemDspName
            });
            selectOptionState.setSelectOptionSettingModalToggleFlg(true);                               // 子画面を開く
          },
        },
      ];
    } else if (useManageProcessNo == "MNG040") {
      menuOptions = [
        ...menuOptions,
        {
          id: "setting-insp-item",
          label: "検査項目設定",
          handler: () => {
            const selectedRowId = selectedRanges[0][0].rowId;
            const getTargetData = Mng040State.useMng040InspCriteriaRegist[selectedRowId];

            // 子画面用にデータを設定
            InspectionItemSettingState.setInspectionItemManageState({
              ...InspectionItemSettingState.useInspectionItemManageState,
              selectedItemKey: Number(selectedRowId),
              selectedItemNo: getTargetData.itemNo,
              selectedItemName: getTargetData.itemDspName
            });
            InspectionItemSettingState.setInspectionItemModalFlgState(true);
          },
        },
      ];
    }

    return menuOptions;
  };

  const setSortHeader = (ctn) => {
    // MNG010, MNG020, MNG030, MNG040を判定_項目確認
    switch (useManageProcessNo) {
      case "MNG010":
        // MNG010_ユーザマスタ
        let searchCondValueMng010: AtomMng010.searchAndSortInterface = mng010State.useMng010SearchAndSortState;
        if (mng010State.useMng010SearchAndSortState.sortColumn && (Const.MNG010_HEADER_ITEM[ctn.textContent] !== mng010State.useMng010SearchAndSortState.sortColumn)) {
          searchCondValueMng010 = {
            ...searchCondValueMng010,
            sortColumn: Const.MNG010_HEADER_ITEM[ctn.textContent],
            sortOrder: "DESC",
          };
        } else {
          searchCondValueMng010 = {
            ...searchCondValueMng010,
            sortColumn: Const.MNG010_HEADER_ITEM[ctn.textContent],
            sortOrder: (mng010State.useMng010SearchAndSortState.sortOrder == "ASC") ? "DESC" : "ASC",
          };
        }

        mng010State.setMng010SearchAndSortState(searchCondValueMng010);

        // 一定時間を設定
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["searchUserDataMng010"] });
        }, 100);

        break;
      case "MNG020":
        // MNG020_採水地点設定
        let searchCondValueMng020: AtomMng020.saisuiPointInterface = mng020State.useSaisuiPointState;
        if (mng020State.useSaisuiPointState.sortColumn && (Const.MNG020_HEADER_ITEM[ctn.textContent] !== mng020State.useSaisuiPointState.sortColumn)) {
          searchCondValueMng020 = {
            ...searchCondValueMng020,
            sortColumn: Const.MNG020_HEADER_ITEM[ctn.textContent],
            sortOrder: "DESC",
          };
        } else {
          searchCondValueMng020 = {
            ...searchCondValueMng020,
            sortColumn: Const.MNG020_HEADER_ITEM[ctn.textContent],
            sortOrder: (mng020State.useSaisuiPointState.sortOrder == "ASC") ? "DESC" : "ASC",
          };
        }

        mng020State.setSaisuiPointState(searchCondValueMng020);

        // 一定時間を設定
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["searchSaisuiPointData"] });
        }, 100);

        break;
      case "MNG030":
        // MNG030_検索項目マスタ
        let searchCondValueMng030: AtomMng030.searchAndSortInterface = mng030State.useMng030SearchAndSortState;
        if (mng030State.useMng030SearchAndSortState.sortColumn && (Const.MNG030_HEADER_ITEM[ctn.textContent] !== mng030State.useMng030SearchAndSortState.sortColumn)) {
          searchCondValueMng030 = {
            ...searchCondValueMng030,
            sortColumn: Const.MNG030_HEADER_ITEM[ctn.textContent],
            sortOrder: "DESC",
          };
        } else {
          searchCondValueMng030 = {
            ...searchCondValueMng030,
            sortColumn: Const.MNG030_HEADER_ITEM[ctn.textContent],
            sortOrder: (mng030State.useMng030SearchAndSortState.sortOrder == "ASC") ? "DESC" : "ASC",
          };
        }

        mng030State.setMng030SearchAndSortState(searchCondValueMng030);

        // 一定時間を設定
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["searchInspItemMng030"] });
        }, 100);

        break;
      case "MNG040":
        // MNG010_ユーザマスタ
        let searchCondValueMng040: AtomMng040.searchAndSortInterface = Mng040State.useMng040SearchAndSort;
        if (Mng040State.useMng040SearchAndSort.sortColumn && (Const.MNG040_HEADER_ITEM[ctn.textContent] !== Mng040State.useMng040SearchAndSort.sortColumn)) {
          searchCondValueMng040 = {
            ...searchCondValueMng040,
            sortColumn: Const.MNG040_HEADER_ITEM[ctn.textContent],
            sortOrder: "DESC",
          };
        } else {
          searchCondValueMng040 = {
            ...searchCondValueMng040,
            sortColumn: Const.MNG040_HEADER_ITEM[ctn.textContent],
            sortOrder: (Mng040State.useMng040SearchAndSort.sortOrder == "ASC") ? "DESC" : "ASC",
          };
        }

        Mng040State.setMng040SearchAndSort(searchCondValueMng040);

        // 一定時間を設定
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["searchInspCriteriaData"] });
        }, 100);
        break;
      default:
        break;
    }
  };

  // チェックボックス項目がある時_ヘッダーにチェックボックスを設定
  React.useEffect(() => {
    requestAnimationFrame(() => {
      // ヘッダーコンテナー
      // const container = document.getElementsByClassName(
      //   "rg-cell rg-header-cell "
      // );

      const container = document.querySelectorAll(
        "#grid-simple-context-table .rg-cell.rg-header-cell"
      );

      // 画面判定
      let columnCheckState = mng010State.useMng010SearchAndSortState;
      let headerArray = Object.entries(Const.MNG010_HEADER_ITEM).map(([label, key]) => ({ label, key }));
      switch (useManageProcessNo) {
        case "MNG010":
          columnCheckState = mng010State.useMng010SearchAndSortState;
          headerArray = Object.entries(Const.MNG010_HEADER_ITEM).map(([label, key]) => ({ label, key }));
          break;
        case "MNG020":
          columnCheckState = mng020State.useSaisuiPointState;
          headerArray = Object.entries(Const.MNG020_HEADER_ITEM).map(([label, key]) => ({ label, key }));
          break;
        case "MNG030":
          columnCheckState = mng030State.useMng030SearchAndSortState;
          headerArray = Object.entries(Const.MNG030_HEADER_ITEM).map(([label, key]) => ({ label, key }));
          break;
        case "MNG040":
          columnCheckState = Mng040State.useMng040SearchAndSort;
          headerArray = Object.entries(Const.MNG040_HEADER_ITEM).map(([label, key]) => ({ label, key }));
          break;
        default:
          break;
      }


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

          // TODO ここにctnを判定して、sort_thを設定する
          if (useManageProcessNo == "MNG010" && key == 2) {
            ctn.classList.remove("sort_th");
          } else {
            ctn.addEventListener("click", function (e) {
              setSortHeader(ctn);
            });
          }

        });
      }
    });
  }, [useDataInTable]);

  // 入力前に戻る
  useQuery({
    queryKey: ["backToInitSetting"],
    queryFn: async () => {
      switch (useManageProcessNo) {
        case "MNG010":
          // データ内容_GridTable形
          setDataInTable(getRows(dataGrid.rowData));

          // 登録フラグを有効にする
          mng010State.setUserMasterRegistFlgState(false);
          break;
        case "MNG020":
          // データ内容_GridTable形
          setDataInTable(getRows(mng020State.useSaisuiPointListState));

          // 登録フラグを有効にする
          commonState.setMessageMutiLine([]);
          mng020State.setSaisuiPointRegistFlgState(false);
          break;
        case "MNG030":
          // データ内容_GridTable形
          setDataInTable(getRows(dataGrid.rowData));

          // 登録フラグを有効にする
          commonState.setMessageMutiLine([]);
          mng030State.setMng030InspItemRegistFlg(false);
          break;
        case "MNG040":
          // データ内容_GridTable形
          setDataInTable(getRows(dataGrid.rowData));

          // 登録フラグを有効にする
          commonState.setMessageMutiLine([]);
          Mng040State.setMng040InspCriteriaRegistFlg(false);
          break;
        default:
          break;
      }

      return true;
    },
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

  // 一覧表サイズを調整
  const [useGridTableSize, setGridTableSize] = React.useState<any>("300px");
  useQuery({
    queryKey: ["gridSimpleTabelSize", useDataInTable],
    queryFn: () => {
      // ヘッダーコンテナー
      const containerArea = window.innerHeight;
      const messageArea = (commonState.useResultMessage.length > 0) ? 48 : 0;                 // メッセージエリア
      const footerArea = 90;
      const paddingMargin = 35;

      let mngTitleArea = 0;
      let mngSearchArea = 0;
      switch (useManageProcessNo) {
        case "MNG010":
          mngTitleArea = document.querySelector("#mng010-user-data-title").clientHeight;
          break;
        case "MNG020":
          mngTitleArea = document.querySelector("#mng020-saisui-point-title").clientHeight;
          mngSearchArea = document.querySelector("#saisui-point-search").clientHeight + 10;
          break;
        case "MNG030":
          mngTitleArea = document.querySelector("#mng030-inspection-item-title").clientHeight;
          mngSearchArea = document.querySelector("#inspection-item-search").clientHeight + 10;
          break;
        case "MNG040":
          mngTitleArea = document.querySelector("#mng040-inspection-criteria-title").clientHeight;
          mngSearchArea = document.querySelector("#inspection-criteria-search").clientHeight + 10;
          break;
        default:
          break;
      }

      const calRemainingArea: number = containerArea - (mngTitleArea + mngSearchArea + footerArea + paddingMargin + messageArea);
      setGridTableSize(String(calRemainingArea) + "px");

      return true;
    }
  });

  // 画面サイズが変わった時、表示件数を調整
  function reportWindowSize() {
    queryClient.invalidateQueries({ queryKey: ["gridSimpleTabelSize"] });
  }

  return (
    <>
      {isFetching ? (
        <div
          style={{
            width: 150,
            justifySelf: "center",
            marginTop: (dataGrid.mngNo == "MNG020" || dataGrid.mngNo == "MNG040" || dataGrid.mngNo == "MNG030") ? "20dvh" : "35dvh",
          }}
        >
          <Loading />
        </div>
      ) : (
        <>
          <div
            id="grid-simple-context-table"
            style={{
              height: useGridTableSize
            }}
            className={(dataGrid.mngNo == "MNG020" || dataGrid.mngNo == "MNG040" || dataGrid.mngNo == "MNG030") ? cssGridTable.grid_simple_context_table_panel :
              (commonState.useResultMessage.length > 0) ? cssGridTable.grid_simple_context_table_panel_no_search_msg
                : cssGridTable.grid_simple_context_table_panel_no_search}
          >
            <ReactGrid
              rows={useDataInTable}
              columns={columnSetting}
              labels={customLabels}
              onCellsChanged={handleChanges}
              onColumnResized={handleColumnResize}
              onContextMenu={handlerContextMenu}
              // stickyLeftColumns={1}
              stickyTopRows={1}
              // enableRangeSelection
              customCellTemplates={{
                select: new SelectCellTemplate(),
              }}
            />
          </div>
        </>
      )}

      {(selectOptionState.useSelectOptionSettingModalToggleFlg) && <SelectOptionSettingModal />}
    </>
  );
};
