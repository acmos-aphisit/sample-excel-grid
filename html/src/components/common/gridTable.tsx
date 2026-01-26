//【汎用】
import React, { useState, useReducer } from "react";
import { Api, getMessage } from "../../common/api";
import { useAtom, useSetAtom } from "jotai";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Const from "../../common/const";
import * as Common from "../../common/common";

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

// ステート管理【アトム】汎用
import * as AtomCommon from "../../stores/atom";

// ステート管理【コンテナー】
import { CommonStateContainer } from "../../components/containers/commonStateContainer"; // 汎用
import { GridTableStateContainer } from "../../components/containers/gridTableStateContainer"; // 入力（登録）
import { SideMenuStateContainer } from "../../components/containers/sideMenuStateContainer"; // サイドメニュー
import { MenuCalendarStateContainer } from "../../components/containers/menuCalendarContainer"; // カレンダー

//【コンポネント】セレクトボックスセル
import {
  SelectCell,
  SelectCellTemplate,
} from "./grid-table-custom-cells/select.cell.tsx";
import {
  TimeCell,
  TimeCellTemplate,
} from "./grid-table-custom-cells/time.cell.tsx";
//【コンポネント】セレクトボックスセル
import {
  ComboBoxCell,
  ComboBoxCellTemplate,
} from "./grid-table-custom-cells/comboBoxSearch.cell.tsx";
// 【コンポネント】ＨＴＭＬのテキストをプレーンテキストに変換
import {
  HtmlToTextCell,
  HtmlToTextCellTemplate,
} from "./grid-table-custom-cells/htmlToText.cell.tsx";

import { TextAreaCellTemplate } from "./grid-table-custom-cells/textArea.cell.tsx";
import { DateEditorTemplate } from "./grid-table-custom-cells/dateEditor.cell.tsx";
import { readDataTransferFromClipboard } from "@testing-library/user-event/dist/cjs/utils/index.js";

//【コンポネント】異常値一覧のモダール
import { OutlierListModal } from "../modals/index.ts";
import { input } from "@testing-library/user-event/dist/cjs/event/input.js";
import { time } from "node:console";

// 属性
interface Props {
  dataGrid?: any;
}

