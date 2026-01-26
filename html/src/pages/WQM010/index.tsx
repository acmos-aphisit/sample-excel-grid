import React from "react";
import { Api, getMessage } from "../../common/api";
import { useLocation } from "react-router-dom";
import { useAtom, useSetAtom } from "jotai";
import {
  Button,
  GridTable,
  MessageArea,
  MessageMutiLineArea,
  ConfirmDialog,
} from "../../components/common";
import { useQuery, useMutation, useQueryClient, useIsFetching } from "@tanstack/react-query";
import { CommonStateContainer } from '../../components/containers/commonStateContainer';
import { SideMenuStateContainer } from '../../components/containers/sideMenuStateContainer';
import { MenuCalendarStateContainer } from '../../components/containers/menuCalendarContainer';
import { ConfirmDialogStateContainer } from '../../components/containers/confirmDialogStateContainer';
import { GridTableStateContainer } from '../../components/containers/gridTableStateContainer';
import { InputRegisterStateContainer } from '../../components/containers/inputRegisterStateContainer';
import { TrendModalStateContainer } from '../../components/containers/trendModalStateContainer';
import parse from 'html-react-parser';

// 日時管理ライブラリー
import moment from "moment";

// フッター
import Footer from "../../components/layouts/footer/footer";

import * as Common from "../../common/common";
import * as Const from "../../common/const";
import * as AtomCommon from "../../stores/atom";
import * as AtomSideMenu from "../../stores/atomSideMenu";
import * as AtomInputRegister from "../../stores/atomWQM010";
import * as AtomTrend from "../../stores/atomTrendModal";

// モーダルコンポ
import {
  ExcelFileUploadModal,
  TrendModal,
} from "../../components/modals//index";

// サイドメニュー
import SideMenu from "../../components/layouts/sidemenu";

// CSS
import cssWQM010 from "../../scss/pages/WQM010.module.scss";

import Loading from "../../components/layouts/loading";

// サイドメニュー_カレンダー
import * as AtomSideMenuCalendar from "../../stores/atomSidemenuCalendar";

//【ステート】確認ダイアログ
import * as AtomConfirmDialog from "../../stores/atomConfirmDialog";

//【コンポネント】異常値一覧のモダール
import { OutlierListModal } from "../../components/modals/outlierListModal";

