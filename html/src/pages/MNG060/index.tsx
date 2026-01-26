import React, { useState } from "react";
import { SetStateAction, useAtomValue } from "jotai";
import { useAtom, useSetAtom } from "jotai";

import { Api, getMessage } from "../../common/api";
import * as Common from '../../common/common';
import * as Const from "../../common/const";
import { useQuery, useIsFetching, useQueryClient } from "@tanstack/react-query";

// Atom
import * as AtomCommon from "../../stores/atom";
import * as AtomMng060 from "../../stores/atomMNG060";
import * as AtomSideMasterMenu from "../../stores/atomSideMenuMaster";
import * as AtomInspectionItemSetting from "../../stores/atomInspectionItemSetting";
import * as AtomConfirmDialog from "../../stores/atomConfirmDialog";

// コンポーネント
import {
  Button,
  MessageMutiLineArea
} from "../../components/common";
import TitleArea from "../../components/layouts/title";
import Loading from "../../components/layouts/loading";
import SideMenuMaster from "../../components/layouts/sidemenuMaster"; // サイドメニュー
import { RptConfigGridTable } from "../../components/mng060/rptConfigGridTable";
import {
  InspectionItemSettingModal,
  ExcelFileUploadModal,
} from "../../components/modals/index";
import { RptConfigGridForm } from "../../components/mng060/rptConfigGridForm";

// CSS
import cssMNG060 from "../../scss/pages/MNG060.module.scss";

//【ライブラリー】ReactGrid
import "@silevis/reactgrid/styles.css";

// 日時管理ライブラリー
import moment from "moment";

// タブライブラリー
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

// 一覧部の高さ自動調整
const listHeightAjust = (
  setListAreaheight: (val: SetStateAction<string | number | boolean>) => void
) => {
  // 画面全体の高さ
  const bodyHeight: number = document.documentElement.clientHeight;

  // ヘッダーの高さ
  const headerHeight: number =
    document.querySelector(".header_inner").clientHeight;

  // メッセージエリアの高さ
  let messageHeight = 0;
  if (document.querySelector(".message-area")) {
    messageHeight = document.querySelector(".message-area").clientHeight;
  }

  // 検索部の高さ
  const searchHeight: number =
    document.querySelector("#search_area").clientHeight -
    document.querySelector("#search_condition").clientHeight;

  // フッダーの高さ
  const footerHeight: number = document.querySelector(".foot-nav")
    ? document.querySelector(".foot-nav").clientHeight
    : 0;

  // 検索部の高さ
  const titleHeight: number = document.querySelector("#title").clientHeight;

  const calcHeight: number = document.querySelector("#calc_area")
    ? document.querySelector("#calc_area").clientHeight
    : 0;

  const marginHeight = 60; // マージン幅

  // 一覧部の高さ
  const listHeight: number =
    bodyHeight -
    // headerHeight -
    // searchHeight -
    marginHeight -
    footerHeight -
    messageHeight -
    calcHeight -
    // titleHeight -
    0;

  setListAreaheight(`${String(listHeight)}px`);
};