// コンポーネントエクスポート
export var GridTable: React.FC<Props> = function ({ dataGrid }) {
  /**
   * 1.ステートコンテナーからステートを呼び出す
   *
   */
  const commonState = CommonStateContainer(); // 汎用
  const sideMenuState = SideMenuStateContainer(); // サイドメニュー
  const menuCalendarState = MenuCalendarStateContainer(); // サイドメニューのカレンダー
  const gridTableState = GridTableStateContainer(); // グリッドテーブル

  // 入力フラグ
  const [useInputingFlg, setInputingFlg] = React.useState<boolean>(false);

  const [focusInfo, setFocusInfo] = React.useState<any>();
  const [useCurFocusInfo, setCurFocusInfo] = React.useState<any>();
  const [useMaxColumnRow, setMaxColumnRow] = React.useState<{
    maxRow: number;
    maxColumn: number;
  }>({ maxRow: 0, maxColumn: 0 });

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
   * ３.ヘッダー情報インタフェース設定
   * ※ 編集データ設定（ヘッダー表示）
   *
   * */
  interface HeaderInfo {
    type: String;
    text: String;
  }
  const [headerInfo, setHeaderInfo] = React.useState<HeaderInfo[]>([]); //　セル種、セルテキスト設定（例：type: "header", text: "利根川取水口"）
  /**
   * ４.初期表示_初期データを設定
   *
   * */
  const setItemPoint = () => {
    if (dataGrid.length !== 0) {
      // データクリア
      gridTableState.setEditingData([]); // 編集中のデータ
      gridTableState.setColumnData([]); // 地点ヘッダーデータ
      setColumnSetting([]); // カラム設定（横ヘッダー）
      setHeaderInfo([]); //
      commonState.setInputEditingFlg(false); // 編集状態リセット
      gridTableState.setCriCorrectData([]);

      /** カラム作成（縦） */
      let newColumn: {
        dataNo: Number;
        dataId: String;
        dataName: String;
        dataKey: Number;
        dataPointNo: Number;
        dataProcessNo: Number;
      }[] = [];
      gridTableState.setDataNumbersState(dataGrid.pointData.length);
      gridTableState.setCriCorrectData(dataGrid.criteriaCorrection);

      /**　データ指定（横）  */
      const fetchData = async () => {
        try {
          // (1)
          /**
           * タイトル（列）を生成
           *
           */
          for (let index = 0; index < dataGrid.pointData.length; index++) {
            newColumn.push({
              dataNo: index + 1,
              dataId: "dataNo" + (index + 1),
              dataName: dataGrid.pointData[index].pointData,
              dataKey: index,
              dataPointNo: dataGrid.pointData[index].pointNo,
              dataProcessNo: dataGrid.pointData[index].processNo,
            });
          }
          gridTableState.setColumnData(newColumn); // 地点ヘッダーデータを設定

          // (2)
          // 保持データを取得
          // let getTempData: any = null;
          // useTempSaveData.forEach((item, key) => {
          //     if (item.inputMenuNo == dataSideMenuSelected.selectedMenuNo && item.inputSelectDate == useSidemenuSelectedDate) {
          //         getTempData = item;
          //     }
          // });

          // (3)
          /** 一覧表の情報（body） */

          // 異常値のリストに格納する
          let newOutlinerObj: any = [];

          //
          let setDataGridItemData: any = [];
          commonState.setOutlinerModalShowBtn(false); //

          // データ編集履歴がない場合
          // 項目（行）ループ
          dataGrid.itemData.forEach((item: any, itemKey: number) => {
            // 入力データ指定用の配列を新規
            item.data = [];

            // 地点（列）ループ
            newColumn.forEach((point: any, pointKey: number) => {
              const findInputData: any = dataGrid.inputData.find(
                (input) =>
                  item.itemNo == input.item_no &&
                  point.dataPointNo == input.point_no
              );

              // 基準値マスタを指定
              let findInspectCriteria: any = [];
              findInspectCriteria = dataGrid.inspectCriteria.find(
                (insp) =>
                  item.itemNo == insp.item_no &&
                  point.dataPointNo == insp.point_no
              );

              // 採水区分補正マスタがあれば、値を指定
              // ※ 2025/12/08 追加
              const findInspectCriteriaByKbnCor: any =
                dataGrid.inspectCriteriaDataKbnCorrection.find(
                  (insp) =>
                    item.itemNo == insp.item_no &&
                    point.dataPointNo == insp.point_no &&
                    sideMenuState.useSideMenuSelected.selectedDspNo ==
                    insp.input_dsp_no
                );
              if (findInspectCriteriaByKbnCor) {
                findInspectCriteria = findInspectCriteriaByKbnCor;
              }

              let handleDataFlg: any = findInputData ? true : false;
              let inputData: any = findInputData
                ? item.constantQualitativeFlg == 1
                  ? findInputData.constant_data
                  : findInputData.qualitative_data
                : "";

              // 検査区分CDを設定
              const checkInspKbnCd = findInspectCriteria
                ? findInspectCriteria.inspection_kbn_code
                : findInputData
                  ? findInputData.inspection_kbn_code
                  : sideMenuState.useSideMenuSelected.inspectionKbnCode;

              const checkCUpper = findInspectCriteria
                ? findInspectCriteria.c_upper
                : findInputData
                  ? findInputData.c_upper
                  : "";

              const checkCLower = findInspectCriteria
                ? findInspectCriteria.c_lower
                : findInputData
                  ? findInputData.c_lower
                  : "";

              // 統計値置換処理
              const setCUpper = Const.STAT_SUB_KBN.includes(
                Number(checkInspKbnCd)
              )
                ? 999999
                : checkCUpper;
              const setCLower = Const.STAT_SUB_KBN.includes(
                Number(checkInspKbnCd)
              )
                ? -99.99
                : checkCLower;

              let checkAbnormalFlg: number = 0;
              if (
                findInputData &&
                findInspectCriteria &&
                item.constantQualitativeFlg == 1 &&
                inputData
              ) {
                const setSaisuiKbnName = findInspectCriteria.saisui_kbn_name
                  ? findInspectCriteria.criteria_saisui_kbn_name
                  : findInputData.saisui_kbn_name;

                checkAbnormalFlg = CellCalculate.checkCellDataOver(
                  Number(inputData),
                  item.itemNo,
                  findInspectCriteria.inspection_kbn_code,
                  findInputData.input_low_limit,
                  findInputData.regulation_up_limit,
                  setCUpper,
                  setCLower,
                  setSaisuiKbnName
                );

                // 異常値のリストに格納する
                if (checkAbnormalFlg !== 0) {
                  newOutlinerObj.push({
                    abnormalType: (checkAbnormalFlg == 1) ? "下限値" : "統計量",
                    pointName: point.dataName,
                    itemName: item.name,
                    data: inputData ?? "",
                    inputUnit: findInspectCriteria.item_unit
                      ? findInspectCriteria.item_unit
                      : findInputData.item_unit,
                    saisuiKbnName: findInspectCriteria.saisui_kbn_name
                      ? findInspectCriteria.criteria_saisui_kbn_name
                      : findInputData.saisui_kbn_name,
                    regulationUpLimit: findInspectCriteria.regulation_up_limit
                      ? findInspectCriteria.regulation_up_limit
                      : findInputData.regulation_up_limit,
                    inputLowLimit: findInspectCriteria.input_low_limit
                      ? findInspectCriteria.input_low_limit
                      : findInputData.input_low_limit,
                    reportLowLimit: findInspectCriteria.report_low_limit
                      ? findInspectCriteria.report_low_limit
                      : findInputData.report_low_limit,
                    calUpLow:
                      setCUpper && setCLower
                        ? setCLower + " ～ " + setCUpper
                        : "",
                  });
                }

                // JIS丸めに変換
                const findCriCorrJis =
                  item.itemNo == 2490
                    ? dataGrid.criteriaCorrection.find(
                      (cri) =>
                        cri.input_dsp_no ==
                        sideMenuState.useSideMenuSelected.selectedDspNo &&
                        cri.item_no == item.itemNo &&
                        cri.point_no == point.dataPointNo
                    )
                    : dataGrid.criteriaCorrection.find(
                      (cri) => cri.item_no == item.itemNo
                    );

                let setInputMinDigits = findInspectCriteria
                  ? Math.abs(findInspectCriteria.input_min_digits)
                  : 1;

                // 2490:濁度、2497:計器濁度、1060:取水口水位、1424:上水後塩素注入率
                if (findCriCorrJis) {
                  // 2490:濁度
                  if (
                    findCriCorrJis.item_no == 2490 &&
                    Number(checkInspKbnCd) == 200
                  ) {
                    setInputMinDigits = findCriCorrJis.input_min_digits * -1;
                  }

                  // 2497:計器濁度
                  if (
                    findCriCorrJis.item_no == 2497 &&
                    point.dataPointNo == 243
                  ) {
                    setInputMinDigits = findCriCorrJis.input_min_digits * -1;
                  }

                  // 1060:取水口水位
                  if (
                    findCriCorrJis.item_no == 1060 &&
                    point.dataPointNo == 1008
                  ) {
                    setInputMinDigits = findCriCorrJis.input_min_digits * -1;
                  }

                  // 1424:上水後塩素注入率のみ
                  if (findCriCorrJis.item_no == 1424 && inputData < 0.1) {
                    setInputMinDigits = findCriCorrJis.input_min_digits * -1;
                  }
                }

                // DBに存在データがある場合
                if (setInputMinDigits != null && setInputMinDigits !== 0) {
                  if (Number(inputData) == 0) {
                    // 小数の場合
                    inputData = inputData
                      ? String(
                        Number(inputData).toFixed(Math.abs(setInputMinDigits))
                      )
                      : inputData;
                  } else {
                    const setValidDigitsToCal = findInspectCriteria
                      ? Math.abs(findInspectCriteria.valid_digits)
                      : 1;
                    inputData = inputData
                      ? CellCalculate.jisRoundedInitShow(
                        inputData,
                        setValidDigitsToCal,
                        setInputMinDigits
                      )
                      : inputData;
                  }
                } else {
                  // 整数の場合
                  inputData = inputData
                    ? String(parseInt(inputData))
                    : inputData;
                }
              }

              // 採水年月日
              if (item.itemNo == 1) {
                inputData = inputData
                  ? inputData
                  : new Date(menuCalendarState.useSidemenuSelectedDate);
              }

              // 毎日検査の採水時刻設定
              if (
                (sideMenuState.useSideMenuSelected.selectedMenuName.includes(
                  "毎日検査"
                ) ||
                  sideMenuState.useSideMenuSelected.selectedMenuName.includes(
                    "共同検査"
                  )) &&
                item.itemNo == 2
              ) {
                inputData = inputData ? inputData : "09:00:00";
              }

              let newObj = `data`;
              let newIsOpenObj = `dataIsOpen`;
              let newOrderObj = `dataOrder`;
              item.data[pointKey] = {};
              item.data[pointKey][newIsOpenObj] = false;
              item.data[pointKey][newOrderObj] = pointKey;

              // 無活性
              let newDisableObj = `dataDisable`;
              item.data[pointKey][newDisableObj] = false;

              // マスクデータ
              let newMaskObj = `dataMask`;
              item.data[pointKey][newMaskObj] = "";

              // 編集状態フラグ
              item.data[pointKey][`pointNo`] = point.dataPointNo;
              item.data[pointKey][`pointName`] = point.dataName;
              item.data[pointKey][`handleData`] = handleDataFlg; // DB格納値有無フラグ
              item.data[pointKey][`handleEditData`] = false; // DB格納値から入力値が変更されたフラグ
              item.data[pointKey][`abnormalData`] = checkAbnormalFlg; // 異常値有無フラグ
              item.data[pointKey][`constantQualitativeFlg`] =
                item.constantQualitativeFlg; // 異常値有無フラグ
              item.data[pointKey][`inspectionKbnCode`] = findInputData
                ? findInputData.inspection_kbn_code
                : findInspectCriteria
                  ? findInspectCriteria.inspection_kbn_code
                  : sideMenuState.useSideMenuSelected.inspectionKbnCode; // 検査区分CD
              item.data[pointKey][`proccessNo`] = point.dataProcessNo; // 処理過程番号

              //   item.data[pointKey][`validDigits`] = findInputData
              //     ? Math.abs(findInputData.valid_digits)
              //     : 1;
              //   item.data[pointKey][`inputMinDigits`] = findInputData
              //     ? Math.abs(findInputData.input_min_digits)
              //     : 1;
              //   item.data[pointKey][`outputMinDigits`] = findInputData
              //     ? Math.abs(findInputData.output_min_digits)
              //     : 1;
              item.data[pointKey][`validDigits`] = findInspectCriteria
                ? Math.abs(findInspectCriteria.valid_digits)
                : 1;
              item.data[pointKey][`inputMinDigits`] = findInspectCriteria
                ? Math.abs(findInspectCriteria.input_min_digits)
                : 1;
              item.data[pointKey][`outputMinDigits`] = findInspectCriteria
                ? Math.abs(findInspectCriteria.output_min_digits)
                : 1;

              // マスクデータ
              const findInputMask: any = dataGrid.inputMask.find(
                (mask) =>
                  item.itemNo == mask.item_no &&
                  point.dataPointNo == mask.point_no
              );
              if (findInputMask) {
                item.data[pointKey][newDisableObj] = true;
                item.data[pointKey][newMaskObj] = inputData
                  ? inputData
                  : "*****";
              }

              switch (item.type) {
                case "text":
                  // テキスト
                  item.data[pointKey][newObj] = inputData ?? "";
                  item.data[pointKey][`saisuiKbnName`] = findInspectCriteria
                    ? findInspectCriteria.criteria_saisui_kbn_name
                    : findInputData
                      ? findInputData.saisui_kbn_name
                      : "";
                  item.data[pointKey][`inputUnit`] = findInspectCriteria
                    ? findInspectCriteria.item_unit
                    : findInputData
                      ? findInputData.item_unit
                      : "";
                  item.data[pointKey][`itemDaiCategoryNo`] = findInspectCriteria
                    ? findInspectCriteria.item_dai_category_no
                    : findInputData
                      ? findInputData.item_dai_category_no
                      : "";
                  item.data[pointKey][`itemTyuCategoryNo`] = findInspectCriteria
                    ? findInspectCriteria.item_tyu_category_no
                    : findInputData
                      ? findInputData.item_tyu_category_no
                      : "";
                  item.data[pointKey][`regulationUpLimit`] = findInspectCriteria
                    ? findInspectCriteria.regulation_up_limit
                    : findInputData
                      ? findInputData.regulation_up_limit
                      : "";
                  item.data[pointKey][`inputLowLimit`] = findInspectCriteria
                    ? findInspectCriteria.input_low_limit
                    : findInputData
                      ? findInputData.input_low_limit
                      : "";
                  item.data[pointKey][`reportLowLimit`] = findInspectCriteria
                    ? findInspectCriteria.report_low_limit
                    : findInputData
                      ? findInputData.report_low_limit
                      : "";
                  item.data[pointKey][`calUp`] = setCUpper;
                  item.data[pointKey][`calLow`] = setCLower;
                  item.data[pointKey][`calUpLow`] =
                    setCLower + "～" + setCUpper;
                  item.data[pointKey][`prevInputData`] = inputData;

                  break;
                case "inputTime":
                  // 日付入力
                  item.data[pointKey][newObj] = inputData ?? "";
                  item.data[pointKey][`prevInputData`] = inputData;
                  break;
                case "select":
                  // セレクトボックス
                  item.data[pointKey][newObj] = inputData;
                  break;
                case "date":
                  // 日付
                  item.data[pointKey][newObj] = inputData
                    ? new Date(inputData)
                    : null;
                  break;
                case "dateEditor":
                  // 日付
                  item.data[pointKey][newObj] = inputData
                    ? new Date(inputData)
                    : null;
                  break;
                case "time":
                  // 時刻
                  item.data[pointKey][newObj] = inputData
                    ? new Date("2025-01-01 " + inputData)
                    : null;
                  break;
                // case "timeEditor":
                //   // 時刻
                //   item.data[pointKey][newObj] = inputData
                //     ? new Date("2025-01-01 " + inputData)
                //     : null;
                //   break;
                // case "inputTime":
                //   // 時刻
                //   item.data[pointKey][newObj] = inputData
                //     ? new Date("2025-01-01 " + inputData)
                //     : null;
                //   break;
                case "textArea":
                  item.data[pointKey][newObj] = inputData;
                  break;
                default:
                  break;
              }
            });
          });

          // 加工データ設定
          setDataGridItemData = dataGrid.itemData;

          // 最大数
          setMaxColumnRow({
            ...useMaxColumnRow,
            maxRow: setDataGridItemData.length,
            maxColumn: newColumn.length,
          });

          // 異常値のリストに格納する
          if (newOutlinerObj.length > 0) {
            commonState.setOutlinerModalDataLists(newOutlinerObj);
            commonState.setOutlinerModalShowBtn(true);
          }

          // 編集中のデータ
          gridTableState.setEditingData(setDataGridItemData);

          // (4)
          /** 項目（行）、地点（列）、入力データを設定 */
          let setHeaderObj: HeaderInfo[] = [{ type: "header", text: "" }];
          let setColumnSize: any = [
            columnSetting.length > 0 ? columnSetting[0].width : 300,
          ];

          /**
           * ################################################################################################################################
           * キャッシュAPI処理_取得
           * ################################################################################################################################
           */
          let columnSizeCachApiArr = [];

          // キャッシュAPIを開始
          const openCache = await caches.open("app-data-storage");

          // レスポンスを取得
          const cachedResponse = await openCache.match(
            `/column-size/${sideMenuState.useSideMenuSelected.selectedDspNo}`
          );

          // レスポンスを確認
          if (cachedResponse) {
            // レスポンスをJSONオブジェクト（配列）に変換
            columnSizeCachApiArr = await cachedResponse.json();
          }
          // ################################################################################################################################

          // ヘッダー_項目幅サイズ設定
          const setItemColumnSize =
            columnSizeCachApiArr.length > 0
              ? columnSizeCachApiArr[0]
              : columnSetting.length > 0
                ? columnSetting[0].width
                : 300;
          let setColumnObj: ColumnSetting[] = [
            {
              columnId: "name",
              columnType: "text",
              width: setItemColumnSize,
              reorderable: false,
              resizable: true,
            },
          ];

          const columnFixedFlg: boolean = false; // ※ true : 幅固定、false : 幅タイトル計算
          newColumn.forEach((columnItem: any, index: number) => {
            const setColumnSizeByTitle: number =
              Math.round(Number(columnItem.dataName.length) * 13.3333) + 10;

            setColumnObj.push({
              columnId: columnItem.dataKey,
              columnType: "text",
              width:
                columnSizeCachApiArr.length > 0
                  ? Number(columnSizeCachApiArr[index + 1])
                  : columnFixedFlg
                    ? 200
                    : setColumnSizeByTitle,
              reorderable: true,
              resizable: true,
            });
            setColumnSize.push(columnFixedFlg ? 200 : setColumnSizeByTitle);
            setHeaderObj.push({ type: "header", text: columnItem.dataName });
          });

          /**
           * ################################################################################################################################
           * キャッシュAPI処理_指定
           * ################################################################################################################################
           */
          if (columnSizeCachApiArr.length <= 0) {
            // 配列をJSON stringに変換
            const jsonString = JSON.stringify(setColumnSize);

            // StringからレスポンスOBJを作成
            const response = new Response(jsonString, {
              headers: { "Content-Type": "application/json" },
            });

            // キャッシュキー
            const cacheKey = `/column-size/${sideMenuState.useSideMenuSelected.selectedDspNo}`;

            // キャッシュAPIを開始 と 幅の配列を指定
            const cache = await caches.open("app-data-storage");
            await cache.put(cacheKey, response);
          }
          // ################################################################################################################################

          setColumnSetting(setColumnObj);
          setHeaderInfo(setHeaderObj);

          setRows(
            setInputDataToGridTable(
              setDataGridItemData,
              setHeaderObj,
              setColumnObj
            )
          );
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();

      return true;
    }
  };

  // 地点、項目、入力データの更新
  useQuery({
    queryKey: ["dataGrid", dataGrid],
    queryFn: setItemPoint,
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });
  /** カラムが変わる時 */
  const setDataColumnRow = () => {
    // データクリア
    setColumnSetting([]);
    setHeaderInfo([]);

    let setColumnObj: ColumnSetting[] = [
      {
        columnId: "name",
        columnType: "text",
        width: columnSetting.length > 0 ? columnSetting[0].width : 300,
        reorderable: false,
        resizable: true,
      },
    ];
    let setHeaderObj: HeaderInfo[] = [{ type: "header", text: "" }];

    if (columnSetting.length <= 0 || headerInfo.length <= 0) {
      // 初期化の場合
      gridTableState.columnData.forEach(
        (columnItem: { dataKey: string; dataName: string }) => {
          setColumnObj.push({
            columnId: columnItem.dataKey,
            columnType: "text",
            width: 200,
            reorderable: true,
            resizable: true,
          });
          setHeaderObj.push({ type: "header", text: columnItem.dataName });
        }
      );

      setColumnSetting(setColumnObj);
      setHeaderInfo(setHeaderObj);

      setRows(
        setInputDataToGridTable(
          gridTableState.useEditingData,
          setHeaderObj,
          setColumnObj
        )
      );
    } else {
      // 更新する場合
      setColumnSetting(columnSetting);
      setHeaderInfo(headerInfo);

      setRows(
        setInputDataToGridTable(
          gridTableState.useEditingData,
          headerInfo,
          columnSetting
        )
      );
    }

    return true;
  };

  useQuery({
    queryKey: ["dataColumRow", gridTableState.useEditingData],
    queryFn: setDataColumnRow,
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

  /** 一覧表の情報 (body) を設定 */
  const setInputDataToGridTable = (
    useEditingData: any[],
    headerInfo: any[],
    columnInfo: any[]
  ): Row[] => [
      {
        rowId: "header",
        height: 40,
        cells: headerInfo,
      },
      ...useEditingData.map<Row>((dataItem, idx) => ({
        rowId: idx,
        reorderable: true,
        height: dataItem.type == "textArea" ? 200 : 25,
        cells: columnInfo.map((cell: { columnId: string }, key: number) => {
          var ret: any = new Object();

          if (cell.columnId == "name") {
            /** 縦ヘッダ（項目名） */
            ret.type = "htmlToText";
            ret.text = dataItem.name;
            ret.value = dataItem.name;
            ret.nonEditable = true;
          } else if (
            dataItem.type == "text" ||
            dataItem.type == "inputTime" ||
            dataItem.data[key - 1].dataDisable
          ) {
            /** 入力：テクストボックス */
            ret.type = "text";
            ret.text = dataItem.data[key - 1].dataDisable
              ? dataItem.data[key - 1].data
                ? dataItem.data[key - 1].data
                : "*****"
              : dataItem.data[key - 1].data;
            ret.nonEditable =
              cell.columnId == "name" ||
                dataItem.data[key - 1].dataDisable ||
                dataItem.data[key - 1].inspectionKbnCode !=
                sideMenuState.useSideMenuSelected.inspectionKbnCode ||
                !gridTableState.useInputFixedFlg
                ? true
                : false;

            // スタイル設定　※ 縦ヘッダ（項目名）確認
            if (cell.columnId !== "name") {
              const textAlignClass: string =
                dataItem.data[key - 1].constantQualitativeFlg == 1 ||
                  dataItem.type == "inputTime"
                  ? " display-text-right"
                  : "";
              const disabledClass: string = dataItem.data[key - 1].dataDisable
                ? "disabled-cell"
                : "";
              const inputBgClass: string =
                disabledClass === ""
                  ? dataItem.data[key - 1].handleEditData
                    ? " db-edit-data-bg"
                    : idx % 2 == 0
                      ? " strip-bg-color"
                      : ""
                  : "";

              // 異常値の文字色
              // abnormal-cell：一般の異常値（赤）
              // abnormal-c-cell：統計量の異常値（濃い紫）
              const abnormalClass: string = (dataItem.data[key - 1].abnormalData !== 0)
                ? (dataItem.data[key - 1].abnormalData == 1) ? " abnormal-cell" : " abnormal-c-cell"
                : "";

              let maskBackgorund: string = "";
              if (
                dataItem.data[key - 1].inspectionKbnCode !=
                sideMenuState.useSideMenuSelected.inspectionKbnCode &&
                ret.text != "*****"
              ) {
                switch (dataItem.data[key - 1].inspectionKbnCode) {
                  // case 200:
                  //   maskBackgorund = " outline-aqua";
                  //   break;
                  // case 400:
                  //   maskBackgorund = " outline-purple";
                  //   break;
                  default:
                    maskBackgorund = " mask-background";
                    break;
                }
              }
              const outline = dataGrid.cellOutline.hasOwnProperty(
                dataGrid.itemData[idx].itemNo
              );
              let cellColor = [];
              if (
                dataGrid.cellOutline.length > 0 &&
                Object.keys(dataGrid.cellOutline[0]).indexOf("item_no") !== -1
              ) {
                cellColor = dataGrid.cellOutline.filter(
                  (cellElem) =>
                    cellElem.point_no == dataItem.data[key - 1].pointNo &&
                    cellElem.item_no == dataItem.itemNo
                );
              }
              const cellOutline =
                cellColor.length > 0
                  ? " " + cellColor[0].cell_color
                  : outline
                    ? " " + dataGrid.cellOutline[dataGrid.itemData[idx].itemNo]
                    : "";
              // const maskBackgorund:string = dataItem.data[key - 1].dataDisable && ret.text != "*****" ? " mask-background" : "";
              ret.className =
                disabledClass +
                inputBgClass +
                abnormalClass +
                textAlignClass +
                maskBackgorund +
                cellOutline;
            }
          } else if (dataItem.type == "select") {
            /** 入力：セレクトボックス　※ カスタム：html/src/components/common/select.cell.tsxを参考 */
            ret.type = "combobox"; // ※ カスタムは select（セレクトボックス）か combobox（コンボボックス・絞り込み）設定できる
            ret.selectedValue = dataItem.data[key - 1].data;
            //ret.text = person[cell.columnId];
            ret.text = dataItem.data[key - 1].dataDisable
              ? dataItem.data[key - 1].data
                ? dataItem.data[key - 1].data
                : "*****"
              : dataItem.data[key - 1].data;

            // 選択肢を設定
            let setOptions: any = [];
            Object.values(dataItem.selectorList).forEach((option: any) => {
              setOptions.push({
                value: String(option.selection_no),
                label: String(option.selection_name),
              });
            });
            ret.options = setOptions;
            // ret.defaultOption = true;
            ret.nonEditable =
              cell.columnId == "name" || dataItem.data[key - 1].dataDisable
                ? true
                : false;
            ret.isOpen = dataItem.data[key - 1].dataDisable;

            // スタイル設定
            const disabledClass: string = dataItem.data[key - 1].dataDisable
              ? "disabled-cell"
              : "";
            const inputBgClass: string = dataItem.data[key - 1].handleEditData
              ? " db-edit-data-bg"
              : idx % 2 == 0
                ? " strip-bg-color select-like-span"
                : " select-like-span";
            ret.className = disabledClass + inputBgClass;
          } else if (
            dataItem.type == "date" ||
            dataItem.data[key - 1].dataDisable
          ) {
            /** 入力：日付 */
            ret.type = "date";
            ret.date = dataItem.data[key - 1].data;
            ret.nonEditable =
              cell.columnId == "name" || dataItem.data[key - 1].dataDisable
                ? true
                : false;

            // スタイル設定
            const disabledClass: string = dataItem.data[key - 1].dataDisable
              ? "disabled-cell"
              : "";
            const inputBgClass: string = dataItem.data[key - 1].handleEditData
              ? " db-edit-data-bg"
              : idx % 2 == 0
                ? " strip-bg-color"
                : "";
            const textAlignClass: string = "display-text-right ";
            ret.className = textAlignClass + disabledClass + inputBgClass;
          } else if (
            dataItem.type == "dateEditor" ||
            dataItem.data[key - 1].dataDisable
          ) {
            /** 入力：日付 */
            ret.type = "dateEditor"; // ReactGrid : date , CustomCell : dateEditor
            ret.date = dataItem.data[key - 1].data
              ? dataItem.data[key - 1].data
              : new Date();
            ret.text = dataItem.data[key - 1].data
              ? moment(dataItem.data[key - 1].data).format("YYYY/MM/DD")
              : "";
            ret.value = dataItem.data[key - 1].data
              ? moment(dataItem.data[key - 1].data).format("YYYY/MM/DD")
              : "";
            ret.nonEditable =
              cell.columnId == "name" ||
                dataItem.data[key - 1].dataDisable ||
                dataItem.itemNo == 1
                ? true
                : false;

            // スタイル設定
            const disabledClass: string = dataItem.data[key - 1].dataDisable
              ? "disabled-cell"
              : "";
            const inputBgClass: string = dataItem.data[key - 1].handleEditData
              ? " db-edit-data-bg"
              : idx % 2 == 0
                ? " strip-bg-color"
                : "";
            const textAlignClass: string = "display-text-right ";
            ret.className = textAlignClass + disabledClass + inputBgClass;
          } else if (
            dataItem.type == "time" ||
            dataItem.data[key - 1].dataDisable
          ) {
            /** 入力：時刻 */
            ret.type = "time";
            ret.time = dataItem.data[key - 1].dataDisable
              ? dataItem.data[key - 1].data
                ? dataItem.data[key - 1].data
                : "*****"
              : dataItem.data[key - 1].data;
            ret.nonEditable =
              cell.columnId == "name" || dataItem.data[key - 1].dataDisable
                ? true
                : false;

            // 時刻表示フォマード
            ret.format = new Intl.DateTimeFormat(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            });

            // スタイル設定
            const disabledClass: string = dataItem.data[key - 1].dataDisable
              ? "disabled-cell"
              : "";
            const inputBgClass: string = dataItem.data[key - 1].handleEditData
              ? " db-edit-data-bg"
              : idx % 2 == 0
                ? " strip-bg-color"
                : " time-bg-white";
            const textAlignClass: string = "display-text-right ";
            ret.className = textAlignClass + disabledClass + inputBgClass;
          } else if (
            // dataItem.type == "inputTime" ||
            dataItem.type == "timeEditor" ||
            dataItem.data[key - 1].dataDisable
          ) {
            /** 入力：時刻 */
            ret.type = "inputTime";
            ret.text = "12:30:00";
            ret.value = "12:30:00";
          } else if (
            dataItem.type == "dropdown" ||
            dataItem.data[key - 1].dataDisable
          ) {
            /** 入力：ドロップダウン　※ 不用 */
            // ret.type = "dropdown";
            // const getValues: any = Object.values(dataItem.selectorList)[0];
            // ret.selectedValue = String(getValues.item_no);
            // let setOptions: any = [];
            // Object.values(dataItem.selectorList).forEach((option: any) => {
            //     setOptions.push({
            //         value: String(option.selection_no),
            //         label: String(option.selection_name)
            //     });
            // });
            // ret.values = setOptions;
            // ret.nonEditable = dataItem.data[key - 1].dataDisable;
          } else if (dataItem.type == "textArea") {
            /** 入力：時刻 */
            ret.type = "textArea";
            ret.text = dataItem.data[key - 1].data;
            ret.value = dataItem.data[key - 1].data;

            // スタイル設定
            const disabledClass: string = dataItem.data[key - 1].dataDisable
              ? "disabled-cell"
              : "";
            const inputBgClass: string = dataItem.data[key - 1].handleEditData
              ? " db-edit-data-bg"
              : idx % 2 == 0
                ? " strip-bg-color select-like-text-area"
                : " select-like-text-area";
            ret.className = disabledClass + inputBgClass;
          } else {
            /** 入力：不明 ※ 編集不可の平文 */
            ret.type = "text";
            ret.text = dataItem.name;
            ret.nonEditable = true;
          }
          return ret;
        }),
      })),
    ];

  /** 各行のデータステート */
  const [rows, setRows] = React.useState<any>(
    setInputDataToGridTable(
      gridTableState.useEditingData,
      headerInfo,
      columnSetting
    )
  ); // ReactGridに各行の情報を指定

  /** MACを確認 */
  const isMacOs = () => window.navigator.appVersion.indexOf("Mac") !== -1;

  /** 異常値一覧を設定 */
  const addOutLierLists = (newList) => {
    let newOutlinerObj: any = [];
    newList.forEach((item) => {
      item.data.forEach((point) => {
        if (point.abnormalData && point.constantQualitativeFlg == 1) {
          newOutlinerObj.push({
            abnormalType: (point.abnormalData == 1) ? "下限値" : "統計量",
            pointName: point.pointName ?? "",
            itemName: item.name,
            data: point.data ?? "",
            inputUnit: point.inputUnit ? point.inputUnit : "",
            saisuiKbnName: point.saisuiKbnName ? point.saisuiKbnName : "",
            regulationUpLimit: point.regulationUpLimit
              ? point.regulationUpLimit
              : "",
            inputLowLimit: point.inputLowLimit ? point.inputLowLimit : "",
            reportLowLimit: point.reportLowLimit ? point.reportLowLimit : "",
            calUpLow:
              point.calUp && point.calLow
                ? point.calLow + " ～ " + point.calUp
                : "",
          });
        }
      });
    });
    // 異常値のリストに格納する
    if (newOutlinerObj.length > 0) {
      commonState.setOutlinerModalDataLists(newOutlinerObj);
      commonState.setOutlinerModalShowBtn(true);
    } else {
      commonState.setOutlinerModalDataLists([]);
      commonState.setOutlinerModalShowBtn(false);
    }
  };

  /**
   * データを更新する処理
   *
   * @param changes  ライブラリーのデータ変更値
   */
  const handleChanges = async (changes: CellChange<any>[]) => {
    // クリップボードからのデータを取得
    const text = await navigator.clipboard.readText();

    // 改行を削除した回数を設定
    const lines = text.split("\n");

    // 改行・空白を削除
    if (lines[lines.length - 1] == '') {
      lines.pop();
    }

    // クリップボードの件数と貼り付けの件数が一致しない場合、最後のデータを削除 ※ いつも1件超過している
    let ChangedData = changes;
    if (ChangedData.length - Number(lines.length) == 1) {
      ChangedData.pop();
    }

    if (ChangedData[0].newCell.text !== "*****") {
      // メッセージクリア
      commonState.setResultMessage([]);
      commonState.setMessageMutiLine([]);

      // 保持データを設定_初期化
      const newTempData: any = gridTableState.useTempSaveData;
      const findTempData = newTempData.find((item) => {
        return (
          item.inputMenuNo ==
          sideMenuState.useSideMenuSelected.selectedMenuNo &&
          item.inputSelectDate == menuCalendarState.useSidemenuSelectedDate
        );
      });

      if (!findTempData) {
        newTempData.push({
          inputMenuNo: sideMenuState.useSideMenuSelected.selectedMenuNo,
          inputSelectDate: menuCalendarState.useSidemenuSelectedDate,
          inputEditingData: gridTableState.useEditingData,
          cellChanges: [
            [gridTableState.useEditingData, gridTableState.columnData],
          ],
          cellChangesIndex: 0,
        });
      }

      let newList = gridTableState.useEditingData;
      const changedData: any = ChangedData;
      const changedColumnId: Id = ChangedData[0].columnId;
      const changedRowId: Id = ChangedData[0].rowId;

      const errorInfo: AtomCommon.message[] = [];
      ChangedData.forEach((changeItem) => {
        let columnIdx = changeItem.columnId;
        let columnType = changeItem.type;

        newList = [...Object.values(newList)].map((item, key) => {
          if (key === changeItem.rowId) {
            // コラム名を指定
            let dataKey = `${columnIdx}`;
            let changedData = changeItem.newCell.text.trim();
            let previousData = changeItem.previousCell.text;

            // ***** ReactGrid_日付 *****
            if (columnType == "date") {
              if (moment(changeItem.newCell.date).format("YYYY").length > 4) {
                changedData = null;

                // エラーメッセージ表示
                errorInfo.push(getMessage(["WQ-0020W", item.name]));
                // setResultMessage(errorInfo);
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
                errorInfo.push(getMessage(["WQ-0020W", item.name]));
                // setResultMessage(errorInfo);
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
            } else if (columnType == "combobox") {
              // ※ カスタムは select（セレクトボックス）か combobox（コンボボックス・絞り込み）設定できる
              // const getLabel: any = changeItem.newCell.options.find(
              //   (option) => option.value == changeItem.newCell.text
              // );
              const getLabel: any = changeItem.newCell.options.find(
                (option) => option.label == changeItem.newCell.text.trim()
              );
              changedData = getLabel ? getLabel.label : "";

              // ***** CUSTOMCELL_チェックボックス *****
            } else if (columnType == "checkbox") {
            } else if (columnType == "text") {
              // 空白・改行を削除（コピペ）
              changedData = changedData.trim();
            }

            return {
              ...item,
              data: item.data.map((innerItem: any, innerIndex: any) => {
                if (innerIndex == dataKey) {
                  let editFlgChange: boolean = true;
                  let checkAbnormalFlg: number = 0;
                  let changedDataAdj = changedData;

                  // 空白の場合
                  if (!changedDataAdj || changedDataAdj == "") {
                    // クリップボードに空白指定
                    // navigator.clipboard.writeText("");

                    // セルに空白を指定
                    return {
                      ...innerItem,
                      data: "",
                      handleEditData: editFlgChange,
                      abnormalData: false,
                    };
                  }

                  // 定量値の場合
                  if (innerItem.constantQualitativeFlg == 1) {
                    // 入力の桁数を確認
                    if (
                      changedData.split(".")[0].length > 10 ||
                      (changedData.split(".")[1] &&
                        changedData.split(".")[1].length > 8)
                    ) {
                      // エラーメッセージ表示
                      errorInfo.push(getMessage(["WQ-0023W"]));
                      // setResultMessage(errorInfo);

                      // データ指定
                      changedDataAdj = previousData;
                    }

                    // 確認用の下限値
                    let inputLowLimitChecker = innerItem.inputLowLimit;

                    if (isNaN(changedData)) {
                      // エラーメッセージ表示
                      errorInfo.push(getMessage(["WQ-0004W", item.name]));
                      // setResultMessage(errorInfo);

                      // データ指定
                      changedDataAdj = previousData;
                      editFlgChange = false;
                    } else {
                      checkAbnormalFlg = CellCalculate.checkCellDataOver(
                        Number(changedData),
                        item.itemNo,
                        innerItem.inspectionKbnCode,
                        innerItem.inputLowLimit,
                        innerItem.regulationUpLimit,
                        innerItem.calUp,
                        innerItem.calLow,
                        innerItem.saisuiKbnName
                      );
                      // changedDataAdj = Number(changedDataAdj).toFixed(innerItem.inputMinDigits);

                      // JIS丸めに変換_補正データが存在するか確認
                      const findCriCorrJis =
                        item.itemNo == 2490
                          ? gridTableState.useCriCorrectData.find(
                            (cri) =>
                              cri.input_dsp_no ==
                              sideMenuState.useSideMenuSelected
                                .selectedDspNo &&
                              cri.item_no == item.itemNo &&
                              cri.point_no == innerItem.pointNo
                          )
                          : gridTableState.useCriCorrectData.find(
                            (cri) => cri.item_no == item.itemNo
                          );       

                      let setValidDigits = innerItem.validDigits;
                      let setInputMinDigits = innerItem.inputMinDigits * -1; // ※ 値は正の数のため、負の数に変換必要がある
                      let setOutputMinDigits = null;
                      let setInputLowLimit = null;

                      // 2490:濁度、2497:計器濁度、1060:取水口水位、1424:上水後塩素注入率
                      if (findCriCorrJis) {
                        // 2490:濁度
                        if (
                          findCriCorrJis.item_no == 2490 &&
                          innerItem.inspectionKbnCode == 200 &&
                          Const.TARGET_2490_POINT_NO.includes(innerItem.pointNo)
                        ) {
                          setValidDigits = findCriCorrJis.valid_digits;
                          setInputMinDigits = findCriCorrJis.input_min_digits; // ※ 値は負の数のため、このまま出来る
                          setOutputMinDigits =
                            findCriCorrJis.output_min_digits; // ※ 値は負の数のため、このまま出来る
                          setInputLowLimit = innerItem.inputLowLimit * 0.1;
                          inputLowLimitChecker = setInputLowLimit;
                        }

                        // 2497:計器濁度
                        if (
                          findCriCorrJis.item_no == 2497 &&
                          innerItem.pointNo == 243
                        ) {
                          setValidDigits = findCriCorrJis.valid_digits;
                          setInputMinDigits = findCriCorrJis.input_min_digits; // ※ 値は負の数のため、このまま出来る
                          setOutputMinDigits =
                            findCriCorrJis.output_min_digits; // ※ 値は負の数のため、このまま出来る
                        }

                        // 1060:取水口水位
                        if (
                          findCriCorrJis.item_no == 1060 &&
                          innerItem.pointNo == 1008
                        ) {
                          setValidDigits = findCriCorrJis.valid_digits;
                          setInputMinDigits = findCriCorrJis.input_min_digits; // ※ 値は負の数のため、このまま出来る
                          setOutputMinDigits =
                            findCriCorrJis.output_min_digits; // ※ 値は負の数のため、このまま出来る
                        }

                        // 1424:上水後塩素注入率のみ
                        if (
                          findCriCorrJis.item_no == 1424 &&
                          changedDataAdj < 0.1
                        ) {
                          setValidDigits = findCriCorrJis.valid_digits;
                          setInputMinDigits = findCriCorrJis.input_min_digits; // ※ 値は負の数のため、このまま出来る
                          setOutputMinDigits =
                            findCriCorrJis.output_min_digits; // ※ 値は負の数のため、このまま出来る
                        }
                      }

                      // 入力下限値より小さくの値は０に変換
                      if (
                        Number(changedDataAdj) < Number(inputLowLimitChecker)
                      ) {
                        changedDataAdj =
                          innerItem.inputMinDigits &&
                            innerItem.inputMinDigits !== 0
                            ? "0.".padEnd(innerItem.inputMinDigits + 2, "0")
                            : "0";
                      }

                      changedDataAdj = CellCalculate.processJisRoundingNumber(
                        changedDataAdj,
                        null,
                        null,
                        setValidDigits,
                        setInputMinDigits,
                        setOutputMinDigits,
                        setInputLowLimit
                      );
                    }
                  }

                  // 入力を時刻形式に変換
                  if (item.type == "inputTime") {
                    // コピペからの日付フォーマットを加工
                    const checkDateFormat = changedDataAdj.split(":");
                    if (checkDateFormat.length > 1) {
                      let setNewDateFormat: string = "";
                      checkDateFormat.forEach((element) => {
                        setNewDateFormat =
                          setNewDateFormat + element.padStart(2, "0");
                      });

                      changedDataAdj = setNewDateFormat;
                    }

                    changedDataAdj = Common.convertToTime(changedDataAdj);
                  }

                  if (checkAbnormalFlg !== 0) {
                    return {
                      ...innerItem,
                      data: changedDataAdj,
                      handleEditData: editFlgChange,
                      abnormalData: checkAbnormalFlg,
                    };
                  } else {
                    return {
                      ...innerItem,
                      data: changedDataAdj,
                      handleEditData: editFlgChange,
                      abnormalData: 0,
                    };
                  }
                } else {
                  return innerItem;
                }
              }),
            };
          } else {
            return item;
          }
        });
      });
      commonState.setMessageMutiLine(errorInfo);

      // セル値の自動設定処理 ※ 2025/08/29 不用
      const adjustNewList = await CellCalculate.checkCalculateFunction(
        changedColumnId,
        changedRowId,
        Number(sideMenuState.useSideMenuSelected.selectedMenuNo), // メニュー番号
        Number(sideMenuState.useSideMenuSelected.selectedDspNo), // 画面番号
        sideMenuState.useSideMenuSelected.selectedMenuName, // 画面名称
        Number(sideMenuState.useSideMenuSelected.inspectionKbnCode), // 検査区分CD
        dataGrid.itemData[changedRowId].itemNo, // 項目番号
        dataGrid.pointData[changedColumnId].pointNo, // 地点番号
        dataGrid.itemData[changedRowId].data[changedColumnId].itemDaiCategoryNo, // 項目大分類番号
        dataGrid.itemData[changedRowId].data[changedColumnId].itemTyuCategoryNo, // 項目中分類番号
        newList,
        changedData
      );

      // 前回値を設定
      gridTableState.setGridTableButtomInfo({
        ...gridTableState.useGridTableButtomInfo,
        prevInputData:
          changedData[0].newCell.type == "text"
            ? // 2025/11/19 修正 文字列も数値も設定できるように
            changedData[0].newCell.text
              ? changedData[0].newCell.text
              : ""
            : gridTableState.useGridTableButtomInfo.prevInputData,
      });

      // 調整データがある場合 ※ 2025/08/29 不用
      newList = adjustNewList ? adjustNewList : newList;

      // データを変える時、変更履歴ステートに追加する
      // 編集中のデータを設定
      gridTableState.setEditingData(newList);

      // 保持データを設定
      const findTempDataLast = newTempData.find((item) => {
        return (
          item.inputMenuNo ==
          sideMenuState.useSideMenuSelected.selectedMenuNo &&
          item.inputSelectDate == menuCalendarState.useSidemenuSelectedDate
        );
      });

      if (!findTempDataLast) {
        newTempData.push({
          inputMenuNo: sideMenuState.useSideMenuSelected.selectedMenuNo,
          inputSelectDate: menuCalendarState.useSidemenuSelectedDate,
          inputEditingData: newList,
          cellChanges: [[newList, gridTableState.columnData]],
          cellChangesIndex: 0,
        });
      } else {
        newTempData.forEach((item, key) => {
          if (
            item.inputMenuNo ==
            sideMenuState.useSideMenuSelected.selectedMenuNo &&
            item.inputSelectDate == menuCalendarState.useSidemenuSelectedDate
          ) {
            item.inputEditingData = newList;
            item.cellChanges.push([newList, gridTableState.columnData]);
            item.cellChangesIndex = item.cellChangesIndex + 1;
          }
        });
      }

      gridTableState.setTempSaveData(newTempData);

      // カレンダーに編集がある日をメモする
      let newStoreEditedDataObj: any = [];
      menuCalendarState.useStoreEditedData.forEach((element: any) => {
        newStoreEditedDataObj.push({
          date: element.date,
          editedFlg:
            menuCalendarState.useSidemenuSelectedDate == element.date
              ? true
              : false,
        });
      });

      // 配列
      menuCalendarState.setStoreEditedData(newStoreEditedDataObj);

      // 異常値のリストに格納する
      addOutLierLists(newList);

      // 編集状態を設定
      commonState.setInputEditingFlg(true);
    }
  };

  /**
   * カラムの広さを調整する処理
   *
   * @param getColumnId   　String    カラム名
   * @param width　         Number　  セルの広さ
   */
  const handleColumnResize = async (getColumnId: any, setWidth: number) => {
    let newWidth = columnSetting;
    newWidth = newWidth.map((item: any) => {
      if (item.columnId == getColumnId) {
        return {
          ...item,
          width: setWidth,
        };
      } else {
        return item;
      }
    });
    let setColumnSize: any = [];
    newWidth.forEach((element, key) => {
      setColumnSize.push(element.width);
    });

    /**
     * ################################################################################################################################
     * キャッシュAPI処理_指定
     * ################################################################################################################################
     */
    // 配列をJSON stringに変換
    const jsonString = JSON.stringify(setColumnSize);

    // StringからレスポンスOBJを作成
    const response = new Response(jsonString, {
      headers: { "Content-Type": "application/json" },
    });

    // キャッシュキー
    const cacheKey = `/column-size/${sideMenuState.useSideMenuSelected.selectedDspNo}`;

    // Use .put() to store the key-response pair
    const cache = await caches.open("app-data-storage");
    await cache.put(cacheKey, response);
    // ################################################################################################################################

    setColumnSetting(newWidth);
    setRows(
      setInputDataToGridTable(
        gridTableState.useEditingData,
        headerInfo,
        columnSetting
      )
    );
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
  const simpleHandleContextMenu = (
    selectedRowIds: Id[],
    selectedColIds: Id[],
    selectionMode: SelectionMode,
    menuOptions: MenuOption[],
    selectedRanges: Array<CellLocation[]>
  ): MenuOption[] => {
    if (selectedRanges[0]) {
      // 行の項目名を選択する時、行項目を取り外す
      if (
        selectedRanges[0]["0"].columnId == "name" ||
        Object.keys(selectedRanges[0]).length - 1 ==
        Object.keys(gridTableState.useEditingData).length
      ) {
        selectedRanges[0].shift();
      }

      if (
        selectedRanges[0].length == 0 ||
        selectedRanges[0]["0"].columnId == "name"
      ) {
        return (menuOptions = []);
      }
    }

    const rowId: any =
      selectedRanges[0] && typeof selectedRanges[0]["0"] != "undefined"
        ? selectedRanges[0]["0"].rowId
        : null;
    const columnId: any = selectedRanges[0]
      ? selectedRanges[0]["0"].columnId
      : null;
    // const checkMask = (selectedRanges[0]) ? useEditingData[rowId].data[columnId].dataDisable : null;

    return menuOptions;
  };

  /**
   * 元に戻す（ctrl + z）
   *
   */
  const handleUndoChanges = () => {
    // 保持データを取得
    let getTempData: any = null;
    gridTableState.useTempSaveData.forEach((item, key) => {
      if (
        item.inputMenuNo == sideMenuState.useSideMenuSelected.selectedMenuNo &&
        item.inputSelectDate == menuCalendarState.useSidemenuSelectedDate
      ) {
        getTempData = item;
      }
    });

    if (getTempData) {
      const undoColumn: any =
        getTempData.cellChanges[getTempData.cellChangesIndex - 1]["1"]; // ヘッダーカラム
      const undoData: any =
        getTempData.cellChanges[getTempData.cellChangesIndex - 1]["0"]; // 編集中のデータ

      gridTableState.setColumnData(undoColumn); // ヘッダーカラム
      gridTableState.setEditingData(undoData); // 編集中のデータ

      // 異常値のリストに格納する
      addOutLierLists(undoData);

      // 保持データを設定
      let newTempData: any = gridTableState.useTempSaveData;
      newTempData.forEach((item, key) => {
        if (
          item.inputMenuNo ==
          sideMenuState.useSideMenuSelected.selectedMenuNo &&
          item.inputSelectDate == menuCalendarState.useSidemenuSelectedDate
        ) {
          item.inputEditingData = undoData;
          item.cellChangesIndex = item.cellChangesIndex - 1;
        }
      });
      gridTableState.setTempSaveData(newTempData);
    }
  };

  /**
   * やり直す（ctrl + y）
   *
   */
  const handleRedoChanges = () => {
    // 保持データを取得
    let getTempData: any = null;
    gridTableState.useTempSaveData.forEach((item, key) => {
      if (
        item.inputMenuNo == sideMenuState.useSideMenuSelected.selectedMenuNo &&
        item.inputSelectDate == menuCalendarState.useSidemenuSelectedDate
      ) {
        getTempData = item;
      }
    });

    if (
      getTempData &&
      getTempData.cellChangesIndex + 1 <= getTempData.cellChanges.length - 1
    ) {
      const redoColumn: any =
        getTempData.cellChanges[getTempData.cellChangesIndex + 1]["1"]; // 編集中のデータ
      const redoData: any =
        getTempData.cellChanges[getTempData.cellChangesIndex + 1]["0"]; // ヘッダーカラム

      gridTableState.setColumnData(redoColumn); // ヘッダーカラム
      gridTableState.setEditingData(redoData); // 編集中のデータ

      // 異常値のリストに格納する
      addOutLierLists(redoData);

      // 保持データを設定
      let newTempData: any = gridTableState.useTempSaveData;
      newTempData.forEach((item, key) => {
        if (
          item.inputMenuNo ==
          sideMenuState.useSideMenuSelected.selectedMenuNo &&
          item.inputSelectDate == menuCalendarState.useSidemenuSelectedDate
        ) {
          item.inputEditingData = redoData;
          item.cellChangesIndex = item.cellChangesIndex + 1;
        }
      });
      gridTableState.setTempSaveData(newTempData);
    }
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
   * ヘッダカラムの並び順を変更
   *
   * @param targetColumnId
   * @param columnIds
   */
  const handleColumnsReorder = (targetColumnId: Id, columnIds: Id[]) => {
    const to = gridTableState.columnData.findIndex(
      (item, key) => key === targetColumnId
    );
    const rowsIds = columnIds.map((id) =>
      gridTableState.columnData.findIndex((rowItem, rowKey) => rowKey === id)
    );
    let newColumn = reorderArray(gridTableState.columnData, rowsIds, to);
    newColumn = [...Object.values(newColumn)].map((newItem, newKey) => {
      return {
        ...newItem,
        dataKey: newKey,
      };
    });

    // row data
    let newList = gridTableState.useEditingData;
    newList = newList.map((rowItem: any, rowKey: any) => {
      return {
        ...rowItem,
        data: reorderArray(rowItem.data, rowsIds, to),
      };
    });

    // データを変える時、変更履歴ステートに追加する
    // const setChangeData: any = [newList, newColumn]
    // setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), setChangeData]);

    gridTableState.setColumnData(newColumn);
    gridTableState.setEditingData(newList); // 編集中のデータ

    // 異常値のリストに格納する
    addOutLierLists(newList);
    setFocusInfo({ rowId: 0, columnId: to });
  };

  /**
   * 行セルの並び順を変更
   *
   * @param targetRowId
   * @param rowIds
   */
  const handleRowsReorder = (targetRowId: Id, rowIds: Id[]) => {
    const to = gridTableState.useEditingData.findIndex(
      (person, key) => key === targetRowId
    );
    const rowsIds = rowIds.map((id) =>
      gridTableState.useEditingData.findIndex((person, key) => key === id)
    );
    let newList = reorderArray(gridTableState.useEditingData, rowsIds, to);
    // データを変える時、変更履歴ステートに追加する
    // const setChangeData: any = [newList, columnData]
    // setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), setChangeData]);

    // 変更回数を増やす
    gridTableState.setEditingData(newList); // 編集中のデータ

    // 異常値のリストに格納する
    addOutLierLists(newList);
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
    // ヘッダ以外は並び順変更可能
    return targetRowId !== "header";
  };

  /**
   * フォーカス変更
   *
   * @param location
   */
  const handleFocusChange = async (location: CellLocation) => {
    // セルからフォーカスが外れた場合
    if (
      gridTableState.useCurFocusRow &&
      gridTableState.useCurFocusRow !== location.rowId &&
      useCurFocusCnt > 0
    ) {
      // 対象項目のみ、処理実施 ※ [1132, 1155, 1212, 1902, 1903, 1904, 1905]
      // if (
      //   Const.FOCUS_OUT_ITEM_NO.includes(
      //     dataGrid.itemData[useCurFocusRow].itemNo
      //   )
      // ) {
      const kyoudouKensa: string = "共同検査";
      if (
        sideMenuState.useSideMenuSelected.selectedMenuName.includes(
          kyoudouKensa
        )
      ) {
        // フォーカス外れた場合
        const outOfFocusPcs = await CellCalculate.checkOutOfFocusFunction(
          menuCalendarState.useSidemenuSelectedDate,
          gridTableState.useCurFocusColumn,
          gridTableState.useCurFocusRow,
          sideMenuState.useSideMenuSelected.selectedMenuNo, // メニュー番号
          sideMenuState.useSideMenuSelected.selectedDspNo, // 画面番号
          sideMenuState.useSideMenuSelected.selectedMenuName, // 画面名称
          dataGrid.itemData[gridTableState.useCurFocusRow].itemNo, // 項目番号
          dataGrid.pointData[gridTableState.useCurFocusColumn].pointNo, // 地点番号
          dataGrid.pointData[gridTableState.useCurFocusColumn].processNo, // 処理過程番号
          gridTableState.useEditingData
        );

        // 更新データがある場合
        if (outOfFocusPcs) {
          // データを変える時、変更履歴ステートに追加する
          // const setChangeData: any = [outOfFocusPcs, columnData]
          // setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), setChangeData]);

          // 編集中のデータを設定
          gridTableState.setEditingData(outOfFocusPcs);

          // 保持データを設定
          let newTempData: any = gridTableState.useTempSaveData;
          newTempData.forEach((item, key) => {
            if (
              item.inputMenuNo ==
              sideMenuState.useSideMenuSelected.selectedMenuNo &&
              item.inputSelectDate == menuCalendarState.useSidemenuSelectedDate
            ) {
              item.inputEditingData = outOfFocusPcs;
              item.cellChanges.push([outOfFocusPcs, gridTableState.columnData]);
              item.cellChangesIndex = item.cellChangesIndex + 1;
            }
          });

          gridTableState.setTempSaveData(newTempData);
        }

        // 編集状態を設定
        commonState.setInputEditingFlg(true);
      }

      // フォーカス管理設定
      gridTableState.setCurFocusColumn(location.columnId);
      gridTableState.setCurFocusRow(location.rowId);
      setCurFocusCnt(0);
    } else {
      // フォーカス管理設定
      gridTableState.setCurFocusColumn(location.columnId);
      gridTableState.setCurFocusRow(location.rowId);
      setCurFocusCnt(0);
    }

    // 下の検査基準値を指定
    let newList = gridTableState.useEditingData.find(
      (data, key) => key === location.rowId
    );
    gridTableState.setGridTableButtomInfo({
      ...gridTableState.useGridTableButtomInfo,
      saisuiKbnName: newList.data[location.columnId].saisuiKbnName, // 採水区分
      regulationUpLimit: newList.data[location.columnId].regulationUpLimit, // 基準値(目標値)
      inputLowLimit: newList.data[location.columnId].inputLowLimit, // 定量下限値
      reportLowLimit: newList.data[location.columnId].reportLowLimit, // 報告下限値
      calUp: newList.data[location.columnId].calUp, // 統計値
      calLow: newList.data[location.columnId].calLow, // 統計値
      calUpLow: newList.data[location.columnId].calUpLow, // 統計値
      // prevInputData: newList.data[location.columnId].prevInputData, // 前回値
    });

    setFocusedLocation(location);
  };

  /**
   * 日付を設定
   *
   */
  type DateSelection = {
    title: string;
    selectDate: Date | undefined;
  };

  const getInitDate = (): DateSelection[] => [
    { title: "時刻=", selectDate: undefined },
  ];

  const getColumnsDate = (): Column[] => [
    { columnId: "title", width: 0 },
    { columnId: "selectDate", width: 0 },
  ];

  const headerRowDate: Row = {
    rowId: "header",
    cells: [
      { type: "header", text: "" },
      { type: "header", text: "" },
    ],
  };

  const getRowsDate = (people: DateSelection[]): Row[] => [
    headerRowDate,
    ...people.map<Row>((person, idx) => ({
      rowId: idx,
      cells: [
        { type: "text", text: person.title },
        { type: "date", date: person.selectDate },
      ],
    })),
  ];

  const applyChangesDate = (
    changes: CellChange<any>[],
    prevPeople: DateSelection[]
  ): DateSelection[] => {
    changes.forEach((change) => {
      const dateStr = change.newCell.text;
      const dateArray = dateStr.split("/").map(Number);
      gridTableState.setDataNumbersState(dateArray[2]);
      gridTableState.setDataDateState(change.newCell.date);

      const dateIndex = change.rowId;
      const fieldName = change.columnId;
      prevPeople[dateIndex][fieldName] = change.newCell.date;
    });
    return [...prevPeople];
  };

  const [dateState, setDateState] = React.useState<DateSelection[]>(
    getInitDate()
  );

  const rowsGridDate = getRowsDate(dateState);
  const columnsGridDate = getColumnsDate();

  // 編集したデータを確認
  const handleChangeDate = (changes: CellChange<any>[]) => {
    setDateState((prevPeople) => applyChangesDate(changes, prevPeople));
  };

  const [useCurFocusCnt, setCurFocusCnt] = React.useState<number>(0);
  const queryClient = useQueryClient();

  // データ取消
  const removeAllEditingData = async () => {
    // メッセージクリア
    commonState.setResultMessage([]);

    if (
      gridTableState.useEditingData &&
      gridTableState.useEditingData.length !== 0
    ) {
      // 編集状態を設定
      commonState.setInputEditingFlg(true);

      let newList = gridTableState.useEditingData;
      newList = [...Object.values(newList)].map((item, key) => {
        return {
          ...item,
          data: item.data.map((innerItem: any, innerIndex: any) => {
            return { ...innerItem, data: "", handleEditData: false };
          }),
        };
      });

      // const setChangeData: any = [newList, columnData]
      // setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), setChangeData]);

      // 編集中のデータを設定
      gridTableState.setEditingData(newList);

      // 保持データを設定
      const newTempData: any = gridTableState.useTempSaveData;
      const findTempData = newTempData.find((item) => {
        return (
          item.inputMenuNo ==
          sideMenuState.useSideMenuSelected.selectedMenuNo &&
          item.inputSelectDate == menuCalendarState.useSidemenuSelectedDate
        );
      });

      if (!findTempData) {
        newTempData.push({
          inputMenuNo: sideMenuState.useSideMenuSelected.selectedMenuNo,
          inputSelectDate: menuCalendarState.useSidemenuSelectedDate,
          inputEditingData: newList,
          cellChanges: [[newList, gridTableState.columnData]],
          cellChangesIndex: 0,
        });
      } else {
        newTempData.forEach((item, key) => {
          if (
            item.inputMenuNo ==
            sideMenuState.useSideMenuSelected.selectedMenuNo &&
            item.inputSelectDate == menuCalendarState.useSidemenuSelectedDate
          ) {
            item.inputEditingData = newList;
            item.cellChanges.push([newList, gridTableState.columnData]);
            item.cellChangesIndex = item.cellChangesIndex + 1;
          }
        });
      }

      gridTableState.setTempSaveData(newTempData);
    }
    gridTableState.setGridTableFooterBtnClick("");

    // 登録処理を実施
    setTimeout(async () => {
      await queryClient.invalidateQueries({
        queryKey: ["validateDaveInputQuery"],
      });
    }, 100);
  };

  // 入力前に戻る
  const discardAllEditingData = async () => {
    // メッセージクリア
    commonState.setResultMessage([]);

    if (
      gridTableState.useEditingData &&
      gridTableState.useEditingData.length !== 0
    ) {
      // 保持データを取得
      let getTempData: any = null;
      gridTableState.useTempSaveData.forEach((item, key) => {
        if (
          item.inputMenuNo ==
          sideMenuState.useSideMenuSelected.selectedMenuNo &&
          item.inputSelectDate == menuCalendarState.useSidemenuSelectedDate
        ) {
          getTempData = item;
        }
      });

      // 入力前に戻す
      if (getTempData) {
        const discardColumn: any = getTempData.cellChanges[0]["1"]; // ヘッダーカラム
        const discardData: any = getTempData.cellChanges[0]["0"]; // 編集中のデータ

        gridTableState.setColumnData(discardColumn); // ヘッダーカラム
        gridTableState.setEditingData(discardData); // 編集中のデータ

        // 保持データを設定
        let newTempData: any = gridTableState.useTempSaveData;
        newTempData.forEach((item, key) => {
          if (
            item.inputMenuNo ==
            sideMenuState.useSideMenuSelected.selectedMenuNo &&
            item.inputSelectDate == menuCalendarState.useSidemenuSelectedDate
          ) {
            item.inputEditingData = discardData;
            item.cellChangesIndex = 0;
          }
        });
        gridTableState.setTempSaveData(newTempData);

        // 編集状態を設定
        commonState.setInputEditingFlg(false);
      }
    }

    gridTableState.setGridTableFooterBtnClick("");
  };

  // ボタン押下操作
  const checkFooterButtonClick = async () => {
    if (gridTableState.useGridTableFooterBtnClick == "取消") {
      removeAllEditingData();
    } else if (gridTableState.useGridTableFooterBtnClick == "入力前に戻る") {
      discardAllEditingData();
    }
    return true;
  };

  useQuery({
    queryKey: [
      "checkFooterButtonClick",
      gridTableState.useGridTableFooterBtnClick,
    ],
    queryFn: checkFooterButtonClick,
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

  const [focusedLocation, setFocusedLocation] = useState<
    CellLocation | undefined
  >(undefined); // セルフォーカス設定
  const [useActionEvent, setActionEvent] = useState<any>(""); // 操作イベント

  /**
   * 入力せずに、エンターを押下すると、前回の値を指定する処理
   * ※ 2025/12/05 追加
   * ※ changes：グリッドテーブルの更新データのような手動作成データ
   *
   */
  const enterToSetPreviousData = async (changes) => {
    if (changes[0].newCell.text !== "*****") {
      // メッセージクリア
      commonState.setResultMessage([]);
      commonState.setMessageMutiLine([]);

      // 保持データを設定_初期化
      const newTempData: any = gridTableState.useTempSaveData;
      const findTempData = newTempData.find((item) => {
        return (
          item.inputMenuNo ==
          sideMenuState.useSideMenuSelected.selectedMenuNo &&
          item.inputSelectDate == menuCalendarState.useSidemenuSelectedDate
        );
      });

      if (!findTempData) {
        newTempData.push({
          inputMenuNo: sideMenuState.useSideMenuSelected.selectedMenuNo,
          inputSelectDate: menuCalendarState.useSidemenuSelectedDate,
          inputEditingData: gridTableState.useEditingData,
          cellChanges: [
            [gridTableState.useEditingData, gridTableState.columnData],
          ],
          cellChangesIndex: 0,
        });
      }

      let newList = gridTableState.useEditingData;
      const changedData: any = changes;
      const changedColumnId: Id = changes[0].columnId;
      const changedRowId: Id = changes[0].rowId;

      const errorInfo: AtomCommon.message[] = [];
      changes.forEach((changeItem) => {
        let columnIdx = changeItem.columnId;
        let columnType = changeItem.type;

        newList = [...Object.values(newList)].map((item, key) => {
          if (key === changeItem.rowId) {
            // コラム名を指定
            let dataKey = `${columnIdx}`;
            let changedData = changeItem.newCell.text;
            let previousData = changeItem.previousCell.text;

            // ***** ReactGrid_日付 *****
            if (columnType == "date") {
              if (moment(changeItem.newCell.date).format("YYYY").length > 4) {
                changedData = null;

                // エラーメッセージ表示
                errorInfo.push(getMessage(["WQ-0020W", item.name]));
                // setResultMessage(errorInfo);
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
                errorInfo.push(getMessage(["WQ-0020W", item.name]));
                // setResultMessage(errorInfo);
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

              // ***** ReactGrid_コンボボックス（絞り込み可） *****
            } else if (columnType == "combobox") {
              // ※ カスタムは select（セレクトボックス）か combobox（コンボボックス・絞り込み）設定できる
              // const getLabel: any = changeItem.newCell.options.find(
              //   (option) => option.value == changeItem.newCell.text
              // );
              const getLabel: any = changeItem.newCell.options.find(
                (option) => option.label == changeItem.newCell.text
              );
              changedData = getLabel ? getLabel.label : "";
            }

            return {
              ...item,
              data: item.data.map((innerItem: any, innerIndex: any) => {
                if (innerIndex == dataKey) {
                  let editFlgChange: boolean = true;
                  let checkAbnormalFlg: number = 0;
                  let changedDataAdj = changedData;

                  // 空白の場合
                  if (!changedDataAdj || changedDataAdj == "") {
                    // クリップボードに空白指定
                    // navigator.clipboard.writeText("");

                    // セルに空白を指定
                    return {
                      ...innerItem,
                      data: "",
                      handleEditData: editFlgChange,
                      abnormalData: 0,
                    };
                  }

                  // 定量値の場合
                  if (innerItem.constantQualitativeFlg == 1) {
                    // 入力の桁数を確認
                    if (
                      changedData.split(".")[0].length > 10 ||
                      (changedData.split(".")[1] &&
                        changedData.split(".")[1].length > 8)
                    ) {
                      // エラーメッセージ表示
                      errorInfo.push(getMessage(["WQ-0023W"]));
                      // setResultMessage(errorInfo);

                      // データ指定
                      changedDataAdj = previousData;
                    }

                    // 確認用の下限値
                    let inputLowLimitChecker = innerItem.inputLowLimit;

                    if (
                      isNaN(changedData) &&
                      changedData !==
                      gridTableState.gridTableDefaultButtomInfo.prevInputData
                    ) {
                      // エラーメッセージ表示
                      errorInfo.push(getMessage(["WQ-0004W", item.name]));
                      // setResultMessage(errorInfo);

                      // データ指定
                      changedDataAdj = previousData;
                      editFlgChange = false;
                    } else if (
                      changedData !==
                      gridTableState.gridTableDefaultButtomInfo.prevInputData
                    ) {
                      checkAbnormalFlg = CellCalculate.checkCellDataOver(
                        Number(changedData),
                        item.itemNo,
                        innerItem.inspectionKbnCode,
                        innerItem.inputLowLimit,
                        innerItem.regulationUpLimit,
                        innerItem.calUp,
                        innerItem.calLow,
                        innerItem.saisuiKbnName
                      );
                      // changedDataAdj = Number(changedDataAdj).toFixed(innerItem.inputMinDigits);

                      // JIS丸めに変換
                      const findCriCorrJis =
                        item.itemNo == 2490
                          ? gridTableState.useCriCorrectData.find(
                            (cri) =>
                              cri.input_dsp_no ==
                              sideMenuState.useSideMenuSelected
                                .selectedDspNo &&
                              cri.item_no == item.itemNo &&
                              cri.point_no == innerItem.pointNo
                          )
                          : gridTableState.useCriCorrectData.find(
                            (cri) => cri.item_no == item.itemNo
                          );
                          
                      let setValidDigits = innerItem.validDigits;
                      let setInputMinDigits = innerItem.inputMinDigits * -1;
                      let setOutputMinDigits = null;
                      let setInputLowLimit = null;

                      // 2490:濁度、2497:計器濁度、1060:取水口水位、1424:上水後塩素注入率
                      if (findCriCorrJis) {
                        // 2490:濁度
                        if (
                          findCriCorrJis.item_no == 2490 &&
                          innerItem.inspectionKbnCode == 200 &&
                          Const.TARGET_2490_POINT_NO.includes(innerItem.pointNo)
                        ) {
                          setValidDigits = findCriCorrJis.valid_digits;
                          setInputMinDigits =
                            findCriCorrJis.input_min_digits;
                          setOutputMinDigits =
                            findCriCorrJis.output_min_digits;
                          setInputLowLimit = innerItem.inputLowLimit * 0.1;
                          inputLowLimitChecker = setInputLowLimit;
                        }

                        // 2497:計器濁度
                        if (
                          findCriCorrJis.item_no == 2497 &&
                          innerItem.pointNo == 243
                        ) {
                          setValidDigits = findCriCorrJis.valid_digits;
                          setInputMinDigits =
                            findCriCorrJis.input_min_digits;
                          setOutputMinDigits =
                            findCriCorrJis.output_min_digits;
                        }

                        // 1060:取水口水位
                        if (
                          findCriCorrJis.item_no == 1060 &&
                          innerItem.pointNo == 1008
                        ) {
                          setValidDigits = findCriCorrJis.valid_digits;
                          setInputMinDigits =
                            findCriCorrJis.input_min_digits;
                          setOutputMinDigits =
                            findCriCorrJis.output_min_digits;
                        }

                        // 1424:上水後塩素注入率のみ
                        if (
                          findCriCorrJis.item_no == 1424 &&
                          changedDataAdj < 0.1
                        ) {
                          setValidDigits = findCriCorrJis.valid_digits;
                          setInputMinDigits =
                            findCriCorrJis.input_min_digits;
                          setOutputMinDigits =
                            findCriCorrJis.output_min_digits;
                        }
                      }

                      // 入力下限値より小さくの値は０に変換
                      if (
                        Number(changedDataAdj) < Number(inputLowLimitChecker)
                      ) {
                        changedDataAdj =
                          innerItem.inputMinDigits &&
                            innerItem.inputMinDigits !== 0
                            ? "0.".padEnd(innerItem.inputMinDigits + 2, "0")
                            : "0";
                      }

                      changedDataAdj = CellCalculate.processJisRoundingNumber(
                        changedDataAdj,
                        null,
                        null,
                        setValidDigits,
                        setInputMinDigits,
                        setOutputMinDigits,
                        setInputLowLimit
                      );
                    }
                  }

                  // 入力を時刻形式に変換
                  if (item.type == "inputTime") {
                    changedDataAdj = Common.convertToTime(changedDataAdj);
                  }

                  if (checkAbnormalFlg !== 0) {
                    return {
                      ...innerItem,
                      data: changedDataAdj,
                      handleEditData: editFlgChange,
                      abnormalData: checkAbnormalFlg,
                    };
                  } else {
                    return {
                      ...innerItem,
                      data: changedDataAdj,
                      handleEditData: editFlgChange,
                      abnormalData: 0,
                    };
                  }
                } else {
                  return innerItem;
                }
              }),
            };
          } else {
            return item;
          }
        });
      });
      commonState.setMessageMutiLine(errorInfo);

      // セル値の自動設定処理 ※ 2025/08/29 不用
      const adjustNewList = await CellCalculate.checkCalculateFunction(
        changedColumnId,
        changedRowId,
        Number(sideMenuState.useSideMenuSelected.selectedMenuNo), // メニュー番号
        Number(sideMenuState.useSideMenuSelected.selectedDspNo), // 画面番号
        sideMenuState.useSideMenuSelected.selectedMenuName, // 画面名称
        Number(sideMenuState.useSideMenuSelected.inspectionKbnCode), // 検査区分CD
        dataGrid.itemData[changedRowId].itemNo, // 項目番号
        dataGrid.pointData[changedColumnId].pointNo, // 地点番号
        dataGrid.itemData[changedRowId].data[changedColumnId].itemDaiCategoryNo, // 項目大分類番号
        dataGrid.itemData[changedRowId].data[changedColumnId].itemTyuCategoryNo, // 項目中分類番号
        newList,
        changedData
      );

      // 前回値を設定
      gridTableState.setGridTableButtomInfo({
        ...gridTableState.useGridTableButtomInfo,
        prevInputData:
          changedData[0].newCell.type == "text"
            ? // 2025/11/19 修正 文字列も数値も設定できるように
            changedData[0].newCell.text
              ? changedData[0].newCell.text
              : ""
            : gridTableState.useGridTableButtomInfo.prevInputData,
      });

      // 調整データがある場合 ※ 2025/08/29 不用
      newList = adjustNewList ? adjustNewList : newList;

      // データを変える時、変更履歴ステートに追加する
      // 編集中のデータを設定
      gridTableState.setEditingData(newList);

      // 保持データを設定
      const findTempDataLast = newTempData.find((item) => {
        return (
          item.inputMenuNo ==
          sideMenuState.useSideMenuSelected.selectedMenuNo &&
          item.inputSelectDate == menuCalendarState.useSidemenuSelectedDate
        );
      });

      if (!findTempDataLast) {
        newTempData.push({
          inputMenuNo: sideMenuState.useSideMenuSelected.selectedMenuNo,
          inputSelectDate: menuCalendarState.useSidemenuSelectedDate,
          inputEditingData: newList,
          cellChanges: [[newList, gridTableState.columnData]],
          cellChangesIndex: 0,
        });
      } else {
        newTempData.forEach((item, key) => {
          if (
            item.inputMenuNo ==
            sideMenuState.useSideMenuSelected.selectedMenuNo &&
            item.inputSelectDate == menuCalendarState.useSidemenuSelectedDate
          ) {
            item.inputEditingData = newList;
            item.cellChanges.push([newList, gridTableState.columnData]);
            item.cellChangesIndex = item.cellChangesIndex + 1;
          }
        });
      }

      gridTableState.setTempSaveData(newTempData);

      // カレンダーに編集がある日をメモする
      let newStoreEditedDataObj: any = [];
      menuCalendarState.useStoreEditedData.forEach((element: any) => {
        newStoreEditedDataObj.push({
          date: element.date,
          editedFlg:
            menuCalendarState.useSidemenuSelectedDate == element.date
              ? true
              : false,
        });
      });

      // 配列
      menuCalendarState.setStoreEditedData(newStoreEditedDataObj);

      // 異常値のリストに格納する
      addOutLierLists(newList);

      // 編集状態を設定
      commonState.setInputEditingFlg(true);
    }
  };

  /**
   * 方向によって、次のセルにフォーカス設定
   * ※ 2025/11/19 上下左右方向の確定できるように、修正
   *
   * @param location
   * @returns
   */
  const onFocusLocationChanging = (location: CellLocation): boolean => {
    console.log("onFocusLocationChanging");
    
    // (1) enter：入力確定の場合
    if (useActionEvent === "enter") {
      // 入力せずに、エンターを押下すると、前回の値を指定する処理
      const inputType =
        gridTableState.useEditingData[Number(location.rowId) - 1].type;
      const inputData = gridTableState.useGridTableButtomInfo.prevInputData
        ? gridTableState.useGridTableButtomInfo.prevInputData
        : "";

      // テキスト入力の場合
      if (
        inputType == "text" &&
        String(inputData) &&
        (String(inputData) !== "" && String(inputData) !== "○○")
        
      ) {
        const setChanges = [
          {
            previousCell: {
              type: "text",
              text: "",
              nonEditable: false,
              className: "",
              value: null,
              placeholder: "",
            },
            newCell: {
              type: "text",
              text: String(inputData),
              nonEditable: false,
              className: "",
              value: Number(inputData),
              placeholder: "",
            },
            type: "text",
            rowId: Number(location.rowId) - 1,
            columnId: Number(location.columnId),
          },
        ];

        enterToSetPreviousData(setChanges);
      }

      // (1)-1 column：次の列のセルに移動（右）
      if (gridTableState.useEnterToCell == "column") {
        // (1)-1-1 最後列の場合
        if (Number(location.columnId) + 1 >= useMaxColumnRow.maxColumn) {
          if (
            !gridTableState.useEditingData[Number(location.rowId)].data[0]
              .dataDisable
          ) {
            // (1)-1-1-1 マスクでは無い場合
            setFocusedLocation({ rowId: location.rowId, columnId: 0 });
          } else {
            // (1)-1-1-2 マスクの場合
            let endLoop: boolean = false;
            let nextColumn: number = 0;
            let nextRow: number = 0;
            let curColumn: number = 0;

            // 次にセルを確認するループ
            do {
              nextColumn += 1;

              // (1)-1-1-2-1 最後列の場合
              if (Number(curColumn) + nextColumn >= useMaxColumnRow.maxColumn) {

                nextRow += 1;
                if (
                  !gridTableState.useEditingData[
                    Number(location.rowId) + nextRow
                  ].data[0].dataDisable
                ) {
                  setFocusedLocation({
                    rowId: Number(location.rowId) + nextRow,
                    columnId: 0,
                  });

                  // ループ中断
                  endLoop = true;
                }
              } else {
                // (1)-1-1-2-2 最後列ではない場合
                if (
                  !gridTableState.useEditingData[
                    Number(location.rowId) + nextRow
                  ].data[Number(curColumn) + nextColumn].dataDisable
                ) {
                  setFocusedLocation({
                    rowId: Number(location.rowId) + nextRow,
                    columnId: Number(curColumn) + nextColumn,
                  });

                  // ループ中断
                  endLoop = true;
                }
              }
            } while (!endLoop);
          }
        } else {
          // (1)-1-2 最後列ではない場合
          if (
            !gridTableState.useEditingData[Number(location.rowId) - 1].data[
              Number(location.columnId) + 1
            ].dataDisable
          ) {
            // (1)-1-2-1 マスクでは無い場合
            setFocusedLocation({
              rowId: Number(location.rowId) - 1,
              columnId: Number(location.columnId) + 1,
            });
          } else {
            // (1)-1-2-2 マスクの場合
            let endLoop: boolean = false;
            let nextColumn: number = 0;
            let nextRow: number = -1;

            // 次にセルを確認するループ
            do {
              nextColumn += 1;

              // (1)-1-2-2-1 最後列の場合
              if (
                Number(location.columnId) + nextColumn >=
                useMaxColumnRow.maxColumn
              ) {
                nextRow += 1;
                if (
                  !gridTableState.useEditingData[
                    Number(location.rowId) + nextRow
                  ].data[0].dataDisable
                ) {
                  setFocusedLocation({
                    rowId: Number(location.rowId) + nextRow,
                    columnId: 0,
                  });

                  // ループ中断
                  endLoop = true;
                }
              } else {
                // (1)-1-2-2-2 最後列ではない場合
                if (
                  !gridTableState.useEditingData[
                    Number(location.rowId) + nextRow
                  ].data[Number(location.columnId) + nextColumn].dataDisable
                ) {
                  setFocusedLocation({
                    rowId: Number(location.rowId) + nextRow,
                    columnId: Number(location.columnId) + nextColumn,
                  });

                  // ループ中断
                  endLoop = true;
                }
              }
            } while (!endLoop);
          }
        }
      } else {
        // (1)-2 row：次の行のセルに移動（下）
        if (
          !gridTableState.useEditingData[Number(location.rowId)].data[
            Number(location.columnId)
          ].dataDisable
        ) {
          // (1)-2-1 マスクでは無い場合
          setFocusedLocation({
            rowId: location.rowId,
            columnId: location.columnId,
          });
        } else {
          // (1)-2-2 マスクの場合
          let endLoop: boolean = false;
          let nextRow: number = 0;
          do {
            nextRow += 1;
            if (
              !gridTableState.useEditingData[Number(location.rowId) + nextRow]
                .data[location.columnId].dataDisable
            ) {
              setFocusedLocation({
                rowId: Number(location.rowId) + nextRow,
                columnId: location.columnId,
              });

              // ループ中断
              endLoop = true;
            }
          } while (!endLoop);
        }
      }
    } else if (useActionEvent === "ArrowUp") {
      // (1)-2 row：次の行のセルに移動（上）
      if (
        !gridTableState.useEditingData[Number(location.rowId)].data[
          Number(location.columnId)
        ].dataDisable
      ) {
        // (1)-2-1 マスクでは無い場合
        setFocusedLocation({
          rowId: Number(location.rowId) - 2,
          columnId: location.columnId,
        });
      } else {
        // (1)-2-2 マスクの場合
        let endLoop: boolean = false;
        let nextRow: number = 0;
        do {
          nextRow -= 1;
          if (
            !gridTableState.useEditingData[Number(location.rowId) + nextRow]
              .data[location.columnId].dataDisable
          ) {
            setFocusedLocation({
              rowId: Number(location.rowId) + nextRow,
              columnId: location.columnId,
            });

            // ループ中断
            endLoop = true;
          }
        } while (!endLoop);
      }
    } else if (useActionEvent === "ArrowDown") {
      // (1)-2 row：次の行のセルに移動（下）
      if (
        !gridTableState.useEditingData[Number(location.rowId)].data[
          Number(location.columnId)
        ].dataDisable
      ) {
        // (1)-2-1 マスクでは無い場合
        setFocusedLocation({
          rowId: location.rowId,
          columnId: location.columnId,
        });
      } else {
        // (1)-2-2 マスクの場合
        let endLoop: boolean = false;
        let nextRow: number = 0;
        do {
          nextRow += 1;
          if (
            !gridTableState.useEditingData[Number(location.rowId) + nextRow]
              .data[location.columnId].dataDisable
          ) {
            setFocusedLocation({
              rowId: Number(location.rowId) + nextRow,
              columnId: location.columnId,
            });

            // ループ中断
            endLoop = true;
          }
        } while (!endLoop);
      }
    } else if (useActionEvent === "ArrowLeft") {
      // (1)-1-1 最初列の場合
      if (Number(location.columnId) == 0) {
        if (
          !gridTableState.useEditingData[Number(location.rowId) - 2].data[
            useMaxColumnRow.maxColumn - 1
          ].dataDisable
        ) {
          // (1)-1-1-1 マスクでは無い場合
          setFocusedLocation({
            rowId: Number(location.rowId) - 2,
            columnId: useMaxColumnRow.maxColumn - 1,
          });
        } else {
          // (1)-1-1-2 マスクの場合
          let endLoop: boolean = false;
          let prevColumn: number = useMaxColumnRow.maxColumn;
          let prevRow: number = -2;

          // 次にセルを確認するループ
          do {
            prevColumn -= 1;
            // (1)-1-1-2-1 最初列の場合
            if (prevColumn == 0) {
              prevRow -= 1;

              if (
                !gridTableState.useEditingData[Number(location.rowId) + prevRow]
                  .data[prevColumn].dataDisable
              ) {
                setFocusedLocation({
                  rowId: Number(location.rowId) + prevRow,
                  columnId: Number(useMaxColumnRow.maxColumn - 1),
                });

                // ループ中断
                endLoop = true;
              } else {
                prevRow -= 1;
                prevColumn = useMaxColumnRow.maxColumn - 1;
              }
            } else {
              // (1)-1-1-2-2 最初列ではない場合
              if (
                !gridTableState.useEditingData[Number(location.rowId) + prevRow]
                  .data[prevColumn].dataDisable
              ) {
                setFocusedLocation({
                  rowId: Number(location.rowId) + prevRow,
                  columnId: prevColumn,
                });

                // ループ中断
                endLoop = true;
              }
            }
          } while (!endLoop);
        }
      } else {
        // (1)-1-2 最初列ではない場合
        if (
          !gridTableState.useEditingData[Number(location.rowId) - 1].data[
            Number(location.columnId) - 1
          ].dataDisable
        ) {
          // (1)-1-2-1 マスクでは無い場合
          setFocusedLocation({
            rowId: Number(location.rowId) - 1,
            columnId: Number(location.columnId) - 1, // 左方向に移動
          });
        } else {
          // (1)-1-2-2 マスクの場合
          let endLoop: boolean = false;
          let prevColumn: number = Number(location.columnId);
          let prevRow: number = -1;

          // 次にセルを確認するループ
          do {
            prevColumn -= 1;

            // (1)-1-2-2-1 最初列の場合
            if (prevColumn == 0) {
              prevRow -= 1;
              if (
                !gridTableState.useEditingData[Number(location.rowId) + prevRow]
                  .data[useMaxColumnRow.maxColumn - 1].dataDisable
              ) {
                setFocusedLocation({
                  rowId: Number(location.rowId) + prevRow,
                  columnId: useMaxColumnRow.maxColumn - 1,
                });

                // ループ中断
                endLoop = true;
              } else {
                // 列位置をリセット
                prevColumn = useMaxColumnRow.maxColumn - 1;
              }
            } else {
              // (1)-1-2-2-2 最初列ではない場合
              if (
                !gridTableState.useEditingData[Number(location.rowId) + prevRow]
                  .data[prevColumn].dataDisable
              ) {
                setFocusedLocation({
                  rowId: Number(location.rowId) + prevRow,
                  columnId: prevColumn,
                });

                // ループ中断
                endLoop = true;
              }

              // 列位置をリセット
              if (Number(location.columnId) + prevColumn == 0) {
                prevColumn = useMaxColumnRow.maxColumn - 1;
              }
            }
          } while (!endLoop);
        }
      }
    } else if (useActionEvent === "ArrowRight") {
      // (1)-1-1 最後列の場合
      if (Number(location.columnId) + 1 >= useMaxColumnRow.maxColumn) {
        if (!gridTableState.useEditingData[Number(location.rowId)].data[0].dataDisable) {
          // (1)-1-1-1 マスクでは無い場合
          setFocusedLocation({ rowId: location.rowId, columnId: 0 });
        } else {
          // (1)-1-1-2 マスクの場合
          let endLoop: boolean = false;
          let nextColumn: number = 0;
          let nextRow: number = 0;
          let curColumn: number = 0;

          // 次にセルを確認するループ
          do {
            nextColumn += 1;

            // (1)-1-1-2-1 最後列の場合
            if (Number(curColumn) + nextColumn >= useMaxColumnRow.maxColumn) {

              nextRow += 1;
              if (!gridTableState.useEditingData[Number(location.rowId) + nextRow].data[0].dataDisable) {
                setFocusedLocation({
                  rowId: Number(location.rowId) + nextRow,
                  columnId: 0,
                });

                // ループ中断
                endLoop = true;
              }
            } else {
              // (1)-1-1-2-2 最後列ではない場合
              if (!gridTableState.useEditingData[Number(location.rowId) + nextRow].data[Number(curColumn) + nextColumn].dataDisable) {
                setFocusedLocation({
                  rowId: Number(location.rowId) + nextRow,
                  columnId: Number(curColumn) + nextColumn,
                });

                // ループ中断
                endLoop = true;
              }
            }
          } while (!endLoop);
        }
      } else {
        // (1)-1-2 最後列ではない場合
        if (
          !gridTableState.useEditingData[Number(location.rowId) - 1].data[
            Number(location.columnId) + 1
          ].dataDisable
        ) {
          // (1)-1-2-1 マスクでは無い場合
          setFocusedLocation({
            rowId: Number(location.rowId) - 1,
            columnId: Number(location.columnId) + 1,
          });
        } else {
          // (1)-1-2-2 マスクの場合
          let endLoop: boolean = false;
          let nextColumn: number = 0;
          let nextRow: number = -1;

          // 次にセルを確認するループ
          do {
            nextColumn += 1;

            // (1)-1-2-2-1 最後列の場合
            if (
              Number(location.columnId) + nextColumn >=
              useMaxColumnRow.maxColumn
            ) {
              nextRow += 1;
              if (
                !gridTableState.useEditingData[Number(location.rowId) + nextRow]
                  .data[0].dataDisable
              ) {
                setFocusedLocation({
                  rowId: Number(location.rowId) + nextRow,
                  columnId: 0,
                });

                // ループ中断
                endLoop = true;
              }
            } else {
              // (1)-1-2-2-2 最後列ではない場合
              if (
                !gridTableState.useEditingData[Number(location.rowId) + nextRow]
                  .data[Number(location.columnId) + nextColumn].dataDisable
              ) {
                setFocusedLocation({
                  rowId: Number(location.rowId) + nextRow,
                  columnId: Number(location.columnId) + nextColumn,
                });

                // ループ中断
                endLoop = true;
              }
            }
          } while (!endLoop);
        }
      }
    } else {
      // (2) クリック・その他のイベント等の場合
      if (
        !gridTableState.useEditingData[location.rowId].data[location.columnId]
          .dataDisable
      ) {
        setFocusedLocation({
          rowId: location.rowId,
          columnId: location.columnId,
        });
      } else {
        return false;
      }
    }

    // 操作イベントをクリア
    setActionEvent("");
    return true;
  };

  /**
   * 一番下の行の方向移動処理
   *
   * @param actionEvent
   * @returns
   */
  const onFocusLocationChangingLastLine = async (actionEvent: string) => {
    const curColumnId = gridTableState.useCurFocusColumn;
    const curRowId = gridTableState.useCurFocusRow;

    // (1) enter：入力確定の場合
    if (actionEvent === "enter") {
      // (1)-1 column：次の列のセルに移動（右）
      if (gridTableState.useEnterToCell == "column") {
        // (1)-1-1 最後列の場合
        if (Number(curColumnId) + 1 >= useMaxColumnRow.maxColumn) {
          if (
            !gridTableState.useEditingData[Number(curRowId)].data[0].dataDisable
          ) {
            // (1)-1-1-1 マスクでは無い場合
            setFocusedLocation({ rowId: curRowId, columnId: 0 });
          } else {
            // (1)-1-1-2 マスクの場合
            let endLoop: boolean = false;
            let nextColumn: number = 0;
            let nextRow: number = -1;

            // 次にセルを確認するループ
            do {
              nextColumn += 1;

              // (1)-1-1-2-1 最後列の場合
              if (
                Number(curColumnId) + nextColumn >=
                useMaxColumnRow.maxColumn
              ) {
                nextRow += 1;
                if (
                  !gridTableState.useEditingData[Number(curRowId) + nextRow]
                    .data[0].dataDisable
                ) {
                  setFocusedLocation({
                    rowId: Number(curRowId) + nextRow,
                    columnId: 0,
                  });

                  // ループ中断
                  endLoop = true;
                }
              } else {
                // (1)-1-1-2-2 最後列ではない場合
                if (
                  !gridTableState.useEditingData[Number(curRowId) + nextRow]
                    .data[Number(curColumnId) + nextColumn].dataDisable
                ) {
                  setFocusedLocation({
                    rowId: Number(curRowId) + nextRow,
                    columnId: Number(curColumnId) + nextColumn,
                  });

                  // ループ中断
                  endLoop = true;
                }
              }
            } while (!endLoop);
          }
        } else {
          // (1)-1-2 最後列ではない場合
          if (
            !gridTableState.useEditingData[Number(curRowId) - 1].data[
              Number(curColumnId) + 1
            ].dataDisable
          ) {
            // (1)-1-2-1 マスクでは無い場合
            setFocusedLocation({
              rowId: Number(curRowId) - 1,
              columnId: Number(curColumnId) + 1,
            });
          } else {
            // (1)-1-2-2 マスクの場合
            let endLoop: boolean = false;
            let nextColumn: number = 0;
            let nextRow: number = -1;

            // 次にセルを確認するループ
            do {
              nextColumn += 1;

              // (1)-1-2-2-1 最後列の場合
              if (
                Number(curColumnId) + nextColumn >=
                useMaxColumnRow.maxColumn
              ) {
                nextRow += 1;
                if (
                  !gridTableState.useEditingData[Number(curRowId) + nextRow]
                    .data[0].dataDisable
                ) {
                  setFocusedLocation({
                    rowId: Number(curRowId) + nextRow,
                    columnId: 0,
                  });

                  // ループ中断
                  endLoop = true;
                }
              } else {
                // (1)-1-2-2-2 最後列ではない場合
                if (
                  !gridTableState.useEditingData[Number(curRowId) + nextRow]
                    .data[Number(curColumnId) + nextColumn].dataDisable
                ) {
                  setFocusedLocation({
                    rowId: Number(curRowId) + nextRow,
                    columnId: Number(curColumnId) + nextColumn,
                  });

                  // ループ中断
                  endLoop = true;
                }
              }
            } while (!endLoop);
          }
        }
      } else {
        // (1)-2 row：次の行のセルに移動（下）
        if (
          !gridTableState.useEditingData[Number(curRowId)].data[
            Number(curColumnId)
          ].dataDisable
        ) {
          // (1)-2-1 マスクでは無い場合
          setFocusedLocation({
            rowId: curRowId,
            columnId: curColumnId,
          });
        } else {
          // (1)-2-2 マスクの場合
          let endLoop: boolean = false;
          let nextRow: number = 0;
          do {
            nextRow += 1;
            if (
              !gridTableState.useEditingData[Number(curRowId) + nextRow].data[
                curColumnId
              ].dataDisable
            ) {
              setFocusedLocation({
                rowId: Number(curRowId) + nextRow,
                columnId: curColumnId,
              });

              // ループ中断
              endLoop = true;
            }
          } while (!endLoop);
        }
      }
    } else if (actionEvent === "ArrowUp") {
      // (1)-2 row：次の行のセルに移動（上）
      if (
        !gridTableState.useEditingData[Number(curRowId)].data[
          Number(curColumnId)
        ].dataDisable
      ) {
        // (1)-2-1 マスクでは無い場合
        setFocusedLocation({
          rowId: Number(curRowId) - 1,
          columnId: curColumnId,
        });
      } else {
        // (1)-2-2 マスクの場合
        let endLoop: boolean = false;
        let nextRow: number = 0;
        do {
          nextRow -= 1;
          if (
            !gridTableState.useEditingData[Number(curRowId) + nextRow].data[
              curColumnId
            ].dataDisable
          ) {
            setFocusedLocation({
              rowId: Number(curRowId) + nextRow,
              columnId: curColumnId,
            });

            // ループ中断
            endLoop = true;
          }
        } while (!endLoop);
      }
    } else if (actionEvent === "ArrowLeft") {
      // (1)-1-1 最初列の場合
      if (Number(curColumnId) == 0) {
        if (
          !gridTableState.useEditingData[Number(curRowId) - 1].data[
            useMaxColumnRow.maxColumn - 1
          ].dataDisable
        ) {
          // (1)-1-1-1 マスクでは無い場合
          setFocusedLocation({
            rowId: Number(curRowId) - 1,
            columnId: useMaxColumnRow.maxColumn - 1,
          });
        } else {
          // (1)-1-1-2 マスクの場合
          let endLoop: boolean = false;
          let prevColumn: number = useMaxColumnRow.maxColumn;
          let prevRow: number = -1;

          // 次にセルを確認するループ
          do {
            prevColumn -= 1;

            // (1)-1-1-2-1 最初列の場合
            if (prevColumn == 0) {
              if (
                !gridTableState.useEditingData[Number(curRowId) + prevRow].data[
                  prevColumn
                ].dataDisable
              ) {
                setFocusedLocation({
                  rowId: Number(curRowId) + prevRow,
                  columnId: 0,
                });

                // ループ中断
                endLoop = true;
              } else {
                prevRow -= 1;
                prevColumn = useMaxColumnRow.maxColumn - 1;
              }
            } else {
              // (1)-1-1-2-2 最初列ではない場合
              if (
                !gridTableState.useEditingData[Number(curRowId) + prevRow].data[
                  prevColumn
                ].dataDisable
              ) {
                setFocusedLocation({
                  rowId: Number(curRowId) + prevRow,
                  columnId: Number(curColumnId) + prevColumn,
                });

                // ループ中断
                endLoop = true;
              }
            }
          } while (!endLoop);
        }
      } else {
        // (1)-1-2 最初列ではない場合
        if (
          !gridTableState.useEditingData[Number(curRowId)].data[
            Number(curColumnId) - 1
          ].dataDisable
        ) {
          // (1)-1-2-1 マスクでは無い場合
          setFocusedLocation({
            rowId: Number(curRowId),
            columnId: Number(curColumnId) - 1, // 左方向に移動
          });
        } else {
          // (1)-1-2-2 マスクの場合
          let endLoop: boolean = false;
          let prevColumn: number = Number(curColumnId);
          let prevRow: number = -1;

          // 次にセルを確認するループ
          do {
            prevColumn -= 1;

            // (1)-1-2-2-1 最初列の場合
            if (prevColumn == 0) {
              prevRow -= 1;
              if (
                !gridTableState.useEditingData[Number(curRowId) + prevRow].data[
                  useMaxColumnRow.maxColumn - 1
                ].dataDisable
              ) {
                setFocusedLocation({
                  rowId: Number(curRowId) + prevRow,
                  columnId: useMaxColumnRow.maxColumn - 1,
                });

                // ループ中断
                endLoop = true;
              } else {
                // 列位置をリセット
                prevColumn = useMaxColumnRow.maxColumn - 1;
              }
            } else {
              // (1)-1-2-2-2 最初列ではない場合
              if (
                !gridTableState.useEditingData[Number(curRowId) + prevRow].data[
                  prevColumn
                ].dataDisable
              ) {
                setFocusedLocation({
                  rowId: Number(curRowId) + prevRow,
                  columnId: prevColumn,
                });

                // ループ中断
                endLoop = true;
              }

              // 列位置をリセット
              if (Number(curColumnId) + prevColumn == 0) {
                prevColumn = useMaxColumnRow.maxColumn - 1;
              }
            }
          } while (!endLoop);
        }
      }
    } else if (actionEvent === "ArrowRight") {
      // (1)-1-1 最後列の場合
      if (Number(curColumnId) + 1 < useMaxColumnRow.maxColumn) {
        // (1)-1-2 最後列ではない場合
        if (
          !gridTableState.useEditingData[Number(curRowId) - 1].data[
            Number(curColumnId) + 1
          ].dataDisable
        ) {
          // (1)-1-2-1 マスクでは無い場合
          setFocusedLocation({
            rowId: Number(curRowId),
            columnId: Number(curColumnId) + 1,
          });
        } else {
          // (1)-1-2-2 マスクの場合
          let endLoop: boolean = false;
          let nextColumn: number = 0;

          // 次にセルを確認するループ
          do {
            nextColumn += 1;

            // (1)-1-2-2-1 最後列の場合
            if (Number(curColumnId) + nextColumn >= useMaxColumnRow.maxColumn) {
              // ループ中断
              endLoop = true;
            } else {
              // (1)-1-2-2-2 最後列ではない場合
              if (
                !gridTableState.useEditingData[Number(curRowId)].data[
                  Number(curColumnId) + nextColumn
                ].dataDisable &&
                Number(curColumnId) + nextColumn !== useMaxColumnRow.maxColumn
              ) {
                setFocusedLocation({
                  rowId: Number(curRowId),
                  columnId: Number(curColumnId) + nextColumn,
                });

                // ループ中断
                endLoop = true;
              } else if (
                !gridTableState.useEditingData[Number(curRowId)].data[
                  Number(curColumnId) + nextColumn
                ].dataDisable &&
                Number(curColumnId) + nextColumn == useMaxColumnRow.maxColumn
              ) {
                // ループ中断
                endLoop = true;
              }
            }
          } while (!endLoop);
        }
      }
    } else {
      // (2) クリック・その他のイベント等の場合
      if (
        !gridTableState.useEditingData[curRowId].data[curColumnId].dataDisable
      ) {
        setFocusedLocation({
          rowId: curRowId,
          columnId: curColumnId,
        });
      } else {
        return false;
      }
    }

    // 操作イベントをクリア
    setActionEvent("");
    return true;
  };

  return (
    <>
      <div
        id="grid-table-panel"
        className={`${cssGridTable.grid_table_panel} ${gridTableState.useInputFixedFlg ? "" : "grid_input_fixed"
          }`}
        // 入力履歴管理
        onKeyDown={(e) => {
          if ((!isMacOs() && e.ctrlKey) || e.metaKey) {
            switch (e.key) {
              // 元に戻す
              case "z":
                handleUndoChanges();
                return;
              // やり直す
              case "y":
                handleRedoChanges();
                return;
            }
          }
        }}
        onClick={() => {
          setActionEvent("click");
          setFocusInfo(null);
        }}
        // 入力開始
        onDoubleClick={() => {
          setCurFocusCnt(useCurFocusCnt + 1);
        }}
        // 入力確定
        onKeyDownCapture={async (e) => {
          setActionEvent("");
          if (e.key == "Enter") {
            setActionEvent("enter");
            setCurFocusCnt(useCurFocusCnt + 1);
          } else if (e.key == "ArrowUp") {
            // 上方向に確定
            if (document.getElementsByClassName("rg-input")[0]) {
              setActionEvent("ArrowUp");
              setCurFocusCnt(useCurFocusCnt + 1);
              if (
                gridTableState.useEditingData.length ==
                gridTableState.useCurFocusRow + 1
              ) {
                // 一番下の行の処置
                const keyDownEvent = new KeyboardEvent("keydown", {
                  key: "Enter",
                  code: "Enter",
                  keyCode: 13, // エンターキコード確定
                  bubbles: true,
                });
                setTimeout(async () => {
                  document
                    .getElementsByClassName("rg-input")[0]
                    .dispatchEvent(keyDownEvent);
                  await onFocusLocationChangingLastLine("ArrowUp");
                }, 100);
              } else {
                // 一番下の行以前の処置
                const keyDownEvent = new KeyboardEvent("keydown", {
                  key: "Enter",
                  code: "Enter",
                  keyCode: 13, // エンターキコード
                  bubbles: true,
                });
                setTimeout(() => {
                  document
                    .getElementsByClassName("rg-input")[0]
                    .dispatchEvent(keyDownEvent);
                }, 100);
              }
            }
          } else if (e.key == "ArrowDown") {
            // 下方向に確定
            if (document.getElementsByClassName("rg-input")[0]) {
              setActionEvent("ArrowDown");
              setCurFocusCnt(useCurFocusCnt + 1);
              if (
                gridTableState.useEditingData.length ==
                gridTableState.useCurFocusRow + 1
              ) {
                // 一番下の行の処置（下に移動できない）
                const keyDownEvent = new KeyboardEvent("keydown", {
                  key: "Enter",
                  code: "Enter",
                  keyCode: 13, // エンターキコード確定
                  bubbles: true,
                });
                setTimeout(async () => {
                  document
                    .getElementsByClassName("rg-input")[0]
                    .dispatchEvent(keyDownEvent);
                }, 100);
              } else {
                // 一番下の行以前の処置
                const keyDownEvent = new KeyboardEvent("keydown", {
                  key: "Enter",
                  code: "Enter",
                  keyCode: 13, // エンターキコード
                  bubbles: true,
                });
                setTimeout(() => {
                  document
                    .getElementsByClassName("rg-input")[0]
                    .dispatchEvent(keyDownEvent);
                }, 100);
              }
            }
          } else if (e.key == "ArrowLeft") {
            // 左方向に確定
            if (document.getElementsByClassName("rg-input")[0]) {
              const myInput: any =
                document.getElementsByClassName("rg-input")[0];
              if (typeof myInput.selectionStart === "number") {
                const position = myInput.selectionStart;

                if (position === 0) {
                  setActionEvent("ArrowLeft");
                  setCurFocusCnt(useCurFocusCnt + 1);
                  if (
                    gridTableState.useEditingData.length ==
                    gridTableState.useCurFocusRow + 1
                  ) {
                    // 一番下の行の処置
                    const keyDownEvent = new KeyboardEvent("keydown", {
                      key: "Enter",
                      code: "Enter",
                      keyCode: 13, // エンターキコード確定
                      bubbles: true,
                    });
                    setTimeout(async () => {
                      document
                        .getElementsByClassName("rg-input")[0]
                        .dispatchEvent(keyDownEvent);
                      await onFocusLocationChangingLastLine("ArrowLeft");
                    }, 100);
                  } else {
                    // 一番下の行以前の処置
                    const keyDownEvent = new KeyboardEvent("keydown", {
                      key: "Enter",
                      code: "Enter",
                      keyCode: 13, // エンターキコード
                      bubbles: true,
                    });
                    setTimeout(() => {
                      document
                        .getElementsByClassName("rg-input")[0]
                        .dispatchEvent(keyDownEvent);
                    }, 100);
                  }
                }
              }
            }
          } else if (e.key == "ArrowRight") {
            // 右方向に確定
            if (document.getElementsByClassName("rg-input")[0]) {
              const myInput: any =
                document.getElementsByClassName("rg-input")[0];
              if (typeof myInput.selectionStart === "number") {
                const position = myInput.selectionStart;
                if (position === myInput.value.length) {
                  setActionEvent("ArrowRight");
                  setCurFocusCnt(useCurFocusCnt + 1);
                  if (
                    gridTableState.useEditingData.length ==
                    gridTableState.useCurFocusRow + 1
                  ) {
                    // 一番下の行の処置
                    const keyDownEvent = new KeyboardEvent("keydown", {
                      key: "Enter",
                      code: "Enter",
                      keyCode: 13, // エンターキコード確定
                      bubbles: true,
                    });
                    setTimeout(async () => {
                      document
                        .getElementsByClassName("rg-input")[0]
                        .dispatchEvent(keyDownEvent);
                      await onFocusLocationChangingLastLine("ArrowRight");
                    }, 100);
                  } else {
                    // 一番下の行以前の処置
                    const keyDownEvent = new KeyboardEvent("keydown", {
                      key: "Enter",
                      code: "Enter",
                      keyCode: 13, // エンターキコード
                      bubbles: true,
                    });
                    setTimeout(() => {
                      document
                        .getElementsByClassName("rg-input")[0]
                        .dispatchEvent(keyDownEvent);
                    }, 100);
                  }
                }
              }
            }
          } else {
            // セルに上記のキー以外を押下する時、入力フラグをtrueに設定
            setInputingFlg(true);
          }
        }}
      >
        <ReactGrid
          rows={rows}
          columns={columnSetting}
          labels={customLabels}
          onCellsChanged={handleChanges}
          onColumnResized={handleColumnResize}
          onContextMenu={simpleHandleContextMenu}
          onFocusLocationChanging={onFocusLocationChanging}
          onFocusLocationChanged={async (location: CellLocation) => {
            handleFocusChange(location);
          }}
          // onFocusLocationChanged={async (location: CellLocation) => {
          //   // フォーカスリセット
          //   setFocusInfo(null);
          //   setCurFocusInfo(null);

          //   setCurFocusInfo(location);
          //   handleFocusChange(location);
          // }}
          customCellTemplates={{
            select: new SelectCellTemplate(),
            timeEditor: new TimeCellTemplate(),
            textArea: new TextAreaCellTemplate(),
            dateEditor: new DateEditorTemplate(),
            combobox: new ComboBoxCellTemplate(),
            htmlToText: new HtmlToTextCellTemplate(),
          }}
          // onColumnsReordered={handleColumnsReorder}
          // onRowsReordered={handleRowsReorder}
          // canReorderRows={handleCanReorderRows}
          focusLocation={focusedLocation}
          stickyLeftColumns={1}
          stickyTopRows={3}
          enableFillHandle
          enableRangeSelection
          enableRowSelection
          enableColumnSelection
        />
        {/* {CellCalculate.processJisRoundingNumber(66657.72, null, null, 5, -2)} */}
      </div>
      {/* {useOutlinerModalShowFlg && <OutlierListModal />} */}
    </>
  );
};