// フッターの部分_[子コンポネント]
const WQM010Footer = ({ sideMenuState, commonState, menuCalendarState, inputRegisterState, gridTableState, confirmDialog, trendModalState }): JSX.Element => {
  /**
   * ローカルステート
   *
   */
  const [useValidatedData, setValidatedData] = React.useState<any>([]); // 検証完了の登録データ

  /**
   * クエリクライアント_他のコンポネントの関数を実行する為
   *  
   */
  const queryClient = useQueryClient(); // 外部関数を呼び出すクエリクライアント
  const isFetchingInputItems = useIsFetching({ queryKey: ["fetchInputItems"] }); // データ取得中の状態

  // 登録処理実施
  useQuery({
    queryKey: ['validateDaveInputQuery'],
    queryFn: async () => {
      if (commonState.useInputEditingFlg) {
        await validateSaveInputData();
      }
    }
  });

  // 登録するデータ検証
  const validateSaveInputData = async () => {
    // データ検証
    setValidatedData([]);

    if (commonState.useInputEditingFlg) {
      // 採水時刻情報を設定
      let setSaisuiTimeData: any = [];
      let allNullArray: any = [];
      let checkSaisuiDateExist: boolean[] = [];

      gridTableState.useTempSaveData.forEach((item, key) => {
        item.inputEditingData.forEach((data) => {
          if (data.itemNo == Const.SAISUI_TIME_ITEM_NO) {
            data.data.forEach((chkTime, chkTimeKey) => {
              // NULL確認
              let isNull: boolean = false;
              let checkValidDate: boolean = true;
              switch (data.type) {
                case "date":
                case "dateEditor":
                  isNull = moment(chkTime.data, "YYYY-MM-DD", true).isValid()
                    ? false
                    : true;

                  checkValidDate = moment(
                    chkTime.data,
                    "YYYY-MM-DD",
                    true
                  ).isValid();
                  break;
                case "time":
                  isNull = moment(chkTime.data, "YYYY-MM-DD", true).isValid()
                    ? false
                    : true;

                  checkValidDate = moment(
                    chkTime.data,
                    "YYYY-MM-DD",
                    true
                  ).isValid();
                  break;
                case "inputTime":
                  isNull = Common.isTimeFormatted(chkTime.data) ? false : true;

                  checkValidDate = Common.isTimeFormatted(chkTime.data);
                  break;

                default:
                  isNull = chkTime.data ? false : true;
                  break;
              }

              // NULLの場合
              if (isNull) {
                allNullArray[chkTimeKey] = allNullArray[chkTimeKey]
                  ? allNullArray[chkTimeKey] + 1
                  : 1;
              }

              if (checkValidDate) {
                // 採水時刻設定
                let setSaisuiTimeChanged: boolean = false;

                // 変更フラグ確認
                if (chkTime.handleData && chkTime.handleEditData) {
                  setSaisuiTimeChanged = true;
                }

                setSaisuiTimeData.push({
                  pointNo: chkTime.pointNo,
                  saisuiTime: chkTime.data,
                  saisuiTimeChanged: setSaisuiTimeChanged,
                });
              }
            });
          } else {
            data.data.forEach((chkPoint, chkPointKey) => {
              // NULL確認
              let isNull: boolean = false;
              switch (data.type) {
                case "date":
                case "dateEditor":
                  isNull = moment(chkPoint.data, "YYYY-MM-DD", true).isValid()
                    ? false
                    : true;
                  break;
                case "time":
                  isNull = moment(chkPoint.data, "YYYY-MM-DD", true).isValid()
                    ? false
                    : true;
                  break;
                case "inputTime":
                  isNull = Common.isTimeFormatted(chkPoint.data) ? false : true;
                  break;

                default:
                  isNull = chkPoint.data ? false : true;
                  break;
              }

              // NULLの場合
              if (isNull) {
                allNullArray[chkPointKey] = allNullArray[chkPointKey]
                  ? allNullArray[chkPointKey] + 1
                  : 1;
              }

              // 採水年月日有無を確認
              if (data.itemNo == Const.SAISUI_DATE_ITEM_NO) {
                checkSaisuiDateExist[chkPointKey] = !isNull ? true : false;
              }
            });
          }
        });
      });

      // 登録リクエスト配列
      let setDataToSave: any = [];
      let errorCnt: number = 0;

      // データ加工
      gridTableState.useTempSaveData.forEach((item, key) => {
        let setDataByItem: any = [];

        item.inputEditingData.forEach((data) => {
          let setDataByPoint: any = [];

          // 地点基づく配列データ
          data.data.forEach((point, pointKey) => {
            let pointData = point.data;

            // 日付・時刻のフォマード変換
            if (pointData) {
              if (data.type == "date" || data.type == "dateEditor") {
                pointData = moment(pointData).format("YYYY/MM/DD");
              } else if (data.type == "time") {
                pointData = moment(pointData).format("HH:mm");
              } else if (data.type == "inputTime") {
                // データはそのまま
              }
            }

            let getSaisuiTime: string = "";
            let getSaisuiChangedFlg: boolean = false;
            // 採水時刻データを取得
            setSaisuiTimeData.forEach((sst) => {
              if (sst.pointNo == point.pointNo) {
                getSaisuiTime = sst.saisuiTime;
                getSaisuiChangedFlg = sst.saisuiTimeChanged;
              }
            });

            // 全てはNULLを確認
            const confAllNull =
              item.inputEditingData.length - allNullArray[pointKey] == 1 &&
              checkSaisuiDateExist[pointKey]
                ? true
                : false;

            if (
              !getSaisuiTime &&
              item.inputEditingData.length !== allNullArray[pointKey] &&
              !confAllNull
            ) {
              // エラー数える
              errorCnt += 1;

              // 必須項目のエラーメッセージを表示
              const errorInfo: AtomCommon.message[] = [];
              errorInfo.push(getMessage(["WQ-0001W", "採水時刻"]));
              commonState.setResultMessage(errorInfo);
            }

            // 地点基づく配列データ
            setDataByPoint.push({
              point_no: point.pointNo,
              saisui_time: getSaisuiTime,
              saisui_time_changed_flg: getSaisuiChangedFlg,
              data:
                item.inputEditingData.length !== allNullArray[pointKey] &&
                !confAllNull
                  ? pointData
                  : "",
              handle_data: point.handleData,
              handle_edit_data: point.handleEditData,
              constant_qualitative_flg: point.constantQualitativeFlg,
              inspection_kbn_code: point.inspectionKbnCode,
              all_delete_flg:
                item.inputEditingData.length !== allNullArray[pointKey]
                  ? false
                  : true,
            });
          });

          // 項目基づく配列データ
          setDataByItem.push({
            item_no: data.itemNo,
            data_type: data.type,
            constant_qualitative_flg: data.constantQualitativeFlg,
            data: setDataByPoint,
          });
        });

        // 登録データ
        setDataToSave.push({
          input_menu_no: item.inputMenuNo,
          input_select_date: item.inputSelectDate,
          data_by_item: setDataByItem,
        });
      });

      // エラー発生を判定
      if (errorCnt === 0) {
        saveInputDataMutation.mutate(setDataToSave);
        setValidatedData(setDataToSave);
        return true;
      } else {
        return false;
      }
    } else {
      // エラーメッセージ
      const errorInfo: AtomCommon.message[] = [];
      errorInfo.push(getMessage(["WQ-0019W"]));
      commonState.setResultMessage(errorInfo);

      commonState.setInputEditingFlg(false);

      return false;
    }
  };

  // データ登録
  const saveInputDataMutation = useMutation({
    mutationFn: async (saveData) => {
      // リクエスト
      const request = {
        data_to_save: saveData,
        display_time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS"),
      };

      // 選択している日付に基づき、検査情報を取得
      const response = await Api.post(
        "/WQM010/saveInputData",
        commonState.setResultMessage,
        request
      );

      return response;
    },
    // 正常終了
    onSuccess: () => {
      // 再取得クエリキー
      queryClient.invalidateQueries({ queryKey: ["fetchInputData"] });

      // 登録した後で、カレンダー背景色を調整
      menuCalendarState.useDataExistDateLists.push({
        date: moment(menuCalendarState.useSidemenuSelectedDate).format(
          "YYYY-MM-DD"
        ),
      });
      menuCalendarState.setDataExistDateLists(
        menuCalendarState.useDataExistDateLists
      );

      // 処理正常終了のメッセージ
      const msgInfo: AtomCommon.message[] = [];
      msgInfo.push(getMessage(["WQ-0002I"]));
      commonState.setResultMessage(msgInfo);
    },
    // エラー発生
    onError: (error) => {
      // エラーメッセージ
      // const errorInfo: AtomCommon.message[] = [];
      // errorInfo.push(getMessage(["WQ-0003E"]));
      // setResultMessage(errorInfo);
    },
  });

  // 入力データ確定日登録処理
  const manageInputFixedDateMutation = useMutation({
    mutationFn: async (procress: string) => {
      // リクエスト
      const request = {
        procress: procress,
        input_dsp_no: sideMenuState.useSideMenuSelected.selectedDspNo,
        saisui_date:
          menuCalendarState.useSidemenuSelectedDate ??
          moment().format("YYYY-MM-DD"),
        display_time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS"),
      };

      // 選択している日付に基づき、入力データ確定日を登録
      const response = await Api.post(
        "/WQM010/manageInputFixedDate",
        commonState.setResultMessage,
        request
      );

      return response;
    },
    // 正常終了
    onSuccess: (data, procress) => {
      // 再取得クエリキー
      queryClient.invalidateQueries({ queryKey: ["fetchInputItems"] });

      // 登録した後で、カレンダー背景色を調整
      menuCalendarState.useDataExistDateLists.push({
        date: moment(menuCalendarState.useSidemenuSelectedDate).format(
          "YYYY-MM-DD"
        ),
      });
      menuCalendarState.setDataExistDateLists(
        menuCalendarState.useDataExistDateLists
      );

      // 処理正常終了のメッセージ
      const msgInfo: AtomCommon.message[] = [];

      msgInfo.push(
        getMessage(
          procress == "save" ? ["WQ-0007I", "確定"] : ["WQ-0007I", "確定取消"]
        )
      );
      commonState.setResultMessage(msgInfo);
    },
    // エラー発生
    onError: (error) => {
      // エラーメッセージ
      // const errorInfo: AtomCommon.message[] = [];
      // errorInfo.push(getMessage(["WQ-0003E"]));
      // setResultMessage(errorInfo);
    },
  });

  // トレンド画面表示時処理
  const setTrend = (): void => {
    if (
      gridTableState.useCurFocusColumn !== null &&
      gridTableState.useCurFocusRow !== null
    ) {
      if (
        gridTableState.useGridTableButtomInfo.saisuiKbnName == null ||
        gridTableState.useGridTableButtomInfo.saisuiKbnName == ""
      ) {
        window.alert(getMessage(["WQ-0009W", "定量データ"]).message);
      } else {
        trendModalState.setTrendSearchCond({
          ...trendModalState.useTrendSearchCond,
          date_from: "",
          date_to: menuCalendarState.useSidemenuSelectedDate
            .split("-")
            .join("/"),
          item_name:
            inputRegisterState.useInputPointItemData.itemData[
              gridTableState.useCurFocusRow
            ].name,
          item_no:
            inputRegisterState.useInputPointItemData.itemData[
              gridTableState.useCurFocusRow
            ].itemNo,
          point_name: [
            inputRegisterState.useInputPointItemData.pointData[
              gridTableState.useCurFocusColumn
            ].pointData,
          ],
          point_no: [
            inputRegisterState.useInputPointItemData.pointData[
              gridTableState.useCurFocusColumn
            ].pointNo,
          ],
        });
        trendModalState.setIsOpen(true);
      }
    }
  };

  return (
    <>
      <footer data-testid="wmq010-4">
        <div className="foot_nav">
          {/* 取消ボタン */}
          <Button
            dataTestId="wqm010-4-2-1"
            title="取消"
            width="120px"
            margin="0px 0px 0px 15px"
            className="footer_cencel_btn footer_btn_left button_hover_orange"
            disabled={!gridTableState.useInputFixedFlg}
            onClick={() => {
              // 確認ダイアログ
              confirmDialog.setDialog((prev) => ({
                ...prev,
                isOpen: true,
                message: getMessage(["WQ-0005Q", "現在の入力情報をすべて削除"])
                  .message,
                onConfirm: () => {
                  gridTableState.setGridTableFooterBtnClick("取消");
                },
                onCancel: () => {
                  // 処理なし
                },
              }));
            }}
          />
          {/* 入力前に戻るボタン */}
          <Button
            dataTestId="wqm010-4-2-2"
            title="入力前に戻る"
            width="120px"
            color="#a7a7a7"
            margin="0px 0px 0px 15px"
            className="footer_prev_btn footer_btn_left button_hover_gray"
            disabled={!gridTableState.useInputFixedFlg}
            onClick={() => {
              // 確認ダイアログ
              confirmDialog.setDialog((prev) => ({
                ...prev,
                isOpen: true,
                message: getMessage(["WQ-0005Q", "入力した情報をすべて廃棄"])
                  .message,
                onConfirm: () => {
                  gridTableState.setGridTableFooterBtnClick("入力前に戻る");
                },
                onCancel: () => {
                  // 処理なし
                },
              }));
            }}
          />
          {/* 登録ボタン */}
          <Button
            dataTestId="wqm010-4-2-5"
            title="登録"
            width="100px"
            margin="0px 0px 0px 15px"
            className="footer_btn_right button_hover_green"
            disabled={!gridTableState.useInputFixedFlg}
            onClick={() => {
              // 確認ダイアログ
              confirmDialog.setDialog((prev) => ({
                ...prev,
                isOpen: true,
                message: getMessage(["WQ-0001Q"])?.message,
                onConfirm: () => {
                  const isValid = validateSaveInputData();
                },
                onCancel: () => {
                  // 処理なし
                },
              }));
            }}
          />

          {((sideMenuState.useSideMenuSelected.selectedDspNo && localStorage.getItem("fixFlg") == "1") && !isFetchingInputItems && gridTableState.useInputFixedBtnFlg) && (
            // {((sideMenuState.useSideMenuSelected.selectedDspNo && localStorage.getItem("securityLevel") == "1") && !isFetchingInputItems && gridTableState.useInputFixedBtnFlg) && (
            <>
              {(gridTableState.useInputFixedFlg) ? (
                <>
                  {/* 確定ボタン */}
                  < Button
                    dataTestId="wqm010-4-2-6"
                    title="確定"
                    width="100px"
                    color="#4d5fb1"
                    margin="0px 0px 0px 15px"
                    className="footer_btn_right"
                    onClick={() => {
                      // 確認ダイアログ
                      confirmDialog.setDialog((prev) => ({
                        ...prev,
                        isOpen: true,
                        message: getMessage(["WQ-0005Q", "データ確定"])
                          .message,
                        onConfirm: () => {
                          manageInputFixedDateMutation.mutate("save");
                        },
                        onCancel: () => {
                          // 処理なし
                        },
                      }));
                    }}
                  />
                </>

              ) : (
                <>
                  {/* 確定取消ボタン */}
                  < Button
                    dataTestId="wqm010-4-2-7"
                    title="確定取消"
                    width="100px"
                    margin="0px 0px 0px 15px"
                    className="footer_prev_btn footer_btn_right button_hover_orange"
                    onClick={() => {
                      // 確認ダイアログ
                      confirmDialog.setDialog((prev) => ({
                        ...prev,
                        isOpen: true,
                        message: getMessage(["WQ-0005Q", "データ確定の解除"])
                          .message,
                        onConfirm: () => {
                          manageInputFixedDateMutation.mutate("delete");
                        },
                        onCancel: () => {
                          // 処理なし
                        },
                      }));
                    }}
                  />
                </>
              )}
            </>

          )}

          {/* Excelファイル取込ボタン */}
          <Button
            dataTestId="wqm010-4-2-4"
            title="Excelファイル取込"
            width="150px"
            color="#4d5fb1"
            margin="0px 0px 0px 15px"
            className="footer_btn_right"
            disabled={!gridTableState.useInputFixedFlg}
            onClick={() => {
              if (
                sideMenuState.useSideMenuSelected.selectedMenuName == null ||
                sideMenuState.useSideMenuSelected.selectedMenuName == ""
              ) {
                // メッセージは後々精査してmessage.tsに追加
                window.alert(
                  "サイドメニューより、登録対象を選択してください。"
                );
                return;
              } else {
                document.getElementById(
                  "excel_upload_modal_panel"
                ).style.display = "flex";
              }
            }}
          />
          {/* トレンドボタン */}
          <Button
            dataTestId="wqm010-4-2-3"
            title="トレンド"
            width="100px"
            color="#4d5fb1"
            className="footer_btn_right"
            disabled={!gridTableState.useInputFixedFlg}
            onClick={() => {
              setTrend();
            }}
          />
        </div>
      </footer>
    </>
  );
};