// フッター
const Footer = (): JSX.Element => {
  const [useMessage, setMessage] = useAtom(AtomCommon.messageState);                              // メッセージ用
  const [useMessageMutiLine, setMessageMutiLine] = useAtom(AtomCommon.messageMutiLineState);      // 複数メッセージ用
  const [displayTime, setDisplayTime] = useAtom(AtomCommon.displayTime);

  // 選択したメニューデータアトム
  const useSideMenuSelected = useAtomValue(
    AtomSideMasterMenu.sideMenuSelectedState
  );

  const [configTableData, setConfigTableData] = useAtom(
    AtomMng060.mng060EditData("configTable")
  );
  const [itemTableData, setItemTableData] = useAtom(
    AtomMng060.mng060EditData("itemTable")
  );
  const [pointTableData, setPointTableData] = useAtom(
    AtomMng060.mng060EditData("pointTable")
  );
  const [textTableData, setTextTableData] = useAtom(
    AtomMng060.mng060EditData("textTable")
  );
  const [monthListTableData, setMonthListTableData] = useAtom(
    AtomMng060.mng060EditData("monthListTable")
  );

  /** セレクトボックス 入力メニュー */
  const optionInputMenu = useAtomValue(AtomMng060.mng060Options("input_menu"));
  /** セレクトボックス 採水地点 */
  const optionPoint = useAtomValue(AtomMng060.mng060Options("point"));
  /** セレクトボックス 検査区分 */
  const optionKbn = useAtomValue(AtomMng060.mng060Options("inspection_kbn"));
  /** セレクトボックス 報告書タイプ */
  const optionType = useAtomValue(AtomMng060.mng060Options("report_type"));
  /** セレクトボックス 検査項目 */
  const optionItem = useAtomValue(AtomMng060.mng060Options("item"));
  /** セレクトボックス 報告書 */
  const optionReport = useAtomValue(AtomMng060.mng060Options("report"));

  const [rptConfigData, setRptConfigData] = useAtom(
    AtomMng060.mng060RptConfigData
  ); // 報告書設定用
  const [rptItemData, setRptItemData] = useAtom(AtomMng060.mng060RptItemData); // 検査項目用
  const [rptPointData, setRptPointData] = useAtom(
    AtomMng060.mng060RptPointData
  ); // 測定地点用
  const [rptTextData, setRptTextData] = useAtom(AtomMng060.mng060RptTextData); // 固定文言用
  const [rptMonthListData, setRptMonthListData] = useAtom(
    AtomMng060.mng060RptMonthListData
  ); // 月報報告書一覧用

  // 確認ダイアログ設定
  const setDialog = useSetAtom(AtomConfirmDialog.confirmDialogAtom);

  // 登録するデータ検証
  const validateSaveReportData = async () => {
    setMessageMutiLine([]);
    const errorInfo: AtomCommon.message[] = [];
    let errorCnt: number = 0;

    // 月報のバリデーションチェック
    if (monthListTableData.length > 0) {
      monthListTableData.forEach((report, index) => {
        // 月報の報告書名称を確認 ※ 報告書構成マスタより報告書名称リストを選択
        if (report[0].colName == "report_no" && (report[0].value && report[0].value !== "")) {
          const checkSelectedList = optionReport.find(rp => Number(report[0].value) == Number(rp.value));
          if (!checkSelectedList) {
            // エラー数える
            errorCnt += 1;

            // 必須項目のエラーメッセージを表示
            errorInfo.push(getMessage(["WQ-0009W", (index + 1) + "行目：報告書名称正しく"]));
          }
        }

        // 月報の採水地点を確認 ※ 採水地点マスタより地点名称報告書リストを選択
        if (report[1].colName == "point_no") {
          const checkSelectedList = optionPoint.find(rp => Number(report[1].value) == Number(rp.value));
          if (!checkSelectedList) {
            // エラー数える
            errorCnt += 1;

            // 必須項目のエラーメッセージを表示
            errorInfo.push(getMessage(["WQ-0009W", (index + 1) + "行目：地点名称正しく"]));
          }
        }

        // 月報の採水日数確認
        if (report[2].colName == "saisui_days") {
          if (!report[2].value || report[2].value == "") {
            // エラー数える
            errorCnt += 1;

            // 必須項目のエラーメッセージを表示
            errorInfo.push(getMessage(["WQ-0006W", (index + 1) + "行目：採水日数"]));
          }
        }

      });
    }

    // 測定地点のバリデーションチェック
    if (pointTableData.length > 0) {
      pointTableData.forEach((point, index) => {
        // 測定地点を確認 ※ 採水地点マスタより地点名称報告書リストを選択
        if (point[0].colName == "point_no" && (point[0].value && point[0].value !== "")) {
          const checkSelectedList = optionPoint.find(rp => Number(point[0].value) == Number(rp.value));
          if (!checkSelectedList) {
            // エラー数える
            errorCnt += 1;

            // 必須項目のエラーメッセージを表示
            errorInfo.push(getMessage(["WQ-0009W", (index + 1) + "行目：地点名称正しく"]));
          }
        }
      });
    }

    // 固定文言のバリデーションチェック
    if (textTableData.length > 0) {
      textTableData.forEach((text, index) => {
        // 固定文言を確認 ※ 採水地点マスタより地点名称報告書リストを選択
        if (text[0].colName == "point_no" && (text[0].value && text[0].value !== "")) {
          const checkSelectedList = optionPoint.find(rp => Number(text[0].value) == Number(rp.value));
          if (!checkSelectedList) {
            // エラー数える
            errorCnt += 1;

            // 必須項目のエラーメッセージを表示
            errorInfo.push(getMessage(["WQ-0009W", "固定文言の" + (index + 1) + "行目：地点名称正しく"]));
          }
        }

        // 出力位置セル名が入力されていることを確認
        if (text[1].colName == "text_cell_name" && (!text[1].value || text[1].value == "")) {
          // エラー数える
          errorCnt += 1;

          // 必須項目のエラーメッセージを表示
          errorInfo.push(getMessage(["WQ-0006W", "固定文言の" + (index + 1) + "行目：出力位置セル名"]));
        }

        if (text[1].colName == "text_cell_name" && (text[1].value && text[1].value !== "")) {
          // 出力位置セル名が50桁以上の場合エラー
          if (Common.checkLengthOverOfString(text[1].value, 50)) {
            // エラー数える
            errorCnt += 1;

            // 必須項目のエラーメッセージを表示
            errorInfo.push(getMessage(["WQ-0011W", "固定文言の" + (index + 1) + "行目：出力位置セル名", "50"]));
          }
        }

        // 区分
        if (text[2].colName == "text_cell_kbn" && (text[2].value && text[2].value !== "")) {
          // 区分が50桁以上の場合エラー
          if (Common.checkLengthOverOfString(text[2].value, 50)) {
            // エラー数える
            errorCnt += 1;

            // 必須項目のエラーメッセージを表示
            errorInfo.push(getMessage(["WQ-0011W", "固定文言の" + (index + 1) + "行目：区分", "50"]));
          }
        }

        // 内容
        if (text[3].colName == "text_cell_code" && (text[3].value && text[3].value !== "")) {
          // 内容が50桁以上の場合エラー
          if (Common.checkLengthOverOfString(text[3].value, 255)) {
            // エラー数える
            errorCnt += 1;

            // 必須項目のエラーメッセージを表示
            errorInfo.push(getMessage(["WQ-0011W", "固定文言の" + (index + 1) + "行目：内容", "255"]));
          }
        }

        // 年度
        if (text[4].colName == "nendo" && (text[4].value && text[4].value !== "")) {
          // 年度が50桁以上の場合エラー
          if (Common.checkNumberAndDigits(Number(text[4].value)) == 1) {
            // エラー数える
            errorCnt += 1;

            // 必須項目のエラーメッセージを表示
            errorInfo.push(getMessage(["WQ-0004W", "固定文言の" + (index + 1) + "行目：年度"]));
          }
        }
      });
    }

    // エラー発生を判定
    if (errorCnt === 0) {
      queryClient.prefetchQuery({ queryKey: ["mng060regist"] });
      return true;
    } else {
      setMessageMutiLine(errorInfo);
      return false;
    }

  };

  // 報告書設定_表_表示用データ取得
  const regist = (): void => {
    const request = {
      displayTime: displayTime,
      config: configTableData,
      item: itemTableData,
      point: pointTableData,
      text: textTableData,
      monthList: monthListTableData,
      sidemenu: useSideMenuSelected,
    };
    setMessage([]);
    setMessageMutiLine([]);

    Api.post("/MNG060/regist", setMessageMutiLine, request)
      .then((response) => {
        setDisplayTime(moment(response.time).format("YYYY-MM-DD HH:mm:ss.SSS"));
        const messageInfo: AtomCommon.message[] = [];
        messageInfo.push(getMessage(["WQ-0002I"]));
        setMessageMutiLine(messageInfo);
      })
      .catch((error: Error) => {
        // 想定外のエラーの場合メッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          setMessageMutiLine(errorInfo);
        }
      });
  };

  // 報告書 削除処理
  const discardReportMenu = (): void => {
    const request = {
      displayTime: displayTime,
      sidemenu: useSideMenuSelected,
    };
    setMessage([]);

    Api.post("/MNG060/deleteReport", setMessageMutiLine, request)
      .then((response) => {
        setDisplayTime(moment(response.time).format("YYYY-MM-DD HH:mm:ss.SSS"));
        queryClient.prefetchQuery({ queryKey: ["getInitMenuLists"] });
        setRptConfigData(AtomMng060.mng060DefaultRptConfigData);
        setRptItemData(AtomMng060.mng060DefaultRptItemData);
        setRptPointData(AtomMng060.mng060DefaultPointData);
        setRptTextData(AtomMng060.mng060DefaultTextData);
        const messageInfo: AtomCommon.message[] = [];
        messageInfo.push(getMessage(["WQ-0004I"]));
        setMessageMutiLine(messageInfo);
      })
      .catch((error: Error) => {
        // 想定外のエラーの場合メッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          setMessageMutiLine(errorInfo);
        }
      });
  };

  // クエリクライアント_他のコンポネントの関数を実行する為
  const queryClient = useQueryClient();
  const { isFetching: isRegist } = useQuery({
    queryKey: ["mng060regist"],
    queryFn: regist,
    enabled: false,
  });
  const { isFetching: isDelete } = useQuery({
    queryKey: ["discardReportMenu"],
    queryFn: discardReportMenu,
    enabled: false,
  });

  return (
    <>
      <footer>
        <ul className="foot_nav">
          <Button
            width="120px"
            title="登録"
            margin="0px 0px 0px 15px"
            className="footer_btn_right button_hover_green"
            onClick={() => {
              // 確認ダイアログ
              setDialog((prev) => ({
                ...prev,
                isOpen: true,
                message: getMessage(["WQ-0001Q"]).message,
                onConfirm: () => {
                  // データバリデーション
                  const isValid = validateSaveReportData();
                  // queryClient.prefetchQuery({ queryKey: ["mng060regist"] });
                },
                onCancel: () => {
                  // 処理なし
                },
              }));
            }}
          />
          {useSideMenuSelected.report_no && (
            <>
              <Button
                width="150px"
                title="テンプレート取込"
                margin="0px 0px 0px 15px"
                className="footer_btn_right button_hover_blue"
                onClick={() => {
                  // window.alert("未実装");

                  document.getElementById(
                    "excel_upload_modal_panel"
                  ).style.display = "flex";
                }}
              />
            </>
          )}
          {useSideMenuSelected.report_no && (
            <>
              <Button
                width="120px"
                title="取消"
                margin="0px 0px 0px 15px"
                className="footer_cencel_btn footer_btn_left button_hover_orange"
                onClick={() => {
                  // 確認ダイアログ
                  setDialog((prev) => ({
                    ...prev,
                    isOpen: true,
                    message: getMessage(["WQ-0003Q"]).message,
                    onConfirm: () => {
                      queryClient.prefetchQuery({ queryKey: ["discardReportMenu"] });
                    },
                    onCancel: () => {
                      // 処理なし
                    },
                  }));
                }}
              />
            </>
          )}
          <Button
            width="140px"
            title="入力前に戻る"
            margin="0px 0px 0px 15px"
            className="footer_prev_btn footer_btn_left button_hover_gray"
            onClick={() => {
              // 確認ダイアログ
              setDialog((prev) => ({
                ...prev,
                isOpen: true,
                message: getMessage(["WQ-0005Q", "報告書画面設定した情報をすべて廃棄"]).message,
                onConfirm: () => {
                  setConfigTableData(rptConfigData.rowData);
                  setItemTableData(rptItemData.rowData);
                  setPointTableData(rptPointData.rowData);
                  setTextTableData(rptTextData.rowData);
                  setMonthListTableData(rptMonthListData.rowData);
                },
                onCancel: () => {
                  // 処理なし
                },
              }));

            }}
          />
        </ul>
      </footer>
    </>
  );
};

