import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Api, getMessage } from "../../common/api";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  MessageArea,
  Button,
  GridSimpleTable,
  ConfirmDialog,
} from "../../components/common";
import * as Const from "../../common/const";
import * as AtomCommon from "../../stores/atom";
import * as AtomSideMenu from "../../stores/atomSideMenu";
import { useQuery, useIsFetching, useQueryClient } from "@tanstack/react-query";
import Loading from "../../components/layouts/loading";
import { CommonStateContainer } from "../../components/containers/commonStateContainer";
import { SideMenuStateContainer } from "../../components/containers/sideMenuStateContainer";
import { MenuCalendarStateContainer } from "../../components/containers/menuCalendarContainer";
import { ConfirmDialogStateContainer } from "../../components/containers/confirmDialogStateContainer";

// サイドメニュー
import SideMenu from "../../components/layouts/sidemenu";

// CSS
import cssWQM030 from "../../scss/pages/WQM030.module.scss";
import * as atomWqm030 from "../../stores/atomWQM030";
import moment from "moment";

// サイドメニュー_カレンダー
import "@silevis/reactgrid/styles.css";

const WQM030Footer = ({
  commonState,
  confirmDialog,
  sideMenuState,
  menuCalendarState,
}): JSX.Element => {
  // 一覧Atom
  const wqm030GridTable = useAtomValue(atomWqm030.wqm030GridTableAtom);

  // 確認ダイアログの回答
  const [useConfirmMessageResult, setConfirmMessageResult] = useState(null);

  const [exportFlg, setExportFlg] = useState<boolean>(true);

  // 報告書ダウンロード
  const downloadReport = async () => {
    // メッセージクリア
    commonState.setResultMessage([]);

    // 選択データを格納
    let selectData: any = [];
    let checkCheckd: number = 0;
    wqm030GridTable.rowData.forEach((data) => {
      if (data.check_box == true) {
        selectData.push({
          report_no: Number(data.report_no),
          saisui_date: data.saisui_date,
          saisui_time: data.saisui_time,
          point_no: Number(data.point_no),
          kensa_kbn_code: Number(data.kensa_kbn_code),
          dsp_space: data.dsp_space,
          report_name: data.report_name,
          point_name: data.point_report_name,
        });

        checkCheckd += 1;
      }
    });

    // チェックを付けた件数を確認
    if (checkCheckd <= 0) {
      const errorInfo: AtomCommon.message[] = [];
      errorInfo.push(getMessage(["WQ-0010E", "出力ファイル"]));
      commonState.setResultMessage(errorInfo);

      return false;
    }

    const request = {
      output_data: selectData,
      menu_report_no: sideMenuState.useSideMenuSelected.report_no,
      affiliation_no: sideMenuState.useSideMenuSelected.affiliation_section_no,
      selected_menu_name: sideMenuState.useSideMenuSelected.selectedMenuName,
      selected_menu_no: sideMenuState.useSideMenuSelected.selected_menu_no,
      selected_date: menuCalendarState.useSidemenuSelectedDate,
    };

    // 報告書ダウンロード
    await Api.fileDownload(
      "/report/export",
      commonState.setResultMessage,
      request
    )
      .then((response) => {
        // 日本語ファイル名取得
        const disposition = response.headers.get("Content-Disposition") || "";
        let filename = "download.xlsx";

        // 日本語を含むファイル名に対応した抽出処理
        const utf8Match = disposition.match(
          /filename\*=UTF-8|utf-8''([^;\n]+)/
        );
        const normalMatch = disposition.match(/filename="?([^"]+)"?/);

        if (utf8Match) {
          filename = decodeURIComponent(utf8Match[1]);
        } else if (normalMatch) {
          filename = normalMatch[1];
        }
        const blob = new Blob([response.data], {
          type: "application/octet-binary",
        });

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        // Api.postBuffer("/report/export", setResultMessage, request)
        //   .then((result: ArrayBuffer) => {
        // const blob = new Blob([result], {
        //   type: "application/octet-binary",
        // });
        // const link = document.createElement("a");
        // const fileName = "健診機関テンプレート.xlsx";
        // link.href = window.URL.createObjectURL(blob);
        // link.download = fileName;
        // link.click();

        const message: AtomCommon.message[] = [];
        message.push(getMessage(["WQ-0007I", "報告書出力"]));
        commonState.setResultMessage(message);
      })
      .catch((error: Error) => {
        // 想定外のエラーの場合メッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          commonState.setResultMessage(errorInfo);

          return true;
        }
      });
  };

  // 報告書ダウンロード
  useQuery({
    queryKey: ["confirmMessageDialog", useConfirmMessageResult],
    queryFn: async () => {
      if (useConfirmMessageResult === true) {
        await downloadReport();
      }
      setConfirmMessageResult(null);
      return true;
    },
  });

  // チェックされてるかチェック
  useQuery({
    queryKey: ["wqm030CheckedCheck", wqm030GridTable],
    queryFn: () => {
      if (
        wqm030GridTable.rowData !== null &&
        wqm030GridTable.rowData.length !== 0
      ) {
        // 一つでもチェックがついていれば、出力ボタンを活性化
        setExportFlg(
          !wqm030GridTable.rowData.some((data) => data.check_box == true)
        );
      }

      return true;
    },
  });

  const queryClient = useQueryClient();
  const { isFetching } = useQuery({
    queryKey: ["footerDownload"],
    queryFn: async () => {
      await downloadReport();
    },
    enabled: false,
  });

  return (
    <>
      <footer>
        <div className="foot_nav">
          <Button
            title="出力"
            width="100px"
            color="#4CAF50"
            margin="0px 15px 0px 0px"
            className="footer_btn_right"
            onClick={async () => {
              await queryClient.prefetchQuery({
                queryKey: ["footerDownload"],
              });
            }}
            disabled={exportFlg}
          />
        </div>
      </footer>
    </>
  );
};