// JSXリターン_[親コンポネント]
const WQM010 = (): JSX.Element => {
  /**
   * ステートコンテナーからステートを呼び出す
   *
   */
  const commonState = CommonStateContainer(); // 汎用
  const sideMenuState = SideMenuStateContainer(); // サイドメニュー
  const menuCalendarState = MenuCalendarStateContainer(); // サイドメニューのカレンダー
  const gridTableState = GridTableStateContainer(); // グリッドテーブル
  const inputRegisterState = InputRegisterStateContainer(); // 検査情報登録
  const confirmDialog = ConfirmDialogStateContainer(); // 確認ダイアログ
  const trendModalState = TrendModalStateContainer(); // トレンド

  // 引数に各ステート管理を組み合わせる
  const comblineProps = {
    // 汎用
    commonState: commonState,
    // サイドメニュー
    sideMenuState: sideMenuState,
    // サイドメニューのカレンダー
    menuCalendarState: menuCalendarState,
    // グリッドテーブル
    gridTableState: gridTableState,
    // 検査情報登録
    inputRegisterState: inputRegisterState,
    // 確認ダイアログ
    confirmDialog: confirmDialog,
    // トレンド
    trendModalState: trendModalState,
  };

  // メッセージ表示する時、GridTableの高さを調整
  useQuery({
    queryKey: ["adjustGridTableWithMessage", commonState.useResultMessage],
    queryFn: async () => {
      const gridTable: any = document.getElementById("grid-table-panel");
      const showMessageHeight: string =
        screen.width > 1366 ? "calc(100dvh - 243px)" : "calc(100dvh - 222px)"; // メッセージ表示
      const hideMessageHeight: string =
        screen.width > 1366 ? "calc(100dvh - 180px)" : "calc(100dvh - 174px)"; // メッセージ非表示

      if (gridTable) {
        if (commonState.useResultMessage.length > 0) {
          gridTable.style.height = showMessageHeight; // 210px + メッセージ(51px)
        } else {
          gridTable.style.height = hideMessageHeight; // 210px : トップエリアとフッターエリア
        }
      }

      return true;
    },
  });

  // メッセージ表示する時、GridTableの高さを調整
  useQuery({
    queryKey: ["outlinerModalShowBtn", commonState.useOutlinerModalShowBtn],
    queryFn: async () => {
      const gridTable: any = document.getElementById("grid-table-panel");
      const showOutlierHeight: string =
        screen.width > 1366 ? "calc(100dvh - 193px)" : "calc(100dvh - 198px)"; // メッセージ表示
      const hideOutlierHeight: string =
        screen.width > 1366 ? "calc(100dvh - 180px)" : "calc(100dvh - 174px)"; // メッセージ非表示

      if (gridTable) {
        if (commonState.useOutlinerModalShowBtn) {
          gridTable.style.height = showOutlierHeight; // 210px + メッセージ(13px)
        } else {
          gridTable.style.height = hideOutlierHeight; // 210px : トップエリアとフッターエリア
        }
      }

      return true;
    },
  });

  // カレンダーの背景色をクリア
  const clearCalendarBackgroundColor = () => {
    var elems = document.querySelectorAll(".selected_date_bg");
    elems.forEach((el) => {
      el.className = el.className.replace(/\bselected_date_bg\b/, "");
    });
  };

  /**
   * 項目・地点処理
   *
   */
  const fetchInputItems = async (): Promise<any> => {
    // データクリア
    gridTableState.setTempSaveData([]);
    commonState.setInputEditingFlg(false);

    if (
      sideMenuState.useSideMenuSelected.selectedMenuNo &&
      sideMenuState.useSideMenuSelected.selectedMenuNo !== ""
    ) {
      // データクリア
      commonState.setResultMessage([]);
      commonState.setMessageMutiLine([]);
      inputRegisterState.setInputPointItemData(
        AtomInputRegister.wqm010DefaultPointItemData
      );
      menuCalendarState.setDataExistDateLists([]);
      clearCalendarBackgroundColor();
      gridTableState.setInputFixedFlg(true);
      gridTableState.setInputFixedBtnFlg(false);
      gridTableState.setEnterToCell("column");

      // リクエスト
      const request = {
        selected_menu_no: sideMenuState.useSideMenuSelected.selectedMenuNo,
        selected_date:
          menuCalendarState.useSidemenuSelectedDate ??
          moment().format("YYYY-MM-DD"),
        current_month:
          menuCalendarState.useCurrrentMonth ?? moment().format("YYYY-MM"),
      };

      try {
        // 地点・項目・入力データを取得
        const data = await Api.post(
          "/WQM010/fetchPointItemData",
          commonState.setResultMessage,
          request
        );

        // 地点情報を指定
        let setPointDataForGrid: any = [];
        data.pointData.forEach((item) => {
          setPointDataForGrid.push({
            pointNo: item.point_no,
            pointData: item.point_name,
            processNo: item.process_no,
          });
        });

        // 項目情報を指定
        let setItemDataForGrid: any = [];
        data.itemData.forEach((item) => {
          setItemDataForGrid.push({
            itemNo: item.item_no,
            name: item.item_name,
            reportName: item.item_report_name,
            constantQualitativeFlg: item.constant_qualitative_flg,
            type: Const.INPUT_DATA_KBN[item.input_type],
            checkFlg: false,
            status: "",
            isOpen: false,
            selectorList: item.select_list,
          });
        });

        // 入力データがある日付を指定
        let newDateList: AtomSideMenuCalendar.sidemenuInterfaceDataExistDate[] =
          [];
        data.dataDateLists.forEach((data) => {
          newDateList.push({
            date: moment(data.saisui_date).format("YYYY-MM-DD"),
          });
        });
        menuCalendarState.setDataExistDateLists(newDateList);

        // 宛先値を設定
        commonState.setDesftinationConst(data.destinationCont);

        // gridTableコンポの引数を指定
        if (data.itemData.length !== 0 && data.pointData.length !== 0) {
          inputRegisterState.setInputPointItemData({
            ...inputRegisterState.useInputPointItemData,
            selectMenuNo: sideMenuState.useSideMenuSelected.selectedMenuNo,
            selectDate: menuCalendarState.useSidemenuSelectedDate,
            pointData: setPointDataForGrid,
            itemData: setItemDataForGrid,
            inputData: data.inputData,
            inputMask: data.inputMask,
            inspectCriteria: data.inspectCriteria,
            inspectCriteriaDataKbnCorrection:
              data.inspectCriteriaDataKbnCorrection,
            criteriaCorrection: data.criteriaCorrection,
            cellOutline: data.cellOutline,
          });
        } else {
          // 選択しているメニューをクリア
          sideMenuState.setSideMenuSelected(
            AtomSideMenu.defaultInputSelectedMenuState
          );

          // エラーメッセージ表示
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0015E", "採水地点"]));
          commonState.setResultMessage(errorInfo);
        }

        // 入力データ確定フラグを設定
        if (data.inputFixed.length > 0) {
          gridTableState.setInputFixedFlg(false);
        }

        // 入力データ確定ボタンの表示フラグ
        if (
          data.inputFixedFlg.length > 0 &&
          data.inputFixedFlg[0].conf_btn_flg == 1
        ) {
          gridTableState.setInputFixedBtnFlg(true);
        }

        // 処理実施日時
        inputRegisterState.setDisplayTime(
          moment(data.displayTime).format("YYYY-MM-DD HH:mm:ss.SSS")
        );

        return data;
      } catch (error: any) {
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          commonState.setResultMessage(errorInfo);
        }
        throw error;
      }
    }

    return true;
  };

  // メニューを選択した後、項目・地点を取得
  const { isFetching, data } = useQuery({
    queryKey: [
      "fetchInputItems",
      sideMenuState.useSideMenuSelected.selectedMenuNo,
    ],
    queryFn: fetchInputItems,
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

  /**
   * 入力データが存在している日付を指定
   *
   */
  const fetchDataExistDate = async (): Promise<any> => {
    if (
      sideMenuState.useSideMenuSelected.selectedMenuNo &&
      sideMenuState.useSideMenuSelected.selectedMenuNo !== "" &&
      menuCalendarState.useCurrrentMonth &&
      menuCalendarState.useCurrrentMonth !== ""
    ) {
      // リクエスト
      const request = {
        selected_menu_no: sideMenuState.useSideMenuSelected.selectedMenuNo,
        selected_date:
          menuCalendarState.useSidemenuSelectedDate ??
          moment().format("YYYY-MM-DD"),
        current_month:
          menuCalendarState.useCurrrentMonth ?? moment().format("YYYY-MM"),
      };

      try {
        // 選択している日付に基づき、検査情報を取得
        const data = await Api.post(
          "/WQM010/fetchDataExistDate",
          commonState.setResultMessage,
          request
        );

        // 入力データがある日付を指定
        let newDateList: AtomSideMenuCalendar.sidemenuInterfaceDataExistDate[] =
          [];
        data.dataDateLists.forEach((data) => {
          newDateList.push({
            date: moment(data.saisui_date).format("YYYY-MM-DD"),
          });
        });
        menuCalendarState.setDataExistDateLists(newDateList);

        return data;
      } catch (error: any) {
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          commonState.setResultMessage(errorInfo);
        }
        throw error;
      }
    }

    return true;
  };

  // 入力データが存在している日付を指定 ※ 全件を取得するため、不用になる
  // useQuery({
  //   queryKey: ["fetchDataExistDate", useCurrrentMonth],
  //   queryFn: fetchDataExistDate,
  // });

  /**
   * 選択している日付に基づき、検査情報を取得
   *
   */
  const fetchInputData = async (): Promise<any> => {
    if (
      sideMenuState.useSideMenuSelected.selectedMenuNo &&
      sideMenuState.useSideMenuSelected.selectedMenuNo !== "" &&
      menuCalendarState.useSidemenuSelectedDate &&
      menuCalendarState.useSidemenuSelectedDate !== ""
    ) {
      // データクリア
      commonState.setResultMessage([]);
      commonState.setMessageMutiLine([]);
      gridTableState.setTempSaveData([]);
      commonState.setInputEditingFlg(false);
      gridTableState.setInputFixedFlg(true);
      gridTableState.setInputFixedBtnFlg(false);

      // リクエスト
      const request = {
        selected_menu_no: sideMenuState.useSideMenuSelected.selectedMenuNo,
        selected_date:
          menuCalendarState.useSidemenuSelectedDate ??
          moment().format("YYYY-MM-DD"),
        current_month:
          menuCalendarState.useCurrrentMonth ?? moment().format("YYYY-MM"),
      };

      try {
        // 選択している日付に基づき、検査情報を取得
        const data = await Api.post(
          "/WQM010/fetchInputData",
          commonState.setResultMessage,
          request
        );

        // gridTableコンポの引数を指定
        inputRegisterState.setInputPointItemData({
          ...inputRegisterState.useInputPointItemData,
          // selectMenuNo: useSideMenuSelected.selectedMenuNo,
          selectDate: menuCalendarState.useSidemenuSelectedDate,
          inputData: data.inputData,
          inspectCriteria: data.inspectCriteria,
          inspectCriteriaDataKbnCorrection: data.inspectCriteriaDataKbnCorrection,
        });

        // 処理実施日時
        inputRegisterState.setDisplayTime(
          moment(data.displayTime).format("YYYY-MM-DD HH:mm:ss.SSS")
        );

        // 入力データ確定フラグを設定
        if (data.inputFixed.length > 0) {
          gridTableState.setInputFixedFlg(false);
        }

        // 入力データ確定ボタンの表示フラグ
        if (
          data.inputFixedFlg.length > 0 &&
          data.inputFixedFlg[0].conf_btn_flg == 1
        ) {
          gridTableState.setInputFixedBtnFlg(true);
        }

        return data;
      } catch (error: any) {
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          commonState.setResultMessage(errorInfo);
        }
        throw error;
      }
    }
    return true;
  };

  // 選択している日付に基づき、検査情報を取得
  useQuery({
    queryKey: ["fetchInputData", menuCalendarState.useSidemenuSelectedDate],
    queryFn: fetchInputData,
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

  const [containerWidth, setcontainerWidth] = React.useState(
    window.outerWidth - sideMenuState.useBarWidth - 10
  );
  useQuery({
    queryKey: ["containerWidth", sideMenuState.useBarWidth],
    queryFn: () => {
      setcontainerWidth(window.outerWidth - sideMenuState.useBarWidth - 10);

      return true;
    },
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

  // ページから離れる時、キャッシュをクリア
  const queryClient = useQueryClient();
  React.useEffect(() => {
    return () => {
      // クエリキャッシュをクリア
      queryClient.removeQueries({ queryKey: ["fetchInputItems"] });

      // 選択しているメニューをクリア
      sideMenuState.setSideMenuSelected(
        AtomSideMenu.defaultInputSelectedMenuState
      );
      sideMenuState.setDataSideMenuLink([]);
      sideMenuState.setDataSideMenu([]);
      gridTableState.setInputFixedFlg(false);
      menuCalendarState.setDataExistDateLists([]);
      commonState.setMessageMutiLine([]);
      commonState.setResultMessage([]);
    };
  }, [queryClient]);

  // グリッドテーブルサイズを調整
  const handleResizeGridTable = () => {
    // サイドメニュー側のサイズ調整関数を実行
    queryClient.invalidateQueries({ queryKey: ["openMenuToggle"] });
  };

  // 画面サイズを変更するごとに処理を呼び出す関数を設定
  React.useEffect(() => {
    window.addEventListener("resize", handleResizeGridTable);
  });

  const location = useLocation();
  return (
    <>
      <SideMenu key={location.pathname} page={"WQM010"} />
      <div
        id="WQM010-main-container"
        data-testid="wqm010-2"
        className="container_grid_table"
        style={{
          height: "100%",
          width: `${containerWidth}px`,
        }}
      >
        <div
          className="container_range"
          style={{ zIndex: "0", width: `${containerWidth}px` }}
        >
          <div
            id="main-content-table"
            style={{ width: `${containerWidth}px`, right: 0 }}
            className={`${cssWQM010.WQM010_input_container}`}
          >
            <>
              <MessageArea />
              <MessageMutiLineArea />
              {sideMenuState.useSideMenuSelected.selectedMenuNo && (
                <>
                  {isFetching ? (
                    <div
                      data-testid="wqm010-loading-gif"
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
                      <div
                        className="container_row"
                        style={{
                          justifyContent: "left",
                          margin: "0px 0px 10px 0px",
                        }}
                      >
                        <div
                          data-testid="wqm010-2-1-1"
                          id="enter-to-toggle-icon"
                          className={`${
                            gridTableState.useEnterToCell == "column"
                              ? cssWQM010.WQM010_enter_to_right
                              : cssWQM010.WQM010_enter_to_bottom
                          }`}
                          onClick={() => {
                            gridTableState.setEnterToCell(
                              gridTableState.useEnterToCell == "column"
                                ? "row"
                                : "column"
                            );
                          }}
                        ></div>
                        <h2
                          data-testid="wqm010-2-1-2"
                          style={{
                            width: "fit-content",
                            alignContent: "center",
                          }}
                        >
                          {parse(sideMenuState.useSideMenuSelected.selectedMenuName)}
                        </h2>
                        {commonState.useOutlinerModalShowBtn && (
                          <Button
                            dataTestId="wqm010-2-1-3"
                            title="異常値あり"
                            width="120px"
                            color="rgb(255 245 212)"
                            margin="0px 0px 0px 15px"
                            className="button_top_check"
                            onClick={() => {
                              commonState.setOutlinerModalShowFlg(
                                !commonState.useOutlinerModalShowFlg
                              );
                            }}
                          />
                        )}
                      </div>
                      {sideMenuState.useSideMenuSelected.selectedMenuNo &&
                        menuCalendarState.useSidemenuSelectedDate && (
                          <>
                            <GridTable
                              dataGrid={
                                inputRegisterState.useInputPointItemData
                              }
                            />
                            <div
                              className={`${cssWQM010.WQM010_bottom_container}`}
                            >
                              {gridTableState.useGridTableButtomInfo
                                .saisuiKbnName && (
                                <span
                                  className={`${cssWQM010.WQM010_bottom_item}`}
                                >
                                  採水区分＝
                                  {
                                    gridTableState.useGridTableButtomInfo
                                      .saisuiKbnName
                                  }
                                </span>
                              )}
                              {gridTableState.useGridTableButtomInfo
                                .regulationUpLimit && (
                                <span
                                  className={`${cssWQM010.WQM010_bottom_item}`}
                                >
                                  基準値(目標値)＝
                                  {
                                    gridTableState.useGridTableButtomInfo
                                      .regulationUpLimit
                                  }
                                </span>
                              )}
                              {gridTableState.useGridTableButtomInfo
                                .inputLowLimit && (
                                <span
                                  className={`${cssWQM010.WQM010_bottom_item}`}
                                >
                                  定量下限値＝
                                  {
                                    gridTableState.useGridTableButtomInfo
                                      .inputLowLimit
                                  }
                                </span>
                              )}
                              {gridTableState.useGridTableButtomInfo
                                .reportLowLimit && (
                                <span
                                  className={`${cssWQM010.WQM010_bottom_item}`}
                                >
                                  報告下限値＝
                                  {
                                    gridTableState.useGridTableButtomInfo
                                      .reportLowLimit
                                  }
                                </span>
                              )}
                              {gridTableState.useGridTableButtomInfo.calUp &&
                                gridTableState.useGridTableButtomInfo
                                  .calLow && (
                                  <span
                                    className={`${cssWQM010.WQM010_bottom_item}`}
                                  >
                                    統計値＝
                                    {
                                      gridTableState.useGridTableButtomInfo
                                        .calUpLow
                                    }
                                  </span>
                                )}
                              {/* {useGridTableButtomInfo.prevInputData && (
                              <span
                                className={`${cssWQM010.WQM010_bottom_item_prev_input}`}
                              >
                                ｜前回値＝{useGridTableButtomInfo.prevInputData}
                              </span>
                            )} */}
                              <span
                                className={`${cssWQM010.WQM010_bottom_item_prev_input}`}
                              >
                                ｜前回値＝
                                {
                                  gridTableState.useGridTableButtomInfo
                                    .prevInputData
                                }
                              </span>
                            </div>
                          </>
                        )}
                    </>
                  )}
                </>
              )}
            </>
          </div>
        </div>
      </div>
      {/* <Footer className={["register_icon", "discard_icon", "delete_icon"]} title={["登録", "取消", "削除"]} onClick={() => { }} /> */}
      <WQM010Footer {...comblineProps} />
      <TrendModal />
      <ExcelFileUploadModal />
      {commonState.useOutlinerModalShowFlg && <OutlierListModal />}
    </>
  );
};

export default WQM010;