const MNG060 = (): JSX.Element => {
  const [useMessage, setMessage] = useAtom(AtomCommon.messageState);                              // メッセージ用
  const [useMessageMutiLine, setMessageMutiLine] = useAtom(AtomCommon.messageMutiLineState);      // 複数メッセージ用
  const [displayTime, setDisplayTime] = useAtom(AtomCommon.displayTime);

  const [barWidth, setBarWidth] = useAtom(
    AtomSideMasterMenu.sideMenuWidthState
  ); // サイドメニュー横幅
  const [containerWidth, setcontainerWidth] = React.useState(
    window.outerWidth - barWidth - 1
  ); // サイドメニュー以外の横幅
  // 選択したメニューデータアトム
  const [useSideMenuSelected, setSideMenuSelected] = useAtom(
    AtomSideMasterMenu.sideMenuSelectedState
  );
  const inspectionItemModalFlgState = useAtomValue(
    AtomInspectionItemSetting.inspectionItemModalFlgState
  );

  const [rptConfigData, setRptConfigData] = useAtom(
    AtomMng060.mng060RptConfigData
  ); // 報告書設定用
  const [rptItemData, setRptItemData] = useAtom(AtomMng060.mng060RptItemData); // 検査項目用
  const [rptPointData, setRptPointData] = useAtom(
    AtomMng060.mng060RptPointData
  ); // 測定地点用
  const [rptTextData, setRptTextData] = useAtom(AtomMng060.mng060RptTextData); // 固定文言用
  const [rptMonthListData, setRptMonthListData] = useAtom(
    AtomMng060.mng060RptMonthListData
  ); // 固定文言用
  const setOptionInputMenu = useSetAtom(AtomMng060.mng060Options("input_menu")); //
  const setOptionPoint = useSetAtom(AtomMng060.mng060Options("point")); //
  const setOptionKbn = useSetAtom(AtomMng060.mng060Options("inspection_kbn")); //
  const setOptionType = useSetAtom(AtomMng060.mng060Options("report_type")); //
  const setOptionItem = useSetAtom(AtomMng060.mng060Options("item")); //
  const setOptionReport = useSetAtom(AtomMng060.mng060Options("report")); //

  const [configTableData, setConfigTableData] = useAtom(
    AtomMng060.mng060EditData("configTable")
  );
  const [itemTableData, setItemTableData] = useAtom(
    AtomMng060.mng060EditData("itemTable")
  );
  const [pointTableData, setPointTableData] = useAtom(
    AtomMng060.mng060EditData("pointTable")
  );
  const [textTableData, setTextTableData] = useAtom(
    AtomMng060.mng060EditData("textTable")
  );
  const [monthListTableData, setMonthListTableData] = useAtom(
    AtomMng060.mng060EditData("monthListTable")
  );

  // 報告書設定_表_表示用データ取得
  const setGridData = (): void => {
    // ステートリセット
    setMessage([]);
    setMessageMutiLine([]);

    if (useSideMenuSelected.selectedDspNo == null) {
      Api.post("/MNG060/getRptConfig", setMessage, useSideMenuSelected)
        .then((response) => {
          // セレクトボックス 選択肢
          setOptionInputMenu(response.menuOpt);
          setOptionPoint(response.pointOpt);
          setOptionKbn(response.kbnOpt);
          setOptionType(response.typeOpt);
          setOptionItem(response.itemOpt);
          setOptionReport(response.reportOpt);
          // 表データ
          setRptConfigData({
            ...rptConfigData,
            rowData: response.config.rowData,
            colData: response.config.colData,
          });
          setRptItemData({
            ...rptItemData,
            rowData: response.item.rowData,
            colData: response.item.colData,
          });
          setRptPointData({
            ...rptPointData,
            rowData: response.point.rowData,
            colData: response.point.colData,
          });
          setRptTextData({
            ...rptTextData,
            rowData: response.text.rowData,
            colData: response.text.colData,
          });
          setRptMonthListData({
            ...rptMonthListData,
            rowData: response.monthList.rowData,
            colData: response.monthList.colData,
          });
          setDisplayTime(moment(response.time).format("YYYY-MM-DD HH:mm:ss.SSS"));

        })
        .catch((error: Error) => {
          // 想定外のエラーの場合メッセージを表示
          if (error.message == Const.HTTP_STATUS_CODE["500"]) {
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["WQ-0003E"]));
            setMessageMutiLine(errorInfo);
          }
        });
    } else {
      // 選択しているメニューをクリア
      setSideMenuSelected(AtomSideMasterMenu.defaultInputSelectedMenuState);
    }
  };

  // 報告書選択時
  const { isFetching } = useQuery({
    queryKey: ["mng060SelectReportMaster", useSideMenuSelected],
    queryFn: () => {
      // メッセージをクリア
      setMessage([]);
      setMessageMutiLine([]);

      // グリッドテーブルの引数データをクリア ※ グリッドテーブル初期設定用
      setRptConfigData(AtomMng060.mng060DefaultRptConfigData);
      setRptItemData(AtomMng060.mng060DefaultRptItemData);
      setRptPointData(AtomMng060.mng060DefaultPointData);
      setRptTextData(AtomMng060.mng060DefaultTextData);
      setRptMonthListData(AtomMng060.mng060DefaultMonthListData);

      // 一覧データをクリア
      setConfigTableData([]);
      setItemTableData([]);
      setPointTableData([]);
      setTextTableData([]);
      setMonthListTableData([]);

      if (useSideMenuSelected.selectedDspNo !== "" && !useSideMenuSelected.label_flg) {
        setGridData();
      }
    },
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

  // サイドメニュー横幅変更時
  useQuery({
    queryKey: ["mog060ContainerWidth", barWidth],
    queryFn: () => {
      setcontainerWidth(window.outerWidth - barWidth - 1);
    },
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

  const isFetchingByConfigTable = useIsFetching({
    queryKey: ["dataGridChange_configTable"],
  });
  const isFetchingByItemTable = useIsFetching({
    queryKey: ["dataGridChange_itemTable"],
  });
  const isFetchingByPointTable = useIsFetching({
    queryKey: ["dataGridChange_pointTable"],
  });
  const isFetchingByTextTable = useIsFetching({
    queryKey: ["dataGridChange_textTable"],
  });

  // ページから離れる時、キャッシュをクリア
  const queryClient = useQueryClient();
  React.useEffect(() => {
    return () => {
      // 選択しているメニューをクリア
      setSideMenuSelected(AtomSideMasterMenu.defaultInputSelectedMenuState);
      setRptConfigData(AtomMng060.mng060DefaultRptConfigData);
      setRptItemData(AtomMng060.mng060DefaultRptItemData);
      setRptPointData(AtomMng060.mng060DefaultPointData);
      setRptTextData(AtomMng060.mng060DefaultTextData);

      // 選択しているメニューをクリア
      setSideMenuSelected(AtomSideMasterMenu.defaultInputSelectedMenuState);
    };
  }, [queryClient]);

  const configWidth = `${containerWidth}px`;
  const itemHeight =
    320 < rptItemData.rowData.length * 25 + 40
      ? 320
      : rptItemData.rowData.length * 25 + 40;

  // グリッドテーブルサイズを調整
  const handleResizeGridTable = () => {
    // サイドメニュー側のサイズ調整関数を実行
    queryClient.invalidateQueries({ queryKey: ["mog060ContainerWidth"] });
  }

  // 画面サイズを変更するごとに処理を呼び出す関数を設定
  React.useEffect(() => {
    window.addEventListener('resize', handleResizeGridTable);
  });

  const [activeIndex, setActiveIndex] = useState(0);

  useQuery({
    queryKey: ["setInitTabIndex", rptConfigData],
    queryFn: () => {
      setActiveIndex(0)
    }
  })

  const tabData = [
    { label: '報告書構成', content: '報告書構成', id: 'configTable' },
    { label: '検査項目', content: '検査項目', id: 'itemTable' },
    { label: '測定地点', content: '測定地点', id: 'pointTable' },
    { label: '固定文言', content: '固定文言', id: 'textTable' },
  ];

  return (
    <>
      <div className="container_row" style={{ justifyContent: "flex-end" }}>
        <SideMenuMaster />
        <div
          id="MNG060-main-container"
          className="container_grid_table"
          style={{
            height: "100%",
            width: `${containerWidth}px`,
          }}
        >
          <div
            className="container_range"
            style={{
              zIndex: "0",
              display: "flex",
              flexDirection: "column",
              width: `${containerWidth}px`,
            }}
          >
            <div
              id="main-content-table"
              className={`${cssMNG060.MNG060_input_container} ${(useMessageMutiLine.length > 0) ? ` MNG060_input_container_with_msg` : ` MNG060_input_container_without_msg`}`}
              style={{ width: `${containerWidth}px` }}
            >
              <TitleArea title="報告書設定" />
              <div
                style={{
                  width: "98%",
                  margin: "auto",
                  overflowY: "hidden",
                  overflowX: "hidden",
                }}
              >
                {/* <MessageArea /> */}
                <MessageMutiLineArea />

                {(isFetchingByConfigTable > 0 ||
                  isFetchingByItemTable > 0 ||
                  isFetchingByPointTable > 0 ||
                  isFetchingByTextTable > 0) && (
                    <>
                      <div
                        style={{
                          width: `${containerWidth}px`,
                          // height: "70vh",
                          height: "80%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "absolute",
                          backgroundColor: "#e4e4e4",
                          zIndex: "9999",
                        }}
                      >
                        <div style={{ width: "200px", height: "200px" }}>
                          <Loading />
                        </div>
                      </div>
                    </>
                  )}
                <>
                  {((rptConfigData.rowData.length !== 0 ||
                    (rptItemData && rptItemData.rowData.length !== 0) ||
                    (rptPointData && rptPointData.rowData.length !== 0) ||
                    (rptTextData && rptTextData.rowData.length !== 0))) && (
                      <>
                        {(rptConfigData.rowData.length !== 0 || rptMonthListData.rowData.length !== 0) && (
                          <div
                            className={(useMessageMutiLine.length > 0) ? `tabs-container mng060_grid_tabel_with_msg` : `tabs-container mng060_grid_tabel_without_msg`}
                          >
                            {/* タブヘッダ― */}
                            <Tabs defaultFocus={true}>
                              <TabList>
                                {rptConfigData.rowData.length !== 0 ? (
                                  <>
                                    {tabData.map((tab, index) => (
                                      <Tab>{tab.label}</Tab>
                                    ))}
                                  </>
                                ) : (
                                  <>
                                    {rptMonthListData &&
                                      rptMonthListData.rowData.length !== 0 && (
                                        <>
                                          <Tab>月報一覧</Tab>
                                        </>
                                      )}
                                  </>
                                )}
                              </TabList>

                              {/* 月報一覧設定 */}
                              {rptMonthListData &&
                                rptMonthListData.rowData.length !== 0 && (
                                  <>
                                    <TabPanel forceRender={true} >
                                      <RptConfigGridTable
                                        id="monthListTable"
                                        dataGrid={rptMonthListData}
                                        className={(useMessageMutiLine.length > 0) ? `gray_grid_table_header month_list_table_with_err` : `gray_grid_table_header month_list_table_without_err`}
                                      />
                                    </TabPanel>
                                  </>
                                )}

                              <TabPanel forceRender={true} >
                                {/* 報告書設定 */}
                                <>
                                  {rptConfigData.rowData.length !== 0 ? (
                                    <>
                                      <div id="MNG060-grid-table-container" className={`container_column ${(useMessageMutiLine.length > 0) ? "MNG060_grid_table_with_msg" : ""}`}>

                                        {rptConfigData &&
                                          rptConfigData.rowData.length !== 0 && (
                                            <>
                                              {/* <RptConfigGridTable
                                                id="configTable"
                                                height="70px"
                                                dataGrid={rptConfigData}
                                                className={`gray_grid_table_header`}
                                              /> */}

                                              <RptConfigGridForm
                                                id="configTable"
                                                dataGrid={rptConfigData}
                                              />
                                            </>
                                          )}
                                      </div>
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </>
                              </TabPanel>
                              <TabPanel forceRender={true} >
                                {/* 検査項目 */}
                                <>
                                  {rptConfigData.rowData.length !== 0 ? (
                                    <>
                                      <div id="MNG060-grid-table-container" className={`container_column ${(useMessageMutiLine.length > 0) ? "MNG060_grid_table_with_msg" : ""}`}>
                                        {rptItemData && rptItemData.rowData.length !== 0 && (
                                          <>
                                            <div className="container_column">
                                              <RptConfigGridTable
                                                id="itemTable"
                                                width="100%"
                                                height="100%"
                                                // height={`${itemHeight}px`}
                                                dataGrid={rptItemData}
                                                className={`orange_grid_table_header`}
                                                leftColumn={1}
                                              />
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </>
                              </TabPanel>
                              <TabPanel forceRender={true} >
                                {/* 測定地点 */}
                                <>
                                  {rptConfigData.rowData.length !== 0 ? (
                                    <>
                                      <div id="MNG060-grid-table-container" className={`container_column ${(useMessageMutiLine.length > 0) ? "MNG060_grid_table_with_msg" : ""}`}>
                                        {rptPointData &&
                                          rptPointData.rowData.length !== 0 && (
                                            <>
                                              <div className="container_column">
                                                <RptConfigGridTable
                                                  id="pointTable"
                                                  width="100%"
                                                  height="100%"
                                                  dataGrid={rptPointData}
                                                />
                                              </div>
                                            </>
                                          )}
                                      </div>
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </>
                              </TabPanel>
                              <TabPanel forceRender={true} >
                                {/* 測定地点 */}
                                <>
                                  {rptConfigData.rowData.length !== 0 ? (
                                    <>
                                      <div id="MNG060-grid-table-container" className={`container_column ${(useMessageMutiLine.length > 0) ? "MNG060_grid_table_with_msg" : ""}`}>
                                        {rptTextData &&
                                          rptTextData.rowData.length !== 0 && (
                                            <>
                                              <div className="container_column">
                                                <RptConfigGridTable
                                                  id="textTable"
                                                  width="100%"
                                                  height="100%"
                                                  dataGrid={rptTextData}
                                                />
                                              </div>
                                            </>
                                          )}
                                      </div>
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </>
                              </TabPanel>
                            </Tabs>
                          </div>
                        )}
                      </>
                    )}
                </>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
      {inspectionItemModalFlgState && <InspectionItemSettingModal />}
      <ExcelFileUploadModal />
    </>
  );
};

export default MNG060;
