/**
 * 【レイアウトコンポネント】サイドメニュー
 * ※ メニュー構成修正_不可
 *
 */
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Api, getMessage } from "../../common/api";
import { useAtom, useSetAtom } from "jotai";
import { InputText, ListCollapse, SideList, ConfirmDialog } from "../common/";
import { useQuery, useQueryClient, useIsFetching } from "@tanstack/react-query";
import { CommonStateContainer } from '../containers/commonStateContainer';
import { SideMenuStateContainer } from '../containers/sideMenuStateContainer';
import { MenuCalendarStateContainer } from '../containers/menuCalendarContainer';
import { ConfirmDialogStateContainer } from '../containers/confirmDialogStateContainer';

import * as Const from "../../common/const";
import * as AtomCommon from "../../stores/atom";

// 日付管理
import moment from "moment";

// サイドメニュスタイル
import cssSideMenu from "../../scss/layouts/sidemenu.module.scss";

// カレンダー
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// 1_サイドメニュ_開閉部分_[子コンポネント]
const SideMenuToggleArea = ({ sideMenuState, commonState, paramPage }): JSX.Element => {
  // 開閉フラグ
  const [openMenuFlg, setOpenMenuFlg] = React.useState<boolean>(true);

  // WQM010用のサイドメニューを取得する関数
  const fetchWqm010Sidemenu = (menuData) => {
    // 検査情報登録画面のメニュー一覧を設定
    const securityLevel: string = localStorage.getItem("securityLevel");
    const affiliationSectionNo: string = localStorage.getItem("affiliationSectionNo")

    let newMenuLists: any = [];
    menuData.forEach((menu, key) => {
      const adjMenuText: string = menu.input_title.replace(".txt", "");

      // ユーザ定義.権限が'1':管理用ID、水質管理センターの場合
      if (securityLevel == '1' || affiliationSectionNo == '01' || affiliationSectionNo == '13') {
        if (menu.input_hierarchy || (!menu.input_hierarchy && menu.input_order == 10)) {
          newMenuLists.push({
            rowId: menu.input_menu_no,
            parentId:
              menu.input_parent_menu_no !== menu.input_menu_no
                ? menu.input_parent_menu_no
                : null,
            isParent: menu.label_flg === 1 ? true : false,
            text: adjMenuText,
            type: "chevron",
            isExpanded: (!menu.input_hierarchy || menu.input_hierarchy == 2) ? true : false,
            showFlg: true,
            level: menu.input_hierarchy ? menu.input_hierarchy : 1,
            order: menu.input_order,
            dspNo: menu.input_dsp_no,
            inspectionKbnCode: menu.inspection_kbn_code,
          });
        }
      } else {
        // ユーザ定義.権限が'1':業務用IDの場合
        const checkHasParent = menuData.find((ckParent) => ckParent.input_menu_no == menu.input_parent_menu_no);

        if (checkHasParent || menu.label_flg === 1) {
          newMenuLists.push({
            rowId: menu.input_menu_no,
            parentId:
              menu.input_parent_menu_no !== menu.input_menu_no
                ? menu.input_parent_menu_no
                : null,
            isParent: menu.label_flg === 1 ? true : false,
            text: adjMenuText,
            type: "chevron",
            isExpanded: (!menu.input_hierarchy) ? true : false,
            showFlg: true,
            level: menu.input_hierarchy ? menu.input_hierarchy : 1,
            order: menu.input_order,
            dspNo: menu.input_dsp_no,
            inspectionKbnCode: menu.inspection_kbn_code,
          });
        }
      }
    });

    // 1階層目の表示フラグを設定
    newMenuLists[0].isExpanded = true;
    sideMenuState.setDataSideMenuLink(newMenuLists);
    sideMenuState.setDataSideMenuLinkWqm010(newMenuLists);
  };

  // WQM030用のサイドメニューを取得する関数
  const fetchWqm030Sidemenu = (menuData) => {
    // 報告書画面系のメニュー一覧を設定
    const securityLevel: string = localStorage.getItem("securityLevel");
    const affiliationSectionNo: string = localStorage.getItem("affiliationSectionNo");

    let newMenuLists: any = [];
    menuData.forEach((menu) => {
      const adjMenuText: string = menu.report_title.replace(
        ".xlsx",
        ""
      );

      // ユーザ定義.権限が'1':管理用ID、水質管理センターの場合
      if (securityLevel == '1' || affiliationSectionNo == '01' || affiliationSectionNo == '13') {
        newMenuLists.push({
          rowId: menu.report_menu_no,
          parentId:
            menu.report_parent_menu_no !== menu.report_menu_no
              ? menu.report_parent_menu_no
              : null,
          affiliation_section_no: menu.affiliation_section_no,
          isParent: menu.label_flg === 1 ? true : false,
          text: adjMenuText,
          type: "chevron",
          isExpanded: (!menu.report_hierarchy || menu.report_hierarchy == 2) ? true : false,
          showFlg: true,
          report_no: menu.report_no,
          level: menu.report_hierarchy ? menu.report_hierarchy : 1,
          order: menu.report_order,
          report_category: menu.report_category,
          report_type: menu.report_type,
        });
      } else {
        // ユーザ定義.権限が'1':業務用IDの場合
        const checkHasParent = menuData.find((ckParent) => ckParent.report_menu_no == menu.report_parent_menu_no);

        if (checkHasParent || (menu.label_flg === 1 && menu.affiliation_section_no == affiliationSectionNo)) {
          newMenuLists.push({
            rowId: menu.report_menu_no,
            parentId:
              menu.report_parent_menu_no !== menu.report_menu_no
                ? menu.report_parent_menu_no
                : null,
            affiliation_section_no: menu.affiliation_section_no,
            isParent: menu.label_flg === 1 ? true : false,
            text: adjMenuText,
            type: "chevron",
            isExpanded: (!menu.report_hierarchy) ? true : false,
            showFlg: true,
            report_no: menu.report_no,
            level: menu.report_hierarchy ? menu.report_hierarchy : 1,
            order: menu.report_order,
            report_category: menu.report_category,
            report_type: menu.report_type,
          });
        }
      }
    });

    newMenuLists[0].isExpanded = true;
    sideMenuState.setDataSideMenuLink(newMenuLists);
    sideMenuState.setDataSideMenuLinkWqm030(newMenuLists);
  };

  const fetchSideMenu = () => {
    // 一覧リセット
    sideMenuState.setDataSideMenuLink([]);

    // 報告書画面系のメニュー一覧を取得
    const params = {
      affiliation_section_no: localStorage.getItem("affiliationSectionNo"),
      security_level: localStorage.getItem("securityLevel"),
      page: paramPage
    };

    Api.post("/checkSideMenuInputOrReport", commonState.setResultMessage, params)
      .then((data: any) => {
        if (data.menuData.length <= 0) {
          const errorInfo: AtomCommon.message[] = [];
          const pageMsg: string = (paramPage == "WQM010") ? "入力メニュー" : "報告書メニュー";
          errorInfo.push(getMessage(["WQ-0006E", pageMsg]));
          commonState.setResultMessage(errorInfo);
        } else {
          if (paramPage == "WQM010") {
            fetchWqm010Sidemenu(data.menuData);
          } else if (paramPage == "WQM030") {
            fetchWqm030Sidemenu(data.menuData);
          }
        }
      })
      .catch((error: Error) => {
        // 内部エラーメッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          commonState.setResultMessage(errorInfo);
        }
      });
  };

  // useQuery({
  //   queryKey: ["initSideMenuFetching"],
  //   queryFn: async () => {
  //     // ステートクリア 保持中の時間
  //     sideMenuState.setDataSideMenuLink([]);
  //     sideMenuState.setDataSideMenuLinkWqm010([]);
  //     sideMenuState.setDataSideMenuLinkWqm030([]);
  //     const result = await fetchSideMenu();

  //     return result || true;
  //   }
  // });

  React.useEffect(() => {
    // ステートクリア 保持中の時間
    sideMenuState.setDataSideMenuLink([]);
    sideMenuState.setDataSideMenuLinkWqm010([]);
    sideMenuState.setDataSideMenuLinkWqm030([]);
    fetchSideMenu();
  }, []);

  /**
   * 開閉ボタンの処理
   *
   */
  // React.useEffect(() => {
  //   if (openMenuFlg) {
  //     // サイドバーのサイズが伸びる
  //     setBarWidth(400);
  //     // document.getElementById("top-sidebar")!.style.marginRight = "400px";
  //     // document.getElementById("main-sidebar")!.style.width = "400px";
  //     if (document.getElementById("main-content-table")) {
  //       document.getElementById("main-content-table")!.style.width =
  //         "calc(100% - 415px)";
  //     }

  //     // 絞り込み検索・リストメニュー・カレンダー_表示
  //     if (document.getElementById("main-sidebar-top")) {
  //       document.getElementById("side-search-menu")!.style.visibility =
  //         "visible";
  //       document.getElementById("main-sidebar-top")!.style.visibility =
  //         "visible";
  //     }
  //     document.getElementById("main-sidebar-middle")!.style.visibility =
  //       "visible";
  //     if (document.getElementById("main-sidebar-bottom")) {
  //       document.getElementById("main-sidebar-bottom")!.style.visibility =
  //         "visible";
  //     }
  //   } else {
  //     // サイドバーのサイズが縮む
  //     setBarWidth(50);
  //     // document.getElementById("top-sidebar")!.style.marginRight = "50px";
  //     // document.getElementById("main-sidebar")!.style.width = "50px";
  //     if (document.getElementById("main-content-table")) {
  //       document.getElementById("main-content-table")!.style.width =
  //         "calc(100% - 65px)";
  //     }

  //     // 絞り込み検索・リストメニュー・カレンダー_非表示
  //     if (document.getElementById("main-sidebar-top")) {
  //       document.getElementById("side-search-menu")!.style.visibility =
  //         "hidden";
  //       document.getElementById("main-sidebar-top")!.style.visibility =
  //         "hidden";
  //     }
  //     document.getElementById("main-sidebar-middle")!.style.visibility =
  //       "hidden";
  //     if (document.getElementById("main-sidebar-bottom")) {
  //       document.getElementById("main-sidebar-bottom")!.style.visibility =
  //         "hidden";
  //     }
  //   }
  //   setBarWidth(openMenuFlg ? 400 : 50);
  // }, [openMenuFlg]);

  useQuery({
    queryKey: ["openMenuToggle", openMenuFlg],
    queryFn: () => {
      if (openMenuFlg) {
        // サイドバーのサイズが伸びる
        sideMenuState.setBarWidth(400);
        // document.getElementById("top-sidebar")!.style.marginRight = "400px";
        // document.getElementById("main-sidebar")!.style.width = "400px";
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
        sideMenuState.setBarWidth(50);
        // document.getElementById("top-sidebar")!.style.marginRight = "50px";
        // document.getElementById("main-sidebar")!.style.width = "50px";
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
      sideMenuState.setBarWidth(openMenuFlg ? 400 : 50);

      return true;
    }
  })

  /**
   * 下にスクロールすると、トップのスペースを削除
   *
   */
  React.useEffect(() => {
    window.onscroll = function () {
      if (window.pageYOffset === 0) {
        document
          .getElementById("main-sidebar")!
          .classList.remove("side_menu_remove_top");
        document.getElementById("sidemenu-toggle-icon")!.style.top = "66px";
      } else {
        document
          .getElementById("main-sidebar")!
          .classList.add("side_menu_remove_top");
        document.getElementById("sidemenu-toggle-icon")!.style.top = "12px";
      }
    };
  });

  return (
    // 開閉テキスト・ボタン
    <div
      data-testid="SMN-1-1"
      id="main-sidebar-toggle"
      className={`container_row ${cssSideMenu.sidemenu_top}`}
      onClick={() => {
        setOpenMenuFlg(!openMenuFlg);
      }}
    >
      <div
        data-testid="SMN-1-1-1"
        id="sidemenu-toggle-text"
        // className={`${cssSideMenu.sidemenu_top_text}`}
        className={
          openMenuFlg
            ? `${cssSideMenu.sidemenu_top_text_open}`
            : `${cssSideMenu.sidemenu_top_text_close}`
        }
      >
        サイドメニューを閉じる
      </div>
      <div
        data-testid="SMN-1-1-2"
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

// 2_サイドメニュ_絞り込み部分_[子コンポネント]
const SideFilterArea = ({ sideMenuState, commonState, paramPage }): JSX.Element => {
  // 外部関数を呼び出すクエリクライアント
  const queryClient = useQueryClient();

  return (
    <div
      id="main-sidebar-top"
      className={`container_row ${cssSideMenu.sidemenu_top_search}`}
    >
      <InputText
        id="side-search-menu"
        name="side-search-menu"
        className={`${cssSideMenu.side_search_menu}`}
        width="100%"
        margin="0 10px 0 10px"
        placeholder="絞り込み検索"
        contentsFlg={true}
        value={sideMenuState.useSideSearchMenu}
        onChange={({
          target: { value },
        }: React.ChangeEvent<HTMLInputElement>) => {
          sideMenuState.setDataSideSearchMenu(value);
          queryClient.invalidateQueries({ queryKey: ["dataSideSearchMenuChanged"] });
        }}
      />
    </div>
  );
};

// 3_サイドメニュ_リストメニュー部分_[子コンポネント]
const SideListMenuArea = ({ sideMenuState, commonState, paramPage }): JSX.Element => {
  const url = useLocation();
  const menuData = (paramPage == "WQM010") ? sideMenuState.useDataSideMenuLinkWqm010 : sideMenuState.useDataSideMenuLinkWqm030;

  return (
    // 折り畳みリストメニュー
    <div
      data-testid="SMN-1-3"
      id="main-sidebar-middle"
      className={`container_row ${cssSideMenu.sidemenu_middle}`}
    >
      <SideList key={url.pathname} menuData={menuData} page={paramPage} />
    </div>
  );
};

// 4_サイドメニュ_カレンダー部分_[子コンポネント]
const SideCalendarArea = ({ sideMenuState, menuCalendarState, confirmDialog, commonState }): JSX.Element => {
  const url = useLocation();

  // React カレンダー操作
  type ValuePiece = Date | null;
  type Value = ValuePiece | [ValuePiece, ValuePiece];
  const [dateSelector, onChangeDateSelector] = React.useState<Value>();

  // 編集状態フラグ
  const [useInputEditingFlg, setInputEditingFlg] = useAtom(
    AtomCommon.inputEditingFlg
  );

  // 変更した日付を保持
  const [useChangedSelectDate, setChangedSelectDate] = React.useState<any>();

  // 初期表示_カレンダー
  useQuery({
    queryKey: ["initCalendar"],
    queryFn: () => {
      // 検査情報登録画面
      if (url.pathname == "/WQM010") {
        // 当日を設定
        onChangeDateSelector(new Date());

        // 当月を設定
        const currentMonth: string = moment(new Date()).format("YYYY-MM");
        menuCalendarState.setCurrrentMonth(currentMonth);
      }

      return true;
    },
    refetchOnWindowFocus: false,
  });

  /**
   * 選択している日付を設定
   *
   */
  const setSelectedDate = async (): Promise<any> => {
    if (dateSelector) {
      const selecetedDate: any = new Date(dateSelector?.toString());
      const selectedDateFormat: string =
        moment(selecetedDate).format("YYYY-MM-DD");
      const currentDateFormatJp: string =
        moment(selecetedDate).format("YYYY年M月D日");

      // 変数_データの編集中の日付
      menuCalendarState.setSidemenuSelectedDate(selectedDateFormat);

      // 配列_カレンダーから選択した日付を格納
      let newObject: any = menuCalendarState.useStoreEditedData;
      const findDate = menuCalendarState.useStoreEditedData.find(
        (element) => element.date == selectedDateFormat
      );

      //
      if (!findDate) {
        newObject.push({
          date: selectedDateFormat,
          editedFlg: false,
        });
        menuCalendarState.setStoreEditedData(newObject);
      }

      adjustCalendarView();
    }

    return true;
  };
  // 日付選択
  useQuery({
    queryKey: ["selectedDate", dateSelector],
    queryFn: setSelectedDate,
  });

  /**
   * カレンダーにあるデータ登録済みの日は背景色を緑とする
   *
   * @returns
   */
  const adjustCalendarView = () => {
    // カレンダーの中に選択している日を調整
    menuCalendarState.useDataExistDateLists.forEach((element, key) => {
      // 当月だけスタイル調整
      if (moment(element.date).format("YYYY-MM") == menuCalendarState.useCurrrentMonth) {
        const selectedDateFormatJp: string = moment(element.date).format(
          "YYYY年M月D日"
        );
        const abbr: any = document.querySelector(
          'abbr[aria-label="' + selectedDateFormatJp + '"]'
        );
        if (abbr && abbr.parentElement.tagName === "BUTTON") {
          abbr.parentElement.classList.add("selected_date_bg");
        }
      }
    });

    return true;
  };

  // データリスト更新
  useQuery({
    queryKey: [
      "dataDateLists",
      menuCalendarState.useDataExistDateLists,
      sideMenuState.useSideMenuSelected,
      menuCalendarState.useCurrrentMonth,
    ],
    queryFn: adjustCalendarView,
  });

  return (
    <div
      id="main-sidebar-bottom"
      className={`container_row ${cssSideMenu.sidemenu_bottom}`}
    >
      {url.pathname != "/WQM030" ? (
        <Calendar
          value={dateSelector}
          onChange={(value, event) => {
            // 確認ダイアログ
            if (useInputEditingFlg) {
              confirmDialog.setDialog((prev) => ({
                ...prev,
                isOpen: true,
                message: getMessage(["WQ-0006Q"]).message,
                onConfirm: () => {
                  setInputEditingFlg(false);
                  onChangeDateSelector(value);
                },
                onCancel: () => {
                  // 処理なし
                },
              }));
            } else {
              onChangeDateSelector(value);
            }
          }}
          onActiveStartDateChange={({ activeStartDate, view }) => {
            // 月を変える時
            if (view == "month") {
              const currentMonth: string =
                moment(activeStartDate).format("YYYY-MM");
              menuCalendarState.setCurrrentMonth(currentMonth);
            }
          }}
          calendarType={"gregory"}
        />
      ) : (
        <Calendar
          maxDetail="year"
          value={dateSelector}
          onChange={onChangeDateSelector}
          onActiveStartDateChange={({ activeStartDate, view }) => {
            // 月を変える時
            if (view == "month") {
              const currentMonth: string =
                moment(activeStartDate).format("YYYY-MM");
              menuCalendarState.setCurrrentMonth(currentMonth);
            }
          }}
        />
      )}
    </div>
  );
};

// JSXリターン_[親コンポネント]
const SideMenu = (parentProps: { page: any }): JSX.Element => {
  const page = parentProps.page;
  /**
   * ステートコンテナーからステートを呼び出す
   * 
   */
  const commonState = CommonStateContainer();                 // 汎用
  const sideMenuState = SideMenuStateContainer();             // サイドメニュー
  const menuCalendarState = MenuCalendarStateContainer();     // サイドメニューのカレンダー
  const confirmDialog = ConfirmDialogStateContainer();        // 確認ダイアログ

  // 引数に各ステート管理を組み合わせる
  const comblineProps = {
    // サイドメニュー
    sideMenuState: sideMenuState,
    // メッセージ
    commonState: commonState,
    // 仕様ページ
    paramPage: page
  }

  // 引数に各ステート管理を組み合わせる_カレンダー
  const comblineCalendarProps = {
    // サイドメニュー
    sideMenuState: sideMenuState,
    // サイドメニューのカレンダー
    menuCalendarState: menuCalendarState,
    // 確認ダイアログ
    confirmDialog: confirmDialog,
    // メッセージ
    commonState: commonState,
  };

  // const [barWidth, setBarWidth] = useAtom(AtomSideMenu.sideMenuWidthState); // サイドメニュー 横幅
  const [mouseMove, setMouseMove] = React.useState<boolean>(false); // サイドメニュー サイズ変更フラグ

  // マウス押下時イベント
  const handleMouseDown = (e) => {
    if (!mouseMove) {
      setMouseMove(true); // チャタリング防止
      // ウィンドウにイベント追加
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
  };

  // マウス移動時イベント
  const handleMouseMove = (e) => {
    // window以上の幅にはならないように
    // カレンダーが潰れすぎないように
    // 左クリック中のみ発動するように
    if (
      window.outerWidth - 40 > e.clientX &&
      e.clientX > 240 &&
      (e.buttons & 1) !== 0
    ) {
      sideMenuState.setBarWidth(e.clientX);
    }
  };

  // マウス押下解除時イベント
  const handleMouseUp = (e) => {
    setMouseMove(false);
    // ウィンドウのイベント解除
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <>
      <div
        style={{
          width: sideMenuState.useBarWidth + 5,
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
      {/* 空エリア */}
      <div
        id="top-sidebar"
        className={`${cssSideMenu.top_sidebar}`}
        style={{ width: sideMenuState.useBarWidth }}
      ></div>

      <div
        data-testid="SMN-1"
        id="main-sidebar"
        className={`${cssSideMenu.sidemenu}`}
        style={{ width: sideMenuState.useBarWidth }}
      >
        {/* 1_開閉部分 */}
        <SideMenuToggleArea {...comblineProps} />

        {/* 2_絞り込み部分 */}
        <SideFilterArea {...comblineProps} />

        {/* 3_リストメニュー部分 */}
        <SideListMenuArea {...comblineProps} />

        {/* 4_カレンダー部分 */}
        <SideCalendarArea {...comblineCalendarProps} />
      </div>
    </>
  );
};

export default SideMenu;