const WQM030 = (): JSX.Element => {
  /**
   * ローカルステート
   *
   */
  const [initFlg, setInitFlg] = useState(false); // 初期化完了フラグ
  const [isAllSelected, setIsAllSelected] = useState(false); // チェックボックスフラグ

  // 一覧Atom
  const [wqm030GridTable, setWqm030GridTable] = useAtom(
    atomWqm030.wqm030GridTableAtom
  );

  // WQM030_報告書出力
  const [useWqm030SearchAndSortState, setWqm030SearchAndSortState] = useAtom(
    atomWqm030.searchAndSortState
  ); // 検索条件の管理データ

  /**
   * ステートコンテナーからステートを呼び出す
   *
   */
  const commonState = CommonStateContainer(); // 汎用
  const sideMenuState = SideMenuStateContainer(); // サイドメニュー
  const menuCalendarState = MenuCalendarStateContainer(); // サイドメニューのカレンダー
  const confirmDialog = ConfirmDialogStateContainer(); // 確認ダイアログ

  // 引数に各ステート管理を組み合わせる
  const combilneProps = {
    // 汎用
    commonState: commonState,
    // サイドメニュー
    sideMenuState: sideMenuState,
    // サイドメニューのカレンダー
    menuCalendarState: menuCalendarState,
    // 確認ダイアログ
    confirmDialog: confirmDialog,
  };

  /**
   * 報告書出力画面 表示
   *
   */
  const getDspReport = async (): Promise<any> => {
    if (
      sideMenuState.useSideMenuSelected.selectedMenuNo &&
      sideMenuState.useSideMenuSelected.selectedMenuNo !== ""
    ) {
      // メッセージクリア
      commonState.setResultMessage([]);

      const request = {
        menu_no: sideMenuState.useSideMenuSelected.selectedMenuNo,
        report_no: sideMenuState.useSideMenuSelected.report_no,
        selected_date:
          menuCalendarState.useSidemenuSelectedDate ??
          moment().format("YYYY-MM-DD"),
        report_category: sideMenuState.useSideMenuSelected.report_category,
        affiliation_section_no:
          sideMenuState.useSideMenuSelected.affiliation_section_no,
        report_type: sideMenuState.useSideMenuSelected.report_type,
        sort_column: useWqm030SearchAndSortState.sortColumn,
        sort_order: useWqm030SearchAndSortState.sortOrder,
      };

      try {
        // 出力一覧を取得
        const data = await Api.post(
          "/WQM030/getDspOutputList",
          commonState.setResultMessage,
          request
        );

        let newGridData: any = [];
        let newColumnData: any = [];
        let newRowDataInterface: any = [];

        // 月報報告書以外
        if (
          sideMenuState.useSideMenuSelected.report_no ||
          (sideMenuState.useSideMenuSelected.report_no == null &&
            sideMenuState.useSideMenuSelected.affiliation_section_no == null)
        ) {
          // 出力一覧 設定
          data.gridTableData.forEach((item) => {
            newGridData.push({
              check_box: false,
              saisui_date: item.saisui_date,
              saisui_time: item.saisui_time,
              report_name: item.report_name,
              point_report_name: item.point_report_name,
              item_report_name: item.item_report_name,
              inspection_kbn_name: item.inspection_kbn_name,
              kensa_kbn_code: String(item.kensa_kbn_code),
              report_no: String(item.report_no),
              report_type_name: item.report_type_name,
              dsp_space: item.dsp_space,
              dsp_low_limit: item.dsp_low_limit,
              dsp_up_limit: item.dsp_up_limit,
              point_no: item.point_no,
            });
          });

          // ヘッダデータ
          newColumnData = [
            { id: 1, columnName: "check_box", columnTitle: "", width: 50 },
            {
              id: 2,
              columnName: "saisui_date",
              columnTitle: "採水年月日",
              width: 120,
              resizeAble: true,
            },
            {
              id: 3,
              columnName: "saisui_time",
              columnTitle: "採水時刻",
              width: 70,
            },
            {
              id: 4,
              columnName: "report_name",
              columnTitle: "報告書名称",
              width: 380,
            },
            {
              id: 5,
              columnName: "point_report_name",
              columnTitle: "地点名称",
              width: 200,
            },
            {
              id: 6,
              columnName: "item_report_name",
              columnTitle: "項目名称",
              width: 200,
            },
            {
              id: 7,
              columnName: "inspection_kbn_name",
              columnTitle: "検査区分名称",
              width: 200,
            },
            {
              id: 8,
              columnName: "kensa_kbn_code",
              columnTitle: "検査区分CD",
              width: 100,
            },
            {
              id: 9,
              columnName: "report_no",
              columnTitle: "報告書番号",
              width: 100,
            },
            {
              id: 10,
              columnName: "report_type_name",
              columnTitle: "報告書タイプ",
              width: 360,
            },
            {
              id: 11,
              columnName: "dsp_space",
              columnTitle: "空白表示",
              width: 75,
            },
            {
              id: 12,
              columnName: "dsp_low_limit",
              columnTitle: "下限表示",
              width: 75,
            },
            {
              id: 13,
              columnName: "dsp_up_limit",
              columnTitle: "上限表示",
              width: 75,
            },
          ];

          // 各データのインタフェース 設定
          newRowDataInterface = [
            { interfaceName: "check_box", interfaceType: "checkbox" },
            { interfaceName: "saisui_date", interfaceType: "string" },
            { interfaceName: "saisui_time", interfaceType: "string" },
            { interfaceName: "report_name", interfaceType: "string" },
            { interfaceName: "point_report_name", interfaceType: "string" },
            { interfaceName: "item_report_name", interfaceType: "string" },
            { interfaceName: "inspection_kbn_name", interfaceType: "string" },
            { interfaceName: "kensa_kbn_code", interfaceType: "string" },
            { interfaceName: "report_no", interfaceType: "string" },
            { interfaceName: "report_type_name", interfaceType: "string" },
            { interfaceName: "dsp_space", interfaceType: "string" },
            { interfaceName: "dsp_low_limit", interfaceType: "string" },
            { interfaceName: "dsp_up_limit", interfaceType: "string" },
          ];
        } else {
          // 出力一覧 設定
          data.gridTableData.forEach((item) => {
            newGridData.push({
              check_box: item.report_status !== "未登録" ? true : false,
              report_status: item.report_status,
              saisui_date: item.saisui_date,
              saisui_time: item.saisui_time,
              report_name: item.report_name,
              point_report_name: item.point_report_name,
              item_report_name: item.item_report_name,
              inspection_kbn_name: item.inspection_kbn_name,
              kensa_kbn_code: String(item.kensa_kbn_code),
              report_no: String(item.report_no),
              report_type_name: item.report_type_name,
              dsp_space: item.dsp_space,
              dsp_low_limit: item.dsp_low_limit,
              dsp_up_limit: item.dsp_up_limit,
              point_no: item.point_no,
            });
          });

          // ヘッダデータ
          newColumnData = [
            {
              id: 1,
              columnName: "check_box",
              columnTitle: "",
              width: 50,
            },
            {
              id: 2,
              columnName: "report_status",
              columnTitle: "状態",
              width: 85,
            },
            {
              id: 3,
              columnName: "saisui_date",
              columnTitle: "採水年月日",
              width: 120,
              resizeAble: true,
            },
            {
              id: 4,
              columnName: "saisui_time",
              columnTitle: "採水時刻",
              width: 70,
            },
            {
              id: 5,
              columnName: "report_name",
              columnTitle: "報告書名称",
              width: 380,
            },
            {
              id: 6,
              columnName: "point_report_name",
              columnTitle: "地点名称",
              width: 200,
            },
            {
              id: 7,
              columnName: "item_report_name",
              columnTitle: "項目名称",
              width: 200,
            },
            {
              id: 8,
              columnName: "inspection_kbn_name",
              columnTitle: "検査区分名称",
              width: 200,
            },
            {
              id: 9,
              columnName: "kensa_kbn_code",
              columnTitle: "検査区分CD",
              width: 100,
            },
            {
              id: 10,
              columnName: "report_no",
              columnTitle: "報告書番号",
              width: 100,
            },
            {
              id: 11,
              columnName: "report_type_name",
              columnTitle: "報告書タイプ",
              width: 360,
            },
            {
              id: 12,
              columnName: "dsp_space",
              columnTitle: "空白表示",
              width: 75,
            },
            {
              id: 13,
              columnName: "dsp_low_limit",
              columnTitle: "下限表示",
              width: 75,
            },
            {
              id: 14,
              columnName: "dsp_up_limit",
              columnTitle: "上限表示",
              width: 75,
            },
          ];

          // 各データのインタフェース 設定
          newRowDataInterface = [
            { interfaceName: "check_box", interfaceType: "checkbox" },
            { interfaceName: "report_status", interfaceType: "string" },
            { interfaceName: "saisui_date", interfaceType: "string" },
            { interfaceName: "saisui_time", interfaceType: "string" },
            { interfaceName: "report_name", interfaceType: "string" },
            { interfaceName: "point_report_name", interfaceType: "string" },
            { interfaceName: "item_report_name", interfaceType: "string" },
            { interfaceName: "inspection_kbn_name", interfaceType: "string" },
            { interfaceName: "kensa_kbn_code", interfaceType: "string" },
            { interfaceName: "report_no", interfaceType: "string" },
            { interfaceName: "report_type_name", interfaceType: "string" },
            { interfaceName: "dsp_space", interfaceType: "string" },
            { interfaceName: "dsp_low_limit", interfaceType: "string" },
            { interfaceName: "dsp_up_limit", interfaceType: "string" },
          ];
        }

        // gridTableコンポの引数を指定
        setWqm030GridTable({
          columnData: newColumnData,
          rowData: newGridData,
          rowInterface: newRowDataInterface,
        });

        return;
      } catch (error: any) {
        // データクリア
        setWqm030GridTable({
          columnData: [],
          rowData: [],
          rowInterface: [],
        });

        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          commonState.setResultMessage(errorInfo);
        }
        return;
      }
    }

    return true;
  };

  // 初期処理
  React.useEffect(() => {
    // データクリア
    setWqm030GridTable({
      columnData: [],
      rowData: [],
      rowInterface: [],
    });

    // メッセージクリア
    commonState.setResultMessage([]);

    // 選択しているメニューをクリア
    sideMenuState.setSideMenuSelected(
      AtomSideMenu.defaultInputSelectedMenuState
    );

    // 選択している日付をクリア
    const today = moment().format("YYYY-MM-DD");
    menuCalendarState.setSidemenuSelectedDate(today);

    // 初期化完了フラグを更新
    setInitFlg(true);
  }, []);

  // メニューを選択した後、報告書情報を取得
  const { isFetching } = useQuery({
    queryKey: [
      "getDspReport",
      sideMenuState.useSideMenuSelected.selectedMenuNo,
      menuCalendarState.useSidemenuSelectedDate,
    ],
    initialData: async () => {
      // 検索条件を初期化
      await setWqm030SearchAndSortState(atomWqm030.defaultSearchAndSortState);

      return true;
    },
    queryFn: getDspReport,
    enabled: initFlg,
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

  // UI管理 isFetching
  const isFetchingFooter = useIsFetching({ queryKey: ["footerDownload"] });
  const isShowLoading = isFetching || isFetchingFooter > 0;

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
      queryClient.removeQueries({ queryKey: ["getDspReport"] });
      queryClient.removeQueries({ queryKey: ["fetchInputItems"] });

      // 選択しているメニューをクリア
      sideMenuState.setDataSideMenuLink([]);
      sideMenuState.setDataSideMenu([]);
      menuCalendarState.setDataExistDateLists([]);
      menuCalendarState.setStoreEditedData([]);
      sideMenuState.setSideMenuSearchListState([]);
      sideMenuState.setDataSideSearchMenu(null);

      // メッセージリセット
      commonState.setResultMessage([]);
    };
  }, [queryClient]);

  const location = useLocation();

  return (
    <>
      {isShowLoading && (
        <div
          style={{
            backgroundColor: "transparent",
            zIndex: 99,
            position: "fixed",
            height: "100vh",
            width: "100vw",
            top: 0,
            left: 0,
          }}
        />
      )}
      <SideMenu key={location.pathname} page={"WQM030"} />
      <div
        id="WQM030-main-container"
        data-testid="wmq030-1"
        className="container_grid_table"
        style={{
          width: `${containerWidth}px`,
        }}
      >
        <div
          className="container_range"
          style={{ zIndex: "0", width: `${containerWidth}px` }}
        >
          <div
            id="main-content-table"
            style={{
              width: `${containerWidth}px`,
              right: 0,
              paddingRight: "10px",
            }}
            className={`${cssWQM030.wqm030_input_container}`}
          >
            <>
              {isShowLoading ? (
                <>
                  <div
                    data-testid="wqm030-loading-gif"
                    style={{
                      width: 150,
                      justifySelf: "center",
                      marginTop: "35dvh",
                    }}
                  >
                    <Loading />
                  </div>
                </>
              ) : (
                <>
                  <MessageArea />
                  {sideMenuState.useSideMenuSelected.selectedMenuNo &&
                    wqm030GridTable.rowData.length > 0 && (
                      <>
                        <div
                          id="export-report-grid"
                          className={cssWQM030.wqm030_grid_table_panel}
                        >
                          <span className={`${cssWQM030.wqm030_header_title}`}>
                            報告書出力
                          </span>
                          <GridSimpleTable
                            dataGrid={wqm030GridTable}
                            setterName={setWqm030GridTable}
                          />
                        </div>
                      </>
                    )}
                </>
              )}
            </>
          </div>
        </div>
      </div>
      <WQM030Footer {...combilneProps} />
    </>
  );
};

export default WQM030;
